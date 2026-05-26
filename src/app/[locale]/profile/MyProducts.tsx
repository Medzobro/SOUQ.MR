'use client';

import { useState, useTransition } from 'react';
import {
  getMyProducts,
  deleteMyProduct,
  markAsSold,
  requestPromotion,
} from './product-actions';

type Product = any;

function imageUrl(p: Product) {
  if (!p.product_images?.length) return null;
  const sorted = [...p.product_images].sort((a: any, b: any) => a.sort_order - b.sort_order);
  return sorted[0]?.url;
}

export function MyProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState('');

  function load() {
    start(async () => {
      const data = await getMyProducts();
      setProducts(data);
      setLoaded(true);
    });
  }

  async function handle(action: string, id: string) {
    start(async () => {
      let result;
      if (action === 'delete') result = await deleteMyProduct(id);
      else if (action === 'sold') result = await markAsSold(id);
      else if (action === 'promote') result = await requestPromotion(id);
      setMsg(result?.ok ? '✅ تم!' : `❌ ${result?.error}`);
      setTimeout(() => setMsg(''), 3000);
      // Reload
      const data = await getMyProducts();
      setProducts(data);
    });
  }

  if (!loaded) {
    return (
      <div className="profile-section">
        <h3>📦 إعلاناتي</h3>
        <button className="btn-primary" onClick={load} style={{ marginTop: 12 }}>
          عرض إعلاناتي
        </button>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <h3>📦 إعلاناتي ({products?.length ?? 0})</h3>
      {msg && <div className="admin-toast">{msg}</div>}

      {!products || products.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 24 }}>
          لا توجد إعلانات حتى الآن
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {products.map((p: Product) => {
            const img = imageUrl(p);
            const statusColors: Record<string, string> = {
              active: '#2ecc71',
              pending: '#f0c040',
              sold: '#3498db',
              hidden: '#e74c3c',
            };
            const statusLabels: Record<string, string> = {
              active: 'نشط',
              pending: 'قيد المراجعة',
              sold: 'تم البيع',
              hidden: 'مخفي',
            };
            return (
              <div
                key={p.id}
                style={{
                  background: 'var(--color-bg-card-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  gap: 14,
                }}
              >
                {img && (
                  <img
                    src={img}
                    alt={p.title}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 8,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                    {p.title}
                    {p.is_promoted && ' ⭐'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {p.price} {p.currency} · {p.city ?? '—'} ·{' '}
                    <span
                      style={{
                        background: statusColors[p.status] ?? '#666',
                        color: '#000',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {statusLabels[p.status] ?? p.status}
                    </span>
                    {p.promotion_requested && !p.is_promoted && (
                      <span
                        style={{
                          background: 'rgba(240,192,64,0.2)',
                          color: '#f0c040',
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: 11,
                          marginRight: 8,
                        }}
                      >
                        ⏳ ترويج معلق
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {new Date(p.created_at).toLocaleDateString('ar-MR')}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                  {p.status === 'active' && (
                    <>
                      <button
                        className="admin-btn admin-btn--approve"
                        style={{ fontSize: 11, padding: '5px 10px' }}
                        onClick={() => handle('sold', p.id)}
                        disabled={pending}
                      >
                        ✅ مباع
                      </button>
                      {!p.is_promoted && !p.promotion_requested && (
                        <button
                          className="admin-btn admin-btn--approve"
                          style={{ fontSize: 11, padding: '5px 10px', background: '#f0c040' }}
                          onClick={() => handle('promote', p.id)}
                          disabled={pending}
                        >
                          ⭐ ترويج
                        </button>
                      )}
                    </>
                  )}
                  <button
                    className="admin-btn admin-btn--delete"
                    style={{ fontSize: 11, padding: '5px 10px' }}
                    onClick={() => handle('delete', p.id)}
                    disabled={pending}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
