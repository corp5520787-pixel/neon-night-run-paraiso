import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByFolioOrQr, updateParticipant, getOrder } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ folio: string }> }) {
  try {
    const { folio } = await params;
    const participant = getParticipantByFolioOrQr(folio);

    if (!participant) {
      return NextResponse.json({ success: false, error: 'Participante no encontrado' }, { status: 404 });
    }

    const order = getOrder(participant.orderId);

    return NextResponse.json({
      success: true,
      data: {
        participant,
        order,
      },
    });
  } catch (error) {
    console.error('Error fetching participant by folio:', error);
    return NextResponse.json({ success: false, error: 'Error al consultar participante' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ folio: string }> }) {
  try {
    const { folio } = await params;
    const body = await req.json();
    const { adminEmail, ...updates } = body;

    const updated = updateParticipant(folio, updates, adminEmail || 'admin');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Participante no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar participante' }, { status: 500 });
  }
}
