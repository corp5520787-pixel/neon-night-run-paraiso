import { NextRequest, NextResponse } from 'next/server';
import { revertKitDelivered } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ folio: string }> }) {
  try {
    const { folio } = await params;
    const body = await req.json();
    const { adminEmail, adminName, reason } = body;

    if (!reason) {
      return NextResponse.json({ success: false, message: 'Se requiere motivo para revertir entrega.' }, { status: 400 });
    }

    const result = revertKitDelivered(
      folio,
      {
        email: adminEmail || 'admin@neonnightrunparaiso.mx',
        name: adminName || 'Administrador',
      },
      reason
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
    console.error('Error reverting kit delivery:', error);
    return NextResponse.json({ success: false, message: 'Error interno al revertir entrega' }, { status: 500 });
  }
}
