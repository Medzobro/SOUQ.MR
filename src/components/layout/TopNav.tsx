'use client';

import { Link, usePathname } from '@/i18n/routing';
import HamburgerMenu from './HamburgerMenu';

/**
 * Minimal sticky top navigation.
 * Only shows the logo and hamburger menu (≡).
 * Hidden on /auth and /admin-secret.
 */
export default function TopNav() {
  const pathname = usePathname();

  if (pathname.includes('/auth') || pathname.includes('/admin-secret')) return null;

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        SOUQ.MR
      </Link>

      <HamburgerMenu />
    </nav>
  );
}
