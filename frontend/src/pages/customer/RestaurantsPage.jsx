import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantAPI } from '../../services/api';
import RestaurantCard from '../../components/common/RestaurantCard';

const CUISINES = ['Indian', 'Chinese', 'Italian', 'American', 'Mexican', 'Japanese', 'Thai', 'Pizza', 'Burgers', 'Biryani'];
const SORTS = [
  { value: 'rating', label: '⭐ Top Rated' },
  { value: 'delivery_time', label: '⚡ Fastest' },
  { value: 'price', label: '💰 Low Delivery Fee' },
];

export default function RestaurantsPage() {
  const [params, setParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    cuisine: params.get('cuisine') || '',
    sort: 'rating',
    rating: '',
    city: '',
  });

  const fetchRestaurants = async (pg = 1) => {
    setLoading(true);
    try {
      const { data } = await restaurantAPI.getAll({ ...filters, page: pg, limit: 12 });
      setRestaurants(pg === 1 ? data.restaurants : prev => [...prev, ...data.restaurants]);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); fetchRestaurants(1); }, [filters]);

  const loadMore = () => { const next = page + 1; setPage(next); fetchRestaurants(next); };

  const toggleCuisine = (c) => setFilters(p => ({ ...p, cuisine: p.cuisine === c ? '' : c }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 16 }}>🍕 All Restaurants</h1>
          {/* Cuisine chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {CUISINES.map(c => (
              <button key={c} onClick={() => toggleCuisine(c)} className="tag" style={{ ...(filters.cuisine === c ? { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(255,69,0,0.06)' } : {}) }}>
                {c}
              </button>
            ))}
          </div>
          {/* Sort & filters row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="input" value={filters.sort} onChange={e => setFilters(p => ({ ...p, sort: e.target.value }))} style={{ width: 'auto', padding: '8px 12px' }}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select className="input" value={filters.rating} onChange={e => setFilters(p => ({ ...p, rating: e.target.value }))} style={{ width: 'auto', padding: '8px 12px' }}>
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
            <input className="input" placeholder="Search by city..." value={filters.city} onChange={e => setFilters(p => ({ ...p, city: e.target.value }))} style={{ width: 200 }} />
            {(filters.cuisine || filters.city || filters.rating) && (
              <button onClick={() => setFilters({ cuisine: '', sort: 'rating', rating: '', city: '' })} className="btn btn-secondary btn-sm">
                ✕ Clear Filters
              </button>
            )}
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', marginLeft: 'auto' }}>{total} restaurants found</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container" style={{ padding: '32px 24px' }}>
        {loading && restaurants.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 180 }} />
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 13, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <h3>No restaurants found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {restaurants.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
            </div>
            {restaurants.length < total && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <button onClick={loadMore} className="btn btn-outline" disabled={loading}>
                  {loading ? <span className="spinner spinner-sm" /> : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
