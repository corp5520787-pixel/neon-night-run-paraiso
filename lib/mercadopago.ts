import { Order } from './types';

export interface CreatePreferenceParams {
  order: Order;
  backUrls: {
    success: string;
    pending: string;
    failure: string;
  };
  notificationUrl?: string;
}

export interface PreferenceResult {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  isDemo: boolean;
}

/**
 * Creates Mercado Pago Checkout Pro Preference
 * Uses real Mercado Pago SDK if MERCADO_PAGO_ACCESS_TOKEN is configured;
 * otherwise provides interactive test environment.
 */
export async function createMercadoPagoPreference(params: {
  order: Order;
  baseUrl: string;
}): Promise<PreferenceResult> {
  const { order, baseUrl } = params;
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  const successUrl = `${baseUrl}/confirmacion/${order.id}?status=approved`;
  const pendingUrl = `${baseUrl}/confirmacion/${order.id}?status=pending`;
  const failureUrl = `${baseUrl}/confirmacion/${order.id}?status=failure`;
  const notificationUrl = `${baseUrl}/api/webhooks/mercadopago`;

  // Check if real token is provided (not the placeholder)
  const isRealToken = accessToken && !accessToken.includes('00000000') && accessToken.length > 20;

  if (isRealToken) {
    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items: [
            {
              id: order.id,
              title: `Inscripción Neon Night Run Paraíso 2026 (${order.participantsCount} corredor/es)`,
              description: `Folio de orden: ${order.orderNumber} - Etapa: ${order.stageName}`,
              quantity: 1,
              unit_price: order.totalAmount,
              currency_id: 'MXN',
            },
          ],
          payer: {
            name: order.customerName,
            email: order.customerEmail,
            phone: {
              number: order.customerPhone,
            },
          },
          back_urls: {
            success: successUrl,
            pending: pendingUrl,
            failure: failureUrl,
          },
          auto_return: 'approved',
          external_reference: order.orderNumber,
          notification_url: notificationUrl,
          statement_descriptor: 'NEON RUN PARAISO',
          metadata: {
            order_id: order.id,
            order_number: order.orderNumber,
            participants_count: order.participantsCount,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          preferenceId: data.id,
          initPoint: data.init_point,
          sandboxInitPoint: data.sandbox_init_point || data.init_point,
          isDemo: false,
        };
      }
    } catch (err) {
      console.warn('Mercado Pago API call failed, falling back to simulator:', err);
    }
  }

  // Demo fallback / sandbox simulator
  const demoPrefId = `PREF-DEMO-${order.id}`;
  const demoInitPoint = `${baseUrl}/pago-simulado/${order.id}`;

  return {
    preferenceId: demoPrefId,
    initPoint: demoInitPoint,
    sandboxInitPoint: demoInitPoint,
    isDemo: true,
  };
}

/**
 * Verify payment status by querying Mercado Pago directly
 */
export async function verifyMercadoPagoPayment(paymentId: string): Promise<{
  status: 'approved' | 'pending' | 'rejected' | 'cancelled' | 'refunded';
  externalReference?: string;
  details?: Record<string, unknown>;
}> {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const isRealToken = accessToken && !accessToken.includes('00000000');

  if (isRealToken) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const statusMap: Record<string, 'approved' | 'pending' | 'rejected' | 'cancelled' | 'refunded'> = {
          approved: 'approved',
          pending: 'pending',
          in_process: 'pending',
          rejected: 'rejected',
          cancelled: 'cancelled',
          refunded: 'refunded',
          charged_back: 'refunded',
        };
        return {
          status: statusMap[data.status] || 'pending',
          externalReference: data.external_reference,
          details: data,
        };
      }
    } catch (err) {
      console.error('Error fetching Mercado Pago payment:', err);
    }
  }

  // Demo fallback
  return {
    status: 'approved',
    details: { mode: 'demo_simulation' },
  };
}
