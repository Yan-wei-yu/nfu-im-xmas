import type { IconName } from '../data/types.ts';

const SHAPES: Readonly<Record<IconName, string>> = {
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  chart: '<path d="M3 21h18"/><rect x="5" y="12" width="3" height="7"/><rect x="10.5" y="8" width="3" height="11"/><rect x="16" y="4" width="3" height="15"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM12 13v4M8 20h8M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
};

export function renderIcon(name: IconName): string {
  return (
    '<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" ' +
    `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SHAPES[name]}</svg>`
  );
}
