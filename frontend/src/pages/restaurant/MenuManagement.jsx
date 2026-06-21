import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI, restaurantAPI, orderAPI, aiAPI } from '../../services/api';
import { RestaurantSidebar } from './RestaurantDashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const CATEGORIES = ['Starters', 'Main Course', 'Biryani', 'Desserts', 'Beverages', 'Pizza', 'Pasta', 'Burgers', 'Salads', 'Snacks'];

// ─── MenuManagement ─────────────────────────────────────────────
export function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', discountedPrice: '', category: 'Starters', isVeg: true, spiceLevel: 'medium', nutrition: { calories: '', protein: '', carbs: '', fat: '' } });
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const restRes = await restaurantAPI.getAnalytics();
        // Items fetched via restaurant owner route
        setLoading(false);
      } catch { setLoading(false); }
    };
    fetchItems();
    // Load items from current restaurant
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      // Get owner's restaurant first
      const analyticsRes = await restaurantAPI.getAnalytics();
      // Then get menu for that restaurant
      // Items are fetched via another endpoint in real flow
      setItems([]); // Placeholder - In real flow get restaurantId from analytics
    } catch { } finally { setLoading(false); }
  };

  const saveItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        const { data } = await menuAPI.update(editItem._id, form);
        setItems(prev => prev.map(i => i._id === editItem._id ? data.item : i));
        toast.success('Item updated!');
      } else {
        const { data } = await menuAPI.create(form);
        setItems(prev => [data.item, ...prev]);
        toast.success('Item added!');
      }
      setShowForm(false); setEditItem(null);
      setForm({ name: '', description: '', price: '', discountedPrice: '', category: 'Starters', isVeg: true, spiceLevel: 'medium', nutrition: { calories: '', protein: '', carbs: '', fat: '' } });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save item'); }
    finally { setSaving(false); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await menuAPI.delete(id);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Item deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const toggleAvailability = async (item) => {
    try {
      await menuAPI.update(item._id, { isAvailable: !item.isAvailable });
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i));
    } catch { toast.error('Failed to update availability'); }
  };

  const filtered = filterCategory ? items.filter(i => i.category === filterCategory) : items;

  return (
    <div className="sidebar-layout">
      <RestaurantSidebar active="/restaurant-dashboard/menu" />
      <main style={{ padding: '28px 32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>🍽️ Menu Management</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{items.length} items</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditItem(null); }} className="btn btn-primary">+ Add Item</button>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <button onClick={() => setFilterCategory('')} className="tag" style={!filterCategory ? { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(255,69,0,0.06)' } : {}}>All</button>
          {CATEGORIES.map(c => <button key={c} onClick={() => setFilterCategory(c)} className="tag" style={filterCategory === c ? { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(255,69,0,0.06)' } : {}}>{c}</button>)}
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <h3>No menu items yet</h3>
            <p>Add items to your menu to start receiving orders</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">Add First Item</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(item => (
              <div key={item._id} className="card" style={{ padding: 16, opacity: item.isAvailable ? 1 : 0.6 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`} style={{ marginTop: 3 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.category}</div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
                      ₹{item.discountedPrice || item.price}
                      {item.discountedPrice && <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>₹{item.price}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditItem(item); setForm({ ...item }); setShowForm(true); }} className="btn btn-ghost btn-icon" style={{ fontSize: 14 }}>✏️</button>
                    <button onClick={() => deleteItem(item._id)} className="btn btn-ghost btn-icon" style={{ fontSize: 14, color: 'var(--error)' }}>🗑️</button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📦 {item.totalOrders || 0} orders</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={item.isAvailable} onChange={() => toggleAvailability(item)} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ fontWeight: 800, fontSize: 18 }}>{editItem ? 'Edit Item' : 'Add Menu Item'}</h2>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-icon">✕</button>
              </div>
              <form onSubmit={saveItem} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Item Name *</label>
                    <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Description</label>
                    <textarea className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical', minHeight: 70 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Price (₹) *</label>
                    <input className="input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required min={1} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Discounted Price (₹)</label>
                    <input className="input" type="number" value={form.discountedPrice} onChange={e => setForm(p => ({ ...p, discountedPrice: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Category *</label>
                    <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Spice Level</label>
                    <select className="input" value={form.spiceLevel} onChange={e => setForm(p => ({ ...p, spiceLevel: e.target.value }))}>
                      {['mild', 'medium', 'hot', 'extra-hot'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.isVeg} onChange={e => setForm(p => ({ ...p, isVeg: e.target.checked }))} />
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#15803D' }}>🥗 Vegetarian</span>
                    </label>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Nutrition (per serving)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {['calories', 'protein', 'carbs', 'fat'].map(n => (
                        <div key={n}>
                          <label style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, display: 'block', textTransform: 'capitalize' }}>{n}</label>
                          <input className="input" type="number" value={form.nutrition?.[n] || ''} onChange={e => setForm(p => ({ ...p, nutrition: { ...p.nutrition, [n]: e.target.value } }))} placeholder={n === 'calories' ? 'kcal' : 'g'} style={{ padding: '8px 10px' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner spinner-sm" /> Saving...</> : editItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── RestaurantOrders ───────────────────────────────────────────
export function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const STATUS_FLOW = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'picked_up', picked_up: 'out_for_delivery', out_for_delivery: 'delivered' };
  const STATUS_LABELS = { pending: '⏳ Pending', confirmed: '✅ Confirmed', preparing: '👨‍🍳 Preparing', ready: '📦 Ready', picked_up: '🛵 Picked Up', out_for_delivery: '🚀 On the Way', delivered: '🎉 Delivered', cancelled: '❌ Cancelled' };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = filter !== 'all' ? { status: filter } : {};
        const { data } = await orderAPI.getRestaurantOrders(params);
        setOrders(data.orders || []);
      } catch { } finally { setLoading(false); }
    };
    fetchOrders();
  }, [filter]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  const filterOptions = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div className="sidebar-layout">
      <RestaurantSidebar active="/restaurant-dashboard/orders" />
      <main style={{ padding: '28px 32px', overflowY: 'auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>📦 Order Management</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {filterOptions.map(f => (
            <button key={f} onClick={() => setFilter(f)} className="tag" style={filter === f ? { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(255,69,0,0.06)' } : {}}>
              {f === 'all' ? 'All Orders' : STATUS_LABELS[f] || f}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📦</div><h3>No orders</h3></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.map(order => (
              <div key={order._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>#{order.orderNumber}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.customer?.name} • {order.customer?.phone}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>₹{order.pricing?.total}</div>
                    <span className={`badge ${order.status === 'delivered' ? 'badge-green' : order.status === 'cancelled' ? 'badge-red' : 'badge-orange'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {order.items?.map(i => `${i.name} ×${i.quantity}`).join(' • ')}
                </div>
                {order.specialInstructions && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 12 }}>📝 "{order.specialInstructions}"</div>
                )}
                {STATUS_FLOW[order.status] && (
                  <button onClick={() => updateStatus(order._id, STATUS_FLOW[order.status])} className="btn btn-primary btn-sm" disabled={updating === order._id}>
                    {updating === order._id ? <span className="spinner spinner-sm" /> : `Mark as ${STATUS_LABELS[STATUS_FLOW[order.status]]}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── RestaurantAnalytics ─────────────────────────────────────────
export function RestaurantAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([restaurantAPI.getAnalytics(), aiAPI.getDemandForecast()])
      .then(([aRes, fRes]) => { setAnalytics(aRes.data.analytics); setForecast(fRes.data.forecast); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="sidebar-layout">
      <RestaurantSidebar active="/restaurant-dashboard/analytics" />
      <main style={{ padding: '28px 32px', overflowY: 'auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>📊 Analytics & AI Insights</h1>
        {loading ? (
          <div style={{ display: 'grid', gap: 20 }}>{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 250, borderRadius: 'var(--radius-lg)' }} />)}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Revenue chart */}
            {analytics?.revenueByDay?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📈 Revenue (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `₹${v}`} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Demand forecast */}
            {forecast?.dailyPattern?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>🤖 AI Demand Forecast</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>Predicted order volume by day of week</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={forecast.dailyPattern}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {forecast.recommendations?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>💡 AI Recommendations</div>
                    {forecast.recommendations.map((rec, i) => (
                      <div key={i} style={{ padding: '8px 14px', background: 'rgba(255,69,0,0.05)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--primary)', marginBottom: 8, fontSize: 14 }}>
                        {rec}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Summary stats */}
            {analytics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { label: 'Total Orders', value: analytics.total?.orders || 0, icon: '📦' },
                  { label: 'Total Revenue', value: `₹${analytics.total?.revenue || 0}`, icon: '💰' },
                  { label: 'Avg Rating', value: `${analytics.rating?.toFixed(1) || 'N/A'} ★`, icon: '⭐' },
                ].map((s, i) => (
                  <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label" style={{ marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── RestaurantSetup ────────────────────────────────────────────
export function RestaurantSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', description: '', email: '', phone: '',
    cuisine: [],
    address: { street: '', city: '', state: 'Odisha', pincode: '' },
    deliveryTime: { min: 20, max: 40 },
    deliveryFee: 30, minOrder: 199, preparationTime: 20,
    logo: '', coverImage: ''
  });
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const CUISINE_OPTIONS = [
    'Indian', 'Chinese', 'Italian', 'Mexican',
    'Thai', 'Japanese', 'American', 'Biryani',
    'Pizza', 'Burgers', 'South Indian', 'Desserts'
  ];

  const toggleCuisine = (c) => setForm(p => ({
    ...p,
    cuisine: p.cuisine.includes(c)
      ? p.cuisine.filter(x => x !== c)
      : [...p.cuisine, c]
  }));

  const uploadImage = async (file, type) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('eatloop_token');
    const res = await fetch('/api/restaurants/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.imageUrl;
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show preview instantly
    setLogoPreview(URL.createObjectURL(file));
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, 'logo');
      setForm(p => ({ ...p, logo: url }));
      toast.success('Logo uploaded!');
    } catch (err) {
      toast.error('Logo upload failed: ' + err.message);
      setLogoPreview('');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setUploadingCover(true);
    try {
      const url = await uploadImage(file, 'cover');
      setForm(p => ({ ...p, coverImage: url }));
      toast.success('Cover photo uploaded!');
    } catch (err) {
      toast.error('Cover upload failed: ' + err.message);
      setCoverPreview('');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.cuisine.length === 0) {
      toast.error('Please select at least one cuisine');
      return;
    }
    setSaving(true);
    try {
      await restaurantAPI.create(form);
      toast.success('Restaurant registered! Pending admin approval.');
      navigate('/restaurant-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '40px 0', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>
            🍽️ Register Your Restaurant
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            Fill in the details to list your restaurant on EATLOOP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── Cover Photo ── */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: 'block' }}>
              🖼️ Cover Photo <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>(shown at top of restaurant page)</span>
            </label>
            <div
              onClick={() => document.getElementById('coverInput').click()}
              style={{
                width: '100%', height: 200,
                borderRadius: 'var(--radius-lg)',
                border: `2px dashed ${coverPreview ? 'var(--primary)' : 'var(--border)'}`,
                overflow: 'hidden', cursor: 'pointer',
                background: coverPreview ? 'transparent' : 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'var(--transition)'
              }}
            >
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview} alt="Cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <span style={{ color: '#fff', fontWeight: 700 }}>Click to change</span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  {uploadingCover ? (
                    <><div className="spinner" style={{ margin: '0 auto 10px' }} /><p>Uploading...</p></>
                  ) : (
                    <><div style={{ fontSize: 40, marginBottom: 8 }}>📷</div><p style={{ fontWeight: 600 }}>Click to upload cover photo</p><p style={{ fontSize: 12, marginTop: 4 }}>JPG, PNG, WEBP • Max 5MB</p></>
                  )}
                </div>
              )}
              {uploadingCover && coverPreview && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="spinner" style={{ borderTopColor: '#fff' }} />
                </div>
              )}
            </div>
            <input id="coverInput" type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
          </div>

          {/* ── Logo ── */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: 'block' }}>
              🏪 Restaurant Logo <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>(shown in cards and listings)</span>
            </label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div
                onClick={() => document.getElementById('logoInput').click()}
                style={{
                  width: 100, height: 100, borderRadius: 'var(--radius-lg)',
                  border: `2px dashed ${logoPreview ? 'var(--primary)' : 'var(--border)'}`,
                  overflow: 'hidden', cursor: 'pointer',
                  background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, position: 'relative'
                }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : uploadingLogo ? (
                  <div className="spinner spinner-sm" />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    <div style={{ fontSize: 24 }}>🏪</div>
                    <div>Logo</div>
                  </div>
                )}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Upload your restaurant logo</p>
                <p>Square image recommended</p>
                <p>Min 200×200px, Max 5MB</p>
                <button
                  type="button"
                  onClick={() => document.getElementById('logoInput').click()}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: 8 }}
                >
                  Choose File
                </button>
              </div>
            </div>
            <input id="logoInput" type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
          </div>

          <div className="divider" />

          {/* ── Basic Info ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Restaurant Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Spice Garden" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Description</label>
              <textarea
                className="input" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="What makes your restaurant special?"
                style={{ resize: 'vertical', minHeight: 80 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Phone *</label>
              <input className="input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
            </div>
          </div>

          {/* ── Cuisines ── */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'block' }}>
              Cuisines * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(select all that apply)</span>
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CUISINE_OPTIONS.map(c => (
                <button
                  key={c} type="button" onClick={() => toggleCuisine(c)}
                  className="tag"
                  style={form.cuisine.includes(c) ? {
                    borderColor: 'var(--primary)', color: 'var(--primary)',
                    background: 'rgba(255,69,0,0.08)', fontWeight: 600
                  } : {}}
                >
                  {form.cuisine.includes(c) ? '✓ ' : ''}{c}
                </button>
              ))}
            </div>
            {form.cuisine.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 6 }}>
                ✓ Selected: {form.cuisine.join(', ')}
              </p>
            )}
          </div>

          {/* ── Address ── */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'block' }}>📍 Address</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <input
                  className="input" value={form.address.street}
                  onChange={e => setForm(p => ({ ...p, address: { ...p.address, street: e.target.value } }))}
                  placeholder="Street Address *" required
                />
              </div>
              <input
                className="input" value={form.address.city}
                onChange={e => setForm(p => ({ ...p, address: { ...p.address, city: e.target.value } }))}
                placeholder="City *" required
              />
              <input
                className="input" value={form.address.pincode}
                onChange={e => setForm(p => ({ ...p, address: { ...p.address, pincode: e.target.value } }))}
                placeholder="Pincode"
              />
            </div>
          </div>

          {/* ── Delivery Settings ── */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'block' }}>🚴 Delivery Settings</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>Delivery Fee (₹)</label>
                <input className="input" type="number" value={form.deliveryFee} onChange={e => setForm(p => ({ ...p, deliveryFee: parseInt(e.target.value) || 0 }))} min={0} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>Min Order (₹)</label>
                <input className="input" type="number" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: parseInt(e.target.value) || 0 }))} min={0} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>Prep Time (min)</label>
                <input className="input" type="number" value={form.preparationTime} onChange={e => setForm(p => ({ ...p, preparationTime: parseInt(e.target.value) || 15 }))} min={5} />
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={saving || uploadingLogo || uploadingCover}
          >
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner spinner-sm" /> Submitting...
              </span>
            ) : uploadingLogo || uploadingCover ? (
              '⏳ Please wait for images to finish uploading...'
            ) : (
              '🚀 Submit Restaurant for Approval'
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Your restaurant will be reviewed and approved within 24 hours
          </p>
        </form>
      </div>
    </div>
  );
}
export default MenuManagement;
