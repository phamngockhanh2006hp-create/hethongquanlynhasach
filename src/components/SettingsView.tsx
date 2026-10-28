import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Tag, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../data/initialData';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    discounts,
    addDiscount,
    toggleDiscount,
    resetAllSampleData,
  } = useStore();

  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    percent: 10,
    maxDiscount: 50000,
    minOrder: 150000,
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;
    addDiscount({
      code: couponForm.code.trim().toUpperCase(),
      description:
        couponForm.description.trim() ||
        `Giảm ${couponForm.percent}% cho đơn từ ${formatCurrency(couponForm.minOrder)}`,
      percent: Number(couponForm.percent),
      maxDiscount: Number(couponForm.maxDiscount),
      minOrder: Number(couponForm.minOrder),
      active: true,
    });
    setCouponForm({
      code: '',
      description: '',
      percent: 10,
      maxDiscount: 50000,
      minOrder: 150000,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cài đặt thông tin nhà sách & quy tắc tích điểm */}
        <div className="lg:col-span-7 bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E2D9C8]">
            <h2 className="font-display text-base font-bold text-[#2C2520]">
              Cấu hình thông tin nhà sách & Quy tắc nghiệp vụ
            </h2>
            <p className="text-xs text-[#6E5E50]">
              Thông tin hiển thị trên phiếu in hóa đơn và định mức tích điểm thành viên
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">Tên nhà sách</label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">Số điện thoại</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">Địa chỉ</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">Email liên hệ</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">
                  Tồn tối thiểu mặc định
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.defaultMinStock}
                  onChange={(e) => setForm({ ...form, defaultMinStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">
                  Mức chi tiêu tích 1 điểm (VNĐ)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={form.pointEarnRate}
                  onChange={(e) => setForm({ ...form, pointEarnRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1.5">
                  Giá trị quy đổi 1 điểm (VNĐ)
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={form.pointRedeemValue}
                  onChange={(e) => setForm({ ...form, pointRedeemValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 rounded-lg border border-[#E8B4B4] bg-[#FDF2F2] hover:bg-[#F7D9D9] text-[#9B2C2C] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục dữ liệu mẫu</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu cài đặt</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quản lý Mã giảm giá sử dụng ở màn hình POS */}
        <div className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#2A4B3C]" />
            <div>
              <h2 className="font-display text-base font-bold text-[#2C2520]">
                Quản lý mã giảm giá (POS)
              </h2>
              <p className="text-xs text-[#6E5E50]">
                Các mã khuyến mãi áp dụng trực tiếp khi bán hàng
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5 text-xs">
            <form onSubmit={handleAddCoupon} className="space-y-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
              <div className="font-bold text-[#2C2520]">Thêm mã khuyến mãi mới</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6E5E50] mb-1">Mã giảm giá *</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    placeholder="VD: HE2026"
                    className="w-full px-3 py-1.5 bg-white border border-[#D8CEBE] rounded-lg font-mono-num uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[#6E5E50] mb-1">Phần trăm giảm (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={couponForm.percent}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, percent: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6E5E50] mb-1">Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    min={5000}
                    step={5000}
                    value={couponForm.maxDiscount}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-[#6E5E50] mb-1">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={couponForm.minOrder}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, minOrder: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lưu mã giảm giá</span>
              </button>
            </form>

            <div className="space-y-2">
              {discounts.map((d) => (
                <div
                  key={d.code}
                  className="p-3 rounded-xl border border-[#E2D9C8] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-mono-num font-bold text-[#2A4B3C]">
                      {d.code} (-{d.percent}%)
                    </div>
                    <div className="text-[11px] text-[#6E5E50] mt-0.5">{d.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleDiscount(d.code)}
                    className={`px-2.5 py-1 rounded-md font-semibold text-[11px] cursor-pointer ${
                      d.active
                        ? 'bg-[#EBF3EE] text-[#2A4B3C]'
                        : 'bg-[#F2ECE1] text-[#78685A]'
                    }`}
                  >
                    {d.active ? 'Đang bật' : 'Đã tắt'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận khôi phục dữ liệu mẫu */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-2.5 text-[#9B2C2C]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-display text-lg font-bold text-[#2C2520]">
                Khôi phục dữ liệu mẫu
              </h3>
            </div>
            <p className="text-sm text-[#4A3F36] mt-3 leading-relaxed">
              Thao tác này sẽ xóa dữ liệu hiện tại và khôi phục dữ liệu mẫu ban đầu. Bạn có chắc chắn muốn tiếp tục không?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg border border-[#D8CEBE] text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllSampleData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#9B2C2C] hover:bg-[#7D2222] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Xác nhận khôi phục</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
