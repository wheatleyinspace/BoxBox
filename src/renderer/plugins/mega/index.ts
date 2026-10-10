import type { App } from "vue";
import { reactive, watch } from "vue";
import slugify from "slugify";

export class BaseModel {
  mega: MegaPickerService;
  data: any;

  constructor(options: { mega: MegaPickerService; data: any }) {
    this.mega = options.mega;
    this.data = reactive(options.data || {});
  }

  update(data: any) {
    Object.assign(this.data, data);
  }
}

export class Product extends BaseModel {
  get releaseDate(): Date | undefined {
    if (this.data.releaseDate) return new Date(this.data.releaseDate);
  }

  get games(): Game[] {
    return this.mega.games.filter((t: Game) => t.data.products?.includes(this.data.id));
  }

  get isInstallable(): boolean {
    return this.data.type === "pack" || this.data.type === "standalone";
  }

  get isOwned(): boolean {
    return this.mega.user?.data?.ownedProductIds?.includes(this.data.id) ?? false;
  }

  get isInstalled(): boolean {
    return this.data.installDir !== undefined;
  }

  get isDiscounted(): boolean {
    return this.data.price?.discount ? this.data.price.discount > 0 : false;
  }

  get isFree(): boolean {
    return this.data.price?.discount ? this.data.price.discount === 100 : false;
  }

  get isUnreleased(): boolean {
    return this.releaseDate ? this.releaseDate > new Date() : false;
  }

  get slug(): string {
    return slugify(this.data.title || "", { lower: true });
  }
}

export class Game extends BaseModel {
  get products(): Product[] {
    return this.mega.products.filter((t: Product) => this.data.products?.includes(t.data.id));
  }

  get description(): string {
    const lang = this.mega.settings?.language || "en";
    return this.data.description?.[lang] ?? this.data.description?.en ?? "";
  }

  get releaseDate(): Date | undefined {
    const t = this.products;
    if (!t.length) return undefined;
    let s = t[0].releaseDate;
    if (t.length > 1) {
      t.forEach((n) => {
        const i = n.releaseDate;
        if (i && s && i.getTime() < s.getTime()) s = i;
      });
    }
    return s;
  }

  get installableProducts(): Product[] {
    return this.mega.products.filter((t: Product) =>
      t.isInstallable ? this.data.products?.includes(t.data.id) : false
    );
  }

  get ownedInstallableProducts(): Product[] {
    return this.mega.products.filter((t: Product) =>
      !t.isInstallable || !t.isOwned ? false : this.data.products?.includes(t.data.id)
    );
  }

  get isOwned(): boolean {
    return this.products.some((t: Product) => t.isOwned);
  }

  get isInstalled(): boolean {
    return this.products.some((t: Product) => t.isInstalled);
  }

  get isFavorited(): boolean {
    return this.mega.user?.data?.favorites?.includes(this.data.id) ?? false;
  }

  get isRecentlyPlayed(): boolean {
    return this.mega.user?.data?.recentlyPlayed?.includes(this.data.id) ?? false;
  }

  get isMature(): boolean {
    return this.data.tags?.includes("mature") ?? false;
  }

  get slug(): string {
    return slugify(this.data.title || "", { lower: true });
  }
}

export class User extends BaseModel {
  get products(): Product[] {
    return this.mega.products.filter((t: Product) =>
      this.data.ownedProductIds?.includes(t.data.id)
    );
  }

  get games(): Game[] {
    return this.mega.games.filter((t: Game) => t.isOwned === true);
  }

  get favorites(): Game[] {
    const t: Game[] = [];
    this.data.favorites?.forEach((s: number) => {
      const n = this.mega.getGameById(s);
      if (n) t.push(n);
    });
    return t;
  }

  get recentlyPlayed(): Game[] {
    const t: Game[] = [];
    this.data.recentlyPlayed?.forEach((s: number) => {
      const n = this.mega.getGameById(s);
      if (n) t.push(n);
    });
    return t;
  }

  get isLoggedIn(): boolean {
    return !this.data.isAnonymous;
  }

  get localeInfo(): any {
    return this.data.localeInfo;
  }
}

export class Module extends BaseModel {}

export class GameFeatureModule extends Module {
  get game(): Game | undefined {
    return this.mega.getGameById(this.data.gameId);
  }
}

export class GamesModule extends Module {
  get games(): Game[] {
    return this.data.items
      ? this.data.items.map((t: number) => this.mega.getGameById(t)).filter(Boolean)
      : [];
  }
}

export class HeroModule extends Module {}
export class MessageModule extends Module {}

export class MegaPickerService {
  port: MessagePort | null = null;
  data: Record<string, any> = reactive({
    config: {},
    env: {},
    settings: {},
    games: [] as Game[],
    products: [] as Product[],
    modules: [] as Module[],
    user: null as User | null
  });

  private callbackMap = new Map<string, Set<Function>>();
  private uniqueId = 0;

  get config(): any {
    return this.data.config;
  }

  get env(): any {
    return this.data.env;
  }

  get settings(): any {
    return this.data.settings;
  }

  get games(): Game[] {
    return this.data.games;
  }

  get products(): Product[] {
    return this.data.products;
  }

  get modules(): Module[] {
    return this.data.modules;
  }

  get user(): User | null {
    return this.data.user;
  }

  get isReady(): boolean {
    return Boolean(this.port && this.data.config && this.data.env && this.data.settings);
  }

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.onWindowMessage.bind(this));
    }
    this.on("sync", this.onSync.bind(this));
  }

  async ready(): Promise<void> {
    if (this.isReady) return;
    return new Promise((resolve) => {
      this.once("ready", resolve);
    });
  }

  onSync(payload: any) {
    if (payload.config) this.data.config = payload.config;
    if (payload.env) this.data.env = payload.env;
    if (payload.settings) this.data.settings = payload.settings;

    if (payload.products) {
      this.data.products = payload.products.map((t: any) => new Product({ mega: this, data: t }));
    }
    if (payload.games) {
      this.data.games = payload.games.map((t: any) => new Game({ mega: this, data: t }));
    }
    if (payload.user) {
      this.data.user = new User({ mega: this, data: payload.user });
    }
    if (payload.modules) {
      this.data.modules = payload.modules.map((t: any) => {
        switch (t.kind) {
          case "gameFeature":
            return new GameFeatureModule({ mega: this, data: t });
          case "games":
            return new GamesModule({ mega: this, data: t });
          case "hero":
            return new HeroModule({ mega: this, data: t });
          case "message":
            return new MessageModule({ mega: this, data: t });
          default:
            return new Module({ mega: this, data: t });
        }
      });
    }

    this.emit("didSync", payload);
    if (this.isReady) this.emit("ready");
  }

  async triggerAction(action: string, params: any = {}): Promise<any> {
    const id = ++this.uniqueId;
    return new Promise((resolve) => {
      this.once(`action:response:${id}`, (data: any) => resolve(data));
      this.send("action:call", { id, action, params });
    });
  }

  onWindowMessage(event: MessageEvent) {
    if (event.data === "messagePort" && event.ports?.length) {
      this.port = event.ports[0];
      this.port.onmessage = this.onMessage.bind(this);
      this.port.start();
      if (this.isReady) this.emit("ready");
    }
  }

  onMessage(event: MessageEvent) {
    const { key, data } = event.data || {};
    if (key) {
      const callbacks = this.callbackMap.get(key);
      callbacks?.forEach((fn) => fn(data));
    }
  }

  send(key: string, data: any) {
    this.port?.postMessage({ key, data });
  }

  getGameById(id: number | string): Game | undefined {
    return this.games.find((g) => g.data.id === id || g.data.id === Number(id));
  }

  getGameBySlug(slug: string): Game | null {
    return this.games.find((g) => g.slug === slug.toLowerCase()) ?? null;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find((p) => p.data.id === id);
  }

  getProductBySteamId(steamId: number): Product | undefined {
    return this.products.find((p) => p.data.steamId === steamId);
  }

  getProductBySlug(slug: string): Product | null {
    return this.products.find((p) => p.slug === slug.toLowerCase()) ?? null;
  }

  getLocaleInfo(): any {
    return this.user?.localeInfo;
  }

  on(event: string, fn: Function) {
    if (!this.callbackMap.has(event)) {
      this.callbackMap.set(event, new Set());
    }
    this.callbackMap.get(event)!.add(fn);
  }

  once(event: string, fn: Function) {
    const wrapped = (...args: any[]) => {
      this.off(event, wrapped);
      fn(...args);
    };
    this.on(event, wrapped);
  }

  off(event: string, fn: Function) {
    this.callbackMap.get(event)?.delete(fn);
  }

  emit(event: string, ...args: any[]) {
    this.callbackMap.get(event)?.forEach((fn) => fn(...args));
    this.send(event, args[0]);
  }
}

export const megaService = new MegaPickerService();

export default {
  install(app: App) {
    app.config.globalProperties.$mega = megaService;
  }
};
