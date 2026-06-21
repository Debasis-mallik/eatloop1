import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function doLogin() {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      alert('Login success! Welcome ' + data.user.name);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'restaurant_owner') navigate('/restaurant-dashboard');
      else if (data.user.role === 'delivery_partner') navigate('/delivery-dashboard');
      else navigate('/');
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.message || err.message || 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 16, width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        
        <h1 style={{ textAlign: 'center', marginBottom: 8, color: '#FF4500' }}>EATLOOP 🍜</h1>
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: 20 }}>Sign In</h2>

        {/* Demo buttons */}
        <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Click to fill demo credentials:</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => { setEmail('aman@eatloop.com'); setPassword('password123'); }}
            style={{ flex: 1, padding: '8px 4px', background: '#fff3f0', border: '1px solid #FF4500', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#FF4500', fontWeight: 600 }}
          >
            🛒 Customer
          </button>
          <button
            type="button"
            onClick={() => { setEmail('raj@eatloop.com'); setPassword('password123'); }}
            style={{ flex: 1, padding: '8px 4px', background: '#fff3f0', border: '1px solid #FF4500', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#FF4500', fontWeight: 600 }}
          >
            🍽️ Restaurant
          </button>
          <button
            type="button"
            onClick={() => { setEmail('admin@eatloop.com'); setPassword('admin123'); }}
            style={{ flex: 1, padding: '8px 4px', background: '#fff3f0', border: '1px solid #FF4500', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#FF4500', fontWeight: 600 }}
          >
            🛡️ Admin
          </button>
        </div>

        {/* Email input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>

        {/* Password input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>

        {/* Show what will be submitted */}
        {email ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 13 }}>
            ✅ Will login as: <strong>{email}</strong>
          </div>
        ) : null}

        {/* Login button */}
        <button
          type="button"
          onClick={doLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', background: loading ? '#ccc' : '#FF4500',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 16,
            fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#FF4500', fontWeight: 600 }}>Register</Link>
        </p>

      </div>
    </div>
  );
}