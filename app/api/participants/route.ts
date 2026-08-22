import { NextRequest, NextResponse } from 'next/server';
import { getParticipants } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const shirtSize = searchParams.get('shirtSize') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const kitDeliveredParam = searchParams.get('kitDelivered');

    const kitDelivered = kitDeliveredParam !== null && kitDeliveredParam !== undefined
      ? kitDeliveredParam === 'true'
      : undefined;

    const participants = getParticipants({
      status,
      shirtSize,
      category,
      search,
      kitDelivered,
    });

    return NextResponse.json({ success: true, data: participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ success: false, error: 'Error al consultar participantes' }, { status: 500 });
  }
}
