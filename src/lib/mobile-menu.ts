export function initMobileMenu(): void {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const menuClose = document.getElementById('mobile-menu-close');
  const menu = document.getElementById('mobile-menu');

  menuBtn?.addEventListener('click', () => {
    menu?.classList.remove('translate-x-full');
    menu?.classList.add('translate-x-0');
  });

  menuClose?.addEventListener('click', () => {
    menu?.classList.add('translate-x-full');
    menu?.classList.remove('translate-x-0');
  });

  menu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu?.classList.add('translate-x-full');
      menu?.classList.remove('translate-x-0');
    });
  });
}
