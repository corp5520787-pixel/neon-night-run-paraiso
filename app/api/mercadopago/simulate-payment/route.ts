import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrder } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action } = body; // action: 'approve' | 'reject' | 'pending'

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId es requerido' }, { status: 400 });
    }

    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
    }

    let newStatus: 'approved' | 'rejected' | 'pending' = 'approved';
    let message = 'Pago simulado aprobado exitosamente';

    if (action === 'reject') {
      newStatus = 'rejected';
      message = 'Pago simulado rechazado (fondos insuficientes/tarjeta inválida)';
    } else if (action === 'pending') {
      newStatus = 'pending';
      message = 'Pago simulado en revisión (en proceso de acreditación)';
    }

    const updated = await updateOrderStatus(
      order.id,
      newStatus,
      'Simulador de Pagos en Desarrollo',
      `Acción simulada: ${action || 'approve'} - Modo Sandbox Local`
    );

    return NextResponse.json({
      success: true,
      message,
      data: updated,
    });
  } catch (error) {
    console.error('Error simulating payment:', error);
    return NextResponse.json({ success: false, error: 'Error en el simulador de pagos' }, { status: 500 });
  }
}
