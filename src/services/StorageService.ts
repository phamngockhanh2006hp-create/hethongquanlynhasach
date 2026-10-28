import {
  Book,
  Category,
  Publisher,
  Customer,
  Invoice,
  ImportSlip,
  ExportSlip,
  StockCheckRecord,
  PointHistoryItem,
  UserAccount,
  AppNotification,
  DiscountCode,
  StoreSettings,
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_CATEGORIES,
  INITIAL_PUBLISHERS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_IMPORT_SLIPS,
  INITIAL_EXPORT_SLIPS,
  INITIAL_STOCK_CHECKS,
  INITIAL_POINT_HISTORY,
  INITIAL_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DISCOUNTS,
  INITIAL_SETTINGS,
  ROLE_DEFAULT_PERMISSIONS,
  ALLOWED_STAFF_NAMES,
} from '../data/initialData';

// Danh sách các key chuẩn hóa trong localStorage phục vụ lưu trữ bền vững
export const STORAGE_KEYS = {
  INITIALIZED: 'bookstore_initialized',
  DATABASE: 'bookstore_database',
  BOOKS: 'bookstore_books',
  CATEGORIES: 'bookstore_categories',
  AUTHORS: 'bookstore_authors',
  PUBLISHERS: 'bookstore_publishers',
  SUPPLIERS: 'bookstore_suppliers',
  CUSTOMERS: 'bookstore_customers',
  MEMBERS: 'bookstore_members',
  USERS: 'bookstore_users',
  ROLES_PERMISSIONS: 'bookstore_roles_permissions',
  IMPORT_SLIPS: 'bookstore_import_slips',
  EXPORT_SLIPS: 'bookstore_export_slips',
  INVOICES: 'bookstore_invoices',
  ORDERS: 'bookstore_orders',
  INVENTORY_TRANSACTIONS: 'bookstore_inventory_transactions',
  POINT_HISTORY: 'bookstore_point_history',
  SETTINGS: 'bookstore_settings',
  DISCOUNTS: 'bookstore_discounts',
  NOTIFICATIONS: 'bookstore_notifications',
  AUTH_SESSION: 'bookstore_auth_session',
} as const;

const LEGACY_PREFIX = 'nhasach_v1_';
const LEGACY_AUTH_KEY = 'nhasach_v3_auth_session';

export interface AuthSessionData {
  userId: string;
  username: string;
  role: string;
  rememberLogin: boolean;
}

export interface BookstoreDatabaseSnapshot {
  books: Book[];
  categories: Category[];
  authors: string[];
  publishers: Publisher[];
  suppliers: string[];
  customers: Customer[];
  users: UserAccount[];
  rolePermissions: Record<string, string[]>;
  importSlips: ImportSlip[];
  exportSlips: ExportSlip[];
  invoices: Invoice[];
  stockChecks: StockCheckRecord[];
  pointHistory: PointHistoryItem[];
  settings: StoreSettings;
  discounts: DiscountCode[];
  notifications: AppNotification[];
  updatedAt: string;
}

export function sanitizeStaffName(
  name: string | undefined | null,
  fallback: (typeof ALLOWED_STAFF_NAMES)[number]
): string {
  if (!name) return fallback;
  const upper = name.trim().toUpperCase();
  if ((ALLOWED_STAFF_NAMES as readonly string[]).includes(upper)) {
    return upper;
  }
  return fallback;
}

function sanitizeUsersList(rawUsers: unknown): UserAccount[] {
  if (!Array.isArray(rawUsers) || rawUsers.length === 0) {
    return INITIAL_USERS;
  }
  return INITIAL_USERS.map((officialUser) => {
    const match = (rawUsers as Array<Partial<UserAccount>>).find(
      (u) =>
        u?.id === officialUser.id ||
        u?.fullName?.trim().toUpperCase() === officialUser.fullName
    );
    if (!match) return officialUser;

    const validHash =
      typeof match.passwordHash === 'string' && match.passwordHash.startsWith('sha256_sim_')
        ? match.passwordHash
        : officialUser.passwordHash;

    return {
      id: officialUser.id,
      fullName: officialUser.fullName,
      username: match.username?.trim() || officialUser.username,
      passwordHash: validHash,
      role: match.role || officialUser.role,
      active: typeof match.active === 'boolean' ? match.active : true,
      createdAt: officialUser.createdAt,
    };
  });
}

function extractAuthorsFromBooks(books: Book[]): string[] {
  return Array.from(new Set(books.map((b) => b.author.trim()).filter(Boolean)));
}

function extractSuppliersFromSlips(importSlips: ImportSlip[]): string[] {
  const defaults = [
    'Công ty Phát hành Sách FAHASA',
    'NXB Khoa học và Kỹ thuật',
    'Công ty Văn hóa và Truyền thông Nhã Nam',
  ];
  const fromSlips = importSlips.map((s) => s.supplier.trim()).filter(Boolean);
  return Array.from(new Set([...defaults, ...fromSlips]));
}

function readKeyOrLegacy<T>(primaryKey: string, legacySubKey: string | null, fallback: T): T {
  try {
    const rawPrimary = localStorage.getItem(primaryKey);
    if (rawPrimary !== null) {
      return JSON.parse(rawPrimary) as T;
    }
    if (legacySubKey) {
      const rawLegacy = localStorage.getItem(LEGACY_PREFIX + legacySubKey);
      if (rawLegacy !== null) {
        const parsed = JSON.parse(rawLegacy) as T;
        localStorage.setItem(primaryKey, JSON.stringify(parsed));
        return parsed;
      }
    }
    localStorage.setItem(primaryKey, JSON.stringify(fallback));
    return fallback;
  } catch {
    return fallback;
  }
}

function writeKey<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore storage quota errors
  }
}

export const StorageService = {
  /**
   * Khởi tạo và đọc toàn bộ dữ liệu khi mở website:
   * - Ưu tiên đọc dữ liệu đã lưu trong localStorage
   * - Chỉ tạo dữ liệu mẫu lần đầu nếu key chưa tồn tại (tuyệt đối không ghi đè dữ liệu người dùng)
   */
  loadInitialDatabase(): BookstoreDatabaseSnapshot {
    const rawBooks = readKeyOrLegacy<Book[]>(STORAGE_KEYS.BOOKS, 'books', INITIAL_BOOKS);
    const rawCategories = readKeyOrLegacy<Category[]>(
      STORAGE_KEYS.CATEGORIES,
      'categories',
      INITIAL_CATEGORIES
    );
    const rawPublishers = readKeyOrLegacy<Publisher[]>(
      STORAGE_KEYS.PUBLISHERS,
      'publishers',
      INITIAL_PUBLISHERS
    );
    const rawCustomers = readKeyOrLegacy<Customer[]>(
      STORAGE_KEYS.CUSTOMERS,
      'customers',
      INITIAL_CUSTOMERS
    );

    const rawUsers = readKeyOrLegacy<UserAccount[]>(STORAGE_KEYS.USERS, 'users', INITIAL_USERS);
    const sanitizedUsers = sanitizeUsersList(rawUsers);
    writeKey(STORAGE_KEYS.USERS, sanitizedUsers);

    const rawRolePermissions = readKeyOrLegacy<Record<string, string[]>>(
      STORAGE_KEYS.ROLES_PERMISSIONS,
      'rolePermissions',
      ROLE_DEFAULT_PERMISSIONS
    );

    const rawInvoices = readKeyOrLegacy<Invoice[]>(
      STORAGE_KEYS.INVOICES,
      'invoices',
      INITIAL_INVOICES
    ).map((inv) => ({
      ...inv,
      staffName: sanitizeStaffName(inv.staffName, 'ĐẶNG THÙY LINH'),
    }));
    writeKey(STORAGE_KEYS.INVOICES, rawInvoices);
    writeKey(STORAGE_KEYS.ORDERS, rawInvoices);

    const rawImportSlips = readKeyOrLegacy<ImportSlip[]>(
      STORAGE_KEYS.IMPORT_SLIPS,
      'importSlips',
      INITIAL_IMPORT_SLIPS
    ).map((slip) => ({
      ...slip,
      staffName: sanitizeStaffName(slip.staffName, 'PHẠM NGỌC KHÁNH'),
    }));
    writeKey(STORAGE_KEYS.IMPORT_SLIPS, rawImportSlips);

    const rawExportSlips = readKeyOrLegacy<ExportSlip[]>(
      STORAGE_KEYS.EXPORT_SLIPS,
      'exportSlips',
      INITIAL_EXPORT_SLIPS
    ).map((slip) => ({
      ...slip,
      staffName: sanitizeStaffName(slip.staffName, 'PHẠM NGỌC KHÁNH'),
    }));
    writeKey(STORAGE_KEYS.EXPORT_SLIPS, rawExportSlips);

    const rawStockChecks = readKeyOrLegacy<StockCheckRecord[]>(
      STORAGE_KEYS.INVENTORY_TRANSACTIONS,
      'stockChecks',
      INITIAL_STOCK_CHECKS
    ).map((sc) => ({
      ...sc,
      staffName: sanitizeStaffName(sc.staffName, 'PHẠM NGỌC KHÁNH'),
    }));
    writeKey(STORAGE_KEYS.INVENTORY_TRANSACTIONS, rawStockChecks);

    const rawPointHistory = readKeyOrLegacy<PointHistoryItem[]>(
      STORAGE_KEYS.POINT_HISTORY,
      'pointHistory',
      INITIAL_POINT_HISTORY
    ).map((ph) => ({
      ...ph,
      staffName: sanitizeStaffName(ph.staffName, 'ĐẶNG THÙY LINH'),
    }));
    writeKey(STORAGE_KEYS.POINT_HISTORY, rawPointHistory);

    const rawSettings = readKeyOrLegacy<StoreSettings>(
      STORAGE_KEYS.SETTINGS,
      'settings',
      INITIAL_SETTINGS
    );
    const rawDiscounts = readKeyOrLegacy<DiscountCode[]>(
      STORAGE_KEYS.DISCOUNTS,
      'discounts',
      INITIAL_DISCOUNTS
    );
    const rawNotifications = readKeyOrLegacy<AppNotification[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      'notifications',
      INITIAL_NOTIFICATIONS
    );

    const authors = extractAuthorsFromBooks(rawBooks);
    const suppliers = extractSuppliersFromSlips(rawImportSlips);
    writeKey(STORAGE_KEYS.AUTHORS, authors);
    writeKey(STORAGE_KEYS.SUPPLIERS, suppliers);
    writeKey(STORAGE_KEYS.MEMBERS, sanitizedUsers);
    writeKey(STORAGE_KEYS.INITIALIZED, true);

    const snapshot: BookstoreDatabaseSnapshot = {
      books: rawBooks,
      categories: rawCategories,
      authors,
      publishers: rawPublishers,
      suppliers,
      customers: rawCustomers,
      users: sanitizedUsers,
      rolePermissions: rawRolePermissions,
      importSlips: rawImportSlips,
      exportSlips: rawExportSlips,
      invoices: rawInvoices,
      stockChecks: rawStockChecks,
      pointHistory: rawPointHistory,
      settings: rawSettings,
      discounts: rawDiscounts,
      notifications: rawNotifications,
      updatedAt: new Date().toISOString(),
    };

    writeKey(STORAGE_KEYS.DATABASE, snapshot);
    return snapshot;
  },

  // Lưu ngay lập tức từng phân hệ dữ liệu vào localStorage
  saveBooks(books: Book[]): void {
    writeKey(STORAGE_KEYS.BOOKS, books);
    writeKey(STORAGE_KEYS.AUTHORS, extractAuthorsFromBooks(books));
    this.syncMasterDatabase({ books, authors: extractAuthorsFromBooks(books) });
  },

  saveCategories(categories: Category[]): void {
    writeKey(STORAGE_KEYS.CATEGORIES, categories);
    this.syncMasterDatabase({ categories });
  },

  savePublishers(publishers: Publisher[]): void {
    writeKey(STORAGE_KEYS.PUBLISHERS, publishers);
    this.syncMasterDatabase({ publishers });
  },

  saveCustomers(customers: Customer[]): void {
    writeKey(STORAGE_KEYS.CUSTOMERS, customers);
    this.syncMasterDatabase({ customers });
  },

  saveUsers(users: UserAccount[]): void {
    writeKey(STORAGE_KEYS.USERS, users);
    writeKey(STORAGE_KEYS.MEMBERS, users);
    this.syncMasterDatabase({ users });
  },

  saveRolePermissions(rolePermissions: Record<string, string[]>): void {
    writeKey(STORAGE_KEYS.ROLES_PERMISSIONS, rolePermissions);
    this.syncMasterDatabase({ rolePermissions });
  },

  saveImportSlips(importSlips: ImportSlip[]): void {
    const suppliers = extractSuppliersFromSlips(importSlips);
    writeKey(STORAGE_KEYS.IMPORT_SLIPS, importSlips);
    writeKey(STORAGE_KEYS.SUPPLIERS, suppliers);
    this.syncMasterDatabase({ importSlips, suppliers });
  },

  saveExportSlips(exportSlips: ExportSlip[]): void {
    writeKey(STORAGE_KEYS.EXPORT_SLIPS, exportSlips);
    this.syncMasterDatabase({ exportSlips });
  },

  saveInvoices(invoices: Invoice[]): void {
    writeKey(STORAGE_KEYS.INVOICES, invoices);
    writeKey(STORAGE_KEYS.ORDERS, invoices);
    this.syncMasterDatabase({ invoices });
  },

  saveStockChecks(stockChecks: StockCheckRecord[]): void {
    writeKey(STORAGE_KEYS.INVENTORY_TRANSACTIONS, stockChecks);
    this.syncMasterDatabase({ stockChecks });
  },

  savePointHistory(pointHistory: PointHistoryItem[]): void {
    writeKey(STORAGE_KEYS.POINT_HISTORY, pointHistory);
    this.syncMasterDatabase({ pointHistory });
  },

  saveSettings(settings: StoreSettings): void {
    writeKey(STORAGE_KEYS.SETTINGS, settings);
    this.syncMasterDatabase({ settings });
  },

  saveDiscounts(discounts: DiscountCode[]): void {
    writeKey(STORAGE_KEYS.DISCOUNTS, discounts);
    this.syncMasterDatabase({ discounts });
  },

  saveNotifications(notifications: AppNotification[]): void {
    writeKey(STORAGE_KEYS.NOTIFICATIONS, notifications);
    this.syncMasterDatabase({ notifications });
  },

  syncMasterDatabase(partial: Partial<BookstoreDatabaseSnapshot>): void {
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEYS.DATABASE);
      const existing = existingRaw ? (JSON.parse(existingRaw) as Partial<BookstoreDatabaseSnapshot>) : {};
      const merged = {
        ...existing,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.DATABASE, JSON.stringify(merged));
    } catch {
      // ignore
    }
  },

  // Quản lý Phiên đăng nhập (chỉ lưu userId, username, role, rememberLogin; không lưu mật khẩu)
  loadAuthSession(validUsers: UserAccount[]): UserAccount | null {
    try {
      const rawSession =
        sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) ||
        localStorage.getItem(STORAGE_KEYS.AUTH_SESSION) ||
        sessionStorage.getItem(LEGACY_AUTH_KEY) ||
        localStorage.getItem(LEGACY_AUTH_KEY);

      if (!rawSession) return null;

      const parsed = JSON.parse(rawSession) as Partial<AuthSessionData>;
      if (!parsed || !parsed.userId || !parsed.username) {
        return null;
      }

      const verifiedUser = validUsers.find(
        (u) =>
          u.id === parsed.userId &&
          u.username.toLowerCase() === parsed.username!.toLowerCase()
      );

      if (!verifiedUser || !verifiedUser.active) {
        this.clearAuthSession();
        return null;
      }

      return verifiedUser;
    } catch {
      return null;
    }
  },

  saveAuthSession(user: UserAccount, rememberLogin: boolean): void {
    const sessionPayload: AuthSessionData = {
      userId: user.id,
      username: user.username,
      role: user.role,
      rememberLogin,
    };
    const serialized = JSON.stringify(sessionPayload);
    try {
      if (rememberLogin) {
        localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, serialized);
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      } else {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, serialized);
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      }
      localStorage.removeItem(LEGACY_AUTH_KEY);
      sessionStorage.removeItem(LEGACY_AUTH_KEY);
    } catch {
      // ignore
    }
  },

  clearAuthSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      localStorage.removeItem(LEGACY_AUTH_KEY);
      sessionStorage.removeItem(LEGACY_AUTH_KEY);
      localStorage.removeItem(LEGACY_PREFIX + 'currentUser');
    } catch {
      // ignore
    }
  },

  /**
   * Khôi phục toàn bộ dữ liệu mẫu ban đầu khi người dùng xác nhận trong trang Cài đặt
   */
  resetToSampleData(): BookstoreDatabaseSnapshot {
    try {
      // Xóa các key cũ nếu có
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(LEGACY_PREFIX) || k.startsWith('bookstore_')) {
          if (k !== STORAGE_KEYS.AUTH_SESSION) {
            localStorage.removeItem(k);
          }
        }
      });
    } catch {
      // ignore
    }

    const authors = extractAuthorsFromBooks(INITIAL_BOOKS);
    const suppliers = extractSuppliersFromSlips(INITIAL_IMPORT_SLIPS);

    writeKey(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    writeKey(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    writeKey(STORAGE_KEYS.AUTHORS, authors);
    writeKey(STORAGE_KEYS.PUBLISHERS, INITIAL_PUBLISHERS);
    writeKey(STORAGE_KEYS.SUPPLIERS, suppliers);
    writeKey(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    writeKey(STORAGE_KEYS.USERS, INITIAL_USERS);
    writeKey(STORAGE_KEYS.MEMBERS, INITIAL_USERS);
    writeKey(STORAGE_KEYS.ROLES_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS);
    writeKey(STORAGE_KEYS.IMPORT_SLIPS, INITIAL_IMPORT_SLIPS);
    writeKey(STORAGE_KEYS.EXPORT_SLIPS, INITIAL_EXPORT_SLIPS);
    writeKey(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    writeKey(STORAGE_KEYS.ORDERS, INITIAL_INVOICES);
    writeKey(STORAGE_KEYS.INVENTORY_TRANSACTIONS, INITIAL_STOCK_CHECKS);
    writeKey(STORAGE_KEYS.POINT_HISTORY, INITIAL_POINT_HISTORY);
    writeKey(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    writeKey(STORAGE_KEYS.DISCOUNTS, INITIAL_DISCOUNTS);
    writeKey(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    writeKey(STORAGE_KEYS.INITIALIZED, true);

    const snapshot: BookstoreDatabaseSnapshot = {
      books: INITIAL_BOOKS,
      categories: INITIAL_CATEGORIES,
      authors,
      publishers: INITIAL_PUBLISHERS,
      suppliers,
      customers: INITIAL_CUSTOMERS,
      users: INITIAL_USERS,
      rolePermissions: ROLE_DEFAULT_PERMISSIONS,
      importSlips: INITIAL_IMPORT_SLIPS,
      exportSlips: INITIAL_EXPORT_SLIPS,
      invoices: INITIAL_INVOICES,
      stockChecks: INITIAL_STOCK_CHECKS,
      pointHistory: INITIAL_POINT_HISTORY,
      settings: INITIAL_SETTINGS,
      discounts: INITIAL_DISCOUNTS,
      notifications: INITIAL_NOTIFICATIONS,
      updatedAt: new Date().toISOString(),
    };

    writeKey(STORAGE_KEYS.DATABASE, snapshot);
    return snapshot;
  },
};
