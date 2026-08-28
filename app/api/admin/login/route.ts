import { NextRequest, NextResponse } from 'next/server';
import { AdminUser } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@neonnightrun.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin2026';
    const staffEmail = process.env.STAFF_EMAIL || 'kits@neonnightrun.com';
    const staffPass = process.env.STAFF_PASSWORD || 'kits2026';

    if (email === adminEmail && password === adminPass) {
      const user: AdminUser = {
        id: 'admin-1',
        email: adminEmail,
        name: 'Director de Carrera',
        role: 'admin',
      };
      return NextResponse.json({ success: true, user });
    }

    if (email === staffEmail && password === staffPass) {
      const user: AdminUser = {
        id: 'staff-1',
        email: staffEmail,
        name: 'Staff Entrega de Kits',
        role: 'kits_staff',
      };
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
