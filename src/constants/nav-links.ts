export interface NavLink {
  key: string;
  path: string;
}

export const navLinks: NavLink[] = [
  { key: 'menu.home', path: '/' },
  { key: 'menu.about', path: '/about' },
  { key: 'menu.skills', path: '/skills' },
  { key: 'menu.works', path: '/experience' },
  { key: 'menu.projects', path: '/projects' },
  { key: 'menu.contact', path: '/contact' },
];
