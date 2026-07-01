import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from './layouts/MainLayout';
import { SearchProvider } from './context/SearchContext';
import { CategoryProvider } from './context/CategoryContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import GlobalAlert from './components/common/GlobalAlert';
import { useEffect } from 'react';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

// Lazy-load page components for optimal code splitting
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Saved = lazy(() => import('./pages/Saved'));
const Collections = lazy(() => import('./pages/Collections'));
const Categories = lazy(() => import('./pages/Categories'));
const ImageDetail = lazy(() => import('./pages/ImageDetail'));
const Auth = lazy(() => import('./pages/Auth'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Profile = lazy(() => import('./pages/Profile'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Simple Protected Route Component
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/asad87/login" replace />;
};

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__promptroAppLoaded = true;
    }
  }, []);

  return (
    <ErrorBoundary>
      <SearchProvider>
        <CategoryProvider>
          <Router>
            <GlobalAlert />
            <Suspense fallback={
              <div className="fixed inset-0 z-[9999] flex flex-col justify-center items-center bg-[#f8f7fc]/45 dark:bg-[#0d0b14]/45 backdrop-blur-[6px]">
                <div className="relative flex flex-col items-center p-8 rounded-[2rem] bg-white/30 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 shadow-[0_30px_60px_rgba(72,56,118,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                  {/* Glowing Premium Loader Orb */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-primary border-r-secondary rounded-full animate-spin"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary opacity-20 animate-pulse"></div>
                    <img src="/brand/logo.png" className="absolute w-5 h-5 object-contain" alt="Logo" />
                  </div>
                  {/* Sliding Progress Indicator */}
                  <div className="h-1.5 w-24 bg-[#cfc7dd]/30 dark:bg-white/10 rounded-full overflow-hidden mt-6 relative">
                    <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-primary to-secondary rounded-full animate-loading-bar"></div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-4">Promptro</p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="saved" element={<Saved />} />
                  <Route path="collections" element={<Collections />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="prompt/:id" element={<ImageDetail />} />
                  <Route path="auth" element={<Auth />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="verify-email" element={<VerifyEmail />} />
                  {/* Trust & SEO Pages */}
                  <Route path="about" element={<Home />} />
                  <Route path="contact" element={<Home />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<TermsOfService />} />
                  {/* Blog System */}
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/:slug" element={<BlogPost />} />
                  {/* Fallback 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/asad87/login" element={<AdminLogin />} />
                <Route
                  path="/asad87"
                  element={
                    <AdminProtectedRoute>
                      <Admin />
                    </AdminProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
        </CategoryProvider>
      </SearchProvider>
    </ErrorBoundary>
  );
}

export default App;
