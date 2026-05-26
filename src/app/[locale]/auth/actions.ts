'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/format';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2).max(80),
  phone: z.string().optional().nullable(),
  role: z.enum(['buyer', 'seller']),
  storeName: z.string().optional().nullable(),
});

export type AuthState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function signInAction(_prev: AuthState | null, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { ok: false, error: 'errorInvalidCredentials' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, error: 'errorInvalidCredentials' };
  }

  // Auto-promote admin emails
  const ADMIN_EMAILS = ['admin@market.mr', 'mohamed2024ar@gmail.com'];
  if (ADMIN_EMAILS.includes(parsed.data.email.toLowerCase())) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Use any cast to bypass Supabase type-chain regression
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('profiles').update({ role: 'admin' }).eq('id', user.id);
      }
    } catch {
      // Non-critical — profile will be fixed on next login if this fails
    }
  }

  redirect('/');
}

export async function signUpAction(_prev: AuthState | null, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    role: formData.get('role'),
    storeName: formData.get('storeName'),
  });

  if (!parsed.success) {
    return { ok: false, error: 'errorGeneric' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone ?? null,
        role: parsed.data.role,
      },
      emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        : undefined,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('registered')) {
      return { ok: false, error: 'errorEmailExists' };
    }
    return { ok: false, error: 'errorGeneric' };
  }

  // If a session is returned (email confirmation disabled), create the store immediately for sellers
  if (parsed.data.role === 'seller' && parsed.data.storeName && data.user) {
    const slugBase = slugify(parsed.data.storeName) || `store-${data.user.id.slice(0, 8)}`;
    await supabase.from('stores').insert({
      owner_id: data.user.id,
      name: parsed.data.storeName,
      slug: `${slugBase}-${data.user.id.slice(0, 6)}`,
      phone: parsed.data.phone ?? null,
    } as never);
  }

  // If session is set, go home; otherwise show "check email" message
  if (data.session) {
    redirect('/');
  }

  return { ok: true, message: 'successCheckEmail' };
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    redirect('/auth?error=google');
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
