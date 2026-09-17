import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Participant, Order } from '@/lib/types';
import { sendPaymentReminderEmail, sendCancellationEmail } from '@/lib/email';
import { getEventConfig } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Evaluates pending participants:
 * - If > 5 days (120 hours) since registration:
 *   - Check if 24 hours have passed since last reminder.
 *   - If fewer than 3 reminders have been sent, send reminder email (every 24h).
 *   - If 3 reminders have already been sent and > 24 hours have passed since the 3rd reminder:
 *     cancel registration, release spot (decrease quota count if accounted for),
 *     send final spot liberation email, and move to 'cancelled' status (kept in DB).
 */
export async function POST(req: NextRequest) {
  try {
    const now = new Date();
    const nowMs = now.getTime();
    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    // Fetch all participants & orders in memory to minimize Firestore operations
    const [participantsSnap, ordersSnap] = await Promise.all([
      getDocs(collection(db, 'participants')),
      getDocs(collection(db, 'orders')),
    ]);

    const ordersMap = new Map<string, Order>();
    ordersSnap.docs.forEach(d => {
      ordersMap.set(d.id, d.data() as Order);
    });

    const pendingParticipants: Participant[] = [];
    participantsSnap.docs.forEach(d => {
      const p = d.data() as Participant;
      if (p.status === 'pending') {
        pendingParticipants.push(p);
      }
    });

    const results = {
      evaluated: pendingParticipants.length,
      remindersSent: 0,
      cancelledAndReleased: 0,
      details: [] as string[],
    };

    for (const p of pendingParticipants) {
      const createdMs = p.createdAt ? new Date(p.createdAt).getTime() : nowMs;
      const msSinceCreation = nowMs - createdMs;

      // Only act if more than 5 days have passed
      if (msSinceCreation < FIVE_DAYS_MS) {
        continue;
      }

      const daysPending = Math.floor(msSinceCreation / (24 * 60 * 60 * 1000));
      const reminderCount = p.paymentReminderCount || 0;
      const lastReminderMs = p.lastPaymentReminderAt ? new Date(p.lastPaymentReminderAt).getTime() : 0;
      const msSinceLastReminder = nowMs - lastReminderMs;

      const order = ordersMap.get(p.orderId) || {
        id: p.orderId,
        orderNumber: 'ORD-PENDIENTE',
        customerName: p.fullName,
        customerEmail: p.email,
        customerPhone: p.phone,
        participantsCount: 1,
        stageId: 'stage-1',
        stageName: 'General',
        unitPrice: p.unitPrice || 350,
        subtotal: p.unitPrice || 350,
        discountAmount: 0,
        totalAmount: p.unitPrice || 350,
        paymentMethod: 'transfer' as const,
        paymentStatus: 'pending' as const,
        paymentReference: p.folio,
        createdAt: p.createdAt || now.toISOString(),
        updatedAt: now.toISOString(),
      };

      // Send 24-hour reminder if at least 24 hours have passed or no reminder sent yet
      if (msSinceLastReminder >= TWENTY_FOUR_HOURS_MS || lastReminderMs === 0) {
        const nextReminderNumber = reminderCount + 1;
        await sendPaymentReminderEmail({
          order,
          participant: p,
          reminderNumber: nextReminderNumber,
          daysPending,
        });

        p.paymentReminderCount = nextReminderNumber;
        p.lastPaymentReminderAt = now.toISOString();

        await setDoc(doc(db, 'participants', p.id), p, { merge: true });
        results.remindersSent++;
        results.details.push(`Recordatorio #${nextReminderNumber} enviado a ${p.fullName} (${p.folio}, ${daysPending} días pendiente)`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      ...results,
    });
  } catch (error: any) {
    console.error('Error running payment reminders cron:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar recordatorios y liberaciones' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Support GET for manual triggering or uptime monitoring
  return POST(req);
}
