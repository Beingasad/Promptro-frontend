import { motion } from 'framer-motion';
import {
  Sparkles, Target, Heart, Globe, Instagram, Mail,
  Zap, Users, BookOpen, Star, ArrowRight, CheckCircle2,
  Layers, Cpu, ImagePlus, Clock,
} from 'lucide-react';
import SEOMeta from '../components/common/SEOMeta';
import JsonLd from '../components/common/JsonLd';
import { Link } from 'react-router-dom';

/* ─── Animation variants ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
});

/* ─── JSON-LD ─── */
const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Promptro',
  url: 'https://promptro.in',
  logo: 'https://promptro.in/brand/logo.png',
  foundingDate: '2026',
  description:
    'Promptro is a curated AI image prompt library helping creators, designers and artists generate stunning visuals.',
  founder: {
    '@type': 'Person',
    name: 'Mohammad Asad Ansari',
    jobTitle: 'Founder & Developer',
    url: 'https://promptro.in/about',
  },
  contactPoint: { '@type': 'ContactPoint', url: 'https://promptro.in/contact', contactType: 'customer support' },
  sameAs: ['https://instagram.com/promptro.in'],
};

/* ─── Data ─── */
const stats = [
  { value: '10,000+', label: 'AI Prompts', icon: Sparkles, color: 'from-[#7437ff] to-[#dd4bd2]' },
  { value: '100%', label: 'Free Access', icon: Heart, color: 'from-[#10b981] to-[#059669]' },
  { value: '2026', label: 'Founded', icon: Star, color: 'from-[#f59e0b] to-[#ef4444]' },
  { value: '∞', label: 'Creativity', icon: Zap, color: 'from-[#3b82f6] to-[#8b5cf6]' },
];

const values = [
  {
    icon: Target,
    title: 'Quality Over Quantity',
    desc: 'Every prompt is handpicked and tested across top AI tools — no filler, only prompts that actually produce stunning results.',
    color: 'from-[#7437ff] to-[#dd4bd2]',
  },
  {
    icon: Cpu,
    title: 'AI-First Platform',
    desc: 'Designed from day one for AI creators. Works seamlessly with Midjourney, DALL-E 3, Stable Diffusion, Flux and more.',
    color: 'from-[#dd4bd2] to-[#ff642d]',
  },
  {
    icon: Users,
    title: 'Creator Community',
    desc: 'Built for designers, filmmakers, artists and anyone who wants to harness AI creativity without the learning curve.',
    color: 'from-[#ff642d] to-[#f59e0b]',
  },
  {
    icon: Globe,
    title: 'Open & Accessible',
    desc: 'No paywalls on core prompts. We believe creative AI tools should be available to everyone, everywhere, for free.',
    color: 'from-[#10b981] to-[#3b82f6]',
  },
];

const timeline = [
  { year: '2026', title: 'Promptro Launched', desc: 'Started with a handpicked collection of 1,000 AI prompts.', icon: Sparkles },
  { year: '2026', title: 'Reached 10,000 Prompts', desc: 'Expanded across 20+ categories including cinematic, anime, portrait and architecture.', icon: Layers },
  { year: '2026', title: 'Insights & Tutorials', desc: 'Launched in-depth AI prompt tutorials, tips and Midjourney guides.', icon: BookOpen },
  { year: 'Soon', title: 'Community Features', desc: 'Creator profiles, community uploads, collections and AI style mixer — coming next.', icon: Users },
];

const comingSoon = [
  { icon: ImagePlus, label: 'Community Uploads', desc: 'Share your own prompts' },
  { icon: Layers, label: 'Prompt Collections', desc: 'Organize & curate boards' },
  { icon: Users, label: 'Creator Profiles', desc: 'Follow your favourite creators' },
  { icon: Cpu, label: 'AI Style Mixer', desc: 'Blend styles intelligently' },
];

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto px-3 py-6 md:py-10 flex flex-col gap-8 pb-4"
    >
      <SEOMeta
        title="About Promptro | AI Image Prompt Platform"
        description="Learn about Promptro — the curated AI image prompt library founded by Mohammad Asad Ansari in 2026. Mission, values, founder info and what's coming next."
        keywords="about Promptro, AI prompt platform, Mohammad Asad Ansari, Promptro founder, AI image prompts"
        canonical="https://promptro.in/about"
        breadcrumbs={[
          { name: 'Home', url: 'https://promptro.in' },
          { name: 'About', url: 'https://promptro.in/about' },
        ]}
        noOrganizationSchema
      />
      <JsonLd schema={orgSchema} id="about-org" />

      {/* ── HERO ── */}
      <motion.section {...fadeUp(0)} className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 text-center">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7437ff]/12 via-[#dd4bd2]/8 to-[#ff642d]/10 rounded-[2.5rem]" />
        <div className="absolute inset-0 border border-white/70 dark:border-white/10 rounded-[2.5rem]" />
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[#7437ff]/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#ff642d]/15 blur-3xl" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white dark:bg-white/10 shadow-[0_20px_50px_rgba(116,55,255,0.22)] p-2">
            <img src="/brand/logo.png" alt="Promptro" className="h-full w-auto object-contain" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-primary/12 border border-primary/20 px-4 py-1.5 mb-4">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest">AI Prompt Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] mb-4">
            We make{' '}
            <span className="bg-gradient-to-r from-[#7437ff] via-[#dd4bd2] to-[#ff642d] bg-clip-text text-transparent">
              AI creativity
            </span>
            <br />accessible to all
          </h1>

          <p className="text-base md:text-lg font-medium text-[#6f6684] dark:text-[#afa6c8] max-w-xl mx-auto leading-relaxed">
            Promptro is a free, curated library of AI image prompts — built to help creators, designers, filmmakers and artists generate stunning visuals without the guesswork.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7437ff] to-[#ff642d] px-6 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(116,55,255,0.3)] hover:shadow-[0_16px_38px_rgba(116,55,255,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              Browse Prompts
            </Link>
            <a
              href="https://instagram.com/promptro.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-white/10 border border-white/80 dark:border-white/15 px-6 py-2.5 text-sm font-bold text-[#171421] dark:text-white hover:bg-white/90 dark:hover:bg-white/15 transition-all"
            >
              <Instagram className="h-4 w-4 text-[#e1306c]" />
              @promptro.in
            </a>
          </div>
        </div>
      </motion.section>

      {/* ── STATS ── */}
      <motion.div {...fadeUp(0.08)} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center rounded-[1.5rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-4 text-center gap-2"
          >
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.12)]`}>
              <s.icon className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-black text-[#171421] dark:text-white leading-none">{s.value}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d86a0]">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* ── WHAT IS PROMPTRO ── */}
      <motion.section {...fadeUp(0.12)} className="rounded-[2rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7437ff] to-[#dd4bd2] flex items-center justify-center shadow-[0_6px_16px_rgba(116,55,255,0.28)]">
            <BookOpen className="h-4.5 w-4.5 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">What is Promptro?</h2>
        </div>
        <div className="space-y-3 text-[14px] md:text-[15px] font-medium text-[#4a445f] dark:text-[#c4bed6] leading-relaxed">
          <p>
            <strong className="text-[#171421] dark:text-white">Promptro</strong> is where creators come to discover, copy and use thousands of high-quality AI image prompts — completely free.
          </p>
          <p>
            Instead of spending hours on prompt engineering, you browse our curated library, copy any prompt in one tap, and paste it into <strong className="text-[#171421] dark:text-white">Midjourney, DALL-E 3, Stable Diffusion, Flux</strong> or any AI tool of your choice.
          </p>
          <p>
            Every prompt is tested and includes negative prompts, style tags, category filters and model recommendations — so you get stunning results on the first try.
          </p>
        </div>
      </motion.section>

      {/* ── MISSION ── */}
      <motion.section {...fadeUp(0.15)}>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#7437ff] via-[#9d52ff] to-[#ff642d] p-8 md:p-10 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent_60%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 mb-4">
              <Target className="h-3.5 w-3.5 text-white" />
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">Our Mission</span>
            </div>
            <blockquote className="text-xl md:text-2xl font-black text-white leading-snug mb-4 max-w-lg mx-auto">
              "Help creators discover, save and share high-quality AI prompts — for free, forever."
            </blockquote>
            <p className="text-sm font-medium text-white/80 max-w-md mx-auto">
              We believe AI creativity should have zero barriers. No subscriptions, no paywalls, no gatekeeping.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ── FOUNDER ── */}
      <motion.section {...fadeUp(0.18)}>
        <h2 className="text-xl md:text-2xl font-bold mb-4">Meet the Founder</h2>
        <div
          className="rounded-[2rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 overflow-hidden"
          itemScope
          itemType="https://schema.org/Person"
        >
          {/* Gradient header */}
          <div className="h-24 bg-gradient-to-r from-[#7437ff] via-[#dd4bd2] to-[#ff642d] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar — overlapping the header */}
            <div className="-mt-8 mb-4 flex items-end justify-between">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#7437ff] via-[#dd4bd2] to-[#ff642d] flex items-center justify-center shadow-[0_12px_28px_rgba(116,55,255,0.3)] border-4 border-white dark:border-[#1a1625]">
                <span className="text-xl font-black text-white select-none">MA</span>
              </div>
              <div className="flex gap-2 mt-8">
                <a
                  href="https://instagram.com/promptro.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] to-[#e6683c] text-white shadow-[0_4px_12px_rgba(230,104,60,0.3)] hover:scale-105 transition-transform"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="/contact"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors hover:scale-105"
                  aria-label="Contact"
                  title="Contact (Email coming soon)"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            <h3 className="text-lg font-black text-[#171421] dark:text-white" itemProp="name">
              Mohammad Asad Ansari
            </h3>
            <p className="text-sm font-bold text-primary mb-3" itemProp="jobTitle">
              Founder &amp; Developer · Promptro
            </p>
            <p className="text-[14px] font-medium text-[#4a445f] dark:text-[#c4bed6] leading-relaxed" itemProp="description">
              Mohammad Asad Ansari built Promptro in 2026 with a single goal: make the best AI prompts free and accessible to every creator. Passionate about AI, design and creative technology, he personally curates and tests every prompt in the library.
            </p>

            {/* Quick info pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { icon: Clock, label: 'Founded 2026' },
                { icon: Globe, label: 'India' },
                { icon: CheckCircle2, label: 'Open Access' },
              ].map((pill) => (
                <div key={pill.label} className="flex items-center gap-1.5 rounded-full bg-primary/8 border border-primary/15 px-3 py-1">
                  <pill.icon className="h-3 w-3 text-primary" />
                  <span className="text-[11px] font-semibold text-primary">{pill.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── VALUES ── */}
      <motion.section {...fadeUp(0.2)}>
        <h2 className="text-xl md:text-2xl font-bold mb-4">What We Stand For</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map((v) => (
            <div
              key={v.title}
              className="flex gap-4 rounded-[1.5rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-5 hover:shadow-[0_16px_40px_rgba(116,55,255,0.1)] transition-shadow"
            >
              <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center shadow-[0_6px_14px_rgba(0,0,0,0.1)]`}>
                <v.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold mb-1 text-[#171421] dark:text-white">{v.title}</h3>
                <p className="text-[12px] font-medium text-[#756d8d] dark:text-[#afa6c8] leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── TIMELINE ── */}
      <motion.section {...fadeUp(0.22)}>
        <h2 className="text-xl md:text-2xl font-bold mb-5">Our Journey</h2>
        <div className="relative flex flex-col gap-0">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-5 bottom-5 w-[2px] bg-gradient-to-b from-[#7437ff] via-[#dd4bd2] to-[#ff642d] opacity-20 rounded-full" />
          {timeline.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.24 + i * 0.06, duration: 0.5 }}
              className="flex gap-4 pb-6 last:pb-0 relative"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#1a1625] border-2 border-primary/30 shadow-[0_4px_12px_rgba(116,55,255,0.15)] z-10">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="pt-1.5 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.year === 'Soon' ? 'text-[#ff642d]' : 'text-primary'}`}>
                    {item.year}
                  </span>
                </div>
                <h3 className="text-[13px] font-bold text-[#171421] dark:text-white">{item.title}</h3>
                <p className="text-[12px] font-medium text-[#756d8d] dark:text-[#afa6c8] leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── COMING SOON ── */}
      <motion.section {...fadeUp(0.26)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Coming Soon</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-3 py-1">✨ Planned</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {comingSoon.map((f) => (
            <div
              key={f.label}
              className="flex flex-col gap-2 rounded-[1.5rem] bg-white/60 dark:bg-white/5 border border-dashed border-primary/20 p-4"
            >
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <f.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#171421] dark:text-white">{f.label}</p>
                <p className="text-[11px] font-medium text-[#8d86a0]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── INSTAGRAM CTA ── */}
      <motion.section {...fadeUp(0.28)}>
        <a
          href="https://instagram.com/promptro.in"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-[2rem] overflow-hidden bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#dc2743] p-6 hover:shadow-[0_20px_50px_rgba(230,104,60,0.3)] transition-all"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
            <Instagram className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-0.5">Follow us on</p>
            <p className="text-lg font-black text-white">Instagram</p>
            <p className="text-[12px] font-medium text-white/80">@promptro.in · Stay updated</p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform shrink-0" />
        </a>
      </motion.section>

      {/* ── BOTTOM CTA ── */}
      <motion.div {...fadeUp(0.3)} className="text-center pt-2">
        <p className="text-sm font-medium text-[#8d86a0] mb-4">
          Questions? Suggestions? We'd love to hear from you.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-7 py-2.5 text-sm font-bold text-primary hover:bg-primary/15 transition-colors"
        >
          <Mail className="h-4 w-4" />
          Contact Us
        </Link>
      </motion.div>
    </motion.div>
  );
}
