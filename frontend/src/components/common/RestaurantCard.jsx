import { Link } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  const { _id, name, cuisine, rating, totalReviews, deliveryTime, deliveryFee, logo, coverImage, isOpen, isFeatured, address, tags } = restaurant;
  const img = coverImage || logo || `https://source.unsplash.com/400x250/?restaurant,food&sig=${_id}`;

  return (
    <Link to={`/restaurant/${_id}`} className="card card-hover animate-fade" style={{ display: 'block', overflow: 'hidden', textDecoration: 'none' }}>
      <div style={{ position: 'relative' }}>
        <img src={img} alt={name} style={{ width: '100%', height: 180, objectFit: 'cover' }}
          onError={e => { e.target.src = `https://picsum.photos/seed/${_id}/400/250`; }} />
        {!isOpen && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, background: 'rgba(0,0,0,0.5)', padding: '6px 16px', borderRadius: 20 }}>Closed</span>
          </div>
        )}
        {isFeatured && (
          <span style={{ position: 'absolute', top: 10, left: 10 }} className="badge badge-orange">⭐ Featured</span>
        )}
        {deliveryFee === 0 && (
          <span style={{ position: 'absolute', top: 10, right: 10 }} className="badge badge-green">Free Delivery</span>
        )}
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: rating >= 4 ? '#DCFCE7' : '#FFF7ED', padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>
            <span style={{ color: '#F59E0B', fontSize: 12 }}>★</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: rating >= 4 ? '#15803D' : '#EA580C' }}>{rating?.toFixed(1) || '4.0'}</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{cuisine?.join(' • ')}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              🕐 {deliveryTime?.min || 25}-{deliveryTime?.max || 40} mins
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {deliveryFee === 0 ? <span style={{ color: 'var(--success)' }}>Free delivery</span> : `₹${deliveryFee} delivery`}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{totalReviews || 0} reviews</span>
        </div>
        {tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
