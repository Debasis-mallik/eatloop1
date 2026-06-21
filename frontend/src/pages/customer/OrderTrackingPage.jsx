import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { io } from 'socket.io-client';

const STATUS_STEPS = [
  { key: 'pending', icon: '📋', label: 'Order Placed', desc: 'Your order has been received' },
  { key: 'confirmed', icon: '✅', label: 'Confirmed', desc: 'Restaurant confirmed your order' },
  { key: 'preparing', icon: '👨‍🍳', label: 'Preparing', desc: 'Your food is being prepared' },
  { key: 'ready', icon: '📦', label: 'Ready', desc: 'Food is packed and ready' },
  { key: 'picked_up', icon: '🛵', label: 'Picked Up', desc: 'Delivery partner picked up' },
  { key: 'out_for_delivery', icon: '🚀', label: 'On the Way', desc: 'Your food is on the way!' },
  { key: 'delivered', icon: '🎉', label: 'Delivered', desc: 'Enjoy your meal!' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState({ food: 0, delivery: 0, review: '' });
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderAPI.getById(id);
        setOrder(data.order);
        if (data.order.rating?.food) setRatingSubmitted(true);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrder();

    // Socket connection for real-time updates
    const socket = io('http://localhost:5000');
    socket.emit('join_order', id);
    socket.on('order_status_updated', ({ status }) => {
      setOrder(prev => prev ? { ...prev, status } : prev);
    });
    socket.on('location_updated', (data) => {
      console.log('Delivery location:', data);
    });
    return () => socket.disconnect();
  }, [id]);

  const submitRating = async () => {
    try {
      await orderAPI.rate(id, rating);
      setRatingSubmitted(true);
      setOrder(prev => ({ ...prev, rating }));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div style={{ padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: 700 }}>
        {[200, 100, 300].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 'var(--radius-lg)', marginBottom: 16 }} />)}
      </div>
    </div>
  );

  if (!order) return (
    <div className="empty-state" style={{ padding: 80 }}>
      <div className="empty-state-icon">📦</div>
      <h3>Order not found</h3>
      <Link to="/orders" className="btn btn-primary">My Orders</Link>
    </div>
  );

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  const statusColors = {
    pending: '#F59E0B', confirmed: '#3B82F6', preparing: '#8B5CF6',
    ready: '#06B6D4', picked_up: '#F97316', out_for_delivery: '#EF4444',
    delivered: '#22C55E', cancelled: '#94A3B8'
  };

  return (
    <div style={{ padding: '32px 0', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ maxWidth: 780 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Track Order</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>#{order.orderNumber}</p>
          </div>
          <Link to="/orders" className="btn btn-secondary btn-sm">← My Orders</Link>
        </div>

        {/* Status Banner */}
        <div style={{ background: isCancelled ? '#FEE2E2' : `linear-gradient(135deg, ${statusColors[order.status]}, ${statusColors[order.status]}99)`, borderRadius: 'var(--radius-xl)', padding: '24px 28px', marginBottom: 20, color: isCancelled ? '#DC2626' : '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 64, opacity: 0.3 }}>
            {STATUS_STEPS.find(s => s.key === order.status)?.icon || '📦'}
          </div>
          <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 4 }}>Current Status</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>
            {STATUS_STEPS.find(s => s.key === order.status)?.label || order.status}
          </div>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
            {STATUS_STEPS.find(s => s.key === order.status)?.desc}
          </div>
          {order.estimatedDeliveryTime && !isDelivered && !isCancelled && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
              🕐 Estimated: {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Timeline */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>📊 Order Timeline</h3>
            {isCancelled ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
                <div style={{ fontWeight: 700, color: 'var(--error)', fontSize: 18 }}>Order Cancelled</div>
                {order.cancellationReason && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>Reason: {order.cancellationReason}</div>}
              </div>
            ) : (
              <div className="status-timeline">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx < currentStepIdx;
                  const active = idx === currentStepIdx;
                  return (
                    <div key={step.key} className={`status-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                      <div className="status-icon">{done ? '✓' : step.icon}</div>
                      <div style={{ paddingTop: 4 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: active ? 'var(--primary)' : done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step.desc}</div>
                        {order.statusHistory?.find(h => h.status === step.key) && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(order.statusHistory.find(h => h.status === step.key).timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>🍽️ Order Items</h3>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{item.totalPrice}</span>
                </div>
              ))}
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{order.pricing?.total}</span>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>📍 Delivery Details</h3>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.deliveryAddress?.label}</div>
                <div>{order.deliveryAddress?.street}</div>
                <div>{order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}</div>
              </div>
              <div className="divider" />
              <div style={{ fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment: </span>
                <span style={{ fontWeight: 600 }}>{order.payment?.method?.toUpperCase()}</span>
                <span className={`badge ${order.payment?.status === 'completed' ? 'badge-green' : 'badge-orange'}`} style={{ marginLeft: 8, fontSize: 11 }}>
                  {order.payment?.status}
                </span>
              </div>
            </div>

            {/* Delivery Partner */}
            {order.deliveryPartner && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>🚴 Delivery Partner</h3>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="avatar avatar-md" style={{ background: 'var(--primary)', color: '#fff' }}>
                    {order.deliveryPartner?.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{order.deliveryPartner?.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.deliveryPartner?.phone}</div>
                  </div>
                  <a href={`tel:${order.deliveryPartner?.phone}`} className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>📞 Call</a>
                </div>
              </div>
            )}

            {/* Rating */}
            {isDelivered && !ratingSubmitted && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>⭐ Rate Your Order</h3>
                {[
                  { label: 'Food Quality', key: 'food' },
                  { label: 'Delivery', key: 'delivery' },
                ].map(({ label, key }) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRating(p => ({ ...p, [key]: star }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: star <= rating[key] ? '#F59E0B' : 'var(--border)', transition: 'var(--transition)' }}>
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <textarea className="input" placeholder="Share your experience..." value={rating.review}
                  onChange={e => setRating(p => ({ ...p, review: e.target.value }))} style={{ resize: 'vertical', minHeight: 70, marginBottom: 12 }} />
                <button onClick={submitRating} className="btn btn-primary w-full" disabled={!rating.food}>
                  Submit Rating
                </button>
              </div>
            )}

            {isDelivered && ratingSubmitted && (
              <div style={{ background: '#DCFCE7', borderRadius: 'var(--radius-lg)', padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🙏</div>
                <div style={{ fontWeight: 700, color: '#15803D' }}>Thanks for your feedback!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
