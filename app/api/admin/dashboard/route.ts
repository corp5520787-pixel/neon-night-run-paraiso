import { NextResponse } from 'next/server';
import { getDB, getDashboardMetrics } from '@/lib/db';
import { DashboardStats } from '@/lib/types';

export async function GET() {
  try {
    const db = getDB();
    const metrics = getDashboardMetrics();

    const confirmed = db.participants.filter(p => p.status === 'confirmed');
    const pendingTransfers = db.orders.filter(o => o.paymentMethod === 'transfer' && o.paymentStatus === 'pending');

    const leaderboard = db.ambassadors.map(a => ({
      code: a.code,
      name: a.ambassadorName,
      usageCount: a.usedCount,
      totalSales: a.totalRevenue,
      commissionEarned: Math.round((a.totalRevenue * (a.commissionPercent || 10)) / 100),
    })).sort((a, b) => b.totalSales - a.totalSales);

    const stats: DashboardStats = {
      totalRegistered: db.config.currentTotalRegistered,
      totalQuota: db.config.maxTotalQuota,
      totalRevenue: metrics.totalRevenue,
      totalConfirmed: confirmed.length,
      pendingTransfersCount: pendingTransfers.length,
      kitsDeliveredCount: metrics.kitsDelivered,
      sizeBreakdown: metrics.shirtSizes,
      ambassadorLeaderboard: leaderboard,
      recentParticipants: [...db.participants].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return NextResponse.json({ success: false, error: 'Error al consultar métricas del dashboard' }, { status: 500 });
  }
}
