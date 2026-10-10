<template>
<div class="launch-container mp">
    <h2 class="modal-title">{{ title }}</h2>
    <div
      v-for="(item, idx) in products"
      :key="item.product.data.id"
      :class="['product-container', { noDivider: idx === 0 }]"
    >
      <div class="info-container">
        <img class="icon" :src="item.src" :alt="item.product.data.title" />
        <p class="title">{{ item.product.data.title }}</p>
      </div>
      <button class="primary outlined" @click="onLaunchClick(item.product.data.id)">
        <span>{{ item.product.isInstalled ? $t("TILE.LAUNCH") : $t("TILE.INSTALL") }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { getProductAssetUrl } from "../../services/assets";

export default defineComponent({
  name: "LaunchOptions",
  props: {
    game: {
      type: Object as PropType<any>,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  emits: {
    didResolve: (val: any) => true
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
  },
  methods: {
    async onLaunchClick(productId: number) {
      await (this as any).$mega.triggerAction("game/launch", {
        gameId: this.game.data.id,
        productId
      });
      this.$emit("didResolve", productId);
    }
  }
});
</script>

<style scoped>
.launch-container{width:800px;padding:40px;background-color:#000;border-radius:20px;border:4px solid #fefbda;margin:auto}
.launch-container .modal-title{font-weight:900;padding-bottom:15px;text-transform:uppercase}
.launch-container .product-container{display:flex;flex-direction:row;border-top:1px solid #fefbda;align-items:center}
.launch-container .product-container.noDivider{border:none}
.launch-container .product-container .info-container{display:flex;flex-direction:row;padding:20px 0;width:100%;align-items:center}
.launch-container .product-container .info-container .icon{max-height:45px;padding-right:15px}
.launch-container .product-container .info-container .title{font-weight:800}
</style>
