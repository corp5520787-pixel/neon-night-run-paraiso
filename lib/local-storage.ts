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
import { fullBackupSnapshot } from './full-snapshot';

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
  return fullBackupSnapshot;
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
