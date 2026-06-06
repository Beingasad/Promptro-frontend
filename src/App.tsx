import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Saved from './pages/Saved';
import Categories from './pages/Categories';
import ImageDetail from './pages/ImageDetail';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Auth from './pages/Auth';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import { SearchProvider } from './context/SearchContext';
import { CategoryProvider } from './context/CategoryContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { useEffect } from 'react';

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
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="explore" element={<Explore />} />
                <Route path="saved" element={<Saved />} />
                <Route path="categories" element={<Categories />} />
                <Route path="prompt/:id" element={<ImageDetail />} />
                <Route path="auth" element={<Auth />} />
                {/* Trust & SEO Pages */}
                <Route path="about" element={<Home />} />
                <Route path="contact" element={<Home />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<TermsOfService />} />
                {/* Blog System */}
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogPost />} />
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
          </Router>
        </CategoryProvider>
      </SearchProvider>
    </ErrorBoundary>
  );
}

export default App;
