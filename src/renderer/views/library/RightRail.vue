<template>
<div class="right-rail mp" :style="styles">
    <div class="logo">
      <div class="sticker-logo" />
      <div class="color-logo" />
    </div>
    <div v-if="product?.isUnreleased" class="date">
      {{ availableText }}
    </div>
    <InfoPanel :game="game" />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import InfoPanel from "../components/InfoPanel.vue";
import { getGameAssetUrl } from "../../services/assets";

export default defineComponent({
  name: "RightRail",
  components: {
    InfoPanel
  },
  props: {
    game: {
      type: Object as PropType<any>,
      required: false
    }
  },
  computed: {
    product(): any {
      return this.game ? this.game.installableProducts[0] : null;
    },
    availableText(): string {
      if (!this.product?.isUnreleased || !this.product.releaseDate) return "";
      const diff = this.product.releaseDate.getTime() - Date.now();
      if (diff < 864e5) return this.$t("TILE.AVAILABLE_SOON");
      if (diff > 31556952e3) return this.$t("TILE.AVAILABLE_SOON");
      const date = this.product.releaseDate.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric"
      });
      return this.$t("TILE.AVAILABLE_DATE", { date });
    },
    styles(): Record<string, string> {
      if (!this.game?.data) return {};
      const gameId = this.game.data.id;
      return {
        "--background-url": `url(${getGameAssetUrl(gameId, "tile-background.jpg")})`,
        "--color-logo-url": `url(${getGameAssetUrl(gameId, "tile-logo.png")})`,
        "--sticker-logo-url": `url(${getGameAssetUrl(gameId, "tile-logo-sticker.png")})`
      };
    }
  }
});
</script>

<style scoped>
.right-rail{display:flex;flex-direction:column;justify-content:end;background-color:#111;background-image:var(--background-url);background-size:cover;background-position:center;background-repeat:no-repeat;border-radius:10px}
.logo{position:absolute;inset:-25px -20px auto;height:200px;filter:drop-shadow(0 6px rgba(0,0,0,.75))}
.date{width:100%;padding:6px 10px;text-align:center;background:rgba(0,0,0,.85);color:#fad000;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;border-top:1px solid rgba(255,255,255,.1);border-bottom:1px solid rgba(255,255,255,.1)}
.color-logo,.sticker-logo{position:absolute;inset:0;background-image:var(--color-logo-url);background-position:center;background-size:contain;background-repeat:no-repeat}
.sticker-logo{background-image:var(--sticker-logo-url)}
</style>
