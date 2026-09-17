import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Participant, Order } from '@/lib/types';
import { sendCancellationEmail } from '@/lib/email';
import { ensureSeeded } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const now = new Date();
    const nowMs = now.getTime();
    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

    const [participantsSnap, ordersSnap] = await Promise.all([
      getDocs(collection(db, 'participants')),
      getDocs(collection(db, 'orders')),
    ]);

    const ordersMap = new Map<string, Order>();
    ordersSnap.docs.forEach(d => {
      ordersMap.set(d.id, d.data() as Order);
    });

    const overduePending: Array<{
      participant: Participant;
      daysPending: number;
      order?: Order;
    }> = [];

    const alreadyCancelled: Participant[] = [];
    const confirmed: Participant[] = [];
    const pendingWithinFiveDays: Participant[] = [];

    participantsSnap.docs.forEach(d => {
      const p = d.data() as Participant;
      if (p.status === 'cancelled') {
        alreadyCancelled.push(p);
      } else if (p.status === 'confirmed') {
        confirmed.push(p);
      } else if (p.status === 'pending') {
        const createdMs = p.createdAt ? new Date(p.createdAt).getTime() : nowMs;
        const diffMs = nowMs - createdMs;
        const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        const order = ordersMap.get(p.orderId);

        if (diffMs >= FIVE_DAYS_MS) {
          overduePending.push({
            participant: p,
            daysPending: days,
            order,
          });
        } else {
          pendingWithinFiveDays.push(p);
        }
      }
    });

    return NextResponse.json({
      success: true,
      currentServerTime: now.toISOString(),
      summary: {
        totalInDb: participantsSnap.size,
        confirmed: confirmed.length,
        alreadyCancelledNoPagados: alreadyCancelled.length,
        overduePendingCount: overduePending.length,
        pendingWithinFiveDaysCount: pendingWithinFiveDays.length,
      },
      overduePending: overduePending.map(item => ({
        id: item.participant.id,
        folio: item.participant.folio,
        fullName: item.participant.fullName,
        email: item.participant.email,
        phone: item.participant.phone,
        createdAt: item.participant.createdAt,
        daysPending: item.daysPending,
        modality: item.participant.modality || item.participant.category,
        category: item.participant.category,
        shirtSize: item.participant.shirtSize,
        age: item.participant.age,
        gender: item.participant.gender,
        status: item.participant.status,
        paymentReminderCount: item.participant.paymentReminderCount || 0,
        lastPaymentReminderAt: item.participant.lastPaymentReminderAt || null,
        orderNumber: item.order?.orderNumber,
        unitPrice: item.participant.unitPrice || item.order?.totalAmount || 350,
      })),
      alreadyCancelled: alreadyCancelled.map(p => ({
        id: p.id,
        folio: p.folio,
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        createdAt: p.createdAt,
        cancelledAt: p.cancelledAt,
        cancellationReason: p.cancellationReason,
        modality: p.modality || p.category,
        category: p.category,
        shirtSize: p.shirtSize,
        age: p.age,
        gender: p.gender,
        status: p.status,
        paymentReminderCount: p.paymentReminderCount || 0,
        lastPaymentReminderAt: p.lastPaymentReminderAt || null,
      })),
    });
  } catch (error: any) {
    console.error('Error auditing overdue participants:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Moves all participants who have been pending for > 5 days to 'cancelled' status (No Pagados).
 * Liberates their spots for the 350 quota, preserves all user data for future races, and marks the reason.
 */
export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const now = new Date();
    const nowMs = now.getTime();
    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

    const [participantsSnap, ordersSnap] = await Promise.all([
      getDocs(collection(db, 'participants')),
      getDocs(collection(db, 'orders')),
    ]);

    const ordersMap = new Map<string, Order>();
    ordersSnap.docs.forEach(d => {
      ordersMap.set(d.id, d.data() as Order);
    });

    const movedParticipants: Array<{
      folio: string;
      fullName: string;
      daysPending: number;
      email: string;
    }> = [];

    for (const d of participantsSnap.docs) {
      const p = d.data() as Participant;
      if (p.status === 'pending') {
        const createdMs = p.createdAt ? new Date(p.createdAt).getTime() : nowMs;
        const diffMs = nowMs - createdMs;
        const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));

        if (diffMs >= FIVE_DAYS_MS) {
          const order = ordersMap.get(p.orderId);

          // Update participant
          p.status = 'cancelled';
          p.cancelledAt = now.toISOString();
          p.cancellationReason = `Lugar liberado por falta de pago (más de ${days} días transcurridos sin comprobante). Registrado en No Pagados para futuras carreras.`;

          await setDoc(doc(db, 'participants', p.id), p, { merge: true });

          // Update order if exists
          if (order) {
            await setDoc(
              doc(db, 'orders', order.id),
              { paymentStatus: 'rejected', updatedAt: now.toISOString() },
              { merge: true }
            );

            // Attempt email notification
            try {
              await sendCancellationEmail({ order, participant: p });
            } catch (mailErr) {
              console.warn('Could not send cancellation email:', mailErr);
            }
          }

          movedParticipants.push({
            folio: p.folio,
            fullName: p.fullName,
            daysPending: days,
            email: p.email,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      message: `Se revisaron las inscripciones y se trasladaron ${movedParticipants.length} participante(s) con más de 5 días sin pagar al apartado de No Pagados.`,
      movedCount: movedParticipants.length,
      movedParticipants,
    });
  } catch (error: any) {
    console.error('Error executing overdue migration to No Pagados:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
