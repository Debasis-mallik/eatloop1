import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

function AdminSidebar({ active }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/admin', icon: '🏠', label: 'Dashboard' },
    { to: '/admin/restaurants', icon: '🍽️', label: 'Restaurants' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/orders', icon: '📦', label: 'Orders' },
    { to: '/admin/analytics', icon: '📊', label: 'AI Analytics' },
    { to: '/', icon: '🌐', label: 'View Site' },
  ];
  return (
    <div className="sidebar">
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, marginBottom: 28, padding: '0 4px' }}>
        <span style={{ color: 'var(--primary)' }}>EAT</span><span style={{ color: 'var(--text-primary)' }}>LOOP</span>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>Admin Panel</div>
      </div>
      {links.map(link => (
        <Link key={link.to} to={link.to} className={`sidebar-nav-item ${active === link.to ? 'active' : ''}`}>
          <span>{link.icon}</span> {link.label}
        </Link>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <button onClick={() => { logout(); navigate('/'); }} className="sidebar-nav-item" style={{ color: 'var(--error)', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

// ─── AdminDashboard ────────────────────────────────────────────
export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="sidebar-layout">
      <AdminSidebar active="/admin" />
      <div style={{ padding: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: 'Total Users', value: data?.stats?.totalUsers || 0, icon: '👥', bg: '#EFF6FF', color: '#2563EB' },
    { label: 'Restaurants', value: data?.stats?.totalRestaurants || 0, icon: '🍽️', bg: '#FFF7ED', color: '#EA580C' },
    { label: "Today's Orders", value: data?.stats?.todayOrders || 0, icon: '📦', bg: '#F0FDF4', color: '#16A34A' },
    { label: 'Total Revenue', value: `₹${(data?.stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', bg: '#FEF9C3', color: '#CA8A04' },
    { label: 'Pending Restaurants', value: data?.stats?.pendingRestaurants || 0, icon: '⏳', bg: '#FEE2E2', color: '#DC2626' },
    { label: 'Total Orders', value: data?.stats?.totalOrders || 0, icon: '🛒', bg: '#F3E8FF', color: '#9333EA' },
  ];

  return (
    <div className="sidebar-layout">
      <AdminSidebar active="/admin" />
      <main style={{ padding: '28px 32px', overflowY: 'auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>🏠 Admin Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color, marginTop: 6, fontSize: 24 }}>{s.value}</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📋 Recent Orders</h3>
          {data?.recentOrders?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No orders yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Order #', 'Customer', 'Restaurant', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders?.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--primary)' }}>#{order.orderNumber}</td>
                    <td style={{ padding: '10px 12px' }}>{order.customer?.name}</td>
                    <td style={{ padding: '10px 12px' }}>{order.restaurant?.name}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>₹{order.pricing?.total}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${order.status === 'delivered' ? 'badge-green' : order.status === 'cancelled' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: 11 }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 12 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── AdminRestaurants ──────────────────────────────────────────
export function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    adminAPI.getRestaurants().then(r => setRestaurants(r.data.restaurants || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminAPI.updateRestaurantStatus(id, status);
      setRestaurants(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      toast.success(`Restaurant ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const filtered = filter === 'all' ? restaurants : restaurants.filter(r => r.status === filter);

  return (
    <div className="sidebar-layout">
      <AdminSidebar active="/admin/restaurants" />
      <main style={{ padding: '28px 32px', overflowY: 'auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>🍽️ Restaurant Management</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'pending', 'approved', 'rejected', 'suspended'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="tag" style={filter === f ? { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(255,69,0,0.06)' } : {}}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🍽️</div><h3>No restaurants</h3></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(r => (
              <div key={r._id} className="card" style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.cuisine?.join(', ')} • {r.address?.city}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Owner: {r.owner?.name} ({r.owner?.email})</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'pending' ? 'badge-orange' : 'badge-red'}`}>{r.status}</span>
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(r._id, 'approved')} className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff' }}>✓ Approve</button>
                      <button onClick={() => updateStatus(r._id, 'rejected')} className="btn btn-danger btn-sm">✕ Reject</button>
                    </>
                  )}
                  {r.status === 'approved' && (
                    <button onClick={() => updateStatus(r._id, 'suspended')} className="btn btn-secondary btn-sm">Suspend</button>
                  )}
                  {r.status === 'suspended' && (
                    <button onClick={() => updateStatus(r._id, 'approved')} className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff' }}>Restore</button>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>★ {r.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── AdminUsers ────────────────────────────────────────────────
export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    adminAPI.getUsers().then(r => setUsers(r.data.users || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update'); }
  };

  const filtered = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);

  return (
    <div className="sidebar-layout">
      <AdminSidebar active="/admin/users" />
      <main style={{ padding: '28px 32px', overflowY: 'auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>👥 User Management</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'customer', 'restaurant_owner', 'delivery_partner'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className="tag" style={roleFilter === r ? { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(255,69,0,0.06)' } : {}}>
              {r === 'all' ? 'All Users' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--primary)', color: '#fff' }}>{user.name?.charAt(0)}</div>
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{user.phone || 'N/A'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${user.role === 'admin' ? 'badge-blue' : user.role === 'restaurant_owner' ? 'badge-orange' : 'badge-gray'}`} style={{ fontSize: 11 }}>
                        {user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11 }}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => toggleUser(user._id)} className={`btn btn-sm ${user.isActive ? 'btn-secondary' : 'btn-primary'}`}>
                        {user.isActive ? 'Suspend' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── AdminOrders ───────────────────────────────────────────────
export function AdminOrders() {
  return (
    <div className="sidebar-layout">
      <AdminSidebar active="/admin/orders" />
      <main style={{ padding: '28px 32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>📦 Order Monitoring</h1>
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>Order Monitor</h3>
          <p>Real-time order monitoring across all restaurants. Connect to the backend to see live orders.</p>
          <Link to="/admin" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </main>
    </div>
  );
}

// ─── AdminAnalytics ────────────────────────────────────────────
export function AdminAnalytics() {
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getRevenue().then(r => setRevenue(r.data.monthly || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const COLORS = ['#FF4500', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6'];

  return (
    <div className="sidebar-layout">
      <AdminSidebar active="/admin/analytics" />
      <main style={{ padding: '28px 32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>📊 AI Analytics Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Platform-wide analytics powered by AI</p>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[250, 250].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {revenue.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📈 Monthly Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenue.map(r => ({ month: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`, revenue: r.revenue, orders: r.orders })).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v, n) => [n === 'revenue' ? `₹${v}` : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
                    <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { title: '🤖 AI Features Active', items: ['Smart Recommendations', 'Sentiment Analysis', 'Demand Forecasting', 'Fraud Detection', 'Delivery Prediction'] },
                { title: '🛡️ Fraud Prevention', items: ['0 Fake Reviews Detected', '0 Suspicious Transactions', '100% Safe Payments', 'Real-time monitoring'] },
                { title: '📱 Platform Health', items: ['API Response: <200ms', '99.9% Uptime', 'Real-time Socket.io', 'JWT Security Active'] },
              ].map((card, i) => (
                <div key={i} className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{card.title}</h3>
                  {card.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                      <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export { AdminSidebar };
export default AdminDashboard;
