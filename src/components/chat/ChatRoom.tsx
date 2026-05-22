'use client';

import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { sendMessageAction, markConversationReadAction } from '@/app/[locale]/messages/actions';
import { formatTime } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Props {
  conversationId: string;
  selfId: string;
  peer: { id: string; full_name: string | null; avatar_url: string | null };
  initialMessages: ChatMessage[];
  productId?: string | null;
  productTitle?: string | null;
  locale: AppLocale;
}

export default function ChatRoom({
  conversationId,
  selfId,
  peer,
  initialMessages,
  productId,
  productTitle,
  locale,
}: Props) {
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, startSending] = useTransition();
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Mark conversation as read on mount
  useEffect(() => {
    void markConversationReadAction(conversationId);
  }, [conversationId]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
          );
          if (msg.sender_id !== selfId) {
            void markConversationReadAction(conversationId);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, selfId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    setInput('');

    // Optimistic insert
    const optimistic: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: selfId,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    startSending(async () => {
      const result = await sendMessageAction({ conversationId, content });
      if (!result.ok) {
        // revert optimistic on error
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setInput(content);
      }
      router.refresh();
    });
  };

  return (
    <div className="chat-room">
      <header className="chat-header">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={tCommon('back')}
          className="btn-nav"
          style={{ padding: '6px 10px' }}
        >
          ←
        </button>
        <div className="chat-avatar" style={{ width: 38, height: 38 }}>
          {peer.avatar_url ? (
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="chat-name">{peer.full_name ?? '—'}</div>
          {productId && productTitle ? (
            <Link
              href={`/product/${productId}`}
              style={{ fontSize: 11, color: 'var(--color-accent)' }}
            >
              {productTitle}
            </Link>
          ) : null}
        </div>
      </header>

      <div ref={scrollerRef} className="chat-messages">
        {messages.map((m) => {
          const mine = m.sender_id === selfId;
          return (
            <div
              key={m.id}
              className={`msg-bubble ${mine ? 'mine' : 'theirs'}`}
              style={{ alignSelf: mine ? 'flex-end' : 'flex-start' }}
            >
              {m.content}
              <div className="msg-time">{formatTime(m.created_at, locale)}</div>
            </div>
          );
        })}
      </div>

      <form className="chat-composer" onSubmit={onSubmit}>
        <input
          className="input-field"
          name="content"
          autoComplete="off"
          placeholder={t('writePlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={sending || input.trim().length === 0}
          style={{ padding: '10px 20px' }}
        >
          {t('sendButton')}
        </button>
      </form>
    </div>
  );
}
