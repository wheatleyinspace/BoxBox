<template>
<div class="details mp" :style="styles">
    <div class="logos layer">
      <div class="sticker-logo layer" />
      <div class="color-logo layer" />
    </div>
    <div class="game-actions">
      <template v-if="game.isOwned">
        <button class="primary full inset" @click="onLaunchClick">
          <span>{{ game.isInstalled ? $t("TILE.LAUNCH") : $t("TILE.INSTALL") }}</span>
        </button>
        <button class="secondary small inset favorite" @click="onFavoriteClick">
          <span>
            <FavoritesIconSVG :class="['icon signed', { favorited: game.isFavorited }]" />
            {{ game.isFavorited ? $t("DETAIL.REMOVE_FROM_FAVORITES") : $t("DETAIL.ADD_TO_FAVORITES") }}
          </span>
        </button>
      </template>
      <div v-else-if="product.isUnreleased" class="unreleased">
        <div class="date">{{ availableText }}</div>
        <button class="primary full inset" @click="onWishlistClick">
          <span>{{ $t("TILE.WISHLIST") }}</span>
        </button>
      </div>
      <template v-else>
        <div class="unowned">
          <div v-if="product.data.price !== undefined" class="price">
            <span v-if="product.isDiscounted" class="initial">{{ product.data.price?.initialFormatted }}</span>
            <span class="final">{{ product.data.price?.finalFormatted }}</span>
          </div>
          <button class="primary full" @click="onPurchaseClick">
            <span>{{ product.isFree ? $t("TILE.CLAIM") : $t("TILE.PURCHASE") }}</span>
          </button>
        </div>
        <SaleSticker v-if="product.isFree" class="sale-sticker" :text="$t('TILE.FREE')" />
        <SaleSticker v-else-if="product.isDiscounted" class="sale-sticker" :text="`-${product.data.price?.discount}%`" />
      </template>
    </div>
    <div class="external-actions">
      <button class="action" @click="openSupport">{{ $t("DETAIL.GET_SUPPORT") }}</button>
      <hr class="action-divider" />
      <button class="action" @click="openCommunityHub">{{ $t("DETAIL.COMMUNITY_HUB") }}</button>
    </div>
    <InfoPanel :game="game" products-position="top" />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import FavoritesIconSVG from "../../assets/icons/FavoritesIcon.svg.vue";
import SaleSticker from "../components/SaleSticker.vue";
import InfoPanel from "../components/InfoPanel.vue";
import Launch from "./Launch.vue";
import LaunchOptions from "./LaunchOptions.vue";
import { getGameAssetUrl } from "../../services/assets";

export default defineComponent({
  name: "Details",
  components: {
    FavoritesIconSVG,
    SaleSticker,
    InfoPanel
  },
  props: {
    game: {
      type: Object as PropType<any>,
      required: true
    }
  },
  emits: {
    didResolve: (val: any) => true
  },
  computed: {
    product(): any {
      return this.game.installableProducts?.[0] ?? this.game.products?.[0];
    },
    availableText(): string {
      if (!this.product?.releaseDate) return "";
      const date = this.product.releaseDate.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric"
      });
      return this.$t("TILE.AVAILABLE_DATE", { date });
    },
    styles(): Record<string, string> {
      const gameId = this.game.data.id;
      return {
        "--background-url": `url(${getGameAssetUrl(gameId, "tile-background.jpg")})`,
        "--color-logo-url": `url(${getGameAssetUrl(gameId, "tile-logo.png")})`,
        "--sticker-logo-url": `url(${getGameAssetUrl(gameId, "tile-logo-sticker.png")})`,
        "--primary": this.game.data?.colors?.primary || "#fad000"
      };
    }
  },
  methods: {
    async onLaunchClick() {
      let productId = this.game.ownedInstallableProducts?.[0]?.data?.id ?? this.product.data.id;
      if (this.game.ownedInstallableProducts?.length > 1) {
        const modalRes = await (this as any).$showModal(LaunchOptions, {
          game: this.game,
          title: this.$t("DETAIL.HOW_TO_LAUNCH", { gameTitle: this.game.data.title })
        });
        if (!modalRes) return;
        productId = modalRes.data.id;
      }
      await (this as any).$mega.triggerAction("game/launch", {
        gameId: this.game.data.id,
        productId
      });
      this.$emit("didResolve", true);
    },
    async onFavoriteClick() {
      await (this as any).$mega.triggerAction("game/toggleFavorite", {
        gameId: this.game.data.id
      });
    },
    async onWishlistClick() {
      await (this as any).$mega.triggerAction("game/wishlist", {
        productId: this.product.data.id
      });
    },
    async onPurchaseClick() {
      let productId = this.game.products[0].data.id;
      if (this.game.products.length > 1) {
        const modalRes = await (this as any).$showModal(LaunchOptions, {
          game: this.game,
          title: this.$t("DETAIL.PURCHASE_GAME", { gameTitle: this.game.data.title })
        });
        if (!modalRes) return;
        productId = modalRes.data.id;
      }
      await (this as any).$mega.triggerAction("game/openInOverlay", {
        flag: 2,
        productId
      });
      this.$emit("didResolve", true);
    },
    async openSupport() {
      await (this as any).$mega.triggerAction("game/openSupport", {
        gameId: this.game.data.id,
        productId: this.product.data.id
      });
    },
    async openCommunityHub() {
      await (this as any).$mega.triggerAction("game/openExternal", {
        url: `steam://url/GameHub/${this.game.products[0].data.steamId}`
      });
    }
  }
});
</script>

<style scoped>
.details{width:800px;height:480px;background-image:var(--background-url);background-size:cover;background-position:center;background-repeat:no-repeat;border-radius:20px;transform:none;transition:transform .2s ease;backface-visibility:hidden}
.logos{filter:drop-shadow(2px 4px rgba(0,0,0,.5))}
.color-logo{background-image:var(--color-logo-url);transform:translate(-45%,-45%) scale(.5) rotate(-10deg);transition:transform .2s ease}
.sticker-logo{opacity:1;background-image:var(--sticker-logo-url);transform:translate(-45%,-45%) scale(.5) rotate(-10deg);transition:transform .2s ease}
.info-panel{position:absolute;inset:0 0 0 55%;border-radius:0 0 19px}
.game-actions{position:absolute;inset:0 45% 0 0;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:0 50px}
.game-actions .favorite{width:90%;margin-left:5%}
.game-actions .favorite span{position:relative}
.game-actions .favorite svg{position:absolute;top:-15px;right:100%;width:50px}
.game-actions .sale-sticker{position:absolute;bottom:20%;left:50%;width:25%;transform:translate(-50%) rotate(-5deg)}
.unowned{padding:5px;border-radius:20px;background-color:#000000a6}
.unowned .price{padding:5px 0 10px;font-size:26px;text-align:center}
.unowned .price .initial{position:relative;padding:0 3px;margin-right:15px;font-weight:500;color:#ffffffbf}
.unowned .price .initial:after{content:"";position:absolute;inset:30% 0;background:#5d1212d9;transform:skew(-15deg)}
.unowned .price .final{color:#fff;font-weight:900}
.unreleased{padding:5px;border-radius:20px;background-color:#000000a6}
.unreleased .date{padding:5px 0;font-size:16px;font-weight:700;text-align:center;text-transform:uppercase}
.external-actions{display:flex;flex-direction:row;position:absolute;gap:10px;bottom:0;left:27.5%;padding:5px 15px;border-radius:10px 10px 0 0;background-color:#000000a6;font-size:14px;font-weight:500;transform:translate(-50%)}
.external-actions .action{cursor:pointer}
.external-actions .action:hover{color:#fad000}
.external-actions .action-divider{border-color:#00000080}
.enter-from .color-logo,.leave-to .color-logo{transform:none}
.enter-from .sticker-logo,.leave-to .sticker-logo{opacity:0;transform:none}
</style>
