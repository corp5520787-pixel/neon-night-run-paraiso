import { NextRequest, NextResponse } from 'next/server';
import { getDB, recordAuditLog } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDB();

    const amb = db.ambassadors.find(a => a.id === id || a.code === id);
    if (!amb) {
      return NextResponse.json({ success: false, error: 'Código de embajador no encontrado' }, { status: 404 });
    }

    if (typeof body.active === 'boolean') {
      amb.active = body.active;
    }
    if (body.ambassadorName) amb.ambassadorName = body.ambassadorName;
    if (body.ambassadorEmail) amb.ambassadorEmail = body.ambassadorEmail;
    if (typeof body.discountValue === 'number') amb.discountValue = body.discountValue;
    if (typeof body.commissionPercent === 'number') amb.commissionPercent = body.commissionPercent;
    if (typeof body.maxUses === 'number') amb.maxUses = body.maxUses;

    recordAuditLog(
      'AMBASSADOR_UPDATED',
      'ambassador',
      amb.id,
      'admin',
      'admin',
      `Código de embajador ${amb.code} actualizado`
    );

    return NextResponse.json({ success: true, data: amb });
  } catch (error) {
    console.error('Error updating ambassador:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar código' }, { status: 500 });
  }
}
