import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Tag,
  Award,
  CheckCircle2,
  RotateCcw,
  Printer,
  X,
  UserPlus,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Book, Invoice, PaymentMethod } from '../types';
import { formatCurrency, getTierBenefits, generateNextId } from '../data/initialData';

export const PosView: React.FC = () => {
  const {
    books,
    categories,
    customers,
    discounts,
    settings,
    createInvoice,
    addCustomer,
    showToast,
  } = useStore();

  const [bookSearch, setBookSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  // Giỏ hàng POS
  const [cart, setCart] = useState<{ bookId: string; quantity: number }[]>([
    { bookId: 'SACH002', quantity: 1 },
    { bookId: 'SACH004', quantity: 1 },
  ]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('KH001');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tiền mặt');

  // Modal in hóa đơn vừa thanh toán
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  // Modal thêm nhanh khách hàng tại quầy
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [quickCust, setQuickCust] = useState({ name: '', phone: '', email: '' });

  const filteredBooks = books.filter((b) => {
    const q = bookSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || b.categoryId === catFilter;
    return matchSearch && matchCat;
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;
  const memberBenefit = selectedCustomer
    ? getTierBenefits(selectedCustomer.tier)
    : { discountPercent: 0, description: '', condition: '' };

  const handleAddToCart = (book: Book) => {
    if (book.stock <= 0) {
      showToast('Sách đã hết hàng', `Sách "${book.title}" hiện đã hết tồn kho.`, 'danger');
      return;
    }
    const existing = cart.find((c) => c.bookId === book.id);
    const nextQty = (existing?.quantity || 0) + 1;
    if (nextQty > book.stock) {
      showToast(
        'Không đủ tồn kho',
        `Sách "${book.title}" chỉ còn ${book.stock} quyển trong kho.`,
        'warning'
      );
      return;
    }
    if (existing) {
      setCart((prev) =>
        prev.map((c) => (c.bookId === book.id ? { ...c, quantity: nextQty } : c))
      );
    } else {
      setCart((prev) => [...prev, { bookId: book.id, quantity: 1 }]);
    }
  };

  const handleChangeQty = (bookId: string, delta: number) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.bookId !== bookId) return c;
          const next = c.quantity + delta;
          if (next > book.stock) {
            showToast(
              'Giới hạn tồn kho',
              `Sách "${book.title}" chỉ còn tối đa ${book.stock} cuốn.`,
              'warning'
            );
            return c;
          }
          return { ...c, quantity: next };
        })
        .filter((c) => c.quantity > 0)
    );
  };

  const handleRemoveFromCart = (bookId: string) => {
    setCart((prev) => prev.filter((c) => c.bookId !== bookId));
  };

  // Tính toán tiền hóa đơn
  const cartDetails = cart
    .map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      if (!book) return null;
      return {
        book,
        quantity: item.quantity,
        lineTotal: book.sellPrice * item.quantity,
      };
    })
    .filter(Boolean) as { book: Book; quantity: number; lineTotal: number }[];

  const subtotal = cartDetails.reduce((sum, item) => sum + item.lineTotal, 0);

  // Giảm giá theo hạng thành viên
  const memberDiscountAmount = Math.round((subtotal * memberBenefit.discountPercent) / 100);

  // Giảm giá theo mã khuyến mãi
  const matchedDiscount = discounts.find(
    (d) => d.code.toUpperCase() === appliedCoupon.toUpperCase() && d.active
  );
  const couponDiscountAmount = matchedDiscount
    ? subtotal >= matchedDiscount.minOrder
      ? Math.min(
          matchedDiscount.maxDiscount,
          Math.round((subtotal * matchedDiscount.percent) / 100)
        )
      : 0
    : 0;

  const totalDiscountAmount = memberDiscountAmount + couponDiscountAmount;

  // Điểm sử dụng
  const maxUsablePoints = selectedCustomer
    ? Math.min(
        selectedCustomer.points,
        Math.floor(Math.max(0, subtotal - totalDiscountAmount) / settings.pointRedeemValue)
      )
    : 0;
  const validPointsUsed = Math.min(Math.max(0, pointsToUse), maxUsablePoints);
  const pointDiscountMoney = validPointsUsed * settings.pointRedeemValue;

  const finalTotal = Math.max(0, subtotal - totalDiscountAmount - pointDiscountMoney);
  const estimatedPointsEarned = selectedCustomer
    ? Math.floor(finalTotal / Math.max(1000, settings.pointEarnRate))
    : 0;

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const found = discounts.find((d) => d.code.toUpperCase() === code && d.active);
    if (!found) {
      showToast('Mã không hợp lệ', `Không tìm thấy mã giảm giá "${code}".`, 'danger');
      return;
    }
    if (subtotal < found.minOrder) {
      showToast(
        'Chưa đủ điều kiện',
        `Mã "${code}" yêu cầu đơn hàng tối thiểu ${formatCurrency(found.minOrder)}.`,
        'warning'
      );
      return;
    }
    setAppliedCoupon(found.code);
    showToast('Áp dụng mã giảm giá', `Đã áp dụng mã ${found.code} (-${found.percent}%).`);
  };

  const handleCheckout = () => {
    const res = createInvoice({
      customerId: selectedCustomer ? selectedCustomer.id : null,
      items: cart,
      discountAmount: totalDiscountAmount,
      discountCode: appliedCoupon || undefined,
      pointsUsed: validPointsUsed,
      paymentMethod,
    });
    if (!res.success) {
      showToast('Lỗi thanh toán', res.message, 'danger');
      return;
    }
    setCart([]);
    setAppliedCoupon('');
    setCouponInput('');
    setPointsToUse(0);
    if (res.invoice) {
      setCompletedInvoice(res.invoice);
    }
  };

  const handleCancelOrder = () => {
    setCart([]);
    setAppliedCoupon('');
    setCouponInput('');
    setPointsToUse(0);
    showToast('Đã hủy hóa đơn', 'Đã làm mới giỏ hàng tại quầy.', 'info');
  };

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCust.name.trim() || !quickCust.phone.trim()) return;
    const newId = generateNextId(
      customers.map((c) => c.id),
      'KH'
    );
    const created = addCustomer({
      id: newId,
      name: quickCust.name.trim(),
      phone: quickCust.phone.trim(),
      email: quickCust.email.trim() || 'khachhang@nhasach.vn',
      points: 10,
    });
    setSelectedCustomerId(created.id);
    setQuickCust({ name: '', phone: '', email: '' });
    setShowQuickCustomerModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* CỘT TRÁI: Ô tìm kiếm sách & Danh sách sách */}
      <div className="lg:col-span-7 bg-white border border-[#E2D9C8] rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E2D9C8] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-[#2C2520]">
              Danh mục sách tại quầy
            </h2>
            <span className="text-xs text-[#6E5E50]">
              Bấm vào dòng sách để thêm ngay vào hóa đơn bên phải
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-7 relative">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                placeholder="Tìm mã sách, tên sách, tác giả..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
              />
            </div>
            <div className="sm:col-span-5">
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
              >
                <option value="all">Tất cả thể loại</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bảng danh sách sách: Mã sách, Tên sách, Giá bán, Số lượng tồn */}
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42] z-10">
              <tr>
                <th className="py-3 px-4">Mã sách</th>
                <th className="py-3 px-4">Tên sách</th>
                <th className="py-3 px-3 text-right">Giá bán</th>
                <th className="py-3 px-3 text-right">Số lượng tồn</th>
                <th className="py-3 px-4 text-right">Chọn mua</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DD] text-xs">
              {filteredBooks.map((book) => {
                const inCartQty = cart.find((c) => c.bookId === book.id)?.quantity || 0;
                const isOut = book.stock <= 0;
                return (
                  <tr
                    key={book.id}
                    onClick={() => !isOut && handleAddToCart(book)}
                    className={`transition-colors ${
                      isOut
                        ? 'opacity-50 bg-[#F9F6F0] cursor-not-allowed'
                        : 'hover:bg-[#F5EFE4] cursor-pointer'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono-num font-bold text-[#2A4B3C]">
                      {book.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#2C2520]">{book.title}</div>
                      <div className="text-[11px] text-[#78685A]">
                        {book.author} · {book.categoryName}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num font-bold text-[#2C2520] whitespace-nowrap">
                      {formatCurrency(book.sellPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          isOut
                            ? 'text-[#B93829]'
                            : book.stock <= book.minStock
                            ? 'text-[#B86B14]'
                            : 'text-[#2A4B3C]'
                        }`}
                      >
                        {book.stock} cuốn
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={isOut}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(book);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                          inCartQty > 0
                            ? 'bg-[#2A4B3C] text-white'
                            : 'bg-[#EFE9DD] text-[#2C2520] hover:bg-[#E2D8C5]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{inCartQty > 0 ? `Đã chọn (${inCartQty})` : 'Thêm'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CỘT PHẢI: HÓA ĐƠN (POS) */}
      <div className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 bg-[#233D30] text-white flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold tracking-wide">HÓA ĐƠN BÁN HÀNG</h2>
            <p className="text-xs text-[#BFD4C8]">Tự động tính tiền, tích điểm và trừ kho</p>
          </div>
          <span className="font-mono-num text-xs bg-[#345746] px-2.5 py-1 rounded-md">
            {cart.reduce((s, i) => s + i.quantity, 0)} quyển
          </span>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Chọn Khách hàng */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-[#3D332B]">Khách hàng / Thành viên</label>
              <button
                type="button"
                onClick={() => setShowQuickCustomerModal(true)}
                className="text-[#2A4B3C] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Thêm khách mới</span>
              </button>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setPointsToUse(0);
              }}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8CEBE] rounded-lg text-xs font-medium text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
            >
              <option value="">Khách lẻ vãng lai (Không tích điểm)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.name} ({c.phone}) · {c.tier} ({c.points} điểm)
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#F4EFE6] border border-[#E2D9C8] flex items-center justify-between text-[11px]">
                <span>
                  Hạng: <strong className="text-[#2A4B3C]">{selectedCustomer.tier}</strong> (Ưu đãi
                  giảm {memberBenefit.discountPercent}%)
                </span>
                <span className="font-mono-num">
                  Điểm khả dụng: <strong>{selectedCustomer.points} điểm</strong>
                </span>
              </div>
            )}
          </div>

          {/* Danh sách sách đã chọn */}
          <div>
            <div className="font-bold text-[#3D332B] mb-2">Danh sách sách đã chọn</div>
            <div className="border border-[#E2D9C8] rounded-xl overflow-hidden">
              {cartDetails.length === 0 ? (
                <div className="py-8 text-center text-[#78685A] bg-[#FAF7F2]">
                  Chưa có sách trong hóa đơn. Hãy chọn sách từ bảng bên trái.
                </div>
              ) : (
                <div className="divide-y divide-[#EFE9DD] max-h-60 overflow-y-auto">
                  {cartDetails.map(({ book, quantity, lineTotal }) => (
                    <div key={book.id} className="p-3 hover:bg-[#FAF7F2] flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono-num font-bold text-[#2A4B3C] mr-1.5">
                            {book.id}
                          </span>
                          <span className="font-semibold text-[#2C2520]">{book.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(book.id)}
                          className="text-[#9B2C2C] hover:bg-[#FDF2F2] p-1 rounded cursor-pointer"
                          title="Xóa khỏi hóa đơn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-[#6E5E50] font-mono-num">
                          Đơn giá: {formatCurrency(book.sellPrice)}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleChangeQty(book.id, -1)}
                            className="w-6 h-6 rounded border border-[#D8CEBE] bg-white hover:bg-[#EFE9DD] flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono-num font-bold w-6 text-center">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleChangeQty(book.id, 1)}
                            className="w-6 h-6 rounded border border-[#D8CEBE] bg-white hover:bg-[#EFE9DD] flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="font-mono-num font-bold text-[#2C2520]">
                          {formatCurrency(lineTotal)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mã giảm giá & Sử dụng điểm thành viên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
              <label className="flex items-center gap-1.5 font-semibold text-[#3D332B] mb-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2A4B3C]" />
                <span>Mã giảm giá</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="VD: TRITHUC10"
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-white border border-[#D8CEBE] rounded-lg font-mono-num uppercase text-xs"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer shrink-0"
                >
                  Áp dụng
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {discounts
                  .filter((d) => d.active)
                  .map((d) => (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => {
                        setCouponInput(d.code);
                        setAppliedCoupon(d.code);
                      }}
                      className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-[#EFE9DD] hover:bg-[#E2D8C5] text-[#2A4B3C] font-semibold cursor-pointer"
                    >
                      {d.code} (-{d.percent}%)
                    </button>
                  ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
              <label className="flex items-center gap-1.5 font-semibold text-[#3D332B] mb-1.5">
                <Award className="w-3.5 h-3.5 text-[#2A4B3C]" />
                <span>Sử dụng điểm tích lũy</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={maxUsablePoints}
                  disabled={!selectedCustomer}
                  value={pointsToUse}
                  onChange={(e) => setPointsToUse(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white disabled:bg-[#EFE9DD] border border-[#D8CEBE] rounded-lg font-mono-num text-xs"
                />
                <button
                  type="button"
                  disabled={!selectedCustomer}
                  onClick={() => setPointsToUse(maxUsablePoints)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#EFE9DD] hover:bg-[#E2D8C5] text-[#2C2520] font-semibold shrink-0 disabled:opacity-40 cursor-pointer"
                >
                  Tối đa
                </button>
              </div>
              <p className="text-[10px] text-[#78685A] mt-1.5 font-mono-num">
                1 điểm = {formatCurrency(settings.pointRedeemValue)} (Trừ:{' '}
                {formatCurrency(pointDiscountMoney)})
              </p>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <label className="block font-bold text-[#3D332B] mb-2">
              Phương thức thanh toán
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Tiền mặt', 'Chuyển khoản', 'Thẻ'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-[#2A4B3C] border-[#2A4B3C] text-white'
                      : 'bg-[#FAF7F2] border-[#D8CEBE] text-[#4A3F36] hover:bg-[#EFE9DD]'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Bảng tính tiền chi tiết */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-2">
            <div className="flex justify-between text-[#54483E]">
              <span>Tạm tính:</span>
              <span className="font-mono-num font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#54483E]">
              <span>
                Giảm giá {appliedCoupon ? `(Hạng TV + Mã ${appliedCoupon})` : '(Ưu đãi thành viên)'}
                :
              </span>
              <span className="font-mono-num font-semibold text-[#2A4B3C]">
                -{formatCurrency(totalDiscountAmount)}
              </span>
            </div>
            <div className="flex justify-between text-[#54483E]">
              <span>Điểm sử dụng ({validPointsUsed} điểm):</span>
              <span className="font-mono-num font-semibold text-[#2A4B3C]">
                -{formatCurrency(pointDiscountMoney)}
              </span>
            </div>
            <div className="flex justify-between text-[#6E5E50] text-[11px] pt-1 border-t border-[#E6DEC8]">
              <span>Điểm tích lũy cộng thêm sau thanh toán:</span>
              <span className="font-mono-num font-bold text-[#2A4B3C]">
                +{estimatedPointsEarned} điểm
              </span>
            </div>
            <div className="pt-2 border-t border-[#D8CEBE] flex items-center justify-between">
              <span className="text-sm font-bold text-[#2C2520]">TỔNG TIỀN THANH TOÁN:</span>
              <span className="font-mono-num text-xl font-bold text-[#2A4B3C]">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>

          {/* Nút Thanh toán & Hủy hóa đơn */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCancelOrder}
              className="py-3 px-4 rounded-lg border border-[#D8CEBE] bg-white hover:bg-[#EFE9DD] text-[#4A3F36] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Hủy hóa đơn</span>
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              className="sm:col-span-2 py-3 px-5 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Thanh toán ({formatCurrency(finalTotal)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thêm nhanh khách hàng */}
      {showQuickCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                Đăng ký nhanh khách hàng thành viên
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickCustomerModal(false)}
                className="text-[#6E5E50] hover:text-[#2C2520]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickAddCustomer} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Họ tên khách hàng *</label>
                <input
                  type="text"
                  required
                  value={quickCust.name}
                  onChange={(e) => setQuickCust({ ...quickCust, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  required
                  value={quickCust.phone}
                  onChange={(e) => setQuickCust({ ...quickCust, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Email</label>
                <input
                  type="email"
                  value={quickCust.email}
                  onChange={(e) => setQuickCust({ ...quickCust, email: e.target.value })}
                  placeholder="Nhập địa chỉ email"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickCustomerModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold"
                >
                  Lưu & Chọn khách hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Phiếu in hóa đơn sau khi thanh toán thành công */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#2A4B3C] text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-display text-base font-bold">Thanh toán thành công</h3>
              </div>
              <button
                type="button"
                onClick={() => setCompletedInvoice(null)}
                className="text-white/80 hover:text-white"
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
                <p className="font-mono-num text-xs font-bold text-[#2A4B3C] mt-2">
                  PHIẾU THANH TOÁN: {completedInvoice.id}
                </p>
                <p className="font-mono-num text-[11px] text-[#78685A]">{completedInvoice.date}</p>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6E5E50]">Khách hàng:</span>
                  <strong>{completedInvoice.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E5E50]">Thu ngân:</span>
                  <strong>{completedInvoice.staffName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E5E50]">Phương thức:</span>
                  <strong>{completedInvoice.paymentMethod}</strong>
                </div>
              </div>

              <table className="w-full text-left border-t border-b border-[#E2D9C8] py-2">
                <thead>
                  <tr className="text-[11px] text-[#6E5E50] border-b border-[#EFE9DD]">
                    <th className="py-1.5">Tên sách</th>
                    <th className="py-1.5 text-right">SL</th>
                    <th className="py-1.5 text-right">Đơn giá</th>
                    <th className="py-1.5 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DD]">
                  {completedInvoice.items.map((it) => (
                    <tr key={it.bookId}>
                      <td className="py-1.5 font-medium">{it.bookTitle}</td>
                      <td className="py-1.5 text-right font-mono-num">{it.quantity}</td>
                      <td className="py-1.5 text-right font-mono-num">
                        {formatCurrency(it.unitPrice)}
                      </td>
                      <td className="py-1.5 text-right font-mono-num font-semibold">
                        {formatCurrency(it.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-mono-num">{formatCurrency(completedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giảm giá:</span>
                  <span className="font-mono-num">
                    -{formatCurrency(completedInvoice.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Điểm sử dụng ({completedInvoice.pointsUsed} điểm):</span>
                  <span className="font-mono-num">
                    -{formatCurrency(completedInvoice.pointsUsed * settings.pointRedeemValue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#2A4B3C] pt-1.5 border-t border-[#E2D9C8]">
                  <span>TỔNG THANH TOÁN:</span>
                  <span className="font-mono-num">
                    {formatCurrency(completedInvoice.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-[#EFE9DD] hover:bg-[#E2D8C5] text-[#2C2520] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In hóa đơn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompletedInvoice(null)}
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer"
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
