import { NextRequest, NextResponse } from 'next/server';
import { getPricingStages, createPricingStage } from '@/lib/db';

export async function GET() {
  try {
    const stages = getPricingStages();
    return NextResponse.json({ success: true, data: stages });
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener etapas de precio' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stage = createPricingStage(body, body.adminEmail || 'admin');
    return NextResponse.json({ success: true, data: stage }, { status: 201 });
  } catch (error) {
    console.error('Error creating stage:', error);
    return NextResponse.json({ success: false, error: 'Error al crear etapa de precio' }, { status: 500 });
  }
}
