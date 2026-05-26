'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const links = [
  { href: '/ar/admin-secret', label: '📊 الرئيسية', exact: true },
  { href: '/ar/admin-secret/users', label: '👥 المستخدمين' },
  { href: '/ar/admin-secret/stores', label: '🏪 المتاجر' },
  { href: '/ar/admin-secret/products', label: '📦 المنتجات' },
  { href: '/ar/admin-secret/pending', label: '⏳ قيد المراجعة' },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <Link href="/ar/admin-secret" className="admin-logo">
          SOUQ.MR
        </Link>
        <span className="admin-badge">لوحة التحكم</span>
      </div>

      <div className="admin-user-info">
        <div className="admin-avatar">🛡️</div>
        <span className="admin-user-name">{userName}</span>
        <span className="admin-role-tag">مشرف</span>
      </div>

      <nav className="admin-nav">
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`admin-nav-link${active ? ' admin-nav-link--active' : ''}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <Link href="/ar" className="admin-nav-link" style={{ opacity: 0.5 }}>
          ⬅ العودة للموقع
        </Link>
      </div>
    </aside>
  );
}
