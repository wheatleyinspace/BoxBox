<template>
  <div class="switches">
    <button
      :class="{ active: active === 'all' }"
      @click="onIsOwnedClick(null)"
    >
      {{ $t("FILTERS.IS_OWNED.ALL").toUpperCase() }}
    </button>
    <button
      :class="{ active: active === 'owned' }"
      @click="onIsOwnedClick(true)"
    >
      {{ $t("FILTERS.IS_OWNED.OWNED").toUpperCase() }}
    </button>
    <button
      :class="['is-favorited', { active: active === 'favorites' }]"
      @click="onIsFavoriteClick"
    >
      <FavoritesIconSVG />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import FavoritesIconSVG from "../../assets/icons/FavoritesIcon.svg.vue";

export default defineComponent({
  name: "ExclusiveSwitches",
  components: {
    FavoritesIconSVG
  },
  props: {
    filterManager: {
      type: Object as PropType<any>,
      required: true
    }
  },
  computed: {
    active(): string {
      return this.filterManager.filters.isFavorited.value
        ? "favorites"
        : this.filterManager.filters.isOwned.value
        ? "owned"
        : "all";
    }
  },
  methods: {
    onIsOwnedClick(val: boolean | null) {
      this.filterManager.setBoolean("isOwned", val);
      this.filterManager.setBoolean("isFavorited", null);
    },
    onIsFavoriteClick() {
      this.filterManager.setBoolean("isOwned", null);
      this.filterManager.setBoolean("isFavorited", true);
    }
  }
});
</script>

<style scoped>
.switches{display:flex;gap:-10px;height:54px;border:2px solid #515151;font-weight:700;font-size:11px;line-height:1;border-radius:27px}
.switches button{padding:0 15px;margin:2px -1px;border-radius:23px;white-space:pre-line;transition:background-color .15s linear}
.switches button:first-of-type{margin-left:2px}
.switches button:last-of-type{margin-right:2px}
.switches button.active{background-color:#fad000;color:#000;z-index:1}
.switches button.active.favorites{background-color:#ff6b6b}
.switches button:hover:not(.active){color:#fad000}
.switches .is-favorited svg{height:32px;margin:0 3px}
.switches .is-favorited svg .heart{fill:#ff6b6b;stroke:#ff6b6b}
.switches .is-favorited.active{background-color:#ff6b6b}
.switches .is-favorited.active svg .heart{fill:#fefbda;stroke:#fefbda}
.switches .is-favorited:hover:not(.active) svg .heart{fill:#fad000;stroke:#fad000}
</style>
