import { getAdminStats, getPendingProducts } from './actions';
import Link from 'next/link';

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const pending = await getPendingProducts();

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">📊 لوحة التحكم</h1>
      <p className="admin-page-sub">مرحباً بك في لوحة إدارة SOUQ.MR</p>

      {/* ── Stats cards ── */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-icon">👥</span>
          <span className="admin-stat-value">{stats.users}</span>
          <span className="admin-stat-label">مستخدم</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">🏪</span>
          <span className="admin-stat-value">{stats.stores}</span>
          <span className="admin-stat-label">متجر</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">📦</span>
          <span className="admin-stat-value">{stats.products}</span>
          <span className="admin-stat-label">منتج</span>
        </div>
        <div className="admin-stat-card admin-stat-card--pending">
          <span className="admin-stat-icon">⏳</span>
          <span className="admin-stat-value">{stats.pending}</span>
          <span className="admin-stat-label">قيد المراجعة</span>
        </div>
      </div>

      {/* ── Pending products quick list ── */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>⏳ إعلانات قيد المراجعة</h2>
          <Link href="/ar/admin-secret/pending" className="admin-link">
            عرض الكل ←
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="admin-empty">🎉 لا توجد إعلانات قيد المراجعة</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>السعر</th>
                  <th>المدينة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {pending.slice(0, 5).map((p: any) => (
                  <tr key={p.id}>
                    <td className="admin-td-title">{p.title}</td>
                    <td>{p.price} {p.currency}</td>
                    <td>{p.city ?? '—'}</td>
                    <td>{new Date(p.created_at).toLocaleDateString('ar-MR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick actions ── */}
      <div className="admin-section">
        <h2>⚡ إجراءات سريعة</h2>
        <div className="admin-quick-actions">
          <Link href="/ar/admin-secret/users" className="admin-quick-btn">
            👥 إدارة المستخدمين
          </Link>
          <Link href="/ar/admin-secret/stores" className="admin-quick-btn">
            🏪 إدارة المتاجر
          </Link>
          <Link href="/ar/admin-secret/products" className="admin-quick-btn">
            📦 كل المنتجات
          </Link>
          <Link href="/ar/admin-secret/pending" className="admin-quick-btn admin-quick-btn--warn">
            ⏳ مراجعة الإعلانات ({stats.pending})
          </Link>
        </div>
      </div>
    </div>
  );
}
