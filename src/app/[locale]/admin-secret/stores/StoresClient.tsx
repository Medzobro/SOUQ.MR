'use client';

import { useState } from 'react';
import { getStores } from '../actions';

interface Store {
  id: string;
  name: string;
  city: string | null;
  products_count: number;
  followers_count: number;
  is_verified: boolean;
  created_at: string;
}

export function StoresClient({
  stores: initialStores,
  nextCursor: initialCursor,
}: {
  stores: Store[];
  nextCursor: string | null;
}) {
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    const result = await getStores({ cursor: cursor ?? undefined });
    setStores((prev) => [...prev, ...result.data]);
    setCursor(result.nextCursor);
    setLoading(false);
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">🏪 المتاجر</h1>
      <p className="admin-page-sub">{stores.length} متجر</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>المتجر</th>
              <th>المدينة</th>
              <th>المنتجات</th>
              <th>المتابعين</th>
              <th>موثق</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s: Store) => (
              <tr key={s.id}>
                <td className="admin-td-title">{s.name}</td>
                <td>{s.city ?? '—'}</td>
                <td>{s.products_count}</td>
                <td>{s.followers_count}</td>
                <td>{s.is_verified ? '✅' : '❌'}</td>
                <td>{new Date(s.created_at).toLocaleDateString('ar-MR')}</td>
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
