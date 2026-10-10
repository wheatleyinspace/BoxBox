<template>
  <div v-if="game" :class="['info-panel mp', { background: !game }]">
    <template v-if="productsPosition === 'top'">
      <p class="available">{{ $t("TILE.PLAY_IT_IN") }}</p>
      <div class="products">
        <img
          v-for="(p, idx) in products"
          :key="idx"
          :src="p.src"
          :alt="p.product.data.title"
          class="product"
        />
      </div>
    </template>
    <p class="description">{{ game.description }}</p>
    <hr />
    <div class="features">
      <Chip
        v-for="(type, idx) in game.data.types"
        :key="idx"
        :text="type"
        :icon="type"
      />
      <Chip
        :text="$t('DETAIL.PLAYERS', { minPlayers: game.data.minPlayerCount, maxPlayers: game.data.maxPlayerCount })"
      />
      <Chip
        :text="$t('DETAIL.DURATION', { minutes: game.data.duration })"
      />
    </div>
    <template v-if="productsPosition === 'bottom'">
      <hr />
      <p class="available">{{ $t("TILE.PLAY_IT_IN") }}</p>
      <div class="products">
        <img
          v-for="(p, idx) in products"
          :key="idx"
          :src="p.src"
          :alt="p.product.data.title"
          class="product"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import Chip from "./Chip.vue";
import { getProductAssetUrl } from "../../services/assets";

export default defineComponent({
  name: "InfoPanel",
  components: {
    Chip
  },
  props: {
    game: {
      type: Object as PropType<any>,
      required: false
    },
    productsPosition: {
      type: String,
      default: "bottom"
    }
  },
  computed: {
    products(): any[] {
      return (
        this.game?.installableProducts?.map((p: any) => ({
          product: p,
          src: getProductAssetUrl(p.data.id, "logo-side.png")
        })) ?? []
      );
    }
  }
});
</script>

<style scoped>
.info-panel{display:flex;flex-direction:column;padding:20px 20px 10px;background-color:#000000a6}
.description{margin-top:auto;padding-bottom:15px;font-size:14px;line-height:1.4;font-weight:600;white-space:pre-line}
hr{border:none;border-top:1px solid #fefbda}
.features{display:flex;flex-wrap:wrap;gap:8px;padding:15px 0}
.available{padding:6px 0 0;margin-bottom:10px;font-size:12px;font-weight:900;text-transform:uppercase;text-align:center}
.products{display:flex;justify-content:center;padding-bottom:10px;text-align:center}
.product{min-width:0;max-width:60%;aspect-ratio:300/125}
</style>
