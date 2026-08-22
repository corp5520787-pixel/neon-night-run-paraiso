import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByFolioOrQr } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query || body.token || body.folio;

    if (!query) {
      return NextResponse.json({ valid: false, message: 'Se requiere código QR o folio para verificar.' }, { status: 400 });
    }

    const participant = getParticipantByFolioOrQr(query);
    if (!participant) {
      return NextResponse.json({
        valid: false,
        message: 'No se encontró ningún participante con el folio o código QR proporcionado.',
      });
    }

    if (participant.status !== 'confirmed') {
      return NextResponse.json({
        valid: false,
        message: `El registro se encuentra en estado "${participant.status.toUpperCase()}". Solo corredores confirmados pueden recoger kit.`,
        participant,
      });
    }

    return NextResponse.json({
      valid: true,
      participant,
      message: 'Corredor verificado exitosamente.',
    });
  } catch (error) {
    console.error('Error verifying QR:', error);
    return NextResponse.json({ valid: false, message: 'Error en el servidor al verificar código' }, { status: 500 });
  }
}
