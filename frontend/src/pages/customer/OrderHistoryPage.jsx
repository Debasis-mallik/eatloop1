import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';

const STATUS_COLORS = {
  pending: 'badge-orange', confirmed: 'badge-blue', preparing: 'badge-blue',
  ready: 'badge-blue', picked_up: 'badge-blue', out_for_delivery: 'badge-orange',
  delivered: 'badge-green', cancelled: 'badge-red'
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (filter !== 'all') params.status = filter;
        const { data } = await orderAPI.getMyOrders(params);
        setOrders(data.orders || []);
        setTotal(data.total || 0);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [filter, page]);

  const filters = ['all', 'pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div style={{ padding: '32px 0', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 24 }}>📦 My Orders</h1>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {filters.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className="tag" style={filter === f ? { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(255,69,0,0.06)' } : {}}>
              {f === 'all' ? '📋 All' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
            <Link to="/restaurants" className="btn btn-primary">Order Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                      <img src={order.restaurant?.logo || `https://picsum.photos/seed/${order.restaurant?._id}/52/52`} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{order.restaurant?.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>#{order.orderNumber}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    {order.items?.slice(0, 3).map(i => `${i.name} ×${i.quantity}`).join(' · ')}
                    {order.items?.length > 3 && ` +${order.items.length - 3} more`}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>₹{order.pricing?.total}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.items?.reduce((s, i) => s + i.quantity, 0)} items</span>
                      <span className={`badge ${order.payment?.status === 'completed' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 11 }}>
                        {order.payment?.method?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button onClick={async () => {
                          if (window.confirm('Cancel this order?')) {
                            try {
                              await orderAPI.cancel(order._id, 'Customer requested');
                              setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: 'cancelled' } : o));
                            } catch (err) { alert(err.response?.data?.message || 'Cannot cancel'); }
                          }
                        }} className="btn btn-danger btn-sm">Cancel</button>
                      )}
                      <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                        {order.status === 'delivered' ? 'View Details' : 'Track Order'}
                      </Link>
                      {order.status === 'delivered' && (
                        <Link to={`/restaurant/${order.restaurant?._id}`} className="btn btn-primary btn-sm">Reorder</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {total > 10 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary btn-sm">← Prev</button>
                <span style={{ padding: '6px 12px', fontSize: 14 }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={orders.length < 10} className="btn btn-secondary btn-sm">Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
