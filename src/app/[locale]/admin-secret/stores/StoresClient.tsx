'use client';

type Store = any;

export function StoresClient({ stores }: { stores: Store[] }) {
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
            {stores.map((s: any) => (
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
    </div>
  );
}
