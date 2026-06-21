import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { notifAPI } from '../../services/api';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      notifAPI.getAll().then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter(n => !n.isRead).length || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) { navigate(`/search?q=${encodeURIComponent(searchQ)}`); setSearchQ(''); }
  };

  const handleLogout = () => { logout(); navigate('/'); setShowUserMenu(false); };

  const getDashboardLink = () => {
    if (!user) return '/';
    const map = { admin: '/admin', restaurant_owner: '/restaurant-dashboard', delivery_partner: '/delivery-dashboard' };
    return map[user.role] || '/profile';
  };

  const markAllRead = async () => {
    await notifAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: 'var(--nav-height)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)' }}>EAT</span>
          <span style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>LOOP</span>
          <span style={{ fontSize: 20 }}>🍜</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }} className="input-group">
          <span className="input-icon">🔍</span>
          <input
            className="input"
            placeholder="Search restaurants, cuisines, dishes..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </form>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          <Link to="/restaurants" className="btn btn-ghost btn-sm" style={{ display: window.innerWidth < 768 ? 'none' : 'flex' }}>
            🍕 Restaurants
          </Link>

          {/* Theme Toggle */}
          <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Toggle theme">
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* AI Assistant */}
          {isAuthenticated && (
            <Link to="/ai-assistant" className="btn btn-ghost btn-icon" title="AI Assistant">
              🤖
            </Link>
          )}

          {/* Cart */}
          {(user?.role === 'customer' || !user) && (
            <Link to="/cart" style={{ position: 'relative' }} className="btn btn-ghost btn-icon">
              🛒
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Notifications */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNotif(p => !p)} style={{ position: 'relative' }}>
                🔔
                {unreadCount > 0 && <span className="notif-dot" />}
              </button>
              {showNotif && (
                <div className="card" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 320, zIndex: 200, maxHeight: 400, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Notifications</span>
                    {unreadCount > 0 && <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={markAllRead}>Mark all read</button>}
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No notifications yet</div>
                    ) : notifications.slice(0, 8).map(n => (
                      <div key={n._id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)', background: n.isRead ? 'transparent' : 'rgba(255,69,0,0.04)' }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={userRef}>
              <button
                onClick={() => setShowUserMenu(p => !p)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <div className="avatar avatar-sm" style={{ background: 'var(--primary)', color: '#fff' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0]}</span>
                <span style={{ fontSize: 10 }}>▼</span>
              </button>
              {showUserMenu && (
                <div className="card" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220, zIndex: 200, padding: 8 }}>
                  <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user?.email}</div>
                    <span className="badge badge-orange" style={{ marginTop: 6, fontSize: 11 }}>{user?.role?.replace('_', ' ')}</span>
                  </div>
                  {[
                    { to: getDashboardLink(), icon: '🏠', label: 'Dashboard' },
                    user?.role === 'customer' && { to: '/orders', icon: '📦', label: 'My Orders' },
                    user?.role === 'customer' && { to: '/wishlist', icon: '❤️', label: 'Wishlist' },
                    { to: '/profile', icon: '👤', label: 'Profile' },
                  ].filter(Boolean).map((item, i) => (
                    <Link key={i} to={item.to} onClick={() => setShowUserMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--text-primary)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                  <div className="divider" style={{ margin: '4px 0' }} />
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--error)', width: '100%', background: 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
