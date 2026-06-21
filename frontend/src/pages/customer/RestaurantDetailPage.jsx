import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurantAPI, reviewAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import MenuItemCard from '../../components/common/MenuItemCard';
import toast from 'react-hot-toast';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const { totalItems, subtotal } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  const categoryRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, reviewRes] = await Promise.all([
          restaurantAPI.getById(id),
          reviewAPI.getByRestaurant(id)
        ]);
        const { restaurant: r, menuItems: items, categories: cats } = restRes.data;
        setRestaurant(r);
        setMenuItems(items);
        setCategories(cats);
        setActiveCategory(cats[0] || '');
        setReviews(reviewRes.data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    categoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredItems = (cat) => menuItems.filter(i => i.category === cat && (!vegOnly || i.isVeg));

  if (loading) return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-xl)', marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 28, width: '40%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 18, width: '60%' }} />
      </div>
    </div>
  );

  if (!restaurant) return (
    <div className="empty-state" style={{ padding: 80 }}>
      <div className="empty-state-icon">🍽️</div>
      <h3>Restaurant not found</h3>
      <Link to="/restaurants" className="btn btn-primary">Browse Restaurants</Link>
    </div>
  );

  return (
    <div style={{ paddingBottom: totalItems > 0 ? 80 : 0 }}>
      {/* Cover */}
      <div style={{ position: 'relative', height: 260, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <img src={restaurant.coverImage || `https://picsum.photos/seed/${restaurant._id}/1200/280`} alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = `https://picsum.photos/seed/${restaurant.name}/1200/280`; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
        {!restaurant.isOpen && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 24 }}>Currently Closed</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="container" style={{ marginTop: -60, position: 'relative', zIndex: 1 }}>
        <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 72, height: 72, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg-secondary)', border: '3px solid var(--bg-card)', flexShrink: 0 }}>
              <img src={restaurant.logo || `https://picsum.photos/seed/${restaurant._id}logo/72/72`} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = `https://picsum.photos/seed/${restaurant.name}/72/72`; }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>{restaurant.name}</h1>
                {restaurant.isOpen ? <span className="badge badge-green">● Open</span> : <span className="badge badge-red">● Closed</span>}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{restaurant.cuisine?.join(', ')}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>📍 {restaurant.address?.city}</p>
              <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>★ {restaurant.rating?.toFixed(1) || '4.0'}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{restaurant.totalReviews || 0} reviews</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🕐 {restaurant.deliveryTime?.min}-{restaurant.deliveryTime?.max} mins</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🛵 {restaurant.deliveryFee === 0 ? 'Free delivery' : `₹${restaurant.deliveryFee} delivery`}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📦 Min ₹{restaurant.minOrder}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          {['menu', 'reviews', 'info'].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'menu' ? '🍽️ Menu' : t === 'reviews' ? '⭐ Reviews' : 'ℹ️ Info'}
            </button>
          ))}
        </div>

        {activeTab === 'menu' && (
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
            {/* Category nav */}
            <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + 16px)', alignSelf: 'flex-start', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <input type="checkbox" checked={vegOnly} onChange={e => setVegOnly(e.target.checked)} />
                  <span style={{ color: '#15803D' }}>🥬 Veg Only</span>
                </label>
              </div>
              {categories.map(cat => (
                <button key={cat} onClick={() => scrollToCategory(cat)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: activeCategory === cat ? 'rgba(255,69,0,0.1)' : 'transparent', color: activeCategory === cat ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeCategory === cat ? 600 : 400, border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 2, transition: 'var(--transition)' }}>
                  {cat} ({filteredItems(cat).length})
                </button>
              ))}
            </div>
            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {categories.map(cat => {
                const items = filteredItems(cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} ref={el => categoryRefs.current[cat] = el}>
                    <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid var(--border)' }}>{cat}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {items.map(item => <MenuItemCard key={item._id} item={item} restaurant={restaurant} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {reviews.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">💬</div><h3>No reviews yet</h3><p>Be the first to review!</p></div>
              ) : reviews.map(r => (
                <div key={r._id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <div className="avatar avatar-sm" style={{ background: 'var(--primary)', color: '#fff' }}>{r.user?.name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.user?.name}</div>
                      <div style={{ display: 'flex', gap: 2 }}>{[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 12, color: i < r.overallRating ? '#F59E0B' : 'var(--border)' }}>★</span>)}</div>
                    </div>
                    <span className={`badge ${r.sentiment === 'positive' ? 'badge-green' : r.sentiment === 'negative' ? 'badge-red' : 'badge-gray'}`} style={{ marginLeft: 'auto', fontSize: 11 }}>
                      {r.sentiment}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.comment}</p>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Restaurant Information</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              {[
                { label: '📍 Address', value: `${restaurant.address?.street}, ${restaurant.address?.city}, ${restaurant.address?.state} - ${restaurant.address?.pincode}` },
                { label: '📞 Phone', value: restaurant.phone },
                { label: '📧 Email', value: restaurant.email },
                { label: '🍽️ Cuisine', value: restaurant.cuisine?.join(', ') },
                { label: '⏱️ Prep Time', value: `${restaurant.preparationTime || 20} minutes` },
                { label: '📦 Min Order', value: `₹${restaurant.minOrder}` },
              ].map((info, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, minWidth: 140, color: 'var(--text-secondary)' }}>{info.label}</span>
                  <span style={{ fontSize: 14 }}>{info.value || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <div className="sticky-cart">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{totalItems}</span>
            <span style={{ fontWeight: 600 }}>items in cart</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>₹{subtotal}</span>
          <Link to="/cart" className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
            View Cart →
          </Link>
        </div>
      )}
    </div>
  );
}
