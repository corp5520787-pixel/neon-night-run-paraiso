import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { resolvePublicAppUrl } from '@/lib/app-url';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folio: string }> }
) {
  try {
    const { folio } = await params;
    // Strip possible .png extension
    const cleanFolio = folio.replace(/\.png$/i, '').trim();

    const baseUrl = resolvePublicAppUrl(req);
    const targetUrl = `${baseUrl}/participante/${cleanFolio}`;

    // Generate PNG buffer
    const pngBuffer = await QRCode.toBuffer(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#060913',
        light: '#ffffff',
      },
    });

    return new Response(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="qr-${cleanFolio}.png"`,
      },
    });
  } catch (error) {
    console.error('Error generating QR image route:', error);
    return new Response('Error generating QR code', { status: 500 });
  }
}
