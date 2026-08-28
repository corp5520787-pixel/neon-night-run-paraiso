import { NextRequest, NextResponse } from 'next/server';
import { markKitDelivered } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ folio: string }> }) {
  try {
    const { folio } = await params;
    const body = await req.json();
    const { staffEmail, staffName, notes } = body;

    const result = await markKitDelivered(
      folio,
      {
        email: staffEmail || 'staff@neonnightrunparaiso.mx',
        name: staffName || 'Módulo de Kits',
      },
      notes
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          participant: result.participant,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      participant: result.participant,
    });
  } catch (error) {
    console.error('Error marking kit delivered:', error);
    return NextResponse.json({ success: false, message: 'Error interno al registrar entrega' }, { status: 500 });
  }
}
