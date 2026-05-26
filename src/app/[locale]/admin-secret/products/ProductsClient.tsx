'use client';

type Product = any;

const statusColors: Record<string, string> = {
  active: '#2ecc71',
  pending: '#f0c040',
  sold: '#3498db',
  hidden: '#e74c3c',
};

export function ProductsClient({ products }: { products: Product[] }) {
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
            {products.map((p: any) => (
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
    </div>
  );
}
