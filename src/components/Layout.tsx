import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Boxes,
  PackagePlus,
  PackageMinus,
  ShoppingCart,
  FileText,
  Users,
  Award,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Check,
  ChevronDown,
  X,
  Menu,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { NavTab } from '../types';
import { formatCurrency, canAccessTab, ROLE_DEFAULT_PERMISSIONS } from '../data/initialData';

interface MenuItem {
  id: NavTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'tong-quan', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'quan-ly-sach', label: 'Quản lý sách', icon: BookOpen },
  { id: 'quan-ly-kho', label: 'Quản lý kho', icon: Boxes },
  { id: 'nhap-sach', label: 'Nhập sách', icon: PackagePlus },
  { id: 'xuat-sach', label: 'Xuất sách', icon: PackageMinus },
  { id: 'ban-hang', label: 'Bán hàng', icon: ShoppingCart },
  { id: 'hoa-don', label: 'Hóa đơn', icon: FileText },
  { id: 'khach-hang', label: 'Khách hàng', icon: Users },
  { id: 'thanh-vien', label: 'Thành viên', icon: Award },
  { id: 'nguoi-dung', label: 'Người dùng & phân quyền', icon: Shield },
  { id: 'bao-cao', label: 'Báo cáo & thống kê', icon: BarChart3 },
  { id: 'cai-dat', label: 'Cài đặt', icon: Settings },
];

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return 'NS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    logout,
    changeOwnPassword,
    rolePermissions,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    books,
    invoices,
    customers,
    toasts,
    removeToast,
    setGlobalSearchQuery,
  } = useStore();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal Hồ sơ cá nhân & Modal Đổi mật khẩu
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [showCurrPass, setShowCurrPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lọc danh sách menu theo đúng vai trò của người dùng đang đăng nhập
  const visibleMenuItems = MENU_ITEMS.filter((item) =>
    canAccessTab(currentUser?.role, item.id)
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentMenu = MENU_ITEMS.find((m) => m.id === activeTab) || MENU_ITEMS[0];

  const trimmedQuery = quickSearch.trim().toLowerCase();
  const matchedBooks = trimmedQuery
    ? books
        .filter(
          (b) =>
            b.title.toLowerCase().includes(trimmedQuery) ||
            b.id.toLowerCase().includes(trimmedQuery) ||
            b.author.toLowerCase().includes(trimmedQuery)
        )
        .slice(0, 4)
    : [];
  const matchedCustomers =
    trimmedQuery && canAccessTab(currentUser?.role, 'khach-hang')
      ? customers
          .filter(
            (c) =>
              c.name.toLowerCase().includes(trimmedQuery) ||
              c.phone.includes(trimmedQuery) ||
              c.id.toLowerCase().includes(trimmedQuery)
          )
          .slice(0, 3)
      : [];
  const matchedInvoices =
    trimmedQuery && canAccessTab(currentUser?.role, 'hoa-don')
      ? invoices
          .filter(
            (inv) =>
              inv.id.toLowerCase().includes(trimmedQuery) ||
              inv.customerName.toLowerCase().includes(trimmedQuery)
          )
          .slice(0, 3)
      : [];

  const handleOpenChangePass = () => {
    setShowUserDropdown(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassError('');
    setShowCurrPass(false);
    setShowNewPass(false);
    setShowConfPass(false);
    setShowChangePassModal(true);
  };

  const handleSubmitChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Nhập lại mật khẩu mới không trùng khớp.');
      return;
    }

    const res = changeOwnPassword(currentPassword, newPassword);
    if (!res.success) {
      setPassError(res.message);
      return;
    }
    setShowChangePassModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB] text-[#2C2520] flex">
      {/* Sidebar bên trái */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#EFE9DD] border-r border-[#DFD5C4] flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 no-print ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Tên: NHÀ SÁCH */}
        <div className="h-16 px-5 border-b border-[#DFD5C4] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('tong-quan')}
            className="flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#2A4B3C] text-white flex items-center justify-center font-display font-bold text-base">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-[#1E352B] block leading-none">
                NHÀ SÁCH
              </span>
              <span className="text-[11px] text-[#6E5E50] font-medium block mt-1">
                {currentUser?.role || 'Hệ thống quản lý'}
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-[#6E5E50] hover:text-[#2C2520]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Danh sách các menu thay đổi theo vai trò */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const displayLabel =
              item.id === 'quan-ly-sach' &&
              (currentUser?.role === 'Nhân viên bán hàng' || currentUser?.role === 'Nhân viên kho')
                ? 'Tra cứu sách'
                : item.label;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2A4B3C] text-white font-semibold shadow-xs'
                    : 'text-[#4A3F36] hover:bg-[#E4DCCB] hover:text-[#211C18]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#CBE0D5]' : 'text-[#78685A]'
                  }`}
                />
                <span className="truncate">{displayLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Nút Đăng xuất ở cuối Sidebar */}
        <div className="p-3 border-t border-[#DFD5C4]">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#8C2D2D] hover:bg-[#F5E1E1] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Lớp phủ trên màn hình nhỏ */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 lg:hidden no-print"
        />
      )}

      {/* Vùng nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Thanh trên cùng (Topbar) */}
        <header className="h-16 bg-[#FAF7F2] border-b border-[#E2D9C8] px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 no-print">
          {/* Bên trái: Nút mở menu + Tên trang hiện tại */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#D8CEBE] text-[#4A3F36] hover:bg-[#EFE9DD]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg md:text-xl font-bold text-[#2C2520] truncate">
              {currentMenu.label}
            </h1>
          </div>

          {/* Giữa: Ô tìm kiếm nhanh */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickSearch}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setQuickSearch(e.target.value);
                  setShowSearchDropdown(true);
                }}
                placeholder="Tìm nhanh mã sách, tên sách, hóa đơn, khách hàng..."
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-[#D8CEBE] rounded-lg text-sm text-[#2C2520] placeholder-[#9A8B7C] focus:outline-none focus:border-[#2A4B3C]"
              />
              {quickSearch && (
                <button
                  type="button"
                  onClick={() => setQuickSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#2C2520]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Kết quả tìm kiếm nhanh */}
            {showSearchDropdown && trimmedQuery && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#D8CEBE] rounded-xl shadow-lg p-3 z-50 max-h-96 overflow-y-auto">
                {matchedBooks.length === 0 &&
                matchedCustomers.length === 0 &&
                matchedInvoices.length === 0 ? (
                  <p className="text-xs text-[#7D6E61] py-3 text-center">
                    Không tìm thấy kết quả phù hợp cho "{quickSearch}".
                  </p>
                ) : (
                  <div className="space-y-3">
                    {matchedBooks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#78685A] px-2 mb-1">
                          Sách ({matchedBooks.length})
                        </p>
                        {matchedBooks.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setGlobalSearchQuery(b.id);
                              setActiveTab('quan-ly-sach');
                              setShowSearchDropdown(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F5EFE4] flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-mono-num font-semibold text-[#2A4B3C]">
                                {b.id}
                              </span>{' '}
                              · <span className="font-medium text-[#2C2520]">{b.title}</span>
                            </div>
                            <span className="font-mono-num text-[#6E5E50]">
                              Tồn: {b.stock} · {formatCurrency(b.sellPrice)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {matchedInvoices.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#78685A] px-2 mb-1">
                          Hóa đơn ({matchedInvoices.length})
                        </p>
                        {matchedInvoices.map((inv) => (
                          <button
                            key={inv.id}
                            type="button"
                            onClick={() => {
                              setGlobalSearchQuery(inv.id);
                              setActiveTab('hoa-don');
                              setShowSearchDropdown(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F5EFE4] flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-mono-num font-semibold text-[#2A4B3C]">
                                {inv.id}
                              </span>{' '}
                              · <span>{inv.customerName}</span>
                            </div>
                            <span className="font-mono-num font-medium">
                              {formatCurrency(inv.totalAmount)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {matchedCustomers.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#78685A] px-2 mb-1">
                          Khách hàng ({matchedCustomers.length})
                        </p>
                        {matchedCustomers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setGlobalSearchQuery(c.id);
                              setActiveTab('khach-hang');
                              setShowSearchDropdown(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F5EFE4] flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-mono-num font-semibold text-[#2A4B3C]">
                                {c.id}
                              </span>{' '}
                              · <span className="font-medium">{c.name}</span>
                            </div>
                            <span className="font-mono-num text-[#6E5E50]">{c.phone}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bên phải: Thông báo + Thông tin người dùng đang đăng nhập */}
          <div className="flex items-center gap-3">
            {/* Chuông thông báo */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-lg bg-white border border-[#D8CEBE] text-[#4A3F36] hover:bg-[#EFE9DD] transition-colors cursor-pointer"
                title="Thông báo hệ thống"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B93829] text-white text-[10px] font-mono-num font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#D8CEBE] rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#2C2520]">Thông báo hệ thống</h3>
                      <p className="text-xs text-[#78685A]">
                        Bạn có {unreadCount} thông báo chưa đọc
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-xs font-semibold text-[#2A4B3C] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Đọc tất cả</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#EFE9DD]">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-[#78685A]">
                        Hiện chưa có thông báo mới.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 transition-colors flex items-start justify-between gap-3 ${
                            n.read ? 'bg-white' : 'bg-[#F8F4EC]'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  n.type === 'danger'
                                    ? 'bg-[#B93829]'
                                    : n.type === 'warning'
                                    ? 'bg-[#C87D20]'
                                    : n.type === 'success'
                                    ? 'bg-[#2A4B3C]'
                                    : 'bg-[#6E5E50]'
                                }`}
                              />
                              <p className="text-xs font-bold text-[#2C2520] truncate">
                                {n.title}
                              </p>
                            </div>
                            <p className="text-xs text-[#54483E] mt-1 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[11px] text-[#8C7A6B] mt-1">{n.time}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => markNotificationRead(n.id, !n.read)}
                            className="text-[11px] font-medium text-[#2A4B3C] hover:underline shrink-0 cursor-pointer"
                          >
                            {n.read ? 'Chưa đọc' : 'Đã đọc'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Tài khoản góc trên bên phải: Chỉ hiển thị thông tin tài khoản hiện tại, Hồ sơ cá nhân, Đổi mật khẩu, Đăng xuất */}
            {currentUser && (
              <div ref={userRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg bg-white border border-[#D8CEBE] hover:bg-[#EFE9DD] transition-colors cursor-pointer"
                >
                  {/* Avatar dạng chữ cái */}
                  <div className="w-8 h-8 rounded-lg bg-[#2A4B3C] text-white font-display font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(currentUser.fullName)}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-[#2C2520] leading-tight">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] text-[#6E5E50] leading-tight mt-0.5">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#78685A]" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-68 bg-white border border-[#D8CEBE] rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2A4B3C] text-white font-display font-bold text-sm flex items-center justify-center shrink-0">
                        {getInitials(currentUser.fullName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#2C2520] truncate">
                          {currentUser.fullName}
                        </div>
                        <div className="text-xs font-semibold text-[#2A4B3C] mt-0.5">
                          {currentUser.role}
                        </div>
                        <div className="text-[11px] font-mono-num text-[#6E5E50] mt-0.5">
                          Tên đăng nhập: {currentUser.username}
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowProfileModal(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#3D332B] hover:bg-[#F7F3EB] flex items-center gap-2.5 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#2A4B3C]" />
                        <span>Hồ sơ cá nhân</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenChangePass}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#3D332B] hover:bg-[#F7F3EB] flex items-center gap-2.5 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-[#2A4B3C]" />
                        <span>Đổi mật khẩu</span>
                      </button>
                    </div>

                    <div className="p-2 border-t border-[#EFE9DD] bg-[#FAF7F2]">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-[#8C2D2D] hover:bg-[#F5E1E1] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất khỏi hệ thống</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Nội dung màn hình chức năng */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Modal Hồ sơ cá nhân */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 no-print">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                Hồ sơ cá nhân
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-[#6E5E50] hover:text-[#2C2520] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                <div className="w-12 h-12 rounded-xl bg-[#2A4B3C] text-white font-display font-bold text-base flex items-center justify-center shrink-0">
                  {getInitials(currentUser.fullName)}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#2C2520]">{currentUser.fullName}</div>
                  <div className="text-xs font-semibold text-[#2A4B3C] mt-0.5">
                    {currentUser.role}
                  </div>
                  <div className="text-[11px] font-mono-num text-[#6E5E50] mt-0.5">
                    Mã thành viên: {currentUser.id}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-[#EFE9DD]">
                  <span className="text-[#6E5E50]">Tên đăng nhập:</span>
                  <strong className="font-mono-num text-[#2C2520]">{currentUser.username}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-[#EFE9DD]">
                  <span className="text-[#6E5E50]">Vai trò:</span>
                  <strong className="text-[#2A4B3C]">{currentUser.role}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-[#EFE9DD]">
                  <span className="text-[#6E5E50]">Trạng thái tài khoản:</span>
                  <strong className="text-[#2A4B3C]">
                    {currentUser.active ? 'Đang hoạt động' : 'Đã khóa'}
                  </strong>
                </div>
                <div className="flex justify-between py-2 border-b border-[#EFE9DD]">
                  <span className="text-[#6E5E50]">Ngày tạo tài khoản:</span>
                  <strong className="font-mono-num text-[#2C2520]">
                    {currentUser.createdAt}
                  </strong>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 font-semibold text-[#3D332B] mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#2A4B3C]" />
                  <span>Quyền hạn được cấp:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    rolePermissions[currentUser.role] ||
                    ROLE_DEFAULT_PERMISSIONS[currentUser.role] ||
                    []
                  ).map((perm) => (
                    <span
                      key={perm}
                      className="px-2.5 py-1 rounded-md bg-[#F1F7F4] border border-[#C5DDD0] text-[#1D3B2D] font-medium"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    handleOpenChangePass();
                  }}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] bg-white hover:bg-[#EFE9DD] font-semibold text-[#2C2520] cursor-pointer"
                >
                  Đổi mật khẩu
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đổi mật khẩu cá nhân */}
      {showChangePassModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 no-print">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                Đổi mật khẩu
              </h3>
              <button
                type="button"
                onClick={() => setShowChangePassModal(false)}
                className="text-[#6E5E50] hover:text-[#2C2520] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitChangePass} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                <div className="font-bold text-[#2C2520]">{currentUser.fullName}</div>
                <div className="text-[#6E5E50] mt-0.5">
                  Tên đăng nhập: <strong className="font-mono-num">{currentUser.username}</strong> ·
                  Vai trò: <strong>{currentUser.role}</strong>
                </div>
              </div>

              {passError && (
                <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#E8B4B4] text-[#9B2C2C] font-medium">
                  {passError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">
                  Mật khẩu hiện tại *
                </label>
                <div className="relative">
                  <input
                    type={showCurrPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full pl-3 pr-9 py-2 bg-white border border-[#D8CEBE] rounded-lg focus:outline-none focus:border-[#2A4B3C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrPass(!showCurrPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#2C2520]"
                  >
                    {showCurrPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">
                  Mật khẩu mới (tối thiểu 6 ký tự) *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full pl-3 pr-9 py-2 bg-white border border-[#D8CEBE] rounded-lg focus:outline-none focus:border-[#2A4B3C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#2C2520]"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">
                  Nhập lại mật khẩu mới *
                </label>
                <div className="relative">
                  <input
                    type={showConfPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-3 pr-9 py-2 bg-white border border-[#D8CEBE] rounded-lg focus:outline-none focus:border-[#2A4B3C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfPass(!showConfPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#2C2520]"
                  >
                    {showConfPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer"
                >
                  Lưu mật khẩu mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hệ thống Toast Notification */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-md flex items-start justify-between gap-3 transition-all ${
              t.type === 'danger'
                ? 'bg-[#FDF3F2] border-[#E6B8B5] text-[#8C2626]'
                : t.type === 'warning'
                ? 'bg-[#FEF9EE] border-[#E8D09C] text-[#7D5112]'
                : t.type === 'info'
                ? 'bg-white border-[#D8CEBE] text-[#2C2520]'
                : 'bg-[#F1F7F4] border-[#ABC9B8] text-[#1D3B2D]'
            }`}
          >
            <div>
              <h4 className="text-xs font-bold">{t.title}</h4>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
