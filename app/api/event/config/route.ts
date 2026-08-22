import { NextRequest, NextResponse } from 'next/server';
import { getEventConfig, updateEventConfig } from '@/lib/db';

export async function GET() {
  try {
    const config = getEventConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching event config:', error);
    return NextResponse.json({ success: false, error: 'Error al cargar configuración' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateEventConfig(body, body.adminEmail || 'admin');
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating event config:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
