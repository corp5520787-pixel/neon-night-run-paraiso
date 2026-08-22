import { NextRequest, NextResponse } from 'next/server';
import { defaultAdminUsers } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    // Standard demo / prototype authentication logic
    // Allows demo login with default accounts or any matching admin email
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check predefined users
    let matchedUser = defaultAdminUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      if (cleanEmail.includes('admin')) {
        matchedUser = {
          id: `admin-${Date.now()}`,
          email: cleanEmail,
          name: 'Administrador del Evento',
          role: 'admin',
        };
      } else if (cleanEmail.includes('kit') || cleanEmail.includes('staff')) {
        matchedUser = {
          id: `staff-${Date.now()}`,
          email: cleanEmail,
          name: 'Personal Módulo de Kits',
          role: 'kits_staff',
        };
      }
    }

    if (!matchedUser) {
      // Fallback: If role specified, assign demo user
      if (role === 'kits_staff') {
        matchedUser = defaultAdminUsers[1];
      } else {
        matchedUser = defaultAdminUsers[0];
      }
    }

    return NextResponse.json({
      success: true,
      user: matchedUser,
      token: `AUTH-${matchedUser.role.toUpperCase()}-${Date.now()}`,
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json({ success: false, error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
