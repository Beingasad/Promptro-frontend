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

import Home from './pages/Home';
import Explore from './pages/Explore';
import Saved from './pages/Saved';
import Collections from './pages/Collections';
import Categories from './pages/Categories';
import ImageDetail from './pages/ImageDetail';
import Profile from './pages/Profile';

// Lazy-load non-core pages for code splitting
const Auth = lazy(() => import('./pages/Auth'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Founder = lazy(() => import('./pages/Founder'));

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
            <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center z-[200] bg-background/50 backdrop-blur-sm"><div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div></div>}>
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
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="founder" element={<Founder />} />
                  <Route path="mohammad-asad-ansari" element={<Founder />} />
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
