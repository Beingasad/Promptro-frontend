import { motion } from 'framer-motion';
import { Mail, Instagram, Github, Briefcase, Target, Heart } from 'lucide-react';
import SEOMeta from '../components/common/SEOMeta';
import { Link } from 'react-router-dom';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
});

export default function Founder() {
  const founderPersonSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Mohammad Asad Ansari',
    jobTitle: 'Founder & Developer',
    description: 'Founder and Developer of Promptro.in, making high-quality AI prompts accessible to everyone.',
    url: 'https://promptro.in/founder',
    worksFor: {
      '@type': 'Organization',
      name: 'Promptro',
      url: 'https://promptro.in',
    },
    sameAs: [
      'https://instagram.com/beingxasad',
      'https://github.com/Beingasad',
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto px-3 py-6 md:py-10 flex flex-col gap-10 pb-10"
    >
      <SEOMeta
        title="Mohammad Asad Ansari | Founder & Developer of Promptro"
        description="Meet Mohammad Asad Ansari, the Founder and Developer of Promptro.in. Learn about his journey, skills, and vision for making AI creativity accessible."
        keywords="Mohammad Asad Ansari, Founder of Promptro, AI developer, Promptro creator, Promptro developer"
        canonical="https://promptro.in/founder"
        ogType="profile"
        author="Mohammad Asad Ansari"
        breadcrumbs={[
          { name: 'Home', url: 'https://promptro.in' },
          { name: 'About', url: 'https://promptro.in/about' },
          { name: 'Founder', url: 'https://promptro.in/founder' },
        ]}
      />
      {/* Inject specific Person JSON-LD for the Founder Page */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(founderPersonSchema) }} />

      {/* Hero Section */}
      <motion.section {...fadeUp(0)} className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white/5 dark:bg-[#12101b]/50 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[2rem]">
        <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 rounded-full border-4 border-primary/20 p-1 relative">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#7437ff] to-[#dd4bd2] flex items-center justify-center overflow-hidden">
            <img 
              src="/brand/founder.jpg" 
              alt="Mohammad Asad Ansari - Founder of Promptro" 
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          {/* Badge */}
          <div className="absolute bottom-2 right-2 bg-black/60 dark:bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white">Founder</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left flex flex-col gap-4 justify-center">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Mohammad Asad Ansari
            </h1>
            <p className="text-lg md:text-xl font-medium text-primary mt-2">
              Founder & Developer, Promptro.in
            </p>
          </div>
          
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0">
            Passionate about making high-quality AI prompts accessible to everyone. Bridging the gap between human creativity and artificial intelligence.
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
            <a href="mailto:support.promptro@gmail.com" className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-primary/20 hover:text-primary transition-colors border border-white/10">
              <Mail className="w-5 h-5" />
            </a>
            <a href="https://instagram.com/beingxasad" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-primary/20 hover:text-primary transition-colors border border-white/10">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://github.com/Beingasad" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-primary/20 hover:text-primary transition-colors border border-white/10">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </motion.section>

      {/* The Promptro Journey */}
      <motion.section {...fadeUp(0.1)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 dark:bg-[#12101b]/50 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[1.5rem] flex flex-col gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-black/20 border border-white/20 flex items-center justify-center mb-4 p-2.5 shadow-[0_8px_16px_rgba(0,0,0,0.1)]">
            <img src="/brand/logo.png" alt="Promptro" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why Promptro?</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Promptro was founded and developed in 2026 with a clear vision: to make high-quality AI prompts accessible to everyone. 
            The goal of Promptro is to help creators generate better AI images, videos and content using professionally curated prompts.
          </p>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            I noticed that many creators struggle to get the exact output they want from AI tools. 
            Promptro bridges this gap by providing a carefully curated library of tested, high-quality prompts.
          </p>
        </div>

        <div className="bg-white/5 dark:bg-[#12101b]/50 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[1.5rem] flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center text-white mb-2 shadow-lg shadow-orange-500/20">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mission & Vision</h2>
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Mission</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">To empower creators worldwide by providing free access to premium AI prompts, accelerating the creative process.</p>
            </div>
            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Vision</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">To become the ultimate hub for AI inspiration, where anyone can master AI generation tools through community knowledge and high-quality resources.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQs */}
      <motion.section {...fadeUp(0.3)} className="bg-white/5 dark:bg-[#12101b]/50 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[1.5rem]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Who built Promptro?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Promptro was exclusively designed and developed from scratch by Mohammad Asad Ansari.</p>
          </div>
          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">When was Promptro founded?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">The platform was officially founded and launched in 2026.</p>
          </div>
          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">How can I contact the founder?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">You can reach out via the <Link to="/contact" className="text-primary hover:underline">Contact</Link> page, or directly through my social links above.</p>
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
}
