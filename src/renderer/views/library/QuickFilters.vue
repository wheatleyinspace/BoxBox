<template>
  <div class="quick-filters">
    <div class="filter-group">
      <ExclusiveSwitches :filter-manager="filterManager" />
      <button
        v-for="feat in displayFeatures"
        :key="feat.value"
        :class="['filter', feat.classes]"
        @click="onFeatureClick(feat.value)"
      >
        <component :is="feat.icon" class="icon" />
        <br />
        {{ feat.label }}
      </button>
    </div>
    <div class="filter-group flexible">
      <button
        v-for="type in displayTypes"
        :key="type.value"
        :class="['filter', type.classes]"
        @click="onTypeClick(type.value)"
      >
        <component :is="type.icon" class="icon" />
        <br />
        {{ type.label }}
      </button>
    </div>
    <div class="filter-group">
      <AdvancedFiltersButton
        :count="filterManager.filterCount"
        :class="['advanced', { showing: showAdvancedFilters }]"
        @click="onAdvancedClick"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, markRaw } from "vue";
import ExclusiveSwitches from "./ExclusiveSwitches.vue";
import AdvancedFiltersButton from "./AdvancedFiltersButton.vue";
import FilterSoloIcon from "../../assets/icons/FilterSoloIcon.svg.vue";
import FilterTeamIcon from "../../assets/icons/FilterTeamIcon.svg.vue";
import FilterDrawingIcon from "../../assets/icons/FilterDrawingIcon.svg.vue";
import FilterTriviaIcon from "../../assets/icons/FilterTriviaIcon.svg.vue";
import FilterWritingIcon from "../../assets/icons/FilterWritingIcon.svg.vue";
import FilterActionIcon from "../../assets/icons/FilterActionIcon.svg.vue";
import FilterDeceptionIcon from "../../assets/icons/FilterDeceptionIcon.svg.vue";
import FilterPuzzleIcon from "../../assets/icons/FilterPuzzleIcon.svg.vue";
import FilterRolePlayIcon from "../../assets/icons/FilterRolePlayIcon.svg.vue";
import FilterSoundIcon from "../../assets/icons/FilterSoundIcon.svg.vue";
import FilterPresentationIcon from "../../assets/icons/FilterPresentationIcon.svg.vue";
import FilterStrategyIcon from "../../assets/icons/FilterStrategyIcon.svg.vue";

const ICON_MAP: Record<string, any> = {
  singlePlayer: FilterSoloIcon,
  teamWork: FilterTeamIcon,
  drawing: FilterDrawingIcon,
  trivia: FilterTriviaIcon,
  writing: FilterWritingIcon,
  action: FilterActionIcon,
  deception: FilterDeceptionIcon,
  puzzle: FilterPuzzleIcon,
  rolePlay: FilterRolePlayIcon,
  sound: FilterSoundIcon,
  speaking: FilterPresentationIcon,
  strategy: FilterStrategyIcon
};

export default defineComponent({
  name: "QuickFilters",
  components: {
    ExclusiveSwitches,
    AdvancedFiltersButton
  },
  props: {
    filterManager: {
      type: Object as PropType<any>,
      required: true
    },
    showAdvancedFilters: {
      type: Boolean,
      required: true
    }
  },
  emits: {
    didToggleAdvancedFilters: () => true
  },
  computed: {
    displayFeatures(): any[] {
      const options = (this.filterManager.filters.features?.options || []).filter(
        (s: any) => s.value === "teamWork" || s.value === "singlePlayer"
      );
      const activeCount = options.reduce(
        (acc: number, n: any) =>
          (this.filterManager.filters.features?.value || []).includes(n.value) ? acc + 1 : acc,
        0
      );
      return options.map((s: any) => {
        const classes: string[] = [];
        if (activeCount === 1) {
          if ((this.filterManager.filters.features?.value || []).includes(s.value)) {
            classes.push("active");
          } else {
            classes.push("inactive");
          }
        }
        return {
          classes,
          label: this.$t(s.label),
          icon: ICON_MAP[s.value] || null,
          value: s.value
        };
      });
    },
    displayTypes(): any[] {
      const options = this.filterManager.filters.type?.options || [];
      const selected = this.filterManager.filters.type?.value || [];
      return options.map((e: any) => {
        const classes: string[] = [];
        if (selected.length > 0) {
          if (selected.includes(e.value)) {
            classes.push("active");
          } else {
            classes.push("inactive");
          }
        }
        return {
          classes,
          label: this.$t(e.label),
          icon: ICON_MAP[e.value] || null,
          value: e.value
        };
      });
    }
  },
  methods: {
    onFeatureClick(val: string) {
      this.filterManager.toggleMulti("features", val);
    },
    onTypeClick(val: string) {
      this.filterManager.toggleMulti("type", val);
    },
    onAdvancedClick() {
      this.$emit("didToggleAdvancedFilters");
    }
  }
});
</script>

<style scoped>
.quick-filters{display:flex;border-bottom:1px solid #282828;align-items:center}
.filter-group{position:relative;display:flex;height:100%;flex-shrink:0;align-items:center}
.filter-group.flexible{overflow-y:hidden;flex-shrink:1;flex-grow:1;padding:0 10px;display:grid;grid-auto-flow:column;column-gap:20px}
.filter-group:first-child{padding-right:10px;border-right:1px solid #111}
.filter-group:first-child:after{content:"";position:absolute;inset:0 -16px 0 auto;width:15px;background-image:linear-gradient(to right,#000000bf,#0000);z-index:1}
.filter-group:last-child{padding-left:12px}
.filter-group:last-child:after{content:"";position:absolute;inset:0 auto 0 -20px;width:20px;background-image:linear-gradient(to left,#000,#0000);z-index:1}
button.filter{text-align:center;width:80px;min-width:70px;font-weight:700;font-size:11px;text-transform:uppercase}
.flexible button.filter{width:max-content;min-width:unset}
button.filter .icon{display:inline-block;width:45px;height:45px;margin-bottom:5px;transition:transform .1s linear}
button.filter.inactive{color:#515151}
button.filter.active{color:#fad000}
button.filter:hover .icon{transform:scale(1.05)}
button.filter:active .icon{transform:scale(.95)}
.advanced{position:relative;height:50px}
</style>
