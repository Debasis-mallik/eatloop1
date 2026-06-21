import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';


// Layouts & Common
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import RestaurantsPage from './pages/customer/RestaurantsPage';
import RestaurantDetailPage from './pages/customer/RestaurantDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import ProfilePage from './pages/customer/ProfilePage';
import WishlistPage from './pages/customer/WishlistPage';
import SearchPage from './pages/customer/SearchPage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Restaurant Pages
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import MenuManagement from './pages/restaurant/MenuManagement';
import RestaurantOrders from './pages/restaurant/RestaurantOrders';
import RestaurantAnalytics from './pages/restaurant/RestaurantAnalytics';
import RestaurantSetup from './pages/restaurant/RestaurantSetup';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// AI Pages
import AIAssistant from './pages/customer/AIAssistant';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
      <Route path="/restaurants" element={<><Navbar /><RestaurantsPage /><Footer /></>} />
      <Route path="/restaurant/:id" element={<><Navbar /><RestaurantDetailPage /><Footer /></>} />
      <Route path="/search" element={<><Navbar /><SearchPage /><Footer /></>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Customer */}
      <Route path="/cart" element={<ProtectedRoute roles={['customer']}><Navbar /><CartPage /><Footer /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute roles={['customer']}><Navbar /><CheckoutPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute roles={['customer']}><Navbar /><OrderHistoryPage /><Footer /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><Navbar /><OrderTrackingPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Navbar /><ProfilePage /><Footer /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute roles={['customer']}><Navbar /><WishlistPage /><Footer /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute><Navbar /><AIAssistant /><Footer /></ProtectedRoute>} />

      {/* Restaurant Owner */}
      <Route path="/restaurant-dashboard" element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantDashboard /></ProtectedRoute>} />
      <Route path="/restaurant-dashboard/menu" element={<ProtectedRoute roles={['restaurant_owner']}><MenuManagement /></ProtectedRoute>} />
      <Route path="/restaurant-dashboard/orders" element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantOrders /></ProtectedRoute>} />
      <Route path="/restaurant-dashboard/analytics" element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantAnalytics /></ProtectedRoute>} />
      <Route path="/restaurant-setup" element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantSetup /></ProtectedRoute>} />

      {/* Delivery Partner */}
      <Route path="/delivery-dashboard" element={<ProtectedRoute roles={['delivery_partner']}><DeliveryDashboard /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/restaurants" element={<ProtectedRoute roles={['admin']}><AdminRestaurants /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                }
              }}
            />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
