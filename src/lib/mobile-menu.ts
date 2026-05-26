export function initMobileMenu(): void {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const menuClose = document.getElementById('mobile-menu-close');
  const menu = document.getElementById('mobile-menu');

  function openMenu() {
    menu?.classList.remove('translate-x-full');
    menu?.classList.add('translate-x-0');
    menuBtn?.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu?.classList.add('translate-x-full');
    menu?.classList.remove('translate-x-0');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }

  menuBtn?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);

  menu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.classList.contains('translate-x-0')) {
      closeMenu();
    }
  });
}
