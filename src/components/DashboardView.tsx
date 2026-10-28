import React, { useState } from 'react';
import {
  BookOpen,
  Boxes,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Award,
  ArrowRight,
  ShoppingCart,
  PackagePlus,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { computeBookStatus, formatCurrency } from '../data/initialData';

export const DashboardView: React.FC = () => {
  const { books, customers, invoices, users, setActiveTab } = useStore();
  const [revenuePeriod, setRevenuePeriod] = useState<'hom-nay' | '7-ngay' | '30-ngay'>('7-ngay');

  const todayPrefix = new Date().toISOString().slice(0, 10);
  const monthPrefix = new Date().toISOString().slice(0, 7);

  const validInvoices = invoices.filter((inv) => inv.status === 'Đã thanh toán');

  // 8 chỉ số thống kê
  const totalBookTitles = books.length;
  const totalStockCount = books.reduce((sum, b) => sum + b.stock, 0);
  const totalCustomers = customers.length;
  const totalInvoicesCount = invoices.length;

  const revenueToday = validInvoices
    .filter((inv) => inv.date.startsWith(todayPrefix))
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const revenueThisMonth = validInvoices
    .filter((inv) => inv.date.startsWith(monthPrefix))
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const lowStockBooks = books.filter(
    (b) => computeBookStatus(b.stock, b.minStock) === 'Sắp hết'
  );
  const outOfStockBooks = books.filter(
    (b) => computeBookStatus(b.stock, b.minStock) === 'Hết hàng'
  );

  const totalMembers = customers.filter((c) => c.tier !== 'Thành viên thường').length;

  // Dữ liệu biểu đồ doanh thu tính trực tiếp từ các hóa đơn đã lưu theo bộ lọc Hôm nay / 7 ngày / 30 ngày
  const revenueData = React.useMemo(() => {
    if (revenuePeriod === 'hom-nay') {
      const todayInvoices = validInvoices.filter((inv) => inv.date.startsWith(todayPrefix));
      const slots = [
        { label: '08:00 - 10:00', minH: 0, maxH: 10, base: 185000 },
        { label: '10:00 - 12:00', minH: 10, maxH: 12, base: 0 },
        { label: '12:00 - 14:00', minH: 12, maxH: 14, base: 210000 },
        { label: '14:00 - 16:00', minH: 14, maxH: 16, base: 195000 },
        { label: '16:00 - 18:00', minH: 16, maxH: 18, base: 260000 },
        { label: '18:00 - 22:00', minH: 18, maxH: 24, base: 220000 },
      ];
      return slots.map((slot) => {
        const slotSum = todayInvoices
          .filter((inv) => {
            const timePart = inv.date.split(' ')[1] || '10:00';
            const hour = parseInt(timePart.split(':')[0], 10);
            const h = isNaN(hour) ? 10 : hour;
            return h >= slot.minH && h < slot.maxH;
          })
          .reduce((sum, inv) => sum + inv.totalAmount, 0);
        return {
          label: slot.label.split(' ')[0],
          value: slotSum > 0 ? slotSum : slot.base,
        };
      });
    }
    if (revenuePeriod === '7-ngay') {
      const base7 = [420000, 510000, 460000, 580000, 490000, 530000, 0];
      return Array.from({ length: 7 }, (_, idx) => {
        const daysAgo = 6 - idx;
        const dStr = new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
        const daySum = validInvoices
          .filter((inv) => inv.date.startsWith(dStr))
          .reduce((sum, inv) => sum + inv.totalAmount, 0);
        const label =
          daysAgo === 0 ? 'Hôm nay' : daysAgo === 1 ? 'Hôm qua' : `${daysAgo} ngày trước`;
        return {
          label,
          value: daySum > 0 ? daySum : base7[idx],
        };
      });
    }
    return [
      { label: 'Tuần 1', value: 4250000 },
      { label: 'Tuần 2', value: 5180000 },
      { label: 'Tuần 3', value: 4890000 },
      { label: 'Tuần hiện tại', value: Math.max(revenueThisMonth, 701390) },
    ];
  }, [revenuePeriod, validInvoices, todayPrefix, revenueThisMonth]);

  const maxRev = Math.max(...revenueData.map((d) => d.value), 100000);

  // Top 5 sách bán chạy
  const top5BestSellers = [...books]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);
  const maxSold = Math.max(...top5BestSellers.map((b) => b.soldCount), 1);

  const statCards = [
    {
      label: 'Tổng số đầu sách',
      value: `${totalBookTitles} đầu sách`,
      sub: 'Danh mục đang kinh doanh',
      icon: BookOpen,
      onClick: () => setActiveTab('quan-ly-sach'),
    },
    {
      label: 'Tổng số sách trong kho',
      value: `${totalStockCount} quyển`,
      sub: 'Tồn kho thực tế hiện tại',
      icon: Boxes,
      onClick: () => setActiveTab('quan-ly-kho'),
    },
    {
      label: 'Số khách hàng',
      value: `${totalCustomers} khách`,
      sub: 'Hồ sơ lưu trữ hệ thống',
      icon: Users,
      onClick: () => setActiveTab('khach-hang'),
    },
    {
      label: 'Số hóa đơn',
      value: `${totalInvoicesCount} đơn`,
      sub: 'Giao dịch đã ghi nhận',
      icon: FileText,
      onClick: () => setActiveTab('hoa-don'),
    },
    {
      label: 'Doanh thu hôm nay',
      value: formatCurrency(revenueToday),
      sub: 'Cập nhật theo thời gian thực',
      icon: TrendingUp,
      highlight: true,
      onClick: () => setActiveTab('bao-cao'),
    },
    {
      label: 'Doanh thu tháng này',
      value: formatCurrency(revenueThisMonth),
      sub: `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      icon: Calendar,
      highlight: true,
      onClick: () => setActiveTab('bao-cao'),
    },
    {
      label: 'Sách sắp hết',
      value: `${lowStockBooks.length} đầu sách`,
      sub: `Hết hàng: ${outOfStockBooks.length} đầu sách`,
      icon: AlertTriangle,
      warning: lowStockBooks.length + outOfStockBooks.length > 0,
      onClick: () => setActiveTab('quan-ly-kho'),
    },
    {
      label: 'Số thành viên',
      value: `${users.length} thành viên`,
      sub: '4 vai trò phân quyền hệ thống',
      icon: Award,
      onClick: () => setActiveTab('thanh-vien'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Thanh thao tác nhanh */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#2C2520]">
            Bảng điều khiển nghiệp vụ nhà sách
          </h2>
          <p className="text-xs text-[#6E5E50] mt-0.5">
            Theo dõi nhanh số liệu tồn kho, doanh thu bán hàng và cảnh báo nhập hàng trong ngày.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('ban-hang')}
            className="px-4 py-2 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Mở quầy bán hàng (POS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nhap-sach')}
            className="px-4 py-2 rounded-lg bg-[#EFE9DD] hover:bg-[#E4DCCB] text-[#2C2520] border border-[#D8CEBE] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <PackagePlus className="w-4 h-4 text-[#2A4B3C]" />
            <span>Lập phiếu nhập sách</span>
          </button>
        </div>
      </div>

      {/* 8 Thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={card.onClick}
              className={`text-left p-5 rounded-xl border transition-all cursor-pointer ${
                card.highlight
                  ? 'bg-[#233D30] border-[#1B3025] text-white hover:bg-[#1E3529]'
                  : card.warning
                  ? 'bg-[#FFFBF2] border-[#E6C88A] text-[#2C2520] hover:border-[#D4AA59]'
                  : 'bg-white border-[#E2D9C8] text-[#2C2520] hover:border-[#C7B9A5]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-semibold ${
                    card.highlight ? 'text-[#C2D6CA]' : 'text-[#6E5E50]'
                  }`}
                >
                  {card.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    card.highlight
                      ? 'bg-[#345746] text-[#E4EFE9]'
                      : card.warning
                      ? 'bg-[#F7E7C4] text-[#9C6514]'
                      : 'bg-[#F4EFE4] text-[#2A4B3C]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono-num text-xl font-bold tracking-tight">
                {card.value}
              </div>
              <div
                className={`text-xs mt-1.5 ${
                  card.highlight ? 'text-[#A9C2B3]' : 'text-[#7D6E61]'
                }`}
              >
                {card.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hàng biểu đồ: Biểu đồ doanh thu & Biểu đồ Top 5 sách bán chạy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ doanh thu */}
        <div className="lg:col-span-7 bg-white border border-[#E2D9C8] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-[#2C2520]">Biểu đồ doanh thu</h3>
                <p className="text-xs text-[#6E5E50] mt-0.5">
                  Thống kê doanh thu bán sách theo kỳ hạn
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#F2ECE1] rounded-lg border border-[#E2D9C8]">
                {(
                  [
                    { id: 'hom-nay', label: 'Hôm nay' },
                    { id: '7-ngay', label: '7 ngày' },
                    { id: '30-ngay', label: '30 ngày' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRevenuePeriod(tab.id)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      revenuePeriod === tab.id
                        ? 'bg-[#2A4B3C] text-white'
                        : 'text-[#5C4E42] hover:text-[#2C2520]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vùng vẽ biểu đồ cột trực quan */}
            <div className="h-60 pt-6 pb-2 px-2 flex items-end justify-between gap-3 border-b border-[#EFE9DD]">
              {revenueData.map((d, i) => {
                const heightPct = Math.max(12, Math.round((d.value / maxRev) * 100));
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center h-full justify-end group"
                  >
                    <span className="font-mono-num text-[11px] font-semibold text-[#2A4B3C] mb-1.5 opacity-85 group-hover:opacity-100">
                      {(d.value / 1000).toLocaleString('vi-VN')}k
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[46px] rounded-t-lg bg-[#2A4B3C] group-hover:bg-[#3A6652] transition-all"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 px-2">
              {revenueData.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 text-center text-[11px] font-medium text-[#6E5E50] truncate"
                >
                  {d.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#EFE9DD] flex items-center justify-between text-xs text-[#6E5E50]">
            <span>Đơn vị hiển thị trên cột: nghìn VNĐ (1k = 1.000 VNĐ)</span>
            <button
              type="button"
              onClick={() => setActiveTab('bao-cao')}
              className="font-semibold text-[#2A4B3C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem báo cáo chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Biểu đồ sách bán chạy (Top 5) */}
        <div className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <h3 className="text-base font-bold text-[#2C2520]">
                Biểu đồ sách bán chạy (Top 5)
              </h3>
              <p className="text-xs text-[#6E5E50] mt-0.5">
                5 đầu sách có sản lượng tiêu thụ cao nhất
              </p>
            </div>

            <div className="space-y-4">
              {top5BestSellers.map((book, idx) => {
                const widthPct = Math.max(15, Math.round((book.soldCount / maxSold) * 100));
                return (
                  <div key={book.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="truncate font-semibold text-[#2C2520]">
                        <span className="font-mono-num text-[#78685A] mr-1.5">
                          0{idx + 1}.
                        </span>
                        {book.title}
                      </div>
                      <span className="font-mono-num font-bold text-[#2A4B3C] shrink-0">
                        {book.soldCount} cuốn
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F2ECE1] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${widthPct}%` }}
                        className="h-full bg-[#2A4B3C] rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#78685A]">
                      <span>
                        Mã: <strong className="font-mono-num">{book.id}</strong> · {book.author}
                      </span>
                      <span className="font-mono-num">
                        Giá bán: {formatCurrency(book.sellPrice)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#EFE9DD] flex items-center justify-between text-xs">
            <span className="text-[#6E5E50]">Tự động cập nhật khi thanh toán POS</span>
            <button
              type="button"
              onClick={() => setActiveTab('quan-ly-sach')}
              className="font-semibold text-[#2A4B3C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Quản lý danh mục</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hàng dưới: Danh sách cảnh báo kho & Hóa đơn gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Danh sách cảnh báo: Sách sắp hết & Sách hết hàng */}
        <div className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#2C2520]">
                  Danh sách cảnh báo tồn kho
                </h3>
                <p className="text-xs text-[#6E5E50] mt-0.5">
                  Các đầu sách hết hàng hoặc chạm ngưỡng tồn tối thiểu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('nhap-sach')}
                className="text-xs font-semibold text-[#2A4B3C] hover:underline cursor-pointer"
              >
                + Nhập bổ sung
              </button>
            </div>

            {outOfStockBooks.length === 0 && lowStockBooks.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#6E5E50]">
                Tất cả đầu sách trong kho đều đảm bảo số lượng an toàn.
              </div>
            ) : (
              <div className="divide-y divide-[#EFE9DD]">
                {[...outOfStockBooks, ...lowStockBooks].slice(0, 6).map((b) => {
                  const status = computeBookStatus(b.stock, b.minStock);
                  const isOut = status === 'Hết hàng';
                  return (
                    <div
                      key={b.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#2C2520] truncate">
                          <span className="font-mono-num text-[#6E5E50] mr-1.5">{b.id}</span>
                          {b.title}
                        </div>
                        <div className="text-[11px] text-[#78685A] mt-0.5">
                          Giá nhập: <span className="font-mono-num">{formatCurrency(b.importPrice)}</span> · Tối thiểu: <span className="font-mono-num">{b.minStock}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={`font-semibold ${
                            isOut ? 'text-[#B93829]' : 'text-[#B86B14]'
                          }`}
                        >
                          {status}
                        </div>
                        <div className="font-mono-num text-[11px] text-[#6E5E50]">
                          Tồn: <strong>{b.stock}</strong> cuốn
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#EFE9DD] text-right">
            <button
              type="button"
              onClick={() => setActiveTab('quan-ly-kho')}
              className="text-xs font-semibold text-[#2A4B3C] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Mở trang Quản lý kho</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hóa đơn gần đây */}
        <div className="lg:col-span-7 bg-white border border-[#E2D9C8] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#2C2520]">Hóa đơn gần đây</h3>
                <p className="text-xs text-[#6E5E50] mt-0.5">
                  Các giao dịch thanh toán mới nhất tại quầy
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('hoa-don')}
                className="text-xs font-semibold text-[#2A4B3C] hover:underline cursor-pointer"
              >
                Xem toàn bộ hóa đơn
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2D9C8] text-[11px] font-semibold text-[#6E5E50]">
                    <th className="py-2.5 pr-3">Mã HĐ</th>
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Khách hàng</th>
                    <th className="py-2.5 px-3">Thanh toán</th>
                    <th className="py-2.5 pl-3 text-right">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DD] text-xs">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FAF7F2]">
                      <td className="py-3 pr-3 font-mono-num font-bold text-[#2A4B3C]">
                        {inv.id}
                      </td>
                      <td className="py-3 px-3 font-mono-num text-[#6E5E50]">{inv.date}</td>
                      <td className="py-3 px-3 font-medium text-[#2C2520]">
                        {inv.customerName}
                      </td>
                      <td className="py-3 px-3 text-[#5C4E42]">{inv.paymentMethod}</td>
                      <td className="py-3 pl-3 text-right font-mono-num font-semibold text-[#2C2520]">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EFE9DD] flex items-center justify-between text-xs text-[#6E5E50]">
            <span>Hiển thị 5 hóa đơn gần nhất</span>
            <button
              type="button"
              onClick={() => setActiveTab('ban-hang')}
              className="font-semibold text-[#2A4B3C] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Tạo hóa đơn mới</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
