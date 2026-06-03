import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Instagram, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import SEOMeta from '../components/common/SEOMeta';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  {
    icon: Instagram,
    label: 'Instagram',
    handle: '@promptro.in',
    href: 'https://instagram.com/promptro.in',
    color: 'from-[#f09433] to-[#e6683c]',
  },
  {
    icon: XIcon,
    label: 'X (Twitter)',
    handle: 'Coming Soon',
    href: '#',
    color: 'from-[#0d0d0d] to-[#2b2b2b]',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setStatus('sending');
    try {
      await axios.post(`${API_BASE_URL}/api/feedback`, {
        user: form.name || 'Anonymous',
        email: form.email || 'N/A',
        subject: form.subject || 'Contact Form',
        message: `${form.message.trim()}${form.phone ? `\n\nPhone: ${form.phone}` : ''}`,
      });
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto px-2 pt-1 pb-4 md:pt-2 md:pb-10 flex flex-col gap-10"
    >
      <SEOMeta
        title="Contact Promptro | Get in Touch"
        description="Contact Promptro for support, feedback or collaboration. Reach out via Instagram @promptro.in or visit our website at promptro.in."
        keywords="contact Promptro, Promptro support, Promptro Instagram, Promptro feedback"
        canonical="https://promptro.in/contact"
        breadcrumbs={[
          { name: 'Home', url: 'https://promptro.in' },
          { name: 'Contact', url: 'https://promptro.in/contact' },
        ]}
      />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="text-center"
      >
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-4">
          We'd love to{' '}
          <span className="bg-gradient-to-r from-[#7437ff] via-[#dd4bd2] to-[#ff642d] bg-clip-text text-transparent">
            hear from you
          </span>
        </h1>
        <p className="text-base md:text-lg font-medium text-[#6f6684] dark:text-[#afa6c8] max-w-lg mx-auto">
          Whether you have feedback, a bug report, a collaboration idea, or just want to say hi — we're here.
        </p>
      </motion.section>

      {/* Direct Contact */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="rounded-[2rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-6 md:p-8 glass-shine hover-glass-glow"
      >
        <h2 className="text-lg font-bold mb-4">Contact Email</h2>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#7437ff] to-[#dd4bd2] flex items-center justify-center shadow-[0_8px_20px_rgba(116,55,255,0.3)] shrink-0">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-[#756d8d] dark:text-[#afa6c8] font-medium">Email</p>
            <a
              href="mailto:support.promptro@gmail.com"
              className="text-base font-bold text-primary hover:underline"
            >
              support.promptro@gmail.com
            </a>
          </div>
        </div>
      </motion.section>

      {/* Social Links */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <h2 className="text-lg font-bold mb-4">Find Us Online</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {socialLinks.map((s) => {
            const isClickable = s.href !== '#';
            const ContainerComponent = isClickable ? 'a' : 'div';
            return (
              <ContainerComponent
                key={s.label}
                {...(isClickable ? { href: s.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`flex items-center gap-3 rounded-[1.25rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-4 glass-shine hover-glass-glow ${
                  isClickable
                    ? 'hover:shadow-[0_12px_28px_rgba(116,55,255,0.14)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                    : 'opacity-70 cursor-not-allowed select-none'
                }`}
              >
                <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#756d8d] dark:text-[#afa6c8] font-medium">
                    {s.label} {!isClickable && <span className="text-[9px] font-bold text-primary ml-1">(Soon)</span>}
                  </p>
                  <p className="text-sm font-bold text-[#171421] dark:text-white truncate">{s.handle}</p>
                </div>
              </ContainerComponent>
            );
          })}
        </div>
      </motion.section>

      {/* Contact Form */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-[2rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-6 md:p-8 glass-shine hover-glass-glow"
      >
        <h2 className="text-lg font-bold mb-5">Send a Message</h2>

        {status === 'sent' ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-base font-bold text-[#171421] dark:text-white">Message sent!</p>
            <p className="text-sm text-[#756d8d] dark:text-[#afa6c8]">
              Thanks for reaching out. We'll get back to you soon.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 text-sm font-semibold text-primary hover:underline"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#756d8d] dark:text-[#afa6c8]">
                  Your Name
                </label>
                <input
                  type="text"
                  id="contact-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Mohammad Asad"
                  className="glass-input text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#756d8d] dark:text-[#afa6c8]">
                  Email Address <span className="text-[#ff6a3d]">*</span>
                </label>
                <input
                  type="email"
                  id="contact-email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="glass-input text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#756d8d] dark:text-[#afa6c8]">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="contact-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="glass-input text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#756d8d] dark:text-[#afa6c8]">
                Subject
              </label>
              <input
                type="text"
                id="contact-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Feedback, bug report, collaboration…"
                className="glass-input text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#756d8d] dark:text-[#afa6c8]">
                Message <span className="text-[#ff6a3d]">*</span>
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us what's on your mind…"
                className="glass-input text-sm resize-none"
                required
              />
            </div>
            {status === 'error' && (
              <p className="text-xs text-[#ff6a3d] font-medium">
              Something went wrong. Please reach us at <a href="mailto:support.promptro@gmail.com" className="font-bold text-primary hover:underline">support.promptro@gmail.com</a> or on Instagram @promptro.in
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'sending' || !form.message.trim() || !form.email.trim()}
              className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7437ff] to-[#dd4bd2] px-8 py-3 text-sm font-bold text-white shadow-[0_10px_26px_rgba(116,55,255,0.28)] hover:shadow-[0_14px_32px_rgba(116,55,255,0.38)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed self-start"
            >
              {status === 'sending' ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        )}
      </motion.section>
    </motion.div>
  );
}
