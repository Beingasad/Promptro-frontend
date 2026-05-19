import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageBackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/78 text-[#171421] shadow-[0_14px_34px_rgba(72,56,118,0.12)] backdrop-blur-2xl transition-transform active:scale-95 dark:border-white/10 dark:bg-[#171421]/78 dark:text-[#f7f2ff] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_38px_rgba(0,0,0,0.28)]"
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
