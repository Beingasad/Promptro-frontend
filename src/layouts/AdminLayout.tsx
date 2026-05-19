import { ReactNode, Suspense, useState } from 'react';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { AdminNavbar } from '../components/admin/AdminNavbar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

interface AdminLayoutProps {
  children: (activeTab: AdminTab, setActiveTab: (tab: AdminTab) => void) => ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  return (
    <div className="h-screen overflow-hidden bg-[#f8f7fc] dark:bg-[#0d0b14] text-[#171421] dark:text-[#f7f2ff] flex relative">
      {/* Dim Overlay Backdrop for Mobile when Sidebar is Open */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] lg:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          // Auto-close sidebar on mobile after choosing a tab
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto px-4 sm:px-8 pt-2 sm:pt-6 pb-6 z-10">
        <div className="max-w-[1600px] mx-auto">
          <AdminNavbar 
            isSidebarOpen={isSidebarOpen} 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            activeTab={activeTab}
          />
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
