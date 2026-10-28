import React, { createContext, useContext, useState, useEffect } from 'react';
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
  NavTab,
  PaymentMethod,
} from '../types';
import {
  INITIAL_USERS,
  ALLOWED_STAFF_NAMES,
  computeMemberTier,
  formatCurrency,
  generateNextId,
  hashPassword,
  verifyPassword,
} from '../data/initialData';
import { StorageService, sanitizeStaffName } from '../services/StorageService';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

interface StoreContextType {
  currentUser: UserAccount | null;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  books: Book[];
  categories: Category[];
  publishers: Publisher[];
  customers: Customer[];
  invoices: Invoice[];
  importSlips: ImportSlip[];
  exportSlips: ExportSlip[];
  stockChecks: StockCheckRecord[];
  pointHistory: PointHistoryItem[];
  users: UserAccount[];
  notifications: AppNotification[];
  discounts: DiscountCode[];
  settings: StoreSettings;
  rolePermissions: Record<string, string[]>;
  toasts: ToastMessage[];
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Auth
  login: (
    username: string,
    password: string,
    remember: boolean
  ) => { success: boolean; message: string };
  logout: () => void;
  changeOwnPassword: (
    currentPassword: string,
    newPassword: string
  ) => { success: boolean; message: string };

  // Toast & Notifications
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: string, read?: boolean) => void;
  markAllNotificationsRead: () => void;

  // Books
  addBook: (book: Omit<Book, 'soldCount'>) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;

  // Categories
  addCategory: (cat: Category) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => boolean;

  // Publishers
  addPublisher: (pub: Publisher) => void;
  updatePublisher: (pub: Publisher) => void;
  deletePublisher: (id: string) => boolean;

  // Stock & Import/Export
  createImportSlip: (slip: Omit<ImportSlip, 'id' | 'date' | 'totalAmount'>) => ImportSlip;
  createExportSlip: (slip: Omit<ExportSlip, 'id' | 'date' | 'totalQuantity'>) => {
    success: boolean;
    message: string;
    slip?: ExportSlip;
  };
  adjustBookStock: (bookId: string, newStock: number, newMinStock: number, reason: string) => void;

  // POS & Invoices
  createInvoice: (payload: {
    customerId: string | null;
    items: { bookId: string; quantity: number }[];
    discountAmount: number;
    discountCode?: string;
    pointsUsed: number;
    paymentMethod: PaymentMethod;
  }) => { success: boolean; message: string; invoice?: Invoice };
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;

  // Customers & Membership
  addCustomer: (
    cust: Omit<Customer, 'tier' | 'purchaseCount' | 'totalSpent' | 'joinedDate'>
  ) => Customer;
  updateCustomer: (cust: Customer) => void;
  deleteCustomer: (id: string) => void;
  adjustCustomerPoints: (
    customerId: string,
    mode: 'add' | 'subtract' | 'set',
    amount: number,
    note: string
  ) => void;

  // Users & Roles (Admin)
  updateUser: (user: UserAccount) => void;
  toggleUserActive: (id: string) => void;
  changeUserPassword: (id: string, newPass: string) => void;
  updateRolePermissions: (role: string, permissions: string[]) => void;

  // Settings & Discounts
  updateSettings: (newSettings: StoreSettings) => void;
  addDiscount: (discount: DiscountCode) => void;
  toggleDiscount: (code: string) => void;
  resetAllSampleData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function isAllowedStaff(name: string | undefined | null): boolean {
  if (!name) return false;
  return (ALLOWED_STAFF_NAMES as readonly string[]).includes(name.trim().toUpperCase());
}

function getNowFormatted(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Khởi tạo đồng bộ từ StorageService (ưu tiên đọc localStorage, không bao giờ ghi đè dữ liệu người dùng)
  const [initialDb] = useState(() => StorageService.loadInitialDatabase());

  const [users, setUsers] = useState<UserAccount[]>(initialDb.users);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() =>
    StorageService.loadAuthSession(initialDb.users)
  );
  const [activeTab, setActiveTab] = useState<NavTab>('tong-quan');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const [books, setBooks] = useState<Book[]>(initialDb.books);
  const [categories, setCategories] = useState<Category[]>(initialDb.categories);
  const [publishers, setPublishers] = useState<Publisher[]>(initialDb.publishers);
  const [customers, setCustomers] = useState<Customer[]>(initialDb.customers);
  const [invoices, setInvoices] = useState<Invoice[]>(initialDb.invoices);
  const [importSlips, setImportSlips] = useState<ImportSlip[]>(initialDb.importSlips);
  const [exportSlips, setExportSlips] = useState<ExportSlip[]>(initialDb.exportSlips);
  const [stockChecks, setStockChecks] = useState<StockCheckRecord[]>(initialDb.stockChecks);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>(initialDb.pointHistory);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialDb.notifications);
  const [discounts, setDiscounts] = useState<DiscountCode[]>(initialDb.discounts);
  const [settings, setSettings] = useState<StoreSettings[]>(() => [initialDb.settings])[0]
    ? useState<StoreSettings>(initialDb.settings)
    : useState<StoreSettings>(initialDb.settings);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(
    initialDb.rolePermissions
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Đồng bộ tự động mọi thay đổi state với localStorage
  useEffect(() => {
    StorageService.saveBooks(books);
  }, [books]);

  useEffect(() => {
    StorageService.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    StorageService.savePublishers(publishers);
  }, [publishers]);

  useEffect(() => {
    StorageService.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    StorageService.saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    StorageService.saveImportSlips(importSlips);
  }, [importSlips]);

  useEffect(() => {
    StorageService.saveExportSlips(exportSlips);
  }, [exportSlips]);

  useEffect(() => {
    StorageService.saveStockChecks(stockChecks);
  }, [stockChecks]);

  useEffect(() => {
    StorageService.savePointHistory(pointHistory);
  }, [pointHistory]);

  useEffect(() => {
    StorageService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    StorageService.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    StorageService.saveDiscounts(discounts);
  }, [discounts]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    StorageService.saveRolePermissions(rolePermissions);
  }, [rolePermissions]);

  const showToast = (
    title: string,
    message: string,
    type: ToastMessage['type'] = 'success'
  ) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addNotification = (
    title: string,
    message: string,
    type: AppNotification['type'] = 'info'
  ) => {
    setNotifications((prev) => {
      const newNotif: AppNotification = {
        id: generateNextId(
          prev.map((n) => n.id),
          'TB'
        ),
        title,
        message,
        time: 'Vừa xong',
        read: false,
        type,
      };
      const next = [newNotif, ...prev];
      StorageService.saveNotifications(next);
      return next;
    });
  };

  const markNotificationRead = (id: string, read?: boolean) => {
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, read: read !== undefined ? read : !n.read } : n
      );
      StorageService.saveNotifications(next);
      return next;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      StorageService.saveNotifications(next);
      return next;
    });
    showToast('Thông báo', 'Đã đánh dấu tất cả thông báo là đã đọc.', 'info');
  };

  // XÁC THỰC ĐĂNG NHẬP
  const login = (username: string, password: string, remember: boolean) => {
    const cleanUser = username.trim().toLowerCase();
    const matched = users.find((u) => u.username.toLowerCase() === cleanUser);

    if (!matched || !verifyPassword(password, matched.passwordHash)) {
      return {
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      };
    }

    if (!matched.active) {
      showToast('Tài khoản đã bị khóa.', 'Vui lòng liên hệ Quản trị viên để mở khóa.', 'danger');
      return {
        success: false,
        message: 'Tài khoản này đã bị khóa. Vui lòng liên hệ Quản trị viên.',
      };
    }

    setCurrentUser(matched);
    setActiveTab('tong-quan');
    StorageService.saveAuthSession(matched, remember);
    showToast('Đăng nhập thành công.', `Xin chào ${matched.fullName} (${matched.role})`, 'success');
    return { success: true, message: 'Đăng nhập thành công.' };
  };

  // ĐĂNG XUẤT
  const logout = () => {
    StorageService.clearAuthSession();
    setCurrentUser(null);
    setActiveTab('tong-quan');
    showToast('Đã đăng xuất', 'Phiên đăng nhập đã kết thúc.', 'info');
  };

  // ĐỔI MẬT KHẨU CÁ NHÂN
  const changeOwnPassword = (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      return { success: false, message: 'Phiên đăng nhập không hợp lệ.' };
    }
    const latestAccount = users.find((u) => u.id === currentUser.id);
    if (!latestAccount) {
      return { success: false, message: 'Không tìm thấy tài khoản.' };
    }
    if (!verifyPassword(currentPassword, latestAccount.passwordHash)) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
    }
    if (newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' };
    }

    const newHash = hashPassword(newPassword);
    const updatedUser: UserAccount = { ...latestAccount, passwordHash: newHash };
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      StorageService.saveUsers(next);
      return next;
    });
    setCurrentUser(updatedUser);
    showToast('Đổi mật khẩu thành công.', 'Mật khẩu mới của bạn đã được cập nhật.', 'success');
    return { success: true, message: 'Đổi mật khẩu thành công.' };
  };

  // BOOKS CRUD (Ghi ngay lập tức vào localStorage)
  const addBook = (bookData: Omit<Book, 'soldCount'>) => {
    const newBook: Book = { ...bookData, soldCount: 0 };
    setBooks((prev) => {
      const next = [newBook, ...prev];
      StorageService.saveBooks(next);
      return next;
    });
    addNotification(
      'Thêm sách mới',
      `Đã thêm sách "${newBook.title}" (${newBook.id}) vào hệ thống.`,
      'info'
    );
    showToast('Đã lưu sách', `Thêm mới sách "${newBook.title}" thành công.`);
  };

  const updateBook = (updated: Book) => {
    setBooks((prev) => {
      const next = prev.map((b) => (b.id === updated.id ? updated : b));
      StorageService.saveBooks(next);
      return next;
    });
    showToast('Cập nhật thành công', `Đã lưu thông tin sách "${updated.title}".`);
  };

  const deleteBook = (id: string) => {
    const target = books.find((b) => b.id === id);
    setBooks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      StorageService.saveBooks(next);
      return next;
    });
    if (target) {
      addNotification(
        'Xóa sách',
        `Đã xóa sách "${target.title}" (${target.id}) khỏi danh mục.`,
        'warning'
      );
      showToast('Đã xóa sách', `Sách "${target.title}" đã được xóa khỏi hệ thống.`, 'warning');
    }
  };

  // CATEGORIES CRUD
  const addCategory = (cat: Category) => {
    setCategories((prev) => {
      const next = [...prev, cat];
      StorageService.saveCategories(next);
      return next;
    });
    showToast('Thêm thể loại', `Đã thêm thể loại "${cat.name}".`);
  };

  const updateCategory = (cat: Category) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === cat.id ? cat : c));
      StorageService.saveCategories(next);
      return next;
    });
    setBooks((prev) => {
      const next = prev.map((b) =>
        b.categoryId === cat.id ? { ...b, categoryName: cat.name } : b
      );
      StorageService.saveBooks(next);
      return next;
    });
    showToast('Cập nhật thể loại', `Đã cập nhật thể loại "${cat.name}".`);
  };

  const deleteCategory = (id: string) => {
    const usedCount = books.filter((b) => b.categoryId === id).length;
    if (usedCount > 0) {
      showToast(
        'Không thể xóa',
        `Thể loại này đang có ${usedCount} đầu sách. Vui lòng chuyển sách sang thể loại khác trước.`,
        'danger'
      );
      return false;
    }
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      StorageService.saveCategories(next);
      return next;
    });
    showToast('Đã xóa thể loại', 'Xóa thể loại sách thành công.', 'warning');
    return true;
  };

  // PUBLISHERS CRUD
  const addPublisher = (pub: Publisher) => {
    setPublishers((prev) => {
      const next = [...prev, pub];
      StorageService.savePublishers(next);
      return next;
    });
    showToast('Thêm nhà xuất bản', `Đã thêm "${pub.name}".`);
  };

  const updatePublisher = (pub: Publisher) => {
    setPublishers((prev) => {
      const next = prev.map((p) => (p.id === pub.id ? pub : p));
      StorageService.savePublishers(next);
      return next;
    });
    setBooks((prev) => {
      const next = prev.map((b) =>
        b.publisherId === pub.id ? { ...b, publisherName: pub.name } : b
      );
      StorageService.saveBooks(next);
      return next;
    });
    showToast('Cập nhật NXB', `Đã cập nhật thông tin "${pub.name}".`);
  };

  const deletePublisher = (id: string) => {
    const usedCount = books.filter((b) => b.publisherId === id).length;
    if (usedCount > 0) {
      showToast(
        'Không thể xóa',
        `Nhà xuất bản này đang có ${usedCount} đầu sách trong hệ thống.`,
        'danger'
      );
      return false;
    }
    setPublishers((prev) => {
      const next = prev.filter((p) => p.id !== id);
      StorageService.savePublishers(next);
      return next;
    });
    showToast('Đã xóa NXB', 'Xóa nhà xuất bản thành công.', 'warning');
    return true;
  };

  // IMPORT SLIP (Nhập hàng lưu bền vững cả phiếu nhập và tồn kho sách)
  const createImportSlip = (slipData: Omit<ImportSlip, 'id' | 'date' | 'totalAmount'>) => {
    const id = generateNextId(
      importSlips.map((s) => s.id),
      'PN'
    );
    const totalAmount = slipData.items.reduce((sum, item) => sum + item.lineTotal, 0);
    const validStaff = isAllowedStaff(slipData.staffName)
      ? slipData.staffName.trim().toUpperCase()
      : currentUser?.fullName || 'PHẠM NGỌC KHÁNH';

    const newSlip: ImportSlip = {
      ...slipData,
      staffName: validStaff,
      id,
      date: getNowFormatted(),
      totalAmount,
    };

    setImportSlips((prev) => {
      const next = [newSlip, ...prev];
      StorageService.saveImportSlips(next);
      return next;
    });

    setBooks((prev) => {
      const next = prev.map((book) => {
        const importedItem = slipData.items.find((i) => i.bookId === book.id);
        if (!importedItem) return book;
        return {
          ...book,
          stock: book.stock + importedItem.quantity,
          importPrice:
            importedItem.importPrice > 0 ? importedItem.importPrice : book.importPrice,
        };
      });
      StorageService.saveBooks(next);
      return next;
    });

    addNotification(
      'Phiếu nhập mới',
      `Phiếu nhập ${id} do ${validStaff} thực hiện đã được lưu (${formatCurrency(totalAmount)}).`,
      'success'
    );
    showToast('Lưu phiếu nhập thành công', `Mã phiếu ${id} - Đã cập nhật số lượng tồn kho.`);
    return newSlip;
  };

  // EXPORT SLIP (Xuất hàng lưu bền vững cả phiếu xuất và tồn kho sách)
  const createExportSlip = (slipData: Omit<ExportSlip, 'id' | 'date' | 'totalQuantity'>) => {
    for (const item of slipData.items) {
      const targetBook = books.find((b) => b.id === item.bookId);
      if (!targetBook || targetBook.stock < item.quantity) {
        return {
          success: false,
          message: `Sách "${item.bookTitle}" chỉ còn ${targetBook?.stock ?? 0} cuốn trong kho, không đủ để xuất ${item.quantity} cuốn.`,
        };
      }
    }

    const id = generateNextId(
      exportSlips.map((s) => s.id),
      'PX'
    );
    const totalQuantity = slipData.items.reduce((sum, item) => sum + item.quantity, 0);
    const validStaff = isAllowedStaff(slipData.staffName)
      ? slipData.staffName.trim().toUpperCase()
      : currentUser?.fullName || 'PHẠM NGỌC KHÁNH';

    const newSlip: ExportSlip = {
      ...slipData,
      staffName: validStaff,
      id,
      date: getNowFormatted(),
      totalQuantity,
    };

    setExportSlips((prev) => {
      const next = [newSlip, ...prev];
      StorageService.saveExportSlips(next);
      return next;
    });

    setBooks((prev) => {
      const next = prev.map((book) => {
        const exported = slipData.items.find((i) => i.bookId === book.id);
        if (!exported) return book;
        const updatedStock = Math.max(0, book.stock - exported.quantity);
        if (updatedStock === 0) {
          addNotification(
            'Cảnh báo hết hàng',
            `Sách "${book.title}" đã hết hàng sau khi xuất kho.`,
            'danger'
          );
        } else if (updatedStock <= book.minStock) {
          addNotification(
            'Sách sắp hết hàng',
            `Sách "${book.title}" sắp hết hàng (còn ${updatedStock} cuốn).`,
            'warning'
          );
        }
        return {
          ...book,
          stock: updatedStock,
        };
      });
      StorageService.saveBooks(next);
      return next;
    });

    addNotification(
      'Phiếu xuất kho',
      `Phiếu xuất ${id} (${totalQuantity} cuốn) do ${validStaff} thực hiện đã được lưu.`,
      'info'
    );
    showToast('Lưu phiếu xuất thành công', `Mã phiếu ${id} - Đã trừ số lượng tồn kho tương ứng.`);
    return { success: true, message: 'Lưu phiếu xuất thành công', slip: newSlip };
  };

  // STOCK ADJUSTMENT / CHECK
  const adjustBookStock = (
    bookId: string,
    newStock: number,
    newMinStock: number,
    reason: string
  ) => {
    const target = books.find((b) => b.id === bookId);
    if (!target) return;

    const staffPerformer = sanitizeStaffName(currentUser?.fullName, 'PHẠM NGỌC KHÁNH');
    const record: StockCheckRecord = {
      id: generateNextId(
        stockChecks.map((s) => s.id),
        'KK'
      ),
      date: getNowFormatted(),
      staffName: staffPerformer,
      bookId: target.id,
      bookTitle: target.title,
      oldStock: target.stock,
      newStock,
      difference: newStock - target.stock,
      reason: reason || 'Kiểm kê và điều chỉnh tồn kho thực tế',
    };

    setStockChecks((prev) => {
      const next = [record, ...prev];
      StorageService.saveStockChecks(next);
      return next;
    });

    setBooks((prev) => {
      const next = prev.map((b) =>
        b.id === bookId
          ? { ...b, stock: Math.max(0, newStock), minStock: Math.max(1, newMinStock) }
          : b
      );
      StorageService.saveBooks(next);
      return next;
    });

    showToast(
      'Kiểm kê kho',
      `Đã cập nhật tồn kho sách "${target.title}" thành ${newStock} cuốn.`
    );
  };

  // POS CHECKOUT & INVOICE CREATION (Bán hàng lưu bền vững cả hóa đơn, tồn kho, khách hàng và điểm)
  const createInvoice = (payload: {
    customerId: string | null;
    items: { bookId: string; quantity: number }[];
    discountAmount: number;
    discountCode?: string;
    pointsUsed: number;
    paymentMethod: PaymentMethod;
  }) => {
    if (payload.items.length === 0) {
      return { success: false, message: 'Vui lòng chọn ít nhất 1 quyển sách để thanh toán.' };
    }

    for (const item of payload.items) {
      const book = books.find((b) => b.id === item.bookId);
      if (!book || book.stock < item.quantity) {
        return {
          success: false,
          message: `Sách "${book?.title || item.bookId}" không đủ tồn kho (hiện còn ${book?.stock || 0} cuốn).`,
        };
      }
    }

    const invoiceItems = payload.items.map((item) => {
      const book = books.find((b) => b.id === item.bookId)!;
      return {
        bookId: book.id,
        bookTitle: book.title,
        quantity: item.quantity,
        unitPrice: book.sellPrice,
        importPrice: book.importPrice,
        lineTotal: book.sellPrice * item.quantity,
      };
    });

    const subtotal = invoiceItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const pointDiscountMoney = payload.pointsUsed * settings.pointRedeemValue;
    const totalAmount = Math.max(0, subtotal - payload.discountAmount - pointDiscountMoney);
    const pointsEarned = payload.customerId
      ? Math.floor(totalAmount / Math.max(1000, settings.pointEarnRate))
      : 0;

    const customerObj = payload.customerId
      ? customers.find((c) => c.id === payload.customerId) || null
      : null;

    const invoiceId = generateNextId(
      invoices.map((i) => i.id),
      'HD'
    );
    const nowStr = getNowFormatted();
    const staffPerformer = sanitizeStaffName(currentUser?.fullName, 'ĐẶNG THÙY LINH');

    const newInvoice: Invoice = {
      id: invoiceId,
      date: nowStr,
      customerId: customerObj ? customerObj.id : null,
      customerName: customerObj ? customerObj.name : 'Khách lẻ vãng lai',
      staffName: staffPerformer,
      items: invoiceItems,
      subtotal,
      discountAmount: payload.discountAmount,
      discountCode: payload.discountCode,
      pointsUsed: payload.pointsUsed,
      pointsEarned,
      totalAmount,
      paymentMethod: payload.paymentMethod,
      status: 'Đã thanh toán',
    };

    setInvoices((prev) => {
      const next = [newInvoice, ...prev];
      StorageService.saveInvoices(next);
      return next;
    });

    setBooks((prev) => {
      const next = prev.map((book) => {
        const bought = payload.items.find((i) => i.bookId === book.id);
        if (!bought) return book;
        const newStock = Math.max(0, book.stock - bought.quantity);
        if (newStock === 0) {
          addNotification('Sách hết hàng', `Sách "${book.title}" đã hết hàng.`, 'danger');
        } else if (newStock <= book.minStock) {
          addNotification(
            'Sách sắp hết hàng',
            `Sách "${book.title}" sắp hết hàng (còn ${newStock} cuốn).`,
            'warning'
          );
        }
        return {
          ...book,
          stock: newStock,
          soldCount: book.soldCount + bought.quantity,
        };
      });
      StorageService.saveBooks(next);
      return next;
    });

    if (customerObj) {
      const afterUsePoints = Math.max(0, customerObj.points - payload.pointsUsed);
      const finalPoints = afterUsePoints + pointsEarned;
      const newTotalSpent = customerObj.totalSpent + totalAmount;
      const newTier = computeMemberTier(newTotalSpent, finalPoints);

      setCustomers((prev) => {
        const next = prev.map((c) =>
          c.id === customerObj.id
            ? {
                ...c,
                points: finalPoints,
                purchaseCount: c.purchaseCount + 1,
                totalSpent: newTotalSpent,
                tier: newTier,
              }
            : c
        );
        StorageService.saveCustomers(next);
        return next;
      });

      const newHistoryEntries: PointHistoryItem[] = [];
      if (payload.pointsUsed > 0) {
        newHistoryEntries.push({
          id: `LS_${Date.now()}_1`,
          date: nowStr,
          customerId: customerObj.id,
          customerName: customerObj.name,
          change: -payload.pointsUsed,
          balanceAfter: afterUsePoints,
          type: 'Sử dụng điểm',
          note: `Sử dụng ${payload.pointsUsed} điểm cho hóa đơn ${invoiceId}`,
          staffName: staffPerformer,
        });
      }
      if (pointsEarned > 0) {
        newHistoryEntries.push({
          id: `LS_${Date.now()}_2`,
          date: nowStr,
          customerId: customerObj.id,
          customerName: customerObj.name,
          change: pointsEarned,
          balanceAfter: finalPoints,
          type: 'Tích điểm mua hàng',
          note: `Tích điểm từ hóa đơn ${invoiceId}`,
          staffName: staffPerformer,
        });
      }
      if (newHistoryEntries.length > 0) {
        setPointHistory((prev) => {
          const next = [...newHistoryEntries, ...prev];
          StorageService.savePointHistory(next);
          return next;
        });
      }
    }

    addNotification(
      'Thanh toán thành công',
      `Hóa đơn ${invoiceId} đã thanh toán thành công (${formatCurrency(totalAmount)}).`,
      'success'
    );
    showToast(
      'Thanh toán thành công',
      `Hóa đơn ${invoiceId} (${formatCurrency(totalAmount)}) đã được lưu và trừ tồn kho.`
    );

    return { success: true, message: 'Thanh toán thành công', invoice: newInvoice };
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices((prev) => {
      const next = prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv));
      StorageService.saveInvoices(next);
      return next;
    });
    showToast('Cập nhật hóa đơn', `Đã đổi trạng thái hóa đơn ${invoiceId} sang "${status}".`);
  };

  // CUSTOMERS & POINTS
  const addCustomer = (
    custData: Omit<Customer, 'tier' | 'purchaseCount' | 'totalSpent' | 'joinedDate'>
  ) => {
    const tier = computeMemberTier(0, custData.points);
    const newCustomer: Customer = {
      ...custData,
      tier,
      purchaseCount: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    setCustomers((prev) => {
      const next = [newCustomer, ...prev];
      StorageService.saveCustomers(next);
      return next;
    });
    showToast('Thêm khách hàng', `Đã thêm khách hàng "${newCustomer.name}".`);
    return newCustomer;
  };

  const updateCustomer = (cust: Customer) => {
    const updatedTier = computeMemberTier(cust.totalSpent, cust.points);
    setCustomers((prev) => {
      const next = prev.map((c) => (c.id === cust.id ? { ...cust, tier: updatedTier } : c));
      StorageService.saveCustomers(next);
      return next;
    });
    showToast('Cập nhật khách hàng', `Đã lưu thông tin khách hàng "${cust.name}".`);
  };

  const deleteCustomer = (id: string) => {
    const target = customers.find((c) => c.id === id);
    setCustomers((prev) => {
      const next = prev.filter((c) => c.id !== id);
      StorageService.saveCustomers(next);
      return next;
    });
    if (target) {
      showToast('Đã xóa khách hàng', `Đã xóa khách hàng "${target.name}".`, 'warning');
    }
  };

  const adjustCustomerPoints = (
    customerId: string,
    mode: 'add' | 'subtract' | 'set',
    amount: number,
    note: string
  ) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    let newPoints = cust.points;
    let change = 0;
    let historyType: PointHistoryItem['type'] = 'Điều chỉnh điểm';

    if (mode === 'add') {
      newPoints = cust.points + amount;
      change = amount;
      historyType = 'Cộng điểm thủ công';
    } else if (mode === 'subtract') {
      newPoints = Math.max(0, cust.points - amount);
      change = newPoints - cust.points;
      historyType = 'Trừ điểm thủ công';
    } else {
      newPoints = Math.max(0, amount);
      change = newPoints - cust.points;
      historyType = 'Điều chỉnh điểm';
    }

    const newTier = computeMemberTier(cust.totalSpent, newPoints);

    setCustomers((prev) => {
      const next = prev.map((c) =>
        c.id === customerId ? { ...c, points: newPoints, tier: newTier } : c
      );
      StorageService.saveCustomers(next);
      return next;
    });

    const staffPerformer = sanitizeStaffName(currentUser?.fullName, 'LÊ THỊ THANH HƯƠNG');
    const logItem: PointHistoryItem = {
      id: generateNextId(
        pointHistory.map((p) => p.id),
        'LS'
      ),
      date: getNowFormatted(),
      customerId: cust.id,
      customerName: cust.name,
      change,
      balanceAfter: newPoints,
      type: historyType,
      note: note || `${historyType} tại quầy`,
      staffName: staffPerformer,
    };

    setPointHistory((prev) => {
      const next = [logItem, ...prev];
      StorageService.savePointHistory(next);
      return next;
    });
    showToast(
      'Cập nhật điểm khách hàng',
      `Điểm của "${cust.name}" hiện tại là ${newPoints} điểm (${newTier}).`
    );
  };

  // USERS & ROLES (Chỉ Quản trị viên mới được phép thay đổi)
  const updateUser = (updated: UserAccount) => {
    if (currentUser?.role !== 'Quản trị viên') {
      showToast(
        'Không đủ quyền',
        'Chỉ Quản trị viên mới được phép thay đổi thông tin tài khoản.',
        'danger'
      );
      return;
    }
    const official = INITIAL_USERS.find((u) => u.id === updated.id);
    if (!official) return;

    const safeUpdated: UserAccount = {
      ...updated,
      fullName: official.fullName,
    };

    setUsers((prev) => {
      const next = prev.map((u) => (u.id === safeUpdated.id ? safeUpdated : u));
      StorageService.saveUsers(next);
      return next;
    });
    if (currentUser?.id === safeUpdated.id) {
      setCurrentUser(safeUpdated);
    }
    showToast('Cập nhật tài khoản', `Đã lưu vai trò và thông tin cho "${safeUpdated.fullName}".`);
  };

  const toggleUserActive = (id: string) => {
    if (currentUser?.role !== 'Quản trị viên') {
      showToast(
        'Không đủ quyền',
        'Chỉ Quản trị viên mới được phép khóa/mở khóa tài khoản.',
        'danger'
      );
      return;
    }
    if (currentUser?.id === id) {
      showToast('Không thể khóa', 'Bạn không thể tự khóa tài khoản đang đăng nhập.', 'danger');
      return;
    }
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id !== id) return u;
        const nextActive = !u.active;
        showToast(
          nextActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
          `Tài khoản "${u.fullName}" hiện ở trạng thái: ${nextActive ? 'Hoạt động' : 'Đã khóa'}.`,
          nextActive ? 'success' : 'warning'
        );
        return { ...u, active: nextActive };
      });
      StorageService.saveUsers(next);
      return next;
    });
  };

  const changeUserPassword = (id: string, newPass: string) => {
    if (currentUser?.role !== 'Quản trị viên') {
      showToast('Không đủ quyền', 'Chỉ Quản trị viên mới được phép đặt lại mật khẩu.', 'danger');
      return;
    }
    const hashed = hashPassword(newPass);
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, passwordHash: hashed } : u));
      StorageService.saveUsers(next);
      return next;
    });
    showToast('Đổi mật khẩu thành công.', 'Đã cập nhật mật khẩu mới cho tài khoản.');
  };

  const updateRolePermissions = (role: string, permissions: string[]) => {
    if (currentUser?.role !== 'Quản trị viên') {
      showToast(
        'Không đủ quyền',
        'Chỉ Quản trị viên mới được phép điều chỉnh phân quyền.',
        'danger'
      );
      return;
    }
    setRolePermissions((prev) => {
      const next = {
        ...prev,
        [role]: permissions,
      };
      StorageService.saveRolePermissions(next);
      return next;
    });
    showToast('Phân quyền', `Đã lưu cấu hình phân quyền cho vai trò "${role}".`);
  };

  // SETTINGS & DISCOUNTS
  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    showToast('Lưu cài đặt', 'Cấu hình hệ thống nhà sách đã được cập nhật và lưu lại.');
  };

  const addDiscount = (discount: DiscountCode) => {
    setDiscounts((prev) => {
      const next = [discount, ...prev.filter((d) => d.code !== discount.code)];
      StorageService.saveDiscounts(next);
      return next;
    });
    showToast('Thêm mã giảm giá', `Đã lưu mã khuyến mãi "${discount.code}".`);
  };

  const toggleDiscount = (code: string) => {
    setDiscounts((prev) => {
      const next = prev.map((d) => (d.code === code ? { ...d, active: !d.active } : d));
      StorageService.saveDiscounts(next);
      return next;
    });
    showToast('Cập nhật khuyến mãi', `Đã thay đổi trạng thái mã "${code}".`);
  };

  const resetAllSampleData = () => {
    const resetSnap = StorageService.resetToSampleData();
    setBooks(resetSnap.books);
    setCategories(resetSnap.categories);
    setPublishers(resetSnap.publishers);
    setCustomers(resetSnap.customers);
    setInvoices(resetSnap.invoices);
    setImportSlips(resetSnap.importSlips);
    setExportSlips(resetSnap.exportSlips);
    setStockChecks(resetSnap.stockChecks);
    setPointHistory(resetSnap.pointHistory);
    setUsers(resetSnap.users);
    setNotifications(resetSnap.notifications);
    setDiscounts(resetSnap.discounts);
    setSettings(resetSnap.settings);
    setRolePermissions(resetSnap.rolePermissions);
    if (currentUser) {
      const refreshedCurrent =
        resetSnap.users.find((u) => u.id === currentUser.id) || resetSnap.users[0];
      setCurrentUser(refreshedCurrent);
    }
    showToast(
      'Khôi phục dữ liệu mẫu',
      'Đã xóa dữ liệu hiện tại và khôi phục dữ liệu mẫu ban đầu thành công.',
      'info'
    );
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        activeTab,
        setActiveTab,
        books,
        categories,
        publishers,
        customers,
        invoices,
        importSlips,
        exportSlips,
        stockChecks,
        pointHistory,
        users,
        notifications,
        discounts,
        settings,
        rolePermissions,
        toasts,
        globalSearchQuery,
        setGlobalSearchQuery,
        login,
        logout,
        changeOwnPassword,
        showToast,
        removeToast,
        markNotificationRead,
        markAllNotificationsRead,
        addBook,
        updateBook,
        deleteBook,
        addCategory,
        updateCategory,
        deleteCategory,
        addPublisher,
        updatePublisher,
        deletePublisher,
        createImportSlip,
        createExportSlip,
        adjustBookStock,
        createInvoice,
        updateInvoiceStatus,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        adjustCustomerPoints,
        updateUser,
        toggleUserActive,
        changeUserPassword,
        updateRolePermissions,
        updateSettings,
        addDiscount,
        toggleDiscount,
        resetAllSampleData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
