import { ReactNode, Suspense, useState } from 'react';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { AdminNavbar } from '../components/admin/AdminNavbar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

interface AdminLayoutProps {
  children: (activeTab: AdminTab, setActiveTab: (tab: AdminTab) => void) => ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('Dashboard');

  return (
    <div className="h-screen overflow-hidden bg-[#f8f7fc] dark:bg-[#0d0b14] text-[#171421] dark:text-[#f7f2ff] flex">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 h-full overflow-y-auto pl-8 pr-8 py-6">
        <div className="max-w-[1600px] mx-auto">
          <AdminNavbar />
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {children(activeTab, setActiveTab)}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>

      {/* Decorative Gradients */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full pointer-events-none z-0"></div>
    </div>
  );
}
