export type UserRole =
  | 'Quản trị viên'
  | 'Nhân viên bán hàng'
  | 'Nhân viên kho'
  | 'Quản lý nhà sách';

export type BookStatus = 'Còn hàng' | 'Sắp hết' | 'Hết hàng';

export type MemberTier =
  | 'Thành viên thường'
  | 'Thành viên bạc'
  | 'Thành viên vàng'
  | 'Thành viên VIP';

export type PaymentMethod = 'Tiền mặt' | 'Chuyển khoản' | 'Thẻ';

export type InvoiceStatus = 'Đã thanh toán' | 'Đã hoàn tiền' | 'Đã hủy';

export type NavTab =
  | 'tong-quan'
  | 'quan-ly-sach'
  | 'quan-ly-kho'
  | 'nhap-sach'
  | 'xuat-sach'
  | 'ban-hang'
  | 'hoa-don'
  | 'khach-hang'
  | 'thanh-vien'
  | 'nguoi-dung'
  | 'bao-cao'
  | 'cai-dat';

export interface Book {
  id: string; // Mã sách (VD: SACH001)
  title: string; // Tên sách
  categoryId: string;
  categoryName: string; // Thể loại
  author: string; // Tác giả
  publisherId: string;
  publisherName: string; // Nhà xuất bản
  importPrice: number; // Giá nhập (riêng biệt)
  sellPrice: number; // Giá bán (riêng biệt)
  stock: number; // Số lượng tồn
  minStock: number; // Mức tồn tối thiểu
  soldCount: number; // Số lượng đã bán
  description: string; // Mô tả
}

export interface Category {
  id: string; // Mã thể loại
  name: string; // Tên thể loại
  description: string; // Mô tả
}

export interface Publisher {
  id: string; // Mã nhà xuất bản
  name: string; // Tên nhà xuất bản
  address: string; // Địa chỉ
  phone: string; // Số điện thoại
}

export interface ImportItem {
  bookId: string;
  bookTitle: string;
  quantity: number;
  importPrice: number;
  lineTotal: number;
}

export interface ImportSlip {
  id: string; // Mã phiếu nhập (VD: PN001)
  date: string; // Ngày nhập (YYYY-MM-DD HH:mm)
  staffName: string; // Nhân viên nhập
  supplier: string; // Nhà cung cấp
  note?: string;
  items: ImportItem[];
  totalAmount: number; // Tổng tiền
}

export interface ExportItem {
  bookId: string;
  bookTitle: string;
  quantity: number;
}

export interface ExportSlip {
  id: string; // Mã phiếu xuất (VD: PX001)
  date: string; // Ngày xuất
  staffName: string; // Người thực hiện
  reason: string; // Lý do xuất (Chuyển chi nhánh, Hư hỏng/Lỗi in, Trả nhà cung cấp, Quà tặng...)
  items: ExportItem[];
  totalQuantity: number;
}

export interface StockCheckRecord {
  id: string; // Mã kiểm kê (VD: KK001)
  date: string;
  staffName: string;
  bookId: string;
  bookTitle: string;
  oldStock: number;
  newStock: number;
  difference: number;
  reason: string;
}

export interface InvoiceItem {
  bookId: string;
  bookTitle: string;
  quantity: number;
  unitPrice: number; // Đơn giá (Giá bán)
  importPrice: number; // Giá nhập để tính lợi nhuận báo cáo
  lineTotal: number; // Thành tiền
}

export interface Invoice {
  id: string; // Mã hóa đơn (VD: HD001)
  date: string; // Ngày lập (YYYY-MM-DD HH:mm)
  customerId: string | null;
  customerName: string; // Khách hàng
  staffName: string; // Nhân viên
  items: InvoiceItem[];
  subtotal: number; // Tạm tính
  discountAmount: number; // Giảm giá (VNĐ)
  discountCode?: string; // Mã giảm giá
  pointsUsed: number; // Điểm sử dụng
  pointsEarned: number; // Điểm tích lũy thêm
  totalAmount: number; // Tổng tiền thanh toán
  paymentMethod: PaymentMethod; // Phương thức thanh toán
  status: InvoiceStatus; // Trạng thái
}

export interface PointHistoryItem {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  change: number; // + hoặc -
  balanceAfter: number;
  type: 'Tích điểm mua hàng' | 'Sử dụng điểm' | 'Cộng điểm thủ công' | 'Trừ điểm thủ công' | 'Điều chỉnh điểm';
  note: string;
  staffName: string;
}

export interface Customer {
  id: string; // Mã khách hàng (VD: KH001)
  name: string; // Họ tên
  phone: string; // Số điện thoại
  email: string; // Email
  tier: MemberTier; // Loại thành viên
  points: number; // Điểm tích lũy
  purchaseCount: number; // Tổng số lần mua
  totalSpent: number; // Tổng tiền đã mua
  joinedDate: string;
}

export interface UserAccount {
  id: string; // Mã người dùng (VD: ND001)
  fullName: string; // Họ tên
  username: string; // Tên đăng nhập
  passwordHash: string; // Mã băm mật khẩu (không lưu plain text)
  role: UserRole; // Vai trò
  active: boolean; // Trạng thái (Hoạt động / Đã khóa)
  createdAt: string; // Ngày tạo
  customPermissions?: string[]; // Quyền tùy chỉnh
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'warning' | 'danger' | 'success' | 'info';
}

export interface DiscountCode {
  code: string;
  description: string;
  percent: number;
  maxDiscount: number;
  minOrder: number;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  defaultMinStock: number;
  pointEarnRate: number; // Bao nhiêu VNĐ được 1 điểm (VD: 10000 VNĐ = 1 điểm)
  pointRedeemValue: number; // 1 điểm đổi được bao nhiêu VNĐ (VD: 1 điểm = 1000 VNĐ)
}
