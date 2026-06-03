import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import SEOMeta from '../components/common/SEOMeta';

const LAST_UPDATED = 'June 3, 2026';
const EFFECTIVE_DATE = 'June 3, 2026';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    content: (
      <div className="space-y-3">
        <p><strong>Information you provide:</strong> When you create an account, we collect your name, email address, and profile information. When you submit feedback or contact us, we collect the content of your message.</p>
        <p><strong>Automatically collected information:</strong> We collect standard server logs including your IP address, browser type, device type, pages visited, and time of visit. This data is used to improve the platform and understand traffic patterns.</p>
        <p><strong>Local storage data:</strong> Promptro stores your saved prompts, liked prompts, and recently viewed prompts in your browser's local storage and session storage. This data stays on your device and is not automatically sent to our servers unless you are logged in.</p>
        <p><strong>Firebase authentication:</strong> If you sign in, your authentication is handled by Google Firebase. We receive your display name, email, and profile photo URL from your chosen sign-in provider.</p>
      </div>
    ),
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    content: (
      <ul className="list-disc list-inside space-y-2">
        <li>To provide, maintain, and improve the Promptro platform</li>
        <li>To remember your preferences, saved prompts, and activity</li>
        <li>To send you important service notifications (not marketing emails unless you opt in)</li>
        <li>To understand how users interact with our platform (analytics)</li>
        <li>To respond to your feedback or support requests</li>
        <li>To prevent abuse and ensure the security of our platform</li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    title: '3. Cookies and Local Storage',
    content: (
      <div className="space-y-3">
        <p>Promptro uses browser <strong>local storage</strong> and <strong>session storage</strong> (not traditional cookies) to remember your theme preference, saved prompts, and activity. These are stored entirely on your device.</p>
        <p>We do not use third-party advertising cookies. Google Firebase may set authentication-related cookies when you are signed in.</p>
        <p>You can clear your local storage at any time through your browser settings. This will reset your saved prompts and preferences.</p>
      </div>
    ),
  },
  {
    id: 'data-sharing',
    title: '4. Data Sharing and Third Parties',
    content: (
      <div className="space-y-3">
        <p>We do <strong>not sell, trade, or rent</strong> your personal information to third parties.</p>
        <p>We use the following third-party services:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Google Firebase</strong> — Authentication and user account management</li>
          <li><strong>Cloudinary</strong> — Image hosting and optimization for prompt images</li>
          <li><strong>Neon / PostgreSQL</strong> — Secure database hosting for prompt data</li>
          <li><strong>Render / Vercel</strong> — Cloud hosting for the application</li>
          <li><strong>ip-api.com</strong> — Anonymous IP geolocation for analytics (country-level only)</li>
        </ul>
        <p>Each of these services has their own privacy policy and data practices.</p>
      </div>
    ),
  },
  {
    id: 'data-retention',
    title: '5. Data Retention',
    content: (
      <p>We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days. Anonymized analytics data may be retained for longer periods. Prompt data (which is not personally identifiable) is retained indefinitely as it is part of our public platform content.</p>
    ),
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
    content: (
      <div className="space-y-3">
        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Access</strong> — Request a copy of your personal data</li>
          <li><strong>Correction</strong> — Request correction of inaccurate data</li>
          <li><strong>Deletion</strong> — Request deletion of your account and data</li>
          <li><strong>Portability</strong> — Request your data in a portable format</li>
          <li><strong>Objection</strong> — Object to how we process your data</li>
        </ul>
        <p>To exercise any of these rights, contact us via Instagram <strong>@promptro.in</strong> or use the contact form at <a href="/contact" className="text-primary font-semibold hover:underline">promptro.in/contact</a>. You can also delete your account directly from the app via the profile menu.</p>
      </div>
    ),
  },
  {
    id: 'security',
    title: '7. Security',
    content: (
      <p>We implement reasonable technical and organizational measures to protect your data. However, no method of transmission over the internet is 100% secure. Authentication is handled by Google Firebase, which implements industry-standard security practices including OAuth 2.0 and encryption in transit.</p>
    ),
  },
  {
    id: 'children',
    title: '8. Children\'s Privacy',
    content: (
      <p>Promptro is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately via <a href="/contact" className="text-primary font-semibold hover:underline">our contact page</a>.</p>
    ),
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: (
      <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last Updated" date at the top of this page. Continued use of Promptro after changes constitutes acceptance of the updated policy.</p>
    ),
  },
  {
    id: 'contact-us',
    title: '10. Contact Us',
    content: (
      <div className="space-y-2">
        <p>If you have questions about this Privacy Policy or your personal data, please contact us:</p>
        <p><strong>Email:</strong> <a href="mailto:support.promptro@gmail.com" className="text-primary font-semibold hover:underline">support.promptro@gmail.com</a></p>
        <p><strong>Website:</strong> <a href="https://promptro.in" className="text-primary font-semibold hover:underline">https://promptro.in</a></p>
      </div>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto px-2 py-6 md:py-10 flex flex-col gap-8 pb-24"
    >
      <SEOMeta
        title="Privacy Policy | Promptro"
        description="Read Promptro's Privacy Policy to understand how we collect, use and protect your personal information on the AI prompt platform."
        canonical="https://promptro.in/privacy-policy"
        robots="index, follow"
        breadcrumbs={[
          { name: 'Home', url: 'https://promptro.in' },
          { name: 'Privacy Policy', url: 'https://promptro.in/privacy-policy' },
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
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Legal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
          Privacy Policy
        </h1>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-[#756d8d] dark:text-[#afa6c8]">
          <span><strong>Effective:</strong> {EFFECTIVE_DATE}</span>
          <span><strong>Last Updated:</strong> {LAST_UPDATED}</span>
        </div>
        <p className="text-[15px] font-medium text-[#4a445f] dark:text-[#c4bed6] leading-relaxed">
          At Promptro, we take your privacy seriously. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your personal data when you use <a href="https://promptro.in" className="text-primary font-semibold hover:underline">promptro.in</a>.
        </p>
      </motion.header>

      {/* Table of Contents */}
      <motion.nav
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[1.5rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-5"
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
            className="rounded-[1.5rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-5 md:p-6"
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
