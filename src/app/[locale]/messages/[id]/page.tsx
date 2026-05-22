import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { cast } from '@/lib/supabase/helpers';
import ChatRoom, { type ChatMessage } from '@/components/chat/ChatRoom';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

interface ConversationRow {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string | null;
  buyer: { id: string; full_name: string | null; avatar_url: string | null } | null;
  seller: { id: string; full_name: string | null; avatar_url: string | null } | null;
  product: { id: string; title: string } | null;
}

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ locale: AppLocale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

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
      `id, buyer_id, seller_id, product_id,
       buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url),
       seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url),
       product:products(id, title)`,
    )
    .eq('id', id)
    .maybeSingle();

  const conv = cast<ConversationRow | null>(data);
  if (!conv) notFound();
  if (conv.buyer_id !== userId && conv.seller_id !== userId) notFound();

  const peer = conv.buyer_id === userId ? conv.seller : conv.buyer;
  if (!peer) notFound();

  const { data: messages } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, content, created_at')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true })
    .limit(200);

  return (
    <ChatRoom
      conversationId={conv.id}
      selfId={userId}
      peer={peer}
      initialMessages={cast<ChatMessage[]>(messages ?? [])}
      productId={conv.product?.id ?? null}
      productTitle={conv.product?.title ?? null}
      locale={locale}
    />
  );
}
