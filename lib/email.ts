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
      <title>¡Pago Confirmado - Neon Night Run Paraíso 2026!</title>
    </head>
    <body style="background-color: #060913; color: #ffffff; font-family: sans-serif; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0b1120; border: 2px solid #00f3ff; border-radius: 16px; padding: 30px; box-shadow: 0 0 20px rgba(0, 243, 255, 0.2);">
        <h1 style="color: #00f3ff; margin-bottom: 5px; font-weight: 900; letter-spacing: 1px;">¡PAGO CONFIRMADO Y REGISTRO COMPLETO!</h1>
        <h2 style="color: #ff007f; margin-top: 0; font-weight: 800;">NEON NIGHT RUN PARAÍSO 2026</h2>
        <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">Hola <strong>${participant.fullName}</strong>, hemos validado tu pago con éxito. Tu lugar en la carrera nocturna más espectacular está <strong>100% confirmado</strong>. 🎉</p>
        
        <div style="background-color: #060913; padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px dashed #00f3ff;">
          <p style="margin: 5px 0; color: #94a3b8; font-size: 12px; font-weight: bold; tracking-wider: 1px; text-transform: uppercase;">FOLIO OFICIAL DE CORREDOR</p>
          <h3 style="font-size: 36px; color: #facc15; letter-spacing: 3px; margin: 5px 0; font-weight: 900;">${participant.folio}</h3>
          <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px;">Talla de Playera: <strong style="color: #00f3ff;">${participant.shirtSize}</strong> | Categoría: <strong style="color: #ff007f;">${participant.category}</strong></p>
        </div>

        ${participant.qrCodeDataUrl ? `
          <div style="background-color: #ffffff; padding: 15px; display: inline-block; border-radius: 12px; margin-bottom: 20px;">
            <img src="${participant.qrCodeDataUrl}" alt="QR Folio ${participant.folio}" style="width: 180px; height: 180px; display: block;" />
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 0; margin-bottom: 20px;">Presenta este código QR en tu celular para recoger tu kit.</p>
        ` : ''}

        <div style="text-align: left; margin-top: 25px; background-color: #1e293b; padding: 20px; border-radius: 12px; font-size: 14px; line-height: 1.6; border-left: 4px solid #ff007f;">
          <h4 style="margin: 0 0 10px 0; color: #ffffff; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">📅 Datos del Evento</h4>
          <p style="margin: 4px 0;"><strong>Fecha:</strong> Sábado 7 de Noviembre de 2026</p>
          <p style="margin: 4px 0;"><strong>Horario de Salida:</strong> 19:30 hrs</p>
          <p style="margin: 4px 0;"><strong>Ubicación:</strong> Malecón Turístico de Paraíso, Tabasco</p>
          <p style="margin: 4px 0;"><strong>Entrega de Kits:</strong> Viernes 6 y Sábado 7 de Noviembre (Presentar este correo/QR + ID oficial)</p>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 30px;">¡Gracias por ser parte de esta gran experiencia luminosa! Prepárate para brillar.</p>
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
          subject: `¡Pago Confirmado: Folio ${participant.folio}! - Neon Night Run Paraíso 2026`,
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

/**
 * Sends an email to the runner immediately after completing their registration,
 * instructing them to pay and send their receipt via WhatsApp.
 */
export async function sendPendingRegistrationEmail(params: SendConfirmationEmailParams): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
  const { order, participant } = params;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Neon Night Run Paraíso <contacto@neonnightrunparaiso.mx>';

  const isRealKey = resendApiKey && !resendApiKey.includes('00000000') && resendApiKey.startsWith('re_');

  const waLink = `https://wa.me/529331134406?text=${encodeURIComponent(
    `Hola, adjunto mi comprobante de transferencia bancaria SPEI para la orden ${order.orderNumber} a nombre de ${order.customerName} por el total de $${order.totalAmount} MXN (Neon Night Run Paraíso 2026).`
  )}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>¡Inscripción Pendiente - Neon Night Run Paraíso 2026!</title>
    </head>
    <body style="background-color: #060913; color: #ffffff; font-family: sans-serif; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0b1120; border: 2px solid #facc15; border-radius: 16px; padding: 30px; box-shadow: 0 0 20px rgba(250, 204, 21, 0.15);">
        <h1 style="color: #facc15; margin-bottom: 5px; font-weight: 900; letter-spacing: 1px;">¡REGISTRO RECIBIDO CON ÉXITO! 🎉</h1>
        <h2 style="color: #ff007f; margin-top: 0; font-weight: 800;">NEON NIGHT RUN PARAÍSO 2026</h2>
        <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">Hola <strong>${participant.fullName}</strong>, ¡muchas felicidades por dar el primer paso para iluminar las calles de Paraíso! Tu registro ha sido procesado de forma correcta.</p>
        
        <div style="background-color: #1e1b4b; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #ff007f; text-align: left; line-height: 1.6;">
          <h3 style="color: #ff007f; margin: 0 0 12px 0; font-size: 16px; text-transform: uppercase; font-weight: 900;">⚠️ Pasos para confirmar tu lugar:</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>1. Realiza tu transferencia bancaria SPEI</strong> por el total exacto.</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>2. Envía tu captura o comprobante de pago por WhatsApp</strong> al número <strong style="color: #10b981; font-size: 16px;">9331134406</strong>.</p>
        </div>

        <div style="background-color: #060913; padding: 20px; border-radius: 12px; border: 1px solid #facc15; text-align: left; margin-bottom: 25px; font-size: 14px; line-height: 1.6;">
          <h4 style="margin: 0 0 10px 0; color: #facc15; text-transform: uppercase;">💳 Datos de Transferencia:</h4>
          <p style="margin: 4px 0;"><strong>Monto Total:</strong> <span style="font-size: 18px; color: #ffffff; font-weight: bold;">$${order.totalAmount} MXN</span></p>
          <p style="margin: 4px 0;"><strong>Folio de Orden:</strong> <strong style="color: #00f3ff; font-family: monospace;">${order.orderNumber}</strong></p>
          <p style="margin: 4px 0;"><strong>CLABE Interbancaria:</strong> <strong style="color: #00f3ff; font-family: monospace; font-size: 15px;">646180402345488997</strong></p>
          <p style="margin: 4px 0;"><strong>Concepto de Pago:</strong> <strong style="color: #facc15;">${order.customerName}</strong></p>
          <p style="margin: 4px 0;"><strong>Beneficiario:</strong> Night Run Paraíso</p>
        </div>

        <div style="margin: 30px 0;">
          <a href="${waLink}" target="_blank" style="background-color: #10b981; color: #ffffff; font-weight: 900; font-size: 14px; padding: 15px 25px; border-radius: 12px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
            💬 ENVIAR COMPROBANTE AL WHATSAPP
          </a>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 30px;">Una vez enviado tu comprobante, un administrador lo validará y recibirás otro correo de confirmación con tu código QR oficial para la entrega de kits.</p>
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
          subject: `¡Inscripción Registrada! Folio ${participant.folio} - Neon Night Run Paraíso 2026`,
          html: emailHtml,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, messageId: data.id, simulated: false };
      }
    } catch (err) {
      console.error('Error sending pending registration email via Resend:', err);
    }
  }

  // Development logger
  console.log(`[PENDING EMAIL SIMULATOR] Correo enviado a ${participant.email} | Folio: ${participant.folio} | Orden: ${order.orderNumber}`);
  return { success: true, simulated: true };
}
