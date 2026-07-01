import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import SEOMeta from '../components/common/SEOMeta';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <SEOMeta
        title="404 Page Not Found | Promptro"
        description="The page you are looking for does not exist on Promptro."
        robots="noindex, nofollow"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 text-center modal-glass shadow-2xl border border-white/40 dark:border-white/5 bg-white/45 dark:bg-[#14111f]/45 backdrop-blur-2xl"
      >
        {/* Animated 404 number */}
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent drop-shadow-sm select-none">
          404
        </h1>
        
        {/* Error Details */}
        <h2 className="mt-6 text-xl md:text-2xl font-black text-[#171421] dark:text-white uppercase tracking-wider">
          Page Not Found
        </h2>
        
        <p className="mt-3 text-sm md:text-base font-semibold leading-relaxed text-[#756d8d] dark:text-[#afa6c8] max-w-md mx-auto">
          The page you requested might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 rounded-full bg-gradient-to-r from-primary to-[#ff6a3d] text-white px-7 text-sm font-bold shadow-[0_12px_28px_rgba(109,77,236,0.26)] hover:scale-[1.03] active:scale-[0.98] transition-transform cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 rounded-full border border-[#cfc7dd] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:scale-[1.03] active:scale-[0.98] transition-transform cursor-pointer px-7"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
