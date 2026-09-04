import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByFolioOrQr, getOrder, updateParticipant, recordAuditLog } from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';
import { resolvePublicAppUrl } from '@/lib/app-url';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ folio: string }> }
) {
  try {
    const { folio } = await params;
    if (!folio) {
      return NextResponse.json({ success: false, error: 'Folio requerido' }, { status: 400 });
    }

    const participant = await getParticipantByFolioOrQr(folio);
    if (!participant) {
      return NextResponse.json({ success: false, error: 'Participante no encontrado' }, { status: 404 });
    }

    let order = await getOrder(participant.orderId);
    if (!order) {
      // Fallback minimal order object if not found
      order = {
        id: participant.orderId || 'order-fallback',
        orderNumber: 'NNR-ORD-CONFIRMADO',
        customerName: participant.fullName,
        customerEmail: participant.email,
        customerPhone: participant.phone,
        participantsCount: 1,
        stageId: 'stage-1',
        stageName: 'General',
        unitPrice: 0,
        subtotal: 0,
        discountAmount: 0,
        totalAmount: 0,
        paymentMethod: 'transfer',
        paymentStatus: 'approved',
        paymentReference: `REF-${participant.folio}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const appUrl = resolvePublicAppUrl(req);
    const result = await sendConfirmationEmail({ order, participant, appUrl });

    const nowIso = new Date().toISOString();
    // Update participant's email timestamp in DB
    await updateParticipant(participant.id, {
      lastEmailSentAt: nowIso,
      emailSentCount: (participant.emailSentCount || 1) + 1,
    });

    // Record audit log entry
    await recordAuditLog(
      'EMAIL_RESENT',
      'participant',
      participant.folio,
      'admin@neonnightrun.com',
      'admin',
      `Correo de confirmación con código QR reenviado a ${participant.email} (Folio: ${participant.folio})`
    );

    return NextResponse.json({
      success: true,
      message: '¡El correo se envió con éxito!',
      recipient: participant.email,
      folio: participant.folio,
      fullName: participant.fullName,
      sentAt: nowIso,
      simulated: result.simulated,
    });
  } catch (error) {
    console.error('Error resending confirmation email:', error);
    return NextResponse.json(
      { success: false, error: 'Error al reenviar correo de confirmación' },
      { status: 500 }
    );
  }
}
