import { NextRequest, NextResponse } from 'next/server';
import { validateAmbassadorCode } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, message: 'Código requerido' }, { status: 400 });
    }
    const result = validateAmbassadorCode(code);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating ambassador code:', error);
    return NextResponse.json({ valid: false, message: 'Error al validar código' }, { status: 500 });
  }
}
