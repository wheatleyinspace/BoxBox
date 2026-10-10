<template>
  <div class="modal-container mp" :style="styles">
    <div class="logos layer">
      <div class="sticker-logo layer" />
      <div class="color-logo layer" />
    </div>
    <p class="launching">{{ $t("DETAIL.LAUNCHING") }}</p>
    <h2 class="modal-title">{{ game?.data.title }}</h2>
    <p v-if="product && product.games.length > 1" class="from">
      from {{ product.data.title }}
    </p>
    <div class="spinner" />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { getGameAssetUrl } from "../../services/assets";

export default defineComponent({
  name: "Launch",
  props: {
    options: {
      type: Object as PropType<any>,
      required: true
    }
  },
  emits: {
    didResolve: () => true
  },
  data() {
    return {
      timeout: window.setTimeout(() => {
        this.$emit("didResolve");
      }, 10000)
    };
  },
  computed: {
    game(): any {
      const id = this.options?.params ? this.options.params.game : this.options?.game;
      return id ? (this as any).$mega.getGameById(id) ?? null : null;
    },
    product(): any {
      const id = this.options?.params ? this.options.params.product : this.options?.product;
      return id ? (this as any).$mega.getProductById(id) ?? null : null;
    },
    styles(): Record<string, string> {
      if (!this.game || !this.product) return {};
      const gameId = this.game.data.id;
      return {
        "--color-logo-url": `url(${getGameAssetUrl(gameId, "tile-logo.png")})`,
        "--sticker-logo-url": `url(${getGameAssetUrl(gameId, "tile-logo-sticker.png")})`,
        "--primary": this.game.data.colors?.primary || "#fad000"
      };
    }
  },
  beforeUnmount() {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
  }
});
</script>

<style scoped>
.modal-container{width:400px;padding:70px 20px 60px;text-align:center}
.modal-container .launching{margin-bottom:10px}
.modal-container .modal-title{font-weight:900;padding-bottom:10px;font-size:18px;text-transform:uppercase}
.logos{height:200px;filter:drop-shadow(2px 4px rgba(0,0,0,.5))}
.color-logo{background-image:var(--color-logo-url);transform:translateY(-45%) scale(.6);transition:transform .2s ease}
.sticker-logo{opacity:1;background-image:var(--sticker-logo-url);transform:translateY(-45%) scale(.6);transition:transform .2s ease}
.spinner{top:auto;bottom:30px}
.enter-from .color-logo,.leave-to .color-logo{transform:none}
.enter-from .sticker-logo,.leave-to .sticker-logo{opacity:0;transform:none}
</style>
