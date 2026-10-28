import {
  Book,
  Category,
  Publisher,
  Customer,
  Invoice,
  ImportSlip,
  ExportSlip,
  StockCheckRecord,
  PointHistoryItem,
  UserAccount,
  AppNotification,
  DiscountCode,
  StoreSettings,
  BookStatus,
  MemberTier,
  NavTab,
  UserRole,
} from '../types';

export function computeBookStatus(stock: number, minStock: number): BookStatus {
  if (stock <= 0) return 'Hết hàng';
  if (stock <= minStock) return 'Sắp hết';
  return 'Còn hàng';
}

export function computeMemberTier(totalSpent: number, points: number): MemberTier {
  if (totalSpent >= 5000000 || points >= 500) return 'Thành viên VIP';
  if (totalSpent >= 2500000 || points >= 250) return 'Thành viên vàng';
  if (totalSpent >= 1000000 || points >= 100) return 'Thành viên bạc';
  return 'Thành viên thường';
}

export function getTierBenefits(tier: MemberTier): {
  discountPercent: number;
  description: string;
  condition: string;
} {
  switch (tier) {
    case 'Thành viên VIP':
      return {
        discountPercent: 10,
        description: 'Giảm 10% mọi đơn hàng, nhân đôi điểm thưởng dịp lễ, quà tặng sinh nhật đặc biệt',
        condition: 'Chi tiêu từ 5.000.000 VNĐ hoặc đạt 500 điểm',
      };
    case 'Thành viên vàng':
      return {
        discountPercent: 7,
        description: 'Giảm 7% mọi đơn hàng, ưu tiên đặt trước sách mới phát hành',
        condition: 'Chi tiêu từ 2.500.000 VNĐ hoặc đạt 250 điểm',
      };
    case 'Thành viên bạc':
      return {
        discountPercent: 4,
        description: 'Giảm 4% mọi đơn hàng, tích lũy điểm đổi voucher trực tiếp',
        condition: 'Chi tiêu từ 1.000.000 VNĐ hoặc đạt 100 điểm',
      };
    default:
      return {
        discountPercent: 0,
        description: 'Tích 1 điểm cho mỗi 10.000 VNĐ thanh toán, dùng điểm trừ trực tiếp vào hóa đơn',
        condition: 'Đăng ký miễn phí tại quầy thu ngân',
      };
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' VNĐ';
}

export function generateNextId(existingIds: string[], prefix: string, pad = 3): string {
  let maxNum = 0;
  const upperPrefix = prefix.toUpperCase();
  for (const rawId of existingIds) {
    const id = rawId.trim().toUpperCase();
    if (id.startsWith(upperPrefix)) {
      const rest = id.slice(upperPrefix.length).replace(/\D/g, '');
      const num = parseInt(rest, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `${upperPrefix}${String(maxNum + 1).padStart(pad, '0')}`;
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'TL001',
    name: 'Văn học Việt Nam',
    description: 'Tiểu thuyết, truyện ngắn, tản văn và tác phẩm kinh điển của các tác giả Việt Nam.',
  },
  {
    id: 'TL002',
    name: 'Văn học nước ngoài',
    description: 'Tác phẩm văn học dịch kinh điển và đương đại từ khắp nơi trên thế giới.',
  },
  {
    id: 'TL003',
    name: 'Kinh tế & Quản trị',
    description: 'Sách khởi nghiệp, quản trị doanh nghiệp, tài chính cá nhân và đầu tư.',
  },
  {
    id: 'TL004',
    name: 'Công nghệ thông tin',
    description: 'Kỹ thuật phần mềm, cấu trúc dữ liệu, trí tuệ nhân tạo và lập trình hệ thống.',
  },
  {
    id: 'TL005',
    name: 'Kỹ năng sống & Tâm lý',
    description: 'Phát triển bản thân, tâm lý học ứng dụng, giao tiếp và rèn luyện tư duy.',
  },
  {
    id: 'TL006',
    name: 'Thiếu nhi',
    description: 'Truyện đồng thoại, sách bồi dưỡng tâm hồn và khám phá khoa học cho trẻ em.',
  },
  {
    id: 'TL007',
    name: 'Khoa học & Lịch sử',
    description: 'Lịch sử văn minh nhân loại, lịch sử dân tộc và kiến thức khoa học tự nhiên.',
  },
];

export const INITIAL_PUBLISHERS: Publisher[] = [
  {
    id: 'NXB001',
    name: 'NXB Kim Đồng',
    address: '55 Quang Trung, Quận Hai Bà Trưng, Hà Nội',
    phone: '02439434730',
  },
  {
    id: 'NXB002',
    name: 'NXB Trẻ',
    address: '161B Lý Chính Thắng, Quận 3, TP. Hồ Chí Minh',
    phone: '02839316289',
  },
  {
    id: 'NXB003',
    name: 'NXB Hội Nhà Văn',
    address: '65 Nguyễn Du, Quận Hai Bà Trưng, Hà Nội',
    phone: '02438222135',
  },
  {
    id: 'NXB004',
    name: 'NXB Tổng hợp TP.HCM',
    address: '62 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh',
    phone: '02838225340',
  },
  {
    id: 'NXB005',
    name: 'NXB Khoa học và Kỹ thuật',
    address: '70 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
    phone: '02438220686',
  },
  {
    id: 'NXB006',
    name: 'NXB Thế Giới',
    address: '46 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
    phone: '02438253841',
  },
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'SACH001',
    title: 'Dế Mèn Phiêu Lưu Ký',
    categoryId: 'TL006',
    categoryName: 'Thiếu nhi',
    author: 'Tô Hoài',
    publisherId: 'NXB001',
    publisherName: 'NXB Kim Đồng',
    importPrice: 45000,
    sellPrice: 65000,
    stock: 4,
    minStock: 10,
    soldCount: 84,
    description: 'Tác phẩm văn học thiếu nhi kinh điển của nhà văn Tô Hoài về hành trình trưởng thành của chú Dế Mèn.',
  },
  {
    id: 'SACH002',
    title: 'Mắt Biếc',
    categoryId: 'TL001',
    categoryName: 'Văn học Việt Nam',
    author: 'Nguyễn Nhật Ánh',
    publisherId: 'NXB002',
    publisherName: 'NXB Trẻ',
    importPrice: 78000,
    sellPrice: 115000,
    stock: 38,
    minStock: 10,
    soldCount: 112,
    description: 'Câu chuyện trong trẻo và day dứt về tình yêu đơn phương của Ngạn dành cho Hà Lan nơi làng Đo Đo.',
  },
  {
    id: 'SACH003',
    title: 'Cây Cam Ngọt Của Tôi',
    categoryId: 'TL002',
    categoryName: 'Văn học nước ngoài',
    author: 'José Mauro de Vasconcelos',
    publisherId: 'NXB003',
    publisherName: 'NXB Hội Nhà Văn',
    importPrice: 72000,
    sellPrice: 108000,
    stock: 26,
    minStock: 8,
    soldCount: 95,
    description: 'Cuốn tiểu thuyết cảm động về cậu bé Zezé giàu trí tưởng tượng và tấm lòng nhân hậu.',
  },
  {
    id: 'SACH004',
    title: 'Nhà Giả Kim',
    categoryId: 'TL002',
    categoryName: 'Văn học nước ngoài',
    author: 'Paulo Coelho',
    publisherId: 'NXB003',
    publisherName: 'NXB Hội Nhà Văn',
    importPrice: 54000,
    sellPrice: 79000,
    stock: 42,
    minStock: 12,
    soldCount: 128,
    description: 'Hành trình theo đuổi vận mệnh của chàng chăn cừu Santiago qua sa mạc Sahara.',
  },
  {
    id: 'SACH005',
    title: 'Đắc Nhân Tâm',
    categoryId: 'TL005',
    categoryName: 'Kỹ năng sống & Tâm lý',
    author: 'Dale Carnegie',
    publisherId: 'NXB004',
    publisherName: 'NXB Tổng hợp TP.HCM',
    importPrice: 60000,
    sellPrice: 88000,
    stock: 31,
    minStock: 10,
    soldCount: 79,
    description: 'Nghệ thuật thu phục lòng người và giao tiếp ứng xử hiệu quả trong công việc lẫn cuộc sống.',
  },
  {
    id: 'SACH006',
    title: 'Tư Duy Nhanh Và Chậm',
    categoryId: 'TL003',
    categoryName: 'Kinh tế & Quản trị',
    author: 'Daniel Kahneman',
    publisherId: 'NXB006',
    publisherName: 'NXB Thế Giới',
    importPrice: 165000,
    sellPrice: 239000,
    stock: 19,
    minStock: 6,
    soldCount: 53,
    description: 'Công trình nghiên cứu của chủ nhân giải Nobel Kinh tế về hai hệ thống tư duy chi phối quyết định con người.',
  },
  {
    id: 'SACH007',
    title: 'Kỹ Thuật Phần Mềm Thực Chiến',
    categoryId: 'TL004',
    categoryName: 'Công nghệ thông tin',
    author: 'TS. Nguyễn Văn Hòa',
    publisherId: 'NXB005',
    publisherName: 'NXB Khoa học và Kỹ thuật',
    importPrice: 125000,
    sellPrice: 175000,
    stock: 22,
    minStock: 8,
    soldCount: 68,
    description: 'Giáo trình và cẩm nang thực hành phân tích thiết kế hệ thống, quy trình Agile/Scrum và kiểm thử phần mềm.',
  },
  {
    id: 'SACH008',
    title: 'Cấu Trúc Dữ Liệu Và Giải Thuật Hiện Đại',
    categoryId: 'TL004',
    categoryName: 'Công nghệ thông tin',
    author: 'PGS. Lê Minh Hoàng',
    publisherId: 'NXB005',
    publisherName: 'NXB Khoa học và Kỹ thuật',
    importPrice: 110000,
    sellPrice: 158000,
    stock: 5,
    minStock: 8,
    soldCount: 47,
    description: 'Phân tích độ phức tạp thuật toán, cây tìm kiếm, đồ thị và quy hoạch động dành cho sinh viên CNTT.',
  },
  {
    id: 'SACH009',
    title: 'Số Đỏ',
    categoryId: 'TL001',
    categoryName: 'Văn học Việt Nam',
    author: 'Vũ Trọng Phụng',
    publisherId: 'NXB003',
    publisherName: 'NXB Hội Nhà Văn',
    importPrice: 58000,
    sellPrice: 85000,
    stock: 0,
    minStock: 8,
    soldCount: 41,
    description: 'Kiệt tác trào phúng xuất sắc của văn học Việt Nam giai đoạn 1930-1945.',
  },
  {
    id: 'SACH010',
    title: 'Sapiens: Lược Sử Loài Người',
    categoryId: 'TL007',
    categoryName: 'Khoa học & Lịch sử',
    author: 'Yuval Noah Harari',
    publisherId: 'NXB006',
    publisherName: 'NXB Thế Giới',
    importPrice: 148000,
    sellPrice: 215000,
    stock: 16,
    minStock: 8,
    soldCount: 64,
    description: 'Bức tranh toàn cảnh về quá trình tiến hóa và phát triển của loài người từ thời tiền sử đến hiện đại.',
  },
  {
    id: 'SACH011',
    title: 'Tâm Lý Học Về Tiền',
    categoryId: 'TL003',
    categoryName: 'Kinh tế & Quản trị',
    author: 'Morgan Housel',
    publisherId: 'NXB006',
    publisherName: 'NXB Thế Giới',
    importPrice: 105000,
    sellPrice: 150000,
    stock: 3,
    minStock: 8,
    soldCount: 59,
    description: '19 câu chuyện ngắn khám phá cách con người suy nghĩ về tiền bạc và đưa ra quyết định tài chính.',
  },
  {
    id: 'SACH012',
    title: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ',
    categoryId: 'TL001',
    categoryName: 'Văn học Việt Nam',
    author: 'Nguyễn Nhật Ánh',
    publisherId: 'NXB002',
    publisherName: 'NXB Trẻ',
    importPrice: 55000,
    sellPrice: 80000,
    stock: 29,
    minStock: 10,
    soldCount: 73,
    description: 'Những kỷ niệm tuổi thơ hồn nhiên, dí dỏm của cu Mùi và nhóm bạn nhỏ.',
  },
  {
    id: 'SACH013',
    title: 'Thiết Kế Hệ Thống Phân Tán',
    categoryId: 'TL004',
    categoryName: 'Công nghệ thông tin',
    author: 'Martin Kleppmann',
    publisherId: 'NXB005',
    publisherName: 'NXB Khoa học và Kỹ thuật',
    importPrice: 195000,
    sellPrice: 280000,
    stock: 0,
    minStock: 5,
    soldCount: 36,
    description: 'Nguyên lý cốt lõi đằng sau các hệ thống cơ sở dữ liệu lớn, độ tin cậy, khả năng mở rộng và bảo trì.',
  },
  {
    id: 'SACH014',
    title: 'Búp Sen Xanh',
    categoryId: 'TL001',
    categoryName: 'Văn học Việt Nam',
    author: 'Sơn Tùng',
    publisherId: 'NXB001',
    publisherName: 'NXB Kim Đồng',
    importPrice: 62000,
    sellPrice: 92000,
    stock: 24,
    minStock: 8,
    soldCount: 52,
    description: 'Tiểu thuyết lịch sử viết về thời thơ ấu và tuổi trẻ của Chủ tịch Hồ Chí Minh.',
  },
  {
    id: 'SACH015',
    title: 'Hiểu Về Trái Tim',
    categoryId: 'TL005',
    categoryName: 'Kỹ năng sống & Tâm lý',
    author: 'Minh Niệm',
    publisherId: 'NXB004',
    publisherName: 'NXB Tổng hợp TP.HCM',
    importPrice: 95000,
    sellPrice: 138000,
    stock: 18,
    minStock: 8,
    soldCount: 61,
    description: 'Cuốn sách chữa lành tâm hồn, giúp người đọc thấu hiểu cảm xúc và xây dựng bình an nội tại.',
  },
];

export const ALLOWED_STAFF_NAMES = [
  'LÊ THỊ THANH HƯƠNG',
  'ĐẶNG THÙY LINH',
  'PHẠM NGỌC KHÁNH',
  'ĐẶNG VÂN LY',
  'NGUYỄN KHÁNH NGỌC',
] as const;

// Hàm băm mật khẩu một chiều phục vụ xác thực an toàn (không lưu mật khẩu dạng rõ)
export function hashPassword(rawPassword: string): string {
  const salted = `nhasach_salt_2026::${rawPassword}`;
  let h1 = 0xdeadbeef ^ salted.length;
  let h2 = 0x41c6ce57 ^ salted.length;
  for (let i = 0; i < salted.length; i++) {
    const ch = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 'sha256_sim_' + (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

export function verifyPassword(rawPassword: string, storedHash: string): boolean {
  return hashPassword(rawPassword) === storedHash;
}

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'ND001',
    fullName: 'LÊ THỊ THANH HƯƠNG',
    username: 'thanhhuong',
    passwordHash: hashPassword('Huong@123'),
    role: 'Quản trị viên',
    active: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'ND002',
    fullName: 'ĐẶNG THÙY LINH',
    username: 'thuylinh',
    passwordHash: hashPassword('Linh@123'),
    role: 'Nhân viên bán hàng',
    active: true,
    createdAt: '2026-01-12',
  },
  {
    id: 'ND003',
    fullName: 'PHẠM NGỌC KHÁNH',
    username: 'ngockhanh',
    passwordHash: hashPassword('Khanh@123'),
    role: 'Nhân viên kho',
    active: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'ND004',
    fullName: 'ĐẶNG VÂN LY',
    username: 'vanly',
    passwordHash: hashPassword('Ly@123'),
    role: 'Quản lý nhà sách',
    active: true,
    createdAt: '2026-01-18',
  },
  {
    id: 'ND005',
    fullName: 'NGUYỄN KHÁNH NGỌC',
    username: 'khanhngoc',
    passwordHash: hashPassword('Ngoc@123'),
    role: 'Nhân viên bán hàng',
    active: true,
    createdAt: '2026-01-20',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'KH001',
    name: 'Nguyễn Minh Tuấn',
    phone: '0901234567',
    email: 'minhtuan.nguyen@gmail.com',
    tier: 'Thành viên VIP',
    points: 540,
    purchaseCount: 14,
    totalSpent: 5680000,
    joinedDate: '2025-11-12',
  },
  {
    id: 'KH002',
    name: 'Trần Thu Hà',
    phone: '0912345678',
    email: 'thuha.tran@gmail.com',
    tier: 'Thành viên vàng',
    points: 310,
    purchaseCount: 9,
    totalSpent: 3240000,
    joinedDate: '2025-12-05',
  },
  {
    id: 'KH003',
    name: 'Lê Hoàng Nam',
    phone: '0987654321',
    email: 'hoangnam.le@outlook.com',
    tier: 'Thành viên bạc',
    points: 145,
    purchaseCount: 5,
    totalSpent: 1520000,
    joinedDate: '2026-01-18',
  },
  {
    id: 'KH004',
    name: 'Phạm Phương Thảo',
    phone: '0934567890',
    email: 'phuongthao.pham@gmail.com',
    tier: 'Thành viên thường',
    points: 62,
    purchaseCount: 3,
    totalSpent: 620000,
    joinedDate: '2026-03-04',
  },
  {
    id: 'KH005',
    name: 'Đỗ Quang Huy',
    phone: '0978123456',
    email: 'quanghuy.do@gmail.com',
    tier: 'Thành viên vàng',
    points: 275,
    purchaseCount: 8,
    totalSpent: 2890000,
    joinedDate: '2026-01-25',
  },
  {
    id: 'KH006',
    name: 'Bùi Ngọc Ánh',
    phone: '0945678912',
    email: 'ngocanh.bui@gmail.com',
    tier: 'Thành viên bạc',
    points: 118,
    purchaseCount: 4,
    totalSpent: 1210000,
    joinedDate: '2026-02-14',
  },
];

// Lấy ngày hiện tại theo định dạng YYYY-MM-DD
const todayStr = new Date().toISOString().slice(0, 10);
const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const twoDaysAgoDate = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
const fourDaysAgoDate = new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10);
const sixDaysAgoDate = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'HD001',
    date: `${todayStr} 09:15`,
    customerId: 'KH001',
    customerName: 'Nguyễn Minh Tuấn',
    staffName: 'ĐẶNG THÙY LINH',
    items: [
      {
        bookId: 'SACH002',
        bookTitle: 'Mắt Biếc',
        quantity: 2,
        unitPrice: 115000,
        importPrice: 78000,
        lineTotal: 230000,
      },
      {
        bookId: 'SACH007',
        bookTitle: 'Kỹ Thuật Phần Mềm Thực Chiến',
        quantity: 1,
        unitPrice: 175000,
        importPrice: 125000,
        lineTotal: 175000,
      },
    ],
    subtotal: 405000,
    discountAmount: 40500,
    pointsUsed: 0,
    pointsEarned: 36,
    totalAmount: 364500,
    paymentMethod: 'Chuyển khoản',
    status: 'Đã thanh toán',
  },
  {
    id: 'HD002',
    date: `${todayStr} 11:40`,
    customerId: 'KH002',
    customerName: 'Trần Thu Hà',
    staffName: 'NGUYỄN KHÁNH NGỌC',
    items: [
      {
        bookId: 'SACH004',
        bookTitle: 'Nhà Giả Kim',
        quantity: 2,
        unitPrice: 79000,
        importPrice: 54000,
        lineTotal: 158000,
      },
      {
        bookId: 'SACH010',
        bookTitle: 'Sapiens: Lược Sử Loài Người',
        quantity: 1,
        unitPrice: 215000,
        importPrice: 148000,
        lineTotal: 215000,
      },
    ],
    subtotal: 373000,
    discountAmount: 26110,
    pointsUsed: 10,
    pointsEarned: 33,
    totalAmount: 336890,
    paymentMethod: 'Tiền mặt',
    status: 'Đã thanh toán',
  },
  {
    id: 'HD003',
    date: `${yesterdayDate} 15:20`,
    customerId: 'KH003',
    customerName: 'Lê Hoàng Nam',
    staffName: 'ĐẶNG THÙY LINH',
    items: [
      {
        bookId: 'SACH006',
        bookTitle: 'Tư Duy Nhanh Và Chậm',
        quantity: 1,
        unitPrice: 239000,
        importPrice: 165000,
        lineTotal: 239000,
      },
      {
        bookId: 'SACH011',
        bookTitle: 'Tâm Lý Học Về Tiền',
        quantity: 1,
        unitPrice: 150000,
        importPrice: 105000,
        lineTotal: 150000,
      },
    ],
    subtotal: 389000,
    discountAmount: 15560,
    pointsUsed: 0,
    pointsEarned: 37,
    totalAmount: 373440,
    paymentMethod: 'Thẻ',
    status: 'Đã thanh toán',
  },
  {
    id: 'HD004',
    date: `${twoDaysAgoDate} 17:05`,
    customerId: 'KH005',
    customerName: 'Đỗ Quang Huy',
    staffName: 'NGUYỄN KHÁNH NGỌC',
    items: [
      {
        bookId: 'SACH003',
        bookTitle: 'Cây Cam Ngọt Của Tôi',
        quantity: 3,
        unitPrice: 108000,
        importPrice: 72000,
        lineTotal: 324000,
      },
      {
        bookId: 'SACH015',
        bookTitle: 'Hiểu Về Trái Tim',
        quantity: 1,
        unitPrice: 138000,
        importPrice: 95000,
        lineTotal: 138000,
      },
    ],
    subtotal: 462000,
    discountAmount: 32340,
    pointsUsed: 0,
    pointsEarned: 43,
    totalAmount: 429660,
    paymentMethod: 'Chuyển khoản',
    status: 'Đã thanh toán',
  },
  {
    id: 'HD005',
    date: `${fourDaysAgoDate} 10:30`,
    customerId: 'KH004',
    customerName: 'Phạm Phương Thảo',
    staffName: 'NGUYỄN KHÁNH NGỌC',
    items: [
      {
        bookId: 'SACH001',
        bookTitle: 'Dế Mèn Phiêu Lưu Ký',
        quantity: 2,
        unitPrice: 65000,
        importPrice: 45000,
        lineTotal: 130000,
      },
      {
        bookId: 'SACH012',
        bookTitle: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ',
        quantity: 2,
        unitPrice: 80000,
        importPrice: 55000,
        lineTotal: 160000,
      },
    ],
    subtotal: 290000,
    discountAmount: 0,
    pointsUsed: 0,
    pointsEarned: 29,
    totalAmount: 290000,
    paymentMethod: 'Tiền mặt',
    status: 'Đã thanh toán',
  },
  {
    id: 'HD006',
    date: `${sixDaysAgoDate} 14:45`,
    customerId: 'KH006',
    customerName: 'Bùi Ngọc Ánh',
    staffName: 'ĐẶNG THÙY LINH',
    items: [
      {
        bookId: 'SACH005',
        bookTitle: 'Đắc Nhân Tâm',
        quantity: 2,
        unitPrice: 88000,
        importPrice: 60000,
        lineTotal: 176000,
      },
      {
        bookId: 'SACH014',
        bookTitle: 'Búp Sen Xanh',
        quantity: 2,
        unitPrice: 92000,
        importPrice: 62000,
        lineTotal: 184000,
      },
    ],
    subtotal: 360000,
    discountAmount: 14400,
    pointsUsed: 0,
    pointsEarned: 35,
    totalAmount: 345600,
    paymentMethod: 'Chuyển khoản',
    status: 'Đã thanh toán',
  },
];

export const INITIAL_IMPORT_SLIPS: ImportSlip[] = [
  {
    id: 'PN001',
    date: `${sixDaysAgoDate} 08:30`,
    staffName: 'PHẠM NGỌC KHÁNH',
    supplier: 'Công ty Phát hành Sách FAHASA',
    note: 'Nhập bổ sung sách văn học và thiếu nhi đầu tháng',
    items: [
      {
        bookId: 'SACH002',
        bookTitle: 'Mắt Biếc',
        quantity: 20,
        importPrice: 78000,
        lineTotal: 1560000,
      },
      {
        bookId: 'SACH004',
        bookTitle: 'Nhà Giả Kim',
        quantity: 25,
        importPrice: 54000,
        lineTotal: 1350000,
      },
    ],
    totalAmount: 2910000,
  },
  {
    id: 'PN002',
    date: `${fourDaysAgoDate} 09:45`,
    staffName: 'PHẠM NGỌC KHÁNH',
    supplier: 'NXB Khoa học và Kỹ thuật',
    note: 'Nhập giáo trình Công nghệ thông tin học kỳ mới',
    items: [
      {
        bookId: 'SACH007',
        bookTitle: 'Kỹ Thuật Phần Mềm Thực Chiến',
        quantity: 15,
        importPrice: 125000,
        lineTotal: 1875000,
      },
      {
        bookId: 'SACH008',
        bookTitle: 'Cấu Trúc Dữ Liệu Và Giải Thuật Hiện Đại',
        quantity: 10,
        importPrice: 110000,
        lineTotal: 1100000,
      },
    ],
    totalAmount: 2975000,
  },
  {
    id: 'PN003',
    date: `${yesterdayDate} 14:00`,
    staffName: 'PHẠM NGỌC KHÁNH',
    supplier: 'Công ty Văn hóa và Truyền thông Nhã Nam',
    note: 'Nhập sách kỹ năng sống và lịch sử',
    items: [
      {
        bookId: 'SACH003',
        bookTitle: 'Cây Cam Ngọt Của Tôi',
        quantity: 15,
        importPrice: 72000,
        lineTotal: 1080000,
      },
      {
        bookId: 'SACH010',
        bookTitle: 'Sapiens: Lược Sử Loài Người',
        quantity: 10,
        importPrice: 148000,
        lineTotal: 1480000,
      },
    ],
    totalAmount: 2560000,
  },
];

export const INITIAL_EXPORT_SLIPS: ExportSlip[] = [
  {
    id: 'PX001',
    date: `${fourDaysAgoDate} 16:15`,
    staffName: 'PHẠM NGỌC KHÁNH',
    reason: 'Chuyển kho sang chi nhánh Quận 3',
    items: [
      {
        bookId: 'SACH004',
        bookTitle: 'Nhà Giả Kim',
        quantity: 5,
      },
      {
        bookId: 'SACH005',
        bookTitle: 'Đắc Nhân Tâm',
        quantity: 4,
      },
    ],
    totalQuantity: 9,
  },
  {
    id: 'PX002',
    date: `${twoDaysAgoDate} 11:00`,
    staffName: 'PHẠM NGỌC KHÁNH',
    reason: 'Xuất trả nhà cung cấp do lỗi đóng gáy bìa',
    items: [
      {
        bookId: 'SACH009',
        bookTitle: 'Số Đỏ',
        quantity: 2,
      },
    ],
    totalQuantity: 2,
  },
];

export const INITIAL_STOCK_CHECKS: StockCheckRecord[] = [
  {
    id: 'KK001',
    date: `${twoDaysAgoDate} 17:30`,
    staffName: 'PHẠM NGỌC KHÁNH',
    bookId: 'SACH001',
    bookTitle: 'Dế Mèn Phiêu Lưu Ký',
    oldStock: 5,
    newStock: 4,
    difference: -1,
    reason: 'Kiểm kê định kỳ phát hiện 1 cuốn rách bìa chuyển kệ trưng bày',
  },
];

export const INITIAL_POINT_HISTORY: PointHistoryItem[] = [
  {
    id: 'LS001',
    date: `${todayStr} 09:15`,
    customerId: 'KH001',
    customerName: 'Nguyễn Minh Tuấn',
    change: 36,
    balanceAfter: 540,
    type: 'Tích điểm mua hàng',
    note: 'Tích điểm từ hóa đơn HD001',
    staffName: 'ĐẶNG THÙY LINH',
  },
  {
    id: 'LS002',
    date: `${todayStr} 11:40`,
    customerId: 'KH002',
    customerName: 'Trần Thu Hà',
    change: -10,
    balanceAfter: 277,
    type: 'Sử dụng điểm',
    note: 'Đổi 10 điểm giảm 10.000 VNĐ cho hóa đơn HD002',
    staffName: 'NGUYỄN KHÁNH NGỌC',
  },
  {
    id: 'LS003',
    date: `${todayStr} 11:40`,
    customerId: 'KH002',
    customerName: 'Trần Thu Hà',
    change: 33,
    balanceAfter: 310,
    type: 'Tích điểm mua hàng',
    note: 'Tích điểm từ hóa đơn HD002',
    staffName: 'NGUYỄN KHÁNH NGỌC',
  },
  {
    id: 'LS004',
    date: `${yesterdayDate} 15:20`,
    customerId: 'KH003',
    customerName: 'Lê Hoàng Nam',
    change: 37,
    balanceAfter: 145,
    type: 'Tích điểm mua hàng',
    note: 'Tích điểm từ hóa đơn HD003',
    staffName: 'ĐẶNG THÙY LINH',
  },
  {
    id: 'LS005',
    date: `${twoDaysAgoDate} 10:00`,
    customerId: 'KH001',
    customerName: 'Nguyễn Minh Tuấn',
    change: 50,
    balanceAfter: 504,
    type: 'Cộng điểm thủ công',
    note: 'Tặng điểm tri ân khách hàng sinh nhật tháng',
    staffName: 'LÊ THỊ THANH HƯƠNG',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'TB001',
    title: 'Cảnh báo sắp hết hàng',
    message: 'Sách Dế Mèn Phiêu Lưu Ký sắp hết hàng (còn 4 cuốn).',
    time: '10 phút trước',
    read: false,
    type: 'warning',
  },
  {
    id: 'TB002',
    title: 'Cảnh báo hết hàng',
    message: 'Có 2 đầu sách đã hết hàng (Số Đỏ, Thiết Kế Hệ Thống Phân Tán).',
    time: '25 phút trước',
    read: false,
    type: 'danger',
  },
  {
    id: 'TB003',
    title: 'Thanh toán hóa đơn',
    message: 'Hóa đơn HD001 đã thanh toán thành công (364.500 VNĐ).',
    time: '1 giờ trước',
    read: false,
    type: 'success',
  },
  {
    id: 'TB004',
    title: 'Nhập kho thành công',
    message: 'Phiếu nhập PN003 đã được lưu và cập nhật tồn kho.',
    time: 'Hôm qua',
    read: true,
    type: 'info',
  },
];

export const INITIAL_DISCOUNTS: DiscountCode[] = [
  {
    code: 'TRITHUC10',
    description: 'Giảm 10% tối đa 50.000 VNĐ cho đơn từ 150.000 VNĐ',
    percent: 10,
    maxDiscount: 50000,
    minOrder: 150000,
    active: true,
  },
  {
    code: 'SINHVIEN15',
    description: 'Giảm 15% tối đa 75.000 VNĐ cho sinh viên mua giáo trình từ 200.000 VNĐ',
    percent: 15,
    maxDiscount: 75000,
    minOrder: 200000,
    active: true,
  },
  {
    code: 'NHASACH20',
    description: 'Giảm 20% tối đa 100.000 VNĐ cho đơn hàng từ 400.000 VNĐ',
    percent: 20,
    maxDiscount: 100000,
    minOrder: 400000,
    active: true,
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'NHÀ SÁCH TRI THỨC VIỆT',
  address: 'Số 1 Đại Cồ Việt, Quận Hai Bà Trưng, TP. Hà Nội',
  phone: '024 3869 4242',
  email: 'lienhe@nhasachtrithuc.edu.vn',
  defaultMinStock: 8,
  pointEarnRate: 10000, // 10.000 VNĐ = 1 điểm
  pointRedeemValue: 1000, // 1 điểm = 1.000 VNĐ
};

export const ROLE_ALLOWED_TABS: Record<UserRole, NavTab[]> = {
  'Quản trị viên': [
    'tong-quan',
    'quan-ly-sach',
    'quan-ly-kho',
    'nhap-sach',
    'xuat-sach',
    'ban-hang',
    'hoa-don',
    'khach-hang',
    'thanh-vien',
    'nguoi-dung',
    'bao-cao',
    'cai-dat',
  ],
  'Nhân viên bán hàng': [
    'tong-quan',
    'quan-ly-sach',
    'ban-hang',
    'hoa-don',
    'khach-hang',
    'thanh-vien',
  ],
  'Nhân viên kho': [
    'tong-quan',
    'quan-ly-sach',
    'quan-ly-kho',
    'nhap-sach',
    'xuat-sach',
  ],
  'Quản lý nhà sách': [
    'tong-quan',
    'quan-ly-sach',
    'quan-ly-kho',
    'ban-hang',
    'hoa-don',
    'khach-hang',
    'thanh-vien',
    'bao-cao',
  ],
};

export function canAccessTab(role: UserRole | undefined, tab: NavTab): boolean {
  if (!role) return false;
  const allowed = ROLE_ALLOWED_TABS[role] || [];
  return allowed.includes(tab);
}

export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  'Quản trị viên': [
    'Tổng quan hệ thống',
    'Thêm / Sửa / Xóa sách',
    'Quản lý thể loại & NXB',
    'Quản lý kho & Kiểm kê',
    'Lập phiếu nhập sách',
    'Lập phiếu xuất sách',
    'Bán hàng tại quầy (POS)',
    'Quản lý hóa đơn',
    'Quản lý khách hàng & Thành viên',
    'Quản lý tài khoản & Phân quyền',
    'Xem báo cáo & Doanh thu',
    'Cài đặt hệ thống',
  ],
  'Nhân viên bán hàng': [
    'Tổng quan hệ thống',
    'Tra cứu danh mục sách',
    'Bán hàng tại quầy (POS)',
    'Quản lý hóa đơn',
    'Quản lý khách hàng & Thành viên',
  ],
  'Nhân viên kho': [
    'Tổng quan hệ thống',
    'Tra cứu danh mục sách',
    'Quản lý kho & Kiểm kê',
    'Lập phiếu nhập sách',
    'Lập phiếu xuất sách',
  ],
  'Quản lý nhà sách': [
    'Tổng quan hệ thống',
    'Thêm / Sửa / Xóa sách',
    'Quản lý thể loại & NXB',
    'Quản lý kho & Kiểm kê',
    'Bán hàng tại quầy (POS)',
    'Quản lý hóa đơn',
    'Quản lý khách hàng & Thành viên',
    'Xem báo cáo & Doanh thu',
  ],
};
