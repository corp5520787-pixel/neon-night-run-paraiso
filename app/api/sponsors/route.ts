import { NextRequest, NextResponse } from 'next/server';
import { getSponsors, createSponsor, updateSponsor, deleteSponsor } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';
    const sponsors = await getSponsors(activeOnly);
    return NextResponse.json({ success: true, data: sponsors });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener patrocinadores' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'El nombre del patrocinador es obligatorio' }, { status: 400 });
    }

    const created = await createSponsor(
      {
        name: body.name.trim(),
        tier: body.tier || 'Oficial',
        logoUrl: body.logoUrl || '',
        websiteUrl: body.websiteUrl || '',
        active: body.active !== undefined ? Boolean(body.active) : true,
        order: body.order ? Number(body.order) : 1,
      },
      body.adminEmail || 'admin'
    );

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsor:', error);
    return NextResponse.json({ success: false, error: 'Error al registrar patrocinador' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'ID de patrocinador no especificado' }, { status: 400 });
    }

    const updated = await updateSponsor(body.id, body, body.adminEmail || 'admin');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Patrocinador no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating sponsor:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar patrocinador' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de patrocinador requerido' }, { status: 400 });
    }

    const deleted = await deleteSponsor(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar patrocinador' }, { status: 500 });
  }
}
