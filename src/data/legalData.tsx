import React from 'react';

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export const privacySections: LegalSection[] = [
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

export const termsSections: LegalSection[] = [
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
