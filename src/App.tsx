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
import { SearchProvider } from './context/SearchContext';
import { CategoryProvider } from './context/CategoryContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Simple Protected Route Component
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

function App() {
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
              </Route>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin" 
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
