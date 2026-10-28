import React, { useState } from 'react';
import {
  BookOpen,
  Lock,
  User,
  CheckSquare,
  Square,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const LoginView: React.FC = () => {
  const { login, users } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }
    const res = login(username, password, remember);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB] text-[#2C2520] flex flex-col justify-center items-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white border border-[#E2D9C8] rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Cột trái: Thông tin hệ thống & Danh sách Thành viên hệ thống (Chỉ hiển thị thông tin, không click) */}
        <div className="lg:col-span-6 bg-[#233D30] text-[#F7F3EB] p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[#355947] border border-[#49735E] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#EAE2D3]" />
              </div>
              <div>
                <p className="text-xs tracking-wider text-[#B7C9BE] font-medium">
                  BÀI TẬP LỚN KỸ THUẬT PHẦN MỀM
                </p>
                <h1 className="font-display text-xl font-bold tracking-tight text-white">
                  HỆ THỐNG QUẢN LÝ NHÀ SÁCH
                </h1>
              </div>
            </div>

            <p className="text-sm text-[#D5E0D9] leading-relaxed mb-8">
              Nền tảng quản trị nghiệp vụ nhà sách đồng bộ: Quản lý danh mục đầu sách, kiểm soát tồn
              kho, lập phiếu nhập – xuất, bán hàng POS tại quầy, quản lý khách hàng, thành viên và
              báo cáo thống kê doanh thu trực quan.
            </p>

            <div className="border-t border-[#375847] pt-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-[#A7C4B5]" />
                <span className="text-xs font-semibold tracking-wider text-[#CFE0D6]">
                  THÀNH VIÊN HỆ THỐNG
                </span>
              </div>

              <div className="space-y-2.5">
                {users.map((member, index) => (
                  <div
                    key={member.id}
                    className="w-full px-3.5 py-2.5 rounded-lg border bg-[#1D3328]/70 border-[#2F4E3E] text-[#DCE6DF] flex items-center justify-between select-text"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono-num text-xs text-[#9BB8A8]">
                        0{index + 1}.
                      </span>
                      <span className="text-sm font-semibold tracking-wide truncate">
                        {member.fullName}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#B5CBBF] shrink-0 ml-2">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#375847] flex items-center justify-between text-xs text-[#9AB3A4]">
            <span>Phiên bản 2.4 · Tiếng Việt</span>
            <span>Xác thực bảo mật theo vai trò</span>
          </div>
        </div>

        {/* Cột phải: Biểu mẫu Đăng nhập */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center bg-[#FCF9F4]">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <p className="text-xs font-semibold text-[#2A4B3C] mb-1">
                XÁC THỰC NGƯỜI DÙNG
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#2C2520]">
                Đăng nhập hệ thống
              </h2>
              <p className="text-sm text-[#706256] mt-1.5">
                Vui lòng nhập tên đăng nhập và mật khẩu cá nhân của bạn để truy cập hệ thống.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-[#FDF2F2] border border-[#E8B4B4] text-[#9B2C2C] text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-sm font-semibold text-[#3D332B] mb-2">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8CEBE] rounded-lg text-sm text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3D332B] mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D8CEBE] rounded-lg text-sm text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#2C2520] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setRemember(!remember)}
                  className="flex items-center gap-2 text-sm text-[#4F4339] hover:text-[#2C2520] cursor-pointer"
                >
                  {remember ? (
                    <CheckSquare className="w-4 h-4 text-[#2A4B3C]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8C7A6B]" />
                  )}
                  <span>Ghi nhớ đăng nhập</span>
                </button>
                <span className="text-xs text-[#7D6E61]">
                  Phân quyền theo vai trò
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 bg-[#2A4B3C] hover:bg-[#1F382D] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#E6DEC8]">
              <p className="text-xs text-[#706256] leading-relaxed">
                <strong className="text-[#3D332B]">Quy định bảo mật:</strong> Mỗi thành viên đăng
                nhập bằng tài khoản và mật khẩu riêng. Khi cần chuyển sang tài khoản khác, vui lòng
                đăng xuất khỏi phiên làm việc hiện tại.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
