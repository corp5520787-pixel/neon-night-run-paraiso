import { NextRequest, NextResponse } from 'next/server';
import { updateAmbassadorCode, deleteAmbassadorCode } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateAmbassadorCode(id, body, 'admin');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Código de embajador no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating ambassador:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar código' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteAmbassadorCode(id, 'admin');
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Código de embajador no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ambassador:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar código' }, { status: 500 });
  }
}

