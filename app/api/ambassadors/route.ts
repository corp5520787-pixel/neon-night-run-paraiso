import { NextRequest, NextResponse } from 'next/server';
import { getAmbassadorCodes, createAmbassadorCode } from '@/lib/db';

export async function GET() {
  try {
    const codes = await getAmbassadorCodes();
    return NextResponse.json({ success: true, data: codes });
  } catch (error) {
    console.error('Error fetching ambassadors:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener códigos de embajador' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await createAmbassadorCode(body, body.adminEmail || 'admin');
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating ambassador code:', error);
    return NextResponse.json({ success: false, error: 'Error al crear código de embajador' }, { status: 500 });
  }
}
