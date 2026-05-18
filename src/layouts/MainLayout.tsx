import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import BottomNav from '../components/BottomNav';
import SearchPill from '../components/SearchPill';
import PageBackButton from '../components/PageBackButton';

export default function MainLayout() {
  const location = useLocation();
  const isPromptDetail = location.pathname.startsWith('/prompt/');
  const isHome = location.pathname === '/';
  const isAuth = location.pathname === '/auth';
  const showPageSearch = location.pathname === '/explore' || location.pathname === '/saved';
  const showPageBack = !isHome && !isPromptDetail && !isAuth;
  const pagePillLabel = location.pathname === '/categories'
    ? 'Prompt worlds'
    : location.pathname === '/explore'
      ? 'Explore prompts'
      : location.pathname === '/saved'
        ? 'Saved prompts'
        : '';

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_4%,rgba(139,92,246,0.18),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(255,106,61,0.16),transparent_28%),radial-gradient(circle_at_48%_34%,rgba(217,75,203,0.1),transparent_30%),linear-gradient(180deg,#ffffff_0%,#faf8ff_38%,#f6f3fb_100%)] dark:bg-[radial-gradient(circle_at_14%_4%,rgba(139,92,246,0.22),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(255,106,61,0.16),transparent_30%),radial-gradient(circle_at_48%_34%,rgba(217,75,203,0.12),transparent_32%),linear-gradient(180deg,#0d0b14_0%,#12101b_46%,#0a0910_100%)]"></div>
        <div className="absolute -left-28 top-32 h-72 w-72 rounded-full bg-[#8b5cf6]/10 blur-[70px] dark:bg-[#8b5cf6]/16"></div>
        <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-[#ff6a3d]/10 blur-[76px] dark:bg-[#ff6a3d]/14"></div>
        <div className="absolute left-1/3 top-[45%] h-64 w-64 rounded-full bg-[#d94bcb]/8 blur-[82px] dark:bg-[#d94bcb]/12"></div>
      </div>

      {isHome && <TopNavbar />}
      
      {showPageSearch || showPageBack ? (
        <div className="fixed top-0 w-full z-[100] px-4 py-3 md:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[118px] bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.18),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(255,106,61,0.16),transparent_42%),linear-gradient(180deg,#f8f7fc_0%,#f8f7fc_15%,rgba(248,247,252,0.8)_35%,rgba(248,247,252,0.3)_60%,rgba(248,247,252,0)_100%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_15%,rgba(0,0,0,0.8)_35%,rgba(0,0,0,0.3)_60%,rgba(0,0,0,0.05)_80%,transparent_100%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.22),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(255,106,61,0.15),transparent_42%),linear-gradient(180deg,#0d0b14_0%,#0d0b14_15%,rgba(13,11,20,0.8)_35%,rgba(13,11,20,0.3)_60%,rgba(13,11,20,0)_100%)]" />
          <div className="relative z-10 mx-auto flex max-w-[1600px] items-center gap-3">
            {showPageBack && <PageBackButton />}
            {showPageSearch ? (
              <SearchPill />
            ) : pagePillLabel ? (
              <span className="rounded-full border border-white/80 bg-white/72 px-4 py-2 text-xs font-bold uppercase tracking-normal text-primary shadow-[0_14px_34px_rgba(72,56,118,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#171421]/78 dark:text-primary dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_38px_rgba(0,0,0,0.28)]">
                {pagePillLabel}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <main className={`flex-grow relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 ${
        isAuth ? 'flex min-h-svh items-center py-3 sm:py-4' : isPromptDetail ? 'pt-5 pb-8' : isHome ? 'pt-28 pb-6 md:pt-24 md:pb-10' : 'pt-28 pb-6 md:pt-24 md:pb-10'
      }`}>
        <Outlet />
      </main>

      {!isAuth && (
        <footer className="relative z-10 pb-24 text-center text-[10px] font-medium tracking-normal text-[#8d86a0]/70 md:pb-3">
          © 2026 Promptro. All rights reserved.
        </footer>
      )}

      {!isPromptDetail && !isAuth && <BottomNav />}
    </div>
  );
}
