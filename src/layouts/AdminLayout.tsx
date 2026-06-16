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
    <div className="h-screen overflow-hidden text-[#171421] dark:text-[#f7f2ff] flex relative">
      {/* Background Gradient & Drifting Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_4%,rgba(139,92,246,0.18),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(255,106,61,0.16),transparent_28%),radial-gradient(circle_at_48%_34%,rgba(217,75,203,0.1),transparent_30%),linear-gradient(180deg,#ffffff_0%,#faf8ff_38%,#f6f3fb_100%)] dark:bg-[radial-gradient(circle_at_14%_4%,rgba(139,92,246,0.22),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(255,106,61,0.16),transparent_30%),radial-gradient(circle_at_48%_34%,rgba(217,75,203,0.12),transparent_32%),linear-gradient(180deg,#0d0b14_0%,#12101b_46%,#0a0910_100%)]"></div>
        <div className="absolute -left-28 top-32 h-72 w-72 rounded-full bg-[#8b5cf6]/10 blur-[70px] dark:bg-[#8b5cf6]/16"></div>
        <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-[#ff6a3d]/10 blur-[76px] dark:bg-[#ff6a3d]/14"></div>
        <div className="absolute left-1/3 top-[45%] h-64 w-64 rounded-full bg-[#d94bcb]/8 blur-[82px] dark:bg-[#d94bcb]/12"></div>
        {/* Premium Drifting Background Orbs for Dynamic Glass Refraction - Optimized: Hidden on Mobile to prevent GPU lag */}
        <div className="hidden md:block absolute left-[8%] top-[18%] h-96 w-96 rounded-full bg-gradient-to-tr from-[#8b5cf6]/12 to-[#d94bcb]/8 blur-[80px] dark:from-[#8b5cf6]/18 dark:to-[#d94bcb]/12 animate-drift-blob-1 pointer-events-none" />
        <div className="hidden md:block absolute right-[10%] top-[42%] h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-[#ff6a3d]/10 to-[#8b5cf6]/10 blur-[90px] dark:from-[#ff6a3d]/14 dark:to-[#8b5cf6]/14 animate-drift-blob-2 pointer-events-none" />
      </div>

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
    </div>
  );
}
