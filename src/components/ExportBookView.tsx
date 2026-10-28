import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, RotateCcw, Eye, X, PackageMinus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ExportItem, ExportSlip } from '../types';
import { generateNextId } from '../data/initialData';

export const ExportBookView: React.FC = () => {
  const { books, exportSlips, users, currentUser, createExportSlip, showToast } = useStore();

  const nextExportCode = generateNextId(
    exportSlips.map((s) => s.id),
    'PX'
  );
  const todayStr = new Date().toISOString().slice(0, 10);

  const [staffName, setStaffName] = useState(currentUser?.fullName || 'PHẠM NGỌC KHÁNH');
  const [reason, setReason] = useState('Chuyển sách sang chi nhánh cơ sở 2');
  const availableBooks = books.filter((b) => b.stock > 0);
  const [selectedBookId, setSelectedBookId] = useState(availableBooks[0]?.id || books[0]?.id || '');
  const [exportQty, setExportQty] = useState(2);

  const [items, setItems] = useState<ExportItem[]>([
    {
      bookId: 'SACH002',
      bookTitle: 'Mắt Biếc',
      quantity: 2,
    },
  ]);

  const [detailSlip, setDetailSlip] = useState<ExportSlip | null>(null);

  const handleAddBook = () => {
    const found = books.find((b) => b.id === selectedBookId);
    if (!found) return;
    if (exportQty <= 0) {
      showToast('Số lượng không hợp lệ', 'Số lượng xuất phải lớn hơn 0.', 'warning');
      return;
    }
    const existing = items.find((i) => i.bookId === found.id);
    const totalRequested = (existing?.quantity || 0) + exportQty;
    if (totalRequested > found.stock) {
      showToast(
        'Vượt quá tồn kho',
        `Sách "${found.title}" chỉ còn ${found.stock} cuốn trong kho.`,
        'danger'
      );
      return;
    }

    if (existing) {
      setItems((prev) =>
        prev.map((i) => (i.bookId === found.id ? { ...i, quantity: totalRequested } : i))
      );
    } else {
      setItems([
        ...items,
        {
          bookId: found.id,
          bookTitle: found.title,
          quantity: exportQty,
        },
      ]);
    }
  };

  const handleUpdateQty = (bookId: string, qty: number) => {
    if (qty <= 0) return;
    const found = books.find((b) => b.id === bookId);
    if (found && qty > found.stock) {
      showToast(
        'Vượt quá tồn kho',
        `Sách "${found.title}" hiện chỉ còn ${found.stock} cuốn.`,
        'warning'
      );
      return;
    }
    setItems((prev) => prev.map((i) => (i.bookId === bookId ? { ...i, quantity: qty } : i)));
  };

  const handleRemoveItem = (bookId: string) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  };

  const handleSaveExport = () => {
    if (!reason.trim()) {
      showToast('Thiếu lý do xuất', 'Vui lòng nhập Lý do xuất kho.', 'warning');
      return;
    }
    if (items.length === 0) {
      showToast('Phiếu xuất trống', 'Vui lòng chọn ít nhất 1 đầu sách để xuất kho.', 'warning');
      return;
    }
    const res = createExportSlip({
      staffName: staffName.trim() || currentUser?.fullName || 'LÊ THỊ THANH HƯƠNG',
      reason: reason.trim(),
      items,
    });
    if (!res.success) {
      showToast('Không thể xuất kho', res.message, 'danger');
      return;
    }
    setItems([]);
  };

  const handleCancel = () => {
    setItems([]);
    showToast('Đã hủy phiếu xuất', 'Đã xóa danh sách sách đang chọn.', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <PackageMinus className="w-5 h-5 text-[#8C2D2D]" />
            <div>
              <h2 className="font-display text-base font-bold text-[#2C2520]">
                Lập phiếu xuất sách khỏi kho
              </h2>
              <p className="text-xs text-[#6E5E50]">
                Sau khi lưu phiếu xuất, số lượng tồn kho sẽ tự động giảm tương ứng.
              </p>
            </div>
          </div>
          <span className="font-mono-num text-xs font-bold px-3 py-1.5 rounded-lg bg-[#EFE9DD] text-[#2A4B3C]">
            Mã phiếu dự kiến: {nextExportCode}
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Mã phiếu xuất
              </label>
              <input
                type="text"
                disabled
                value={nextExportCode}
                className="w-full px-3 py-2 bg-[#F2ECE1] border border-[#D8CEBE] rounded-lg text-xs font-mono-num font-bold text-[#2A4B3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Ngày xuất
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
                Người thực hiện *
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
                Lý do xuất kho *
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Chuyển chi nhánh, trả NXB, hư hỏng..."
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520]"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-7">
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Chọn sách cần xuất kho
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520]"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.stock <= 0}>
                    {b.id} - {b.title} (Tồn kho: {b.stock} cuốn)
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                Số lượng xuất
              </label>
              <input
                type="number"
                min={1}
                value={exportQty}
                onChange={(e) => setExportQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs font-mono-num"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleAddBook}
                className="w-full py-2 px-3 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm sách</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E2D9C8] rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                  <th className="py-3 px-4">Mã sách</th>
                  <th className="py-3 px-4">Tên sách</th>
                  <th className="py-3 px-4 text-right">Tồn hiện tại</th>
                  <th className="py-3 px-4 text-right">Số lượng xuất</th>
                  <th className="py-3 px-4 text-right">Tồn sau khi xuất</th>
                  <th className="py-3 px-4 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DD] text-xs">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#78685A]">
                      Chưa có sách nào trong phiếu xuất.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const currentStock = books.find((b) => b.id === item.bookId)?.stock ?? 0;
                    return (
                      <tr key={item.bookId} className="hover:bg-[#FAF7F2]">
                        <td className="py-3 px-4 font-mono-num font-bold text-[#2A4B3C]">
                          {item.bookId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#2C2520]">{item.bookTitle}</td>
                        <td className="py-3 px-4 text-right font-mono-num">{currentStock}</td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            min={1}
                            max={currentStock}
                            value={item.quantity}
                            onChange={(e) => handleUpdateQty(item.bookId, Number(e.target.value))}
                            className="w-20 px-2 py-1 text-right bg-white border border-[#D8CEBE] rounded font-mono-num font-semibold"
                          />
                        </td>
                        <td className="py-3 px-4 text-right font-mono-num font-bold text-[#2A4B3C]">
                          {Math.max(0, currentStock - item.quantity)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.bookId)}
                            className="p-1.5 rounded-md bg-[#FDF2F2] hover:bg-[#F7D9D9] text-[#9B2C2C] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#6E5E50]">
              Tổng số lượng sách xuất:{' '}
              <strong className="font-mono-num text-sm text-[#2C2520]">
                {items.reduce((s, i) => s + i.quantity, 0)} quyển
              </strong>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-lg border border-[#D8CEBE] bg-white hover:bg-[#EFE9DD] text-xs font-semibold text-[#4A3F36] flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hủy</span>
              </button>
              <button
                type="button"
                onClick={handleSaveExport}
                className="px-5 py-2.5 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu phiếu xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lịch sử phiếu xuất */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E2D9C8]">
          <h3 className="text-sm font-bold text-[#2C2520]">
            Danh sách phiếu xuất kho ({exportSlips.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                <th className="py-3 px-4">Mã phiếu xuất</th>
                <th className="py-3 px-4">Ngày xuất</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-4">Lý do xuất</th>
                <th className="py-3 px-4 text-right">Tổng số lượng</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DD] text-xs">
              {exportSlips.map((slip) => (
                <tr key={slip.id} className="hover:bg-[#FAF7F2]">
                  <td className="py-3.5 px-4 font-mono-num font-bold text-[#2A4B3C]">{slip.id}</td>
                  <td className="py-3.5 px-4 font-mono-num text-[#6E5E50]">{slip.date}</td>
                  <td className="py-3.5 px-4 font-medium">{slip.staffName}</td>
                  <td className="py-3.5 px-4">{slip.reason}</td>
                  <td className="py-3.5 px-4 text-right font-mono-num font-bold">
                    {slip.totalQuantity} quyển
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

      {detailSlip && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-lg w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                Chi tiết phiếu xuất {detailSlip.id}
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
              <div className="space-y-1.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                <div>
                  <span className="text-[#78685A]">Ngày xuất:</span>{' '}
                  <strong className="font-mono-num">{detailSlip.date}</strong>
                </div>
                <div>
                  <span className="text-[#78685A]">Người thực hiện:</span>{' '}
                  <strong>{detailSlip.staffName}</strong>
                </div>
                <div>
                  <span className="text-[#78685A]">Lý do xuất:</span>{' '}
                  <strong>{detailSlip.reason}</strong>
                </div>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2D9C8] text-[#6E5E50]">
                    <th className="py-2">Mã sách</th>
                    <th className="py-2">Tên sách</th>
                    <th className="py-2 text-right">Số lượng xuất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DD]">
                  {detailSlip.items.map((it) => (
                    <tr key={it.bookId}>
                      <td className="py-2 font-mono-num font-bold text-[#2A4B3C]">{it.bookId}</td>
                      <td className="py-2 font-medium">{it.bookTitle}</td>
                      <td className="py-2 text-right font-mono-num font-bold">
                        {it.quantity} quyển
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
