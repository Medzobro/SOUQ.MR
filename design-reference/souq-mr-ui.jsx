// SOUQ.MR — Reference UI implementation
// This is the canonical design reference for the SOUQ.MR marketplace.
// Theme, components, pages, and CSS conventions defined here MUST be followed
// when building or extending the real app.
//
// See .kiro/steering/design-system.md for the design system documentation.

import { useState } from "react";

const theme = {
  bg: "#0A0A0F",
  bgCard: "#12121A",
  bgCard2: "#1A1A26",
  accent: "#FF6B35",
  accent2: "#FFB347",
  gold: "#F0C040",
  text: "#F0EDE8",
  textMuted: "#8A8799",
  border: "#2A2A3A",
  green: "#2ECC71",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Bebas+Neue&display=swap');

  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:${theme.bg}; color:${theme.text}; font-family:'Cairo',sans-serif; overflow-x:hidden; }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:${theme.bg}; }
  ::-webkit-scrollbar-thumb { background:${theme.accent}; border-radius:2px; }

  .nav {
    position:fixed; top:0; left:0; right:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 20px;
    background:rgba(10,10,15,0.85);
    backdrop-filter:blur(20px);
    border-bottom:1px solid ${theme.border};
  }
  .nav-logo {
    font-family:'Bebas Neue',sans-serif;
    font-size:26px; letter-spacing:3px;
    background:linear-gradient(135deg,${theme.accent},${theme.gold});
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .nav-actions { display:flex; gap:10px; align-items:center; }
  .btn-nav {
    padding:8px 18px; border-radius:50px;
    border:1px solid ${theme.border}; background:transparent;
    color:${theme.text}; font-family:'Cairo',sans-serif;
    font-size:13px; cursor:pointer; transition:all .2s;
  }
  .btn-nav:hover { border-color:${theme.accent}; color:${theme.accent}; }
  .btn-primary {
    padding:10px 22px; border-radius:50px;
    background:linear-gradient(135deg,${theme.accent},${theme.accent2});
    border:none; color:#fff; font-family:'Cairo',sans-serif;
    font-size:14px; font-weight:700; cursor:pointer;
    transition:all .2s; box-shadow:0 4px 20px rgba(255,107,53,0.3);
  }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 28px rgba(255,107,53,0.5); }

  /* HERO */
  .hero {
    min-height:100vh;
    display:flex; align-items:center;
    padding:100px 20px 60px;
    position:relative; overflow:hidden;
  }
  .hero-bg {
    position:absolute; inset:0;
    background: radial-gradient(ellipse at 70% 40%, rgba(255,107,53,0.12) 0%, transparent 60%),
                radial-gradient(ellipse at 20% 80%, rgba(240,192,64,0.08) 0%, transparent 50%);
  }
  .hero-grid {
    position:absolute; inset:0; opacity:0.04;
    background-image: linear-gradient(${theme.border} 1px, transparent 1px),
                      linear-gradient(90deg, ${theme.border} 1px, transparent 1px);
    background-size:40px 40px;
  }
  .hero-content { position:relative; max-width:600px; }
  .hero-badge {
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 16px; border-radius:50px;
    background:rgba(255,107,53,0.1); border:1px solid rgba(255,107,53,0.3);
    font-size:12px; color:${theme.accent}; margin-bottom:24px;
  }
  .hero-badge-dot { width:6px; height:6px; border-radius:50%; background:${theme.accent}; animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
  .hero-title {
    font-family:'Bebas Neue',sans-serif;
    font-size:clamp(56px,10vw,96px);
    line-height:0.95; letter-spacing:2px; margin-bottom:20px;
  }
  .hero-title span { display:block; }
  .hero-title .accent { 
    background:linear-gradient(135deg,${theme.accent},${theme.gold});
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .hero-sub { font-size:16px; color:${theme.textMuted}; line-height:1.7; margin-bottom:36px; max-width:440px; direction:rtl; text-align:right; }
  .hero-ctas { display:flex; gap:14px; flex-wrap:wrap; }
  .btn-outline {
    padding:12px 26px; border-radius:50px;
    border:1px solid ${theme.border}; background:transparent;
    color:${theme.text}; font-family:'Cairo',sans-serif;
    font-size:14px; font-weight:600; cursor:pointer; transition:all .2s;
  }
  .btn-outline:hover { border-color:${theme.gold}; color:${theme.gold}; }

  .hero-stats {
    position:absolute; right:20px; top:50%; transform:translateY(-50%);
    display:flex; flex-direction:column; gap:16px;
  }
  .stat-card {
    background:${theme.bgCard}; border:1px solid ${theme.border};
    border-radius:16px; padding:18px 22px; text-align:center;
    backdrop-filter:blur(10px); min-width:120px;
  }
  .stat-num { font-family:'Bebas Neue'; font-size:32px; color:${theme.accent}; }
  .stat-label { font-size:11px; color:${theme.textMuted}; }

  /* CATEGORIES */
  .section { padding:60px 20px; }
  .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; }
  .section-title { font-size:22px; font-weight:700; direction:rtl; }
  .section-title span { color:${theme.accent}; }
  .see-all { font-size:13px; color:${theme.accent}; cursor:pointer; border:none; background:none; font-family:'Cairo'; }

  .cats-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
  .cat-card {
    background:${theme.bgCard}; border:1px solid ${theme.border};
    border-radius:16px; padding:20px 12px; text-align:center;
    cursor:pointer; transition:all .25s; position:relative; overflow:hidden;
  }
  .cat-card::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,${theme.accent},${theme.accent2});
    opacity:0; transition:.25s;
  }
  .cat-card:hover::before { opacity:0.08; }
  .cat-card:hover { border-color:${theme.accent}; transform:translateY(-3px); }
  .cat-icon { font-size:28px; margin-bottom:10px; position:relative; }
  .cat-name { font-size:13px; font-weight:600; position:relative; }
  .cat-count { font-size:11px; color:${theme.textMuted}; position:relative; }

  /* PRODUCTS GRID */
  .products-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
  .product-card {
    background:${theme.bgCard}; border:1px solid ${theme.border};
    border-radius:20px; overflow:hidden; cursor:pointer;
    transition:all .25s; position:relative;
  }
  .product-card:hover { transform:translateY(-4px); border-color:rgba(255,107,53,0.4); box-shadow:0 12px 40px rgba(0,0,0,0.4); }
  .product-img {
    height:180px; position:relative; overflow:hidden;
    background:linear-gradient(135deg, #1e1e2e, #2a1a2e);
    display:flex; align-items:center; justify-content:center;
    font-size:60px;
  }
  .product-badge {
    position:absolute; top:10px; right:10px;
    background:${theme.accent}; color:#fff;
    font-size:10px; font-weight:700; padding:3px 10px; border-radius:50px;
  }
  .product-fav {
    position:absolute; top:10px; left:10px;
    background:rgba(0,0,0,0.5); border:none; color:#fff;
    width:32px; height:32px; border-radius:50%; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:14px;
    backdrop-filter:blur(4px);
  }
  .product-info { padding:14px; }
  .product-name { font-size:14px; font-weight:700; margin-bottom:4px; direction:rtl; text-align:right; }
  .product-loc { font-size:11px; color:${theme.textMuted}; margin-bottom:10px; direction:rtl; text-align:right; }
  .product-footer { display:flex; align-items:center; justify-content:space-between; }
  .product-price { font-size:18px; font-weight:900; color:${theme.accent}; }
  .product-price span { font-size:11px; color:${theme.textMuted}; }
  .btn-chat {
    padding:6px 14px; border-radius:50px;
    background:rgba(255,107,53,0.1); border:1px solid rgba(255,107,53,0.3);
    color:${theme.accent}; font-size:11px; font-weight:600;
    cursor:pointer; transition:all .2s; font-family:'Cairo';
  }
  .btn-chat:hover { background:rgba(255,107,53,0.2); }

  /* AUTH PAGE */
  .auth-page {
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    padding:80px 20px;
    background: radial-gradient(ellipse at 30% 50%, rgba(255,107,53,0.1) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(240,192,64,0.07) 0%, transparent 50%),
                ${theme.bg};
  }
  .auth-card {
    background:${theme.bgCard}; border:1px solid ${theme.border};
    border-radius:28px; padding:40px; width:100%; max-width:440px;
    position:relative; overflow:hidden;
  }
  .auth-card::before {
    content:''; position:absolute; top:-1px; left:20%; right:20%; height:2px;
    background:linear-gradient(90deg,transparent,${theme.accent},transparent);
  }
  .auth-logo { text-align:center; margin-bottom:28px; }
  .auth-logo-text {
    font-family:'Bebas Neue'; font-size:40px; letter-spacing:4px;
    background:linear-gradient(135deg,${theme.accent},${theme.gold});
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .auth-tabs { display:flex; background:${theme.bg}; border-radius:14px; padding:4px; margin-bottom:28px; }
  .auth-tab {
    flex:1; padding:10px; text-align:center; border-radius:10px;
    font-size:14px; font-weight:600; cursor:pointer; transition:all .2s;
    border:none; background:transparent; color:${theme.textMuted}; font-family:'Cairo';
  }
  .auth-tab.active { background:linear-gradient(135deg,${theme.accent},${theme.accent2}); color:#fff; }

  .input-group { margin-bottom:16px; }
  .input-label { font-size:12px; color:${theme.textMuted}; margin-bottom:6px; display:block; direction:rtl; text-align:right; }
  .input-wrap { position:relative; }
  .input-field {
    width:100%; padding:13px 16px;
    background:${theme.bg}; border:1px solid ${theme.border};
    border-radius:12px; color:${theme.text};
    font-family:'Cairo'; font-size:14px; transition:all .2s;
    direction:rtl; text-align:right;
  }
  .input-field:focus { outline:none; border-color:${theme.accent}; box-shadow:0 0 0 3px rgba(255,107,53,0.1); }
  .input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:16px; }

  .role-select { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
  .role-btn {
    padding:14px; border-radius:14px; border:1px solid ${theme.border};
    background:${theme.bg}; color:${theme.textMuted}; cursor:pointer;
    text-align:center; transition:all .2s; font-family:'Cairo';
  }
  .role-btn.active { border-color:${theme.accent}; background:rgba(255,107,53,0.08); color:${theme.text}; }
  .role-btn-icon { font-size:24px; margin-bottom:6px; }
  .role-btn-label { font-size:13px; font-weight:600; }

  .auth-divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
  .auth-divider-line { flex:1; height:1px; background:${theme.border}; }
  .auth-divider-text { font-size:12px; color:${theme.textMuted}; }

  /* STORE PAGE */
  .store-cover {
    height:220px; position:relative; overflow:hidden;
    background:linear-gradient(135deg,#1a0a2e,#2e1a0a,#0a1a2e);
    display:flex; align-items:center; justify-content:center; font-size:80px;
  }
  .store-cover-overlay {
    position:absolute; inset:0;
    background:linear-gradient(to bottom, transparent 50%, ${theme.bg} 100%);
  }
  .store-profile {
    padding:0 20px; margin-top:-50px; position:relative;
    display:flex; align-items:flex-end; gap:16px; margin-bottom:20px;
  }
  .store-avatar {
    width:90px; height:90px; border-radius:22px;
    border:3px solid ${theme.accent}; overflow:hidden;
    background:linear-gradient(135deg,${theme.accent},${theme.gold});
    display:flex; align-items:center; justify-content:center;
    font-size:36px; flex-shrink:0;
  }
  .store-info { padding-bottom:8px; }
  .store-name { font-size:22px; font-weight:900; direction:rtl; }
  .store-meta { display:flex; gap:12px; margin-top:4px; flex-wrap:wrap; }
  .store-meta-item { font-size:12px; color:${theme.textMuted}; display:flex; align-items:center; gap:4px; }
  .verified-badge {
    display:inline-flex; align-items:center; gap:4px;
    background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3);
    color:${theme.green}; font-size:11px; padding:3px 10px; border-radius:50px;
  }
  .store-actions { display:flex; gap:10px; margin:0 20px 24px; }
  .store-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; padding:0 20px 28px; }
  .store-stat { background:${theme.bgCard}; border:1px solid ${theme.border}; border-radius:14px; padding:16px; text-align:center; }
  .store-stat-num { font-family:'Bebas Neue'; font-size:28px; color:${theme.accent}; }
  .store-stat-label { font-size:11px; color:${theme.textMuted}; }

  /* PRODUCT DETAIL */
  .product-detail { padding-top:70px; min-height:100vh; }
  .product-gallery {
    height:300px; background:linear-gradient(135deg,#1e1a3e,#3e1e1a);
    display:flex; align-items:center; justify-content:center;
    font-size:100px; position:relative;
  }
  .gallery-dots { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); display:flex; gap:6px; }
  .gallery-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.3); }
  .gallery-dot.active { background:${theme.accent}; width:18px; border-radius:3px; }
  .product-detail-body { padding:20px; }
  .product-detail-cat {
    display:inline-block; padding:4px 14px; border-radius:50px;
    background:rgba(255,107,53,0.1); border:1px solid rgba(255,107,53,0.2);
    color:${theme.accent}; font-size:11px; margin-bottom:12px;
  }
  .product-detail-title { font-size:24px; font-weight:900; direction:rtl; text-align:right; margin-bottom:8px; }
  .product-detail-price { font-size:32px; font-weight:900; color:${theme.accent}; margin-bottom:16px; }
  .product-detail-price span { font-size:14px; color:${theme.textMuted}; font-weight:400; }
  .product-detail-info { display:flex; gap:16px; margin-bottom:20px; flex-wrap:wrap; }
  .product-detail-info-item { display:flex; align-items:center; gap:6px; font-size:13px; color:${theme.textMuted}; }
  .product-detail-desc {
    background:${theme.bgCard}; border:1px solid ${theme.border};
    border-radius:16px; padding:16px; margin-bottom:20px;
    direction:rtl; text-align:right; font-size:14px; line-height:1.8; color:${theme.textMuted};
  }
  .seller-mini {
    background:${theme.bgCard}; border:1px solid ${theme.border};
    border-radius:16px; padding:16px; margin-bottom:24px;
    display:flex; align-items:center; gap:14px;
  }
  .seller-mini-avatar {
    width:50px; height:50px; border-radius:14px;
    background:linear-gradient(135deg,${theme.accent},${theme.gold});
    display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0;
  }
  .seller-mini-name { font-weight:700; font-size:15px; direction:rtl; }
  .seller-mini-sub { font-size:12px; color:${theme.textMuted}; direction:rtl; }
  .product-ctas { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  /* BOTTOM NAV */
  .bottom-nav {
    position:fixed; bottom:0; left:0; right:0;
    background:rgba(18,18,26,0.95); backdrop-filter:blur(20px);
    border-top:1px solid ${theme.border};
    display:flex; padding:8px 0 16px;
    z-index:100;
  }
  .bottom-nav-item {
    flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;
    cursor:pointer; transition:all .2s; padding:6px 0;
    border:none; background:transparent; color:${theme.textMuted}; font-family:'Cairo';
  }
  .bottom-nav-item.active { color:${theme.accent}; }
  .bottom-nav-icon { font-size:20px; }
  .bottom-nav-label { font-size:10px; font-weight:600; }
  .bottom-nav-add {
    flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;
    cursor:pointer; padding:0;
  }
  .bottom-nav-add-btn {
    width:48px; height:48px; border-radius:16px;
    background:linear-gradient(135deg,${theme.accent},${theme.accent2});
    border:none; display:flex; align-items:center; justify-content:center;
    font-size:24px; color:#fff; cursor:pointer;
    box-shadow:0 4px 20px rgba(255,107,53,0.4); margin-top:-20px;
  }

  /* SEARCH BAR */
  .search-wrap {
    padding:14px 20px; background:${theme.bg};
  }
  .search-bar {
    display:flex; align-items:center; gap:12px;
    background:${theme.bgCard}; border:1px solid ${theme.border};
    border-radius:16px; padding:10px 16px;
  }
  .search-input {
    flex:1; background:none; border:none; color:${theme.text};
    font-family:'Cairo'; font-size:14px; direction:rtl; text-align:right;
  }
  .search-input:focus { outline:none; }
  .search-input::placeholder { color:${theme.textMuted}; }
  .search-icon { font-size:18px; color:${theme.textMuted}; }
  .filter-btn {
    padding:8px 14px; border-radius:10px;
    background:rgba(255,107,53,0.1); border:1px solid rgba(255,107,53,0.2);
    color:${theme.accent}; font-size:12px; cursor:pointer; font-family:'Cairo'; white-space:nowrap;
  }

  @media(max-width:700px){
    .cats-grid { grid-template-columns:repeat(3,1fr); }
    .hero-stats { display:none; }
    .hero-title { font-size:56px; }
  }
`;

const categories = [
  { icon: "📱", name: "إلكترونيات", count: "2.4k" },
  { icon: "🚗", name: "سيارات", count: "890" },
  { icon: "👕", name: "ملابس", count: "3.1k" },
  { icon: "🏠", name: "عقارات", count: "540" },
  { icon: "🔧", name: "خدمات", count: "1.2k" },
  { icon: "🛋️", name: "أثاث", count: "760" },
];

const products = [
  { id:1, icon:"📱", name:"iPhone 14 Pro Max", price:"85,000", loc:"نواكشوط", badge:"جديد", cat:"إلكترونيات" },
  { id:2, icon:"🚗", name:"Toyota Hilux 2022", price:"2,400,000", loc:"نواذيبو", badge:"ممتاز", cat:"سيارات" },
  { id:3, icon:"💻", name:"MacBook Pro M3", price:"120,000", loc:"نواكشوط", badge:"مستعمل", cat:"إلكترونيات" },
  { id:4, icon:"🏠", name:"شقة للإيجار - حي السبخة", price:"15,000/شهر", loc:"نواكشوط", badge:"متاح", cat:"عقارات" },
  { id:5, icon:"📷", name:"Canon EOS R5", price:"95,000", loc:"نواكشوط", badge:"جديد", cat:"إلكترونيات" },
  { id:6, icon:"🛵", name:"دراجة نارية هوندا", price:"180,000", loc:"روصو", badge:"مستعمل", cat:"سيارات" },
  { id:7, icon:"🖥️", name:"شاشة Samsung 4K 55\"", price:"32,000", loc:"نواكشوط", badge:"جديد", cat:"إلكترونيات" },
  { id:8, icon:"👒", name:"ملابس تقليدية فاخرة", price:"8,500", loc:"نواكشوط", badge:"جديد", cat:"ملابس" },
];

// ── PAGES ──────────────────────────────────────────────────────────────────

function HomePage({ setPage }) {
  return (
    <div style={{paddingBottom:80}}>
      {/* Hero */}
      <div className="hero">
        <div className="hero-bg"/>
        <div className="hero-grid"/>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"/>
            🇲🇷 السوق المحلي الأول في موريتانيا
          </div>
          <div className="hero-title">
            <span>سوق</span>
            <span className="accent">موريتانيا</span>
            <span style={{fontSize:'0.5em', fontFamily:'Cairo', fontWeight:300, color:theme.textMuted}}>MARKETPLACE</span>
          </div>
          <p className="hero-sub">
            بيع واشتري بسهولة وأمان — من الإلكترونيات إلى العقارات، كل شيء في مكان واحد بدون مجموعات واتساب عشوائية.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" style={{fontSize:15, padding:'13px 30px'}} onClick={() => setPage('home')}>
              🛒 تصفح الآن
            </button>
            <button className="btn-outline" onClick={() => setPage('auth')}>
              + أضف إعلانك
            </button>
          </div>
        </div>
        <div className="hero-stats">
          {[{n:'12k+',l:'إعلان نشط'},{n:'3.4k',l:'بائع موثوق'},{n:'98%',l:'رضا العملاء'}].map(s=>(
            <div className="stat-card" key={s.l}>
              <div className="stat-num">{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="ابحث عن أي شيء..." />
          <button className="filter-btn">⚙️ فلتر</button>
        </div>
      </div>

      {/* Categories */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">تصفح <span>التصنيفات</span></div>
          <button className="see-all">الكل ←</button>
        </div>
        <div className="cats-grid">
          {categories.map(c=>(
            <div className="cat-card" key={c.name}>
              <div className="cat-icon">{c.icon}</div>
              <div className="cat-name">{c.name}</div>
              <div className="cat-count">{c.count} إعلان</div>
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="section" style={{paddingTop:0}}>
        <div className="section-header">
          <div className="section-title">أحدث <span>الإعلانات</span></div>
          <button className="see-all">الكل ←</button>
        </div>
        <div className="products-grid">
          {products.map(p=>(
            <div className="product-card" key={p.id} onClick={() => setPage('product')}>
              <div className="product-img">
                {p.icon}
                <span className="product-badge">{p.badge}</span>
                <button className="product-fav" onClick={e=>{e.stopPropagation()}}>♡</button>
              </div>
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-loc">📍 {p.loc}</div>
                <div className="product-footer">
                  <div>
                    <div className="product-price">{p.price} <span>MRU</span></div>
                  </div>
                  <button className="btn-chat">💬 تواصل</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthPage({ setPage }) {
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('buyer');

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text">SOUQ.MR</div>
          <div style={{fontSize:12, color:theme.textMuted, marginTop:4}}>السوق المحلي الأول في موريتانيا</div>
        </div>

        <div className="auth-tabs">
          {[{k:'login',l:'تسجيل الدخول'},{k:'register',l:'حساب جديد'}].map(t=>(
            <button key={t.k} className={`auth-tab ${tab===t.k?'active':''}`} onClick={()=>setTab(t.k)}>
              {t.l}
            </button>
          ))}
        </div>

        {tab === 'register' && (
          <>
            <div className="role-select">
              <button className={`role-btn ${role==='buyer'?'active':''}`} onClick={()=>setRole('buyer')}>
                <div className="role-btn-icon">🛒</div>
                <div className="role-btn-label">مشتري</div>
              </button>
              <button className={`role-btn ${role==='seller'?'active':''}`} onClick={()=>setRole('seller')}>
                <div className="role-btn-icon">🏪</div>
                <div className="role-btn-label">بائع / تاجر</div>
              </button>
            </div>
            <div className="input-group">
              <label className="input-label">الاسم الكامل</label>
              <div className="input-wrap">
                <input className="input-field" placeholder="محمد ولد أحمد" />
              </div>
            </div>
            {role === 'seller' && (
              <div className="input-group">
                <label className="input-label">اسم المتجر</label>
                <div className="input-wrap">
                  <input className="input-field" placeholder="متجر النجاح" />
                </div>
              </div>
            )}
          </>
        )}

        <div className="input-group">
          <label className="input-label">رقم الهاتف</label>
          <div className="input-wrap">
            <input className="input-field" placeholder="🇲🇷  +222 XX XX XX XX" />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">كلمة المرور</label>
          <div className="input-wrap">
            <input className="input-field" type="password" placeholder="••••••••" />
            <span className="input-icon">👁</span>
          </div>
        </div>

        {tab==='login' && (
          <div style={{textAlign:'left', marginBottom:20}}>
            <span style={{fontSize:12, color:theme.accent, cursor:'pointer'}}>نسيت كلمة المرور؟</span>
          </div>
        )}

        <button className="btn-primary" style={{width:'100%', fontSize:16, padding:'14px'}} onClick={() => setPage('home')}>
          {tab==='login' ? '🚀 دخول' : '✨ إنشاء الحساب'}
        </button>

        <div className="auth-divider">
          <div className="auth-divider-line"/>
          <div className="auth-divider-text">أو</div>
          <div className="auth-divider-line"/>
        </div>

        <button style={{
          width:'100%', padding:'12px', borderRadius:12, border:`1px solid ${theme.border}`,
          background:'transparent', color:theme.text, fontFamily:'Cairo', fontSize:14,
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8
        }}>
          📱 الدخول برقم واتساب
        </button>

        <p style={{textAlign:'center', marginTop:20, fontSize:12, color:theme.textMuted}}>
          {tab==='login' ? 'ما عندك حساب؟ ' : 'عندك حساب؟ '}
          <span style={{color:theme.accent, cursor:'pointer'}} onClick={()=>setTab(tab==='login'?'register':'login')}>
            {tab==='login' ? 'سجل الآن' : 'ادخل'}
          </span>
        </p>
      </div>
    </div>
  );
}

function StorePage({ setPage }) {
  const [activeTab, setActiveTab] = useState('products');
  return (
    <div style={{paddingBottom:80, paddingTop:60}}>
      <div className="store-cover">
        🏪
        <div className="store-cover-overlay"/>
      </div>
      <div className="store-profile">
        <div className="store-avatar">🏪</div>
        <div className="store-info">
          <div className="store-name">متجر النجاح للإلكترونيات</div>
          <div className="store-meta">
            <span className="verified-badge">✅ موثق</span>
            <span className="store-meta-item">📍 نواكشوط</span>
            <span className="store-meta-item">⭐ 4.9</span>
          </div>
        </div>
      </div>

      <div className="store-stats">
        {[{n:'248', l:'منتج'},{n:'1.2k', l:'متابع'},{n:'98%', l:'تقييم إيجابي'}].map(s=>(
          <div className="store-stat" key={s.l}>
            <div className="store-stat-num">{s.n}</div>
            <div className="store-stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="store-actions">
        <button className="btn-primary" style={{flex:1}}>💬 مراسلة المتجر</button>
        <button className="btn-outline" style={{flex:1}}>🔔 تابع</button>
      </div>

      {/* Tabs */}
      <div style={{display:'flex', padding:'0 20px 20px', gap:8}}>
        {[{k:'products',l:'المنتجات'},{k:'about',l:'عن المتجر'},{k:'reviews',l:'التقييمات'}].map(t=>(
          <button key={t.k}
            style={{
              padding:'9px 20px', borderRadius:50, fontFamily:'Cairo', fontSize:13, fontWeight:600,
              cursor:'pointer', transition:'all .2s',
              background: activeTab===t.k ? `linear-gradient(135deg,${theme.accent},${theme.accent2})` : theme.bgCard,
              border: `1px solid ${activeTab===t.k ? theme.accent : theme.border}`,
              color: activeTab===t.k ? '#fff' : theme.textMuted,
            }}
            onClick={()=>setActiveTab(t.k)}
          >{t.l}</button>
        ))}
      </div>

      {activeTab==='products' && (
        <div className="products-grid" style={{padding:'0 20px'}}>
          {products.slice(0,4).map(p=>(
            <div className="product-card" key={p.id} onClick={()=>setPage('product')}>
              <div className="product-img">{p.icon}<span className="product-badge">{p.badge}</span></div>
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-loc">📍 {p.loc}</div>
                <div className="product-footer">
                  <div className="product-price">{p.price} <span>MRU</span></div>
                  <button className="btn-chat">💬</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab==='about' && (
        <div style={{padding:'0 20px'}}>
          <div className="product-detail-desc">
            متجر النجاح للإلكترونيات — متخصصون في بيع أحدث الأجهزة الإلكترونية الأصلية بأسعار منافسة. نوفر ضمان على جميع المنتجات وخدمة ما بعد البيع. موثوقون منذ 2018 بخدمة أكثر من 5000 عميل راضٍ في موريتانيا.
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {[{i:'📞',t:'اتصال مباشر',v:'+222 36 XX XX XX'},{i:'📍',t:'الموقع',v:'نواكشوط، حي تفرغ زينه'},{i:'🕐',t:'أوقات العمل',v:'8 صباحاً - 10 مساءً'}].map(r=>(
              <div key={r.t} style={{background:theme.bgCard,border:`1px solid ${theme.border}`,borderRadius:14,padding:14,display:'flex',alignItems:'center',gap:12,direction:'rtl'}}>
                <span style={{fontSize:20}}>{r.i}</span>
                <div>
                  <div style={{fontSize:12,color:theme.textMuted}}>{r.t}</div>
                  <div style={{fontSize:14,fontWeight:600}}>{r.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab==='reviews' && (
        <div style={{padding:'0 20px', display:'flex', flexDirection:'column', gap:12}}>
          {[{n:'أحمد ولد محمد',r:'⭐⭐⭐⭐⭐',t:'خدمة ممتازة والمنتجات أصلية 100%، شكراً جزيلاً!'},{n:'فاطمة بنت سيدي',r:'⭐⭐⭐⭐⭐',t:'سرعة في التوصيل والتعامل محترم جداً.'},{n:'مريم بنت أحمد',r:'⭐⭐⭐⭐',t:'منتجات جيدة وأسعار معقولة.'}].map(rv=>(
            <div key={rv.n} style={{background:theme.bgCard,border:`1px solid ${theme.border}`,borderRadius:16,padding:16,direction:'rtl'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontWeight:700}}>{rv.n}</span>
                <span style={{fontSize:12}}>{rv.r}</span>
              </div>
              <p style={{fontSize:13,color:theme.textMuted,lineHeight:1.7}}>{rv.t}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductPage({ setPage }) {
  const [fav, setFav] = useState(false);
  return (
    <div className="product-detail" style={{paddingBottom:100}}>
      <div className="product-gallery">
        📱
        <div className="gallery-dots">
          {[0,1,2,3].map(i=><div key={i} className={`gallery-dot ${i===0?'active':''}`}/>)}
        </div>
        <button style={{
          position:'absolute', top:76, right:16,
          background:'rgba(0,0,0,0.5)', border:'none', color:'#fff',
          width:36, height:36, borderRadius:50, cursor:'pointer',
          fontSize:20, backdropFilter:'blur(4px)'
        }} onClick={()=>setPage('home')}>←</button>
        <button style={{
          position:'absolute', top:76, left:16,
          background:`rgba(${fav?'255,107,53':'0,0,0'},.5)`,
          border:'none', color:'#fff',
          width:36, height:36, borderRadius:50, cursor:'pointer',
          fontSize:18, backdropFilter:'blur(4px)'
        }} onClick={()=>setFav(!fav)}>{fav?'❤️':'🤍'}</button>
      </div>

      <div className="product-detail-body">
        <span className="product-detail-cat">📱 إلكترونيات</span>
        <div className="product-detail-title">iPhone 14 Pro Max — 256GB</div>
        <div className="product-detail-price">85,000 <span>أوقية موريتانية</span></div>

        <div className="product-detail-info">
          <span className="product-detail-info-item">📍 نواكشوط</span>
          <span className="product-detail-info-item">🕐 منذ يومين</span>
          <span className="product-detail-info-item">👁 342 مشاهدة</span>
        </div>

        <div style={{display:'flex', gap:8, marginBottom:20, flexWrap:'wrap'}}>
          {['أصلي 100%','ضمان سنة','مستعمل بعناية','مع الكرتون'].map(t=>(
            <span key={t} style={{padding:'4px 12px',borderRadius:50,background:theme.bgCard,border:`1px solid ${theme.border}`,fontSize:12,color:theme.textMuted}}>{t}</span>
          ))}
        </div>

        <div className="product-detail-desc">
          آيفون 14 برو ماكس 256GB، لون أسود فضاء. حالة ممتازة 98/100، لا خدوش ولا كسور. مع الكرتون الأصلي والشاحن. البطارية 91%. البيع بسبب تغيير الجهاز. السعر قابل للتفاوض للجادين.
        </div>

        <div className="seller-mini" onClick={()=>setPage('store')} style={{cursor:'pointer'}}>
          <div className="seller-mini-avatar">🏪</div>
          <div style={{flex:1}}>
            <div className="seller-mini-name">متجر النجاح للإلكترونيات</div>
            <div className="seller-mini-sub">⭐ 4.9 · 248 منتج · ✅ موثق</div>
          </div>
          <span style={{color:theme.textMuted, fontSize:18}}>←</span>
        </div>

        <div className="product-ctas">
          <button className="btn-primary" style={{fontSize:15, padding:'14px'}}>💬 مراسلة البائع</button>
          <button className="btn-outline" style={{fontSize:15, padding:'14px'}}>📞 اتصال</button>
        </div>
      </div>
    </div>
  );
}

// ── APP SHELL ──────────────────────────────────────────────────────────────

const navItems = [
  {k:'home', icon:'🏠', label:'الرئيسية'},
  {k:'search', icon:'🔍', label:'بحث'},
  {k:'add', icon:'+', label:''},
  {k:'chat', icon:'💬', label:'رسائل'},
  {k:'profile', icon:'👤', label:'حسابي'},
];

export default function App() {
  const [page, setPage] = useState('home');
  const [active, setActive] = useState('home');

  const navigate = (k) => {
    if (k === 'add') { setPage('auth'); return; }
    setActive(k);
    setPage(k === 'profile' ? 'auth' : 'home');
  };

  return (
    <>
      <style>{css}</style>

      {/* Top Nav */}
      {page !== 'auth' && (
        <nav className="nav">
          <div className="nav-logo">SOUQ.MR</div>
          <div className="nav-actions">
            <button className="btn-nav" onClick={()=>setPage('auth')}>دخول</button>
            <button className="btn-primary" onClick={()=>setPage('auth')}>سجل مجاناً</button>
          </div>
        </nav>
      )}

      {/* Pages */}
      {page === 'home'    && <HomePage    setPage={setPage} />}
      {page === 'auth'    && <AuthPage    setPage={setPage} />}
      {page === 'store'   && <StorePage   setPage={setPage} />}
      {page === 'product' && <ProductPage setPage={setPage} />}

      {/* Bottom Nav */}
      {page !== 'auth' && (
        <div className="bottom-nav">
          {navItems.map(n => n.k === 'add' ? (
            <div className="bottom-nav-add" key="add">
              <button className="bottom-nav-add-btn" onClick={()=>navigate('add')}>＋</button>
            </div>
          ) : (
            <button key={n.k} className={`bottom-nav-item ${active===n.k?'active':''}`} onClick={()=>navigate(n.k)}>
              <span className="bottom-nav-icon">{n.icon}</span>
              <span className="bottom-nav-label">{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
