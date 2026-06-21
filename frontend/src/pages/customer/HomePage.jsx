import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { restaurantAPI, aiAPI, couponAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RestaurantCard from '../../components/common/RestaurantCard';

const CUISINES = [
  { emoji: '🍕', name: 'Pizza' }, { emoji: '🍔', name: 'Burgers' }, { emoji: '🍱', name: 'Biryani' },
  { emoji: '🥗', name: 'Healthy' }, { emoji: '🍜', name: 'Chinese' }, { emoji: '🌮', name: 'Mexican' },
  { emoji: '🍣', name: 'Sushi' }, { emoji: '🥞', name: 'Breakfast' }, { emoji: '🍰', name: 'Desserts' },
  { emoji: '🥤', name: 'Beverages' }
];

const BANNERS = [
  { bg: 'linear-gradient(135deg, #FF4500, #FF8C42)', emoji: '🔥', title: '50% OFF', sub: 'on your first order', code: 'WELCOME50' },
  { bg: 'linear-gradient(135deg, #7C3AED, #A855F7)', emoji: '🌙', title: 'Late Night Deals', sub: 'Order after 10 PM & save', code: 'NIGHT20' },
  { bg: 'linear-gradient(135deg, #0EA5E9, #38BDF8)', emoji: '⚡', title: 'Express Delivery', sub: 'Under 30 mins guaranteed', code: '' },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCuisine, setActiveCuisine] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, couponRes] = await Promise.all([
          restaurantAPI.getAll({ limit: 8, sort: 'rating' }),
          isAuthenticated ? couponAPI.getAll() : Promise.resolve({ data: { coupons: [] } })
        ]);
        setRestaurants(restRes.data.restaurants || []);
        setCoupons(couponRes.data.coupons || []);

        if (isAuthenticated) {
          const aiRes = await aiAPI.getRecommendations();
          setRecommendations(aiRes.data.recommendations || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    const t = setInterval(() => setActiveBanner(b => (b + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  const handleCuisineFilter = (name) => {
    const next = activeCuisine === name ? null : name;
    setActiveCuisine(next);
    if (next) navigate(`/restaurants?cuisine=${name}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,69,0,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 20, border: '1px solid rgba(255,69,0,0.3)' }}>
                <span style={{ fontSize: 12, color: '#FF8C42', fontWeight: 600 }}>⚡ Fast Delivery • Fresh Food • Best Prices</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
                Hungry? <br />
                <span style={{ color: 'var(--primary)' }}>Order now,</span><br />
                eat in minutes 🍜
              </h1>
              <p style={{ fontSize: 18, color: '#CBD5E1', marginBottom: 32, lineHeight: 1.6 }}>
                Discover the best food & drinks from restaurants near you. Delivered hot & fresh to your door.
              </p>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, maxWidth: 480, background: '#fff', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="🔍  Search dishes, restaurants..."
                  style={{ flex: 1, padding: '16px 20px', border: 'none', outline: 'none', fontSize: 15, color: '#0F172A', background: 'transparent' }}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 0, padding: '0 24px', fontSize: 15 }}>
                  Search
                </button>
              </form>
              <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
                {[{ num: '500+', label: 'Restaurants' }, { num: '50K+', label: 'Happy Customers' }, { num: '30min', label: 'Avg. Delivery' }].map((stat, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{stat.num}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Banner carousel */}
              {BANNERS.map((b, i) => (
                <div key={i} onClick={() => setActiveBanner(i)} style={{
                  background: b.bg, borderRadius: 'var(--radius-xl)', padding: '24px 28px',
                  cursor: 'pointer', transition: 'all 0.4s ease',
                  opacity: activeBanner === i ? 1 : 0.6, transform: activeBanner === i ? 'scale(1.02)' : 'scale(0.98)',
                  boxShadow: activeBanner === i ? '0 8px 32px rgba(0,0,0,0.3)' : 'none'
                }}>
                  <div style={{ fontSize: 36, marginBottom: 6 }}>{b.emoji}</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>{b.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{b.sub}</div>
                  {b.code && <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '4px 12px', borderRadius: 6, color: '#fff', fontWeight: 700, fontSize: 13 }}>{b.code}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cuisines */}
      <section style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {CUISINES.map((c) => (
              <button key={c.name} onClick={() => handleCuisineFilter(c.name)}
                style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 18px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'var(--transition)',
                  background: activeCuisine === c.name ? 'rgba(255,69,0,0.1)' : 'var(--bg-secondary)',
                  border: activeCuisine === c.name ? '2px solid var(--primary)' : '2px solid transparent',
                }}>
                <span style={{ fontSize: 28 }}>{c.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: activeCuisine === c.name ? 'var(--primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Coupons */}
      {coupons.length > 0 && (
        <section style={{ padding: '32px 0', background: 'var(--bg-secondary)' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🎟️ Available Offers</h2>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {coupons.map(c => (
                <div key={c._id} style={{ flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', borderRadius: 'var(--radius-lg)', padding: '16px 20px', color: '#fff', minWidth: 220 }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{c.code}</div>
                  <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>{c.description}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Min order ₹{c.minOrderAmount}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI Recommendations */}
      {isAuthenticated && recommendations.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 className="section-title">🤖 Recommended for You</h2>
                <p className="section-subtitle">Based on your order history</p>
              </div>
              <Link to="/restaurants" className="btn btn-outline btn-sm">View All</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {recommendations.slice(0, 4).map(item => (
                <Link key={item._id} to={`/restaurant/${item.restaurant?._id}`} className="card card-hover" style={{ display: 'flex', gap: 12, padding: 14, textDecoration: 'none' }}>
                  <img src={item.image || `https://picsum.photos/seed/${item._id}/80/80`} alt={item.name}
                    style={{ width: 72, height: 72, borderRadius: 'var(--radius)', objectFit: 'cover' }}
                    onError={e => { e.target.src = `https://picsum.photos/seed/${item.name}/80/80`; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }} className="truncate">{item.name}</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }} className="truncate">{item.restaurant?.name}</p>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{item.discountedPrice || item.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Restaurants */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 className="section-title">🏆 Top Restaurants</h2>
              <p className="section-subtitle">Highest rated near you</p>
            </div>
            <Link to="/restaurants" className="btn btn-outline btn-sm">View All →</Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card" style={{ overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 180 }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <h3>No restaurants yet</h3>
              <p>Restaurants will appear here once approved</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {restaurants.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container text-center">
          <h2 className="section-title">How EATLOOP Works</h2>
          <p className="section-subtitle">Get your food in 3 simple steps</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginTop: 8 }}>
            {[
              { emoji: '📍', step: '01', title: 'Choose Location', desc: 'Tell us where you are and we show nearby restaurants' },
              { emoji: '🍽️', step: '02', title: 'Select Your Food', desc: 'Browse menus, add to cart, apply coupons' },
              { emoji: '🚀', step: '03', title: 'Fast Delivery', desc: 'Track your order in real-time as it comes to you' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 28, borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{s.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>STEP {s.step}</div>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', padding: '60px 0', color: '#fff', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Ready to Eat? 🍜</h2>
            <p style={{ fontSize: 18, marginBottom: 32, opacity: 0.9 }}>Sign up now and get 50% off your first order!</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link to="/register" className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700, padding: '14px 32px', fontSize: 16 }}>Get Started Free</Link>
              <Link to="/restaurants" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', padding: '14px 32px', fontSize: 16 }}>Browse Restaurants</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
