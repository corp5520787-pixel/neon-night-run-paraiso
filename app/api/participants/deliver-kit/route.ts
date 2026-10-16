import { NextRequest, NextResponse } from 'next/server';
import { markKitDelivered } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participantId, deliveredBy, notes } = body;

    if (!participantId) {
      return NextResponse.json({ success: false, message: 'ID o Folio de participante es requerido' }, { status: 400 });
    }

    const staffUser = {
      email: deliveredBy || 'kits@neonnightrunparaiso.mx',
      name: deliveredBy || 'Staff Módulo Central',
    };

    const result = await markKitDelivered(participantId, staffUser, notes);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error delivering kit:', error);
    return NextResponse.json({ success: false, message: 'Error al registrar entrega de kit' }, { status: 500 });
  }
}
