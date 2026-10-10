<template>
  <div class="advanced-filters mp">
    <p class="title">{{ $t("FILTERS.ADVANCED") }}</p>
    <div :class="[{ open: currentIndex === -1 }, 'section sort']">
      <button class="trigger" @click="onToggleClick(-1)">
        <p class="label">
          {{ $t("FILTERS.SORT.BY") }}: <span>{{ humanizedSort }}</span>
        </p>
        <div class="disclosure" />
      </button>
      <div class="controls-wrapper">
        <div class="controls">
          <Sort :filter-manager="filterManager" />
        </div>
      </div>
    </div>
    <div
      v-for="(r, a) in panels"
      :key="a"
      :class="[{ open: currentIndex === a, 'has-value': r.humanized !== null }, 'section']"
    >
      <button class="trigger" @click="onToggleClick(a)">
        <component :is="r.icon" class="icon" />
        <p class="label">
          {{ $t(r.label) }}
          <span v-if="r.humanized" class="humanized">{{ r.humanized }}</span>
        </p>
        <div class="disclosure" />
      </button>
      <div class="controls-wrapper">
        <div class="controls">
          <component
            :is="r.control"
            :filter-manager="filterManager"
            :filter-key="r.key"
          />
          <button class="clear" @click="onClearClick(r.key)">
            {{ $t("FILTERS.CLEAR") }}
          </button>
        </div>
      </div>
    </div>
    <div class="expander" />
    <button class="clear all" @click="onClearAllClick">
      {{ $t("FILTERS.CLEAR_ALL") }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, markRaw } from "vue";
import FilterBetween from "./FilterBetween.vue";
import FilterMulti from "./FilterMulti.vue";
import FilterRange from "./FilterRange.vue";
import FilterValue from "./FilterValue.vue";
import Sort from "./Sort.vue";
import FilterPlayerCountIcon from "../../assets/icons/FilterPlayerCountIcon.svg.vue";
import FilterDurationIcon from "../../assets/icons/FilterDurationIcon.svg.vue";
import FilterFeaturesIcon from "../../assets/icons/FilterFeaturesIcon.svg.vue";
import FilterTypeIcon from "../../assets/icons/FilterTypeIcon.svg.vue";
import FilterProductIcon from "../../assets/icons/FilterProductIcon.svg.vue";
import FilterLanguageIcon from "../../assets/icons/FilterLanguageIcon.svg.vue";

export default defineComponent({
  name: "AdvancedFilters",
  components: {
    FilterBetween,
    FilterMulti,
    FilterRange,
    FilterValue,
    Sort
  },
  props: {
    filterManager: {
      type: Object as PropType<any>,
      required: true
    }
  },
  data() {
    return {
      currentIndex: null as number | null
    };
  },
  computed: {
    humanizedSort(): string {
      return this.filterManager.currentSort === "aToZ"
        ? "A-Z"
        : this.filterManager.currentSort === "zToA"
        ? "Z-A"
        : this.$t("FILTERS.SORT.DEFAULT");
    },
    panels(): any[] {
      return [
        {
          key: "playerCount",
          label: "FILTERS.PLAYER_COUNT.LABEL",
          humanized: this.humanizedPlayerCount(this.filterManager.filters?.playerCount),
          icon: markRaw(FilterPlayerCountIcon),
          control: FilterBetween
        },
        {
          key: "duration",
          label: "FILTERS.DURATION.LABEL",
          humanized: this.humanizedDuration(this.filterManager.filters?.duration),
          icon: markRaw(FilterDurationIcon),
          control: FilterRange
        },
        {
          key: "features",
          label: "FILTERS.FEATURES.LABEL",
          humanized: this.getHumanizedMulti(this.filterManager.filters?.features),
          icon: markRaw(FilterFeaturesIcon),
          control: FilterMulti
        },
        {
          key: "type",
          label: "FILTERS.TYPE.LABEL",
          humanized: this.getHumanizedMulti(this.filterManager.filters?.type),
          icon: markRaw(FilterTypeIcon),
          control: FilterMulti
        },
        {
          key: "product",
          label: "FILTERS.PRODUCT.LABEL",
          humanized: this.getHumanizedMulti(this.filterManager.filters?.product),
          icon: markRaw(FilterProductIcon),
          control: FilterMulti
        },
        {
          key: "language",
          label: "FILTERS.LANGUAGE.LABEL",
          humanized: this.getHumanizedValue(this.filterManager.filters?.language),
          icon: markRaw(FilterLanguageIcon),
          control: FilterValue
        }
      ];
    }
  },
  methods: {
    onToggleClick(idx: number) {
      this.currentIndex = this.currentIndex === idx ? null : idx;
    },
    onClearClick(key: string) {
      this.filterManager.clear(key);
    },
    onClearAllClick() {
      this.filterManager.clearAll();
    },
    humanizedPlayerCount(e: any) {
      return e?.value === null || e?.value === undefined
        ? null
        : this.$t("FILTERS.PLAYER_COUNT.COUNT", { count: e.value });
    },
    humanizedDuration(e: any) {
      return e?.value === null || e?.value === undefined
        ? null
        : this.$t("FILTERS.DURATION.MINUTES", {
            minMinutes: e.value[0],
            maxMinutes: e.value[1]
          });
    },
    getHumanizedMulti(e: any) {
      if (!e?.value?.length) return null;
      const t = e.options?.find((n: any) => n.value === e.value[0]);
      if (!t) return null;
      let s = this.$t(t.label);
      if (e.value.length > 1) {
        s = `${s} + ${e.value.length - 1}`;
      }
      return s;
    },
    getHumanizedValue(e: any) {
      if (!e?.value) return null;
      const t = e.options?.find((s: any) => s.value === e.value);
      return t ? this.$t(t.label) : null;
    }
  }
});
</script>

<style scoped>
.advanced-filters{display:flex;flex-direction:column;border-radius:10px;font-weight:900;background:#282828;overflow:auto}
.title{position:sticky;top:0;padding:4px 0;background:#fad000;text-transform:uppercase;color:#000;font-size:13px;text-align:center;z-index:1}
.section{width:100%;padding:20px 10px 10px;border-bottom:1px solid #000}
.section:hover{background:#ffffff0d}
.section.open .controls-wrapper{grid-template-rows:1fr}
.section.open .controls{padding-top:20px}
.section.open .trigger .disclosure{transform:rotate(135deg)}
.section.open:hover{background:transparent}
.section .trigger{cursor:pointer;display:flex;width:100%;height:35px;padding:0 10px;align-items:center;text-align:left}
.section .trigger .icon{width:34px;height:34px;margin-right:6px}
.section .trigger .label{font-size:16px;font-weight:700;flex-grow:1}
.section .trigger .label span{display:block;font-size:12px;font-weight:600;color:#fad000}
.section .trigger .disclosure{width:15px;height:15px;border-top:5px solid #515151;border-right:5px solid #515151;transform:rotate(45deg);transition:transform .15s linear}
.section .controls-wrapper{display:grid;grid-template-rows:0fr;transition:grid-template-rows .15s linear}
.section .controls{overflow:hidden;padding-top:10px;transition:padding .15s linear}
.section.sort{color:#000;background:#fad000;border-top:1px solid #000;padding:10px 10px 0}
.section.sort:hover{background:#ffea81}
.section.sort.open .controls{padding-top:10px;padding-bottom:10px}
.section.sort.open:hover{background:#fad000}
.section.sort .trigger .label{color:#000}
.section.sort .trigger .label span{display:inline;font-size:16px;color:#000}
.section.sort .trigger .disclosure{width:13px;height:13px;border-top:5px solid #000;border-right:5px solid #000}
.expander{flex-grow:1}
.clear{width:100%;margin:10px auto 0;text-align:center;color:#ff6b6b;text-transform:uppercase;font-weight:700;font-size:13px}
.clear.all{margin-bottom:10px}
.clear:hover{color:#fff}
</style>
