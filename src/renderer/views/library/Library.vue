<template>
  <div class="library">
    <QuickFilters
      :filter-manager="filterManager"
      :show-advanced-filters="showAdvancedFilters"
      @didToggleAdvancedFilters="onAdvancedFiltersToggle"
    />
    <div id="tiles" class="tiles">
      <template v-for="(g, d) in displayGames" :key="g.game?.data?.id ?? d">
        <div class="sticker-wrapper">
          <Sticker
            :class="['game', g.classes]"
            @mouseover="onTileHover(d)"
          >
            <Tile :game="g.game" :matches="g.matches" />
          </Sticker>
        </div>
        <div v-if="g.isLastPerfect" class="divider" />
      </template>
    </div>
    <RightRail
      :class="{ show: !showAdvancedFilters }"
      :game="activeGame"
    />
    <AdvancedFilters
      :filter-manager="filterManager"
      :class="{ show: showAdvancedFilters }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import AdvancedFilters from "./AdvancedFilters.vue";
import QuickFilters from "./QuickFilters.vue";
import RightRail from "./RightRail.vue";
import Sticker from "../components/Sticker.vue";
import Tile from "../components/Tile.vue";

export default defineComponent({
  name: "Library",
  components: {
    AdvancedFilters,
    QuickFilters,
    RightRail,
    Sticker,
    Tile
  },
  props: {
    filterManager: {
      type: Object as PropType<any>,
      required: true
    }
  },
  data() {
    return {
      activeGame: null as any,
      showAdvancedFilters: false
    };
  },
  computed: {
    displayGames(): any[] {
      const e = this.filterManager.filterCount;
      const t = this.filterManager.hasFilters;
      return (this.filterManager.results ?? []).map((n: any, i: number) => {
        const A: string[] = [];
        let o = false;
        if (t) {
          if (n.score === 0) {
            A.push("match-none");
          } else if (n.score === 1 && e > 1) {
            A.push("match-all");
            if (this.filterManager.results[i + 1]?.score !== 1) {
              o = true;
            }
          } else {
            A.push("match-some");
          }
        }
        return {
          game: n.item,
          score: n.score,
          matches: n.matches,
          isLastPerfect: o,
          classes: A
        };
      });
    }
  },
  watch: {
    "filterManager.filterCount": "onFiltersDidChange"
  },
  mounted() {
    this.onTileHover(0);
  },
  methods: {
    onTileHover(e: number) {
      const t = this.displayGames[e];
      if (t) this.activeGame = t.game;
    },
    onAdvancedFiltersToggle() {
      this.showAdvancedFilters = !this.showAdvancedFilters;
    },
    onFiltersDidChange() {
      document.getElementById("tiles")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
});
</script>

<style scoped>
.library{position:absolute;inset:0;overflow:hidden}
.quick-filters{position:absolute;inset:75px 20px auto 135px;height:85px;padding-bottom:10px;z-index:10}
.quick-filters:after{content:"";position:absolute;bottom:-21px;left:0;right:0;height:20px;background-image:linear-gradient(to bottom,#00000080,#0000)}
.tiles{position:absolute;pointer-events:none;inset:160px 20px 0 110px;padding:13px 308px 8px 18px;overflow-y:auto;perspective:4000px;z-index:2}
.tiles .sticker-wrapper{pointer-events:all;display:inline-block;width:20%;padding:7px}
.tiles .game{width:100%;aspect-ratio:2/1}
.tiles .divider{width:100%;height:1px;margin:10px 0 12px;background-color:#282828}
.right-rail{position:absolute;inset:180px 20px 20px auto;width:300px;font-weight:700;border-radius:10px;transform:scale(.8);transition:opacity .25s linear,transform .25s linear;opacity:.5;z-index:1}
.right-rail.show{transform:scale(1);opacity:1}
.advanced-filters{position:absolute;inset:180px 20px 20px auto;width:300px;transform:translate(320px);transition:transform .15s ease-in;z-index:10}
.advanced-filters.show{transition:transform .15s .1s ease-out;transform:translate(0)}
@media (max-width: 1700px){.tiles{padding-right:295px}.tiles .sticker-wrapper{width:25%}.right-rail,.advanced-filters{width:275px}}
@media (max-width: 1400px){.tiles{padding-right:280px}.tiles .sticker-wrapper{width:33.3%}.right-rail,.advanced-filters{width:250px}}
@media (max-width: 1100px){.tiles{padding-right:265px}.tiles .sticker-wrapper{width:50%}.right-rail,.advanced-filters{width:240px}}
.tiles-move .sticker-wrapper,.tiles-enter-active .sticker-wrapper,.tiles-leave-active .sticker-wrapper{transition:all .2s ease-out}
.tiles-move .sticker-wrapper{transform:scale(1.1)}
</style>
