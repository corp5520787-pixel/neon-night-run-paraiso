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
  kitPickupDates: 'Viernes 6 de nov (14:00 a 20:00 hrs) y Sábado 7 de nov (09:00 a 14:00 hrs)',
  kitPickupLocation: 'Explanada del Parque Central de Paraíso, Tabasco',
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
      id: 'kit-3',
      title: 'Número de Corredor Oficial',
      description: 'Número oficial de competidor para cronometraje y registro.',
      icon: 'Ticket',
    },
  ],
  categories: [
    { id: 'cat-1', name: 'Varonil', ageRange: '18 años en adelante', gender: 'Varonil', type: 'Competitiva' },
    { id: 'cat-2', name: 'Femenil', ageRange: '18 años en adelante', gender: 'Femenil', type: 'Competitiva' },
  ],
  prizes: [
    { category: 'Categoría Varonil (6K)', firstPlace: '$5,000 MXN + Trofeo Neón', secondPlace: '$3,000 MXN + Trofeo', thirdPlace: '$1,500 MXN + Trofeo', provisional: true },
    { category: 'Categoría Femenil (6K)', firstPlace: '$5,000 MXN + Trofeo Neón', secondPlace: '$3,000 MXN + Trofeo', thirdPlace: '$1,500 MXN + Trofeo', provisional: true },
  ],
  routePoints: [
    { name: 'Arco de Salida Neón (Km 0)', kilometer: '0.0 KM', description: 'Túnel de luz negra, DJ en vivo y lluvia de humo neón.', highlight: 'Salida espectacular con cuenta regresiva lumínica' },
    { name: 'Punto de Hidratación 1 (Km 2)', kilometer: '2.0 KM', description: 'Av. Malecón con música electrónica y agua purificada.', highlight: 'Zona de animación y luces estroboscópicas' },
    { name: 'Paso por el Faro y Laguna (Km 3.5)', kilometer: '3.5 KM', description: 'Vista costera nocturna con iluminación perimetral cian y magenta.', highlight: 'Punto fotográfico oficial' },
    { name: 'Punto de Hidratación 2 (Km 4.5)', kilometer: '4.5 KM', description: 'Isotónico y niebla fresca con luz ultravioleta.', highlight: 'Zona de recarga de energía' },
    { name: 'Meta y Fiesta Neón (Km 6.0)', kilometer: '6.0 KM', description: 'Arco monumental de meta, entrega de medalla glow y After-Party con DJ.', highlight: 'Concierto y premiación en vivo' },
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
      answer: 'Tu inscripción incluye: Playera oficial conmemorativa, Medalla de finalista y Número oficial de corredor.',
      category: 'Inscripción',
    },
    {
      id: 'faq-2',
      question: '¿Dónde y cuándo se entregan los kits?',
      answer: 'La entrega será el viernes 6 de noviembre de 14:00 a 20:00 hrs y el sábado 7 de noviembre de 09:00 a 14:00 hrs en la Explanada del Parque Central de Paraíso. Deberás presentar tu código QR o folio NNR y una identificación oficial.',
      category: 'Kits',
    },
    {
      id: 'faq-3',
      question: '¿Puedo recoger el kit de otra persona?',
      answer: 'Sí, presentando la confirmación con código QR del participante y una copia simple de su identificación oficial.',
      category: 'Kits',
    },
    {
      id: 'faq-4',
      question: '¿Habrá guardarropa y estacionamiento?',
      answer: 'Sí, contaremos con servicio de guardarropa gratuito para corredores inscritos en la zona de meta y áreas designadas de estacionamiento con vigilancia en los alrededores del Malecón.',
      category: 'Logística',
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

// Default pricing stages (Único precio vigente: $350 MXN)
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
    description: 'Incluye playera, medalla y número oficial de corredor.',
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

// In-Memory Database Singleton State
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

// Initial realistic seed participants & orders
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
      category: 'Libre Varonil (18 a 39 años)',
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
      unitPrice: 450,
      discountApplied: 45,
    },
    {
      id: 'p-002',
      orderId: 'ord-101',
      folio: 'NNR-000002',
      fullName: 'Sofía Valenzuela Castillo',
      birthDate: '1995-09-21',
      age: 31,
      gender: 'Femenil',
      category: 'Libre Femenil (18 a 39 años)',
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
      unitPrice: 450,
      discountApplied: 45,
    },
    {
      id: 'p-003',
      orderId: 'ord-102',
      folio: 'NNR-000003',
      fullName: 'Héctor Gómez Domínguez',
      birthDate: '1981-11-03',
      age: 44,
      gender: 'Varonil',
      category: 'Master Varonil (40 años y más)',
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
      unitPrice: 450,
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
      category: 'Neon Glow Recreativa (Cualquier edad)',
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
      unitPrice: 450,
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
      stageName: 'Fase 2: Precio Regular',
      unitPrice: 450,
      subtotal: 900,
      discountAmount: 90,
      totalAmount: 810,
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
      stageName: 'Fase 2: Precio Regular',
      unitPrice: 450,
      subtotal: 450,
      discountAmount: 0,
      totalAmount: 450,
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
      stageName: 'Fase 2: Precio Regular',
      unitPrice: 450,
      subtotal: 450,
      discountAmount: 0,
      totalAmount: 450,
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
      details: 'Aprobación manual de transferencia SPEI-BBVA-782190 por $450 MXN',
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

// Global variable across server invocations
declare global {
  var __NNR_DB_STATE__: DBState | undefined;
}

export function getDB(): DBState {
  if (!globalThis.__NNR_DB_STATE__) {
    globalThis.__NNR_DB_STATE__ = generateSeedState();
  }
  return globalThis.__NNR_DB_STATE__;
}

// --------------------------------------------------------------------------
// DATABASE SERVICES & OPERATIONS
// --------------------------------------------------------------------------

export function getEventConfig(): EventConfig {
  const db = getDB();
  return db.config;
}

export function updateEventConfig(newConfig: Partial<EventConfig>, userEmail = 'admin'): EventConfig {
  const db = getDB();
  db.config = { ...db.config, ...newConfig };
  recordAuditLog('CONFIG_UPDATED', 'config', db.config.id, userEmail, 'admin', 'Configuración general del evento actualizada');
  return db.config;
}

// --------------------------------------------------------------------------
// SPONSORS SERVICES
// --------------------------------------------------------------------------

export function getSponsors(activeOnly = false): Sponsor[] {
  const db = getDB();
  const list = db.config.sponsors || [];
  const sorted = [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  if (activeOnly) {
    return sorted.filter(s => s.active !== false);
  }
  return sorted;
}

export function createSponsor(
  sponsorData: Omit<Sponsor, 'id'>,
  adminEmail = 'admin@neonnightrunparaiso.mx'
): Sponsor {
  const db = getDB();
  if (!db.config.sponsors) db.config.sponsors = [];
  const id = `sp-${Date.now()}`;
  const newSponsor: Sponsor = {
    ...sponsorData,
    id,
    active: sponsorData.active !== undefined ? sponsorData.active : true,
    order: sponsorData.order !== undefined ? sponsorData.order : db.config.sponsors.length + 1,
  };
  db.config.sponsors.push(newSponsor);
  recordAuditLog(
    'SPONSOR_CREATED',
    'config',
    id,
    adminEmail,
    'admin',
    `Nuevo patrocinador agregado: ${newSponsor.name} (${newSponsor.tier})`
  );
  return newSponsor;
}

export function updateSponsor(
  id: string,
  updates: Partial<Sponsor>,
  adminEmail = 'admin@neonnightrunparaiso.mx'
): Sponsor | null {
  const db = getDB();
  if (!db.config.sponsors) return null;
  const index = db.config.sponsors.findIndex(s => s.id === id);
  if (index === -1) return null;
  db.config.sponsors[index] = { ...db.config.sponsors[index], ...updates };
  recordAuditLog(
    'SPONSOR_UPDATED',
    'config',
    id,
    adminEmail,
    'admin',
    `Patrocinador ${db.config.sponsors[index].name} actualizado`
  );
  return db.config.sponsors[index];
}

export function deleteSponsor(id: string, adminEmail = 'admin@neonnightrunparaiso.mx'): boolean {
  const db = getDB();
  if (!db.config.sponsors) return false;
  const index = db.config.sponsors.findIndex(s => s.id === id);
  if (index === -1) return false;
  const deleted = db.config.sponsors.splice(index, 1)[0];
  recordAuditLog(
    'SPONSOR_DELETED',
    'config',
    id,
    adminEmail,
    'admin',
    `Patrocinador eliminado: ${deleted.name}`
  );
  return true;
}

export function getPricingStages(): PricingStage[] {
  const db = getDB();
  return db.stages;
}

export function getActivePricingStage(quantity = 1): PricingStage {
  const db = getDB();
  
  // If team condition applies (>= 5 participants) and team stage is active
  if (quantity >= 5) {
    const teamStage = db.stages.find(s => s.id === 'stage-team' && s.active);
    if (teamStage) return teamStage;
  }

  // Find currently active date-based stage
  const now = new Date().toISOString();
  const activeStage = db.stages.find(s => s.active && s.startDate <= now && s.endDate >= now && s.soldCount < s.quota);
  if (activeStage) return activeStage;

  // Fallback to first active non-team stage
  const fallback = db.stages.find(s => s.active && s.id !== 'stage-team') || db.stages[0];
  return fallback;
}

export function updatePricingStage(stageId: string, updates: Partial<PricingStage>, userEmail = 'admin'): PricingStage | null {
  const db = getDB();
  const index = db.stages.findIndex(s => s.id === stageId);
  if (index === -1) return null;
  db.stages[index] = { ...db.stages[index], ...updates };
  recordAuditLog('STAGE_UPDATED', 'stage', stageId, userEmail, 'admin', `Etapa ${db.stages[index].name} actualizada`);
  return db.stages[index];
}

export function createPricingStage(newStage: Omit<PricingStage, 'id' | 'soldCount'>, userEmail = 'admin'): PricingStage {
  const db = getDB();
  const id = `stage-${Date.now()}`;
  const created: PricingStage = {
    ...newStage,
    id,
    soldCount: 0,
  };
  db.stages.push(created);
  recordAuditLog('STAGE_CREATED', 'stage', id, userEmail, 'admin', `Nueva etapa de precio creada: ${created.name}`);
  return created;
}

export function getAmbassadorCodes(): AmbassadorCode[] {
  const db = getDB();
  return db.ambassadors;
}

export function validateAmbassadorCode(codeText: string): { valid: boolean; ambassador?: AmbassadorCode; message?: string } {
  const db = getDB();
  const cleanCode = codeText.trim().toUpperCase();
  const found = db.ambassadors.find(a => a.code.toUpperCase() === cleanCode);
  
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

export function createAmbassadorCode(codeData: Omit<AmbassadorCode, 'id' | 'usedCount' | 'totalRevenue' | 'createdAt'>, userEmail = 'admin'): AmbassadorCode {
  const db = getDB();
  const id = `amb-${Date.now()}`;
  const created: AmbassadorCode = {
    ...codeData,
    id,
    code: codeData.code.trim().toUpperCase(),
    usedCount: 0,
    totalRevenue: 0,
    createdAt: new Date().toISOString(),
  };
  db.ambassadors.push(created);
  recordAuditLog('AMBASSADOR_CREATED', 'ambassador', id, userEmail, 'admin', `Código de embajador ${created.code} creado para ${created.ambassadorName}`);
  return created;
}

export function updateAmbassadorCode(id: string, updates: Partial<AmbassadorCode>, userEmail = 'admin'): AmbassadorCode | null {
  const db = getDB();
  const index = db.ambassadors.findIndex(a => a.id === id);
  if (index === -1) return null;
  db.ambassadors[index] = { ...db.ambassadors[index], ...updates };
  recordAuditLog('AMBASSADOR_UPDATED', 'ambassador', id, userEmail, 'admin', `Código de embajador ${db.ambassadors[index].code} modificado`);
  return db.ambassadors[index];
}

// --------------------------------------------------------------------------
// ORDERS & PARTICIPANTS CREATION AND MANAGEMENT
// --------------------------------------------------------------------------

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

export async function createOrder(params: CreateOrderParams): Promise<{ order: Order; participants: Participant[] }> {
  const db = getDB();
  const stage = getActivePricingStage(params.participants.length);
  
  // Check quota
  if (db.config.currentTotalRegistered + params.participants.length > db.config.maxTotalQuota) {
    throw new Error('No hay suficientes lugares disponibles para el cupo solicitado.');
  }

  // Calculate discount
  let discountPerPerson = 0;
  let totalDiscount = 0;
  let ambassadorObj: AmbassadorCode | undefined;

  if (params.ambassadorCode) {
    const val = validateAmbassadorCode(params.ambassadorCode);
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
  const orderNumber = formatOrderNumber(1000 + db.orders.length + 1);
  const now = new Date().toISOString();

  // If method is demo, approve immediately; if transfer or mercadopago, set pending
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

  // Generate participant records
  const createdParticipants: Participant[] = [];

  for (let i = 0; i < params.participants.length; i++) {
    const input = params.participants[i];
    const folioNumber = db.nextFolioNumber++;
    const folio = formatFolioNumber(folioNumber);
    const qrToken = generateParticipantToken(folio);
    
    // QR code payload URL or token
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
  }

  // Update counts if approved
  if (initialStatus === 'approved') {
    stage.soldCount += params.participants.length;
    db.config.currentTotalRegistered += params.participants.length;
    if (ambassadorObj) {
      ambassadorObj.usedCount += params.participants.length;
      ambassadorObj.totalRevenue += totalAmount;
    }
  }

  order.participants = createdParticipants;
  db.orders.push(order);
  db.participants.push(...createdParticipants);

  recordAuditLog(
    'ORDER_CREATED',
    'order',
    orderId,
    params.customerEmail,
    'customer',
    `Nueva orden ${orderNumber} creada por ${params.customerName} (${params.participants.length} corredores, $${totalAmount} MXN)`
  );

  return { order, participants: createdParticipants };
}

export function getOrder(orderIdOrNumber: string): Order | null {
  const db = getDB();
  const clean = orderIdOrNumber.trim();
  const order = db.orders.find(o => o.id === clean || o.orderNumber.toUpperCase() === clean.toUpperCase());
  if (!order) return null;
  
  // Attach participants
  order.participants = db.participants.filter(p => p.orderId === order.id);
  return order;
}

export function getOrders(filters?: { status?: PaymentStatus; method?: string; search?: string }): Order[] {
  const db = getDB();
  let list = [...db.orders];

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

  // Populate participants for each order
  return list.map(o => ({
    ...o,
    participants: db.participants.filter(p => p.orderId === o.id),
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: PaymentStatus,
  confirmedBy: string,
  notes?: string
): Promise<Order | null> {
  const db = getDB();
  const order = db.orders.find(o => o.id === orderId || o.orderNumber === orderId);
  if (!order) return null;

  const previousStatus = order.paymentStatus;
  const now = new Date().toISOString();

  order.paymentStatus = newStatus;
  order.updatedAt = now;

  if (newStatus === 'approved') {
    order.confirmedAt = now;
    order.confirmedBy = confirmedBy;
    if (notes) order.transferNotes = notes;

    // Update participants to confirmed and generate QR codes if not already present
    const participants = db.participants.filter(p => p.orderId === order.id);
    for (const p of participants) {
      p.status = 'confirmed';
      if (!p.qrCodeDataUrl) {
        p.qrCodeDataUrl = await generateQRCodeDataUrl(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/participante/${p.folio}`);
      }
    }

    // If transitioning from non-approved to approved, adjust quota and ambassador counts
    if (previousStatus !== 'approved') {
      db.config.currentTotalRegistered += order.participantsCount;
      const stage = db.stages.find(s => s.id === order.stageId);
      if (stage) stage.soldCount += order.participantsCount;

      if (order.ambassadorCodeUsed) {
        const amb = db.ambassadors.find(a => a.code === order.ambassadorCodeUsed);
        if (amb) {
          amb.usedCount += order.participantsCount;
          amb.totalRevenue += order.totalAmount;
        }
      }
    }
  } else if (newStatus === 'cancelled' || newStatus === 'rejected') {
    // If was previously approved, reduce quota
    if (previousStatus === 'approved') {
      db.config.currentTotalRegistered = Math.max(0, db.config.currentTotalRegistered - order.participantsCount);
      const stage = db.stages.find(s => s.id === order.stageId);
      if (stage) stage.soldCount = Math.max(0, stage.soldCount - order.participantsCount);
    }
    const participants = db.participants.filter(p => p.orderId === order.id);
    for (const p of participants) {
      p.status = 'cancelled';
    }
  }

  recordAuditLog(
    'ORDER_STATUS_CHANGED',
    'order',
    order.id,
    confirmedBy,
    'admin',
    `Estado de la orden ${order.orderNumber} cambiado de ${previousStatus} a ${newStatus}. ${notes || ''}`
  );

  return getOrder(order.id);
}

// --------------------------------------------------------------------------
// PARTICIPANTS & KIT DELIVERY
// --------------------------------------------------------------------------

export function getParticipantByFolioOrQr(identifier: string): Participant | null {
  const db = getDB();
  const clean = identifier.trim().toUpperCase();
  
  // Try exact folio match
  let found = db.participants.find(p => p.folio.toUpperCase() === clean);
  if (found) return found;

  // Try QR token match
  found = db.participants.find(p => p.qrToken.toUpperCase() === clean);
  if (found) return found;

  // Try substring or token containing
  found = db.participants.find(p => p.qrToken.toUpperCase().includes(clean) || clean.includes(p.qrToken.toUpperCase()));
  if (found) return found;

  return null;
}

export function getParticipants(filters?: {
  status?: string;
  shirtSize?: string;
  category?: string;
  kitDelivered?: boolean;
  search?: string;
}): Participant[] {
  const db = getDB();
  let list = [...db.participants];

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

export function markKitDelivered(
  participantId: string,
  staffUser: { email: string; name: string },
  notes?: string
): { success: boolean; message: string; participant?: Participant } {
  const db = getDB();
  const p = db.participants.find(x => x.id === participantId || x.folio.toUpperCase() === participantId.toUpperCase());
  
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
  db.kitLogs.unshift(log);

  recordAuditLog('KIT_DELIVERED', 'kit_delivery', p.id, staffUser.email, 'staff', `Kit entregado para folio ${p.folio} (${p.fullName}, Talla ${p.shirtSize})`);

  return {
    success: true,
    message: `¡Kit entregado exitosamente a ${p.fullName} (Folio: ${p.folio}, Talla: ${p.shirtSize})!`,
    participant: p,
  };
}

export function revertKitDelivered(
  participantId: string,
  adminUser: { email: string; name: string },
  reason: string
): { success: boolean; message: string; participant?: Participant } {
  const db = getDB();
  const p = db.participants.find(x => x.id === participantId || x.folio.toUpperCase() === participantId.toUpperCase());

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
  db.kitLogs.unshift(log);

  recordAuditLog('KIT_DELIVERY_REVERTED', 'kit_delivery', p.id, adminUser.email, 'admin', `Entrega de kit revertida para folio ${p.folio}: ${reason}`);

  return {
    success: true,
    message: `La entrega del kit para ${p.fullName} (${p.folio}) ha sido revertida.`,
    participant: p,
  };
}

export function updateParticipant(id: string, updates: Partial<Participant>, userEmail = 'admin'): Participant | null {
  const db = getDB();
  const index = db.participants.findIndex(p => p.id === id || p.folio === id);
  if (index === -1) return null;

  db.participants[index] = { ...db.participants[index], ...updates };
  recordAuditLog('PARTICIPANT_UPDATED', 'participant', id, userEmail, 'admin', `Datos de participante ${db.participants[index].fullName} actualizados`);
  return db.participants[index];
}

// --------------------------------------------------------------------------
// DASHBOARD METRICS & AUDIT LOGS
// --------------------------------------------------------------------------

export function getDashboardMetrics() {
  const db = getDB();
  
  const totalParticipants = db.participants.length;
  const confirmedParticipants = db.participants.filter(p => p.status === 'confirmed').length;
  const pendingParticipants = db.participants.filter(p => p.status === 'pending').length;

  const approvedOrders = db.orders.filter(o => o.paymentStatus === 'approved');
  const pendingOrders = db.orders.filter(o => o.paymentStatus === 'pending');
  const rejectedOrders = db.orders.filter(o => o.paymentStatus === 'rejected' || o.paymentStatus === 'cancelled');

  const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const availableSpots = Math.max(0, db.config.maxTotalQuota - db.config.currentTotalRegistered);

  // T-shirt size distribution
  const shirtSizes: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  for (const p of db.participants) {
    if (p.shirtSize in shirtSizes) {
      shirtSizes[p.shirtSize]++;
    }
  }

  // Categories distribution
  const categoryCount: Record<string, number> = {};
  for (const p of db.participants) {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  }

  // Kit delivery metrics
  const kitsDelivered = db.participants.filter(p => p.kitDelivered).length;
  const kitsPending = Math.max(0, confirmedParticipants - kitsDelivered);

  // Ambassador sales
  const ambassadorStats = db.ambassadors.map(a => ({
    code: a.code,
    name: a.ambassadorName,
    usedCount: a.usedCount,
    revenue: a.totalRevenue,
    active: a.active,
  }));

  // Registration timeline (daily count)
  const dailyRegistrations: Record<string, number> = {};
  for (const p of db.participants) {
    const day = p.createdAt.split('T')[0];
    dailyRegistrations[day] = (dailyRegistrations[day] || 0) + 1;
  }

  return {
    totalParticipants,
    confirmedParticipants,
    pendingParticipants,
    totalOrders: db.orders.length,
    approvedOrdersCount: approvedOrders.length,
    pendingOrdersCount: pendingOrders.length,
    rejectedOrdersCount: rejectedOrders.length,
    totalRevenue,
    pendingRevenue,
    maxTotalQuota: db.config.maxTotalQuota,
    currentTotalRegistered: db.config.currentTotalRegistered,
    availableSpots,
    shirtSizes,
    categoryCount,
    kitsDelivered,
    kitsPending,
    ambassadorStats,
    dailyRegistrations,
  };
}

export function getKitDeliveryLogs(): KitDeliveryLog[] {
  const db = getDB();
  return db.kitLogs;
}

export function getAuditLogs(): AuditLog[] {
  const db = getDB();
  return db.auditLogs;
}

export function recordAuditLog(
  action: string,
  entity: AuditLog['entity'],
  entityId: string,
  performedBy: string,
  performedByRole: string,
  details: string
): AuditLog {
  const db = getDB();
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
  db.auditLogs.unshift(log);
  return log;
}

export function recordWebhookLog(log: Omit<PaymentWebhookLog, 'id' | 'receivedAt'>): PaymentWebhookLog {
  const db = getDB();
  const entry: PaymentWebhookLog = {
    ...log,
    id: `wh-${Date.now()}`,
    receivedAt: new Date().toISOString(),
  };
  db.webhookLogs.unshift(entry);
  return entry;
}

// --------------------------------------------------------------------------
// CSV EXPORT GENERATOR
// --------------------------------------------------------------------------

export function exportParticipantsCSV(): string {
  const db = getDB();
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

  const rows = db.participants.map(p => [
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
