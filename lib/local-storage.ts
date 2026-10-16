import {
  EventConfig,
  PricingStage,
  AmbassadorCode,
  Order,
  Participant,
  KitDeliveryLog,
  AuditLog,
  PaymentWebhookLog,
  ShirtSize,
  RaceModality,
} from './types';
import { defaultEventConfig } from './db-defaults';

function getNodeModules() {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      return { fs, path };
    } catch {
      return null;
    }
  }
  return null;
}

function getDataPaths() {
  const node = getNodeModules();
  if (node) {
    const dataDir = node.path.join(process.cwd(), 'data');
    const backupFile = node.path.join(dataDir, 'db-backup.json');
    return { dataDir, backupFile, fs: node.fs };
  }
  return null;
}

export interface DBBackupState {
  config: EventConfig;
  stages: PricingStage[];
  ambassadors: AmbassadorCode[];
  orders: Order[];
  participants: Participant[];
  kitLogs: KitDeliveryLog[];
  auditLogs: AuditLog[];
  webhookLogs: PaymentWebhookLog[];
  lastSavedAt: string;
  nextFolioNumber?: number;
}

// In-memory cache singleton
let memoryState: DBBackupState | null = null;

function ensureDataDir() {
  try {
    const paths = getDataPaths();
    if (paths && !paths.fs.existsSync(paths.dataDir)) {
      paths.fs.mkdirSync(paths.dataDir, { recursive: true });
    }
  } catch (e) {
    console.error('Error creating data directory:', e);
  }
}

export function generateInitialSnapshot(): DBBackupState {
  const defaultStages: PricingStage[] = [
    {
      id: 'stage-regular',
      name: 'Inscripción General Oficial',
      price: 350,
      startDate: '2026-07-01T00:00:00',
      endDate: '2026-11-06T23:59:59',
      quota: 350,
      soldCount: 96,
      active: true,
      badgeText: 'Fase Regular 6K',
      description: 'Acceso completo al evento, playera técnica neón, medalla de finalista, número de competidor y kit glow.',
    },
    {
      id: 'stage-team',
      name: 'Paquete Equipos & Amigos (5+ personas)',
      price: 315,
      startDate: '2026-07-01T00:00:00',
      endDate: '2026-11-06T23:59:59',
      quota: 50,
      soldCount: 15,
      active: true,
      badgeText: '10% Descuento Grupal',
      description: 'Precio especial por participante al registrar 5 o más corredores en la misma orden.',
    },
  ];

  const defaultAmbassadors: AmbassadorCode[] = [
    {
      id: 'amb-1',
      code: 'NEONRUNNER10',
      ambassadorName: 'Carlos Mario López',
      ambassadorEmail: 'carlos.lopez@neonnightrunparaiso.mx',
      commissionPercent: 10,
      discountType: 'percentage',
      discountValue: 10,
      maxUses: 100,
      usedCount: 28,
      active: true,
      totalRevenue: 9800,
      createdAt: '2026-07-01T00:00:00',
    },
    {
      id: 'amb-2',
      code: 'GLOWTABASCO',
      ambassadorName: 'Mariana Pérez Ruiz',
      ambassadorEmail: 'mariana.perez@neonnightrunparaiso.mx',
      commissionPercent: 10,
      discountType: 'percentage',
      discountValue: 10,
      maxUses: 50,
      usedCount: 19,
      active: true,
      totalRevenue: 6650,
      createdAt: '2026-07-05T00:00:00',
    },
    {
      id: 'amb-3',
      code: 'NOCHES6K',
      ambassadorName: 'Roberto Domínguez',
      ambassadorEmail: 'roberto.d@neonnightrunparaiso.mx',
      commissionPercent: 12,
      discountType: 'fixed',
      discountValue: 35,
      maxUses: 50,
      usedCount: 14,
      active: true,
      totalRevenue: 4900,
      createdAt: '2026-07-10T00:00:00',
    },
  ];

  const mexicanFirstNamesM = [
    'Alejandro', 'Héctor', 'Carlos', 'Eduardo', 'Jorge', 'Luis', 'Fernando', 'Ricardo',
    'Daniel', 'Miguel', 'Javier', 'Rodrigo', 'Arturo', 'Gabriel', 'Alberto', 'Emilio',
    'Diego', 'Manuel', 'Oscar', 'Sebastián', 'Raúl', 'Guillermo', 'Mauricio', 'Andrés',
    'Pablo', 'Iván', 'Marco', 'Francisco', 'Armando', 'Gerardo'
  ];
  const mexicanFirstNamesF = [
    'Sofía', 'Daniela', 'Mariana', 'Fernanda', 'Valeria', 'Camila', 'Lucía', 'Andrea',
    'Paola', 'Gabriela', 'Alejandra', 'Natalia', 'Elena', 'Carmen', 'Karla', 'Diana',
    'Patricia', 'Claudia', 'Adriana', 'Beatriz', 'Verónica', 'Mónica', 'Rosa', 'Lorena',
    'Tania', 'Brenda', 'Jessica', 'Vanessa', 'Montserrat', 'Jimena'
  ];
  const mexicanLastNames = [
    'Morales', 'Valenzuela', 'Gómez', 'Méndez', 'López', 'Torres', 'Pérez', 'Hernández',
    'García', 'Martínez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Flores', 'González', 'Vargas',
    'Castillo', 'Reyes', 'Gutiérrez', 'Castro', 'Ortiz', 'Ruiz', 'Chávez', 'Domínguez',
    'Ramos', 'Álvarez', 'Jiménez', 'Moreno', 'Herrera', 'Medina', 'Aguilar', 'Vázquez'
  ];
  const tabascoCities = ['Paraíso', 'Comalcalco', 'Villahermosa', 'Cárdenas', 'Cunduacán', 'Jalpa de Méndez'];
  const shirtSizes: ShirtSize[] = ['S', 'M', 'L', 'XL', 'XS', 'XXL'];
  const shirtDist: ShirtSize[] = ['S', 'M', 'M', 'M', 'L', 'L', 'XL', 'S', 'XS', 'XXL'];

  const participants: Participant[] = [];
  const orders: Order[] = [];
  const kitLogs: KitDeliveryLog[] = [];
  const auditLogs: AuditLog[] = [];

  let nextOrderNum = 1001;

  for (let i = 1; i <= 96; i++) {
    const isMale = i % 2 === 1;
    const firstNames = isMale ? mexicanFirstNamesM : mexicanFirstNamesF;
    const fName = firstNames[(i * 7) % firstNames.length];
    const lName1 = mexicanLastNames[(i * 3) % mexicanLastNames.length];
    const lName2 = mexicanLastNames[(i * 5) % mexicanLastNames.length];
    const fullName = `${fName} ${lName1} ${lName2}`;
    const email = `${fName.toLowerCase()}.${lName1.toLowerCase()}${i}@gmail.com`;
    const phone = `993${String(1000000 + i * 3791).slice(0, 7)}`;
    const folio = `NNR-${String(i).padStart(6, '0')}`;
    const city = tabascoCities[i % tabascoCities.length];
    const shirtSize = shirtDist[i % shirtDist.length];
    const age = 18 + ((i * 3) % 42);
    const category = isMale ? 'Varonil' : 'Femenil';
    const modality: RaceModality = i % 3 === 0 ? 'Recreativa' : 'Competitiva';

    // Status: 84 confirmed, 8 pending, 4 cancelled
    let status: 'confirmed' | 'pending' | 'cancelled' = 'confirmed';
    if (i >= 85 && i <= 92) {
      status = 'pending';
    } else if (i > 92) {
      status = 'cancelled';
    }

    // Kits delivered for confirmed participants: first 42 have kits delivered
    const kitDelivered = status === 'confirmed' && i <= 42;
    const kitDeliveredAt = kitDelivered ? `2026-11-06T${14 + (i % 6)}:${String((i * 7) % 60).padStart(2, '0')}:00` : undefined;
    const kitDeliveredBy = kitDelivered ? (i % 2 === 0 ? 'kits@neonnightrunparaiso.mx' : 'staff@neonnightrunparaiso.mx') : undefined;

    const orderId = `ord-${nextOrderNum}`;
    const orderNumber = `NNR-ORD-${nextOrderNum}`;
    nextOrderNum++;

    const isCard = i % 3 !== 0;
    const paymentMethod = isCard ? 'mercadopago' : 'transfer';
    const pStatus = status === 'confirmed' ? 'approved' : (status === 'pending' ? 'pending' : 'rejected');

    const createdDate = new Date(Date.now() - (96 - i) * 6 * 3600 * 1000 - 86400000);
    const createdIso = createdDate.toISOString();

    const p: Participant = {
      id: `p-${String(i).padStart(3, '0')}`,
      orderId,
      folio,
      fullName,
      birthDate: `${2026 - age}-05-15`,
      age,
      gender: isMale ? 'Varonil' : 'Femenil',
      category,
      modality,
      email,
      phone,
      city,
      state: 'Tabasco',
      emergencyContact: `Familiar de ${fName}`,
      emergencyPhone: `993${String(7000000 + i * 2913).slice(0, 7)}`,
      shirtSize,
      clubOrTeam: i % 4 === 0 ? 'Club Runners Paraíso' : (i % 5 === 0 ? 'Tabasco Night Runners' : undefined),
      ambassadorCode: i % 3 === 0 ? 'NEONRUNNER10' : (i % 5 === 0 ? 'GLOWTABASCO' : undefined),
      qrToken: `NNR-TOKEN-${folio}-SECURE`,
      qrCodeDataUrl: '',
      kitDelivered,
      kitDeliveredAt,
      kitDeliveredBy,
      kitDeliveryNotes: kitDelivered ? 'Kit verificado y entregado en mesa 1' : undefined,
      waiverAccepted: true,
      privacyAccepted: true,
      createdAt: createdIso,
      status,
      unitPrice: 350,
      discountApplied: i % 3 === 0 ? 35 : 0,
      cancelledAt: status === 'cancelled' ? new Date(createdDate.getTime() + 6 * 86400000).toISOString() : undefined,
      cancellationReason: status === 'cancelled' ? 'Lugar liberado por falta de pago (más de 5 días sin validar comprobante).' : undefined,
    };
    participants.push(p);

    if (kitDelivered) {
      kitLogs.push({
        id: `klog-${i}`,
        participantId: p.id,
        folio: p.folio,
        participantName: p.fullName,
        shirtSize: p.shirtSize,
        staffEmail: kitDeliveredBy!,
        staffName: kitDeliveredBy === 'kits@neonnightrunparaiso.mx' ? 'Personal Módulo de Kits 1' : 'Personal Módulo de Kits 2',
        action: 'delivered',
        notes: 'Kit oficial entregado exitosamente',
        timestamp: kitDeliveredAt!,
      });
    }

    const order: Order = {
      id: orderId,
      orderNumber,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      participantsCount: 1,
      stageId: 'stage-regular',
      stageName: 'Inscripción General Oficial',
      unitPrice: 350,
      subtotal: 350,
      discountAmount: p.discountApplied,
      totalAmount: 350 - p.discountApplied,
      ambassadorCodeUsed: p.ambassadorCode,
      paymentMethod,
      paymentStatus: pStatus,
      paymentReference: isCard ? `MP-PAY-${100000 + i * 83}` : `SPEI-TRANS-${1000 + i}`,
      createdAt: createdIso,
      updatedAt: createdIso,
      confirmedAt: status === 'confirmed' ? createdIso : undefined,
      confirmedBy: status === 'confirmed' ? (isCard ? 'Mercado Pago Webhook' : 'admin@neonnightrunparaiso.mx') : undefined,
      participants: [p],
    };
    orders.push(order);
  }

  auditLogs.push({
    id: 'aud-init-1',
    action: 'SYSTEM_BACKUP_INITIALIZED',
    entity: 'config',
    entityId: 'nnr-paraiso-2026',
    performedBy: 'system',
    performedByRole: 'admin',
    details: 'Base de datos sincronizada y cargada en almacenamiento local resiliente',
    timestamp: new Date().toISOString(),
  });

  return {
    config: {
      ...defaultEventConfig,
      currentTotalRegistered: 96,
      maxTotalQuota: 350,
    },
    stages: defaultStages,
    ambassadors: defaultAmbassadors,
    orders,
    participants,
    kitLogs,
    auditLogs,
    webhookLogs: [],
    lastSavedAt: new Date().toISOString(),
  };
}

export function getLocalDB(): DBBackupState {
  if (memoryState) {
    return memoryState;
  }

  ensureDataDir();

  try {
    const paths = getDataPaths();
    if (paths && paths.fs.existsSync(paths.backupFile)) {
      const raw = paths.fs.readFileSync(paths.backupFile, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.participants) && parsed.participants.length > 0) {
        memoryState = parsed;
        return memoryState!;
      }
    }
  } catch (err) {
    console.error('Error reading backup file, generating fresh state:', err);
  }

  memoryState = generateInitialSnapshot();
  saveLocalDB(memoryState);
  return memoryState;
}

export function saveLocalDB(state: DBBackupState) {
  try {
    ensureDataDir();
    state.lastSavedAt = new Date().toISOString();
    memoryState = state;
    const paths = getDataPaths();
    if (paths) {
      paths.fs.writeFileSync(paths.backupFile, JSON.stringify(state, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error saving local backup:', err);
  }
}
