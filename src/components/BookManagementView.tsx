import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  ArrowUpDown,
  X,
  BookOpen,
  Layers,
  Building2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Book, Category, Publisher, BookStatus } from '../types';
import { computeBookStatus, formatCurrency, generateNextId } from '../data/initialData';

export const BookManagementView: React.FC = () => {
  const {
    books,
    categories,
    publishers,
    settings,
    addBook,
    updateBook,
    deleteBook,
    addCategory,
    updateCategory,
    deleteCategory,
    addPublisher,
    updatePublisher,
    deletePublisher,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useStore();

  // Sub-navigation: Danh mục sách | Quản lý thể loại | Quản lý nhà xuất bản
  const [subTab, setSubTab] = useState<'sach' | 'the-loai' | 'nha-xuat-ban'>('sach');

  // Bộ lọc & Tìm kiếm Sách
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [publisherFilter, setPublisherFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | BookStatus>('all');
  const [sortBy, setSortBy] = useState<
    'default' | 'sellPrice-asc' | 'sellPrice-desc' | 'importPrice-asc' | 'importPrice-desc' | 'stock-asc' | 'stock-desc'
  >('default');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery);
      setSubTab('sach');
      setGlobalSearchQuery('');
    }
  }, [globalSearchQuery, setGlobalSearchQuery]);

  // Modal Thêm / Sửa Sách
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    id: '',
    title: '',
    categoryId: '',
    author: '',
    publisherId: '',
    importPrice: 45000,
    sellPrice: 65000,
    stock: 20,
    minStock: 8,
    description: '',
  });
  const [bookFormError, setBookFormError] = useState('');

  // Modal Xem chi tiết Sách
  const [detailBook, setDetailBook] = useState<Book | null>(null);

  // Modal Xác nhận xóa Sách
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Quản lý Thể loại state
  const [catSearch, setCatSearch] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ id: '', name: '', description: '' });
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);

  // Quản lý Nhà xuất bản state
  const [pubSearch, setPubSearch] = useState('');
  const [showPubModal, setShowPubModal] = useState(false);
  const [editingPub, setEditingPub] = useState<Publisher | null>(null);
  const [pubForm, setPubForm] = useState({ id: '', name: '', address: '', phone: '' });
  const [pubToDelete, setPubToDelete] = useState<Publisher | null>(null);

  // Lọc và sắp xếp danh sách sách
  const filteredBooks = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = books.filter((b) => {
      const status = computeBookStatus(b.stock, b.minStock);
      const matchSearch =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        b.publisherName.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || b.categoryId === categoryFilter;
      const matchPub = publisherFilter === 'all' || b.publisherId === publisherFilter;
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      return matchSearch && matchCat && matchPub && matchStatus;
    });

    if (sortBy === 'sellPrice-asc') list.sort((a, b) => a.sellPrice - b.sellPrice);
    else if (sortBy === 'sellPrice-desc') list.sort((a, b) => b.sellPrice - a.sellPrice);
    else if (sortBy === 'importPrice-asc') list.sort((a, b) => a.importPrice - b.importPrice);
    else if (sortBy === 'importPrice-desc') list.sort((a, b) => b.importPrice - a.importPrice);
    else if (sortBy === 'stock-asc') list.sort((a, b) => a.stock - b.stock);
    else if (sortBy === 'stock-desc') list.sort((a, b) => b.stock - a.stock);

    return list;
  }, [books, searchQuery, categoryFilter, publisherFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Mở form thêm sách mới
  const handleOpenAddBook = () => {
    const nextId = generateNextId(
      books.map((b) => b.id),
      'SACH'
    );
    setEditingBook(null);
    setBookForm({
      id: nextId,
      title: '',
      categoryId: categories[0]?.id || '',
      author: '',
      publisherId: publishers[0]?.id || '',
      importPrice: 50000,
      sellPrice: 75000,
      stock: 20,
      minStock: settings.defaultMinStock || 8,
      description: '',
    });
    setBookFormError('');
    setShowBookModal(true);
  };

  // Mở form sửa sách (tự động hiển thị dữ liệu hiện tại)
  const handleOpenEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm({
      id: book.id,
      title: book.title,
      categoryId: book.categoryId,
      author: book.author,
      publisherId: book.publisherId,
      importPrice: book.importPrice,
      sellPrice: book.sellPrice,
      stock: book.stock,
      minStock: book.minStock,
      description: book.description,
    });
    setBookFormError('');
    setShowBookModal(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.id.trim() || !bookForm.title.trim() || !bookForm.author.trim()) {
      setBookFormError('Vui lòng nhập đầy đủ Mã sách, Tên sách và Tác giả.');
      return;
    }
    if (bookForm.importPrice <= 0 || bookForm.sellPrice <= 0) {
      setBookFormError('Giá nhập và Giá bán phải lớn hơn 0 VNĐ.');
      return;
    }
    if (!editingBook && books.some((b) => b.id.toLowerCase() === bookForm.id.trim().toLowerCase())) {
      setBookFormError(`Mã sách "${bookForm.id}" đã tồn tại. Vui lòng nhập mã khác.`);
      return;
    }

    const catObj = categories.find((c) => c.id === bookForm.categoryId);
    const pubObj = publishers.find((p) => p.id === bookForm.publisherId);

    if (editingBook) {
      updateBook({
        ...editingBook,
        title: bookForm.title.trim(),
        categoryId: bookForm.categoryId,
        categoryName: catObj?.name || 'Chưa phân loại',
        author: bookForm.author.trim(),
        publisherId: bookForm.publisherId,
        publisherName: pubObj?.name || 'NXB Khác',
        importPrice: Number(bookForm.importPrice),
        sellPrice: Number(bookForm.sellPrice),
        stock: Math.max(0, Number(bookForm.stock)),
        minStock: Math.max(1, Number(bookForm.minStock)),
        description: bookForm.description.trim(),
      });
    } else {
      addBook({
        id: bookForm.id.trim().toUpperCase(),
        title: bookForm.title.trim(),
        categoryId: bookForm.categoryId,
        categoryName: catObj?.name || 'Chưa phân loại',
        author: bookForm.author.trim(),
        publisherId: bookForm.publisherId,
        publisherName: pubObj?.name || 'NXB Khác',
        importPrice: Number(bookForm.importPrice),
        sellPrice: Number(bookForm.sellPrice),
        stock: Math.max(0, Number(bookForm.stock)),
        minStock: Math.max(1, Number(bookForm.minStock)),
        description: bookForm.description.trim(),
      });
    }
    setShowBookModal(false);
  };

  // Xử lý Thể loại
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(catSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(catSearch.toLowerCase())
  );

  const handleOpenAddCat = () => {
    setEditingCat(null);
    setCatForm({
      id: generateNextId(
        categories.map((c) => c.id),
        'TL'
      ),
      name: '',
      description: '',
    });
    setShowCatModal(true);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.id.trim() || !catForm.name.trim()) return;
    if (editingCat) {
      updateCategory({
        id: editingCat.id,
        name: catForm.name.trim(),
        description: catForm.description.trim(),
      });
    } else {
      addCategory({
        id: catForm.id.trim().toUpperCase(),
        name: catForm.name.trim(),
        description: catForm.description.trim(),
      });
    }
    setShowCatModal(false);
  };

  // Xử lý Nhà xuất bản
  const filteredPublishers = publishers.filter(
    (p) =>
      p.name.toLowerCase().includes(pubSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(pubSearch.toLowerCase()) ||
      p.address.toLowerCase().includes(pubSearch.toLowerCase()) ||
      p.phone.includes(pubSearch)
  );

  const handleOpenAddPub = () => {
    setEditingPub(null);
    setPubForm({
      id: generateNextId(
        publishers.map((p) => p.id),
        'NXB'
      ),
      name: '',
      address: '',
      phone: '',
    });
    setShowPubModal(true);
  };

  const handleSavePub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubForm.id.trim() || !pubForm.name.trim()) return;
    if (editingPub) {
      updatePublisher({
        id: editingPub.id,
        name: pubForm.name.trim(),
        address: pubForm.address.trim(),
        phone: pubForm.phone.trim(),
      });
    } else {
      addPublisher({
        id: pubForm.id.trim().toUpperCase(),
        name: pubForm.name.trim(),
        address: pubForm.address.trim(),
        phone: pubForm.phone.trim(),
      });
    }
    setShowPubModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Thanh chuyển đổi giữa Quản lý sách / Quản lý thể loại / Quản lý nhà xuất bản */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F2ECE1] rounded-lg border border-[#E2D9C8]">
          <button
            type="button"
            onClick={() => setSubTab('sach')}
            className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              subTab === 'sach'
                ? 'bg-[#2A4B3C] text-white'
                : 'text-[#54483E] hover:text-[#2C2520]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Danh sách đầu sách ({books.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('the-loai')}
            className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              subTab === 'the-loai'
                ? 'bg-[#2A4B3C] text-white'
                : 'text-[#54483E] hover:text-[#2C2520]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Quản lý thể loại ({categories.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('nha-xuat-ban')}
            className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              subTab === 'nha-xuat-ban'
                ? 'bg-[#2A4B3C] text-white'
                : 'text-[#54483E] hover:text-[#2C2520]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Quản lý nhà xuất bản ({publishers.length})</span>
          </button>
        </div>

        {subTab === 'sach' && (
          <button
            type="button"
            onClick={handleOpenAddBook}
            className="px-4 py-2.5 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sách mới</span>
          </button>
        )}
        {subTab === 'the-loai' && (
          <button
            type="button"
            onClick={handleOpenAddCat}
            className="px-4 py-2.5 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thể loại</span>
          </button>
        )}
        {subTab === 'nha-xuat-ban' && (
          <button
            type="button"
            onClick={handleOpenAddPub}
            className="px-4 py-2.5 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm nhà xuất bản</span>
          </button>
        )}
      </div>

      {/* TAB 1: QUẢN LÝ SÁCH */}
      {subTab === 'sach' && (
        <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
          {/* Bộ lọc & Tìm kiếm */}
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E2D9C8] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm theo mã sách, tên sách, tác giả..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
              />
            </div>

            <div className="lg:col-span-2">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
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

            <div className="lg:col-span-2">
              <select
                value={publisherFilter}
                onChange={(e) => {
                  setPublisherFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
              >
                <option value="all">Tất cả nhà xuất bản</option>
                {publishers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | BookStatus);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Còn hàng">Còn hàng</option>
                <option value="Sắp hết">Sắp hết</option>
                <option value="Hết hàng">Hết hàng</option>
              </select>
            </div>

            <div className="lg:col-span-2 flex items-center gap-1.5">
              <div className="relative flex-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full pl-8 pr-2 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                >
                  <option value="default">Sắp xếp mặc định</option>
                  <option value="sellPrice-asc">Giá bán tăng dần</option>
                  <option value="sellPrice-desc">Giá bán giảm dần</option>
                  <option value="importPrice-asc">Giá nhập tăng dần</option>
                  <option value="importPrice-desc">Giá nhập giảm dần</option>
                  <option value="stock-asc">Số lượng tồn tăng dần</option>
                  <option value="stock-desc">Số lượng tồn giảm dần</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setPublisherFilter('all');
                  setStatusFilter('all');
                  setSortBy('default');
                  setCurrentPage(1);
                }}
                title="Đặt lại bộ lọc"
                className="p-2 rounded-lg bg-white border border-[#D8CEBE] text-[#6E5E50] hover:bg-[#EFE9DD] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bảng danh sách sách (Không sử dụng ảnh bìa sách, Giá nhập và Giá bán tách biệt) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                  <th className="py-3 px-4 whitespace-nowrap">Mã sách</th>
                  <th className="py-3 px-4">Tên sách</th>
                  <th className="py-3 px-3 whitespace-nowrap">Thể loại</th>
                  <th className="py-3 px-3 whitespace-nowrap">Tác giả</th>
                  <th className="py-3 px-3 whitespace-nowrap">Nhà xuất bản</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Giá nhập</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Giá bán</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Số lượng tồn</th>
                  <th className="py-3 px-3 whitespace-nowrap">Trạng thái</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DD] text-xs">
                {paginatedBooks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#78685A]">
                      Không tìm thấy đầu sách nào khớp với điều kiện lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  paginatedBooks.map((book) => {
                    const status = computeBookStatus(book.stock, book.minStock);
                    return (
                      <tr key={book.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-3.5 px-4 font-mono-num font-bold text-[#2A4B3C] whitespace-nowrap">
                          {book.id}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#2C2520] min-w-[180px]">
                          {book.title}
                        </td>
                        <td className="py-3.5 px-3 text-[#54483E] whitespace-nowrap">
                          {book.categoryName}
                        </td>
                        <td className="py-3.5 px-3 text-[#54483E] whitespace-nowrap">
                          {book.author}
                        </td>
                        <td className="py-3.5 px-3 text-[#6E5E50] whitespace-nowrap">
                          {book.publisherName}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono-num text-[#6E5E50] whitespace-nowrap">
                          {formatCurrency(book.importPrice)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono-num font-bold text-[#2C2520] whitespace-nowrap">
                          {formatCurrency(book.sellPrice)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono-num font-semibold text-[#2C2520] whitespace-nowrap">
                          {book.stock}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              status === 'Còn hàng'
                                ? 'text-[#2A4B3C]'
                                : status === 'Sắp hết'
                                ? 'text-[#B86B14]'
                                : 'text-[#B93829]'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetailBook(book)}
                              title="Xem chi tiết"
                              className="px-2 py-1 rounded-md bg-[#F3EFE6] hover:bg-[#E5DEC9] text-[#3D332B] font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Chi tiết</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditBook(book)}
                              title="Sửa sách"
                              className="px-2 py-1 rounded-md bg-[#EBF3EE] hover:bg-[#D5E6DC] text-[#2A4B3C] font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setBookToDelete(book)}
                              title="Xóa sách"
                              className="px-2 py-1 rounded-md bg-[#FDF2F2] hover:bg-[#F7D9D9] text-[#9B2C2C] font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="px-4 py-3 bg-[#FAF7F2] border-t border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6E5E50]">
            <div>
              Hiển thị{' '}
              <strong className="font-mono-num text-[#2C2520]">{paginatedBooks.length}</strong> trên
              tổng số{' '}
              <strong className="font-mono-num text-[#2C2520]">{filteredBooks.length}</strong> đầu
              sách
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#D8CEBE] bg-white disabled:opacity-40 hover:bg-[#EFE9DD] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-mono-num font-semibold text-[#2C2520]">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#D8CEBE] bg-white disabled:opacity-40 hover:bg-[#EFE9DD] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUẢN LÝ THỂ LOẠI */}
      {subTab === 'the-loai' && (
        <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Tìm kiếm mã hoặc tên thể loại..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
              />
            </div>
            <span className="text-xs text-[#6E5E50]">
              Tổng cộng: <strong className="font-mono-num">{filteredCategories.length}</strong> thể
              loại
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                  <th className="py-3 px-4">Mã thể loại</th>
                  <th className="py-3 px-4">Tên thể loại</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4 text-right">Số lượng sách</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DD] text-xs">
                {filteredCategories.map((cat) => {
                  const bookCount = books.filter((b) => b.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-[#FAF7F2]">
                      <td className="py-3.5 px-4 font-mono-num font-bold text-[#2A4B3C]">
                        {cat.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#2C2520]">{cat.name}</td>
                      <td className="py-3.5 px-4 text-[#54483E] max-w-md">{cat.description}</td>
                      <td className="py-3.5 px-4 text-right font-mono-num font-semibold">
                        {bookCount} đầu sách
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCat(cat);
                              setCatForm({
                                id: cat.id,
                                name: cat.name,
                                description: cat.description,
                              });
                              setShowCatModal(true);
                            }}
                            className="px-2.5 py-1 rounded-md bg-[#EBF3EE] hover:bg-[#D5E6DC] text-[#2A4B3C] font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCatToDelete(cat)}
                            className="px-2.5 py-1 rounded-md bg-[#FDF2F2] hover:bg-[#F7D9D9] text-[#9B2C2C] font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QUẢN LÝ NHÀ XUẤT BẢN */}
      {subTab === 'nha-xuat-ban' && (
        <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={pubSearch}
                onChange={(e) => setPubSearch(e.target.value)}
                placeholder="Tìm mã NXB, tên nhà xuất bản, số điện thoại..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
              />
            </div>
            <span className="text-xs text-[#6E5E50]">
              Tổng cộng: <strong className="font-mono-num">{filteredPublishers.length}</strong> nhà
              xuất bản
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                  <th className="py-3 px-4">Mã nhà xuất bản</th>
                  <th className="py-3 px-4">Tên nhà xuất bản</th>
                  <th className="py-3 px-4">Địa chỉ</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4 text-right">Số lượng sách</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DD] text-xs">
                {filteredPublishers.map((pub) => {
                  const bookCount = books.filter((b) => b.publisherId === pub.id).length;
                  return (
                    <tr key={pub.id} className="hover:bg-[#FAF7F2]">
                      <td className="py-3.5 px-4 font-mono-num font-bold text-[#2A4B3C]">
                        {pub.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#2C2520]">{pub.name}</td>
                      <td className="py-3.5 px-4 text-[#54483E]">{pub.address}</td>
                      <td className="py-3.5 px-4 font-mono-num text-[#54483E]">{pub.phone}</td>
                      <td className="py-3.5 px-4 text-right font-mono-num font-semibold">
                        {bookCount} đầu sách
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPub(pub);
                              setPubForm({
                                id: pub.id,
                                name: pub.name,
                                address: pub.address,
                                phone: pub.phone,
                              });
                              setShowPubModal(true);
                            }}
                            className="px-2.5 py-1 rounded-md bg-[#EBF3EE] hover:bg-[#D5E6DC] text-[#2A4B3C] font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPubToDelete(pub)}
                            className="px-2.5 py-1 rounded-md bg-[#FDF2F2] hover:bg-[#F7D9D9] text-[#9B2C2C] font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA SÁCH */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#2C2520]">
                {editingBook ? `Chỉnh sửa sách (${editingBook.id})` : 'Thêm sách mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="p-1 text-[#6E5E50] hover:text-[#2C2520] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4">
              {bookFormError && (
                <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#E8B4B4] text-[#9B2C2C] text-xs font-medium">
                  {bookFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                    Mã sách *
                  </label>
                  <input
                    type="text"
                    disabled={!!editingBook}
                    value={bookForm.id}
                    onChange={(e) => setBookForm({ ...bookForm, id: e.target.value })}
                    className="w-full px-3 py-2 bg-white disabled:bg-[#F2ECE1] border border-[#D8CEBE] rounded-lg text-xs font-mono-num text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                    Tên sách *
                  </label>
                  <input
                    type="text"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    placeholder="Nhập tên đầy đủ của quyển sách"
                    className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                    Thể loại *
                  </label>
                  <select
                    value={bookForm.categoryId}
                    onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                    Tác giả *
                  </label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="Tên tác giả"
                    className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                    Nhà xuất bản *
                  </label>
                  <select
                    value={bookForm.publisherId}
                    onChange={(e) => setBookForm({ ...bookForm, publisherId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                  >
                    {publishers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Giá nhập & Giá bán tách biệt rõ ràng */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                <div>
                  <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                    Giá nhập (VNĐ) *
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={bookForm.importPrice}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, importPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs font-mono-num text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2A4B3C] mb-1.5">
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={bookForm.sellPrice}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, sellPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#2A4B3C] rounded-lg text-xs font-mono-num font-bold text-[#2C2520] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                    Số lượng tồn *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bookForm.stock}
                    onChange={(e) => setBookForm({ ...bookForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs font-mono-num text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                    Tồn tối thiểu
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bookForm.minStock}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, minStock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs font-mono-num text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D332B] mb-1.5">
                  Mô tả nội dung sách
                </label>
                <textarea
                  rows={3}
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder="Tóm tắt nội dung hoặc ghi chú phát hành..."
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2D9C8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] bg-white hover:bg-[#EFE9DD] text-xs font-semibold text-[#4A3F36] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold cursor-pointer"
                >
                  Lưu sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT SÁCH */}
      {detailBook && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-lg w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <div>
                <span className="font-mono-num text-xs font-bold text-[#2A4B3C]">
                  {detailBook.id}
                </span>
                <h3 className="font-display text-lg font-bold text-[#2C2520]">
                  {detailBook.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailBook(null)}
                className="p-1 text-[#6E5E50] hover:text-[#2C2520] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                <div>
                  <span className="text-[#78685A] block">Giá nhập:</span>
                  <span className="font-mono-num text-sm font-bold text-[#4A3F36] mt-0.5 block">
                    {formatCurrency(detailBook.importPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-[#78685A] block">Giá bán:</span>
                  <span className="font-mono-num text-sm font-bold text-[#2A4B3C] mt-0.5 block">
                    {formatCurrency(detailBook.sellPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-[#78685A] block">Số lượng tồn kho:</span>
                  <span className="font-mono-num font-semibold text-[#2C2520] mt-0.5 block">
                    {detailBook.stock} quyển (Tối thiểu: {detailBook.minStock})
                  </span>
                </div>
                <div>
                  <span className="text-[#78685A] block">Trạng thái:</span>
                  <span className="font-bold text-[#2A4B3C] mt-0.5 block">
                    {computeBookStatus(detailBook.stock, detailBook.minStock)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-[#EFE9DD]">
                  <span className="text-[#78685A]">Thể loại:</span>
                  <span className="font-semibold text-[#2C2520]">{detailBook.categoryName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EFE9DD]">
                  <span className="text-[#78685A]">Tác giả:</span>
                  <span className="font-semibold text-[#2C2520]">{detailBook.author}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EFE9DD]">
                  <span className="text-[#78685A]">Nhà xuất bản:</span>
                  <span className="font-semibold text-[#2C2520]">{detailBook.publisherName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EFE9DD]">
                  <span className="text-[#78685A]">Tổng số lượng đã bán:</span>
                  <span className="font-mono-num font-semibold text-[#2C2520]">
                    {detailBook.soldCount} quyển
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[#78685A] block mb-1">Mô tả sách:</span>
                <p className="p-3 rounded-lg bg-[#FAF7F2] text-[#3D332B] leading-relaxed">
                  {detailBook.description || 'Chưa có mô tả chi tiết.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const b = detailBook;
                    setDetailBook(null);
                    handleOpenEditBook(b);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer"
                >
                  Chỉnh sửa sách
                </button>
                <button
                  type="button"
                  onClick={() => setDetailBook(null)}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] bg-white text-[#4A3F36] font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HỘP THOẠI XÁC NHẬN XÓA SÁCH (Đúng câu chữ yêu cầu) */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#2C2520]">
              Xác nhận xóa sách
            </h3>
            <p className="text-sm text-[#4A3F36] mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xóa sách này không?
            </p>
            <div className="mt-3 p-3 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8] text-xs">
              <div>
                Mã sách: <strong className="font-mono-num text-[#2A4B3C]">{bookToDelete.id}</strong>
              </div>
              <div className="mt-1">
                Tên sách: <strong>{bookToDelete.title}</strong>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 rounded-lg border border-[#D8CEBE] bg-white hover:bg-[#EFE9DD] text-xs font-semibold text-[#4A3F36] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBook(bookToDelete.id);
                  setBookToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#B93829] hover:bg-[#992B1E] text-white text-xs font-semibold cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA THỂ LOẠI */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                {editingCat ? 'Cập nhật thể loại' : 'Thêm thể loại sách mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                className="text-[#6E5E50] hover:text-[#2C2520]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCat} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Mã thể loại *</label>
                <input
                  type="text"
                  disabled={!!editingCat}
                  value={catForm.id}
                  onChange={(e) => setCatForm({ ...catForm, id: e.target.value })}
                  className="w-full px-3 py-2 bg-white disabled:bg-[#F2ECE1] border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Tên thể loại *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="Nhập tên thể loại"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Mô tả</label>
                <textarea
                  rows={3}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Mô tả nhóm sách thuộc thể loại này"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold"
                >
                  Lưu thể loại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* XÁC NHẬN XÓA THỂ LOẠI */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#2C2520]">Xác nhận xóa thể loại</h3>
            <p className="text-sm text-[#4A3F36] mt-2">
              Bạn có chắc chắn muốn xóa thể loại <strong>{catToDelete.name}</strong> không?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="px-4 py-2 rounded-lg border border-[#D8CEBE] text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCategory(catToDelete.id);
                  setCatToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#B93829] text-white text-xs font-semibold"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA NHÀ XUẤT BẢN */}
      {showPubModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                {editingPub ? 'Cập nhật nhà xuất bản' : 'Thêm nhà xuất bản mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPubModal(false)}
                className="text-[#6E5E50] hover:text-[#2C2520]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePub} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">
                  Mã nhà xuất bản *
                </label>
                <input
                  type="text"
                  disabled={!!editingPub}
                  value={pubForm.id}
                  onChange={(e) => setPubForm({ ...pubForm, id: e.target.value })}
                  className="w-full px-3 py-2 bg-white disabled:bg-[#F2ECE1] border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">
                  Tên nhà xuất bản *
                </label>
                <input
                  type="text"
                  required
                  value={pubForm.name}
                  onChange={(e) => setPubForm({ ...pubForm, name: e.target.value })}
                  placeholder="Nhập tên NXB"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={pubForm.address}
                  onChange={(e) => setPubForm({ ...pubForm, address: e.target.value })}
                  placeholder="Địa chỉ trụ sở"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={pubForm.phone}
                  onChange={(e) => setPubForm({ ...pubForm, phone: e.target.value })}
                  placeholder="Số điện thoại liên hệ"
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPubModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold"
                >
                  Lưu nhà xuất bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* XÁC NHẬN XÓA NHÀ XUẤT BẢN */}
      {pubToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#2C2520]">
              Xác nhận xóa nhà xuất bản
            </h3>
            <p className="text-sm text-[#4A3F36] mt-2">
              Bạn có chắc chắn muốn xóa <strong>{pubToDelete.name}</strong> không?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPubToDelete(null)}
                className="px-4 py-2 rounded-lg border border-[#D8CEBE] text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePublisher(pubToDelete.id);
                  setPubToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#B93829] text-white text-xs font-semibold"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
