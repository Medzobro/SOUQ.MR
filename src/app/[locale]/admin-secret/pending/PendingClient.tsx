'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';

type Product = any;

export function PendingClient({
  products,
  approveProduct,
  rejectProduct,
  deleteProduct,
}: {
  products: Product[];
  approveProduct: (id: string) => Promise<{ ok: boolean; error?: string }>;
  rejectProduct: (id: string) => Promise<{ ok: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState('');

  async function handle(id: string, action: 'approve' | 'reject' | 'delete') {
    start(async () => {
      let result;
      if (action === 'approve') result = await approveProduct(id);
      else if (action === 'reject') result = await rejectProduct(id);
      else result = await deleteProduct(id);
      setMsg(result.ok ? '✅ تم!' : `❌ ${result.error}`);
      setTimeout(() => setMsg(''), 3000);
    });
  }

  function imageUrl(p: Product) {
    if (!p.product_images?.length) return null;
    const sorted = [...p.product_images].sort((a: any, b: any) => a.sort_order - b.sort_order);
    return sorted[0]?.url;
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">⏳ إعلانات قيد المراجعة</h1>
      <p className="admin-page-sub">{products.length} إعلان بانتظار الموافقة</p>
      {msg && <div className="admin-toast">{msg}</div>}

      {products.length === 0 ? (
        <div className="admin-empty">🎉 كل الإعلانات تمت مراجعتها</div>
      ) : (
        <div className="admin-cards-grid">
          {products.map((p) => {
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
                  {p.description && <p className="admin-product-desc">{p.description.slice(0, 120)}{p.description.length > 120 ? '...' : ''}</p>}
                  <div className="admin-product-date">{new Date(p.created_at).toLocaleDateString('ar-MR')}</div>
                  <div className="admin-product-actions">
                    <button
                      className="admin-btn admin-btn--approve"
                      onClick={() => handle(p.id, 'approve')}
                      disabled={pending}
                    >
                      ✅ موافقة
                    </button>
                    <button
                      className="admin-btn admin-btn--reject"
                      onClick={() => handle(p.id, 'reject')}
                      disabled={pending}
                    >
                      ❌ رفض
                    </button>
                    <button
                      className="admin-btn admin-btn--delete"
                      onClick={() => handle(p.id, 'delete')}
                      disabled={pending}
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
