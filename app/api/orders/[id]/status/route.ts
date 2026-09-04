import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrder } from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';
import { resolvePublicAppUrl } from '@/lib/app-url';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, confirmedBy, notes } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Estado requerido' }, { status: 400 });
    }

    const updatedOrder = await updateOrderStatus(id, status, confirmedBy || 'admin', notes);
    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
    }

    // If approved, send confirmation emails with QR to each participant
    if (status === 'approved' && updatedOrder.participants) {
      const appUrl = resolvePublicAppUrl(req);
      for (const p of updatedOrder.participants) {
        await sendConfirmationEmail({ order: updatedOrder, participant: p, appUrl });
      }
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar estado de la orden' }, { status: 500 });
  }
}
