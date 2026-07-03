// @polsia:user-owned — app navigation rendered by SiteNav/SiteFooter and read by
// the sitemap. Edit it as pages are added or removed.
// This list is a convenience, not module registration.

export type NavGroup = 'primary' | 'secondary' | 'footer';

export interface NavItem {
  /** Visible link text. */
  label: string;
  /** App route, e.g. '/' or '/dashboard'. */
  href: string;
  /** Where it renders: top-nav 'primary'/'secondary', or 'footer'. */
  group: NavGroup;
  /** Group `primary` items into a dropdown: items sharing a `menu` value collapse
   *  into one "<menu> ⌄" top-bar slot (e.g. `menu: 'Resources'` on Blog/Docs/
   *  Changelog). Keeps the bar short. Ignored for 'secondary'/'footer'. */
  menu?: string;
  /** When true, render only if a session exists (see site-nav.tsx). */
  requiresAuth?: boolean;
  /** Sort key within a group (ascending); unordered items fall to the end. */
  order?: number;
}

// Keep the bar short: ~3-5 primary slots, group the tail with `menu`, push the
// rest to 'footer' (SiteNav overflows extras into a "More" dropdown).
export const navItems: NavItem[] = [
  { label: 'Submit', href: '/submit', group: 'primary', order: 0 },
  { label: 'How It Works', href: '/#how-it-works', group: 'primary', order: 1 },
  { label: 'Pricing', href: '/#pricing', group: 'primary', order: 2 },
  { label: 'Authors', href: '/authors', group: 'primary', order: 3 },
  { label: 'Dashboard', href: '/dashboard', group: 'primary', requiresAuth: true, order: 4 },
  { label: 'Sign In', href: '/login', group: 'secondary', order: 10 },
  { label: 'Get Started', href: '/signup', group: 'secondary', order: 11 },
  { label: 'How It Works', href: '/#how-it-works', group: 'footer', order: 10 },
  { label: 'Pricing', href: '/#pricing', group: 'footer', order: 11 },
  { label: 'Genre Guide', href: '/#genres', group: 'footer', order: 12 },
  { label: 'For Authors', href: '/submit', group: 'footer', order: 13 },
  { label: 'Dashboard', href: '/dashboard', group: 'footer', order: 14 },
  { label: 'Terms of Service', href: '/terms', group: 'footer', order: 20 },
  { label: 'Privacy Policy', href: '/privacy', group: 'footer', order: 21 },
  {
    label: 'Contact',
    href: 'mailto:authorbridge-publishing@polsia.app',
    group: 'footer',
    order: 25,
  },
];
