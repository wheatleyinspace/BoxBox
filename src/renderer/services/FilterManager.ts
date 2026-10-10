import { reactive, watch, toRaw } from "vue";
import { megaService } from "../plugins/mega";

function getProperty(path: string, obj: any): any {
  return path.split(".").reduce((s, n) => (s === undefined ? s : s[n]), obj);
}

class BaseFilter {
  definition: any;
  properties: any[];
  constructor(definition: any, item: any) {
    this.definition = definition;
    const keys = Array.isArray(definition.propertyKey) ? definition.propertyKey : [definition.propertyKey];
    this.properties = keys.map((k: string) => getProperty(k, item));
  }
}

class BetweenFilter extends BaseFilter {
  validate(): boolean {
    return this.definition.value === null || typeof this.definition.value !== "number" || this.properties.length !== 2
      ? false
      : typeof this.properties[0] === "number" && typeof this.properties[1] === "number";
  }
  resolve() {
    const min = Math.min(...this.properties);
    const max = Math.max(...this.properties);
    const match = this.definition.value >= min && this.definition.value <= max;
    return { score: match ? 1 : 0, isMatch: match, isPerfectMatch: match };
  }
}

class BooleanFilter extends BaseFilter {
  validate(): boolean {
    return this.definition.value === null || this.properties.length !== 1 ? false : typeof this.properties[0] === "boolean";
  }
  resolve() {
    const match = this.properties[0] === this.definition.value;
    return { score: match ? 1 : 0, isMatch: match, isPerfectMatch: match };
  }
}

class MultiFilter extends BaseFilter {
  validateArray(t: any): boolean {
    return t == null || !Array.isArray(t) ? false : t.every((s: any) => typeof s === "number" || typeof s === "string");
  }
  validate(): boolean {
    return !this.validateArray(this.definition.value) || !this.definition.value.length ? false : this.validateArray(this.properties[0]);
  }
  resolve() {
    const itemSet = new Set(this.properties[0] || []);
    const filterSet = new Set(this.definition.value || []);
    const matches: any[] = [];
    filterSet.forEach((val) => {
      if (itemSet.has(val)) matches.push(val);
    });
    const score = filterSet.size ? matches.length / filterSet.size : 0;
    return {
      score,
      isMatch: score > 0,
      isPerfectMatch: score === 1,
      matches
    };
  }
}

class QueryFilter extends BaseFilter {
  validate(): boolean {
    return this.definition.value === null || (this.definition.minLength !== undefined && this.definition.value.length < this.definition.minLength) || !this.properties.length
      ? false
      : this.properties.every((t: any) => typeof t === "string");
  }
  resolve() {
    const q = this.definition.value.toLowerCase();
    for (let t = 0; t < this.properties.length; t++) {
      if (typeof this.properties[t] === "string" && this.properties[t].toLowerCase().includes(q)) {
        return { score: 1, isMatch: true, isPerfectMatch: true };
      }
    }
    return { score: 0, isMatch: false, isPerfectMatch: false };
  }
}

class RangeFilter extends BaseFilter {
  validate(): boolean {
    return this.definition.value === null || !Array.isArray(this.definition.value) || this.definition.value.length !== 2 || typeof this.definition.value[0] !== "number" || typeof this.definition.value[1] !== "number" || this.properties.length !== 1
      ? false
      : typeof this.properties[0] === "number";
  }
  resolve() {
    const min = Math.min(...this.definition.value);
    const max = Math.max(...this.definition.value);
    const match = this.properties[0] >= min && this.properties[0] <= max;
    return { score: match ? 1 : 0, isMatch: match, isPerfectMatch: match };
  }
}

class ValueFilter extends BaseFilter {
  validate(): boolean {
    return this.definition.value === null || this.properties.length !== 1
      ? false
      : Array.isArray(this.properties[0])
      ? this.properties[0].every((t: any) => typeof t === "string" || typeof t === "number")
      : typeof this.properties[0] === "string" || typeof this.properties[0] === "number";
  }
  resolve() {
    const match = Array.isArray(this.properties[0])
      ? this.properties[0].includes(this.definition.value)
      : this.properties[0] === this.definition.value;
    return { score: match ? 1 : 0, isMatch: match, isPerfectMatch: match };
  }
}

function parseSort(sort: any) {
  return sort ? (Array.isArray(sort) ? sort : [sort]).map((t: string) => {
    let prop = t;
    const sign = t[0];
    if (sign === "+" || sign === "-") prop = t.substring(1);
    return { property: prop, direction: sign === "-" ? "ascending" : "descending" };
  }) : [];
}

function compareNumber(a: number, b: number, dir: string) {
  return dir === "ascending" ? b - a : a - b;
}
function compareBoolean(a: boolean, b: boolean, dir: string) {
  return dir === "ascending" ? (a ? -1 : 1) : (a ? 1 : -1);
}
function compareString(a: string, b: string, dir: string) {
  return dir === "ascending" ? (a < b ? 1 : -1) : (a < b ? -1 : 1);
}

function filterAndSort(items: any[], filterList: any[], sortDef: any) {
  if (!items.length) return [];
  const evaluated = items.map((item) => evaluateItem(item, filterList));
  const sortRules = parseSort(sortDef);
  return evaluated.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    for (let i = 0; i < sortRules.length; i++) {
      const valA = getProperty(sortRules[i].property, a.item);
      const valB = getProperty(sortRules[i].property, b.item);
      if (valA !== valB && typeof valA === typeof valB) {
        if (typeof valA === "number") return compareNumber(valA, valB, sortRules[i].direction);
        if (typeof valA === "boolean") return compareBoolean(valA, valB, sortRules[i].direction);
        if (typeof valA === "string") return compareString(valA, valB, sortRules[i].direction);
        if (valA instanceof Date) return compareNumber(valA.valueOf(), valB.valueOf(), sortRules[i].direction);
      }
    }
    return 0;
  });
}

function createFilter(filter: any, item: any) {
  switch (filter.kind) {
    case "between": return new BetweenFilter(filter, item);
    case "boolean": return new BooleanFilter(filter, item);
    case "multi": return new MultiFilter(filter, item);
    case "query": return new QueryFilter(filter, item);
    case "range": return new RangeFilter(filter, item);
    case "value": return new ValueFilter(filter, item);
    default: return null;
  }
}

function evaluateItem(item: any, filterList: any[]) {
  const filters = filterList.map((f) => createFilter(f, item));
  const matches: Record<string, any> = {};
  let totalWeight = 0, totalScore = 0, weightedScore = 0, isStrictFailed = false;
  filters.forEach((f) => {
    if (isStrictFailed || !f || !f.validate()) return;
    const res = f.resolve();
    if (f.definition.isStrict && !res.isPerfectMatch) {
      isStrictFailed = true;
      return;
    }
    const weight = f.definition.weight ?? 1;
    totalWeight += weight;
    totalScore += res.score;
    weightedScore += res.score * weight;
    if (res.matches) {
      let key = f.definition.key;
      if (!key) key = Array.isArray(f.definition.propertyKey) ? f.definition.propertyKey[0] : f.definition.propertyKey;
      matches[key] = res.matches;
    }
  });
  if (isStrictFailed) {
    return { item, unweightedScore: 0, score: 0, isMatch: false, isPerfectMatch: false, matches: {}, isStrictZero: true };
  }
  if (totalWeight) {
    return {
      item,
      unweightedScore: totalScore,
      score: weightedScore / totalWeight,
      isMatch: weightedScore > 0,
      isPerfectMatch: weightedScore === totalWeight,
      matches,
      isStrictZero: false
    };
  }
  return { item, unweightedScore: 1, score: 1, isMatch: true, isPerfectMatch: true, matches: {}, isStrictZero: false };
}

export class FilterManager {
  currentSort: string = "default";
  filters: Record<string, any>;
  results: any[] = [];
  sorts: Record<string, any> = {
    aToZ: "+data.title",
    default: ["-isFavorited", "-releaseDate"],
    zToA: "-data.title"
  };

  get hasFilters(): boolean {
    return this.filterCount > 0;
  }

  get filterCount(): number {
    return Object.values(this.filters).reduce((acc: number, filter: any) => {
      if (filter.kind === "multi") return acc + filter.value.length;
      if (filter.kind === "query") {
        return filter.value !== null && filter.value.length >= (filter.minLength ?? 0)
          ? acc + 1
          : acc;
      }
      return filter.value === null ? acc : acc + 1;
    }, 0);
  }

  constructor() {
    this.currentSort = "default";
    this.filters = reactive(this.getInitialFilters());
    this.setupFromDisk();
  }

  getInitialFilters(): Record<string, any> {
    return {
      query: {
        key: "query",
        label: "FILTERS.QUERY.LABEL",
        kind: "query",
        value: null,
        minLength: 3,
        propertyKey: ["data.title", "data.description.en"]
      },
      isOwned: {
        label: "FILTERS.IS_OWNED.LABEL",
        kind: "boolean",
        value: null,
        isStrict: true,
        propertyKey: "isOwned",
        options: [
          { label: "", value: false },
          { label: "", value: true }
        ]
      },
      isFavorited: {
        label: "FILTERS.IS_FAVORITED.LABEL",
        kind: "boolean",
        value: null,
        isStrict: true,
        propertyKey: "isFavorited",
        options: [
          { label: "", value: false },
          { label: "", value: true }
        ]
      },
      type: {
        key: "type",
        label: "FILTERS.TYPE.LABEL",
        kind: "multi",
        value: [],
        propertyKey: "data.types",
        options: [
          { label: "FILTERS.TYPE.DRAWING", value: "drawing" },
          { label: "FILTERS.TYPE.TRIVIA", value: "trivia" },
          { label: "FILTERS.TYPE.DECEPTION", value: "deception" },
          { label: "FILTERS.TYPE.WRITING", value: "writing" },
          { label: "FILTERS.TYPE.SOUND", value: "sound" },
          { label: "FILTERS.TYPE.PUZZLE", value: "puzzle" },
          { label: "FILTERS.TYPE.SPEAKING", value: "speaking" },
          { label: "FILTERS.TYPE.ACTION", value: "action" },
          { label: "FILTERS.TYPE.ROLE_PLAY", value: "rolePlay" },
          { label: "FILTERS.TYPE.STRATEGY", value: "strategy" }
        ]
      },
      features: {
        key: "features",
        label: "FILTERS.FEATURES.LABEL",
        kind: "multi",
        value: [],
        propertyKey: "data.features",
        options: [
          { label: "FILTERS.FEATURES.SINGLE_PLAYER", value: "singlePlayer" },
          { label: "FILTERS.FEATURES.TEAM_WORK", value: "teamWork" },
          { label: "FILTERS.FEATURES.AUDIENCE", value: "audience" },
          { label: "FILTERS.FEATURES.FAMILY_FRIENDLY", value: "familyFriendly" },
          { label: "FILTERS.FEATURES.US_CENTRIC", value: "usCentric" },
          { label: "FILTERS.FEATURES.MODERATION", value: "moderation" },
          { label: "FILTERS.FEATURES.MATURE", value: "mature" },
          { label: "FILTERS.FEATURES.DROP_IN_DROP_OUT", value: "dropInDropOut" },
          { label: "FILTERS.FEATURES.REDUCED_MOTION", value: "reducedMotion" },
          { label: "FILTERS.FEATURES.PASSWORDS", value: "passwords" },
          { label: "FILTERS.FEATURES.HAS_MERCH", value: "customMerch" },
          { label: "FILTERS.FEATURES.SHAREABLES", value: "shareables" },
          { label: "FILTERS.FEATURES.SUBTITLES", value: "subtitles" }
        ]
      },
      playerCount: {
        key: "playerCount",
        label: "FILTERS.PLAYER_COUNT.LABEL",
        kind: "between",
        value: null,
        propertyKey: ["data.minPlayerCount", "data.maxPlayerCount"],
        options: [
          { label: "FILTERS.PLAYER_COUNT.1", value: 1 },
          { label: "FILTERS.PLAYER_COUNT.2", value: 2 },
          { label: "FILTERS.PLAYER_COUNT.3", value: 3 },
          { label: "FILTERS.PLAYER_COUNT.4", value: 4 },
          { label: "FILTERS.PLAYER_COUNT.5", value: 5 },
          { label: "FILTERS.PLAYER_COUNT.6", value: 6 },
          { label: "FILTERS.PLAYER_COUNT.7", value: 7 },
          { label: "FILTERS.PLAYER_COUNT.8", value: 8 },
          { label: "FILTERS.PLAYER_COUNT.9", value: 9 },
          { label: "FILTERS.PLAYER_COUNT.10", value: 10 },
          { label: "FILTERS.PLAYER_COUNT.16", value: 16 },
          { label: "FILTERS.PLAYER_COUNT.100", value: 100 }
        ]
      },
      product: {
        key: "product",
        label: "FILTERS.PRODUCT.LABEL",
        kind: "multi",
        value: [],
        propertyKey: "data.products",
        options: []
      },
      duration: {
        key: "duration",
        label: "FILTERS.DURATION.LABEL",
        kind: "range",
        value: null,
        propertyKey: "data.duration",
        options: [
          { label: "FILTERS.DURATION.15", value: 5 },
          { label: "FILTERS.DURATION.15", value: 10 },
          { label: "FILTERS.DURATION.15", value: 15 },
          { label: "FILTERS.DURATION.30", value: 30 },
          { label: "FILTERS.DURATION.45", value: 45 },
          { label: "FILTERS.DURATION.60", value: 60 }
        ]
      },
      language: {
        key: "language",
        label: "FILTERS.LANGUAGE.LABEL",
        kind: "value",
        value: null,
        propertyKey: "data.languages",
        options: [
          { label: "FILTERS.LANGUAGE.DE", value: "de" },
          { label: "FILTERS.LANGUAGE.EN", value: "en" },
          { label: "FILTERS.LANGUAGE.ES_XL", value: "es-XL" },
          { label: "FILTERS.LANGUAGE.ES", value: "es" },
          { label: "FILTERS.LANGUAGE.FR", value: "fr" },
          { label: "FILTERS.LANGUAGE.IT", value: "it" },
          { label: "FILTERS.LANGUAGE.PT_BR", value: "pt-BR" }
        ]
      }
    };
  }

  async setupFromDisk() {
    try {
      const stored = await megaService.triggerAction("data/getFromStorage", { key: "filters" });
      if (stored) {
        Object.keys(stored).forEach((k) => {
          if (this.filters[k]) this.filters[k].value = stored[k];
        });
      }
    } catch {}
    this.updateDynamicOptions();
    this.updateResults();
    watch(
      this.filters,
      () => {
        this.updateResults();
        this.persistToDisk();
      },
      { deep: true }
    );
    megaService.on("didSync", () => {
      this.updateDynamicOptions();
      this.updateResults();
    });
  }

  clear(key: string) {
    const f = this.filters[key];
    if (f) {
      if (f.kind === "multi") f.value = [];
      else f.value = null;
    }
  }

  clearAll() {
    Object.keys(this.filters).forEach((k) => this.clear(k));
  }

  updateFromQueryParams(params: Record<string, any>) {
    if (params) {
      this.clearAll();
      Object.keys(params).forEach((k) => {
        if (this.filters[k]) this.filters[k].value = params[k];
      });
      this.updateResults();
    }
  }

  setSort(sortKey: string) {
    this.currentSort = sortKey;
    this.updateResults();
  }

  updateQuery(key: string, query: string) {
    if (this.filters[key]?.kind === "query") {
      this.filters[key].value = query;
    }
  }

  toggleBoolean(key: string) {
    if (this.filters[key]?.kind === "boolean") {
      if (this.filters[key].value === null) {
        this.filters[key].value = true;
        return;
      }
      this.filters[key].value = !this.filters[key].value;
    }
  }

  setBoolean(key: string, val: boolean | null) {
    if (this.filters[key]?.kind === "boolean") {
      this.filters[key].value = val;
    }
  }

  setValue(key: string, val: any) {
    if (this.filters[key]) {
      this.filters[key].value = val;
    }
  }

  toggleMulti(key: string, val: any) {
    if (this.filters[key]?.kind !== "multi") return;
    const list = this.filters[key].value;
    const items = Array.isArray(val) ? val : [val];
    items.forEach((item) => {
      if (list.includes(item)) {
        this.removeFromMulti(key, [item]);
      } else {
        this.addToMulti(key, [item]);
      }
    });
  }

  addToMulti(key: string, items: any[]) {
    if (this.filters[key]?.kind !== "multi") return;
    const list = this.filters[key].value;
    items.forEach((item) => {
      if (!list.includes(item)) list.push(item);
    });
  }

  removeFromMulti(key: string, items: any[]) {
    if (this.filters[key]?.kind !== "multi") return;
    const list = this.filters[key].value;
    this.filters[key].value = list.filter((i: any) => !items.includes(i));
  }

  setRange(key: string, val: any) {
    if (this.filters[key]?.kind === "range") {
      this.filters[key].value = val;
    }
  }

  setBetween(key: string, val: any) {
    if (this.filters[key]?.kind === "between") {
      this.filters[key].value = val;
    }
  }

  updateResults() {
    const games = megaService.games ?? [];
    const t = filterAndSort(games, Object.values(this.filters), this.sorts[this.currentSort]);
    this.results.length = 0;
    this.results.push(...t);
  }

  updateDynamicOptions() {
    if (this.filters.product) {
      this.filters.product.options = megaService.products
        .filter((t) => !(!t.isInstallable || t.games.length <= 1))
        .map((t) => ({ label: t.data.title.replace("Jackbox ", ""), value: t.data.id }));
    }
  }

  async persistToDisk() {
    try {
      const out: Record<string, any> = {};
      Object.keys(this.filters).forEach((k) => {
        out[k] = toRaw(this.filters[k].value);
      });
      await megaService.triggerAction("data/setToStorage", { key: "filters", value: out });
    } catch {}
  }
}
