import { NextResponse } from 'next/server';
import { getDashboardMetrics, getAuditLogs, getKitDeliveryLogs } from '@/lib/db';

export async function GET() {
  try {
    const metrics = getDashboardMetrics();
    const recentAudit = getAuditLogs().slice(0, 15);
    const recentKitLogs = getKitDeliveryLogs().slice(0, 15);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        recentAudit,
        recentKitLogs,
      },
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json({ success: false, error: 'Error al consultar métricas' }, { status: 500 });
  }
}
