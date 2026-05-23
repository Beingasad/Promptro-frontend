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
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/32 text-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-3xl transition-transform active:scale-95"
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
