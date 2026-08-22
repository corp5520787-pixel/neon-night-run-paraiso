import { NextRequest, NextResponse } from 'next/server';
import { updatePricingStage } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updatePricingStage(id, body, body.adminEmail || 'admin');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Etapa no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar etapa' }, { status: 500 });
  }
}
