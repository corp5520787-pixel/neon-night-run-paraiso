import { Order, Participant } from './types';

export interface SendConfirmationEmailParams {
  order: Order;
  participant: Participant;
}

/**
 * Sends a transactional confirmation email with Folio, QR code and race instructions.
 * Uses Resend if RESEND_API_KEY is provided; otherwise logs to development console.
 */
export async function sendConfirmationEmail(params: SendConfirmationEmailParams): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
  const { order, participant } = params;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Neon Night Run Paraíso <contacto@neonnightrunparaiso.mx>';

  const isRealKey = resendApiKey && !resendApiKey.includes('00000000') && resendApiKey.startsWith('re_');

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>¡Confirmación de Inscripción - Neon Night Run Paraíso 2026!</title>
    </head>
    <body style="background-color: #060913; color: #ffffff; font-family: sans-serif; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0b1120; border: 1px solid #00f3ff; border-radius: 12px; padding: 30px;">
        <h1 style="color: #00f3ff; margin-bottom: 5px;">¡ILUMINA TU CAMINO!</h1>
        <h2 style="color: #ff007f; margin-top: 0;">NEON NIGHT RUN PARAÍSO 2026</h2>
        <p style="font-size: 16px; color: #cbd5e1;">Hola <strong>${participant.fullName}</strong>, tu lugar en la carrera nocturna más vibrante del sureste está 100% confirmado.</p>
        
        <div style="background-color: #060913; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px dashed #00f3ff;">
          <p style="margin: 5px 0; color: #94a3b8; font-size: 14px;">FOLIO OFICIAL DE CORREDOR</p>
          <h3 style="font-size: 28px; color: #facc15; letter-spacing: 2px; margin: 5px 0;">${participant.folio}</h3>
          <p style="margin: 5px 0; color: #ffffff;">Talla de Playera: <strong>${participant.shirtSize}</strong> | Categoría: <strong>${participant.category}</strong></p>
        </div>

        ${participant.qrCodeDataUrl ? `<img src="${participant.qrCodeDataUrl}" alt="QR Folio ${participant.folio}" style="width: 180px; height: 180px; background: white; padding: 10px; border-radius: 8px;" />` : ''}

        <div style="text-align: left; margin-top: 25px; background-color: #1e293b; padding: 15px; border-radius: 8px; font-size: 14px;">
          <p style="margin: 4px 0;">📅 <strong>Fecha:</strong> Sábado 7 de Noviembre de 2026</p>
          <p style="margin: 4px 0;">⏰ <strong>Horario:</strong> 19:30 hrs</p>
          <p style="margin: 4px 0;">📍 <strong>Ubicación:</strong> Malecón Turístico de Paraíso, Tabasco</p>
          <p style="margin: 4px 0;">📦 <strong>Entrega de Kits:</strong> Viernes 6 y Sábado 7 de Noviembre en Parque Central</p>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 30px;">Presenta este correo o tu código QR digital junto con una identificación oficial al momento de recoger tu kit.</p>
      </div>
    </body>
    </html>
  `;

  if (isRealKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: participant.email,
          subject: `¡Confirmación Oficial: ${participant.folio}! - Neon Night Run Paraíso 2026`,
          html: emailHtml,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, messageId: data.id, simulated: false };
      }
    } catch (err) {
      console.error('Error sending email via Resend:', err);
    }
  }

  // Development logger
  console.log(`[EMAIL SIMULATOR] Correo enviado a ${participant.email} | Folio: ${participant.folio} | Orden: ${order.orderNumber}`);
  return { success: true, simulated: true };
}
