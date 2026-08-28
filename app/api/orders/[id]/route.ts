import { NextRequest, NextResponse } from 'next/server';
import { getOrder, deleteOrder, updateOrderStatus } from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ success: false, error: 'Error al consultar la orden' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { paymentStatus } = body;

    if (!paymentStatus) {
      return NextResponse.json({ success: false, error: 'Estatus de pago requerido (paymentStatus)' }, { status: 400 });
    }

    const updatedOrder = await updateOrderStatus(id, paymentStatus, 'admin');
    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
    }

    // If approved, send confirmation emails with QR to each participant
    if (paymentStatus === 'approved' && updatedOrder.participants) {
      for (const p of updatedOrder.participants) {
        await sendConfirmationEmail({ order: updatedOrder, participant: p });
      }
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order status via PATCH:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar estado de la orden' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteOrder(id, 'admin');
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar la orden' }, { status: 500 });
  }
}

