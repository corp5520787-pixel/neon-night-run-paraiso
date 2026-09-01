import { NextResponse } from 'next/server';
import { getDatabaseUsageStats, resetDbTelemetry } from '@/lib/db';

export async function GET() {
  try {
    const stats = await getDatabaseUsageStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in /api/admin/db-usage:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Error al obtener métricas de uso de base de datos',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'reset') {
      resetDbTelemetry();
      const updated = await getDatabaseUsageStats();
      return NextResponse.json({
        success: true,
        message: 'Contador de telemetría de base de datos reiniciado correctamente',
        data: updated,
      });
    }
    return NextResponse.json({ success: false, error: 'Acción no reconocida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
