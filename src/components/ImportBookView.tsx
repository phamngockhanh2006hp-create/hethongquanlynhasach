import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, RotateCcw, Eye, X, PackagePlus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ImportItem, ImportSlip } from '../types';
import { formatCurrency, generateNextId } from '../data/initialData';

export const ImportBookView: React.FC = () => {
  const { books, importSlips, users, currentUser, createImportSlip, showToast } = useStore();

  const nextSlipCode = generateNextId(
    importSlips.map((s) => s.id),
    'PN'
  );
  const todayStr = new Date().toISOString().slice(0, 10);

  const [supplier, setSupplier] = useState('Công ty Phát hành Sách FAHASA');
  const [staffName, setStaffName] = useState(currentUser?.fullName || 'PHẠM NGỌC KHÁNH');
  const [note, setNote] = useState('');
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || '');
  const [inputQty, setInputQty] = useState(10);
  const [inputImportPrice, setInputImportPrice] = useState(books[0]?.importPrice || 50000);

  const [items, setItems] = useState<ImportItem[]>([
    {
      bookId: books[0]?.id || 'SACH001',
      bookTitle: books[0]?.title || 'Dế Mèn Phiêu Lưu Ký',
      quantity: 15,
      importPrice: books[0]?.importPrice || 45000,
      lineTotal: 15 * (books[0]?.importPrice || 45000),
    },
  ]);

  const [detailSlip, setDetailSlip] = useState<ImportSlip | null>(null);

  const handleBookSelectChange = (bookId: string) => {
    setSelectedBookId(bookId);
    const found = books.find((b) => b.id === bookId);
    if (found) {
      setInputImportPrice(found.importPrice);
    }
  };

  const handleAddBookToSlip = () => {
    const found = books.find((b) => b.id === selectedBookId);
    if (!found) return;
    if (inputQty <= 0 || inputImportPrice <= 0) {
      showToast('Dữ liệu chưa hợp lệ', 'Số lượng và Giá nhập phải lớn hơn 0.', 'warning');
      return;
    }

    const existingIndex = items.findIndex((i) => i.bookId === found.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      const newQty = updated[existingIndex].quantity + inputQty;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        importPrice: inputImportPrice,
        lineTotal: newQty * inputImportPrice,
      };
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          bookId: found.id,
          bookTitle: found.title,
          quantity: inputQty,
          importPrice: inputImportPrice,
          lineTotal: inputQty * inputImportPrice,
        },
      ]);
    }
  };

  const handleUpdateQty = (bookId: string, qty: number) => {
    if (qty <= 0) return;
    setItems((prev) =>
      prev.map((item) =>
        item.bookId === bookId
          ? { ...item, quantity: qty, lineTotal: qty * item.importPrice }
          : item
      )
    );
  };

  const handleUpdateImportPrice = (bookId: string, price: number) => {
    if (price <= 0) return;
    setItems((prev) =>
      prev.map((item) =>
        item.bookId === bookId
          ? { ...item, importPrice: price, lineTotal: item.quantity * price }
          : item
      )
    );
  };

  const handleRemoveRow = (bookId: string) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  };

  const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSaveSlip = () => {
    if (!supplier.trim()) {
      showToast('Thiếu thông tin', 'Vui lòng nhập tên Nhà cung cấp.', 'warning');
      return;
    }
    if (items.length === 0) {
      showToast('Phiếu nhập trống', 'Vui lòng thêm ít nhất 1 đầu sách vào phiếu nhập.', 'warning');
      return;
    }
    createImportSlip({
      staffName: staffName.trim() || currentUser?.fullName || 'LÊ THỊ THANH HƯƠNG',
      supplier: supplier.trim(),
      note: note.trim(),
      items,
    });
    setItems([]);
    setNote('');
  };

  const handleCancelSlip = () => {
    setItems([]);
    setNote('');
    showToast('Đã hủy phiếu', 'Đã làm mới biểu mẫu lập phiếu nhập.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Biểu mẫu lập phiếu nhập sách */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <PackagePlus className="w-5 h-5 text-[#2A4B3C]" />
            <div>
              <h2 className="font-display text-base font-bold text-[#2C2520]">
                Lập phiếu nhập sách vào kho
              </h2>
              <p className="text-xs text-[#6E5E50]">
                Sau khi lưu phiếu nhập, số lượng tồn kho của từng đầu sách sẽ tự động cộng thêm.
              </p>
            </div>
          </div>
          <span className="font-mono-num text-xs font-bold px-3 py-1.5 rounded-lg bg-[#EFE9DD] text-[#2A4B3C]">
            Mã phiếu dự kiến: {nextSlipCode}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Thông tin chung của phiếu nhập */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Mã phiếu nhập
              </label>
              <input
                type="text"
                disabled
                value={nextSlipCode}
                className="w-full px-3 py-2 bg-[#F2ECE1] border border-[#D8CEBE] rounded-lg text-xs font-mono-num font-bold text-[#2A4B3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Ngày nhập
              </label>
              <input
                type="text"
                disabled
                value={todayStr}
                className="w-full px-3 py-2 bg-[#F2ECE1] border border-[#D8CEBE] rounded-lg text-xs font-mono-num text-[#4A3F36]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Nhân viên nhập *
              </label>
              <select
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs font-semibold text-[#2C2520]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.fullName}>
                    {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Nhà cung cấp *
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Nhập tên nhà cung cấp / NXB"
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520]"
              />
            </div>
          </div>

          {/* Thanh chọn sách để đưa vào phiếu */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Chọn đầu sách cần nhập
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => handleBookSelectChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520]"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.title} (Tồn hiện tại: {b.stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Số lượng nhập
              </label>
              <input
                type="number"
                min={1}
                value={inputQty}
                onChange={(e) => setInputQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs font-mono-num"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Giá nhập (VNĐ/cuốn)
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={inputImportPrice}
                onChange={(e) => setInputImportPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs font-mono-num"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleAddBookToSlip}
                className="w-full py-2 px-3 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm vào phiếu</span>
              </button>
            </div>
          </div>

          {/* Bảng danh sách sách trong phiếu nhập */}
          <div className="overflow-x-auto border border-[#E2D9C8] rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                  <th className="py-3 px-4">Mã sách</th>
                  <th className="py-3 px-4">Tên sách</th>
                  <th className="py-3 px-4 text-right">Số lượng</th>
                  <th className="py-3 px-4 text-right">Giá nhập (VNĐ)</th>
                  <th className="py-3 px-4 text-right">Thành tiền</th>
                  <th className="py-3 px-4 text-right">Xóa dòng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DD] text-xs">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#78685A]">
                      Chưa có sách trong phiếu nhập. Hãy chọn sách ở khung phía trên và bấm "Thêm vào phiếu".
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.bookId} className="hover:bg-[#FAF7F2]">
                      <td className="py-3 px-4 font-mono-num font-bold text-[#2A4B3C]">
                        {item.bookId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#2C2520]">{item.bookTitle}</td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateQty(item.bookId, Number(e.target.value))}
                          className="w-20 px-2 py-1 text-right bg-white border border-[#D8CEBE] rounded font-mono-num font-semibold"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          min={1000}
                          step={1000}
                          value={item.importPrice}
                          onChange={(e) =>
                            handleUpdateImportPrice(item.bookId, Number(e.target.value))
                          }
                          className="w-28 px-2 py-1 text-right bg-white border border-[#D8CEBE] rounded font-mono-num"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-mono-num font-bold text-[#2C2520]">
                        {formatCurrency(item.lineTotal)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(item.bookId)}
                          className="p-1.5 rounded-md bg-[#FDF2F2] hover:bg-[#F7D9D9] text-[#9B2C2C] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tổng tiền tự động & Nút Lưu / Hủy */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex-1 min-w-[240px]">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú phiếu nhập (không bắt buộc)..."
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-lg text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="text-right">
                <span className="text-xs text-[#6E5E50] block">
                  Tổng cộng ({totalQty} quyển sách):
                </span>
                <span className="font-mono-num text-xl font-bold text-[#2A4B3C]">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelSlip}
                  className="px-4 py-2.5 rounded-lg border border-[#D8CEBE] bg-white hover:bg-[#EFE9DD] text-xs font-semibold text-[#4A3F36] flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hủy phiếu</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveSlip}
                  className="px-5 py-2.5 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu phiếu nhập</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách phiếu nhập đã lưu */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E2D9C8]">
          <h3 className="text-sm font-bold text-[#2C2520]">
            Lịch sử phiếu nhập kho ({importSlips.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                <th className="py-3 px-4">Mã phiếu nhập</th>
                <th className="py-3 px-4">Ngày nhập</th>
                <th className="py-3 px-4">Nhân viên nhập</th>
                <th className="py-3 px-4">Nhà cung cấp</th>
                <th className="py-3 px-4 text-right">Số đầu sách</th>
                <th className="py-3 px-4 text-right">Tổng tiền</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DD] text-xs">
              {importSlips.map((slip) => (
                <tr key={slip.id} className="hover:bg-[#FAF7F2]">
                  <td className="py-3.5 px-4 font-mono-num font-bold text-[#2A4B3C]">{slip.id}</td>
                  <td className="py-3.5 px-4 font-mono-num text-[#6E5E50]">{slip.date}</td>
                  <td className="py-3.5 px-4 font-medium">{slip.staffName}</td>
                  <td className="py-3.5 px-4">{slip.supplier}</td>
                  <td className="py-3.5 px-4 text-right font-mono-num">
                    {slip.items.length} đầu sách
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-num font-bold text-[#2C2520]">
                    {formatCurrency(slip.totalAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setDetailSlip(slip)}
                      className="px-2.5 py-1 rounded-md bg-[#F3EFE6] hover:bg-[#E5DEC9] text-[#3D332B] font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chi tiết phiếu nhập */}
      {detailSlip && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-xl w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                Chi tiết phiếu nhập {detailSlip.id}
              </h3>
              <button
                type="button"
                onClick={() => setDetailSlip(null)}
                className="text-[#6E5E50] hover:text-[#2C2520]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                <div>
                  <span className="text-[#78685A]">Ngày nhập:</span>{' '}
                  <strong className="font-mono-num">{detailSlip.date}</strong>
                </div>
                <div>
                  <span className="text-[#78685A]">Nhân viên:</span>{' '}
                  <strong>{detailSlip.staffName}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[#78685A]">Nhà cung cấp:</span>{' '}
                  <strong>{detailSlip.supplier}</strong>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2D9C8] text-[#6E5E50]">
                    <th className="py-2">Mã sách</th>
                    <th className="py-2">Tên sách</th>
                    <th className="py-2 text-right">SL</th>
                    <th className="py-2 text-right">Giá nhập</th>
                    <th className="py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DD]">
                  {detailSlip.items.map((it) => (
                    <tr key={it.bookId}>
                      <td className="py-2 font-mono-num font-bold text-[#2A4B3C]">{it.bookId}</td>
                      <td className="py-2 font-medium">{it.bookTitle}</td>
                      <td className="py-2 text-right font-mono-num">{it.quantity}</td>
                      <td className="py-2 text-right font-mono-num">
                        {formatCurrency(it.importPrice)}
                      </td>
                      <td className="py-2 text-right font-mono-num font-semibold">
                        {formatCurrency(it.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-3 border-t border-[#E2D9C8] flex items-center justify-between">
                <span className="font-semibold text-[#6E5E50]">Tổng tiền phiếu nhập:</span>
                <span className="font-mono-num text-base font-bold text-[#2A4B3C]">
                  {formatCurrency(detailSlip.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
