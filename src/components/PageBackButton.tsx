import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PageBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Always prefer proper history traversal — this correctly handles
    // Legal drawer → privacy/terms → back (goes back to wherever user was)
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }
    // Fallback for direct-landed pages (no history)
    if (location.pathname.startsWith('/blog/')) {
      navigate('/blog');
    } else if (location.pathname === '/privacy-policy' || location.pathname === '/terms') {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/78 text-[#171421] shadow-[0_14px_34px_rgba(72,56,118,0.12)] backdrop-blur-2xl transition-transform active:scale-95 dark:bg-[#171421]/78 dark:text-[#f7f2ff] dark:shadow-[0_16px_38px_rgba(0,0,0,0.28)]"
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
