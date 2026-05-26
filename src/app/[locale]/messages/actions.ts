'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { cast } from '@/lib/supabase/helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: Awaited<ReturnType<typeof createClient>>): any {
  return supabase;
}

const startSchema = z.object({
  sellerId: z.string().uuid(),
  productId: z.string().uuid().optional().nullable(),
});

export type StartConversationResult =
  | { ok: true; conversationId: string }
  | { ok: false; needsAuth?: boolean; error?: string };

/** Get-or-create a conversation between the current user (buyer) and a seller. */
export async function startConversationAction(input: {
  sellerId: string;
  productId?: string | null;
}): Promise<StartConversationResult> {
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, needsAuth: true };
  if (user.id === parsed.data.sellerId) return { ok: false, error: 'self' };

  const productId = parsed.data.productId ?? null;

  // Look for an existing conversation
  const baseQuery = supabase
    .from('conversations')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('seller_id', parsed.data.sellerId);

  const existingResult = productId
    ? await baseQuery.eq('product_id', productId).maybeSingle()
    : await baseQuery.is('product_id', null).maybeSingle();

  let conversationId: string | null = cast<{ id: string } | null>(existingResult.data)?.id ?? null;

  if (!conversationId) {
    const { data: created, error } = await db(supabase)
      .from('conversations')
      .insert({
        buyer_id: user.id,
        seller_id: parsed.data.sellerId,
        product_id: productId,
      })
      .select('id')
      .single();
    if (error || !created) return { ok: false, error: 'create_failed' };
    conversationId = cast<{ id: string }>(created).id;
  }

  return { ok: true, conversationId };
}

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().trim().min(1).max(2000),
});

export async function sendMessageAction(input: {
  conversationId: string;
  content: string;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const { error } = await db(supabase).from('messages').insert({
    conversation_id: parsed.data.conversationId,
    sender_id: user.id,
    content: parsed.data.content,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Mark all messages in a conversation as read for the current user. */
export async function markConversationReadAction(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .single();
  const conv = cast<{ buyer_id: string; seller_id: string } | null>(data);
  if (!conv) return;

  const isBuyer = conv.buyer_id === user.id;
  await db(supabase)
    .from('conversations')
    .update(isBuyer ? { buyer_unread_count: 0 } : { seller_unread_count: 0 })
    .eq('id', conversationId);
}
