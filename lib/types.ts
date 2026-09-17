export type PaymentMethod = 'mercadopago' | 'transfer' | 'courtesy' | 'demo';

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';

export type AdminRole = 'admin' | 'kits_staff';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl?: string;
}

export interface PricingStage {
  id: string;
  name: string;
  price: number; // in MXN
  startDate: string;
  endDate: string;
  quota: number;
  soldCount: number;
  active: boolean;
  badgeText?: string;
  description?: string;
}

export interface AmbassadorCode {
  id: string;
  code: string;
  ambassadorName: string;
  ambassadorEmail?: string;
  commissionPercent?: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 for 10% or 50 for $50 MXN
  maxUses: number;
  usedCount: number;
  active: boolean;
  totalRevenue: number;
  createdAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'Diamante' | 'Oro' | 'Plata' | 'Institucional' | 'Oficial';
  logoUrl?: string;
  websiteUrl?: string;
  active: boolean;
  order?: number;
}

export interface EventConfig {
  id: string;
  name: string;
  slogan: string;
  description: string;
  dateText: string;
  isoDate: string; // 2026-11-07T19:30:00
  distance: string;
  location: string;
  venueName: string;
  registrationOpen: boolean;
  maxTotalQuota: number;
  currentTotalRegistered: number;
  scheduleTime: string;
  kitPickupDates: string;
  kitPickupLocation: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  bankDetails: {
    bankName: string;
    accountHolder: string;
    clabe: string;
    accountNumber: string;
    paymentConceptPrefix: string;
    instructions: string;
  };
  kitItems: {
    id: string;
    title: string;
    description: string;
    icon: string;
    provisionalNote?: string;
  }[];
  categories: {
    id: string;
    name: string;
    ageRange: string;
    gender: 'Femenil' | 'Varonil' | 'Mixto';
    type: 'Competitiva' | 'Recreativa';
  }[];
  prizes: {
    category: string;
    firstPlace: string;
    secondPlace: string;
    thirdPlace: string;
    provisional?: boolean;
  }[];
  routePoints: {
    name: string;
    kilometer: string;
    description: string;
    highlight: string;
  }[];
  sponsors: Sponsor[];
  faqs: {
    id: string;
    question: string;
    answer: string;
    category: string;
  }[];
}

export type ShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type RaceModality = 'Competitiva' | 'Recreativa';

export interface ParticipantInput {
  fullName: string;
  birthDate: string;
  age: number;
  gender: 'Femenil' | 'Varonil' | 'Otro';
  category: string;
  modality?: RaceModality;
  email: string;
  phone: string;
  city: string;
  state: string;
  emergencyContact: string;
  emergencyPhone: string;
  shirtSize: ShirtSize;
  clubOrTeam?: string;
  ambassadorCode?: string;
  waiverAccepted: boolean;
  privacyAccepted: boolean;
}

export interface Participant extends ParticipantInput {
  id: string;
  orderId: string;
  folio: string; // e.g. NNR-000001
  qrToken: string;
  qrCodeDataUrl?: string;
  kitDelivered: boolean;
  kitDeliveredAt?: string;
  kitDeliveredBy?: string;
  kitDeliveryNotes?: string;
  createdAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  unitPrice: number;
  discountApplied: number;
  modality?: RaceModality;
  lastEmailSentAt?: string;
  emailSentCount?: number;
  paymentReminderCount?: number;
  lastPaymentReminderAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. NNR-ORD-7492
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  participantsCount: number;
  stageId: string;
  stageName: string;
  modality?: string;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  ambassadorCodeUsed?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference: string;
  transferReceiptUrl?: string;
  transferReceiptUploadedAt?: string;
  transferNotes?: string;
  mercadopagoPaymentId?: string;
  mercadopagoPreferenceId?: string;
  mercadopagoInitPoint?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
  participants?: Participant[];
}

export interface KitDeliveryLog {
  id: string;
  participantId: string;
  folio: string;
  participantName: string;
  shirtSize: string;
  staffEmail: string;
  staffName: string;
  action: 'delivered' | 'reverted';
  notes?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: 'order' | 'participant' | 'stage' | 'ambassador' | 'config' | 'kit_delivery';
  entityId: string;
  performedBy: string;
  performedByRole: string;
  details: string;
  timestamp: string;
}

export interface PaymentWebhookLog {
  id: string;
  provider: 'mercadopago';
  eventType: string;
  externalId: string;
  payload: Record<string, unknown>;
  receivedAt: string;
  processed: boolean;
  statusMessage?: string;
}

export interface DashboardStats {
  totalRegistered: number;
  totalQuota: number;
  totalRevenue: number;
  totalConfirmed: number;
  pendingTransfersCount: number;
  kitsDeliveredCount: number;
  sizeBreakdown: Record<string, number>;
  ambassadorLeaderboard: {
    code: string;
    name: string;
    usageCount: number;
    totalSales: number;
    commissionEarned: number;
  }[];
  recentParticipants: Participant[];
}

export interface DatabaseUsageStats {
  date: string;
  freeTier: {
    maxDailyReads: number;
    maxDailyWrites: number;
    maxDailyDeletes: number;
    maxStorageMB: number;
  };
  currentUsage: {
    readsToday: number;
    writesToday: number;
    deletesToday: number;
    readsPercentage: number;
    writesPercentage: number;
    deletesPercentage: number;
    estimatedStorageMB: number;
    storagePercentage: number;
  };
  tierStatus: 'free_safe' | 'free_warning' | 'blaze_active';
  tierLabel: string;
  estimatedExtraCostUSD: number;
  estimatedExtraCostMXN: number;
  collectionBreakdown: {
    participantsCount: number;
    ordersCount: number;
    stagesCount: number;
    ambassadorsCount: number;
    logsCount: number;
    totalDocuments: number;
  };
  optimizationsActive: {
    inMemoryCacheTTL: string;
    atomicCountersEnabled: boolean;
    batchReadsOptimized: boolean;
    serverSideOnly: boolean;
  };
  recentOperations: {
    timestamp: string;
    type: 'READ' | 'WRITE' | 'DELETE' | 'CACHE_HIT';
    target: string;
    count: number;
  }[];
}
