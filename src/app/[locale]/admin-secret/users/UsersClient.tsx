'use client';

import { useState, useTransition } from 'react';

type User = any;

export function UsersClient({
  users,
  makeAdmin,
}: {
  users: User[];
  makeAdmin: (id: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState('');

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
            {users.map((u: any) => (
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
    </div>
  );
}
