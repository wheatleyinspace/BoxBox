<template>
  <div
    v-if="isDraggingFavorite"
    class="favorite-drop"
    @dragover.prevent="onDragOver"
    @drop.prevent="onRemoveDrop"
  />
  <nav class="side-nav">
    <Sticker class="sticker-logo" :dampening="0.5">
      <div class="logo" />
    </Sticker>
    <button
      :class="['nav-item', { inactive: screen !== 'home' }]"
      @click="onItemClick('home')"
    >
      <NavHomeIconSVG class="icon" />
      <span>{{ $t("NAV.HOME") }}</span>
    </button>
    <button
      :class="['nav-item', { inactive: screen !== 'library' }]"
      @click="onItemClick('library')"
    >
      <NavLibraryIconSVG class="icon" />
      <span>{{ $t("NAV.LIBRARY") }}</span>
    </button>
    <div
      class="favorites"
      @dragover.prevent="onDragOver"
      @drop.prevent="onAddDrop"
    >
      <p class="label">{{ $t("NAV.FAVORITES") }}</p>
      <button
        v-for="fav in favorites"
        :key="fav.game.data.id"
        class="favorite"
        draggable="true"
        @dragstart="onFavoriteDragStart($event, fav.game)"
        @dragend="onFavoriteDragEnd"
        @click="onFavoriteClick(fav.game)"
      >
        <img :src="fav.url" :alt="fav.game.data.title" />
      </button>
      <p v-if="!favorites.length" class="empty">
        {{ $t("NAV.DRAG_TARGET") }}
      </p>
    </div>
    <p class="version">v{{ version }}</p>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sticker from "../components/Sticker.vue";
import NavHomeIconSVG from "../../assets/icons/NavHomeIcon.svg.vue";
import NavLibraryIconSVG from "../../assets/icons/NavLibraryIcon.svg.vue";
import Details from "../modals/Details.vue";
import LaunchOptions from "../modals/LaunchOptions.vue";
import { getGameAssetUrl } from "../../services/assets";

export default defineComponent({
  name: "SideNav",
  components: {
    Sticker,
    NavHomeIconSVG,
    NavLibraryIconSVG
  },
  props: {
    screen: {
      type: String,
      required: true
    }
  },
  emits: {
    didRequestScreen: (screen: string) => true
  },
  data() {
    return {
      isDraggingFavorite: false,
      draggingFavoriteImage: new Image(),
      version: "1.0.8-5"
    };
  },
  computed: {
    favorites(): any[] {
      const favs = (this as any).$mega?.user?.favorites ?? [];
      return favs
        .filter((g: any) => g && g.data?.id)
        .map((g: any) => ({
          game: g,
          url: getGameAssetUrl(g.data.id, "tile-logo-side.png")
        }));
    }
  },
  mounted() {
    if ((this as any).$mega?.env?.VERSION) {
      this.version = (this as any).$mega.env.VERSION;
    }
    window.addEventListener("dragend", this.onDragEnd.bind(this));
  },
  beforeUnmount() {
    window.removeEventListener("dragend", this.onDragEnd.bind(this));
  },
  methods: {
    onItemClick(screen: string) {
      this.$emit("didRequestScreen", screen);
    },
    async onFavoriteClick(game: any) {
      let productId = game.ownedInstallableProducts?.[0]?.data?.id;
      if (!productId && game.products?.[0]) productId = game.products[0].data.id;
      if (game.ownedInstallableProducts?.length > 1) {
        const modalRes = await (this as any).$showModal(LaunchOptions, {
          game,
          title: this.$t("DETAIL.HOW_TO_LAUNCH", { gameTitle: game.data.title })
        });
        if (!modalRes) return;
        productId = modalRes.data.id;
      }
      await (this as any).$mega.triggerAction("game/launch", {
        gameId: game.data.id,
        productId
      });
    },
    onFavoriteDragStart(e: DragEvent, game: any) {
      this.isDraggingFavorite = true;
      if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", `remove:${game.data.id}`);
        e.dataTransfer.effectAllowed = "move";
      }
    },
    onFavoriteDragEnd() {
      this.isDraggingFavorite = false;
    },
    onDragEnd() {
      this.isDraggingFavorite = false;
    },
    onDragOver(e: DragEvent) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    },
    async onAddDrop(e: DragEvent) {
      const [action, id] = e.dataTransfer?.getData("text/plain")?.split(":") ?? [];
      if (action === "add" && id) {
        await (this as any).$mega.triggerAction("game/addFavorite", {
          gameId: parseInt(id, 10)
        });
      }
      this.isDraggingFavorite = false;
    },
    async onRemoveDrop(e: DragEvent) {
      const [action, id] = e.dataTransfer?.getData("text/plain")?.split(":") ?? [];
      if (action === "remove" && id) {
        await (this as any).$mega.triggerAction("game/removeFavorite", {
          gameId: parseInt(id, 10)
        });
      }
      this.isDraggingFavorite = false;
    }
  }
});
</script>

<style scoped>
.side-nav{display:flex;flex-direction:column;align-items:center;padding:20px 25px 15px 20px;background-image:linear-gradient(to right,#000 89%,#000c 90%,#0000)}
.sticker-logo{margin-bottom:25px}
.sticker-logo .logo{width:80px;height:80px;background-image:url("@/assets/images/hologo-sprite.png");background-size:2400px 80px;background-position:0% 0%;background-repeat:no-repeat}
.sticker-logo:hover .logo{animation:logo-spin-dc55aebd .8s steps(29);animation-play-state:running}
.nav-item{margin:5px 0;text-transform:uppercase;font-weight:700;font-size:11px;color:#fad000}
.nav-item span{display:block;width:100%;margin:3px 0 1px}
.nav-item svg{width:50px;transition:transform .1s linear}
.nav-item.inactive{color:#515151}
.nav-item:hover svg{transform:scale(1.1)}
.favorites{position:relative;overflow-y:scroll;flex-grow:1;flex-shrink:1;width:100%;padding:0 3px 5px;margin:10px 0;border-top:1px solid #282828;border-bottom:1px solid #282828}
.favorites .label{position:sticky;top:0;left:0;right:0;padding:3px 0 5px;font-weight:700;font-size:9px;color:#9d9d9d;text-transform:uppercase;text-align:center;background-image:linear-gradient(to bottom,#000 ,85%,#0000);z-index:1}
.favorites .empty{position:absolute;top:50%;left:50%;width:300px;text-align:center;color:#ffffff1a;font-weight:900;text-transform:uppercase;transform:translate(-50%,-50%) rotate(-90deg)}
.favorite{cursor:pointer;margin:5px 0;padding:0 7px;transition:transform .1s linear}
.favorite:hover{transform:scale(1.1)}
.favorite-drop{position:absolute;top:0;left:0;width:100%;height:100%;z-index:1}
.beta{width:100%;padding:1px 0;text-align:center;background:#fad000;border-radius:20px;color:#000;font-weight:900;font-size:14px}
.version{font-size:10px;color:#282828;text-align:center}
</style>
