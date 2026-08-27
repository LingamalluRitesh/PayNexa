import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';
import {
  LedgerAccount,
  JournalEntry,
  Posting,
  BalanceHold,
  PaymentIntent,
  Charge,
  Refund,
  Customer,
  PaymentMethod,
  VirtualCard,
  FraudRule,
  FraudAssessment,
  BlacklistEntry,
  WebhookEndpoint,
  WebhookDeliveryLog,
  Plan,
  Subscription,
  Invoice,
  Dispute,
  User,
  ApiKey,
  KycVerification,
} from '@paynexa/core';

export interface AuditLog {
  id: string;
  actorId: string;
  actorType: 'USER' | 'SYSTEM' | 'API_KEY';
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface IdempotencyEntry {
  id: string;
  key: string;
  merchantId: string;
  path: string;
  requestHash: string;
  responseStatus: number;
  responseBody: string;
  createdAt: string;
  expiresAt: string;
}

export interface DatabaseState {
  accounts: Record<string, LedgerAccount>;
  journalEntries: Record<string, JournalEntry>;
  postings: Record<string, Posting>;
  balanceHolds: Record<string, BalanceHold>;
  paymentIntents: Record<string, PaymentIntent>;
  charges: Record<string, Charge>;
  refunds: Record<string, Refund>;
  customers: Record<string, Customer>;
  paymentMethods: Record<string, PaymentMethod>;
  virtualCards: Record<string, VirtualCard>;
  fraudRules: Record<string, FraudRule>;
  fraudAssessments: Record<string, FraudAssessment>;
  blacklist: Record<string, BlacklistEntry>;
  webhookEndpoints: Record<string, WebhookEndpoint>;
  webhookDeliveryLogs: Record<string, WebhookDeliveryLog>;
  plans: Record<string, Plan>;
  subscriptions: Record<string, Subscription>;
  invoices: Record<string, Invoice>;
  disputes: Record<string, Dispute>;
  users: Record<string, User>;
  apiKeys: Record<string, ApiKey>;
  kycVerifications: Record<string, KycVerification>;
  auditLogs: Record<string, AuditLog>;
  idempotency: Record<string, IdempotencyEntry>;
}

function getInitialState(): DatabaseState {
  return {
    accounts: {},
    journalEntries: {},
    postings: {},
    balanceHolds: {},
    paymentIntents: {},
    charges: {},
    refunds: {},
    customers: {},
    paymentMethods: {},
    virtualCards: {},
    fraudRules: {},
    fraudAssessments: {},
    blacklist: {},
    webhookEndpoints: {},
    webhookDeliveryLogs: {},
    plans: {},
    subscriptions: {},
    invoices: {},
    disputes: {},
    users: {},
    apiKeys: {},
    kycVerifications: {},
    auditLogs: {},
    idempotency: {},
  };
}

export class PayNexaDatabase {
  private state: DatabaseState;
  private filePath: string;
  private isMemoryOnly: boolean;
  private saveTimeout: NodeJS.Timeout | null = null;
  private inTransaction: boolean = false;
  private transactionSnapshot: string | null = null;

  constructor(filePath?: string) {
    const rawPath = filePath || config.DATABASE_URL;
    this.isMemoryOnly = rawPath === ':memory:' || process.env.NODE_ENV === 'test';
    this.filePath = path.resolve(rawPath.endsWith('.json') ? rawPath : `${rawPath}.json`);
    this.state = getInitialState();
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    if (this.isMemoryOnly) return;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.state = { ...getInitialState(), ...parsed };
      }
    } catch (err) {
      console.warn('Could not load existing database file, initializing clean state:', (err as Error).message);
      this.state = getInitialState();
    }
  }

  public flush(): void {
    if (this.isMemoryOnly) return;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const tempFile = `${this.filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.state, null, 2), 'utf-8');
      fs.renameSync(tempFile, this.filePath);
    } catch (err) {
      console.error('Failed to flush database state to disk:', err);
    }
  }

  public schedulePersist(): void {
    if (this.isMemoryOnly || this.inTransaction) return;
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.flush();
    }, 100);
  }

  /**
   * Atomic Transaction Runner with ACID Isolation & Rollback
   */
  public transaction<T>(fn: (db: PayNexaDatabase) => T): T {
    if (this.inTransaction) {
      // Nested transaction - already in transactional context
      return fn(this);
    }

    this.inTransaction = true;
    this.transactionSnapshot = JSON.stringify(this.state);

    try {
      const result = fn(this);
      this.inTransaction = false;
      this.transactionSnapshot = null;
      this.schedulePersist();
      return result;
    } catch (err) {
      // Rollback to snapshot on error
      if (this.transactionSnapshot) {
        this.state = JSON.parse(this.transactionSnapshot);
      }
      this.inTransaction = false;
      this.transactionSnapshot = null;
      throw err;
    }
  }

  // Generic Repository Operations
  public table<K extends keyof DatabaseState>(tableName: K) {
    type RowType = DatabaseState[K][string];

    return {
      all: (): RowType[] => {
        return Object.values(this.state[tableName]) as RowType[];
      },
      get: (id: string): RowType | undefined => {
        return this.state[tableName][id] as RowType | undefined;
      },
      find: (predicate: (item: RowType) => boolean): RowType[] => {
        return (Object.values(this.state[tableName]) as RowType[]).filter(predicate);
      },
      findOne: (predicate: (item: RowType) => boolean): RowType | undefined => {
        return (Object.values(this.state[tableName]) as RowType[]).find(predicate);
      },
      insert: <T extends RowType>(item: T): T => {
        (this.state[tableName] as Record<string, RowType>)[(item as any).id] = item;
        this.schedulePersist();
        return item;
      },
      update: (id: string, updates: Partial<RowType>): RowType => {
        const existing = (this.state[tableName] as Record<string, RowType>)[id];
        if (!existing) {
          throw new Error(`Record with id ${id} not found in ${String(tableName)}`);
        }
        const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() } as RowType;
        (this.state[tableName] as Record<string, RowType>)[id] = updated;
        this.schedulePersist();
        return updated;
      },
      upsert: <T extends RowType>(item: T): RowType => {
        const existing = (this.state[tableName] as Record<string, RowType>)[(item as any).id];
        if (existing) {
          return this.table(tableName).update((item as any).id, item);
        }
        return this.table(tableName).insert(item);
      },
      delete: (id: string): boolean => {
        if (id in this.state[tableName]) {
          delete (this.state[tableName] as unknown as Record<string, unknown>)[id];
          this.schedulePersist();
          return true;
        }
        return false;
      },
      count: (): number => {
        return Object.keys(this.state[tableName]).length;
      },
      clear: (): void => {
        this.state[tableName] = {} as DatabaseState[K];
        this.schedulePersist();
      }
    };
  }

  public getRawState(): Readonly<DatabaseState> {
    return this.state;
  }
}

export const db = new PayNexaDatabase();
