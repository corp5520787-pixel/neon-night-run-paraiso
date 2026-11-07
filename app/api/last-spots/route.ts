import { NextRequest, NextResponse } from 'next/server';
import { createLastSpotsOrder, LastSpotsError } from '@/lib/last-spots-registration';
import { isLastSpotsOpen } from '@/lib/last-spots-window';
import { sendPendingRegistrationEmail } from '@/lib/email';
import { resolvePublicAppUrl } from '@/lib/app-url';
import { ParticipantInput, ShirtSize } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!isLastSpotsOpen(body.access)) {
      return NextResponse.json({ success: false, error: 'El enlace de últimos cupos está cerrado.' }, { status: 403 });
    }
    const p = body.participant || {};
    const required = [p.fullName, p.birthDate, p.email, p.phone, p.shirtSize, p.emergencyContact, p.emergencyPhone];
    if (required.some(value => typeof value !== 'string' || !value.trim()) || !p.waiverAccepted || !p.privacyAccepted) {
      return NextResponse.json({ success: false, error: 'Completa los datos obligatorios y acepta el reglamento y aviso de privacidad.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || !['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(p.shirtSize) || !['Competitiva', 'Recreativa'].includes(p.modality)) {
      return NextResponse.json({ success: false, error: 'Revisa el correo, talla y modalidad seleccionada.' }, { status: 400 });
    }
    if (p.fullName.length > 150 || p.email.length > 254 || !/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) || !Number.isFinite(new Date(`${p.birthDate}T12:00:00Z`).getTime())) {
      return NextResponse.json({ success: false, error: 'Revisa el nombre y la fecha de nacimiento.' }, { status: 400 });
    }
    const participant: ParticipantInput = {
      fullName: p.fullName.trim(), birthDate: p.birthDate,
      age: Math.max(0, Math.floor((Date.now() - new Date(`${p.birthDate}T12:00:00Z`).getTime()) / 31557600000)),
      gender: p.gender === 'Femenil' ? 'Femenil' : 'Varonil',
      category: p.modality === 'Recreativa' ? (p.gender === 'Femenil' ? 'Recreativa Femenil' : 'Recreativa Varonil') : (p.gender === 'Femenil' ? 'Femenil' : 'Varonil'),
      modality: p.modality, email: p.email.trim().toLowerCase(), phone: p.phone.trim(),
      city: typeof p.city === 'string' ? p.city.trim().slice(0, 100) : 'Paraíso',
      state: typeof p.state === 'string' ? p.state.trim().slice(0, 100) : 'Tabasco',
      emergencyContact: p.emergencyContact.trim(), emergencyPhone: p.emergencyPhone.trim(),
      shirtSize: p.shirtSize as ShirtSize,
      ...(typeof p.clubOrTeam === 'string' && p.clubOrTeam.trim() ? { clubOrTeam: p.clubOrTeam.trim().slice(0, 100) } : {}),
      waiverAccepted: true, privacyAccepted: true,
    };
    const { order, participant: created, reused } = await createLastSpotsOrder(participant, body.access, body.requestKey);
    if (!reused) {
      try {
        await sendPendingRegistrationEmail({ order, participant: created, appUrl: resolvePublicAppUrl(req) });
      } catch (err) {
        console.error('Registration saved; pending email could not be sent:', err);
      }
    }
    return NextResponse.json({ success: true, data: { order, participants: [created] } }, { status: reused ? 200 : 201 });
  } catch (err: any) {
    const status = err instanceof LastSpotsError ? err.status : 503;
    console.error('Last-spots registration failed:', err);
    return NextResponse.json({ success: false, error: err instanceof LastSpotsError ? err.message : 'No pudimos guardar tu inscripción. Intenta de nuevo.' }, { status });
  }
}
