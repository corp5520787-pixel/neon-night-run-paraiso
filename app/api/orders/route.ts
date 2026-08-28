import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders, findDuplicateParticipant } from '@/lib/db';
import { createMercadoPagoPreference } from '@/lib/mercadopago';
import { sendConfirmationEmail, sendPendingRegistrationEmail } from '@/lib/email';
import { ParticipantInput } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const method = searchParams.get('method') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = await getOrders({ status, method, search });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener órdenes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      participants,
      ambassadorCode,
      paymentMethod,
      transferReceiptUrl,
    } = body;

    // Server-side validation
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos obligatorios de contacto del comprador.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes registrar al menos 1 participante.' },
        { status: 400 }
      );
    }

    // Validate each runner individually
    const seenEmails = new Set<string>();
    const seenNames = new Set<string>();

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i] as ParticipantInput;
      if (!p.fullName || !p.birthDate || !p.email || !p.phone || !p.shirtSize || !p.emergencyContact || !p.emergencyPhone) {
        return NextResponse.json(
          {
            success: false,
            error: `El corredor #${i + 1} (${p.fullName || 'Sin nombre'}) tiene campos obligatorios incompletos (Nombre, Fecha Nacimiento, Talla, Contacto de Emergencia).`,
          },
          { status: 400 }
        );
      }

      const cleanEmail = p.email.trim().toLowerCase();
      const cleanName = p.fullName.trim().toLowerCase().replace(/\s+/g, ' ');

      // Check for repeated items in the same registration form
      if (seenEmails.has(cleanEmail)) {
        return NextResponse.json(
          { success: false, error: `El correo electrónico "${p.email}" está repetido en este registro.` },
          { status: 400 }
        );
      }
      if (seenNames.has(cleanName)) {
        return NextResponse.json(
          { success: false, error: `El corredor "${p.fullName}" está repetido en este registro.` },
          { status: 400 }
        );
      }
      seenEmails.add(cleanEmail);
      seenNames.add(cleanName);

      // Check against Firestore database for existing registered runners (status !== 'cancelled')
      const duplicate = await findDuplicateParticipant(p.email, p.fullName);
      if (duplicate) {
        if (duplicate.type === 'email') {
          return NextResponse.json(
            { success: false, error: `El correo electrónico "${p.email}" ya está registrado para otro corredor de la carrera.` },
            { status: 400 }
          );
        } else {
          return NextResponse.json(
            { success: false, error: `El corredor "${p.fullName}" ya se encuentra registrado e inscrito en la carrera.` },
            { status: 400 }
          );
        }
      }
    }

    // Create the order & participants in the DB
    const { order, participants: createdParticipants } = await createOrder({
      customerName,
      customerEmail,
      customerPhone,
      participants,
      ambassadorCode,
      paymentMethod: paymentMethod || 'mercadopago',
      transferReceiptUrl,
    });

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    let preferenceResult = null;

    if (paymentMethod === 'mercadopago') {
      preferenceResult = await createMercadoPagoPreference({
        order,
        baseUrl,
      });

      order.mercadopagoPreferenceId = preferenceResult.preferenceId;
      order.mercadopagoInitPoint = preferenceResult.initPoint;
    } else if (paymentMethod === 'demo' || order.paymentStatus === 'approved') {
      // In demo mode or approved orders, trigger confirmation emails for all participants
      for (const p of createdParticipants) {
        await sendConfirmationEmail({ order, participant: p });
      }
    } else if (paymentMethod === 'transfer') {
      // Send pending registration email instructing them to pay and send receipt via WhatsApp
      for (const p of createdParticipants) {
        await sendPendingRegistrationEmail({ order, participant: p });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          order,
          participants: createdParticipants,
          preference: preferenceResult,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno al procesar la inscripción.',
      },
      { status: 500 }
    );
  }
}
