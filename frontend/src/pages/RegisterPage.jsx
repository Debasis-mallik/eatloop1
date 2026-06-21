import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'customer'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      toast.success(`Welcome to EATLOOP, ${data.user.name.split(' ')[0]}! 🎉`);
      const redirect = {
        restaurant_owner: '/restaurant-setup',
        delivery_partner: '/delivery-dashboard',
        customer: '/'
      };
      navigate(redirect[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'customer', label: '🛒', name: 'Customer', desc: 'Order food' },
    { value: 'restaurant_owner', label: '🍽️', name: 'Restaurant', desc: 'List your restaurant' },
    { value: 'delivery_partner', label: '🚴', name: 'Delivery', desc: 'Earn by delivering' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>
              <span style={{ color: 'var(--primary)' }}>EAT</span>
              <span style={{ color: 'var(--text-primary)' }}>LOOP</span> 🍜
            </Link>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 16, marginBottom: 4 }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Join thousands of food lovers</p>
          </div>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
            {roles.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: r.value }))}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius)',
                  border: `2px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                  background: form.role === r.value ? 'rgba(255,69,0,0.06)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 2 }}>{r.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: form.role === r.value ? 'var(--primary)' : 'var(--text-primary)' }}>{r.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Full Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Phone</label>
              <input className="input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="10-digit mobile number" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Password *</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ padding: '13px', fontSize: 15, marginTop: 4 }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner spinner-sm" /> Creating account...
                </span>
              ) : 'Create Account 🎉'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}