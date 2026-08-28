import { NextRequest, NextResponse } from 'next/server';
import { getParticipants, getOrder } from '@/lib/db';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * API Route to trigger automatic pre-race reminders.
 * Can be called manually with query parameters: /api/admin/cron-reminders?type=3days&token=XYZ
 * Or automatically scheduled via Cron (e.g. Vercel Cron, GitHub Actions, cron-job.org).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as '3days' | '1day' | '1hour' | null;
    const token = searchParams.get('token');

    // Security check: Match token against CRON_SECRET or default to protect endpoint
    const cronSecret = process.env.CRON_SECRET || 'neon-nightrun-secret-2026';
    if (token !== cronSecret) {
      return NextResponse.json({ success: false, error: 'No autorizado. Token inválido.' }, { status: 401 });
    }

    if (!type || !['3days', '1day', '1hour'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Especifica un tipo de recordatorio válido ("3days", "1day", "1hour") en la URL.'
      }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'Neon Night Run Paraíso <contacto@neonnightrunparaiso.mx>';
    const isRealKey = resendApiKey && !resendApiKey.includes('00000000') && resendApiKey.startsWith('re_');

    // Fetch all confirmed participants
    const participants = await getParticipants({ status: 'confirmed' });
    let sentCount = 0;
    const errors: string[] = [];

    for (const participant of participants) {
      // 1. Double-send protection using dynamic Firestore attributes
      const pData = participant as any;
      if (type === '3days' && pData.reminder3DaysSent) continue;
      if (type === '1day' && pData.reminder1DaySent) continue;
      if (type === '1hour' && pData.reminder1HourSent) continue;

      // 2. Generate custom HTML content based on reminder type
      let subject = '';
      let emailHtml = '';

      if (type === '3days') {
        subject = `⚡ ¡Faltan 3 días! Prepárate para brillar - Neon Night Run Paraíso 2026`;
        emailHtml = get3DaysReminderHtml(participant);
      } else if (type === '1day') {
        subject = `🔥 ¡Mañana es el gran día! Todo listo para la carrera nocturna`;
        emailHtml = get1DayReminderHtml(participant);
      } else if (type === '1hour') {
        subject = `🌟 ¡Último llamado! Te vemos en 1 hora en la línea de salida`;
        emailHtml = get1HourReminderHtml(participant);
      }

      // 3. Send email via Resend
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
              subject,
              html: emailHtml,
            }),
          });

          if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Resend API error: ${errBody}`);
          }
        } catch (err: any) {
          console.error(`Error enviando correo a ${participant.email}:`, err);
          errors.push(`${participant.email}: ${err.message}`);
          continue; // Skip updating sent status if it failed
        }
      } else {
        console.log(`[SIMULATOR CRON] Correo "${subject}" simulado para ${participant.fullName} (${participant.email})`);
      }

      // 4. Update participant record to avoid duplicate sending
      try {
        const updateFields: any = {};
        if (type === '3days') updateFields.reminder3DaysSent = true;
        if (type === '1day') updateFields.reminder1DaySent = true;
        if (type === '1hour') updateFields.reminder1HourSent = true;

        const pRef = doc(db, 'participants', participant.id);
        await updateDoc(pRef, updateFields);
        sentCount++;
      } catch (err: any) {
        console.error(`Error actualizando estado en Firestore para ${participant.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Recordatorio "${type}" procesado con éxito.`,
      emailsSent: sentCount,
      simulated: !isRealKey,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Error general en cron reminders:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}

// ==========================================
// HTML TEMPLATES
// ==========================================

function get3DaysReminderHtml(participant: any) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>¡Faltan 3 días! - Neon Night Run Paraíso 2026</title>
    </head>
    <body style="background-color: #060913; color: #ffffff; font-family: sans-serif; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0b1120; border: 2px solid #00f3ff; border-radius: 16px; padding: 30px; box-shadow: 0 0 20px rgba(0, 243, 255, 0.2);">
        <h1 style="color: #00f3ff; margin-bottom: 5px; font-weight: 900; letter-spacing: 1px;">⚡ ¡FALTAN SÓLO 3 DÍAS! ⚡</h1>
        <h2 style="color: #ff007f; margin-top: 0; font-weight: 800;">PREPÁRATE PARA LA EXPERIENCIA NEÓN</h2>
        <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">Hola <strong>${participant.fullName}</strong>, la cuenta regresiva ha comenzado. En 3 días inundaremos de energía y color las calles de Paraíso, Tabasco.</p>
        
        <div style="background-color: #111827; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #ff007f; text-align: left; line-height: 1.6;">
          <h3 style="color: #facc15; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.5px;">📦 Información clave de Entrega de Kits:</h3>
          <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Días:</strong> Viernes 6 y Sábado 7 de Noviembre de 2026</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>📍 Lugar:</strong> Módulo Oficial, Malecón Turístico de Paraíso</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>⚠️ Requisitos obligatorios para recogerlo:</strong></p>
          <ul style="margin: 5px 0 0 20px; padding: 0; font-size: 14px; color: #cbd5e1;">
            <li>Presentar el <strong>Código QR</strong> oficial de este correo.</li>
            <li>Identificación oficial (INE o pasaporte).</li>
            <li>Si recoges el kit de otra persona, trae copia de su identificación oficial.</li>
          </ul>
        </div>

        <div style="background-color: #060913; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #00f3ff;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px; text-transform: uppercase;">TU QR PARA ENTREGA DE KIT:</p>
          ${participant.qrCodeDataUrl ? `
            <div style="background-color: #ffffff; padding: 12px; display: inline-block; border-radius: 12px; margin: 15px 0;">
              <img src="${participant.qrCodeDataUrl}" alt="QR Folio ${participant.folio}" style="width: 150px; height: 150px; display: block;" />
            </div>
          ` : ''}
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #00f3ff;">Folio Oficial: ${participant.folio}</p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #cbd5e1;">Talla seleccionada: <strong>${participant.shirtSize}</strong> | Categoría: <strong>${participant.category}</strong></p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin-top: 25px;">💡 <strong>Tip del Corredor:</strong> Empieza a hidratarte muy bien estos días, descansa lo suficiente y prepara tus mejores tenis. ¡Nos vemos muy pronto!</p>
      </div>
    </body>
    </html>
  `;
}

function get1DayReminderHtml(participant: any) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>¡Mañana es el gran día! - Neon Night Run Paraíso 2026</title>
    </head>
    <body style="background-color: #060913; color: #ffffff; font-family: sans-serif; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0b1120; border: 2px solid #ff007f; border-radius: 16px; padding: 30px; box-shadow: 0 0 20px rgba(255, 0, 127, 0.2);">
        <h1 style="color: #ff007f; margin-bottom: 5px; font-weight: 900; letter-spacing: 1px;">🔥 ¡MAÑANA ES EL DÍA! 🔥</h1>
        <h2 style="color: #00f3ff; margin-top: 0; font-weight: 800;">NEON NIGHT RUN PARAÍSO 2026</h2>
        <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">Hola <strong>${participant.fullName}</strong>, todo está listo para la fiesta deportiva más luminosa del año. Mañana sábado nos reuniremos para llenar Paraíso de color.</p>
        
        <div style="background-color: #111827; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #00f3ff; text-align: left; line-height: 1.6;">
          <h3 style="color: #facc15; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; font-weight: 900;">🕒 Horarios del Evento:</h3>
          <p style="margin: 6px 0; font-size: 14px;"><strong>⏰ 18:00 hrs:</strong> Apertura de la zona general, DJ y pinta caritas neón.</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>⏰ 18:45 hrs:</strong> Calentamiento grupal oficial con música en vivo.</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>⏰ 19:30 hrs:</strong> Disparo de salida oficial (6K).</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>📍 Ubicación:</strong> Malecón Turístico de Paraíso, Tabasco.</p>
        </div>

        <div style="background-color: #060913; padding: 20px; border-radius: 12px; border: 1px solid #ff007f; margin-bottom: 25px;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px; text-transform: uppercase;">MUESTRA ESTE QR EN LA ENTRADA/KIT:</p>
          ${participant.qrCodeDataUrl ? `
            <div style="background-color: #ffffff; padding: 12px; display: inline-block; border-radius: 12px; margin: 15px 0;">
              <img src="${participant.qrCodeDataUrl}" alt="QR Folio ${participant.folio}" style="width: 150px; height: 150px; display: block;" />
            </div>
          ` : ''}
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #ff007f;">Folio de Corredor: ${participant.folio}</p>
        </div>

        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5;">🎨 Ven con toda la actitud neón, invita a tu familia y prepárate para cruzar la meta y disfrutar del After-Party con DJ en vivo. ¡A brillar!</p>
      </div>
    </body>
    </html>
  `;
}

function get1HourReminderHtml(participant: any) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>¡1 Hora para Salir! - Neon Night Run Paraíso 2026</title>
    </head>
    <body style="background-color: #060913; color: #ffffff; font-family: sans-serif; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0b1120; border: 2px solid #facc15; border-radius: 16px; padding: 30px; box-shadow: 0 0 20px rgba(250, 204, 21, 0.25);">
        <h1 style="color: #facc15; margin-bottom: 5px; font-weight: 900; letter-spacing: 1px;">🌟 ¡ÚLTIMO LLAMADO! 🌟</h1>
        <h2 style="color: #ff007f; margin-top: 0; font-weight: 800;">SALIMOS EN 1 HORA</h2>
        <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">Hola <strong>${participant.fullName}</strong>, la hora de brillar ha llegado. En 1 hora exacta (19:30 hrs) daremos el disparo de salida.</p>
        
        <div style="background-color: #111827; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px dashed #facc15; text-align: left; line-height: 1.5;">
          <p style="margin: 5px 0; font-size: 14px;">📍 <strong>¿Dónde?</strong> Malecón Turístico de Paraíso, Tabasco.</p>
          <p style="margin: 5px 0; font-size: 14px;">🎨 <strong>Glow Paint:</strong> Las estaciones de maquillaje neón y accesorios luminosos están activas ahora mismo en el sitio de salida.</p>
          <p style="margin: 5px 0; font-size: 14px;">🎵 <strong>DJ Live:</strong> El DJ oficial ya está tocando en la zona de meta.</p>
        </div>

        <p style="font-size: 15px; color: #ffffff; font-weight: bold; margin-bottom: 25px;">Ten listo tu número de corredor oficial y disfruta de la ruta luminosa. ¡Corre, brilla y diviértete!</p>
        
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">Este es un recordatorio automático en tiempo real para todos nuestros corredores registrados.</p>
      </div>
    </body>
    </html>
  `;
}
