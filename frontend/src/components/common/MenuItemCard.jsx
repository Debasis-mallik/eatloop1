import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function MenuItemCard({ item, restaurant }) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const cartItem = items.find(i => i._id === item._id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    addItem(item, restaurant);
  };

  const spiceColors = { mild: '#22C55E', medium: '#F59E0B', hot: '#EF4444', 'extra-hot': '#7F1D1D' };
  const discount = item.price && item.discountedPrice ? Math.round((1 - item.discountedPrice / item.price) * 100) : 0;

  return (
    <div className="card" style={{ display: 'flex', gap: 12, padding: 12, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`} />
          <h4 style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }} className="truncate">{item.name}</h4>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
            ₹{item.discountedPrice || item.price}
          </span>
          {discount > 0 && (
            <>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{item.price}</span>
              <span className="badge badge-green" style={{ fontSize: 10 }}>{discount}% off</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
          {item.spiceLevel && item.spiceLevel !== 'mild' && (
            <span style={{ fontSize: 11, color: spiceColors[item.spiceLevel], fontWeight: 600 }}>🌶️ {item.spiceLevel}</span>
          )}
          {item.nutrition?.calories && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥 {item.nutrition.calories} kcal</span>
          )}
          {item.rating > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>★ {item.rating.toFixed(1)}</span>}
        </div>
        {item.tags?.includes('bestseller') && <span className="badge badge-orange" style={{ fontSize: 10, marginTop: 6 }}>🏆 Bestseller</span>}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 100, height: 90, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
          <img src={item.image || `https://picsum.photos/seed/${item._id}/100/90`} alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.src = `https://picsum.photos/seed/${item.name}/100/90`; }} />
        </div>
        {qty === 0 ? (
          <button onClick={handleAdd} className="btn btn-outline btn-sm" style={{ width: 100, fontSize: 13, fontWeight: 700 }}>
            + Add
          </button>
        ) : (
          <div className="qty-ctrl" style={{ width: 100, justifyContent: 'center' }}>
            <button className="qty-btn" onClick={() => qty === 1 ? removeItem(item._id) : updateQuantity(item._id, qty - 1)}>−</button>
            <span className="qty-num">{qty}</span>
            <button className="qty-btn" onClick={() => updateQuantity(item._id, qty + 1)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}
