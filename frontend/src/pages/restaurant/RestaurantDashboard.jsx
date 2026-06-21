import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { restaurantAPI, orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function RestaurantSidebar({ active }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/restaurant-dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/restaurant-dashboard/orders', icon: '📦', label: 'Orders' },
    { to: '/restaurant-dashboard/menu', icon: '🍽️', label: 'Menu' },
    { to: '/restaurant-dashboard/analytics', icon: '📊', label: 'Analytics' },
    { to: '/', icon: '🌐', label: 'View Site' },
  ];
  return (
    <div className="sidebar">
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, marginBottom: 28, padding: '0 4px', color: 'var(--primary)' }}>
        EAT<span style={{ color: 'var(--text-primary)' }}>LOOP</span> Partner
      </div>
      {links.map(link => (
        <Link key={link.to} to={link.to} className={`sidebar-nav-item ${active === link.to ? 'active' : ''}`}>
          <span>{link.icon}</span> {link.label}
        </Link>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <button onClick={() => { logout(); navigate('/'); }} className="sidebar-nav-item" style={{ color: 'var(--error)', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default function RestaurantDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          restaurantAPI.getAnalytics(),
          orderAPI.getRestaurantOrders({ limit: 5 })
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setRecentOrders(ordersRes.data.orders || []);
      } catch (err) {
        if (err.response?.status === 404) {
          // Restaurant not set up yet
        } else { console.error(err); }
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const toggleStatus = async () => {
    setToggling(true);
    try {
      const { data } = await restaurantAPI.toggleStatus();
      toast.success(data.isOpen ? 'Restaurant is now Open!' : 'Restaurant is now Closed');
    } catch (err) { toast.error('Failed to update status'); }
    finally { setToggling(false); }
  };

  if (loading) return (
    <div className="sidebar-layout">
      <RestaurantSidebar active="/restaurant-dashboard" />
      <div style={{ padding: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      </div>
    </div>
  );

  if (!analytics) return (
    <div className="sidebar-layout">
      <RestaurantSidebar active="/restaurant-dashboard" />
      <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <h3>Restaurant not set up</h3>
          <p>Complete your restaurant registration to start receiving orders</p>
          <Link to="/restaurant-setup" className="btn btn-primary">Set Up Restaurant</Link>
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: "Today's Orders", value: analytics.today?.orders || 0, icon: '📦', change: '+12%', up: true, bg: '#EFF6FF', color: '#2563EB' },
    { label: "Today's Revenue", value: `₹${analytics.today?.revenue || 0}`, icon: '💰', change: '+8%', up: true, bg: '#F0FDF4', color: '#16A34A' },
    { label: 'This Month', value: analytics.month?.orders || 0, icon: '📅', change: `₹${analytics.month?.revenue || 0}`, up: true, bg: '#FFF7ED', color: '#EA580C' },
    { label: 'Avg Rating', value: `${analytics.rating?.toFixed(1) || '0.0'} ★`, icon: '⭐', change: `${analytics.totalReviews || 0} reviews`, up: true, bg: '#FEF9C3', color: '#CA8A04' },
  ];

  return (
    <div className="sidebar-layout">
      <RestaurantSidebar active="/restaurant-dashboard" />
      <main style={{ padding: '28px 32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Restaurant Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 2 }}>Manage your restaurant, orders, and analytics</p>
          </div>
          <button onClick={toggleStatus} disabled={toggling} className="btn" style={{ background: 'var(--success)', color: '#fff', gap: 8 }}>
            {toggling ? <span className="spinner spinner-sm" /> : '●'} Toggle Open/Close
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value" style={{ color: stat.color, marginTop: 6 }}>{stat.value}</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {stat.icon}
                </div>
              </div>
              <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>{stat.change}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent Orders */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>📦 Recent Orders</h3>
              <Link to="/restaurant-dashboard/orders" style={{ fontSize: 13, color: 'var(--primary)' }}>View All →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>No orders yet</div>
            ) : recentOrders.map(order => (
              <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>#{order.orderNumber}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.customer?.name} • {order.items?.length} items</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{order.pricing?.total}</div>
                  <span className={`badge ${order.status === 'delivered' ? 'badge-green' : order.status === 'cancelled' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: 11 }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Items */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🏆 Top Selling Items</h3>
            {analytics.topItems?.length === 0 || !analytics.topItems ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>No data yet</div>
            ) : analytics.topItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item._id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.count} orders</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--success)' }}>₹{item.revenue?.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export { RestaurantSidebar };
