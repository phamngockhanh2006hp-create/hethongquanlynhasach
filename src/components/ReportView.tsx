import React, { useState } from 'react';
import { Calendar, TrendingUp, BookOpen, Boxes, Users, Printer } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { computeBookStatus, formatCurrency } from '../data/initialData';

export const ReportView: React.FC = () => {
  const { books, categories, invoices, importSlips, exportSlips, customers } = useStore();

  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysAgoStr = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const monthStartStr = `${todayStr.slice(0, 7)}-01`;

  const [fromDate, setFromDate] = useState(monthStartStr);
  const [toDate, setToDate] = useState(todayStr);

  const validInvoices = invoices.filter((inv) => inv.status === 'Đã thanh toán');

  // 1. Báo cáo Doanh thu
  const revenueToday = validInvoices
    .filter((i) => i.date.slice(0, 10) === todayStr)
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const revenueWeek = validInvoices
    .filter((i) => i.date.slice(0, 10) >= sevenDaysAgoStr)
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const revenueMonth = validInvoices
    .filter((i) => i.date.slice(0, 7) === todayStr.slice(0, 7))
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const revenueInRange = validInvoices
    .filter((i) => {
      const d = i.date.slice(0, 10);
      return (!fromDate || d >= fromDate) && (!toDate || d <= toDate);
    })
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // 2. Báo cáo Sách
  const totalBooksSold = books.reduce((sum, b) => sum + b.soldCount, 0);
  const topBooks = [...books].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5);
  const lowStockBooks = books.filter((b) => computeBookStatus(b.stock, b.minStock) === 'Sắp hết');
  const outStockBooks = books.filter((b) => computeBookStatus(b.stock, b.minStock) === 'Hết hàng');

  // 3. Báo cáo Kho
  const totalStockBooks = books.reduce((sum, b) => sum + b.stock, 0);
  const totalInventoryImportValue = books.reduce((sum, b) => sum + b.stock * b.importPrice, 0);
  const totalImportedCount = importSlips.reduce(
    (sum, s) => sum + s.items.reduce((acc, i) => acc + i.quantity, 0),
    0
  );
  const totalExportedCount = exportSlips.reduce((sum, s) => sum + s.totalQuantity, 0);

  // 4. Báo cáo Khách hàng
  const totalCustomers = customers.length;
  const totalVipGoldSilver = customers.filter((c) => c.tier !== 'Thành viên thường').length;
  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  // Dữ liệu Biểu đồ Đường (Xu hướng doanh thu 7 ngày)
  const lineChartPoints = [
    { day: 'T2', val: 645000 },
    { day: 'T3', val: 580000 },
    { day: 'T4', val: 790000 },
    { day: 'T5', val: 680000 },
    { day: 'T6', val: 920000 },
    { day: 'T7', val: 1120000 },
    { day: 'CN', val: Math.max(850000, revenueToday) },
  ];
  const maxLineVal = Math.max(...lineChartPoints.map((p) => p.val), 100000);

  // Dữ liệu Biểu đồ Tròn (Tỷ trọng sách theo thể loại)
  const piePalette = ['#2A4B3C', '#5C7C6B', '#8C7A6B', '#B89B72', '#C87D20', '#705A48', '#446355'];
  const categoryStats = categories.map((cat, idx) => {
    const count = books
      .filter((b) => b.categoryId === cat.id)
      .reduce((sum, b) => sum + b.soldCount, 0);
    return {
      name: cat.name,
      count: Math.max(10, count),
      color: piePalette[idx % piePalette.length],
    };
  });
  const totalCatSold = categoryStats.reduce((sum, c) => sum + c.count, 0);

  // Tính góc SVG cho biểu đồ tròn (Donut chart)
  let cumulativePercent = 0;
  const pieSlices = categoryStats.map((item) => {
    const startPercent = cumulativePercent;
    const pct = item.count / totalCatSold;
    cumulativePercent += pct;
    return {
      ...item,
      percent: Math.round(pct * 100),
      startPercent,
      endPercent: cumulativePercent,
    };
  });

  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  return (
    <div className="space-y-6">
      {/* Thanh chọn khoảng thời gian báo cáo */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-[#2C2520]">
            Báo cáo & Thống kê tổng hợp
          </h2>
          <p className="text-xs text-[#6E5E50]">
            Phân tích doanh thu, sản lượng sách bán ra, giá trị tồn kho và hành vi mua hàng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#D8CEBE]">
            <Calendar className="w-3.5 h-3.5 text-[#2A4B3C]" />
            <span className="text-[#6E5E50]">Từ ngày:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="font-mono-num font-semibold bg-transparent focus:outline-none"
            />
            <span className="text-[#6E5E50]">đến:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="font-mono-num font-semibold bg-transparent focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white font-semibold flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* PHẦN 1: BÁO CÁO DOANH THU */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#2A4B3C]" />
          <h3 className="text-sm font-bold text-[#2C2520]">1. Báo cáo doanh thu</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
            <span className="text-xs text-[#6E5E50]">Doanh thu hôm nay</span>
            <div className="font-mono-num text-lg font-bold text-[#2A4B3C] mt-1">
              {formatCurrency(revenueToday)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
            <span className="text-xs text-[#6E5E50]">Doanh thu tuần (7 ngày qua)</span>
            <div className="font-mono-num text-lg font-bold text-[#2C2520] mt-1">
              {formatCurrency(revenueWeek)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
            <span className="text-xs text-[#6E5E50]">Doanh thu tháng này</span>
            <div className="font-mono-num text-lg font-bold text-[#2C2520] mt-1">
              {formatCurrency(revenueMonth)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#233D30] text-white">
            <span className="text-xs text-[#BFD4C8]">Doanh thu theo khoảng thời gian chọn</span>
            <div className="font-mono-num text-lg font-bold mt-1">
              {formatCurrency(revenueInRange)}
            </div>
          </div>
        </div>
      </div>

      {/* BA BIỂU ĐỒ TRỰC QUAN: BIỂU ĐỒ CỘT, BIỂU ĐỒ ĐƯỜNG, BIỂU ĐỒ TRÒN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ Cột: Top sách bán chạy */}
        <div className="lg:col-span-4 bg-white border border-[#E2D9C8] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2C2520]">
              Biểu đồ cột: Top 5 sách bán chạy
            </h3>
            <p className="text-xs text-[#6E5E50] mt-0.5 mb-5">
              So sánh số lượng sách bán ra theo đầu sách
            </p>

            <div className="h-52 flex items-end justify-between gap-2.5 pt-6 pb-2 px-2 border-b border-[#EFE9DD]">
              {topBooks.map((b) => {
                const maxSold = Math.max(...topBooks.map((x) => x.soldCount), 1);
                const hPct = Math.max(15, Math.round((b.soldCount / maxSold) * 100));
                return (
                  <div
                    key={b.id}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                  >
                    <span className="font-mono-num text-[11px] font-bold text-[#2A4B3C] mb-1">
                      {b.soldCount}
                    </span>
                    <div
                      style={{ height: `${hPct}%` }}
                      className="w-full max-w-[34px] bg-[#2A4B3C] rounded-t-md"
                      title={b.title}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between gap-2 pt-2 px-1">
              {topBooks.map((b) => (
                <div
                  key={b.id}
                  className="flex-1 text-center font-mono-num text-[10px] font-semibold text-[#54483E] truncate"
                  title={b.title}
                >
                  {b.id}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#EFE9DD] text-[11px] text-[#6E5E50]">
            Tổng số sách đã bán ra: <strong className="font-mono-num">{totalBooksSold} quyển</strong>
          </div>
        </div>

        {/* Biểu đồ Đường: Xu hướng doanh thu */}
        <div className="lg:col-span-4 bg-white border border-[#E2D9C8] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2C2520]">
              Biểu đồ đường: Biến động doanh thu tuần
            </h3>
            <p className="text-xs text-[#6E5E50] mt-0.5 mb-5">
              Đường biểu diễn tốc độ tăng trưởng doanh thu theo ngày
            </p>

            <div className="h-52 relative pt-4">
              <svg viewBox="0 0 320 160" className="w-full h-full overflow-visible">
                {/* Lưới ngang */}
                {[0, 40, 80, 120, 150].map((y) => (
                  <line
                    key={y}
                    x1={10}
                    y1={y}
                    x2={310}
                    y2={y}
                    stroke="#EFE9DD"
                    strokeWidth="1"
                  />
                ))}

                {/* Đường nối */}
                <polyline
                  fill="none"
                  stroke="#2A4B3C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={lineChartPoints
                    .map((p, idx) => {
                      const x = 20 + idx * 46;
                      const y = 145 - Math.round((p.val / maxLineVal) * 120);
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Các điểm nút */}
                {lineChartPoints.map((p, idx) => {
                  const x = 20 + idx * 46;
                  const y = 145 - Math.round((p.val / maxLineVal) * 120);
                  return (
                    <g key={p.day}>
                      <circle cx={x} cy={y} r={4.5} fill="#2A4B3C" stroke="#FFFFFF" strokeWidth={2} />
                      <text
                        x={x}
                        y={y - 9}
                        textAnchor="middle"
                        className="text-[9px] fill-[#2A4B3C] font-bold"
                      >
                        {Math.round(p.val / 1000)}k
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex justify-between pt-2 px-2">
              {lineChartPoints.map((p) => (
                <span key={p.day} className="text-[11px] font-semibold text-[#6E5E50]">
                  {p.day}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EFE9DD] text-[11px] text-[#6E5E50]">
            Đơn vị: nghìn VNĐ · Cao điểm vào cuối tuần
          </div>
        </div>

        {/* Biểu đồ Tròn: Tỷ trọng theo thể loại */}
        <div className="lg:col-span-4 bg-white border border-[#E2D9C8] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2C2520]">
              Biểu đồ tròn: Tỷ trọng theo thể loại
            </h3>
            <p className="text-xs text-[#6E5E50] mt-0.5 mb-4">
              Cơ cấu sản lượng tiêu thụ giữa các nhóm thể loại
            </p>

            <div className="flex items-center gap-4">
              <div className="w-36 h-36 shrink-0">
                <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-full h-full -rotate-90">
                  {pieSlices.map((slice, i) => {
                    const [startX, startY] = getCoordinatesForPercent(slice.startPercent);
                    const [endX, endY] = getCoordinatesForPercent(slice.endPercent);
                    const largeArcFlag =
                      slice.endPercent - slice.startPercent > 0.5 ? 1 : 0;
                    const pathData = [
                      `M ${startX} ${startY}`,
                      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                      `L 0 0`,
                    ].join(' ');
                    return (
                      <path
                        key={i}
                        d={pathData}
                        fill={slice.color}
                        stroke="#FFFFFF"
                        strokeWidth="0.03"
                      />
                    );
                  })}
                  <circle cx="0" cy="0" r="0.52" fill="#FFFFFF" />
                </svg>
              </div>

              <div className="flex-1 space-y-1.5 text-xs">
                {pieSlices.slice(0, 5).map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="truncate text-[#3D332B]">{s.name}</span>
                    </div>
                    <span className="font-mono-num font-bold text-[#2A4B3C]">{s.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EFE9DD] text-[11px] text-[#6E5E50]">
            Phân bổ trên {categories.length} thể loại sách
          </div>
        </div>
      </div>

      {/* PHẦN 2, 3, 4: BÁO CÁO SÁCH, BÁO CÁO KHO & BÁO CÁO KHÁCH HÀNG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Báo cáo Sách */}
        <div className="bg-white border border-[#E2D9C8] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2A4B3C]" />
            <h3 className="text-sm font-bold text-[#2C2520]">2. Báo cáo Sách</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8]">
              <span className="text-[#6E5E50]">Số lượng bán ra</span>
              <div className="font-mono-num text-base font-bold text-[#2A4B3C] mt-0.5">
                {totalBooksSold} quyển
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8]">
              <span className="text-[#6E5E50]">Sách sắp hết / Hết hàng</span>
              <div className="font-mono-num text-base font-bold text-[#B93829] mt-0.5">
                {lowStockBooks.length} / {outStockBooks.length} đầu sách
              </div>
            </div>
          </div>
          <div className="text-xs space-y-2">
            <div className="font-semibold text-[#5C4E42]">Top sách bán chạy nhất:</div>
            {topBooks.map((b, i) => (
              <div
                key={b.id}
                className="flex items-center justify-between py-1.5 border-b border-[#EFE9DD]"
              >
                <span className="truncate font-medium">
                  0{i + 1}. {b.title}
                </span>
                <span className="font-mono-num font-bold text-[#2A4B3C] shrink-0">
                  {b.soldCount} cuốn
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Báo cáo Kho */}
        <div className="bg-white border border-[#E2D9C8] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#2A4B3C]" />
            <h3 className="text-sm font-bold text-[#2C2520]">3. Báo cáo Kho</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8] flex justify-between items-center">
              <span className="text-[#6E5E50]">Tổng số sách trong kho:</span>
              <strong className="font-mono-num text-sm text-[#2C2520]">
                {totalStockBooks} quyển
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8] flex justify-between items-center">
              <span className="text-[#6E5E50]">Giá trị hàng tồn (theo Giá nhập):</span>
              <strong className="font-mono-num text-sm text-[#2A4B3C]">
                {formatCurrency(totalInventoryImportValue)}
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8] flex justify-between items-center">
              <span className="text-[#6E5E50]">Tổng số lượng sách đã nhập:</span>
              <strong className="font-mono-num text-sm text-[#2C2520]">
                {totalImportedCount} quyển ({importSlips.length} phiếu)
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8] flex justify-between items-center">
              <span className="text-[#6E5E50]">Tổng số lượng sách đã xuất:</span>
              <strong className="font-mono-num text-sm text-[#8C2D2D]">
                {totalExportedCount} quyển ({exportSlips.length} phiếu)
              </strong>
            </div>
          </div>
        </div>

        {/* Báo cáo Khách hàng */}
        <div className="bg-white border border-[#E2D9C8] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2A4B3C]" />
            <h3 className="text-sm font-bold text-[#2C2520]">4. Báo cáo Khách hàng</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8]">
              <span className="text-[#6E5E50]">Tổng số khách hàng</span>
              <div className="font-mono-num text-base font-bold text-[#2C2520] mt-0.5">
                {totalCustomers} khách
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8]">
              <span className="text-[#6E5E50]">Thành viên Bạc/Vàng/VIP</span>
              <div className="font-mono-num text-base font-bold text-[#2A4B3C] mt-0.5">
                {totalVipGoldSilver} hội viên
              </div>
            </div>
          </div>
          <div className="text-xs space-y-2">
            <div className="font-semibold text-[#5C4E42]">Khách hàng mua nhiều nhất:</div>
            {topCustomers.map((c, i) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-1.5 border-b border-[#EFE9DD]"
              >
                <span className="truncate font-medium">
                  0{i + 1}. {c.name} ({c.purchaseCount} lần)
                </span>
                <span className="font-mono-num font-bold text-[#2A4B3C] shrink-0">
                  {formatCurrency(c.totalSpent)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
