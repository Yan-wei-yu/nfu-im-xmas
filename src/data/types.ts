export type LightColor = 'ice' | 'pine' | 'berry';

export type IconName = 'chip' | 'chart' | 'briefcase' | 'globe' | 'trophy' | 'cap';

export type HighlightId = 'ai' | 'data' | 'intern' | 'global' | 'project' | 'career';

export interface Link {
  readonly label: string;
  readonly url: string;
}

export interface Highlight {
  readonly id: HighlightId;
  readonly title: string;
  readonly tagline: string;
  readonly points: readonly [string, string];
  readonly links: readonly Link[];
  readonly color: LightColor;
  readonly icon: IconName;
  /** 吊飾位置：layer 從 1 起算（樹頂），index 從該層最左邊 0 起算 */
  readonly ornament: { readonly layer: number; readonly index: number };
}

export interface Gift {
  readonly date: string;
  readonly category: '亮眼成果' | '學長姐故事';
  readonly title: string;
  readonly url: string;
}

export type Stat =
  | { readonly kind: 'ring'; readonly value: number; readonly suffix: string; readonly label: string }
  | { readonly kind: 'count'; readonly value: number; readonly suffix: string; readonly label: string }
  | { readonly kind: 'venn'; readonly parts: readonly [string, string, string]; readonly label: string };

export interface Site {
  readonly meta: {
    readonly title: string;
    readonly description: string;
    readonly url: string;
    readonly ogImage: string;
    readonly themeColor: string;
  };
  readonly nav: { readonly brand: string; readonly items: readonly Link[]; readonly official: Link };
  readonly hero: {
    readonly org: string;
    readonly eyebrow: string;
    readonly titleLines: readonly [string, string];
    readonly subtitle: string;
    readonly countdownFallback: string;
    readonly treeLabel: string;
  };
  readonly highlightsSection: { readonly title: string; readonly lead: string };
  readonly highlights: readonly Highlight[];
  readonly giftsSection: { readonly title: string; readonly lead: string; readonly video: Link; readonly more: Link };
  readonly gifts: readonly Gift[];
  readonly statsSection: { readonly title: string };
  readonly stats: readonly Stat[];
  readonly partnersSection: { readonly title: string };
  readonly partners: readonly string[];
  readonly cta: { readonly title: string; readonly lead: string; readonly primary: Link; readonly secondary: Link };
  readonly footer: {
    readonly org: string;
    readonly address: string;
    readonly tel: string;
    readonly fax: string;
    readonly email: string;
    readonly quickLinks: readonly Link[];
    readonly disclaimer: string;
  };
}
