import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import SEOMeta from '../components/common/SEOMeta';
import { termsSections as sections } from '../data/legalData';

const LAST_UPDATED = 'June 3, 2026';
const EFFECTIVE_DATE = 'June 3, 2026';

export default function TermsOfService() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto px-2 py-6 md:py-10 flex flex-col gap-8 pb-24"
    >
      <SEOMeta
        title="Terms of Service | Promptro"
        description="Read Promptro's Terms of Service to understand the rules, rights and responsibilities for using the Promptro AI prompt platform."
        canonical="https://promptro.in/terms"
        robots="index, follow"
        breadcrumbs={[
          { name: 'Home', url: 'https://promptro.in' },
          { name: 'Terms of Service', url: 'https://promptro.in/terms' },
        ]}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-3"
      >
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Legal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
          Terms of Service
        </h1>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-[#756d8d] dark:text-[#afa6c8]">
          <span><strong>Effective:</strong> {EFFECTIVE_DATE}</span>
          <span><strong>Last Updated:</strong> {LAST_UPDATED}</span>
        </div>
        <p className="text-[15px] font-medium text-[#4a445f] dark:text-[#c4bed6] leading-relaxed">
          Please read these Terms of Service carefully before using Promptro. These terms govern your access to and use of <a href="https://promptro.in" className="text-primary font-semibold hover:underline">promptro.in</a>.
        </p>
      </motion.header>

      {/* Table of Contents */}
      <motion.nav
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[1.5rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-5 glass-shine hover-glass-glow"
        aria-label="Table of contents"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#756d8d] dark:text-[#afa6c8] mb-3">Contents</p>
        <ol className="space-y-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sm font-medium text-[#4a445f] dark:text-[#c4bed6] hover:text-primary transition-colors"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </motion.nav>

      {/* Content Sections */}
      <div className="flex flex-col gap-8">
        {sections.map((s, i) => (
          <motion.section
            key={s.id}
            id={s.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            className="rounded-[1.5rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-5 md:p-6 glass-shine hover-glass-glow"
          >
            <h2 className="text-lg font-bold mb-3">{s.title}</h2>
            <div className="text-[14px] md:text-[15px] font-medium text-[#4a445f] dark:text-[#c4bed6] leading-relaxed">
              {s.content}
            </div>
          </motion.section>
        ))}
      </div>
    </motion.div>
  );
}
