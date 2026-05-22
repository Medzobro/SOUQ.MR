import type { ReactNode } from 'react';

/**
 * Empty pass-through root layout.
 * The real <html>/<body> live in src/app/[locale]/layout.tsx
 * because next-intl needs the locale to set lang/dir attributes.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
