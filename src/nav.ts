export function initNav(doc: Document): void {
  const header = doc.querySelector<HTMLElement>('.site-header');
  const toggle = doc.querySelector<HTMLButtonElement>('.nav__toggle');
  const menu = doc.getElementById('nav-menu');
  if (!header || !toggle || !menu) {
    return;
  }

  const isOpen = (): boolean => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open: boolean): void => {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('is-open', open);
  };

  header.classList.add('has-js');
  toggle.hidden = false;
  toggle.addEventListener('click', () => setOpen(!isOpen()));
  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setOpen(false);
    }
  });
  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
}
