import { NextResponse } from 'next/server';
import { getDatabaseUsageStats } from '@/lib/db';

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
