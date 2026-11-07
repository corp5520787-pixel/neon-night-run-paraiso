import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByFolioOrQr, getOrder, invalidateParticipantsCache, invalidateOrdersCache, invalidateConfigCache } from '@/lib/db';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendCancellationEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ folio: string }> }
) {
  try {
    const { folio } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Cancelación manual por falta de pago (más de 5 días)';
    const notifyUser = body.notifyUser !== false;

    const participant = await getParticipantByFolioOrQr(folio);
    if (!participant) {
      return NextResponse.json({ success: false, error: 'Participante no encontrado' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const participantRef = doc(db, 'participants', participant.id);
    const orderRef = doc(db, 'orders', participant.orderId);
    const capacityRef = doc(db, 'last_spots_capacity', '2026-11-07');
    const configRef = doc(db, 'config', 'nnr-paraiso-2026');
    await runTransaction(db, async tx => {
      const [pSnap, oSnap, capacitySnap, configSnap] = await Promise.all([
        tx.get(participantRef), tx.get(orderRef), tx.get(capacityRef), tx.get(configRef),
      ]);
      if (!pSnap.exists()) throw new Error('Participante no encontrado');
      const active = pSnap.data().status !== 'cancelled';
      tx.update(participantRef, { status: 'cancelled', cancelledAt: now, cancellationReason: reason });
      if (oSnap.exists()) tx.update(orderRef, { paymentStatus: 'rejected', updatedAt: now });
      if (active) {
        if (configSnap.exists()) tx.set(configRef, { currentTotalRegistered: Math.max(0, (Number(configSnap.data()?.currentTotalRegistered) || 0) - 1) }, { merge: true });
        if (participant.lastSpotsRequestKey && capacitySnap.exists()) tx.set(capacityRef, { occupied: Math.max(0, (Number(capacitySnap.data()?.occupied) || 0) - 1) }, { merge: true });
      }
      return active;
    });
    participant.status = 'cancelled';
    participant.cancelledAt = now;
    participant.cancellationReason = reason;
    invalidateParticipantsCache();
    invalidateOrdersCache();
    invalidateConfigCache();
    let order = await getOrder(participant.orderId);
    if (notifyUser && order) {
      await sendCancellationEmail({
        order,
        participant,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Participante ${participant.fullName} (${participant.folio}) archivado como Cancelado/No Pagado y su lugar ha sido liberado.`,
      participant,
    });
  } catch (error: any) {
    console.error('Error cancelling participant:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al cancelar participante' },
      { status: 500 }
    );
  }
}
