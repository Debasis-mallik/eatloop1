import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deliveryAPI, orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ vehicleType: 'motorcycle', vehicleNumber: '', drivingLicense: '' });
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await deliveryAPI.getProfile();
        setPartner(data.partner);
      } catch (err) {
        if (err.response?.status === 404) setRegistering(true);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const toggleOnline = async () => {
    setTogglingOnline(true);
    try {
      const { data } = await deliveryAPI.toggleOnline();
      setPartner(prev => ({ ...prev, isOnline: data.isOnline }));
      toast.success(data.isOnline ? '🟢 You are now Online!' : '🔴 You are now Offline');
    } catch { toast.error('Failed to update status'); }
    finally { setTogglingOnline(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      await deliveryAPI.register(regForm);
      toast.success('Registered! Pending admin approval.');
      setRegistering(false);
      const { data } = await deliveryAPI.getProfile();
      setPartner(data.partner);
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setRegLoading(false); }
  };

  const updateLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await deliveryAPI.updateLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success('Location updated!');
      } catch { toast.error('Failed to update location'); }
    }, () => toast.error('Location access denied'));
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (registering) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🚴</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Become a Delivery Partner</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Earn money by delivering food to customers</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[{ icon: '💰', title: '₹15-25', sub: 'Per delivery' }, { icon: '⏰', title: 'Flexible', sub: 'Work hours' }, { icon: '📈', title: 'Bonuses', sub: 'Peak hours' }].map((b, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '14px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: 28 }}>{b.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.sub}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Vehicle Type</label>
              <select className="input" value={regForm.vehicleType} onChange={e => setRegForm(p => ({ ...p, vehicleType: e.target.value }))}>
                {['bicycle', 'motorcycle', 'scooter', 'car'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Vehicle Number *</label>
              <input className="input" value={regForm.vehicleNumber} onChange={e => setRegForm(p => ({ ...p, vehicleNumber: e.target.value }))} placeholder="OD-05-AB-1234" required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Driving License Number *</label>
              <input className="input" value={regForm.drivingLicense} onChange={e => setRegForm(p => ({ ...p, drivingLicense: e.target.value }))} placeholder="OD0520XX000XXXXX" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={regLoading}>
              {regLoading ? <><span className="spinner spinner-sm" /> Registering...</> : '🚀 Register as Delivery Partner'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>Your account will be reviewed and approved within 24 hours.</p>
          <button onClick={() => { logout(); navigate('/'); }} className="btn btn-ghost w-full" style={{ marginTop: 8 }}>← Back to site</button>
        </div>
      </div>
    </div>
  );

  const earnings = partner?.earnings || [];
  const totalToday = earnings.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).reduce((s, e) => s + e.amount, 0);
  const totalWeek = earnings.filter(e => new Date(e.date) > new Date(Date.now() - 7 * 86400000)).reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div style={{ background: partner?.isOnline ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'var(--secondary)', color: '#fff', padding: '20px 24px', transition: 'background 0.5s' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="avatar avatar-lg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 24 }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{user?.name}</div>
                <div style={{ opacity: 0.8, fontSize: 14 }}>
                  {partner?.isOnline ? '🟢 Online — Ready to deliver' : '🔴 Offline'}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                  {partner?.vehicleType && `🚴 ${partner.vehicleType} • ${partner.vehicleNumber}`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={updateLocation} className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 13 }}>
                📍 Update Location
              </button>
              <button onClick={toggleOnline} disabled={togglingOnline} className="btn" style={{ background: '#fff', color: partner?.isOnline ? '#DC2626' : '#16A34A', fontWeight: 700 }}>
                {togglingOnline ? <span className="spinner spinner-sm" style={{ borderTopColor: 'var(--primary)' }} /> : partner?.isOnline ? '🔴 Go Offline' : '🟢 Go Online'}
              </button>
              <button onClick={() => { logout(); navigate('/'); }} className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 24px' }}>
        {/* Status alert if pending */}
        {partner?.status === 'pending' && (
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 22 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: '#EA580C' }}>Account Pending Approval</div>
              <div style={{ fontSize: 13, color: '#C2410C' }}>Your account is under review. You'll be notified once approved.</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: "Today's Earnings", value: `₹${totalToday}`, icon: '💰', color: '#16A34A', bg: '#F0FDF4' },
            { label: "This Week", value: `₹${totalWeek}`, icon: '📅', color: '#2563EB', bg: '#EFF6FF' },
            { label: "Total Earnings", value: `₹${partner?.totalEarnings || 0}`, icon: '🏦', color: '#7C3AED', bg: '#F3E8FF' },
            { label: "Total Deliveries", value: partner?.totalDeliveries || 0, icon: '📦', color: '#EA580C', bg: '#FFF7ED' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color, marginTop: 6, fontSize: 22 }}>{s.value}</div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          {/* Active / Completed orders */}
          <div>
            <div className="tabs" style={{ marginBottom: 20 }}>
              {[{ key: 'active', label: '🔥 Active Orders' }, { key: 'history', label: '📋 History' }].map(t => (
                <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
              ))}
            </div>

            {activeTab === 'active' ? (
              <div>
                {!partner?.currentOrder ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">{partner?.isOnline ? '🔍' : '😴'}</div>
                    <h3>{partner?.isOnline ? 'Looking for orders...' : 'You\'re offline'}</h3>
                    <p>{partner?.isOnline ? 'New orders will appear here automatically' : 'Go online to start receiving delivery requests'}</p>
                    {!partner?.isOnline && (
                      <button onClick={toggleOnline} className="btn btn-primary">Go Online</button>
                    )}
                  </div>
                ) : (
                  <div className="card" style={{ padding: 24, border: '2px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>Active Delivery</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>#{partner.currentOrder?.orderNumber}</div>
                      </div>
                      <span className="badge badge-orange animate-pulse">🔴 Live</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                      {[
                        { icon: '🍽️', label: 'Pickup', value: partner.currentOrder?.restaurant?.name },
                        { icon: '📍', label: 'Deliver to', value: partner.currentOrder?.deliveryAddress?.street },
                        { icon: '💰', label: 'Earnings', value: '₹35 + tip' },
                        { icon: '📦', label: 'Items', value: `${partner.currentOrder?.items?.length || 0} items` },
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                          <span style={{ fontSize: 20 }}>{row.icon}</span>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{row.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-primary w-full btn-lg" onClick={() => toast.success('Delivery marked as complete!')}>
                      ✅ Mark as Delivered
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {earnings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>No deliveries yet</h3>
                    <p>Your completed deliveries will appear here</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {earnings.slice().reverse().slice(0, 10).map((e, i) => (
                      <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{e.type || 'Delivery'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(e.date).toLocaleString()}</div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--success)' }}>+₹{e.amount}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile & Rating */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>⭐ My Ratings</h3>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--primary)' }}>{partner?.rating?.toFixed(1) || '5.0'}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(partner?.rating || 5) ? '#F59E0B' : 'var(--border)', fontSize: 18 }}>★</span>)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{partner?.totalRatings || 0} ratings</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                {[
                  { label: 'Acceptance Rate', value: '94%', color: 'var(--success)' },
                  { label: 'On-Time Delivery', value: '89%', color: 'var(--info)' },
                  { label: 'Customer Rating', value: `${partner?.rating?.toFixed(1) || '5.0'}/5`, color: '#F59E0B' },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
                    <span style={{ fontWeight: 700, color: m.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 16 }}>💡 Quick Tips</h3>
              {[
                '🟢 Stay online during peak hours (12-2PM, 7-9PM) for more orders',
                '⭐ Maintain 4.5+ rating for bonus rewards',
                '📍 Keep location updated for accurate assignments',
                '🎯 Complete 50 deliveries/week for milestone bonus',
              ].map((tip, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none', lineHeight: 1.5 }}>
                  {tip}
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 16 }}>📱 Vehicle Details</h3>
              {[
                { label: 'Type', value: partner?.vehicleType },
                { label: 'Number', value: partner?.vehicleNumber },
                { label: 'License', value: partner?.drivingLicense },
                { label: 'Status', value: partner?.status },
              ].map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{d.value || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
