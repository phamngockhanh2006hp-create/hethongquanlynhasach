import React, { useState } from 'react';
import {
  Search,
  PackagePlus,
  PackageMinus,
  ClipboardCheck,
  SlidersHorizontal,
  X,
  History,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Book, BookStatus } from '../types';
import { computeBookStatus, formatCurrency } from '../data/initialData';

export const InventoryView: React.FC = () => {
  const { books, stockChecks, adjustBookStock, setActiveTab } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookStatus>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [newMinStock, setNewMinStock] = useState(8);
  const [reason, setReason] = useState('');
  const [showCheckHistory, setShowCheckHistory] = useState(false);

  const filteredBooks = books.filter((b) => {
    const status = computeBookStatus(b.stock, b.minStock);
    const matchQ =
      !search.trim() ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    return matchQ && matchStatus;
  });

  const totalInventoryBooks = books.reduce((sum, b) => sum + b.stock, 0);
  const totalImportValue = books.reduce((sum, b) => sum + b.stock * b.importPrice, 0);
  const totalSellValue = books.reduce((sum, b) => sum + b.stock * b.sellPrice, 0);

  const openAdjustModal = (book: Book) => {
    setSelectedBook(book);
    setNewStock(book.stock);
    setNewMinStock(book.minStock);
    setReason('Kiểm kê thực tế định kỳ tại kho');
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    adjustBookStock(selectedBook.id, newStock, newMinStock, reason);
    setSelectedBook(null);
  };

  return (
    <div className="space-y-6">
      {/* Thẻ tóm tắt giá trị kho & Nút nghiệp vụ kho */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2D9C8] rounded-xl p-4">
          <span className="text-xs text-[#6E5E50] font-semibold">Tổng số lượng sách tồn</span>
          <div className="font-mono-num text-xl font-bold text-[#2C2520] mt-1">
            {totalInventoryBooks} quyển
          </div>
          <span className="text-[11px] text-[#78685A] mt-1 block">
            Trên {books.length} đầu sách
          </span>
        </div>
        <div className="bg-white border border-[#E2D9C8] rounded-xl p-4">
          <span className="text-xs text-[#6E5E50] font-semibold">Giá trị tồn theo Giá nhập</span>
          <div className="font-mono-num text-xl font-bold text-[#2A4B3C] mt-1">
            {formatCurrency(totalImportValue)}
          </div>
          <span className="text-[11px] text-[#78685A] mt-1 block">Vốn hàng tồn kho</span>
        </div>
        <div className="bg-white border border-[#E2D9C8] rounded-xl p-4">
          <span className="text-xs text-[#6E5E50] font-semibold">Giá trị tồn theo Giá bán</span>
          <div className="font-mono-num text-xl font-bold text-[#2C2520] mt-1">
            {formatCurrency(totalSellValue)}
          </div>
          <span className="text-[11px] text-[#78685A] mt-1 block">Doanh thu dự kiến</span>
        </div>
        <div className="bg-[#FAF7F2] border border-[#E2D9C8] rounded-xl p-4 flex flex-col justify-between gap-2">
          <span className="text-xs font-bold text-[#3D332B]">Thao tác nghiệp vụ kho</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('nhap-sach')}
              className="flex-1 px-3 py-2 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>Nhập kho</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('xuat-sach')}
              className="flex-1 px-3 py-2 rounded-lg bg-white hover:bg-[#EFE9DD] text-[#2C2520] border border-[#D8CEBE] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PackageMinus className="w-3.5 h-3.5 text-[#8C2D2D]" />
              <span>Xuất kho</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bảng Quản lý kho */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã sách hoặc tên sách trong kho..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#EFE9DD] rounded-lg border border-[#D8CEBE]">
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'Còn hàng', label: '🟢 Còn hàng' },
                  { id: 'Sắp hết', label: '🟡 Sắp hết' },
                  { id: 'Hết hàng', label: '🔴 Hết hàng' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === st.id
                      ? 'bg-[#2A4B3C] text-white'
                      : 'text-[#54483E] hover:text-[#2C2520]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCheckHistory(!showCheckHistory)}
            className="px-3.5 py-2 rounded-lg border border-[#D8CEBE] bg-white hover:bg-[#EFE9DD] text-xs font-semibold text-[#3D332B] flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-[#2A4B3C]" />
            <span>Biên bản kiểm kê ({stockChecks.length})</span>
          </button>
        </div>

        {/* Lịch sử kiểm kê nếu bật */}
        {showCheckHistory && (
          <div className="p-4 bg-[#F8F4EC] border-b border-[#E2D9C8]">
            <h4 className="text-xs font-bold text-[#2C2520] mb-2">
              Nhật ký kiểm kê & điều chỉnh số lượng gần đây
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8CEBE] text-[#6E5E50]">
                    <th className="py-2 pr-3">Mã KK</th>
                    <th className="py-2 px-3">Thời gian</th>
                    <th className="py-2 px-3">Sách</th>
                    <th className="py-2 px-3 text-right">Tồn cũ</th>
                    <th className="py-2 px-3 text-right">Tồn mới</th>
                    <th className="py-2 px-3 text-right">Chênh lệch</th>
                    <th className="py-2 pl-3">Lý do & Người thực hiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DEC8]">
                  {stockChecks.map((sc) => (
                    <tr key={sc.id}>
                      <td className="py-2 pr-3 font-mono-num font-bold text-[#2A4B3C]">{sc.id}</td>
                      <td className="py-2 px-3 font-mono-num text-[#6E5E50]">{sc.date}</td>
                      <td className="py-2 px-3 font-semibold">{sc.bookTitle}</td>
                      <td className="py-2 px-3 text-right font-mono-num">{sc.oldStock}</td>
                      <td className="py-2 px-3 text-right font-mono-num font-bold">{sc.newStock}</td>
                      <td
                        className={`py-2 px-3 text-right font-mono-num font-bold ${
                          sc.difference >= 0 ? 'text-[#2A4B3C]' : 'text-[#B93829]'
                        }`}
                      >
                        {sc.difference >= 0 ? `+${sc.difference}` : sc.difference}
                      </td>
                      <td className="py-2 pl-3 text-[#54483E]">
                        {sc.reason} ({sc.staffName})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                <th className="py-3 px-4">Mã sách</th>
                <th className="py-3 px-4">Tên sách</th>
                <th className="py-3 px-3 text-right">Giá nhập</th>
                <th className="py-3 px-3 text-right">Giá bán</th>
                <th className="py-3 px-3 text-right">Số lượng tồn</th>
                <th className="py-3 px-3 text-right">Mức tồn tối thiểu</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác kiểm kê</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DD] text-xs">
              {filteredBooks.map((book) => {
                const status = computeBookStatus(book.stock, book.minStock);
                const statusIcon =
                  status === 'Còn hàng'
                    ? '🟢 Còn hàng'
                    : status === 'Sắp hết'
                    ? '🟡 Sắp hết'
                    : '🔴 Hết hàng';
                return (
                  <tr key={book.id} className="hover:bg-[#FAF7F2]">
                    <td className="py-3.5 px-4 font-mono-num font-bold text-[#2A4B3C]">
                      {book.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2C2520]">{book.title}</td>
                    <td className="py-3.5 px-3 text-right font-mono-num text-[#6E5E50]">
                      {formatCurrency(book.importPrice)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono-num font-bold text-[#2C2520]">
                      {formatCurrency(book.sellPrice)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono-num font-bold text-sm text-[#2C2520]">
                      {book.stock}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono-num text-[#6E5E50]">
                      {book.minStock}
                    </td>
                    <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                      <span
                        className={
                          status === 'Còn hàng'
                            ? 'text-[#2A4B3C]'
                            : status === 'Sắp hết'
                            ? 'text-[#B86B14]'
                            : 'text-[#B93829]'
                        }
                      >
                        {statusIcon}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openAdjustModal(book)}
                        className="px-3 py-1.5 rounded-lg bg-[#EFE9DD] hover:bg-[#E2D8C5] text-[#2C2520] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5 text-[#2A4B3C]" />
                        <span>Kiểm kê / Điều chỉnh</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Kiểm kê & Điều chỉnh số lượng */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#2A4B3C]" />
                <h3 className="font-display text-base font-bold text-[#2C2520]">
                  Kiểm kê & Điều chỉnh tồn kho
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="text-[#6E5E50] hover:text-[#2C2520]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                <div className="font-mono-num font-bold text-[#2A4B3C]">{selectedBook.id}</div>
                <div className="text-sm font-bold text-[#2C2520] mt-0.5">{selectedBook.title}</div>
                <div className="text-[#6E5E50] mt-1">
                  Số lượng tồn trên hệ thống hiện tại:{' '}
                  <strong className="font-mono-num text-[#2C2520]">
                    {selectedBook.stock} quyển
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#3D332B] mb-1.5">
                    Số lượng tồn thực tế *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#2A4B3C] rounded-lg font-mono-num font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#3D332B] mb-1.5">
                    Mức tồn tối thiểu *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-mono-num text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">
                  Lý do điều chỉnh / Ghi chú kiểm kê
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do điều chỉnh số lượng..."
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer"
                >
                  Lưu điều chỉnh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
