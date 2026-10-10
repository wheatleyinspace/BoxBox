export namespace BoxBox {
  export interface Game {
    id: number;
    title: string;
    products: number[];
    description: Record<string, string>;
    duration: number;
    minPlayerCount: number;
    maxPlayerCount: number;
    languages: string[];
    colors: {
      primary: string;
      secondary: string;
    };
    types: string[];
    features: string[];
    personas?: string[];
    tags?: string[];
    launchInfo?: Record<number, { path: string }>;
    zendeskId?: Record<number, string>;
  }

  export type GamesJSON = Game[];

  export interface Product {
    id: number;
    title: string;
    type?: string;
    steamAppId?: number;
    games?: number[];
    price?: {
      initialFormatted?: string;
      finalFormatted?: string;
      discount?: number;
    };
    releaseDate?: string;
    isOwned?: boolean;
    isInstalled?: boolean;
    isInstallable?: boolean;
    isFree?: boolean;
  }

  export type ProductsJSON = Product[];

  export interface HomeModule {
    kind: "hero" | "games" | "gameFeature" | "message";
    category?: string;
    title?: string;
    emptyText?: string;
    willChange?: boolean;
    size?: "small" | "large";
    image?: string;
    youtubeId?: string;
    url?: string;
    cta?: {
      label?: string;
      url?: string;
      color?: string;
      backgroundColor?: string;
    };
    isMature?: boolean;
    text?: string;
    color?: string;
    backgroundColor?: string;
    hoverColor?: string;
  }

  export interface HomeJSON {
    modules: HomeModule[];
    i18n?: Record<string, any>;
  }

  export interface User {
    steamId?: string;
    favorites?: number[];
    recentlyPlayed?: number[];
    entitlements?: number[];
  }
}
