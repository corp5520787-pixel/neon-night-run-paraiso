import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByFolioOrQr, getOrder } from '@/lib/db';
import { doc, setDoc } from 'firebase/firestore';
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
    participant.status = 'cancelled';
    participant.cancelledAt = now;
    participant.cancellationReason = reason;

    await setDoc(doc(db, 'participants', participant.id), participant, { merge: true });

    let order = await getOrder(participant.orderId);
    if (order) {
      await setDoc(doc(db, 'orders', order.id), { paymentStatus: 'rejected', updatedAt: now }, { merge: true });
    }

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
