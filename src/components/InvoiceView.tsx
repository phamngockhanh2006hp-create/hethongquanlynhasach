import React, { useState, useEffect } from 'react';
import { Search, Eye, Printer, RotateCcw, X, Calendar } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Invoice, InvoiceStatus } from '../types';
import { formatCurrency } from '../data/initialData';

export const InvoiceView: React.FC = () => {
  const {
    invoices,
    settings,
    updateInvoiceStatus,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useStore();

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (globalSearchQuery) {
      setSearch(globalSearchQuery);
      setGlobalSearchQuery('');
    }
  }, [globalSearchQuery, setGlobalSearchQuery]);

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      inv.id.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.staffName.toLowerCase().includes(q);
    const matchDate = !dateFilter || inv.date.startsWith(dateFilter);
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchDate && matchStatus;
  });

  const totalRevenueFiltered = filteredInvoices
    .filter((i) => i.status === 'Đã thanh toán')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Bộ lọc Quản lý hóa đơn */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã HĐ, khách hàng, nhân viên..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
              />
            </div>

            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-8 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs font-mono-num text-[#2C2520]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | InvoiceStatus)}
              className="px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đã thanh toán">Đã thanh toán</option>
              <option value="Đã hoàn tiền">Đã hoàn tiền</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setDateFilter('');
                setStatusFilter('all');
              }}
              className="p-2 rounded-lg bg-white border border-[#D8CEBE] text-[#6E5E50] hover:bg-[#EFE9DD] cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-[#6E5E50]">
            Tổng doanh thu danh sách:{' '}
            <strong className="font-mono-num text-sm text-[#2A4B3C]">
              {formatCurrency(totalRevenueFiltered)}
            </strong>
          </div>
        </div>

        {/* Bảng hóa đơn */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                <th className="py-3 px-4">Mã hóa đơn</th>
                <th className="py-3 px-4">Ngày lập</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Nhân viên</th>
                <th className="py-3 px-4 text-right">Tổng tiền</th>
                <th className="py-3 px-4">Phương thức thanh toán</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DD] text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#78685A]">
                    Không tìm thấy hóa đơn nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAF7F2]">
                    <td className="py-3.5 px-4 font-mono-num font-bold text-[#2A4B3C]">{inv.id}</td>
                    <td className="py-3.5 px-4 font-mono-num text-[#6E5E50]">{inv.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#2C2520]">
                      {inv.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-[#54483E]">{inv.staffName}</td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-[#2C2520]">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-[#54483E]">{inv.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-semibold">
                      <span
                        className={
                          inv.status === 'Đã thanh toán'
                            ? 'text-[#2A4B3C]'
                            : inv.status === 'Đã hoàn tiền'
                            ? 'text-[#B86B14]'
                            : 'text-[#B93829]'
                        }
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 rounded-md bg-[#F3EFE6] hover:bg-[#E5DEC9] text-[#3D332B] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem chi tiết</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setTimeout(() => window.print(), 200);
                          }}
                          className="px-2.5 py-1 rounded-md bg-[#EBF3EE] hover:bg-[#D5E6DC] text-[#2A4B3C] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>In hóa đơn</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem chi tiết & In hóa đơn */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-lg w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between no-print">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                Chi tiết hóa đơn {selectedInvoice.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-[#6E5E50] hover:text-[#2C2520]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center border-b border-[#E2D9C8] pb-3">
                <h4 className="font-display font-bold text-base text-[#2C2520]">
                  {settings.storeName}
                </h4>
                <p className="text-[11px] text-[#6E5E50]">{settings.address}</p>
                <p className="font-mono-num font-bold text-sm text-[#2A4B3C] mt-1.5">
                  HÓA ĐƠN BÁN LẺ: {selectedInvoice.id}
                </p>
                <p className="font-mono-num text-[11px] text-[#78685A]">{selectedInvoice.date}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                <div>
                  <span className="text-[#78685A]">Khách hàng:</span>{' '}
                  <strong>{selectedInvoice.customerName}</strong>
                </div>
                <div>
                  <span className="text-[#78685A]">Nhân viên:</span>{' '}
                  <strong>{selectedInvoice.staffName}</strong>
                </div>
                <div>
                  <span className="text-[#78685A]">Phương thức:</span>{' '}
                  <strong>{selectedInvoice.paymentMethod}</strong>
                </div>
                <div>
                  <span className="text-[#78685A]">Trạng thái:</span>{' '}
                  <strong className="text-[#2A4B3C]">{selectedInvoice.status}</strong>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2D9C8] text-[#6E5E50]">
                    <th className="py-2">Mã sách</th>
                    <th className="py-2">Tên sách</th>
                    <th className="py-2 text-right">SL</th>
                    <th className="py-2 text-right">Đơn giá</th>
                    <th className="py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DD]">
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.bookId}>
                      <td className="py-2 font-mono-num font-bold text-[#2A4B3C]">{item.bookId}</td>
                      <td className="py-2 font-medium">{item.bookTitle}</td>
                      <td className="py-2 text-right font-mono-num">{item.quantity}</td>
                      <td className="py-2 text-right font-mono-num">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2 text-right font-mono-num font-semibold">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1.5 pt-3 border-t border-[#E2D9C8]">
                <div className="flex justify-between">
                  <span className="text-[#6E5E50]">Tạm tính:</span>
                  <span className="font-mono-num font-semibold">
                    {formatCurrency(selectedInvoice.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E5E50]">Giảm giá:</span>
                  <span className="font-mono-num text-[#2A4B3C]">
                    -{formatCurrency(selectedInvoice.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E5E50]">
                    Điểm sử dụng ({selectedInvoice.pointsUsed} điểm):
                  </span>
                  <span className="font-mono-num text-[#2A4B3C]">
                    -{formatCurrency(selectedInvoice.pointsUsed * settings.pointRedeemValue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#2A4B3C] pt-2 border-t border-[#EFE9DD]">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="font-mono-num">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFE9DD] flex flex-wrap items-center justify-between gap-2 no-print">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#6E5E50]">Đổi trạng thái:</span>
                  <select
                    value={selectedInvoice.status}
                    onChange={(e) => {
                      const nextSt = e.target.value as InvoiceStatus;
                      updateInvoiceStatus(selectedInvoice.id, nextSt);
                      setSelectedInvoice({ ...selectedInvoice, status: nextSt });
                    }}
                    className="px-2 py-1 rounded border border-[#D8CEBE] bg-white text-xs font-semibold"
                  >
                    <option value="Đã thanh toán">Đã thanh toán</option>
                    <option value="Đã hoàn tiền">Đã hoàn tiền</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-lg bg-[#EFE9DD] hover:bg-[#E2D8C5] text-[#2C2520] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In hóa đơn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
