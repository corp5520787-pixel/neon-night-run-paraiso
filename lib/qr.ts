import QRCode from 'qrcode';

export interface QRPayload {
  folio: string;
  token: string;
  orderId: string;
  eventName: string;
  participantName: string;
  shirtSize: string;
  v: number;
}

/**
 * Generate a secure cryptographically unique token for a participant
 */
export function generateParticipantToken(folio: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `NNR-TOKEN-${folio}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate high-resolution Data URL for the QR code
 * The QR code encodes a validation URL or secure payload
 */
export async function generateQRCodeDataUrl(qrContent: string): Promise<string> {
  try {
    return await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#060913',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

/**
 * Decode and extract token / folio from scanned QR text
 */
export function parseScannedQR(text: string): { folio?: string; token?: string; isValid: boolean } {
  const clean = text.trim();
  
  // Format 1: Direct URL e.g. https://.../validar?token=NNR-TOKEN-... or /participante/NNR-000001
  if (clean.includes('/participante/') || clean.includes('/validar')) {
    const urlParts = clean.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart.startsWith('NNR-')) {
      return { folio: lastPart, isValid: true };
    }
  }

  // Format 2: Direct Token
  if (clean.startsWith('NNR-TOKEN-')) {
    const parts = clean.split('-');
    if (parts.length >= 4) {
      const folio = `NNR-${parts[2]}`;
      return { folio, token: clean, isValid: true };
    }
    return { token: clean, isValid: true };
  }

  // Format 3: Direct Folio e.g. NNR-000001
  if (clean.startsWith('NNR-')) {
    return { folio: clean, isValid: true };
  }

  // Format 4: Raw string fallback
  return { token: clean, isValid: clean.length > 5 };
}
