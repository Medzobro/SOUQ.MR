'use client';

import { useState } from 'react';
import { getAllProducts } from '../actions';

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  city: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  active: '#2ecc71',
  pending: '#f0c040',
  sold: '#3498db',
  hidden: '#e74c3c',
};

export function ProductsClient({
  products: initialProducts,
  nextCursor: initialCursor,
}: {
  products: Product[];
  nextCursor: string | null;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    const result = await getAllProducts({ cursor: cursor ?? undefined });
    setProducts((prev) => [...prev, ...result.data]);
    setCursor(result.nextCursor);
    setLoading(false);
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">📦 كل المنتجات</h1>
      <p className="admin-page-sub">{products.length} منتج</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>السعر</th>
              <th>المدينة</th>
              <th>الحالة</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: Product) => (
              <tr key={p.id}>
                <td className="admin-td-title">{p.title}</td>
                <td>{p.price} {p.currency}</td>
                <td>{p.city ?? '—'}</td>
                <td>
                  <span
                    className="admin-status-badge"
                    style={{ background: statusColors[p.status] ?? '#666' }}
                  >
                    {p.status === 'active' ? 'نشط' : p.status === 'pending' ? 'معلق' : p.status === 'sold' ? 'مباع' : 'مخفي'}
                  </span>
                </td>
                <td>{new Date(p.created_at).toLocaleDateString('ar-MR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cursor && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            className="admin-btn-small"
            onClick={loadMore}
            disabled={loading}
            style={{ padding: '10px 32px', fontSize: 14 }}
          >
            {loading ? '⏳ جاري التحميل...' : '📥 تحميل المزيد'}
          </button>
        </div>
      )}
    </div>
  );
}
