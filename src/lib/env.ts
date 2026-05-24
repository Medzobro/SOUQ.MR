import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Missing Supabase anon key'),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default('http://localhost:3000')
    .transform((url, ctx) => {
      if (
        process.env.NODE_ENV === 'production' &&
        url === 'http://localhost:3000'
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'NEXT_PUBLIC_SITE_URL should be set to your production URL',
        });
      }
      return url;
    }),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .optional()
    .describe('Server-only: service role key for admin operations'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `❌ Invalid environment variables:\n${errors}\n\nCheck your .env.local file. See .env.example for required values.`,
    );
  }

  return parsed.data;
}

export const env = validateEnv();
