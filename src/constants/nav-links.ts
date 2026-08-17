export interface NavLink {
  key: string;
  path: string;
}

// Funnel strategy (2026-08-12): home is an AIDA conversion landing and the
// interior pages are sales evidence. The nav stays minimal to avoid escape
// routes; the remaining pages (skills, experience, projects) are reachable
// from the home CTAs and /about links.
export const navLinks: NavLink[] = [
  { key: 'menu.home', path: '/' },
  { key: 'menu.about', path: '/about' },
  { key: 'menu.services', path: '/services' },
  { key: 'menu.contact', path: '/contact' },
];
