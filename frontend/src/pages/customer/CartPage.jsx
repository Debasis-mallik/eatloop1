import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, couponAPI } from '../../services/api';
import toast from 'react-hot-toast';

export function CartPage() {
  const { items, restaurantName, restaurantId, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const deliveryFee = subtotal > 499 ? 0 : 30;
  const tax = Math.round(subtotal * 0.05);
  const discount = couponData?.discount || 0;
  const total = subtotal + deliveryFee + tax - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponAPI.validate({ code: couponCode, orderAmount: subtotal });
      setCouponData(data);
      toast.success(`Coupon applied! You save ₹${data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add items from a restaurant to get started</p>
        <Link to="/restaurants" className="btn btn-primary">Browse Restaurants</Link>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px 0', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>🛒 Your Cart</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' }}>
          {/* Items */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 700 }}>🍽️ {restaurantName}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{totalItems} items</p>
              </div>
              <button onClick={() => { if (window.confirm('Clear cart?')) clearCart(); }} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>🗑️ Clear</button>
            </div>
            {items.map(item => (
              <div key={item._id} style={{ display: 'flex', gap: 14, padding: '16px 20px', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
                <div className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`} />
                <img src={item.image || `https://picsum.photos/seed/${item._id}/60/60`} alt={item.name}
                  style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  onError={e => { e.target.src = `https://picsum.photos/seed/${item.name}/60/60`; }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>₹{item.discountedPrice || item.price} each</div>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, minWidth: 60, textAlign: 'right' }}>₹{(item.discountedPrice || item.price) * item.quantity}</div>
                <button onClick={() => removeItem(item._id)} className="btn btn-ghost btn-icon" style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>
            ))}
            <div style={{ padding: '16px 20px' }}>
              <Link to={`/restaurant/${restaurantId}`} className="btn btn-outline btn-sm">+ Add More Items</Link>
            </div>
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Coupon */}
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>🎟️ Apply Coupon</h3>
              {couponData ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#DCFCE7', borderRadius: 'var(--radius)', border: '1px solid #BBF7D0' }}>
                  <span style={{ fontWeight: 700, color: '#15803D' }}>✓ {couponData.coupon?.code}</span>
                  <span style={{ color: '#15803D', fontWeight: 600 }}>-₹{couponData.discount}</span>
                  <button onClick={() => { setCouponData(null); setCouponCode(''); }} style={{ background: 'none', border: 'none', color: '#15803D', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" style={{ flex: 1 }} onKeyPress={e => e.key === 'Enter' && applyCoupon()} />
                  <button className="btn btn-primary btn-sm" onClick={applyCoupon} disabled={couponLoading}>
                    {couponLoading ? <span className="spinner spinner-sm" /> : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Bill */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🧾 Bill Details</h3>
              {[
                { label: 'Item Total', value: `₹${subtotal}` },
                { label: 'Delivery Fee', value: deliveryFee === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `₹${deliveryFee}` },
                { label: 'Taxes & Charges', value: `₹${tax}` },
                ...(discount > 0 ? [{ label: '🎟️ Coupon Discount', value: <span style={{ color: 'var(--success)' }}>-₹{discount}</span> }] : []),
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span>{row.label}</span><span>{row.value}</span>
                </div>
              ))}
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17 }}>
                <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{total}</span>
              </div>
              {subtotal < 499 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Add ₹{499 - subtotal} more for free delivery!</div>
              )}
            </div>

            <button onClick={() => navigate('/checkout', { state: { coupon: couponData, pricing: { subtotal, deliveryFee, tax, discount, total } } })}
              className="btn btn-primary w-full btn-lg">
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const { items, restaurantId, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ label: 'Home', street: '', city: '', state: 'Odisha', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (!address.street || !address.city) { toast.error('Please enter delivery address'); return; }
    setLoading(true);
    try {
      const orderData = {
        restaurantId,
        items: items.map(i => ({ menuItemId: i._id, quantity: i.quantity, customizations: [] })),
        deliveryAddress: address,
        paymentMethod,
        specialInstructions,
      };
      const { data } = await orderAPI.place(orderData);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 0', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>📦 Checkout</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Delivery Address */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📍 Delivery Address</h3>
              {user?.addresses?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {user.addresses.map((a, i) => (
                    <button key={i} onClick={() => setAddress(a)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: 12, borderRadius: 'var(--radius)', border: `2px solid ${JSON.stringify(address) === JSON.stringify(a) ? 'var(--primary)' : 'var(--border)'}`, background: 'transparent', marginBottom: 8, cursor: 'pointer' }}>
                      <div style={{ fontWeight: 600 }}>{a.label} - {a.street}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.city}, {a.pincode}</div>
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Street Address *</label>
                  <input className="input" value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} placeholder="Flat/House no, Street, Area" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>City *</label>
                  <input className="input" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} placeholder="City" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Pincode</label>
                  <input className="input" value={address.pincode} onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))} placeholder="6-digit pincode" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>💳 Payment Method</h3>
              {[
                { value: 'cod', icon: '💵', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                { value: 'stripe', icon: '💳', label: 'Credit/Debit Card', desc: 'Secure payment via Stripe' },
                { value: 'razorpay', icon: '📱', label: 'UPI / Razorpay', desc: 'Pay via UPI, Net Banking' },
                { value: 'wallet', icon: '👛', label: 'EATLOOP Wallet', desc: 'Use your wallet balance' },
              ].map(p => (
                <label key={p.value} style={{ display: 'flex', gap: 14, padding: '12px 14px', borderRadius: 'var(--radius)', border: `2px solid ${paymentMethod === p.value ? 'var(--primary)' : 'var(--border)'}`, marginBottom: 8, cursor: 'pointer', transition: 'var(--transition)', background: paymentMethod === p.value ? 'rgba(255,69,0,0.04)' : 'transparent' }}>
                  <input type="radio" name="payment" value={p.value} checked={paymentMethod === p.value} onChange={e => setPaymentMethod(e.target.value)} style={{ marginTop: 2 }} />
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Special Instructions */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📝 Special Instructions</h3>
              <textarea className="input" value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
                placeholder="Any special instructions for the restaurant or delivery partner..."
                style={{ resize: 'vertical', minHeight: 80 }} />
            </div>
          </div>

          {/* Order Summary */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🧾 Order Summary</h3>
            {items.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>₹{(item.discountedPrice || item.price) * item.quantity}</span>
              </div>
            ))}
            <div className="divider" />
            <button onClick={placeOrder} className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Placing Order...</> : `Place Order`}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>By placing, you agree to our Terms & Conditions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
