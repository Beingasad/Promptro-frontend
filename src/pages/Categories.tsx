import { Link } from 'react-router-dom';
import { ArrowUpRight, Grid } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCategories } from '../context/CategoryContext';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop';

export default function Categories() {
  const { categories } = useCategories();

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold tracking-tight mb-4"
          >
            Explore <span className="text-primary">Categories</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#756d8d] dark:text-[#afa6c8] text-xl font-medium"
          >
            Browse high-quality prompts curated by the community.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link 
                to={`/explore?category=${cat.name}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10"
              >
                <img 
                  src={cat.image_url || DEFAULT_IMAGE} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                   <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                        <p className="text-white/60 text-sm font-medium">Browse Prompts</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                   </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
