import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--secondary)', color: '#CBD5E1', padding: '48px 0 24px', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
              <span style={{ color: 'var(--primary)' }}>EAT</span><span style={{ color: '#fff' }}>LOOP</span> 🍜
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#94A3B8' }}>
              Delivering happiness, one meal at a time. Fast, fresh, and always delicious.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {['📘', '🐦', '📸', '▶️'].map((icon, i) => (
                <button key={i} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16 }}>{icon}</button>
              ))}
            </div>
          </div>
          {[
            { title: 'Company', links: [{ to: '/', label: 'About Us' }, { to: '/', label: 'Careers' }, { to: '/', label: 'Blog' }, { to: '/', label: 'Press' }] },
            { title: 'For Partners', links: [{ to: '/register', label: 'Add Restaurant' }, { to: '/register', label: 'Delivery Partner' }, { to: '/', label: 'Advertising' }, { to: '/', label: 'API Access' }] },
            { title: 'Legal', links: [{ to: '/', label: 'Privacy Policy' }, { to: '/', label: 'Terms of Service' }, { to: '/', label: 'Cookie Policy' }, { to: '/', label: 'Contact Us' }] },
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ color: '#F1F5F9', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>{col.title}</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link, j) => (
                  <li key={j}><Link to={link.to} style={{ fontSize: 14, color: '#94A3B8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FF4500'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#64748B' }}>© 2024 EATLOOP. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>🍎 App Store</span>
            <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>🤖 Google Play</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
