import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { LoginView } from './components/LoginView';
import { Layout, MENU_ITEMS } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { BookManagementView } from './components/BookManagementView';
import { InventoryView } from './components/InventoryView';
import { ImportBookView } from './components/ImportBookView';
import { ExportBookView } from './components/ExportBookView';
import { PosView } from './components/PosView';
import { InvoiceView } from './components/InvoiceView';
import { CustomerView } from './components/CustomerView';
import { MembershipView } from './components/MembershipView';
import { UserRoleView } from './components/UserRoleView';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';
import { canAccessTab } from './data/initialData';

const MainRouter: React.FC = () => {
  const { currentUser, activeTab, setActiveTab } = useStore();

  if (!currentUser) {
    return <LoginView />;
  }

  const hasPermission = canAccessTab(currentUser.role, activeTab);
  const attemptedMenu = MENU_ITEMS.find((m) => m.id === activeTab);

  return (
    <Layout>
      {!hasPermission ? (
        <div className="bg-white border border-[#E2D9C8] rounded-2xl p-8 md:p-12 max-w-xl mx-auto my-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FDF2F2] border border-[#E8B4B4] text-[#9B2C2C] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-[#2C2520]">
            Bạn không có quyền truy cập chức năng này.
          </h2>
          <p className="text-sm text-[#54483E] mt-2 leading-relaxed">
            Tài khoản <strong>{currentUser.fullName}</strong> với vai trò{' '}
            <strong className="text-[#2A4B3C]">{currentUser.role}</strong> không được cấp quyền truy
            cập vào mục <strong>{attemptedMenu?.label || activeTab}</strong>.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setActiveTab('tong-quan')}
              className="px-5 py-2.5 rounded-lg bg-[#2A4B3C] hover:bg-[#1F382D] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay về trang Tổng quan</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'tong-quan' && <DashboardView />}
          {activeTab === 'quan-ly-sach' && <BookManagementView />}
          {activeTab === 'quan-ly-kho' && <InventoryView />}
          {activeTab === 'nhap-sach' && <ImportBookView />}
          {activeTab === 'xuat-sach' && <ExportBookView />}
          {activeTab === 'ban-hang' && <PosView />}
          {activeTab === 'hoa-don' && <InvoiceView />}
          {activeTab === 'khach-hang' && <CustomerView />}
          {activeTab === 'thanh-vien' && <MembershipView />}
          {activeTab === 'nguoi-dung' && <UserRoleView />}
          {activeTab === 'bao-cao' && <ReportView />}
          {activeTab === 'cai-dat' && <SettingsView />}
        </>
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}
