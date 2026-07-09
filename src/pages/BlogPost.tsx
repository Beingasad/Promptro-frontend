import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, ChevronRight, ChevronDown, Tag, List, HelpCircle, Share2, BookOpen } from 'lucide-react';
import SEOMeta from '../components/common/SEOMeta';
import JsonLd from '../components/common/JsonLd';
import AuthorCard from '../components/common/AuthorCard';
import { getPostBySlug, getRelatedPosts } from '../data/blogData';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelatedPosts(post.relatedSlugs);

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: post.featuredImage,
    url: `https://promptro.in/blog/${post.slug}`,
    datePublished: post.publishDate,
    dateModified: post.updatedDate,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorTitle,
      url: 'https://promptro.in/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Promptro',
      url: 'https://promptro.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://promptro.in/brand/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://promptro.in/blog/${post.slug}`,
    },
    keywords: post.keywords,
    articleSection: post.category,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 md:pt-6"
    >
      <SEOMeta
        title={post.metaTitle}
        description={post.metaDescription}
        keywords={post.keywords}
        canonical={`https://promptro.in/blog/${post.slug}`}
        ogType="article"
        ogImage={post.featuredImage}
        author={post.author}
        publishedTime={post.publishDate}
        modifiedTime={post.updatedDate}
        breadcrumbs={[
          { name: 'Home', url: 'https://promptro.in' },
          { name: 'Insights & Tutorials', url: 'https://promptro.in/blog' },
          { name: post.title, url: `https://promptro.in/blog/${post.slug}` },
        ]}
      />
      <JsonLd schema={articleSchema} id={`article-${post.slug}`} />
      <JsonLd schema={faqSchema} id={`faq-${post.slug}`} />

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content */}
        <article className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Category + Tags */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-3.5 py-1 rounded-full">
              {post.category}
            </span>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-[10px] font-semibold text-[#756d8d] dark:text-[#afa6c8]">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] font-black leading-[1.12] tracking-tight text-[#171421] dark:text-white">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-semibold text-[#756d8d] dark:text-[#afa6c8]">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#7437ff] to-[#ff642d] flex items-center justify-center ring-2 ring-white/50 dark:ring-white/10">
                <span className="text-[8px] font-black text-white">MA</span>
              </div>
              <span className="font-bold text-[#4a445f] dark:text-[#c4bed6]">{post.author}</span>
            </div>
            <span className="h-4 w-px bg-[#d4cfe3] dark:bg-white/15" />
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.publishDate)}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
            {post.updatedDate !== post.publishDate && (
              <span className="text-[10px] opacity-60 italic">
                Updated {formatDate(post.updatedDate)}
              </span>
            )}
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? 'Link copied!' : 'Share'}
            </button>
          </div>

          {/* Featured Image */}
          <div className="rounded-[1.5rem] overflow-hidden aspect-[16/9] shadow-[0_16px_48px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
              width={800}
              height={450}
            />
          </div>

          {/* Excerpt (intro) */}
          <p className="text-base md:text-lg font-medium text-[#4a445f] dark:text-[#c4bed6] leading-relaxed rounded-[1.25rem] bg-primary/5 border border-primary/15 px-5 py-4">
            {post.excerpt}
          </p>

          {/* Mobile TOC */}
          <details className="lg:hidden rounded-[1.25rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 overflow-hidden glass-shine hover-glass-glow">
            <summary className="flex items-center gap-2 p-4 cursor-pointer text-sm font-bold select-none">
              <List className="h-4 w-4 text-primary" />
              Table of Contents
            </summary>
            <nav className="px-4 pb-4">
              <ol className="space-y-1.5">
                {post.toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm font-medium text-[#4a445f] dark:text-[#c4bed6] hover:text-primary transition-colors"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>

          {/* Article Content */}
          <div className="bg-white dark:bg-[#0f0d15] rounded-[2rem] p-6 md:p-10 lg:p-12 shadow-[0_8px_32px_rgba(72,56,118,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.4)] border border-[#e8e2f0] dark:border-white/5">
            <div
              ref={contentRef}
              className="prose-custom"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Author Card */}
          <div className="pt-6 mt-2 border-t border-[#e8e2f0] dark:border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8d86a0]/70 mb-3">Written by</p>
            <AuthorCard variant="full" />
          </div>

          {/* FAQ Section */}
          {post.faqs.length > 0 && (
            <section className="rounded-[2rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-5 md:p-7 glass-shine hover-glass-glow">
              <div className="flex items-center gap-2 mb-5">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Frequently Asked Questions</h2>
              </div>
              <div className="flex flex-col divide-y divide-[#e8e2f0] dark:divide-white/10">
                {post.faqs.map((faq, i) => (
                  <div key={i} className="py-3.5">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-start justify-between gap-3 text-left"
                      aria-expanded={openFaq === i}
                    >
                      <span className="text-sm font-semibold text-[#171421] dark:text-white leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 mt-0.5 ${openFaq === i ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="pt-2.5 text-[13px] font-medium text-[#4a445f] dark:text-[#c4bed6] leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <section className="mt-2">
              <h2 className="text-lg font-bold mb-4">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="group flex gap-3.5 rounded-[1.25rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-4 hover:shadow-[0_12px_28px_rgba(116,55,255,0.12)] transition-all glass-shine hover-glass-glow"
                  >
                    <div className="h-16 w-20 shrink-0 rounded-xl overflow-hidden">
                      <img 
                        src={r.featuredImage} 
                        alt={r.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        loading="lazy"
                        decoding="async"
                        width={80}
                        height={64}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{r.category}</p>
                      <p className="text-xs font-semibold text-[#171421] dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {r.title}
                      </p>
                      <p className="text-[10px] text-[#8d86a0]/70 mt-1">{r.readingTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Sticky Desktop TOC Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 flex flex-col gap-4">
            {/* TOC Card */}
            <div className="rounded-[1.5rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-5 glass-shine hover-glass-glow">
              <div className="flex items-center gap-2 mb-4">
                <List className="h-4 w-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#756d8d] dark:text-[#afa6c8]">Contents</p>
              </div>
              <nav aria-label="Table of contents">
                <ol className="space-y-2.5">
                  {post.toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? 'pl-3.5' : ''}>
                      <a
                        href={`#${item.id}`}
                        className="text-[12px] font-medium text-[#4a445f] dark:text-[#c4bed6] hover:text-primary transition-colors leading-snug block"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            {/* CTA Card */}
            <div className="rounded-[1.5rem] bg-gradient-to-br from-primary/8 to-[#ff6a3d]/5 border border-primary/12 p-5 glass-shine hover-glass-glow">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <p className="text-xs font-bold text-[#4a445f] dark:text-[#c4bed6]">Explore Prompts</p>
              </div>
              <p className="text-[11px] font-medium text-[#756d8d] dark:text-[#afa6c8] mb-3 leading-relaxed">
                Discover curated AI image prompts for ChatGPT, Midjourney & more.
              </p>
              <Link
                to="/explore"
                className="block text-center text-xs font-bold text-white bg-gradient-to-r from-[#7437ff] to-[#dd4bd2] rounded-full px-4 py-2.5 hover:opacity-90 transition-opacity shadow-[0_8px_20px_rgba(116,55,255,0.25)]"
              >
                Browse Prompts →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
