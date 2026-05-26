'use client';

import { useState, useTransition } from 'react';

type Product = any;

function imageUrl(p: Product) {
  if (!p.product_images?.length) return null;
  const sorted = [...p.product_images].sort((a: any, b: any) => a.sort_order - b.sort_order);
  return sorted[0]?.url;
}

export function PromotionsClient({
  requests,
  promoted,
  approvePromotion,
  rejectPromotionRequest,
  revokePromotion,
}: {
  requests: Product[];
  promoted: Product[];
  approvePromotion: (id: string, days?: number) => Promise<{ ok: boolean; error?: string }>;
  rejectPromotionRequest: (id: string) => Promise<{ ok: boolean; error?: string }>;
  revokePromotion: (id: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState('');
  const [days, setDays] = useState(7);

  async function handle(action: string, id: string, extra?: number) {
    start(async () => {
      let result;
      if (action === 'approve') result = await approvePromotion(id, extra ?? 7);
      else if (action === 'reject') result = await rejectPromotionRequest(id);
      else if (action === 'revoke') result = await revokePromotion(id);
      setMsg(result?.ok ? '✅ تم!' : `❌ ${result?.error}`);
      setTimeout(() => setMsg(''), 3000);
    });
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">⭐ طلبات الترويج</h1>
      <p className="admin-page-sub">إدارة طلبات الترويج والمنتجات المميزة</p>
      {msg && <div className="admin-toast">{msg}</div>}

      {/* ── Pending requests ── */}
      <div className="admin-section">
        <h2>⏳ طلبات جديدة ({requests.length})</h2>
        {requests.length === 0 ? (
          <div className="admin-empty">لا توجد طلبات ترويج معلقة</div>
        ) : (
          <div className="admin-cards-grid">
            {requests.map((p: Product) => {
              const img = imageUrl(p);
              return (
                <div key={p.id} className="admin-product-card">
                  {img && (
                    <div className="admin-product-img">
                      <img src={img} alt={p.title} />
                    </div>
                  )}
                  <div className="admin-product-body">
                    <h3>{p.title}</h3>
                    <div className="admin-product-meta">
                      <span>{p.price} {p.currency}</span>
                      <span>📍 {p.city ?? '—'}</span>
                    </div>
                    <div className="admin-product-date">
                      طلب منذ: {new Date(p.promotion_requested_at || p.created_at).toLocaleDateString('ar-MR')}
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        style={{
                          background: 'var(--color-bg-card)',
                          color: 'var(--color-text)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 12,
                        }}
                      >
                        <option value={3}>3 أيام</option>
                        <option value={7}>7 أيام</option>
                        <option value={14}>14 يوم</option>
                        <option value={30}>30 يوم</option>
                      </select>
                    </div>
                    <div className="admin-product-actions">
                      <button
                        className="admin-btn admin-btn--approve"
                        onClick={() => handle('approve', p.id, days)}
                        disabled={pending}
                      >
                        ⭐ موافقة
                      </button>
                      <button
                        className="admin-btn admin-btn--reject"
                        onClick={() => handle('reject', p.id)}
                        disabled={pending}
                      >
                        ❌ رفض
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Currently promoted ── */}
      <div className="admin-section">
        <h2>⭐ منتجات مميزة حالياً ({promoted.length})</h2>
        {promoted.length === 0 ? (
          <div className="admin-empty">لا توجد منتجات مميزة</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>السعر</th>
                  <th>المدينة</th>
                  <th>ينتهي</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {promoted.map((p: Product) => (
                  <tr key={p.id}>
                    <td className="admin-td-title">⭐ {p.title}</td>
                    <td>{p.price} {p.currency}</td>
                    <td>{p.city ?? '—'}</td>
                    <td>{p.promoted_until ? new Date(p.promoted_until).toLocaleDateString('ar-MR') : '—'}</td>
                    <td>
                      <button
                        className="admin-btn admin-btn--reject"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => handle('revoke', p.id)}
                        disabled={pending}
                      >
                        ❌ إلغاء
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
