import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, FileText, PackagePlus, PackageMinus, Eye, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { UserAccount, UserRole } from '../types';
import { ROLE_DEFAULT_PERMISSIONS, formatCurrency } from '../data/initialData';
import { getInitials } from './Layout';

export const MembershipView: React.FC = () => {
  const { users, invoices, importSlips, exportSlips, stockChecks, rolePermissions } = useStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [selectedMember, setSelectedMember] = useState<UserAccount | null>(null);

  // Lấy trực tiếp từ nguồn dữ liệu users dùng chung (đúng 5 thành viên)
  const filteredMembers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getMemberActivity = (fullName: string) => {
    const memberInvoices = invoices.filter((inv) => inv.staffName === fullName);
    const memberImports = importSlips.filter((imp) => imp.staffName === fullName);
    const memberExports = exportSlips.filter((exp) => exp.staffName === fullName);
    const memberChecks = stockChecks.filter((sc) => sc.staffName === fullName);
    const totalSalesAmount = memberInvoices
      .filter((i) => i.status === 'Đã thanh toán')
      .reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      invoiceCount: memberInvoices.length,
      importCount: memberImports.length,
      exportCount: memberExports.length,
      checkCount: memberChecks.length,
      totalSalesAmount,
      memberInvoices,
      memberImports,
      memberExports,
    };
  };

  return (
    <div className="space-y-6">
      {/* Thẻ tổng quan 5 thành viên chính thức của hệ thống */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {users.map((member) => {
          const isAdmin = member.role === 'Quản trị viên';
          const activity = getMemberActivity(member.fullName);
          return (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isAdmin
                  ? 'bg-[#233D30] border-[#1B3025] text-white'
                  : 'bg-white border-[#E2D9C8] text-[#2C2520] hover:border-[#2A4B3C]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl font-display font-bold text-sm flex items-center justify-center shrink-0 ${
                      isAdmin
                        ? 'bg-[#355947] text-white border border-[#4D7A63]'
                        : 'bg-[#2A4B3C] text-white'
                    }`}
                  >
                    {getInitials(member.fullName)}
                  </div>
                  <span
                    className={`font-mono-num text-xs font-semibold ${
                      isAdmin ? 'text-[#B7C9BE]' : 'text-[#78685A]'
                    }`}
                  >
                    {member.id}
                  </span>
                </div>

                <h3 className="font-bold text-xs tracking-wide leading-snug">
                  {member.fullName}
                </h3>
                <p
                  className={`text-[11px] font-semibold mt-1 ${
                    isAdmin ? 'text-[#B5D6C5]' : 'text-[#2A4B3C]'
                  }`}
                >
                  {member.role}
                </p>
              </div>

              <div
                className={`mt-4 pt-3 border-t text-[11px] flex items-center justify-between ${
                  isAdmin
                    ? 'border-[#375847] text-[#CFE0D6]'
                    : 'border-[#EFE9DD] text-[#6E5E50]'
                }`}
              >
                <span>TK: {member.username}</span>
                <span>
                  {activity.invoiceCount + activity.importCount + activity.exportCount} phiếu
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bảng danh sách 5 thành viên */}
      <div className="bg-white border border-[#E2D9C8] rounded-xl overflow-hidden">
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E2D9C8] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-[#2C2520]">
              Danh sách thành viên hệ thống ({users.length} thành viên)
            </h2>
            <p className="text-xs text-[#6E5E50]">
              Dữ liệu đồng bộ trực tiếp với tài khoản người dùng, phân quyền và chứng từ giao dịch
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm họ tên, tên đăng nhập..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520] focus:outline-none focus:border-[#2A4B3C]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
              className="px-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-xs text-[#2C2520]"
            >
              <option value="all">Tất cả vai trò (4 vai trò)</option>
              <option value="Quản trị viên">Quản trị viên</option>
              <option value="Quản lý nhà sách">Quản lý nhà sách</option>
              <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
              <option value="Nhân viên kho">Nhân viên kho</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4EFE6] border-b border-[#E2D9C8] text-[11px] font-bold text-[#5C4E42]">
                <th className="py-3 px-4">Mã TV</th>
                <th className="py-3 px-4">Họ tên</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Tên đăng nhập</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày tạo</th>
                <th className="py-3 px-4 text-right">Hoạt động nghiệp vụ</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DD] text-xs">
              {filteredMembers.map((member) => {
                const activity = getMemberActivity(member.fullName);
                return (
                  <tr key={member.id} className="hover:bg-[#FAF7F2]">
                    <td className="py-3.5 px-4 font-mono-num font-bold text-[#2A4B3C]">
                      {member.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#2A4B3C] text-white font-display font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(member.fullName)}
                        </div>
                        <span className="font-bold text-[#2C2520]">{member.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2A4B3C]">{member.role}</td>
                    <td className="py-3.5 px-4 font-mono-num text-[#54483E]">{member.username}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold inline-flex items-center gap-1 ${
                          member.active ? 'text-[#2A4B3C]' : 'text-[#B93829]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{member.active ? 'Đang hoạt động' : 'Đã khóa'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-[#6E5E50]">
                      {member.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-[#54483E]">
                      HĐ: <strong>{activity.invoiceCount}</strong> · Nhập:{' '}
                      <strong>{activity.importCount}</strong> · Xuất:{' '}
                      <strong>{activity.exportCount}</strong>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        className="px-3 py-1.5 rounded-lg bg-[#EFE9DD] hover:bg-[#E2D8C5] text-[#2C2520] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#2A4B3C]" />
                        <span>Xem hồ sơ</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem chi tiết hồ sơ thành viên & Lịch sử thực hiện nghiệp vụ */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8CEBE] rounded-2xl max-w-xl w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-[#F7F3EB] border-b border-[#E2D9C8] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2A4B3C] text-white font-display font-bold text-sm flex items-center justify-center">
                  {getInitials(selectedMember.fullName)}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#2C2520]">
                    {selectedMember.fullName}
                  </h3>
                  <p className="text-xs text-[#2A4B3C] font-semibold">
                    {selectedMember.role} · Mã: {selectedMember.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="text-[#6E5E50] hover:text-[#2C2520] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const act = getMemberActivity(selectedMember.fullName);
              const perms =
                rolePermissions[selectedMember.role] ||
                ROLE_DEFAULT_PERMISSIONS[selectedMember.role] ||
                [];
              return (
                <div className="p-6 space-y-5 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                      <span className="text-[#78685A] block">Tên đăng nhập</span>
                      <strong className="font-mono-num text-sm text-[#2C2520] mt-0.5 block">
                        {selectedMember.username}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                      <span className="text-[#78685A] block">Ngày tạo</span>
                      <strong className="font-mono-num text-sm text-[#2C2520] mt-0.5 block">
                        {selectedMember.createdAt}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                      <span className="text-[#78685A] block">Trạng thái</span>
                      <strong className="text-sm text-[#2A4B3C] mt-0.5 block">
                        {selectedMember.active ? 'Hoạt động' : 'Đã khóa'}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]">
                      <span className="text-[#78685A] block">Doanh số HĐ</span>
                      <strong className="font-mono-num text-sm text-[#2A4B3C] mt-0.5 block">
                        {formatCurrency(act.totalSalesAmount)}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-[#3D332B] mb-2">
                      <ShieldCheck className="w-4 h-4 text-[#2A4B3C]" />
                      <span>Quyền hạn nghiệp vụ theo vai trò ({selectedMember.role}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perms.map((p) => (
                        <span
                          key={p}
                          className="px-2.5 py-1 rounded-md bg-[#F1F7F4] border border-[#C5DDD0] text-[#1D3B2D] font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#EFE9DD]">
                    <div className="p-3 rounded-lg bg-[#FAF7F2] flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#2A4B3C]" />
                      <div>
                        <div className="text-[#6E5E50]">Hóa đơn đã lập</div>
                        <div className="font-mono-num font-bold text-sm">
                          {act.invoiceCount} đơn
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF7F2] flex items-center gap-2.5">
                      <PackagePlus className="w-4 h-4 text-[#2A4B3C]" />
                      <div>
                        <div className="text-[#6E5E50]">Phiếu nhập kho</div>
                        <div className="font-mono-num font-bold text-sm">
                          {act.importCount} phiếu
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF7F2] flex items-center gap-2.5">
                      <PackageMinus className="w-4 h-4 text-[#8C2D2D]" />
                      <div>
                        <div className="text-[#6E5E50]">Phiếu xuất kho</div>
                        <div className="font-mono-num font-bold text-sm">
                          {act.exportCount} phiếu
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(null)}
                      className="px-4 py-2 rounded-lg bg-[#2A4B3C] text-white font-semibold cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
