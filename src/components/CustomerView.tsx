import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, History, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';
import { formatCurrency, generateNextId } from '../data/initialData';

export const CustomerView: React.FC = () => {
  const {
    customers,
    invoices,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useStore();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ id: '', name: '', phone: '', email: '', points: 0 });
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (globalSearchQuery) {
      setSearch(globalSearchQuery);
      setGlobalSearchQuery('');
    }
  }, [globalSearchQuery, setGlobalSearchQuery]);

  const filteredCustomers = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setForm({
      id: generateNextId(
        customers.map((c) => c.id),
        'KH'
      ),
      name: '',
      phone: '',
      email: '',
      points: 0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setForm({
      id: cust.id,
      name: cust.name,
      phone: cust.phone,
      email: cust.email,
      points: cust.points,
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        points: Math.max(0, Number(form.points)),
      });
    } else {
      addCustomer({
        id: form.id.trim().toUpperCase(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        points: Math.max(0, Number(form.points)),
      });
    }
    setShowModal(false);
  };

  const customerInvoices = historyCustomer
    ? invoices.filter((inv) => inv.customerId === historyCustomer.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã khách hàng, họ tên, số điện thoại..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khách hàng</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                <th className="py-3 px-4">Mã khách hàng</th>
                <th className="py-3 px-4">Họ tên</th>
                <th className="py-3 px-3">Số điện thoại</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Loại thành viên</th>
                <th className="py-3 px-3 text-right">Điểm tích lũy</th>
                <th className="py-3 px-3 text-right">Tổng số lần mua</th>
                <th className="py-3 px-3 text-right">Tổng tiền đã mua</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DD] text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#78685A]">
                    Không tìm thấy khách hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#FAF7F2]">
                    <td className="py-3.5 px-4 font-mono-num font-bold text-[#2A4B3C]">
                      {cust.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2C2520]">{cust.name}</td>
                    <td className="py-3.5 px-3 font-mono-num text-[#54483E]">{cust.phone}</td>
                    <td className="py-3.5 px-3 text-[#6E5E50]">{cust.email}</td>
                    <td className="py-3.5 px-3 font-semibold text-[#2A4B3C]">{cust.tier}</td>
                    <td className="py-3.5 px-3 text-right font-mono-num font-bold text-[#2C2520]">
                      {cust.points} điểm
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono-num">
                      {cust.purchaseCount} lần
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono-num font-bold text-[#2C2520]">
                      {formatCurrency(cust.totalSpent)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setHistoryCustomer(cust)}
                          className="px-2.5 py-1 rounded-md bg-[#F3EFE6] hover:bg-[#E5DEC9] text-[#3D332B] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Lịch sử mua</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cust)}
                          className="px-2.5 py-1 rounded-md bg-[#EBF3EE] hover:bg-[#D5E6DC] text-[#2A4B3C] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerToDelete(cust)}
                          className="px-2.5 py-1 rounded-md bg-[#FDF2F2] hover:bg-[#F7D9D9] text-[#9B2C2C] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
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

      {/* Modal Thêm / Sửa khách hàng */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                {editingCustomer ? `Sửa thông tin khách hàng (${editingCustomer.id})` : 'Thêm khách hàng mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#6E5E50] hover:text-[#2C2520]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Mã khách hàng *</label>
                <input
                  type="text"
                  disabled={!!editingCustomer}
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  className="w-full px-3 py-2 bg-white disabled:bg-[#F2ECE1] border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Họ tên *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nhập họ tên khách hàng"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Nhập email khách hàng"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Điểm tích lũy</label>
                <input
                  type="number"
                  min={0}
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer"
                >
                  Lưu khách hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa khách hàng */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#2C2520]">
              Xác nhận xóa khách hàng
            </h3>
            <p className="text-sm text-[#4A3F36] mt-2">
              Bạn có chắc chắn muốn xóa khách hàng <strong>{customerToDelete.name}</strong> (
              {customerToDelete.id}) không?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 rounded-lg border border-[#D8CEBE] text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomer(customerToDelete.id);
                  setCustomerToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#B93829] text-white text-xs font-semibold cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem lịch sử mua hàng của khách */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-[#2C2520]">
                  Lịch sử mua hàng: {historyCustomer.name} ({historyCustomer.id})
                </h3>
                <p className="text-xs text-[#6E5E50]">
                  Hạng: {historyCustomer.tier} · Tổng chi tiêu:{' '}
                  <strong className="font-mono-num">
                    {formatCurrency(historyCustomer.totalSpent)}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryCustomer(null)}
                className="text-[#6E5E50] hover:text-[#2C2520]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-xs max-h-96 overflow-y-auto">
              {customerInvoices.length === 0 ? (
                <p className="py-8 text-center text-[#78685A]">
                  Khách hàng này chưa có hóa đơn mua hàng nào được lưu.
                </p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2D9C8] text-[#6E5E50]">
                      <th className="py-2">Mã HĐ</th>
                      <th className="py-2">Ngày mua</th>
                      <th className="py-2">Sách đã mua</th>
                      <th className="py-2 text-right">Điểm cộng</th>
                      <th className="py-2 text-right">Tổng thanh toán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9DD]">
                    {customerInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-2.5 font-mono-num font-bold text-[#2A4B3C]">{inv.id}</td>
                        <td className="py-2.5 font-mono-num text-[#6E5E50]">{inv.date}</td>
                        <td className="py-2.5">
                          {inv.items.map((i) => `${i.bookTitle} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="py-2.5 text-right font-mono-num text-[#2A4B3C]">
                          +{inv.pointsEarned}
                        </td>
                        <td className="py-2.5 text-right font-mono-num font-bold">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
