import { NextResponse } from 'next/server';
import { exportParticipantsCSV } from '@/lib/db';

export async function GET() {
  try {
    const csvContent = await exportParticipantsCSV();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `neon-night-run-inscritos-${dateStr}.csv`;

    return new NextResponse('\uFEFF' + csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json({ success: false, error: 'Error al exportar CSV' }, { status: 500 });
  }
}
