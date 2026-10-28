import React, { useState } from 'react';
import {
  Edit3,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  X,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { UserAccount, UserRole } from '../types';
import { getInitials } from './Layout';

const ALL_ROLES: UserRole[] = [
  'Quản trị viên',
  'Quản lý nhà sách',
  'Nhân viên bán hàng',
  'Nhân viên kho',
];

const ALL_PERMISSIONS_LIST = [
  'Tổng quan hệ thống',
  'Thêm / Sửa / Xóa sách',
  'Quản lý thể loại & NXB',
  'Tra cứu danh mục sách',
  'Quản lý kho & Kiểm kê',
  'Lập phiếu nhập sách',
  'Lập phiếu xuất sách',
  'Bán hàng tại quầy (POS)',
  'Quản lý hóa đơn',
  'Quản lý khách hàng & Thành viên',
  'Quản lý tài khoản & Phân quyền',
  'Xem báo cáo & Doanh thu',
  'Cài đặt hệ thống',
];

export const UserRoleView: React.FC = () => {
  const {
    users,
    rolePermissions,
    updateUser,
    toggleUserActive,
    changeUserPassword,
    updateRolePermissions,
  } = useStore();

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [form, setForm] = useState({
    id: '',
    fullName: '',
    username: '',
    role: 'Quản trị viên' as UserRole,
    active: true,
  });

  // Modal Đổi mật khẩu (dành cho Quản trị viên)
  const [passModalUser, setPassModalUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passError, setPassError] = useState('');

  // Vai trò đang chỉnh sửa phân quyền
  const [selectedRoleForPerm, setSelectedRoleForPerm] = useState<UserRole>('Quản trị viên');

  const handleOpenEdit = (u: UserAccount) => {
    setEditingUser(u);
    setForm({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      role: u.role,
      active: u.active,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !form.username.trim()) return;
    updateUser({
      ...editingUser,
      username: form.username.trim(),
      role: form.role,
      active: form.active,
    });
    setShowUserModal(false);
  };

  const handleTogglePerm = (perm: string) => {
    const currentPerms = rolePermissions[selectedRoleForPerm] || [];
    const exists = currentPerms.includes(perm);
    const updated = exists
      ? currentPerms.filter((p) => p !== perm)
      : [...currentPerms, perm];
    updateRolePermissions(selectedRoleForPerm, updated);
  };

  const handleOpenResetPass = (u: UserAccount) => {
    setPassModalUser(u);
    setNewPassword('');
    setConfirmNewPassword('');
    setPassError('');
    setShowNewPass(false);
    setShowConfirmPass(false);
  };

  const handleSaveResetPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passModalUser) return;
    setPassError('');
    if (newPassword.length < 6) {
      setPassError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError('Nhập lại mật khẩu mới không khớp.');
      return;
    }
    changeUserPassword(passModalUser.id, newPassword);
    setPassModalUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Bảng danh sách 5 tài khoản người dùng chính thức */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-[#2C2520]">
              Danh sách tài khoản người dùng & Phân quyền ({users.length} tài khoản)
            </h2>
            <p className="text-xs text-[#6E5E50]">
              Quản lý 5 tài khoản thành viên chính thức: Sửa tài khoản, Đổi vai trò, Khóa/mở khóa và Đổi mật khẩu
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#EFE9DD] text-[#2A4B3C]">
            Quyền Quản trị viên
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                <th className="py-3 px-4">Mã người dùng</th>
                <th className="py-3 px-4">Họ tên</th>
                <th className="py-3 px-4">Tên đăng nhập</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày tạo</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DD] text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF7F2]">
                  <td className="py-3.5 px-4 font-mono-num font-bold text-[#2A4B3C]">{u.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#2A4B3C] text-white font-display font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(u.fullName)}
                      </div>
                      <span className="font-bold text-[#2C2520]">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono-num text-[#54483E]">{u.username}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        updateUser({ ...u, role: e.target.value as UserRole })
                      }
                      className="px-2.5 py-1 rounded-md border border-[#D8CEBE] bg-white font-semibold text-[#2A4B3C] focus:outline-none focus:border-[#2A4B3C] cursor-pointer"
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 px-4 font-semibold">
                    <span className={u.active ? 'text-[#2A4B3C]' : 'text-[#B93829]'}>
                      {u.active ? 'Đang hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono-num text-[#6E5E50]">{u.createdAt}</td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="px-2.5 py-1 rounded-md bg-[#EBF3EE] hover:bg-[#D5E6DC] text-[#2A4B3C] font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa tài khoản</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenResetPass(u)}
                        className="px-2.5 py-1 rounded-md bg-[#EFE9DD] hover:bg-[#E2D8C5] text-[#2C2520] font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Đổi mật khẩu</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleUserActive(u.id)}
                        className="px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#D8CEBE] hover:bg-[#EFE9DD] text-[#4A3F36] font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        {u.active ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-[#B86B14]" />
                            <span>Khóa</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-[#2A4B3C]" />
                            <span>Mở khóa</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ma trận Phân quyền theo 4 Vai trò */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2A4B3C]" />
            <div>
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                Thiết lập phân quyền chi tiết theo 4 vai trò
              </h3>
              <p className="text-xs text-[#6E5E50]">
                Chọn vai trò để xem và điều chỉnh quyền hạn truy cập chức năng tương ứng
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EFE9DD] rounded-lg border border-[#D8CEBE]">
            {ALL_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRoleForPerm(role)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedRoleForPerm === role
                    ? 'bg-[#2A4B3C] text-white'
                    : 'text-[#54483E] hover:text-[#2C2520]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_PERMISSIONS_LIST.map((perm) => {
              const checked = (rolePermissions[selectedRoleForPerm] || []).includes(perm);
              return (
                <button
                  key={perm}
                  type="button"
                  onClick={() => handleTogglePerm(perm)}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    checked
                      ? 'bg-[#F1F7F4] border-[#8AB39E] text-[#1D3B2D]'
                      : 'bg-[#FAF7F2] border-[#E2D9C8] text-[#6E5E50]'
                  }`}
                >
                  <span className="text-xs font-semibold">{perm}</span>
                  {checked ? (
                    <CheckSquare className="w-4 h-4 text-[#2A4B3C] shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#9A8B7C] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Sửa Tài khoản & Đổi vai trò */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                Sửa tài khoản & Phân quyền ({editingUser.id})
              </h3>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="text-[#6E5E50] hover:text-[#2C2520]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Mã người dùng</label>
                <input
                  type="text"
                  disabled
                  value={form.id}
                  className="w-full px-3 py-2 bg-[#F2ECE1] border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Họ và tên</label>
                <input
                  type="text"
                  disabled
                  value={form.fullName}
                  className="w-full px-3 py-2 bg-[#F2ECE1] border border-[#D8CEBE] rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">Tên đăng nhập *</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">
                  Vai trò phân quyền *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg font-semibold text-[#2A4B3C]"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đổi mật khẩu tài khoản (Không hiển thị mật khẩu cũ) */}
      {passModalUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-sm w-full overflow-hidden shadow-xl text-xs">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#2C2520]">
                Đổi mật khẩu tài khoản
              </h3>
              <button
                type="button"
                onClick={() => setPassModalUser(null)}
                className="text-[#6E5E50] hover:text-[#2C2520]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPass} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                <div className="font-bold text-[#2C2520]">{passModalUser.fullName}</div>
                <div className="text-[#6E5E50] mt-0.5">
                  Tên đăng nhập: <strong className="font-mono-num">{passModalUser.username}</strong>
                </div>
              </div>

              {passError && (
                <div className="p-2.5 rounded-lg bg-[#FDF2F2] border border-[#E8B4B4] text-[#9B2C2C] font-medium">
                  {passError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">
                  Mật khẩu mới (tối thiểu 6 ký tự) *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full pl-3 pr-9 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3D332B] mb-1">
                  Nhập lại mật khẩu mới *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-3 pr-9 py-2 bg-white border border-[#D8CEBE] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPassModalUser(null)}
                  className="px-4 py-2 rounded-lg border border-[#D8CEBE] font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
