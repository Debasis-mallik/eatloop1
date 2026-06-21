import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI, menuAPI, restaurantAPI } from '../../services/api';
import RestaurantCard from '../../components/common/RestaurantCard';
import MenuItemCard from '../../components/common/MenuItemCard';
import toast from 'react-hot-toast';

// ─── ProfilePage ───────────────────────────────────────────────
export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: '32px 0', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', padding: '32px 28px', color: '#fff' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div className="avatar avatar-xl" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: 36, flexShrink: 0 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 24 }}>{user?.name}</h2>
                <p style={{ opacity: 0.85, marginTop: 4 }}>{user?.email}</p>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, marginTop: 8, display: 'inline-block' }}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ padding: '0 28px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 0 }}>
            {['profile', 'addresses', 'preferences', 'security'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent', transition: 'var(--transition)', textTransform: 'capitalize' }}>
                {tab}
              </button>
            ))}
          </div>

          <div style={{ padding: 28 }}>
            {activeTab === 'profile' && (
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Personal Information</h3>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Full Name</label>
                  <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Email</label>
                  <input className="input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Phone</label>
                  <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 xxxxx xxxxx" />
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Loyalty Points:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>🌟 {user?.loyaltyPoints || 0} pts</span>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? <><span className="spinner spinner-sm" /> Saving...</> : 'Save Changes'}
                </button>
              </form>
            )}

            {activeTab === 'addresses' && (
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Saved Addresses</h3>
                {user?.addresses?.length === 0 || !user?.addresses ? (
                  <div className="empty-state" style={{ padding: '30px 0' }}>
                    <div className="empty-state-icon">📍</div>
                    <h3>No saved addresses</h3>
                    <p>Add an address for faster checkout</p>
                  </div>
                ) : user.addresses.map((a, i) => (
                  <div key={i} className="card" style={{ padding: 16, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{a.label}</span>
                        {a.isDefault && <span className="badge badge-green" style={{ marginLeft: 8, fontSize: 11 }}>Default</span>}
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{a.street}, {a.city} - {a.pincode}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div style={{ maxWidth: 500 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Food Preferences</h3>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: 'block' }}>Diet Type</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {['all', 'veg', 'non-veg', 'vegan'].map(diet => (
                      <button key={diet} className="tag" style={user?.preferences?.dietType === diet ? { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(255,69,0,0.06)' } : {}}>
                        {diet === 'veg' ? '🥗' : diet === 'non-veg' ? '🍗' : diet === 'vegan' ? '🌱' : '🍽️'} {diet}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: 'block' }}>Favorite Cuisines</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Indian', 'Chinese', 'Italian', 'Mexican', 'Japanese', 'Thai'].map(c => (
                      <button key={c} className="tag" style={user?.preferences?.cuisines?.includes(c) ? { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(255,69,0,0.06)' } : {}}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div style={{ maxWidth: 500 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {['Current Password', 'New Password', 'Confirm New Password'].map((label, i) => (
                    <div key={i}>
                      <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>{label}</label>
                      <input className="input" type="password" placeholder="••••••••" />
                    </div>
                  ))}
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SearchPage ─────────────────────────────────────────────────
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ restaurants: [], menuItems: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    Promise.all([
      restaurantAPI.getAll({ search: query, limit: 8 }),
      menuAPI.search(query)
    ]).then(([rRes, mRes]) => {
      setResults({ restaurants: rRes.data.restaurants || [], menuItems: mRes.data.items || [] });
    }).catch(console.error).finally(() => setLoading(false));
  }, [query]);

  return (
    <div style={{ padding: '32px 0', minHeight: '100vh' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          Search results for <span style={{ color: 'var(--primary)' }}>"{query}"</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          {results.restaurants.length + results.menuItems.length} results found
        </p>

        <div className="tabs" style={{ maxWidth: 400, marginBottom: 28 }}>
          {['all', 'restaurants', 'dishes'].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>
              {t === 'restaurants' ? `🍽️ Restaurants (${results.restaurants.length})` : t === 'dishes' ? `🥘 Dishes (${results.menuItems.length})` : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <>
            {(activeTab === 'all' || activeTab === 'restaurants') && results.restaurants.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                {activeTab === 'all' && <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: 18 }}>🏪 Restaurants</h2>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                  {results.restaurants.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
                </div>
              </div>
            )}
            {(activeTab === 'all' || activeTab === 'dishes') && results.menuItems.length > 0 && (
              <div>
                {activeTab === 'all' && <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: 18 }}>🥘 Dishes</h2>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                  {results.menuItems.map(item => (
                    <MenuItemCard key={item._id} item={item} restaurant={item.restaurant} />
                  ))}
                </div>
              </div>
            )}
            {results.restaurants.length === 0 && results.menuItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try a different search term</p>
                <Link to="/restaurants" className="btn btn-primary">Browse All Restaurants</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── WishlistPage ────────────────────────────────────────────────
export function WishlistPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '32px 0', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>❤️ My Wishlist</h1>
        {!user?.wishlist || user.wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💔</div>
            <h3>Your wishlist is empty</h3>
            <p>Save your favorite dishes here</p>
            <Link to="/restaurants" className="btn btn-primary">Explore Food</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {user.wishlist.map(item => (
              <div key={item._id} className="card card-hover" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                <img src={item.image || `https://picsum.photos/seed/${item._id}/70/70`} alt={item.name}
                  style={{ width: 64, height: 64, borderRadius: 'var(--radius)', objectFit: 'cover' }}
                  onError={e => { e.target.src = `https://picsum.photos/seed/${item.name}/64/64`; }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>₹{item.discountedPrice || item.price}</div>
                </div>
                <button className="btn btn-ghost btn-icon" style={{ color: 'var(--error)' }}>❤️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
