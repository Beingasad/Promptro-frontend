import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ChevronRight, Tag, Sparkles } from 'lucide-react';
import SEOMeta from '../components/common/SEOMeta';
import JsonLd from '../components/common/JsonLd';
import posts from '../data/blogData';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const blogListSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Promptro Insights & Tutorials — AI Prompt Tips, Guides & Resources',
  url: 'https://promptro.in/blog',
  description: 'Learn how to write better AI image prompts, discover top Midjourney tips, and master AI image generation with Promptro\'s Insights & Tutorials.',
  publisher: {
    '@type': 'Organization',
    name: 'Promptro',
    url: 'https://promptro.in',
    logo: 'https://promptro.in/brand/logo.png',
  },
};

export default function Blog() {
  const [featured, ...rest] = posts;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 flex flex-col gap-8 pt-6 md:pt-8"
    >
      <SEOMeta
        title="Insights & Tutorials | Promptro AI Prompt Guides"
        description="Learn how to write better AI image prompts, discover top Midjourney V7 tips, master negative prompts, and get the most out of AI image generation with Promptro's Insights & Tutorials."
        keywords="AI prompt insights, AI prompt tutorials, Midjourney tips, DALL-E guide, AI image generation tutorial, how to write AI prompts, Promptro insights"
        canonical="https://promptro.in/blog"
        breadcrumbs={[
          { name: 'Home', url: 'https://promptro.in' },
          { name: 'Insights & Tutorials', url: 'https://promptro.in/blog' },
        ]}
      />
      <JsonLd schema={blogListSchema} id="blog-list" />

      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="text-center py-4 md:py-8"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-4">
          AI Prompt{' '}
          <span className="bg-gradient-to-r from-[#7437ff] via-[#dd4bd2] to-[#ff642d] bg-clip-text text-transparent">
            Tips &amp; Guides
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg font-medium text-[#6f6684] dark:text-[#afa6c8] max-w-xl mx-auto leading-relaxed">
          Learn how to write better AI image prompts, master your favourite AI tools, and create stunning visuals faster.
        </p>
      </motion.header>

      {/* Featured Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link
          to={`/blog/${featured.slug}`}
          className="group block rounded-[2rem] overflow-hidden bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 hover:shadow-[0_22px_56px_rgba(116,55,255,0.14)] transition-all glass-shine hover-glass-glow"
          style={{
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            isolation: 'isolate'
          }}
        >
          <div className="relative aspect-[16/7] overflow-hidden rounded-t-[2rem]">
            <img
              src={featured.featuredImage}
              alt={featured.featuredImageAlt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-t-[2rem]"
              loading="eager"
              decoding="async"
              width={1100}
              height={480}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                ⭐ Featured
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight line-clamp-2">
                {featured.title}
              </h2>
            </div>
          </div>
          <div className="p-5 md:p-6">
            <p className="text-sm md:text-base font-medium text-[#6f6684] dark:text-[#afa6c8] line-clamp-2 mb-3">
              {featured.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[#756d8d] dark:text-[#afa6c8]">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#7437ff] to-[#ff642d] flex items-center justify-center">
                  <span className="text-[7px] font-black text-white">MA</span>
                </div>
                <span>{featured.author}</span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(featured.publishDate)}
              </span>
              <span className="ml-auto flex items-center gap-1 text-primary font-bold group-hover:gap-2 transition-all">
                Read article
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Rest of posts */}
      {rest.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-5">More Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-[1.5rem] overflow-hidden bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 hover:shadow-[0_16px_40px_rgba(116,55,255,0.12)] transition-all h-full glass-shine hover-glass-glow"
                  style={{
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                    isolation: 'isolate'
                  }}
                >
                  <div className="aspect-[16/9] overflow-hidden rounded-t-[1.5rem]">
                    <img
                      src={post.featuredImage}
                      alt={post.featuredImageAlt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-t-[1.5rem]"
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={225}
                    />
                  </div>
                  <div className="p-4 md:p-5 flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold leading-snug line-clamp-2 text-[#171421] dark:text-white group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs font-medium text-[#756d8d] dark:text-[#afa6c8] line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-semibold text-[#8d86a0]/80 mt-auto pt-2.5 border-t border-[#e8e2f0] dark:border-white/5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishDate)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      )}

      {/* Tags Cloud */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-[1.5rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-5 md:p-6 glass-shine hover-glass-glow"
      >
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#756d8d] dark:text-[#afa6c8]">
            Topics
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(posts.flatMap((p) => p.tags))).map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/10 text-[#4a445f] dark:text-[#c4bed6] border border-white/60 dark:border-white/10 hover:border-primary/30 hover:text-primary transition-colors cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>
      </motion.section>

      {/* Bottom Spacer */}
      <div className="h-4" />
    </motion.div>
  );
}
