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
      className="pill-glass flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#171421] transition-transform active:scale-95 dark:text-[#f7f2ff]"
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
