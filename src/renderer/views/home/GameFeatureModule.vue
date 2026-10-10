<template>
<div :class="['module game-feature constrain mp', classes]">
    <div class="content" :style="styles">
      <div class="media">
        <iframe
          width="560"
          height="315"
          :src="`https://www.youtube.com/embed/nP9gFfnj-EY?si=${module.data.youtubeId}`"
          :title="module.game?.data.title"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen=""
        />
      </div>
      <div class="info">
        <div class="logo" />
        <p>{{ module.game?.description }}</p>
      </div>
      <div class="cta-box" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import Details from "../modals/Details.vue";
import Launch from "../modals/Launch.vue";
import { getGameAssetUrl } from "../../services/assets";

export default defineComponent({
  name: "GameFeatureModule",
  props: {
    module: {
      type: Object as PropType<any>,
      required: true
    }
  },
  computed: {
    classes(): string[] {
      return [];
    },
    styles(): Record<string, string> {
      if (!this.module.game?.data) return {};
      return {
        "--color-logo-url": `url(${getGameAssetUrl(this.module.game.data.id, "tile-logo.png")})`
      };
    }
  }
});
</script>

<style scoped>
.content{display:flex;padding:25px;border-radius:10px;border:1px solid #282828;box-shadow:inset 0 0 15px #000000bf}
.media{flex-shrink:0;aspect-ratio:16/9;width:30%;border-radius:10px;overflow:hidden}
.media iframe{width:100%;height:100%}
.info{flex-grow:1;padding-left:25px;display:flex;flex-direction:column;justify-content:space-between}
.info .logo{width:100%;height:50%;background-image:var(--color-logo-url);background-size:contain;background-position:center left;background-repeat:no-repeat}
.info p{font-size:15px;line-height:1.4;font-weight:600}
</style>
