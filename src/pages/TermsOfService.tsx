import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
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
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: (
      <p>By accessing or using Promptro at <a href="https://promptro.in" className="text-primary font-semibold hover:underline">https://promptro.in</a>, you agree to be bound by these Terms of Service and our <a href="/privacy-policy" className="text-primary font-semibold hover:underline">Privacy Policy</a>. If you do not agree to these terms, please do not use the platform. We reserve the right to modify these terms at any time, with changes effective upon posting.</p>
    ),
  },
  {
    id: 'description-of-service',
    title: '2. Description of Service',
    content: (
      <p>Promptro is an online platform that provides a curated library of AI image prompts. Users can browse, copy, save, and share prompts for use with third-party AI tools including ChatGPT, Gemini, Midjourney, and others. Promptro does not generate images directly — it provides the prompts used with those external tools.</p>
    ),
  },
  {
    id: 'user-accounts',
    title: '3. User Accounts',
    content: (
      <div className="space-y-3">
        <p>You may use Promptro as a guest without creating an account. Creating an account allows you to sync your saved prompts and activity across devices.</p>
        <p>By creating an account, you agree to:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Provide accurate account information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Not share your account with others</li>
          <li>Notify us of any unauthorized access to your account</li>
        </ul>
        <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
      </div>
    ),
  },
  {
    id: 'intellectual-property',
    title: '4. Intellectual Property',
    content: (
      <div className="space-y-3">
        <p>All content on Promptro — including the platform design, codebase, branding, and curated prompt library — is owned by or licensed to Promptro and is protected by applicable intellectual property laws.</p>
        <p><strong>Prompt use:</strong> The prompts displayed on Promptro are provided for your personal and commercial creative use. You may copy and use them with AI image generation tools freely. However, you may not:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Republish, scrape, or resell our prompt library as a product</li>
          <li>Claim Promptro's prompt library as your own creation</li>
          <li>Build competing products using data scraped from Promptro without permission</li>
        </ul>
        <p><strong>Images:</strong> AI-generated images created using our prompts belong to you, subject to the terms of the AI tool you used to generate them.</p>
      </div>
    ),
  },
  {
    id: 'prohibited-conduct',
    title: '5. Prohibited Conduct',
    content: (
      <div className="space-y-2">
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use Promptro for any illegal purpose</li>
          <li>Attempt to hack, scrape, or attack the Promptro platform</li>
          <li>Use automated bots or scripts to access the platform at scale without permission</li>
          <li>Submit feedback or contact forms with spam, abuse, or harmful content</li>
          <li>Impersonate Promptro, its team, or other users</li>
          <li>Upload or share content that violates the intellectual property rights of others</li>
          <li>Use the platform in any way that could damage, disable, or impair the service</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'third-party-services',
    title: '6. Third-Party Services',
    content: (
      <p>Promptro integrates with third-party services including Google Firebase (authentication), Cloudinary (image hosting), and external AI tools you may choose to use with our prompts. Your use of these third-party services is governed by their respective terms of service. Promptro is not responsible for the practices or content of third-party services.</p>
    ),
  },
  {
    id: 'disclaimer',
    title: '7. Disclaimer of Warranties',
    content: (
      <p>Promptro is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or that any specific results will be achieved by using our prompts. AI image generation results vary depending on the tool, model version, and other factors outside our control.</p>
    ),
  },
  {
    id: 'limitation',
    title: '8. Limitation of Liability',
    content: (
      <p>To the maximum extent permitted by law, Promptro and its founders, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use the platform. Our total liability to you for any claim shall not exceed the amount you paid us in the 12 months preceding the claim (if any).</p>
    ),
  },
  {
    id: 'governing-law',
    title: '9. Governing Law',
    content: (
      <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of Promptro shall be subject to the exclusive jurisdiction of the courts of India.</p>
    ),
  },
  {
    id: 'changes',
    title: '10. Changes to Terms',
    content: (
      <p>We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated effective date. Your continued use of Promptro after changes constitutes acceptance of the new terms. If you disagree with the changes, you must stop using the platform.</p>
    ),
  },
  {
    id: 'contact-us',
    title: '11. Contact Us',
    content: (
      <div className="space-y-2">
        <p>For questions about these Terms of Service:</p>
        <p><strong>Email:</strong> <a href="mailto:support.promptro@gmail.com" className="text-primary font-semibold hover:underline">support.promptro@gmail.com</a></p>
        <p><strong>Website:</strong> <a href="https://promptro.in/contact" className="text-primary font-semibold hover:underline">https://promptro.in/contact</a></p>
      </div>
    ),
  },
];

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
