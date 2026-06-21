import { useState, useEffect, useRef } from 'react';
import { aiAPI, couponAPI } from '../../services/api';
import toast from 'react-hot-toast';

const QUICK_REPLIES = [
  'What should I order today?', 'Show me veg options', 'I want something spicy 🌶️',
  'Healthy meal suggestions', 'What\'s popular right now?', 'Budget-friendly meals'
];

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m your EATLOOP AI Assistant 🤖. I can help you find food, check nutrition info, analyze reviews, and much more. What would you like today?' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [sentimentText, setSentimentText] = useState('');
  const [sentimentResult, setSentimentResult] = useState(null);
  const [analyzingsentiment, setAnalyzingSentiment] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const getBotResponse = async (userMsg) => {
    const msg = userMsg.toLowerCase();
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    if (msg.includes('spicy') || msg.includes('hot')) {
      return 'Great choice! 🌶️ I recommend **Chicken Tikka** from Spice Garden or **Pasta Arrabiata** from Pizza Palace. Both are highly rated for their spice levels!';
    } else if (msg.includes('veg') || msg.includes('vegetarian')) {
      return '🥗 For veg options, check out **Paneer Butter Masala** at Spice Garden (rated 4.3★), **Margherita Pizza** at Pizza Palace (4.5★), or **Dal Tadka** which is healthy and delicious!';
    } else if (msg.includes('healthy') || msg.includes('diet') || msg.includes('calorie')) {
      return '💪 For healthy choices, I suggest **Dal Tadka** (290 kcal, high fiber) or **Chicken Tikka** (310 kcal, 38g protein). Both are nutritious and filling!';
    } else if (msg.includes('budget') || msg.includes('cheap') || msg.includes('affordable')) {
      return '💰 Budget-friendly picks: **Masala Chai** (₹49), **Garlic Bread** (₹129), or **Loaded Fries** (₹129). Apply coupon **EATLOOP30** for ₹30 off!';
    } else if (msg.includes('popular') || msg.includes('bestseller') || msg.includes('recommend')) {
      return '🏆 Top bestsellers right now: **Chicken Biryani** (Spice Garden), **BBQ Chicken Pizza** (Pizza Palace), and **Classic Beef Burger** (Burger Barn). All highly ordered this week!';
    } else if (msg.includes('coupon') || msg.includes('discount') || msg.includes('offer')) {
      return '🎟️ Active coupons:\n• **WELCOME50** – 50% off first order (max ₹100)\n• **EATLOOP30** – Flat ₹30 off above ₹299\n• **HUNGRY100** – Flat ₹100 off above ₹599';
    } else if (msg.includes('delivery') || msg.includes('how long')) {
      return '⚡ Average delivery times:\n• Spice Garden: 25-40 mins\n• Pizza Palace: 30-50 mins\n• Burger Barn: 20-35 mins\nPeak hours (12-2 PM, 7-9 PM) may be slightly longer.';
    } else if (msg.includes('track') || msg.includes('order status')) {
      return '📦 You can track your order in real-time from **My Orders** page. You\'ll get live location updates from your delivery partner and status notifications!';
    } else {
      return `I understand you're looking for "${userMsg}". Let me help! 🍽️\n\nTry asking me about:\n• Specific cuisines (Indian, Italian, Chinese)\n• Dietary preferences (veg, vegan, gluten-free)\n• Budget options\n• Nutritional information\n• Current offers and coupons`;
    }
  };

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setTyping(true);
    try {
      const botReply = await getBotResponse(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again!' }]);
    } finally { setTyping(false); }
  };

  const loadRecommendations = async () => {
    setLoadingRec(true);
    try {
      const { data } = await aiAPI.getRecommendations();
      setRecommendations(data);
    } catch (err) { toast.error('Failed to load recommendations'); }
    finally { setLoadingRec(false); }
  };

  useEffect(() => { if (activeTab === 'recommendations') loadRecommendations(); }, [activeTab]);

  const analyzeSentiment = async () => {
    if (!sentimentText.trim()) return;
    setAnalyzingSentiment(true);
    try {
      const { data } = await aiAPI.analyzeSentiment(sentimentText);
      setSentimentResult(data);
    } catch (err) { toast.error('Analysis failed'); }
    finally { setAnalyzingSentiment(false); }
  };

  const sentimentEmoji = { positive: '😊', neutral: '😐', negative: '😞' };
  const sentimentBg = { positive: '#DCFCE7', neutral: '#F1F5F9', negative: '#FEE2E2' };
  const sentimentColor = { positive: '#15803D', neutral: '#475569', negative: '#DC2626' };

  return (
    <div style={{ padding: '32px 0', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>🤖 AI Food Assistant</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Powered by machine learning for personalized food experiences</p>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          {[
            { key: 'chatbot', label: '💬 Chatbot' },
            { key: 'recommendations', label: '🎯 For You' },
            { key: 'sentiment', label: '🧠 Sentiment' },
            { key: 'nutrition', label: '🥗 Nutrition' },
          ].map(t => (
            <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* Chatbot */}
        {activeTab === 'chatbot' && (
          <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 560 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #FF8C42)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>EATLOOP AI</div>
                <div style={{ fontSize: 12, color: 'var(--success)' }}>● Online</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'bot' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>🤖</div>
                  )}
                  <div className={`chat-bubble ${msg.role}`} style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                  </div>
                </div>
              ))}
              {typing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🤖</div>
                  <div className="chat-bubble bot"><div className="chat-typing"><span /><span /><span /></div></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {QUICK_REPLIES.map((qr, i) => (
                  <button key={i} onClick={() => sendMessage(qr)} style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)', transition: 'var(--transition)' }}
                    onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}>
                    {qr}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Ask me anything about food..." style={{ flex: 1 }} disabled={typing} />
                <button className="btn btn-primary" onClick={() => sendMessage()} disabled={!input.trim() || typing}>
                  {typing ? <span className="spinner spinner-sm" /> : '→'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {activeTab === 'recommendations' && (
          <div>
            {loadingRec ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />)}
              </div>
            ) : recommendations ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: 18 }}>🎯 Personalized For You</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Based on {recommendations.userPreferences?.hasHistory ? 'your order history' : 'popular items'}</p>
                  </div>
                  {recommendations.userPreferences?.topCategories?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {recommendations.userPreferences.topCategories.map(c => <span key={c} className="badge badge-orange">{c}</span>)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {recommendations.recommendations?.map(item => (
                    <div key={item._id} className="card card-hover" style={{ overflow: 'hidden' }}>
                      <img src={item.image || `https://picsum.photos/seed/${item._id}/220/130`} alt={item.name}
                        style={{ width: '100%', height: 130, objectFit: 'cover' }}
                        onError={e => { e.target.src = `https://picsum.photos/seed/${item.name}/220/130`; }} />
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{item.restaurant?.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{item.discountedPrice || item.price}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>★ {item.rating?.toFixed(1) || '4.0'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Sentiment Analysis */}
        {activeTab === 'sentiment' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>🧠 Sentiment Analyzer</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Analyze the sentiment of any review or feedback text</p>
            <textarea className="input" value={sentimentText} onChange={e => setSentimentText(e.target.value)}
              placeholder="Enter a review text to analyze... e.g. 'The food was amazing and delivery was super fast!'"
              style={{ resize: 'vertical', minHeight: 120, marginBottom: 14 }} />
            <button className="btn btn-primary" onClick={analyzeSentiment} disabled={!sentimentText.trim() || analyzingsentiment}>
              {analyzingsentiment ? <><span className="spinner spinner-sm" /> Analyzing...</> : '🔍 Analyze Sentiment'}
            </button>

            {sentimentResult && (
              <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: sentimentBg[sentimentResult.sentiment], borderRadius: 'var(--radius-lg)', padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>{sentimentEmoji[sentimentResult.sentiment]}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: sentimentColor[sentimentResult.sentiment], textTransform: 'capitalize' }}>
                    {sentimentResult.sentiment}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Confidence: {Math.round(sentimentResult.score * 100)}%
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Score Breakdown</div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: '#15803D' }}>✅ Positive signals</span>
                        <span style={{ fontWeight: 600 }}>{sentimentResult.positiveScore}</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${sentimentResult.positiveScore * 20}%`, background: '#22C55E' }} /></div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: '#DC2626' }}>❌ Negative signals</span>
                        <span style={{ fontWeight: 600 }}>{sentimentResult.negativeScore}</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${sentimentResult.negativeScore * 20}%`, background: '#EF4444' }} /></div>
                    </div>
                  </div>
                  {sentimentResult.aspects?.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Aspects Mentioned</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {sentimentResult.aspects.map(a => <span key={a} className="badge badge-blue">{a}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nutrition Tab */}
        {activeTab === 'nutrition' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>🥗 AI Nutrition Assistant</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Add items to your cart and check nutritional information before ordering.
            </p>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🥦</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Add items to your cart to see nutrition breakdown</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, maxWidth: 500, margin: '0 auto' }}>
                {[
                  { label: 'Calories', icon: '🔥', daily: '2000 kcal' },
                  { label: 'Protein', icon: '💪', daily: '50g' },
                  { label: 'Carbs', icon: '🌾', daily: '300g' },
                  { label: 'Fat', icon: '🧈', daily: '65g' },
                  { label: 'Fiber', icon: '🥬', daily: '25g' },
                ].map(n => (
                  <div key={n.label} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{n.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{n.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Daily: {n.daily}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 20, padding: 16, background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ fontWeight: 700, color: '#2563EB', marginBottom: 8 }}>💡 Healthy Eating Tips</div>
              <ul style={{ paddingLeft: 16, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>
                <li>Choose grilled over fried when possible</li>
                <li>Add a salad or veggie side to your meal</li>
                <li>Dal-based dishes are high in protein and fiber</li>
                <li>Opt for whole grain or multigrain options when available</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
