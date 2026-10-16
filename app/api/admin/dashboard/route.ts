import { NextResponse } from 'next/server';
import { getEventConfig, getAmbassadorCodes, getParticipants, getOrders } from '@/lib/db';
import { Participant, Order, DashboardStats } from '@/lib/types';

export async function GET() {
  try {
    const [config, ambassadors, participants, orders] = await Promise.all([
      getEventConfig(),
      getAmbassadorCodes(),
      getParticipants(),
      getOrders(),
    ]);

    const confirmed = participants.filter(p => p.status === 'confirmed');
    const approvedOrders = orders.filter(o => o.paymentStatus === 'approved');
    const totalRevenue = approvedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingTransfers = orders.filter(o => o.paymentMethod === 'transfer' && o.paymentStatus === 'pending');
    const kitsDelivered = participants.filter(p => p.kitDelivered).length;

    const shirtSizes: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
    for (const p of participants) {
      if (p.shirtSize && p.shirtSize in shirtSizes) {
        shirtSizes[p.shirtSize]++;
      }
    }

    const leaderboard = ambassadors.map(a => ({
      code: a.code,
      name: a.ambassadorName,
      usageCount: a.usedCount,
      totalSales: a.totalRevenue,
      commissionEarned: Math.round((a.totalRevenue * (a.commissionPercent || 10)) / 100),
    })).sort((a, b) => b.totalSales - a.totalSales);

    const stats: DashboardStats = {
      totalRegistered: participants.filter(p => p.status !== 'cancelled').length,
      totalQuota: config.maxTotalQuota,
      totalRevenue,
      totalConfirmed: confirmed.length,
      pendingTransfersCount: pendingTransfers.length,
      kitsDeliveredCount: kitsDelivered,
      sizeBreakdown: shirtSizes,
      ambassadorLeaderboard: leaderboard,
      recentParticipants: [...participants]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Error al consultar métricas del dashboard',
      code: error?.code,
      details: String(error)
    }, { status: 500 });
  }
}
