import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByFolioOrQr, getOrder } from '@/lib/db';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendPaymentReminderEmail } from '@/lib/email';
import { Participant, Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ folio: string }> }
) {
  try {
    const { folio } = await params;
    const body = await req.json().catch(() => ({}));
    const force = body.force === true;

    const participant = await getParticipantByFolioOrQr(folio);
    if (!participant) {
      return NextResponse.json({ success: false, error: 'Participante no encontrado' }, { status: 404 });
    }

    const now = new Date();
    const nowMs = now.getTime();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    const lastReminderMs = participant.lastPaymentReminderAt
      ? new Date(participant.lastPaymentReminderAt).getTime()
      : 0;
    const msSinceLastReminder = nowMs - lastReminderMs;

    if (!force && lastReminderMs > 0 && msSinceLastReminder < TWENTY_FOUR_HOURS_MS) {
      const hoursRemaining = Math.ceil((TWENTY_FOUR_HOURS_MS - msSinceLastReminder) / (60 * 60 * 1000));
      return NextResponse.json({
        success: false,
        cooldown: true,
        hoursRemaining,
        message: `Ya se envió un recordatorio hace menos de 24 horas. Próximo recordatorio disponible en ${hoursRemaining} hora(s).`,
      });
    }

    const createdMs = participant.createdAt ? new Date(participant.createdAt).getTime() : nowMs;
    const daysPending = Math.max(1, Math.floor((nowMs - createdMs) / (24 * 60 * 60 * 1000)));

    let order = await getOrder(participant.orderId);
    if (!order) {
      order = {
        id: participant.orderId,
        orderNumber: 'ORD-' + participant.folio,
        customerName: participant.fullName,
        customerEmail: participant.email,
        customerPhone: participant.phone,
        participantsCount: 1,
        stageId: 'stage-1',
        stageName: 'General',
        unitPrice: participant.unitPrice || 350,
        subtotal: participant.unitPrice || 350,
        discountAmount: 0,
        totalAmount: participant.unitPrice || 350,
        paymentMethod: 'transfer',
        paymentStatus: 'pending',
        paymentReference: participant.folio,
        createdAt: participant.createdAt || now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }

    const nextCount = (participant.paymentReminderCount || 0) + 1;

    // Send the reminder email
    const emailResult = await sendPaymentReminderEmail({
      order,
      participant,
      reminderNumber: nextCount,
      daysPending,
    });

    // Update in database
    participant.paymentReminderCount = nextCount;
    participant.lastPaymentReminderAt = now.toISOString();

    await setDoc(doc(db, 'participants', participant.id), participant, { merge: true });

    return NextResponse.json({
      success: true,
      message: `Recordatorio #${nextCount} enviado exitosamente a ${participant.email}`,
      reminderCount: nextCount,
      lastPaymentReminderAt: participant.lastPaymentReminderAt,
      emailResult,
    });
  } catch (error: any) {
    console.error('Error sending single reminder email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al enviar recordatorio' },
      { status: 500 }
    );
  }
}
