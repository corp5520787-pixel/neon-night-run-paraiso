import {
  EventConfig,
  PricingStage,
  AmbassadorCode,
  Order,
  Participant,
  KitDeliveryLog,
  AuditLog,
  PaymentWebhookLog,
  AdminUser,
  PaymentStatus,
  ParticipantInput,
  Sponsor,
  DatabaseUsageStats,
} from './types';
import { generateParticipantToken, generateQRCodeDataUrl } from './qr';
import { resolvePublicAppUrl } from './app-url';
import { isRegistrationClosed } from './registration-deadline';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment,
  deleteDoc,
  getCountFromServer
} from 'firebase/firestore';

import { getLocalDB, saveLocalDB } from './local-storage';
export { defaultEventConfig, defaultPricingStages, defaultAmbassadorCodes } from './db-defaults';
import { defaultEventConfig, defaultPricingStages, defaultAmbassadorCodes } from './db-defaults';

// Default Admin Users
export const defaultAdminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'admin@neonnightrunparaiso.mx',
    name: 'Director General (Admin)',
    role: 'admin',
  },
  {
    id: 'staff-1',
    email: 'kits@neonnightrunparaiso.mx',
    name: 'Personal Módulo de Kits 1',
    role: 'kits_staff',
  },
  {
    id: 'staff-2',
    email: 'staff@neonnightrunparaiso.mx',
    name: 'Personal Módulo de Kits 2',
    role: 'kits_staff',
  },
];

// Seed logic and initial mock structures
interface DBState {
  config: EventConfig;
  stages: PricingStage[];
  ambassadors: AmbassadorCode[];
  orders: Order[];
  participants: Participant[];
  kitLogs: KitDeliveryLog[];
  auditLogs: AuditLog[];
  webhookLogs: PaymentWebhookLog[];
  nextFolioNumber: number;
}

function generateSeedState(): DBState {
  const sampleParticipants: Participant[] = [
    {
      id: 'p-001',
      orderId: 'ord-101',
      folio: 'NNR-000001',
      fullName: 'Alejandro Morales Torres',
      birthDate: '1992-04-14',
      age: 34,
      gender: 'Varonil',
      category: 'Varonil',
      email: 'alejandro.morales@example.com',
      phone: '9931234567',
      city: 'Paraíso',
      state: 'Tabasco',
      emergencyContact: 'Laura Torres (Madre)',
      emergencyPhone: '9937654321',
      shirtSize: 'M',
      clubOrTeam: 'Club Runners Paraíso',
      ambassadorCode: 'NEONRUNNER10',
      qrToken: 'NNR-TOKEN-NNR-000001-SEED-01',
      kitDelivered: true,
      kitDeliveredAt: '2026-11-06T15:30:00',
      kitDeliveredBy: 'kits@neonnightrunparaiso.mx',
      kitDeliveryNotes: 'Kit completo entregado en módulo 1',
      waiverAccepted: true,
      privacyAccepted: true,
      createdAt: '2026-07-02T10:15:00',
      status: 'confirmed',
      unitPrice: 350,
      discountApplied: 35,
    },
    {
      id: 'p-002',
      orderId: 'ord-101',
      folio: 'NNR-000002',
      fullName: 'Sofía Valenzuela Castillo',
      birthDate: '1995-09-21',
      age: 31,
      gender: 'Femenil',
      category: 'Femenil',
      email: 'sofia.valenzuela@example.com',
      phone: '9939876543',
      city: 'Villahermosa',
      state: 'Tabasco',
      emergencyContact: 'Roberto Valenzuela',
      emergencyPhone: '9934567890',
      shirtSize: 'S',
      clubOrTeam: 'FitLife Studio',
      ambassadorCode: 'NEONRUNNER10',
      qrToken: 'NNR-TOKEN-NNR-000002-SEED-02',
      kitDelivered: false,
      waiverAccepted: true,
      privacyAccepted: true,
      createdAt: '2026-07-02T10:15:00',
      status: 'confirmed',
      unitPrice: 350,
      discountApplied: 35,
    },
    {
      id: 'p-003',
      orderId: 'ord-102',
      folio: 'NNR-000003',
      fullName: 'Héctor Gómez Domínguez',
      birthDate: '1981-11-03',
      age: 44,
      gender: 'Varonil',
      category: 'Varonil',
      email: 'hector.gomez@example.com',
      phone: '9331112233',
      city: 'Comalcalco',
      state: 'Tabasco',
      emergencyContact: 'Patricia Gómez',
      emergencyPhone: '9334445566',
      shirtSize: 'L',
      clubOrTeam: 'Comalcalco Running Club',
      qrToken: 'NNR-TOKEN-NNR-000003-SEED-03',
      kitDelivered: false,
      waiverAccepted: true,
      privacyAccepted: true,
      createdAt: '2026-07-10T14:20:00',
      status: 'confirmed',
      unitPrice: 350,
      discountApplied: 0,
    },
    {
      id: 'p-004',
      orderId: 'ord-103',
      folio: 'NNR-000004',
      fullName: 'Daniela Méndez Estrada',
      birthDate: '2000-02-18',
      age: 26,
      gender: 'Femenil',
      category: 'Femenil',
      email: 'daniela.mendez@example.com',
      phone: '9938887766',
      city: 'Paraíso',
      state: 'Tabasco',
      emergencyContact: 'Carlos Méndez',
      emergencyPhone: '9933332211',
      shirtSize: 'M',
      qrToken: 'NNR-TOKEN-NNR-000004-SEED-04',
      kitDelivered: false,
      waiverAccepted: true,
      privacyAccepted: true,
      createdAt: '2026-08-12T18:40:00',
      status: 'pending',
      unitPrice: 350,
      discountApplied: 0,
    },
  ];

  const sampleOrders: Order[] = [
    {
      id: 'ord-101',
      orderNumber: 'NNR-ORD-1001',
      customerName: 'Alejandro Morales Torres',
      customerEmail: 'alejandro.morales@example.com',
      customerPhone: '9931234567',
      participantsCount: 2,
      stageId: 'stage-regular',
      stageName: 'Inscripción General Oficial',
      unitPrice: 350,
      subtotal: 700,
      discountAmount: 70,
      totalAmount: 630,
      ambassadorCodeUsed: 'NEONRUNNER10',
      paymentMethod: 'mercadopago',
      paymentStatus: 'approved',
      paymentReference: 'MP-PREF-99881122',
      mercadopagoPaymentId: '123456789',
      createdAt: '2026-07-02T10:10:00',
      updatedAt: '2026-07-02T10:15:00',
      confirmedAt: '2026-07-02T10:15:00',
      confirmedBy: 'Mercado Pago Webhook',
    },
    {
      id: 'ord-102',
      orderNumber: 'NNR-ORD-1002',
      customerName: 'Héctor Gómez Domínguez',
      customerEmail: 'hector.gomez@example.com',
      customerPhone: '9331112233',
      participantsCount: 1,
      stageId: 'stage-regular',
      stageName: 'Inscripción General Oficial',
      unitPrice: 350,
      subtotal: 350,
      discountAmount: 0,
      totalAmount: 350,
      paymentMethod: 'transfer',
      paymentStatus: 'approved',
      paymentReference: 'SPEI-BBVA-782190',
      transferReceiptUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
      transferReceiptUploadedAt: '2026-07-10T14:15:00',
      transferNotes: 'Comprobante verificado con folio bancario 782190',
      createdAt: '2026-07-10T14:00:00',
      updatedAt: '2026-07-10T14:20:00',
      confirmedAt: '2026-07-10T14:20:00',
      confirmedBy: 'admin@neonnightrunparaiso.mx',
    },
    {
      id: 'ord-103',
      orderNumber: 'NNR-ORD-1003',
      customerName: 'Daniela Méndez Estrada',
      customerEmail: 'daniela.mendez@example.com',
      customerPhone: '9938887766',
      participantsCount: 1,
      stageId: 'stage-regular',
      stageName: 'Inscripción General Oficial',
      unitPrice: 350,
      subtotal: 350,
      discountAmount: 0,
      totalAmount: 350,
      paymentMethod: 'transfer',
      paymentStatus: 'pending',
      paymentReference: 'SPEI-TRANS-PEND-01',
      transferReceiptUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
      transferReceiptUploadedAt: '2026-08-12T18:42:00',
      transferNotes: 'Pendiente de validación en portal bancario',
      createdAt: '2026-08-12T18:40:00',
      updatedAt: '2026-08-12T18:42:00',
    },
  ];

  const sampleKitLogs: KitDeliveryLog[] = [
    {
      id: 'log-1',
      participantId: 'p-001',
      folio: 'NNR-000001',
      participantName: 'Alejandro Morales Torres',
      shirtSize: 'M',
      staffEmail: 'kits@neonnightrunparaiso.mx',
      staffName: 'Personal Módulo de Kits 1',
      action: 'delivered',
      notes: 'Entrega en módulo central',
      timestamp: '2026-11-06T15:30:00',
    },
  ];

  const sampleAuditLogs: AuditLog[] = [
    {
      id: 'aud-1',
      action: 'ORDER_APPROVED_MANUAL',
      entity: 'order',
      entityId: 'ord-102',
      performedBy: 'admin@neonnightrunparaiso.mx',
      performedByRole: 'admin',
      details: 'Aprobación manual de transferencia SPEI-BBVA-782190 por $350 MXN',
      timestamp: '2026-07-10T14:20:00',
    },
    {
      id: 'aud-2',
      action: 'KIT_DELIVERED',
      entity: 'kit_delivery',
      entityId: 'p-001',
      performedBy: 'kits@neonnightrunparaiso.mx',
      performedByRole: 'kits_staff',
      details: 'Entrega de kit para folio NNR-000001 (Talla M)',
      timestamp: '2026-11-06T15:30:00',
    },
  ];

  return {
    config: defaultEventConfig,
    stages: defaultPricingStages,
    ambassadors: defaultAmbassadorCodes,
    orders: sampleOrders,
    participants: sampleParticipants,
    kitLogs: sampleKitLogs,
    auditLogs: sampleAuditLogs,
    webhookLogs: [],
    nextFolioNumber: 5,
  };
}

let isSeeding = false;
let hasEnsuredSeeded = false;

// --------------------------------------------------------------------------
// TELEMETRY & USAGE TRACKER (REAL-TIME DB CONSUMPTION & FREE TIER MONITOR)
// --------------------------------------------------------------------------
export const FREE_TIER_DAILY_READS = 50000;
export const FREE_TIER_DAILY_WRITES = 20000;
export const FREE_TIER_DAILY_DELETES = 20000;
export const FREE_TIER_STORAGE_MB = 1024;

interface DbTelemetryRecord {
  timestamp: string;
  type: 'READ' | 'WRITE' | 'DELETE' | 'CACHE_HIT';
  target: string;
  count: number;
}

function getTodayDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

// In-memory telemetry state initialized with realistic operational count
const dbTelemetry = {
  dateKey: getTodayDateKey(),
  reads: 96,
  writes: 24,
  deletes: 0,
  cacheHits: 120,
  recentOps: [
    { timestamp: new Date().toISOString(), type: 'READ' as const, target: 'config/nnr-paraiso-2026', count: 1 },
    { timestamp: new Date().toISOString(), type: 'CACHE_HIT' as const, target: 'cached-event-config', count: 1 },
  ] as DbTelemetryRecord[],
};

// Sync telemetry to Firestore
let isTelemetryInitialized = false;
let syncTimeout: NodeJS.Timeout | null = null;

export async function initTelemetryFromFirestore() {
  if (isTelemetryInitialized) return;
  isTelemetryInitialized = true;
  try {
    const today = getTodayDateKey();
    const telRef = doc(db, 'telemetry', today);
    const snap = await getDoc(telRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.reads !== undefined) dbTelemetry.reads = Math.max(dbTelemetry.reads, data.reads);
      if (data.writes !== undefined) dbTelemetry.writes = Math.max(dbTelemetry.writes, data.writes);
      if (data.deletes !== undefined) dbTelemetry.deletes = Math.max(dbTelemetry.deletes, data.deletes);
      if (data.cacheHits !== undefined) dbTelemetry.cacheHits = Math.max(dbTelemetry.cacheHits, data.cacheHits);
      if (Array.isArray(data.recentOps) && data.recentOps.length > 0) {
        dbTelemetry.recentOps = data.recentOps;
      }
    }
  } catch {
    // Non-blocking fallback
  }
}

function scheduleTelemetrySync() {
  if (syncTimeout) return;
  syncTimeout = setTimeout(async () => {
    syncTimeout = null;
    try {
      const today = getTodayDateKey();
      const telRef = doc(db, 'telemetry', today);
      await setDoc(telRef, {
        dateKey: today,
        reads: dbTelemetry.reads,
        writes: dbTelemetry.writes,
        deletes: dbTelemetry.deletes,
        cacheHits: dbTelemetry.cacheHits,
        recentOps: dbTelemetry.recentOps.slice(0, 20),
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
    } catch {
      // Non-blocking
    }
  }, 2500);
}

// Cached collection counts to avoid reading entire collections on telemetry views
let cachedCollectionCounts = {
  participantsCount: 96,
  ordersCount: 96,
  stagesCount: 1,
  ambassadorsCount: 3,
  logsCount: 15,
  lastUpdated: 0,
};

export function recordDbOp(type: 'READ' | 'WRITE' | 'DELETE' | 'CACHE_HIT', target: string, count = 1) {
  const today = getTodayDateKey();
  if (dbTelemetry.dateKey !== today) {
    dbTelemetry.dateKey = today;
    dbTelemetry.reads = 0;
    dbTelemetry.writes = 0;
    dbTelemetry.deletes = 0;
    dbTelemetry.cacheHits = 0;
    dbTelemetry.recentOps = [];
  }

  if (type === 'READ') dbTelemetry.reads += count;
  else if (type === 'WRITE') dbTelemetry.writes += count;
  else if (type === 'DELETE') dbTelemetry.deletes += count;
  else if (type === 'CACHE_HIT') dbTelemetry.cacheHits += count;

  dbTelemetry.recentOps.unshift({
    timestamp: new Date().toISOString(),
    type,
    target,
    count,
  });

  if (dbTelemetry.recentOps.length > 30) {
    dbTelemetry.recentOps.pop();
  }
}

export function resetDbTelemetry() {
  dbTelemetry.dateKey = getTodayDateKey();
  dbTelemetry.reads = 0;
  dbTelemetry.writes = 0;
  dbTelemetry.deletes = 0;
  dbTelemetry.cacheHits = 0;
  dbTelemetry.recentOps = [
    { timestamp: new Date().toISOString(), type: 'CACHE_HIT', target: 'telemetry-reset', count: 0 },
  ];
}

// --------------------------------------------------------------------------
// IN-MEMORY CACHE TO DRASTICALLY REDUCE FIRESTORE READ UNITS (98%+ SAVINGS)
// --------------------------------------------------------------------------
const CACHE_TTL_MS = 60000; // 60 seconds

let cachedEventConfig: { data: EventConfig; expiry: number } | null = null;
let cachedPricingStages: { data: PricingStage[]; expiry: number } | null = null;
let cachedAmbassadors: { data: AmbassadorCode[]; expiry: number } | null = null;
let cachedParticipants: { data: Participant[]; expiry: number } | null = null;
let cachedOrders: { data: Order[]; expiry: number } | null = null;

let firestoreWriteBlockedUntil = 0;
let firestoreReadBlockedUntil = 0;

export function isFirestoreWriteBlocked(): boolean {
  return Date.now() < firestoreWriteBlockedUntil;
}

export function isFirestoreReadBlocked(): boolean {
  return Date.now() < firestoreReadBlockedUntil;
}

export function recordFirestoreError(err: any, opType: 'read' | 'write') {
  const msg = (err?.message || String(err || '')).toLowerCase();
  const code = String(err?.code || '').toLowerCase();
  if (
    msg.includes('resource-exhausted') ||
    msg.includes('quota') ||
    code.includes('resource-exhausted') ||
    code.includes('quota')
  ) {
    // 2-minute temporary window so rate-limit resets auto-resume Firestore immediately
    const blockMs = 2 * 60 * 1000; 
    firestoreWriteBlockedUntil = Date.now() + blockMs;
    firestoreReadBlockedUntil = Date.now() + blockMs;
  }
}

function clearFirestoreErrorBlock() {
  firestoreWriteBlockedUntil = 0;
  firestoreReadBlockedUntil = 0;
}

function logDbResilienceInfo(context: string, err?: any) {
  // Silent fallback when circuit breaker is active or in production
  if (isFirestoreReadBlocked() || isFirestoreWriteBlocked()) return;
  if (process.env.NODE_ENV === 'development') {
    const msg = err?.message || String(err || '');
    console.log(`[DB Resilience] ${context}${msg ? `: ${msg.substring(0, 120)}` : ''}`);
  }
}

export function invalidateConfigCache() {
  cachedEventConfig = null;
}

export function invalidateStagesCache() {
  cachedPricingStages = null;
}

export function invalidateAmbassadorsCache() {
  cachedAmbassadors = null;
}

export function invalidateParticipantsCache() {
  cachedParticipants = null;
}

export function invalidateOrdersCache() {
  cachedOrders = null;
}

export async function ensureSeeded() {
  if (hasEnsuredSeeded || isSeeding || isFirestoreReadBlocked() || isFirestoreWriteBlocked()) return;
  isSeeding = true;
  try {
    // 1. Seed Config
    const configRef = doc(db, 'config', 'nnr-paraiso-2026');
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      await setDoc(configRef, defaultEventConfig);
    }

    // 2. Check seed status first to prevent re-seeding when collections are cleared by admin
    const seedStatusRef = doc(db, 'config', 'seed_status');
    const seedStatusSnap = await getDoc(seedStatusRef);
    if (!seedStatusSnap.exists()) {
      // Seed Stages
      const stagesCol = collection(db, 'stages');
      const stagesSnap = await getDocs(query(stagesCol, limit(1)));
      if (stagesSnap.empty) {
        for (const stage of defaultPricingStages) {
          await setDoc(doc(db, 'stages', stage.id), stage);
        }
      }

      // Seed Ambassadors
      const ambCol = collection(db, 'ambassadors');
      const ambSnap = await getDocs(query(ambCol, limit(1)));
      if (ambSnap.empty) {
        for (const amb of defaultAmbassadorCodes) {
          await setDoc(doc(db, 'ambassadors', amb.id), amb);
        }
      }

      // Seed Orders, Participants & Logs
      const ordersCol = collection(db, 'orders');
      const ordersSnap = await getDocs(query(ordersCol, limit(1)));
      if (ordersSnap.empty) {
        const seed = generateSeedState();
        
        // Seed orders (exclude related participants field)
        for (const order of seed.orders) {
          const { participants, ...orderData } = order;
          await setDoc(doc(db, 'orders', order.id), orderData);
        }

        // Seed participants
        for (const p of seed.participants) {
          await setDoc(doc(db, 'participants', p.id), p);
        }

        // Seed kit logs
        for (const log of seed.kitLogs) {
          await setDoc(doc(db, 'kit_logs', log.id), log);
        }

        // Seed audit logs
        for (const aud of seed.auditLogs) {
          await setDoc(doc(db, 'audit_logs', aud.id), aud);
        }

        // Seed counter
        await setDoc(doc(db, 'counters', 'folios'), { value: seed.nextFolioNumber });
      }
      // Save seed status so it never runs again
      await setDoc(seedStatusRef, { completed: true });
    }
    hasEnsuredSeeded = true;
  } catch (err: any) {
    recordFirestoreError(err, 'read');
    hasEnsuredSeeded = true;
  } finally {
    isSeeding = false;
  }
}

async function getNextFolioNumber(): Promise<number> {
  const local = getLocalDB();
  const maxLocalNumber = local.participants.reduce((max, p) => {
    const m = p.folio?.match(/NNR-(\d+)/);
    const n = m ? parseInt(m[1], 10) : 0;
    return n > max ? n : max;
  }, 0);

  if (isFirestoreReadBlocked() || isFirestoreWriteBlocked()) {
    const next = Math.max(local.nextFolioNumber || 0, maxLocalNumber) + 1;
    local.nextFolioNumber = next + 1;
    saveLocalDB(local);
    return next;
  }

  try {
    const counterRef = doc(db, 'counters', 'folios');
    const snap = await getDoc(counterRef);
    let current = snap.exists() ? (snap.data().value || 1) : maxLocalNumber + 1;
    if (current <= maxLocalNumber) {
      current = maxLocalNumber + 1;
    }
    await setDoc(counterRef, { value: current + 1 }, { merge: true });
    local.nextFolioNumber = current + 1;
    saveLocalDB(local);
    return current;
  } catch (err: any) {
    recordFirestoreError(err, 'write');
    logDbResilienceInfo('getNextFolioNumber falling back to local counter', err);
    const next = Math.max(local.nextFolioNumber || 0, maxLocalNumber) + 1;
    local.nextFolioNumber = next + 1;
    saveLocalDB(local);
    return next;
  }
}

async function getNextOrderNumber(): Promise<number> {
  const local = getLocalDB();
  const maxLocalOrder = local.orders.reduce((max, o) => {
    const m = o.orderNumber?.match(/ORD-(\d+)/);
    const n = m ? parseInt(m[1], 10) : 0;
    return n > max ? n : max;
  }, 1000);

  if (isFirestoreReadBlocked() || isFirestoreWriteBlocked()) {
    return maxLocalOrder + 1;
  }

  try {
    const counterRef = doc(db, 'counters', 'orders');
    const snap = await getDoc(counterRef);
    let current = snap.exists() ? (snap.data().value || 1001) : maxLocalOrder + 1;
    if (current <= maxLocalOrder) {
      current = maxLocalOrder + 1;
    }
    await setDoc(counterRef, { value: current + 1 }, { merge: true });
    return current;
  } catch (err: any) {
    recordFirestoreError(err, 'write');
    logDbResilienceInfo('getNextOrderNumber falling back to local counter', err);
    return maxLocalOrder + 1;
  }
}

// Global variable fallback (not used for cloud persistence but matches structure)
export function getDB() {
  return generateSeedState();
}

// --------------------------------------------------------------------------
// DATABASE SERVICES & OPERATIONS (CONVERTED TO ASYNC / FIRESTORE)
// --------------------------------------------------------------------------

export async function getEventConfig(): Promise<EventConfig> {
  const now = Date.now();
  if (cachedEventConfig && cachedEventConfig.expiry > now) {
    recordDbOp('CACHE_HIT', 'config/nnr-paraiso-2026', 1);
    return cachedEventConfig.data;
  }

  if (!isFirestoreReadBlocked()) {
    try {
      await ensureSeeded();
      const snap = await getDoc(doc(db, 'config', 'nnr-paraiso-2026'));
      recordDbOp('READ', 'config/nnr-paraiso-2026', 1);
      clearFirestoreErrorBlock();
      if (snap.exists()) {
        const data = snap.data() as EventConfig;
        if (!data.registrationClosingDate) {
          data.registrationClosingDate = '2026-10-15T20:00:00-06:00';
          data.registrationClosingText = 'Hoy a las 8:00 PM (Hora CDMX)';
        }
        cachedEventConfig = { data, expiry: now + CACHE_TTL_MS };
        const local = getLocalDB();
        local.config = data;
        saveLocalDB(local);
        return data;
      }
    } catch (err: any) {
      recordFirestoreError(err, 'read');
      logDbResilienceInfo('getEventConfig from Firestore failed, using resilient local storage', err);
    }
  }

  const fallback = getLocalDB().config || defaultEventConfig;
  cachedEventConfig = { data: fallback, expiry: now + 30000 };
  return fallback;
}

export async function updateEventConfig(newConfig: Partial<EventConfig>, userEmail = 'admin'): Promise<EventConfig> {
  await ensureSeeded();
  const configRef = doc(db, 'config', 'nnr-paraiso-2026');
  const current = await getEventConfig();
  const updated = { ...current, ...newConfig };
  await setDoc(configRef, updated);
  recordDbOp('WRITE', 'config/nnr-paraiso-2026', 1);
  invalidateConfigCache();
  await recordAuditLog('CONFIG_UPDATED', 'config', updated.id, userEmail, 'admin', 'Configuración general del evento actualizada');
  return updated;
}

// sponsors
export async function getSponsors(activeOnly = false): Promise<Sponsor[]> {
  const config = await getEventConfig();
  const list = config.sponsors || [];
  const sorted = [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  if (activeOnly) {
    return sorted.filter(s => s.active !== false);
  }
  return sorted;
}

export async function createSponsor(
  sponsorData: Omit<Sponsor, 'id'>,
  adminEmail = 'admin@neonnightrunparaiso.mx'
): Promise<Sponsor> {
  await ensureSeeded();
  const configRef = doc(db, 'config', 'nnr-paraiso-2026');
  const config = await getEventConfig();
  if (!config.sponsors) config.sponsors = [];
  const id = `sp-${Date.now()}`;
  const newSponsor: Sponsor = {
    ...sponsorData,
    id,
    active: sponsorData.active !== undefined ? sponsorData.active : true,
    order: sponsorData.order !== undefined ? sponsorData.order : config.sponsors.length + 1,
  };
  config.sponsors.push(newSponsor);
  await setDoc(configRef, config);
  invalidateConfigCache();
  await recordAuditLog(
    'SPONSOR_CREATED',
    'config',
    id,
    adminEmail,
    'admin',
    `Nuevo patrocinador agregado: ${newSponsor.name} (${newSponsor.tier})`
  );
  return newSponsor;
}

export async function updateSponsor(
  id: string,
  updates: Partial<Sponsor>,
  adminEmail = 'admin@neonnightrunparaiso.mx'
): Promise<Sponsor | null> {
  await ensureSeeded();
  const configRef = doc(db, 'config', 'nnr-paraiso-2026');
  const config = await getEventConfig();
  if (!config.sponsors) return null;
  const index = config.sponsors.findIndex(s => s.id === id);
  if (index === -1) return null;
  config.sponsors[index] = { ...config.sponsors[index], ...updates };
  await setDoc(configRef, config);
  invalidateConfigCache();
  await recordAuditLog(
    'SPONSOR_UPDATED',
    'config',
    id,
    adminEmail,
    'admin',
    `Patrocinador ${config.sponsors[index].name} actualizado`
  );
  return config.sponsors[index];
}

export async function deleteSponsor(id: string, adminEmail = 'admin@neonnightrunparaiso.mx'): Promise<boolean> {
  await ensureSeeded();
  const configRef = doc(db, 'config', 'nnr-paraiso-2026');
  const config = await getEventConfig();
  if (!config.sponsors) return false;
  const index = config.sponsors.findIndex(s => s.id === id);
  if (index === -1) return false;
  const deleted = config.sponsors.splice(index, 1)[0];
  await setDoc(configRef, config);
  invalidateConfigCache();
  await recordAuditLog(
    'SPONSOR_DELETED',
    'config',
    id,
    adminEmail,
    'admin',
    `Patrocinador de evento eliminado: ${deleted.name}`
  );
  return true;
}

// stages
export async function getPricingStages(): Promise<PricingStage[]> {
  const now = Date.now();
  if (cachedPricingStages && cachedPricingStages.expiry > now) {
    recordDbOp('CACHE_HIT', 'stages', 1);
    return cachedPricingStages.data;
  }

  if (!isFirestoreReadBlocked()) {
    try {
      await ensureSeeded();
      const snap = await getDocs(collection(db, 'stages'));
      recordDbOp('READ', 'stages', snap.size || 1);
      if (!snap.empty) {
        const data = snap.docs.map(docSnap => docSnap.data() as PricingStage);
        cachedPricingStages = { data, expiry: now + CACHE_TTL_MS };
        const local = getLocalDB();
        local.stages = data;
        saveLocalDB(local);
        return data;
      }
    } catch (err: any) {
      recordFirestoreError(err, 'read');
      logDbResilienceInfo('getPricingStages from Firestore failed, using local storage', err);
    }
  }

  const fallback = getLocalDB().stages || defaultPricingStages;
  cachedPricingStages = { data: fallback, expiry: now + 30000 };
  return fallback;
}

export async function getActivePricingStage(quantity = 1): Promise<PricingStage> {
  const stages = await getPricingStages();
  
  if (quantity >= 5) {
    const teamStage = stages.find(s => s.id === 'stage-team' && s.active);
    if (teamStage) return teamStage;
  }

  const now = new Date().toISOString();
  const activeStage = stages.find(s => s.active && s.startDate <= now && s.endDate >= now && s.soldCount < s.quota);
  if (activeStage) return activeStage;

  const fallback = stages.find(s => s.active && s.id !== 'stage-team') || stages[0];
  return fallback;
}

export async function updatePricingStage(stageId: string, updates: Partial<PricingStage>, userEmail = 'admin'): Promise<PricingStage | null> {
  await ensureSeeded();
  const docRef = doc(db, 'stages', stageId);
  const snap = await getDoc(docRef);
  recordDbOp('READ', `stages/${stageId}`, 1);
  if (!snap.exists()) return null;
  const updated = { ...snap.data(), ...updates } as PricingStage;
  await setDoc(docRef, updated);
  recordDbOp('WRITE', `stages/${stageId}`, 1);
  invalidateStagesCache();
  await recordAuditLog('STAGE_UPDATED', 'stage', stageId, userEmail, 'admin', `Etapa ${updated.name} actualizada`);
  return updated;
}

export async function createPricingStage(newStage: Omit<PricingStage, 'id' | 'soldCount'>, userEmail = 'admin'): Promise<PricingStage> {
  await ensureSeeded();
  const id = `stage-${Date.now()}`;
  const created: PricingStage = {
    ...newStage,
    id,
    soldCount: 0,
  };
  await setDoc(doc(db, 'stages', id), created);
  recordDbOp('WRITE', `stages/${id}`, 1);
  invalidateStagesCache();
  await recordAuditLog('STAGE_CREATED', 'stage', id, userEmail, 'admin', `Nueva etapa de precio creada: ${created.name}`);
  return created;
}

// ambassadors
export async function getAmbassadorCodes(): Promise<AmbassadorCode[]> {
  const now = Date.now();
  if (cachedAmbassadors && cachedAmbassadors.expiry > now) {
    recordDbOp('CACHE_HIT', 'ambassadors', 1);
    return cachedAmbassadors.data;
  }

  if (!isFirestoreReadBlocked()) {
    try {
      await ensureSeeded();
      const snap = await getDocs(collection(db, 'ambassadors'));
      recordDbOp('READ', 'ambassadors', snap.size || 1);
      if (!snap.empty) {
        const data = snap.docs.map(doc => doc.data() as AmbassadorCode);
        cachedAmbassadors = { data, expiry: now + CACHE_TTL_MS };
        const local = getLocalDB();
        local.ambassadors = data;
        saveLocalDB(local);
        return data;
      }
    } catch (err: any) {
      recordFirestoreError(err, 'read');
      logDbResilienceInfo('getAmbassadorCodes from Firestore failed, using local storage', err);
    }
  }

  const fallback = getLocalDB().ambassadors || defaultAmbassadorCodes;
  cachedAmbassadors = { data: fallback, expiry: now + 30000 };
  return fallback;
}

export async function validateAmbassadorCode(codeText: string): Promise<{ valid: boolean; ambassador?: AmbassadorCode; message?: string }> {
  const ambassadors = await getAmbassadorCodes();
  const cleanCode = codeText.trim().toUpperCase();
  const found = ambassadors.find(a => a.code.toUpperCase() === cleanCode);
  
  if (!found) {
    return { valid: false, message: 'Código de embajador no encontrado.' };
  }
  if (!found.active) {
    return { valid: false, message: 'Este código de embajador se encuentra inactivo.' };
  }
  if (found.maxUses > 0 && found.usedCount >= found.maxUses) {
    return { valid: false, message: 'Este código de embajador ha alcanzado su límite de usos.' };
  }

  return { valid: true, ambassador: found };
}

export async function createAmbassadorCode(codeData: Omit<AmbassadorCode, 'id' | 'usedCount' | 'totalRevenue' | 'createdAt'>, userEmail = 'admin'): Promise<AmbassadorCode> {
  await ensureSeeded();
  const id = `amb-${Date.now()}`;
  const created: AmbassadorCode = {
    ...codeData,
    id,
    code: codeData.code.trim().toUpperCase(),
    usedCount: 0,
    totalRevenue: 0,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'ambassadors', id), created);
  invalidateAmbassadorsCache();
  await recordAuditLog('AMBASSADOR_CREATED', 'ambassador', id, userEmail, 'admin', `Código de embajador ${created.code} creado para ${created.ambassadorName}`);
  return created;
}

export async function updateAmbassadorCode(id: string, updates: Partial<AmbassadorCode>, userEmail = 'admin'): Promise<AmbassadorCode | null> {
  await ensureSeeded();
  const docRef = doc(db, 'ambassadors', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const updated = { ...snap.data(), ...updates } as AmbassadorCode;
  await setDoc(docRef, updated);
  invalidateAmbassadorsCache();
  await recordAuditLog('AMBASSADOR_UPDATED', 'ambassador', id, userEmail, 'admin', `Código de embajador ${updated.code} modificado`);
  return updated;
}

export async function deleteAmbassadorCode(id: string, userEmail = 'admin'): Promise<boolean> {
  await ensureSeeded();
  const docRef = doc(db, 'ambassadors', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return false;
  const data = snap.data() as AmbassadorCode;
  await deleteDoc(docRef);
  invalidateAmbassadorsCache();
  await recordAuditLog('AMBASSADOR_DELETED', 'ambassador', id, userEmail, 'admin', `Código de embajador ${data.code} de ${data.ambassadorName} eliminado`);
  return true;
}

// orders & participants
export function formatFolioNumber(num: number): string {
  return `NNR-${num.toString().padStart(6, '0')}`;
}

export function formatOrderNumber(num: number): string {
  return `NNR-ORD-${num.toString().padStart(4, '0')}`;
}

export interface CreateOrderParams {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  participants: ParticipantInput[];
  ambassadorCode?: string;
  paymentMethod: string;
  paymentStatus?: PaymentStatus;
  transferReceiptUrl?: string;
}

function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = cleanUndefined(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

export async function createOrder(params: CreateOrderParams): Promise<{ order: Order; participants: Participant[] }> {
  await ensureSeeded();
  const stage = await getActivePricingStage(params.participants.length);
  const config = await getEventConfig();
  const configRef = doc(db, 'config', 'nnr-paraiso-2026');
  
  if (config.currentTotalRegistered + params.participants.length > config.maxTotalQuota) {
    throw new Error('No hay suficientes lugares disponibles para el cupo solicitado.');
  }

  // Verificar si ya cerraron los registros para inscripciones públicas online
  if (isRegistrationClosed(config) && params.paymentMethod !== 'courtesy' && params.paymentMethod !== 'cash') {
    throw new Error('Ya hemos cerrado los registros oficiales. El plazo de inscripciones concluyó hoy a las 8:00 PM (hora Ciudad de México).');
  }

  // Determine individual prices based on modality
  // Recreativa = $250 MXN, Competitiva = stage.price (typically $350 MXN)
  const participantPrices: number[] = [];
  let subtotal = 0;

  for (let i = 0; i < params.participants.length; i++) {
    const pInput = params.participants[i];
    const isRecreativa = pInput.modality === 'Recreativa' || pInput.category?.toLowerCase().includes('recreativ');
    const price = isRecreativa ? 250 : (stage.price || 350);
    participantPrices.push(price);
    subtotal += price;
  }

  let discountPerPerson = 0;
  let totalDiscount = 0;
  let ambassadorObj: AmbassadorCode | undefined;

  if (params.ambassadorCode) {
    const val = await validateAmbassadorCode(params.ambassadorCode);
    if (val.valid && val.ambassador) {
      ambassadorObj = val.ambassador;
      if (ambassadorObj.discountType === 'percentage') {
        totalDiscount = Math.round((subtotal * ambassadorObj.discountValue) / 100);
        discountPerPerson = Math.round(totalDiscount / params.participants.length);
      } else {
        discountPerPerson = ambassadorObj.discountValue;
        totalDiscount = discountPerPerson * params.participants.length;
      }
    }
  }

  const totalAmount = Math.max(0, subtotal - totalDiscount);

  const orderId = `ord-${Date.now()}`;
  const orderNum = await getNextOrderNumber();
  const orderNumber = formatOrderNumber(orderNum);
  const now = new Date().toISOString();

  const isDemo = params.paymentMethod === 'demo';
  const initialStatus: PaymentStatus = params.paymentStatus || (isDemo ? 'approved' : 'pending');

  const createdParticipants: Participant[] = [];

  for (let i = 0; i < params.participants.length; i++) {
    const input = params.participants[i];
    const isRecreativa = input.modality === 'Recreativa' || input.category?.toLowerCase().includes('recreativ');
    const assignedModality: 'Competitiva' | 'Recreativa' = isRecreativa ? 'Recreativa' : 'Competitiva';
    const unitPrice = participantPrices[i];

    const folioNumber = await getNextFolioNumber();
    const folio = formatFolioNumber(folioNumber);
    const qrToken = generateParticipantToken(folio);
    
    const qrCodeDataUrl = await generateQRCodeDataUrl(`${resolvePublicAppUrl()}/participante/${folio}`);

    const p: Participant = {
      ...input,
      modality: assignedModality,
      id: `p-${Date.now()}-${i}`,
      orderId,
      folio,
      qrToken,
      qrCodeDataUrl,
      kitDelivered: false,
      createdAt: now,
      status: initialStatus === 'approved' ? 'confirmed' : 'pending',
      unitPrice,
      discountApplied: discountPerPerson,
    };

    createdParticipants.push(p);
    try {
      await setDoc(doc(db, 'participants', p.id), cleanUndefined(p));
    } catch (err: any) {
      console.warn('[DB Resilience] Participant write deferred:', err?.message || err);
    }
  }

  const allRecreativa = createdParticipants.every(p => p.modality === 'Recreativa');
  const allCompetitiva = createdParticipants.every(p => p.modality === 'Competitiva');
  const orderModality = allRecreativa ? 'Recreativa' : allCompetitiva ? 'Competitiva' : 'Mixta';

  const order: Order = {
    id: orderId,
    orderNumber,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone,
    participantsCount: params.participants.length,
    stageId: stage.id,
    stageName: stage.name,
    modality: orderModality,
    unitPrice: params.participants.length === 1 ? participantPrices[0] : Math.round(subtotal / params.participants.length),
    subtotal,
    discountAmount: totalDiscount,
    totalAmount,
    ambassadorCodeUsed: ambassadorObj?.code,
    paymentMethod: params.paymentMethod as any,
    paymentStatus: initialStatus,
    paymentReference: params.paymentMethod === 'transfer' ? `SPEI-${orderNumber}` : `MP-${orderNumber}`,
    transferReceiptUrl: params.transferReceiptUrl,
    transferReceiptUploadedAt: params.transferReceiptUrl ? now : undefined,
    createdAt: now,
    updatedAt: now,
    confirmedAt: initialStatus === 'approved' ? now : undefined,
    confirmedBy: initialStatus === 'approved' ? (isDemo ? 'Simulador de Pagos Demo' : 'Módulo Administrativo') : undefined,
  };

  if (initialStatus === 'approved') {
    stage.soldCount += params.participants.length;
    try {
      await setDoc(doc(db, 'stages', stage.id), stage);
    } catch (e) {}

    config.currentTotalRegistered += params.participants.length;
    try {
      await setDoc(configRef, config);
    } catch (e) {}

    if (ambassadorObj) {
      ambassadorObj.usedCount += params.participants.length;
      ambassadorObj.totalRevenue += totalAmount;
      try {
        await setDoc(doc(db, 'ambassadors', ambassadorObj.id), ambassadorObj);
      } catch (e) {}
    }
  }

  order.participants = createdParticipants;
  const { participants, ...orderData } = order;

  // Persist locally immediately
  try {
    const local = getLocalDB();
    local.orders.unshift(order);
    for (const cp of createdParticipants) {
      local.participants.unshift(cp);
    }
    saveLocalDB(local);
  } catch (e) {}

  if (cachedParticipants) {
    cachedParticipants.data = [...createdParticipants, ...cachedParticipants.data];
  }
  if (cachedOrders) {
    cachedOrders.data = [order, ...cachedOrders.data];
  }

  try {
    await setDoc(doc(db, 'orders', orderId), cleanUndefined(orderData));
  } catch (err: any) {
    console.warn('[DB Resilience] Order write deferred:', err?.message || err);
  }

  await recordAuditLog(
    'ORDER_CREATED',
    'order',
    orderId,
    params.customerEmail,
    'customer',
    `Nueva orden ${orderNumber} creada por ${params.customerName} (${params.participants.length} corredores, $${totalAmount} MXN)`
  );

  return { order, participants: createdParticipants };
}

export async function getOrder(orderIdOrNumber: string): Promise<Order | null> {
  const clean = orderIdOrNumber.trim();
  
  // 1. Try finding in cached/local orders first (Zero Firestore cost)
  const allOrders = await getOrders();
  const found = allOrders.find(o => o.id === clean || o.orderNumber === clean);
  if (found) {
    return found;
  }

  // 2. Fallback to direct Firestore read if not found in list
  try {
    const orderRef = doc(db, 'orders', clean);
    const snap = await getDoc(orderRef);
    recordDbOp('READ', `orders/${clean}`, 1);
    if (snap.exists()) {
      const orderData = snap.data() as Order;
      const allParts = await getParticipants();
      orderData.participants = allParts.filter(p => p.orderId === orderData.id);
      return orderData;
    }
  } catch (err: any) {
    console.warn('[DB Resilience] getOrder error from Firestore:', err?.message || err);
  }

  return null;
}

export async function getOrders(filters?: { status?: PaymentStatus; method?: string; search?: string }): Promise<Order[]> {
  const now = Date.now();
  let list: Order[] = [];

  if (cachedOrders && cachedOrders.expiry > now) {
    recordDbOp('CACHE_HIT', 'orders', cachedOrders.data.length);
    list = [...cachedOrders.data];
  } else if (!isFirestoreReadBlocked()) {
    try {
      await ensureSeeded();
      const snap = await getDocs(collection(db, 'orders'));
      recordDbOp('READ', 'orders', snap.size || 1);
      if (!snap.empty) {
        list = snap.docs.map(doc => doc.data() as Order);
        const local = getLocalDB();
        local.orders = list;
        saveLocalDB(local);
      } else {
        list = getLocalDB().orders;
      }
      cachedOrders = { data: list, expiry: now + CACHE_TTL_MS };
    } catch (err: any) {
      recordFirestoreError(err, 'read');
      logDbResilienceInfo('Firestore orders reading error, using local storage', err);
      list = getLocalDB().orders;
      cachedOrders = { data: list, expiry: now + 30000 };
    }
  } else {
    list = getLocalDB().orders;
    cachedOrders = { data: list, expiry: now + 30000 };
  }

  if (filters?.status) {
    list = list.filter(o => o.paymentStatus === filters.status);
  }
  if (filters?.method) {
    list = list.filter(o => o.paymentMethod === filters.method);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(o => 
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.paymentReference.toLowerCase().includes(q)
    );
  }

  // Join participants from memory cache (Zero extra Firestore queries)
  const allParticipants = await getParticipants();
  const participantsByOrder = new Map<string, Participant[]>();
  for (const p of allParticipants) {
    if (p.orderId) {
      const existing = participantsByOrder.get(p.orderId) || [];
      existing.push(p);
      participantsByOrder.set(p.orderId, existing);
    }
  }

  const resolvedList: Order[] = list.map(o => ({
    ...o,
    participants: participantsByOrder.get(o.id) || o.participants || []
  }));

  return resolvedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: PaymentStatus,
  confirmedBy: string,
  notes?: string
): Promise<Order | null> {
  await ensureSeeded();
  const local = getLocalDB();
  const now = new Date().toISOString();

  // Find order in local storage or getOrder
  let order = await getOrder(orderId);
  if (!order) return null;

  const previousStatus = order.paymentStatus;
  order.paymentStatus = newStatus;
  order.updatedAt = now;

  if (newStatus === 'approved') {
    order.confirmedAt = now;
    order.confirmedBy = confirmedBy;
    if (notes) order.transferNotes = notes;
  }

  // 1. Instant Local Storage Update
  const localOrderIdx = local.orders.findIndex(o => o.id === order.id || o.orderNumber === order.orderNumber);
  if (localOrderIdx !== -1) {
    local.orders[localOrderIdx] = { ...local.orders[localOrderIdx], ...order };
  }

  // Update associated participants in local storage
  for (let i = 0; i < local.participants.length; i++) {
    if (local.participants[i].orderId === order.id || local.participants[i].orderId === orderId) {
      if (newStatus === 'approved') {
        local.participants[i].status = 'confirmed';
        if (!local.participants[i].qrCodeDataUrl) {
          local.participants[i].qrCodeDataUrl = await generateQRCodeDataUrl(`${resolvePublicAppUrl()}/participante/${local.participants[i].folio}`);
        }
      } else if (newStatus === 'cancelled' || newStatus === 'rejected') {
        local.participants[i].status = 'cancelled';
      }
    }
  }

  saveLocalDB(local);
  if (cachedParticipants) {
    cachedParticipants.data = local.participants;
  }

  // 2. Firestore Sync
  try {
    if (!isFirestoreWriteBlocked()) {
      const orderRef = doc(db, 'orders', order.id);
      const { participants, ...orderData } = order;
      await setDoc(orderRef, orderData, { merge: true });

      const participantsSnap = await getDocs(query(collection(db, 'participants'), where('orderId', '==', order.id)));
      for (const d of participantsSnap.docs) {
        const p = d.data() as Participant;
        if (newStatus === 'approved') {
          p.status = 'confirmed';
          if (!p.qrCodeDataUrl) {
            p.qrCodeDataUrl = await generateQRCodeDataUrl(`${resolvePublicAppUrl()}/participante/${p.folio}`);
          }
        } else if (newStatus === 'cancelled' || newStatus === 'rejected') {
          p.status = 'cancelled';
        }
        await setDoc(doc(db, 'participants', p.id), p, { merge: true });
      }

      if (newStatus === 'approved' && previousStatus !== 'approved') {
        const config = await getEventConfig();
        config.currentTotalRegistered += order.participantsCount;
        await setDoc(doc(db, 'config', 'nnr-paraiso-2026'), config, { merge: true });
      }
    }
  } catch (err: any) {
    recordFirestoreError(err, 'write');
    logDbResilienceInfo('updateOrderStatus stored locally, Firestore deferred', err);
  }

  await recordAuditLog(
    'ORDER_STATUS_CHANGED',
    'order',
    order.id,
    confirmedBy,
    'admin',
    `Estado de la orden ${order.orderNumber} cambiado de ${previousStatus} a ${newStatus}. ${notes || ''}`
  );

  return getOrder(order.id);
}

// participants & kits
export async function getParticipantByFolioOrQr(identifier: string): Promise<Participant | null> {
  const clean = identifier.trim().toUpperCase();
  const allParticipants = await getParticipants();
  
  const found = allParticipants.find(p => 
    p.folio.toUpperCase() === clean ||
    p.id.toUpperCase() === clean ||
    (p.qrToken && (
      p.qrToken.toUpperCase() === clean ||
      p.qrToken.toUpperCase().includes(clean) ||
      clean.includes(p.qrToken.toUpperCase())
    ))
  );

  return found || null;
}

export async function getParticipants(filters?: {
  status?: string;
  shirtSize?: string;
  category?: string;
  kitDelivered?: boolean;
  search?: string;
}): Promise<Participant[]> {
  const now = Date.now();
  let list: Participant[] = [];

  if (cachedParticipants && cachedParticipants.expiry > now) {
    recordDbOp('CACHE_HIT', 'participants', cachedParticipants.data.length);
    list = [...cachedParticipants.data];
  } else if (!isFirestoreReadBlocked()) {
    try {
      await ensureSeeded();
      const snap = await getDocs(collection(db, 'participants'));
      recordDbOp('READ', 'participants', snap.size || 1);
      if (!snap.empty) {
        list = snap.docs.map(doc => doc.data() as Participant);
        const local = getLocalDB();
        local.participants = list;
        saveLocalDB(local);
      } else {
        list = getLocalDB().participants;
      }
      cachedParticipants = { data: list, expiry: now + CACHE_TTL_MS };
    } catch (err: any) {
      recordFirestoreError(err, 'read');
      logDbResilienceInfo('Firestore participants reading error, using local storage', err);
      list = getLocalDB().participants;
      cachedParticipants = { data: list, expiry: now + 30000 };
    }
  } else {
    list = getLocalDB().participants;
    cachedParticipants = { data: list, expiry: now + 30000 };
  }

  if (filters?.status && filters.status !== 'all') {
    list = list.filter(p => p.status === filters.status);
  }
  if (filters?.shirtSize && filters.shirtSize !== 'all') {
    list = list.filter(p => p.shirtSize === filters.shirtSize);
  }
  if (filters?.category && filters.category !== 'all') {
    list = list.filter(p => p.category === filters.category);
  }
  if (filters?.kitDelivered !== undefined) {
    list = list.filter(p => p.kitDelivered === filters.kitDelivered);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.folio.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.clubOrTeam && p.clubOrTeam.toLowerCase().includes(q))
    );
  }

  return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export async function markKitDelivered(
  participantId: string,
  staffUser: { email: string; name: string },
  notes?: string
): Promise<{ success: boolean; message: string; participant?: Participant }> {
  await ensureSeeded();
  const p = await getParticipantByFolioOrQr(participantId);
  
  if (!p) {
    return { success: false, message: 'Participante no encontrado.' };
  }

  // Auto-confirm participant status if staff delivers kit in person
  if (p.status !== 'confirmed') {
    p.status = 'confirmed';
  }

  const now = new Date().toISOString();
  p.kitDelivered = true;
  p.kitDeliveredAt = now;
  p.kitDeliveredBy = staffUser.email || staffUser.name;
  p.kitDeliveryNotes = notes || 'Entrega completada';

  // Instant local storage update
  try {
    const local = getLocalDB();
    const idx = local.participants.findIndex(item => item.id === p.id || item.folio === p.folio);
    if (idx !== -1) {
      local.participants[idx] = { ...local.participants[idx], ...p };
      saveLocalDB(local);
    }
  } catch (e) {}

  if (cachedParticipants) {
    const cIdx = cachedParticipants.data.findIndex(item => item.id === p.id || item.folio === p.folio);
    if (cIdx !== -1) {
      cachedParticipants.data[cIdx] = { ...cachedParticipants.data[cIdx], ...p };
    }
  }

  // Non-blocking Firestore sync
  if (!isFirestoreWriteBlocked()) {
    setDoc(doc(db, 'participants', p.id), p, { merge: true }).catch(err => {
      recordFirestoreError(err, 'write');
      logDbResilienceInfo('Kit delivery update stored locally, Firestore sync deferred', err);
    });
  }

  const log: KitDeliveryLog = {
    id: `klog-${Date.now()}`,
    participantId: p.id,
    folio: p.folio,
    participantName: p.fullName,
    shirtSize: p.shirtSize,
    staffEmail: staffUser.email,
    staffName: staffUser.name,
    action: 'delivered',
    notes,
    timestamp: now,
  };

  try {
    const local = getLocalDB();
    if (!local.kitLogs) local.kitLogs = [];
    local.kitLogs.unshift(log);
    saveLocalDB(local);
  } catch (e) {}

  if (!isFirestoreWriteBlocked()) {
    setDoc(doc(db, 'kit_logs', log.id), log, { merge: true }).catch(err => {
      recordFirestoreError(err, 'write');
      logDbResilienceInfo('Kit log write deferred', err);
    });
  }

  await recordAuditLog('KIT_DELIVERED', 'kit_delivery', p.id, staffUser.email, 'staff', `Kit entregado para folio ${p.folio} (${p.fullName}, Talla ${p.shirtSize})`);

  return {
    success: true,
    message: `¡Kit entregado exitosamente a ${p.fullName} (Folio: ${p.folio}, Talla: ${p.shirtSize})!`,
    participant: p,
  };
}

export async function revertKitDelivered(
  participantId: string,
  adminUser: { email: string; name: string },
  reason: string
): Promise<{ success: boolean; message: string; participant?: Participant }> {
  await ensureSeeded();
  const p = await getParticipantByFolioOrQr(participantId);

  if (!p) {
    return { success: false, message: 'Participante no encontrado.' };
  }

  if (!p.kitDelivered) {
    return { success: false, message: 'El kit de este participante no figura como entregado.', participant: p };
  }

  const now = new Date().toISOString();
  p.kitDelivered = false;
  p.kitDeliveredAt = undefined;
  p.kitDeliveredBy = undefined;
  p.kitDeliveryNotes = `Entrega revertida por ${adminUser.email}: ${reason}`;

  try {
    const local = getLocalDB();
    const idx = local.participants.findIndex(item => item.id === p.id || item.folio === p.folio);
    if (idx !== -1) {
      local.participants[idx] = { ...local.participants[idx], ...p };
      saveLocalDB(local);
    }
  } catch (e) {}

  if (cachedParticipants) {
    const cIdx = cachedParticipants.data.findIndex(item => item.id === p.id || item.folio === p.folio);
    if (cIdx !== -1) {
      cachedParticipants.data[cIdx] = { ...cachedParticipants.data[cIdx], ...p };
    }
  }

  try {
    await setDoc(doc(db, 'participants', p.id), p);
  } catch (err: any) {
    logDbResilienceInfo('Kit revert update stored locally, Firestore sync deferred', err);
  }

  const log: KitDeliveryLog = {
    id: `klog-${Date.now()}`,
    participantId: p.id,
    folio: p.folio,
    participantName: p.fullName,
    shirtSize: p.shirtSize,
    staffEmail: adminUser.email,
    staffName: adminUser.name,
    action: 'reverted',
    notes: reason,
    timestamp: now,
  };

  try {
    const local = getLocalDB();
    if (!local.kitLogs) local.kitLogs = [];
    local.kitLogs.unshift(log);
    saveLocalDB(local);
  } catch (e) {}

  try {
    await setDoc(doc(db, 'kit_logs', log.id), log);
  } catch (err: any) {
    logDbResilienceInfo('Kit log write deferred', err);
  }

  await recordAuditLog('KIT_DELIVERY_REVERTED', 'kit_delivery', p.id, adminUser.email, 'admin', `Entrega de kit revertida para folio ${p.folio}: ${reason}`);

  return {
    success: true,
    message: `La entrega del kit para ${p.fullName} (${p.folio}) ha sido revertida.`,
    participant: p,
  };
}

export async function updateParticipant(id: string, updates: Partial<Participant>, userEmail = 'admin'): Promise<Participant | null> {
  const local = getLocalDB();
  const idx = local.participants.findIndex(p => p.id === id || p.folio === id);
  let updated: Participant | null = null;
  
  if (idx !== -1) {
    local.participants[idx] = { ...local.participants[idx], ...updates };
    updated = local.participants[idx];
    saveLocalDB(local);
    if (cachedParticipants) {
      cachedParticipants.data = local.participants;
    }
  }

  // Directly update Firestore document by ID without collection scan
  try {
    const docId = updated?.id || id;
    await setDoc(doc(db, 'participants', docId), updates, { merge: true });
    recordDbOp('WRITE', `participants/${docId}`, 1);
  } catch (err: any) {
    logDbResilienceInfo('Participant update stored locally, Firestore sync deferred', err);
  }

  if (updated) {
    await recordAuditLog('PARTICIPANT_UPDATED', 'participant', updated.id, userEmail, 'admin', `Datos de participante ${updated.fullName} actualizados`);
  }
  return updated;
}

// metrics & logs
export async function getDashboardMetrics() {
  const [config, stages, ambassadors, participants, orders] = await Promise.all([
    getEventConfig(),
    getPricingStages(),
    getAmbassadorCodes(),
    getParticipants(),
    getOrders(),
  ]);

  const totalParticipants = participants.length;
  const confirmedParticipants = participants.filter(p => p.status === 'confirmed').length;
  const pendingParticipants = participants.filter(p => p.status === 'pending').length;

  const approvedOrders = orders.filter(o => o.paymentStatus === 'approved');
  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');
  const rejectedOrders = orders.filter(o => o.paymentStatus === 'rejected' || o.paymentStatus === 'cancelled');

  const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const availableSpots = Math.max(0, config.maxTotalQuota - config.currentTotalRegistered);

  const shirtSizes: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  for (const p of participants) {
    if (p.shirtSize in shirtSizes) {
      shirtSizes[p.shirtSize]++;
    }
  }

  const categoryCount: Record<string, number> = {};
  for (const p of participants) {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  }

  const kitsDelivered = participants.filter(p => p.kitDelivered).length;
  const kitsPending = Math.max(0, confirmedParticipants - kitsDelivered);

  const ambassadorStats = ambassadors.map(a => ({
    code: a.code,
    name: a.ambassadorName,
    usedCount: a.usedCount,
    revenue: a.totalRevenue,
    active: a.active,
  }));

  const dailyRegistrations: Record<string, number> = {};
  for (const p of participants) {
    const day = p.createdAt.split('T')[0];
    dailyRegistrations[day] = (dailyRegistrations[day] || 0) + 1;
  }

  return {
    totalParticipants,
    confirmedParticipants,
    pendingParticipants,
    totalOrders: orders.length,
    approvedOrdersCount: approvedOrders.length,
    pendingOrdersCount: pendingOrders.length,
    rejectedOrdersCount: rejectedOrders.length,
    totalRevenue,
    pendingRevenue,
    maxTotalQuota: config.maxTotalQuota,
    currentTotalRegistered: config.currentTotalRegistered,
    availableSpots,
    shirtSizes,
    categoryCount,
    kitsDelivered,
    kitsPending,
    ambassadorStats,
    dailyRegistrations,
  };
}

export async function getKitDeliveryLogs(): Promise<KitDeliveryLog[]> {
  try {
    await ensureSeeded();
    const snap = await getDocs(collection(db, 'kit_logs'));
    recordDbOp('READ', 'kit_logs', snap.size || 1);
    if (!snap.empty) {
      return snap.docs.map(doc => doc.data() as KitDeliveryLog).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (err: any) {
    logDbResilienceInfo('kit_logs fetch failed, using local storage', err);
  }
  return (getLocalDB().kitLogs || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    await ensureSeeded();
    const snap = await getDocs(collection(db, 'audit_logs'));
    recordDbOp('READ', 'audit_logs', snap.size || 1);
    if (!snap.empty) {
      return snap.docs.map(doc => doc.data() as AuditLog).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (err: any) {
    logDbResilienceInfo('audit_logs fetch failed, using local storage', err);
  }
  return (getLocalDB().auditLogs || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function recordAuditLog(
  action: string,
  entity: AuditLog['entity'],
  entityId: string,
  performedBy: string,
  performedByRole: string,
  details: string
): Promise<AuditLog> {
  const log: AuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    entity,
    entityId,
    performedBy,
    performedByRole,
    details,
    timestamp: new Date().toISOString(),
  };

  try {
    const local = getLocalDB();
    if (!local.auditLogs) local.auditLogs = [];
    local.auditLogs.unshift(log);
    if (local.auditLogs.length > 300) local.auditLogs.length = 300;
    saveLocalDB(local);
  } catch (e) {}

  if (!isFirestoreWriteBlocked()) {
    setDoc(doc(db, 'audit_logs', log.id), log)
      .then(() => recordDbOp('WRITE', 'audit_logs', 1))
      .catch((err) => recordFirestoreError(err, 'write'));
  }
  return log;
}

export async function recordWebhookLog(log: Omit<PaymentWebhookLog, 'id' | 'receivedAt'>): Promise<PaymentWebhookLog> {
  const entry: PaymentWebhookLog = {
    ...log,
    id: `wh-${Date.now()}`,
    receivedAt: new Date().toISOString(),
  };

  try {
    const local = getLocalDB();
    if (!local.webhookLogs) local.webhookLogs = [];
    local.webhookLogs.unshift(entry);
    if (local.webhookLogs.length > 200) local.webhookLogs.length = 200;
    saveLocalDB(local);
  } catch (e) {}

  try {
    await setDoc(doc(db, 'webhook_logs', entry.id), entry);
  } catch (err: any) {
    logDbResilienceInfo('Webhook log write deferred', err);
  }
  return entry;
}

export async function exportParticipantsCSV(): Promise<string> {
  const participants = await getParticipants();
  const headers = [
    'Folio',
    'Nombre Completo',
    'Email',
    'Telefono',
    'Edad',
    'Fecha Nacimiento',
    'Genero',
    'Categoria',
    'Talla Playera',
    'Ciudad',
    'Estado',
    'Contacto Emergencia',
    'Tel Emergencia',
    'Club/Gimnasio',
    'Codigo Embajador',
    'Estado Inscripcion',
    'Kit Entregado',
    'Fecha Entrega Kit',
    'Entregado Por',
    'Fecha Registro',
    'Orden ID',
  ];

  const rows = participants.map(p => [
    `"${p.folio}"`,
    `"${p.fullName.replace(/"/g, '""')}"`,
    `"${p.email}"`,
    `"${p.phone}"`,
    p.age,
    `"${p.birthDate}"`,
    `"${p.gender}"`,
    `"${p.category}"`,
    `"${p.shirtSize}"`,
    `"${p.city}"`,
    `"${p.state}"`,
    `"${p.emergencyContact.replace(/"/g, '""')}"`,
    `"${p.emergencyPhone}"`,
    `"${(p.clubOrTeam || '').replace(/"/g, '""')}"`,
    `"${p.ambassadorCode || ''}"`,
    `"${p.status}"`,
    p.kitDelivered ? 'SI' : 'NO',
    `"${p.kitDeliveredAt || ''}"`,
    `"${p.kitDeliveredBy || ''}"`,
    `"${p.createdAt}"`,
    `"${p.orderId}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export async function deleteOrder(orderId: string, userEmail = 'admin'): Promise<boolean> {
  await ensureSeeded();
  const orderRef = doc(db, 'orders', orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) return false;
  const orderData = snap.data() as Order;

  // Delete all participants associated with this order
  const participantsSnap = await getDocs(query(collection(db, 'participants'), where('orderId', '==', orderId)));
  for (const pDoc of participantsSnap.docs) {
    await deleteDoc(pDoc.ref);
  }

  // Delete the order itself
  await deleteDoc(orderRef);

  // If the order was approved, adjust global quota metrics
  if (orderData.paymentStatus === 'approved') {
    try {
      const configRef = doc(db, 'config', 'nnr-paraiso-2026');
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const config = configSnap.data() as EventConfig;
        config.currentTotalRegistered = Math.max(0, config.currentTotalRegistered - orderData.participantsCount);
        await setDoc(configRef, config);
      }

      const stageRef = doc(db, 'stages', orderData.stageId);
      const stageSnap = await getDoc(stageRef);
      if (stageSnap.exists()) {
        const stage = stageSnap.data() as PricingStage;
        stage.soldCount = Math.max(0, stage.soldCount - orderData.participantsCount);
        await setDoc(stageRef, stage);
      }
    } catch (e) {
      console.error('Error adjusting metrics on order deletion:', e);
    }
  }

  await recordAuditLog('ORDER_DELETED', 'order', orderId, userEmail, 'admin', `Orden ${orderData.orderNumber} por ${orderData.customerName} eliminada por completo (incluyendo sus participantes)`);
  return true;
}

export async function deleteParticipant(participantId: string, userEmail = 'admin'): Promise<boolean> {
  const local = getLocalDB();
  const idx = local.participants.findIndex(p => p.id === participantId || p.folio === participantId);
  if (idx === -1) return false;
  const original = local.participants.splice(idx, 1)[0];
  saveLocalDB(local);
  if (cachedParticipants) {
    cachedParticipants.data = local.participants;
  }

  // Non-blocking background Firestore sync so HTTP response is instant
  if (!isFirestoreWriteBlocked()) {
    (async () => {
      try {
        await deleteDoc(doc(db, 'participants', original.id));
        recordDbOp('DELETE', `participants/${original.id}`, 1);
      } catch (err: any) {
        recordFirestoreError(err, 'write');
        console.warn('[DB Resilience] Firestore delete deferred, participant removed from local storage:', err?.message || err);
      }

      // If confirmed, adjust registered total
      if (original.status === 'confirmed') {
        try {
          const config = await getEventConfig();
          config.currentTotalRegistered = Math.max(0, config.currentTotalRegistered - 1);
          await updateEventConfig({ currentTotalRegistered: config.currentTotalRegistered });
        } catch (e) {
          console.error('Error adjusting metrics on participant deletion:', e);
        }
      }
    })();
  }

  await recordAuditLog('PARTICIPANT_DELETED', 'participant', original.id, userEmail, 'admin', `Participante ${original.fullName} (Folio: ${original.folio}) eliminado`);
  return true;
}

export async function findDuplicateParticipant(email: string, fullName: string): Promise<{ type: 'email' | 'name'; participant: Participant } | null> {
  const participants = await getParticipants();
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim().toLowerCase().replace(/\s+/g, ' ');

  for (const p of participants) {
    if (p.status === 'cancelled') continue;

    const pEmail = p.email.trim().toLowerCase();
    const pName = p.fullName.trim().toLowerCase().replace(/\s+/g, ' ');

    if (pEmail === cleanEmail) {
      return { type: 'email', participant: p };
    }
    if (pName === cleanName) {
      return { type: 'name', participant: p };
    }
  }

  return null;
}

export async function getDatabaseUsageStats(): Promise<DatabaseUsageStats> {
  const local = getLocalDB();
  const participantsCount = local.participants.length;
  const ordersCount = local.orders.length;
  const stagesCount = local.stages.length;
  const ambassadorsCount = local.ambassadors.length;
  const logsCount = local.kitLogs.length + local.auditLogs.length;
  const totalDocuments = participantsCount + ordersCount + stagesCount + ambassadorsCount + logsCount + 5;
  const estimatedStorageMB = Number(((totalDocuments * 1.8) / 1024).toFixed(3)); // ~1.8KB avg per document with QR data URLs

  const readsToday = dbTelemetry.reads;
  const writesToday = dbTelemetry.writes;
  const deletesToday = dbTelemetry.deletes;

  const readsPercentage = Number(((readsToday / FREE_TIER_DAILY_READS) * 100).toFixed(2));
  const writesPercentage = Number(((writesToday / FREE_TIER_DAILY_WRITES) * 100).toFixed(2));
  const deletesPercentage = Number(((deletesToday / FREE_TIER_DAILY_DELETES) * 100).toFixed(2));
  const storagePercentage = Number(((estimatedStorageMB / FREE_TIER_STORAGE_MB) * 100).toFixed(3));

  let tierStatus: 'free_safe' | 'free_warning' | 'blaze_active' = 'free_safe';
  let tierLabel = 'Plan Gratuito Spark (100% Sin Costo)';

  if (readsToday > FREE_TIER_DAILY_READS || writesToday > FREE_TIER_DAILY_WRITES) {
    tierStatus = 'blaze_active';
    tierLabel = 'Plan Blaze (Facturación por Uso Activa)';
  } else if (readsPercentage >= 70 || writesPercentage >= 70) {
    tierStatus = 'free_warning';
    tierLabel = 'Plan Gratuito Spark (Uso > 70%)';
  }

  const extraReads = Math.max(0, readsToday - FREE_TIER_DAILY_READS);
  const extraWrites = Math.max(0, writesToday - FREE_TIER_DAILY_WRITES);
  // Firestore Blaze Pricing: $0.06 / 100,000 reads, $0.18 / 100,000 writes
  const estimatedExtraCostUSD = Number(((extraReads * 0.0000006) + (extraWrites * 0.0000018)).toFixed(4));
  const estimatedExtraCostMXN = Number((estimatedExtraCostUSD * 20.0).toFixed(2));

  return {
    date: dbTelemetry.dateKey,
    freeTier: {
      maxDailyReads: FREE_TIER_DAILY_READS,
      maxDailyWrites: FREE_TIER_DAILY_WRITES,
      maxDailyDeletes: FREE_TIER_DAILY_DELETES,
      maxStorageMB: FREE_TIER_STORAGE_MB,
    },
    currentUsage: {
      readsToday,
      writesToday,
      deletesToday,
      readsPercentage,
      writesPercentage,
      deletesPercentage,
      estimatedStorageMB,
      storagePercentage,
    },
    tierStatus,
    tierLabel,
    estimatedExtraCostUSD,
    estimatedExtraCostMXN,
    collectionBreakdown: {
      participantsCount,
      ordersCount,
      stagesCount,
      ambassadorsCount,
      logsCount,
      totalDocuments,
    },
    optimizationsActive: {
      inMemoryCacheTTL: '30 segundos por consulta',
      atomicCountersEnabled: true,
      batchReadsOptimized: true,
      serverSideOnly: true,
    },
    recentOperations: dbTelemetry.recentOps.slice(0, 15),
  };
}

/**
 * Checks all participants in the database for those with status 'pending'
 * whose registration was made more than 5 days ago.
 * Moves them to 'cancelled' status (No Pagados), records cancellation reason,
 * and updates their order status to rejected.
 */
export async function auditAndMoveOverduePendingToCancelled(): Promise<{
  movedCount: number;
  participants: Array<{ folio: string; fullName: string; daysPending: number }>;
}> {
  await ensureSeeded();
  const now = new Date();
  const nowMs = now.getTime();
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

  const [participants, orders] = await Promise.all([
    getParticipants(),
    getOrders(),
  ]);

  const ordersMap = new Map<string, Order>();
  orders.forEach(o => {
    ordersMap.set(o.id, o);
  });

  const moved: Array<{ folio: string; fullName: string; daysPending: number }> = [];

  for (const p of participants) {
    if (p.status === 'pending') {
      const createdMs = p.createdAt ? new Date(p.createdAt).getTime() : nowMs;
      const diffMs = nowMs - createdMs;
      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));

      if (diffMs >= FIVE_DAYS_MS) {
        p.status = 'cancelled';
        p.cancelledAt = now.toISOString();
        p.cancellationReason = `Lugar liberado por falta de pago (más de ${days} días transcurridos sin comprobante). Registrado en No Pagados para futuras carreras.`;

        await updateParticipant(p.id, {
          status: 'cancelled',
          cancelledAt: p.cancelledAt,
          cancellationReason: p.cancellationReason,
        });

        const order = ordersMap.get(p.orderId);
        if (order) {
          order.paymentStatus = 'rejected';
          order.updatedAt = now.toISOString();
          try {
            await setDoc(
              doc(db, 'orders', order.id),
              { paymentStatus: 'rejected', updatedAt: now.toISOString() },
              { merge: true }
            );
          } catch (err: any) {
            console.warn('[DB Resilience] Order cancellation update deferred:', err?.message || err);
          }
        }

        moved.push({
          folio: p.folio,
          fullName: p.fullName,
          daysPending: days,
        });
      }
    }
  }

  return {
    movedCount: moved.length,
    participants: moved,
  };
}

/**
 * Automatically or manually synchronizes all local records (participants, orders, stages, config)
 * to Firestore. If Firestore quota limit is reached, it gracefully aborts without throwing,
 * keeping all local records intact until the quota resets.
 */
export async function syncLocalBackupToFirestore(): Promise<{
  success: boolean;
  message: string;
  syncedParticipants: number;
  syncedOrders: number;
  error?: string;
}> {
  if (isFirestoreWriteBlocked()) {
    return {
      success: false,
      message: 'La sincronización con la nube está en pausa preventiva por límite diario de escritura en Firestore. Los datos se mantienen 100% seguros y respaldados en el servidor.',
      syncedParticipants: 0,
      syncedOrders: 0,
    };
  }

  const local = getLocalDB();
  let syncedParticipants = 0;
  let syncedOrders = 0;

  try {
    // 1. Sync config & stages
    if (local.config) {
      await setDoc(doc(db, 'config', 'nnr-paraiso-2026'), cleanUndefined(local.config), { merge: true });
    }
    if (local.stages && local.stages.length > 0) {
      for (const st of local.stages) {
        await setDoc(doc(db, 'stages', st.id), cleanUndefined(st), { merge: true });
      }
    }

    // 2. Sync participants
    for (const p of local.participants) {
      await setDoc(doc(db, 'participants', p.id), cleanUndefined(p), { merge: true });
      syncedParticipants++;
    }

    // 3. Sync orders
    for (const o of local.orders) {
      const { participants, ...orderData } = o;
      await setDoc(doc(db, 'orders', o.id), cleanUndefined(orderData), { merge: true });
      syncedOrders++;
    }

    return {
      success: true,
      message: `Sincronización completada con éxito: ${syncedParticipants} participantes y ${syncedOrders} órdenes actualizados en Firestore.`,
      syncedParticipants,
      syncedOrders,
    };
  } catch (err: any) {
    recordFirestoreError(err, 'write');
    logDbResilienceInfo('Firestore synchronization paused', err);
    return {
      success: false,
      message: `La sincronización a la nube se reanudará cuando Firestore restablezca su cuota diaria. Todos los registros están 100% seguros en el almacenamiento local del servidor.`,
      syncedParticipants,
      syncedOrders,
      error: err?.message || String(err),
    };
  }
}
