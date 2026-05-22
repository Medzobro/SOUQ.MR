import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect, Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { cast } from '@/lib/supabase/helpers';
import { formatRelative } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

interface ConversationRow {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  buyer_unread_count: number;
  seller_unread_count: number;
  buyer: { id: string; full_name: string | null; avatar_url: string | null } | null;
  seller: { id: string; full_name: string | null; avatar_url: string | null } | null;
  product: { id: string; title: string } | null;
}

export default async function MessagesListPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('messages');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: '/auth', locale });
  }

  const userId = user!.id;
  const { data } = await supabase
    .from('conversations')
    .select(
      `id, buyer_id, seller_id, product_id, last_message_at, last_message_preview,
       buyer_unread_count, seller_unread_count,
       buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url),
       seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url),
       product:products(id, title)`,
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('last_message_at', { ascending: false })
    .limit(100);

  const conversations = cast<ConversationRow[]>(data ?? []);

  return (
    <div style={{ paddingTop: 70, paddingBottom: 100 }}>
      <div style={{ padding: '0 20px 12px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>{t('title')}</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <p>{t('empty')}</p>
          <p style={{ marginTop: 8, fontSize: 13 }}>{t('emptyHint')}</p>
        </div>
      ) : (
        <div>
          {conversations.map((c) => {
            const isBuyer = c.buyer_id === userId;
            const peer = isBuyer ? c.seller : c.buyer;
            const unread = isBuyer ? c.buyer_unread_count : c.seller_unread_count;
            return (
              <Link key={c.id} href={`/messages/${c.id}`} className="chat-row">
                <div className="chat-avatar">
                  {peer?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={peer.avatar_url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }}
                    />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="chat-content">
                  <div className="chat-name">{peer?.full_name ?? '—'}</div>
                  <div className="chat-preview">
                    {c.product ? `[${c.product.title}] ` : ''}
                    {c.last_message_preview ?? '...'}
                  </div>
                </div>
                <div className="chat-meta">
                  <span>{formatRelative(c.last_message_at, locale)}</span>
                  {unread > 0 ? <span className="chat-unread-badge">{unread}</span> : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
