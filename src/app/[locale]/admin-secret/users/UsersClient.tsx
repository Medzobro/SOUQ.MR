'use client';

import { useState, useTransition } from 'react';
import { getUsers } from '../actions';

interface User {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  city: string | null;
  created_at: string;
}

export function UsersClient({
  users: initialUsers,
  nextCursor: initialCursor,
  makeAdmin,
}: {
  users: User[];
  nextCursor: string | null;
  makeAdmin: (id: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState('');

  async function loadMore() {
    setLoading(true);
    const result = await getUsers({ cursor: cursor ?? undefined });
    setUsers((prev) => [...prev, ...result.data]);
    setCursor(result.nextCursor);
    setLoading(false);
  }

  async function handleMakeAdmin(userId: string) {
    start(async () => {
      const result = await makeAdmin(userId);
      setMsg(result.ok ? '✅ تم ترقية المستخدم إلى مشرف' : `❌ ${result.error}`);
      setTimeout(() => setMsg(''), 3000);
    });
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">👥 المستخدمين</h1>
      <p className="admin-page-sub">{users.length} مستخدم</p>
      {msg && <div className="admin-toast">{msg}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>الدور</th>
              <th>المدينة</th>
              <th>التسجيل</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: User) => (
              <tr key={u.id}>
                <td className="admin-td-title">{u.full_name ?? '—'}</td>
                <td dir="ltr">{u.phone ?? '—'}</td>
                <td>
                  <span className={`admin-role-badge${u.role === 'admin' ? ' admin-role-badge--admin' : ''}`}>
                    {u.role === 'admin' ? 'مشرف' : u.role === 'seller' ? 'بائع' : 'مشتري'}
                  </span>
                </td>
                <td>{u.city ?? '—'}</td>
                <td>{new Date(u.created_at).toLocaleDateString('ar-MR')}</td>
                <td>
                  {u.role !== 'admin' && (
                    <button
                      className="admin-btn-small"
                      onClick={() => handleMakeAdmin(u.id)}
                      disabled={pending}
                    >
                      ⬆️ مشرف
                    </button>
                  )}
                </td>
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
