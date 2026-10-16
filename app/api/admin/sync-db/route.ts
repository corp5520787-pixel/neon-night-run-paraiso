import { NextRequest, NextResponse } from 'next/server';
import { syncLocalBackupToFirestore } from '@/lib/db';
import { getLocalDB } from '@/lib/local-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const local = getLocalDB();
  return NextResponse.json({
    success: true,
    localState: {
      totalParticipants: local.participants.length,
      totalOrders: local.orders.length,
      lastSavedAt: local.lastSavedAt,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const result = await syncLocalBackupToFirestore();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error during manual sync:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Error al ejecutar sincronización',
    }, { status: 500 });
  }
}
