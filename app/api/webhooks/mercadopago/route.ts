import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrders, recordWebhookLog } from '@/lib/db';
import { verifyMercadoPagoPayment } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic') || searchParams.get('type');
    const id = searchParams.get('id') || searchParams.get('data.id');

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty in some IPN formats
    }

    const paymentId = id || body?.data?.id || body?.id;
    const eventType = topic || body?.type || body?.action || 'payment';

    // Log the webhook reception
    await recordWebhookLog({
      provider: 'mercadopago',
      eventType,
      externalId: String(paymentId || 'unknown'),
      payload: { queryParams: Object.fromEntries(searchParams.entries()), body },
      processed: false,
      statusMessage: 'Recibido',
    });

    if (!paymentId) {
      return NextResponse.json({ received: true, message: 'No payment ID found' }, { status: 200 });
    }

    // Verify payment from Mercado Pago server
    const verification = await verifyMercadoPagoPayment(String(paymentId));
    
    // Find matching order by external reference or paymentId
    if (verification.externalReference) {
      const orders = await getOrders();
      const matchedOrder = orders.find(
        o => o.orderNumber === verification.externalReference || o.paymentReference.includes(verification.externalReference!)
      );

      if (matchedOrder) {
        matchedOrder.mercadopagoPaymentId = String(paymentId);
        await updateOrderStatus(
          matchedOrder.id,
          verification.status,
          'Mercado Pago Webhook',
          `Pago ID ${paymentId} procesado con estado ${verification.status}`
        );
      }
    }

    return NextResponse.json({ received: true, status: 'processed' }, { status: 200 });
  } catch (error) {
    console.error('Error processing Mercado Pago webhook:', error);
    return NextResponse.json({ received: true, error: 'Error procesando webhook' }, { status: 200 });
  }
}
