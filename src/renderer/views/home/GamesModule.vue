<template>
  <div class="module games">
    <div class="constrain">
      <h3>
        {{ module.data.title }}
        <component :is="icon" v-if="icon" class="icon" />
      </h3>
    </div>
    <Slider :will-change="module.data.willChange ?? false">
      <div v-if="!games.length" class="empty">
        <div class="empty-content">{{ module.data.emptyText ?? "" }}</div>
      </div>
      <div
        v-for="game in games"
        :key="game.data.id"
        class="sticker-wrapper"
      >
        <Sticker class="game">
          <Tile :game="game" />
        </Sticker>
      </div>
    </Slider>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import Slider from "../components/Slider.vue";
import Sticker from "../components/Sticker.vue";
import Tile from "../components/Tile.vue";
import FavoritesStickerSVG from "../../assets/icons/FavoritesSticker.svg.vue";

export default defineComponent({
  name: "GamesModule",
  components: {
    Slider,
    Sticker,
    Tile,
    FavoritesStickerSVG
  },
  props: {
    module: {
      type: Object as PropType<any>,
      required: true
    }
  },
  computed: {
    games(): any[] {
      let list: any[] = [];
      if (this.module.data.category === "favorites" || this.module.data.key === "favorites") {
        list = (this as any).$mega.user?.favorites ?? [];
      } else if (this.module.data.category === "recentlyPlayed" || this.module.data.key === "recentlyPlayed") {
        list = (this as any).$mega.user?.recentlyPlayed ?? [];
      } else {
        list = this.module.games ?? [];
      }
      return (list || []).filter((g: any) => g && g.data);
    },
    icon(): string | null {
      return (this.module.data.category === "favorites" || this.module.data.key === "favorites") ? "FavoritesStickerSVG" : null;
    }
  }
});
</script>

<style scoped>
h3{display:inline-block;position:relative;font-weight:600;font-size:18px;font-weight:800;padding-bottom:5px}
h3 .icon{position:absolute;height:25px;left:calc(100% + 5px);margin-right:5px;color:#fad000}
.sticker-wrapper{padding:7px}
.sticker-wrapper .game{width:100%;aspect-ratio:2/1}
.empty{padding:3.5px 0;font-weight:700;font-size:24px;color:#282828}
.empty-content{display:flex;align-items:center;justify-content:center;border:2px dashed #282828;aspect-ratio:10/1;border-radius:10px}
@media (max-width: 1400px){.empty{padding:7px;aspect-ratio:8/1}.empty-content{aspect-ratio:8/1}}
@media (max-width: 1100px){.empty{padding:7px;aspect-ratio:6/1}.empty-content{aspect-ratio:6/1}}
</style>
