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
} from './types';
import { generateParticipantToken, generateQRCodeDataUrl } from './qr';
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
  deleteDoc
} from 'firebase/firestore';

// Default Event Configuration for Neon Night Run Paraíso
export const defaultEventConfig: EventConfig = {
  id: 'nnr-paraiso-2026',
  name: 'Neon Night Run Paraíso',
  slogan: '¡Ilumina tu camino!',
  description: 'Carrera nocturna recreativa y competitiva bajo el cielo de Paraíso, Tabasco, con una experiencia visual inspirada en luces neón, energía, música y comunidad.',
  dateText: 'Sábado 7 de noviembre de 2026',
  isoDate: '2026-11-07T19:30:00',
  distance: '6 kilómetros',
  location: 'Paraíso, Tabasco, México',
  venueName: 'Malecón Turístico y Puerto de Paraíso',
  registrationOpen: true,
  maxTotalQuota: 249,
  currentTotalRegistered: 100,
  scheduleTime: '19:30 hrs (Calentamiento 18:45 hrs)',
  kitPickupDates: 'Lugar y horario por definir',
  kitPickupLocation: 'Lugar y horario por definir',
  contactWhatsapp: '+52 993 123 4567',
  contactEmail: 'contacto@neonnightrunparaiso.com',
  bankDetails: {
    bankName: 'Transferencia SPEI',
    accountHolder: 'Night run Paraíso',
    clabe: '646180402345488997',
    accountNumber: '402345488997',
    paymentConceptPrefix: 'Tu Nombre',
    instructions: 'Transfiere el monto exacto antes de 24 horas usando tu nombre como concepto de pago. Envía tu comprobante por WhatsApp para validar tu registro.',
  },
  kitItems: [
    {
      id: 'kit-1',
      title: 'Playera Conmemorativa Oficial',
      description: 'Playera técnica oficial conmemorativa de la carrera.',
      icon: 'Shirt',
    },
    {
      id: 'kit-2',
      title: 'Medalla de Finalista',
      description: 'Medalla conmemorativa oficial de finalista.',
      icon: 'Award',
    },
    {
      id: 'kit-4',
      title: 'Kit Neon',
      description: 'Accesorios luminosos neón para brillar en la ruta nocturna.',
      icon: 'Sparkles',
    },
  ],
  categories: [
    { id: 'cat-1', name: 'Varonil', ageRange: '15 años en adelante', gender: 'Varonil', type: 'Competitiva' },
    { id: 'cat-2', name: 'Femenil', ageRange: '15 años en adelante', gender: 'Femenil', type: 'Competitiva' },
  ],
  prizes: [
    { category: 'Categoría Varonil (6K)', firstPlace: '$3,000 MXN', secondPlace: '$2,000 MXN', thirdPlace: '$1,000 MXN' },
    { category: 'Categoría Femenil (6K)', firstPlace: '$3,000 MXN', secondPlace: '$2,000 MXN', thirdPlace: '$1,000 MXN' },
  ],
  routePoints: [
    { name: 'Arco de Salida Neón (Km 0)', kilometer: '0.0 KM', description: 'Túnel de luz negra, DJ en vivo y lluvia de humo neón.', highlight: 'Salida espectacular con cuenta regresiva lumínica' },
    { name: 'Malecón Turístico y Boulevard (Km 1.5)', kilometer: '1.5 KM', description: 'Música DJ, iluminación perimetral y ambientación neón.', highlight: 'Zona con animación and DJ' },
    { name: 'Punto de Hidratación (Km 3.0)', kilometer: '3.0 KM', description: 'Agua purificada y animación musical.', highlight: 'Zona de hidratación oficial' },
    { name: 'Paso por el Cangrejo y Hotel Baez (Km 4.5)', kilometer: '4.5 KM', description: 'Monumento del Cangrejo y Hotel Baez con ambiente festivo.', highlight: 'Punto fotográfico emblemático' },
    { name: 'Meta y Fiesta Neón (Km 6.0)', kilometer: '6.0 KM', description: 'Arco monumental de meta, entrega de medalla glow y After-Party con DJ.', highlight: 'Fiesta neón y premiación' },
  ],
  sponsors: [
    {
      id: 'sp-1',
      name: 'Intel',
      tier: 'Diamante',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282020%29.svg/800px-Intel_logo_%282020%29.svg.png',
      websiteUrl: 'https://www.intel.com',
      active: true,
      order: 1,
    },
    {
      id: 'sp-2',
      name: 'Walmart',
      tier: 'Diamante',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/800px-Walmart_logo.svg.png',
      websiteUrl: 'https://www.walmart.com.mx',
      active: true,
      order: 2,
    },
    {
      id: 'sp-3',
      name: 'Burger King',
      tier: 'Oro',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/800px-Burger_King_logo_%281999%29.svg.png',
      websiteUrl: 'https://www.burgerking.com.mx',
      active: true,
      order: 3,
    },
    {
      id: 'sp-4',
      name: 'Forbes',
      tier: 'Oficial',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Forbes_logo.svg/800px-Forbes_logo.svg.png',
      websiteUrl: 'https://forbes.com.mx',
      active: true,
      order: 4,
    },
    {
      id: 'sp-5',
      name: 'Electrolit',
      tier: 'Diamante',
      logoUrl: 'https://electrolit.com.mx/assets/img/logo-electrolit.png',
      websiteUrl: 'https://electrolit.com.mx',
      active: true,
      order: 5,
    },
    {
      id: 'sp-6',
      name: 'Glow Life Paraíso',
      tier: 'Oro',
      logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
      websiteUrl: 'https://paraiso.gob.mx',
      active: true,
      order: 6,
    },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: '¿Qué incluye el costo de inscripción de $350 MXN?',
      answer: 'Tu inscripción incluye: Playera oficial conmemorativa, Medalla de finalista, Kit Neon y Número oficial de corredor.',
      category: 'Inscripción',
    },
    {
      id: 'faq-2',
      question: '¿Dónde y cuándo se entregan los kits?',
      answer: 'Lugar y horario por definir.',
      category: 'Kits',
    },
    {
      id: 'faq-3',
      question: '¿Puedo recoger el kit de otra persona?',
      answer: 'Sí, presentando la confirmación con código QR del participante y una copia simple de su identificación oficial.',
      category: 'Kits',
    },
    {
      id: 'faq-5',
      question: '¿Puedo correr con niños o en modalidad caminata?',
      answer: '¡Por supuesto! La categoría Recreativa Neon Glow está diseñada para todas las edades. Puedes trotar, correr o caminar con tu familia y amigos.',
      category: 'Evento',
    },
    {
      id: 'faq-6',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito y débito, transferencias SPEI, efectivo en OXXO mediante Mercado Pago, así como transferencias bancarias directas con confirmación en el portal.',
      category: 'Pagos',
    },
  ],
};

// Default pricing stages (Único precio de inscripción general: $350 MXN)
export const defaultPricingStages: PricingStage[] = [
  {
    id: 'stage-regular',
    name: 'Inscripción General Oficial',
    price: 350,
    startDate: '2026-06-01T00:00:00',
    endDate: '2026-11-06T23:59:59',
    quota: 249,
    soldCount: 100,
    active: true,
    badgeText: 'Tarifa Única Vigente',
    description: 'Incluye playera, medalla y Kit Neon.',
  },
];

// Default Ambassador Codes
export const defaultAmbassadorCodes: AmbassadorCode[] = [
  {
    id: 'amb-1',
    code: 'NEONRUNNER10',
    ambassadorName: 'Carlos Mendoza (Club Runners Paraíso)',
    discountType: 'percentage',
    discountValue: 10,
    maxUses: 100,
    usedCount: 34,
    active: true,
    totalRevenue: 13770,
    createdAt: '2026-07-01T10:00:00',
  },
  {
    id: 'amb-2',
    code: 'TABASCOGLOW',
    ambassadorName: 'Mariana Pérez (FitLife Studio)',
    discountType: 'percentage',
    discountValue: 15,
    maxUses: 50,
    usedCount: 22,
    active: true,
    totalRevenue: 8415,
    createdAt: '2026-07-15T12:00:00',
  },
  {
    id: 'amb-3',
    code: 'PROMO50',
    ambassadorName: 'Comunidad Deportiva Sureste',
    discountType: 'fixed',
    discountValue: 50,
    maxUses: 100,
    usedCount: 18,
    active: true,
    totalRevenue: 7200,
    createdAt: '2026-08-01T09:00:00',
  },
];

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

async function ensureSeeded() {
  if (isSeeding) return;
  isSeeding = true;
  try {
    // 1. Seed Config
    const configRef = doc(db, 'config', 'nnr-paraiso-2026');
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      await setDoc(configRef, defaultEventConfig);
    }

    // 2. Seed Stages
    const stagesCol = collection(db, 'stages');
    const stagesSnap = await getDocs(query(stagesCol, limit(1)));
    if (stagesSnap.empty) {
      for (const stage of defaultPricingStages) {
        await setDoc(doc(db, 'stages', stage.id), stage);
      }
    }

    // 3. Seed Ambassadors
    const ambCol = collection(db, 'ambassadors');
    const ambSnap = await getDocs(query(ambCol, limit(1)));
    if (ambSnap.empty) {
      for (const amb of defaultAmbassadorCodes) {
        await setDoc(doc(db, 'ambassadors', amb.id), amb);
      }
    }

    // 4. Seed Orders, Participants & Logs if orders is empty
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
  } catch (err) {
    console.error('Error seeding Firestore database:', err);
  } finally {
    isSeeding = false;
  }
}

async function getNextFolioNumber(): Promise<number> {
  const counterRef = doc(db, 'counters', 'folios');
  const snap = await getDoc(counterRef);
  if (!snap.exists()) {
    await setDoc(counterRef, { value: 10 });
    return 5;
  }
  const current = snap.data().value || 5;
  await updateDoc(counterRef, { value: increment(1) });
  return current;
}

// Global variable fallback (not used for cloud persistence but matches structure)
export function getDB() {
  return generateSeedState();
}

// --------------------------------------------------------------------------
// DATABASE SERVICES & OPERATIONS (CONVERTED TO ASYNC / FIRESTORE)
// --------------------------------------------------------------------------

export async function getEventConfig(): Promise<EventConfig> {
  await ensureSeeded();
  const snap = await getDoc(doc(db, 'config', 'nnr-paraiso-2026'));
  if (snap.exists()) {
    return snap.data() as EventConfig;
  }
  return defaultEventConfig;
}

export async function updateEventConfig(newConfig: Partial<EventConfig>, userEmail = 'admin'): Promise<EventConfig> {
  await ensureSeeded();
  const configRef = doc(db, 'config', 'nnr-paraiso-2026');
  const current = await getEventConfig();
  const updated = { ...current, ...newConfig };
  await setDoc(configRef, updated);
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
  await ensureSeeded();
  const snap = await getDocs(collection(db, 'stages'));
  return snap.docs.map(doc => doc.data() as PricingStage);
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
  if (!snap.exists()) return null;
  const updated = { ...snap.data(), ...updates } as PricingStage;
  await setDoc(docRef, updated);
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
  await recordAuditLog('STAGE_CREATED', 'stage', id, userEmail, 'admin', `Nueva etapa de precio creada: ${created.name}`);
  return created;
}

// ambassadors
export async function getAmbassadorCodes(): Promise<AmbassadorCode[]> {
  await ensureSeeded();
  const snap = await getDocs(collection(db, 'ambassadors'));
  return snap.docs.map(doc => doc.data() as AmbassadorCode);
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
  paymentMethod: 'mercadopago' | 'transfer' | 'demo';
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

  let discountPerPerson = 0;
  let totalDiscount = 0;
  let ambassadorObj: AmbassadorCode | undefined;

  if (params.ambassadorCode) {
    const val = await validateAmbassadorCode(params.ambassadorCode);
    if (val.valid && val.ambassador) {
      ambassadorObj = val.ambassador;
      if (ambassadorObj.discountType === 'percentage') {
        discountPerPerson = (stage.price * ambassadorObj.discountValue) / 100;
      } else {
        discountPerPerson = ambassadorObj.discountValue;
      }
      totalDiscount = discountPerPerson * params.participants.length;
    }
  }

  const subtotal = stage.price * params.participants.length;
  const totalAmount = Math.max(0, subtotal - totalDiscount);

  const orderId = `ord-${Date.now()}`;
  const totalOrdersCountSnap = await getDocs(collection(db, 'orders'));
  const orderNumber = formatOrderNumber(1000 + totalOrdersCountSnap.size + 1);
  const now = new Date().toISOString();

  const isDemo = params.paymentMethod === 'demo';
  const initialStatus: PaymentStatus = isDemo ? 'approved' : 'pending';

  const order: Order = {
    id: orderId,
    orderNumber,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone,
    participantsCount: params.participants.length,
    stageId: stage.id,
    stageName: stage.name,
    unitPrice: stage.price,
    subtotal,
    discountAmount: totalDiscount,
    totalAmount,
    ambassadorCodeUsed: ambassadorObj?.code,
    paymentMethod: params.paymentMethod,
    paymentStatus: initialStatus,
    paymentReference: params.paymentMethod === 'transfer' ? `SPEI-${orderNumber}` : `MP-${orderNumber}`,
    transferReceiptUrl: params.transferReceiptUrl,
    transferReceiptUploadedAt: params.transferReceiptUrl ? now : undefined,
    createdAt: now,
    updatedAt: now,
    confirmedAt: isDemo ? now : undefined,
    confirmedBy: isDemo ? 'Simulador de Pagos Demo' : undefined,
  };

  const createdParticipants: Participant[] = [];

  for (let i = 0; i < params.participants.length; i++) {
    const input = params.participants[i];
    const folioNumber = await getNextFolioNumber();
    const folio = formatFolioNumber(folioNumber);
    const qrToken = generateParticipantToken(folio);
    
    const qrCodeDataUrl = await generateQRCodeDataUrl(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/participante/${folio}`);

    const p: Participant = {
      ...input,
      id: `p-${Date.now()}-${i}`,
      orderId,
      folio,
      qrToken,
      qrCodeDataUrl,
      kitDelivered: false,
      createdAt: now,
      status: initialStatus === 'approved' ? 'confirmed' : 'pending',
      unitPrice: stage.price,
      discountApplied: discountPerPerson,
    };

    createdParticipants.push(p);
    await setDoc(doc(db, 'participants', p.id), cleanUndefined(p));
  }

  if (initialStatus === 'approved') {
    stage.soldCount += params.participants.length;
    await setDoc(doc(db, 'stages', stage.id), stage);

    config.currentTotalRegistered += params.participants.length;
    await setDoc(configRef, config);

    if (ambassadorObj) {
      ambassadorObj.usedCount += params.participants.length;
      ambassadorObj.totalRevenue += totalAmount;
      await setDoc(doc(db, 'ambassadors', ambassadorObj.id), ambassadorObj);
    }
  }

  order.participants = createdParticipants;
  const { participants, ...orderData } = order;
  await setDoc(doc(db, 'orders', orderId), cleanUndefined(orderData));

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
  await ensureSeeded();
  const clean = orderIdOrNumber.trim();
  
  let orderRef = doc(db, 'orders', clean);
  let snap = await getDoc(orderRef);
  
  let orderData: Order | null = null;
  if (snap.exists()) {
    orderData = snap.data() as Order;
  } else {
    const q = query(collection(db, 'orders'), where('orderNumber', '==', clean));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      orderData = querySnap.docs[0].data() as Order;
    }
  }

  if (!orderData) return null;

  const participantsSnap = await getDocs(query(collection(db, 'participants'), where('orderId', '==', orderData.id)));
  orderData.participants = participantsSnap.docs.map(doc => doc.data() as Participant);
  return orderData;
}

export async function getOrders(filters?: { status?: PaymentStatus; method?: string; search?: string }): Promise<Order[]> {
  await ensureSeeded();
  const snap = await getDocs(collection(db, 'orders'));
  let list = snap.docs.map(doc => doc.data() as Order);

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

  const resolvedList: Order[] = [];
  for (const o of list) {
    const participantsSnap = await getDocs(query(collection(db, 'participants'), where('orderId', '==', o.id)));
    o.participants = participantsSnap.docs.map(doc => doc.data() as Participant);
    resolvedList.push(o);
  }

  return resolvedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: PaymentStatus,
  confirmedBy: string,
  notes?: string
): Promise<Order | null> {
  await ensureSeeded();
  const order = await getOrder(orderId);
  if (!order) return null;

  const previousStatus = order.paymentStatus;
  const now = new Date().toISOString();

  order.paymentStatus = newStatus;
  order.updatedAt = now;

  const orderRef = doc(db, 'orders', order.id);

  if (newStatus === 'approved') {
    order.confirmedAt = now;
    order.confirmedBy = confirmedBy;
    if (notes) order.transferNotes = notes;

    const participantsSnap = await getDocs(query(collection(db, 'participants'), where('orderId', '==', order.id)));
    for (const d of participantsSnap.docs) {
      const p = d.data() as Participant;
      p.status = 'confirmed';
      if (!p.qrCodeDataUrl) {
        p.qrCodeDataUrl = await generateQRCodeDataUrl(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/participante/${p.folio}`);
      }
      await setDoc(doc(db, 'participants', p.id), p);
    }

    if (previousStatus !== 'approved') {
      const config = await getEventConfig();
      config.currentTotalRegistered += order.participantsCount;
      await setDoc(doc(db, 'config', 'nnr-paraiso-2026'), config);

      const stageRef = doc(db, 'stages', order.stageId);
      const stageSnap = await getDoc(stageRef);
      if (stageSnap.exists()) {
        const stage = stageSnap.data() as PricingStage;
        stage.soldCount += order.participantsCount;
        await setDoc(stageRef, stage);
      }

      if (order.ambassadorCodeUsed) {
        const q = query(collection(db, 'ambassadors'), where('code', '==', order.ambassadorCodeUsed));
        const ambSnap = await getDocs(q);
        if (!ambSnap.empty) {
          const ambDoc = ambSnap.docs[0];
          const amb = ambDoc.data() as AmbassadorCode;
          amb.usedCount += order.participantsCount;
          amb.totalRevenue += order.totalAmount;
          await setDoc(doc(db, 'ambassadors', amb.id), amb);
        }
      }
    }
  } else if (newStatus === 'cancelled' || newStatus === 'rejected') {
    if (previousStatus === 'approved') {
      const config = await getEventConfig();
      config.currentTotalRegistered = Math.max(0, config.currentTotalRegistered - order.participantsCount);
      await setDoc(doc(db, 'config', 'nnr-paraiso-2026'), config);

      const stageRef = doc(db, 'stages', order.stageId);
      const stageSnap = await getDoc(stageRef);
      if (stageSnap.exists()) {
        const stage = stageSnap.data() as PricingStage;
        stage.soldCount = Math.max(0, stage.soldCount - order.participantsCount);
        await setDoc(stageRef, stage);
      }
    }
    const participantsSnap = await getDocs(query(collection(db, 'participants'), where('orderId', '==', order.id)));
    for (const d of participantsSnap.docs) {
      const p = d.data() as Participant;
      p.status = 'cancelled';
      await setDoc(doc(db, 'participants', p.id), p);
    }
  }

  const { participants, ...orderData } = order;
  await setDoc(orderRef, orderData);

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
  await ensureSeeded();
  const clean = identifier.trim().toUpperCase();
  
  const qFolio = query(collection(db, 'participants'), where('folio', '==', clean));
  const snapFolio = await getDocs(qFolio);
  if (!snapFolio.empty) {
    return snapFolio.docs[0].data() as Participant;
  }

  const qToken = query(collection(db, 'participants'), where('qrToken', '==', clean));
  const snapToken = await getDocs(qToken);
  if (!snapToken.empty) {
    return snapToken.docs[0].data() as Participant;
  }

  const snapAll = await getDocs(collection(db, 'participants'));
  const found = snapAll.docs.map(doc => doc.data() as Participant).find(p => 
    p.qrToken.toUpperCase() === clean ||
    p.qrToken.toUpperCase().includes(clean) || 
    clean.includes(p.qrToken.toUpperCase())
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
  await ensureSeeded();
  const snap = await getDocs(collection(db, 'participants'));
  let list = snap.docs.map(doc => doc.data() as Participant);

  if (filters?.status) {
    list = list.filter(p => p.status === filters.status);
  }
  if (filters?.shirtSize) {
    list = list.filter(p => p.shirtSize === filters.shirtSize);
  }
  if (filters?.category) {
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

  return list.sort((a, b) => a.folio.localeCompare(b.folio));
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

  if (p.status !== 'confirmed') {
    return {
      success: false,
      message: `No se puede entregar el kit: La inscripción se encuentra en estado "${p.status.toUpperCase()}". Solo participantes confirmados y pagados pueden recibir su kit.`,
      participant: p,
    };
  }

  if (p.kitDelivered) {
    return {
      success: false,
      message: `¡ADVERTENCIA! El kit para el folio ${p.folio} ya fue entregado el ${new Date(p.kitDeliveredAt || '').toLocaleString('es-MX')} por ${p.kitDeliveredBy}.`,
      participant: p,
    };
  }

  const now = new Date().toISOString();
  p.kitDelivered = true;
  p.kitDeliveredAt = now;
  p.kitDeliveredBy = staffUser.email || staffUser.name;
  p.kitDeliveryNotes = notes || 'Entrega completada';

  await setDoc(doc(db, 'participants', p.id), p);

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
  await setDoc(doc(db, 'kit_logs', log.id), log);

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

  await setDoc(doc(db, 'participants', p.id), p);

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
  await setDoc(doc(db, 'kit_logs', log.id), log);

  await recordAuditLog('KIT_DELIVERY_REVERTED', 'kit_delivery', p.id, adminUser.email, 'admin', `Entrega de kit revertida para folio ${p.folio}: ${reason}`);

  return {
    success: true,
    message: `La entrega del kit para ${p.fullName} (${p.folio}) ha sido revertida.`,
    participant: p,
  };
}

export async function updateParticipant(id: string, updates: Partial<Participant>, userEmail = 'admin'): Promise<Participant | null> {
  await ensureSeeded();
  const snap = await getDocs(collection(db, 'participants'));
  const found = snap.docs.find(doc => doc.data().id === id || doc.data().folio === id);
  if (!found) return null;
  const original = found.data() as Participant;
  const updated = { ...original, ...updates };
  await setDoc(doc(db, 'participants', original.id), updated);
  await recordAuditLog('PARTICIPANT_UPDATED', 'participant', original.id, userEmail, 'admin', `Datos de participante ${updated.fullName} actualizados`);
  return updated;
}

// metrics & logs
export async function getDashboardMetrics() {
  await ensureSeeded();
  const config = await getEventConfig();
  const stages = await getPricingStages();
  const ambassadors = await getAmbassadorCodes();
  
  const participantsSnap = await getDocs(collection(db, 'participants'));
  const participants = participantsSnap.docs.map(doc => doc.data() as Participant);

  const ordersSnap = await getDocs(collection(db, 'orders'));
  const orders = ordersSnap.docs.map(doc => doc.data() as Order);

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
  await ensureSeeded();
  const snap = await getDocs(collection(db, 'kit_logs'));
  return snap.docs.map(doc => doc.data() as KitDeliveryLog).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  await ensureSeeded();
  const snap = await getDocs(collection(db, 'audit_logs'));
  return snap.docs.map(doc => doc.data() as AuditLog).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
  await setDoc(doc(db, 'audit_logs', log.id), log);
  return log;
}

export async function recordWebhookLog(log: Omit<PaymentWebhookLog, 'id' | 'receivedAt'>): Promise<PaymentWebhookLog> {
  const entry: PaymentWebhookLog = {
    ...log,
    id: `wh-${Date.now()}`,
    receivedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'webhook_logs', entry.id), entry);
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
  await ensureSeeded();
  const snap = await getDocs(collection(db, 'participants'));
  const found = snap.docs.find(doc => doc.data().id === participantId || doc.data().folio === participantId);
  if (!found) return false;
  const original = found.data() as Participant;

  // Delete the participant doc
  await deleteDoc(found.ref);

  // If confirmed, adjust registered total
  if (original.status === 'confirmed') {
    try {
      const configRef = doc(db, 'config', 'nnr-paraiso-2026');
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const config = configSnap.data() as EventConfig;
        config.currentTotalRegistered = Math.max(0, config.currentTotalRegistered - 1);
        await setDoc(configRef, config);
      }
    } catch (e) {
      console.error('Error adjusting metrics on participant deletion:', e);
    }
  }

  await recordAuditLog('PARTICIPANT_DELETED', 'participant', original.id, userEmail, 'admin', `Participante ${original.fullName} (Folio: ${original.folio}) eliminado`);
  return true;
}

