<template>
  <div class="side-actions">
    <button
      v-if="game.isOwned"
      class="action favorite"
      @click="onFavoriteClick"
    >
      <FavoritesIconSVG :class="{ favorited: game.isFavorited }" />
    </button>
    <button class="action info" @click="onInfoClick">
      <InfoIconSVG class="icon" />
    </button>
  </div>

  <div
    v-if="game.isOwned"
    ref="die"
    :class="['die owned', classes]"
    :style="styles"
    draggable="true"
    @dragstart="onFavoriteDragStart"
  >
    <div class="background layer" />
    <div class="perfect layer" />
    <div class="color-logo layer" />
    <div v-if="isLenticular" class="lenticular">
      <div class="lent-back" />
      <div class="lent-front" />
      <div class="lent-interference" />
      <div class="lent-specular" />
    </div>
    <div class="banner">{{ game.isInstalled ? $t("TILE.LAUNCH") : $t("TILE.INSTALL") }}</div>
    <div class="foil" />
    <FavoritesStickerSVG v-if="game.isFavorited" class="favorite-sticker icon" />
    <img v-if="game.isMature" alt="" :src="ratingIcon" class="rating" />
    <div v-if="matchIcons.length" class="match-icons">
      <component :is="icon" v-for="(icon, idx) in matchIcons" :key="idx" class="icon" />
    </div>
    <div class="glare" />
    <button class="full" @click="onLaunchClick" />
  </div>

  <div
    v-else-if="timeUntilRelease"
    ref="die"
    :class="['die unreleased', classes]"
    :style="styles"
    draggable="true"
  >
    <div class="background layer" />
    <div class="color-logo layer" />
    <div class="info-banner">{{ availableText }}</div>
    <div v-if="isLenticular" class="lenticular">
      <div class="lent-back" />
      <div class="lent-front" />
      <div class="lent-interference" />
      <div class="lent-specular" />
    </div>
    <div class="banner">{{ $t("TILE.WISHLIST") }}</div>
    <div class="foil" />
    <Countdown v-if="showCountdown" :time="timeUntilRelease" />
    <div class="glare" />
    <button class="full" @click="onWishlistClick" />
  </div>

  <div
    v-else
    ref="die"
    :class="['die unowned', classes]"
    :style="styles"
    draggable="true"
  >
    <div class="clear layer" />
    <div class="gray-logo layer" />
    <div class="color-logo layer" />
    <svg viewBox="0 0 200 100" class="dotted layer">
      <rect x="5" y="5" width="190" height="90" rx="8" />
    </svg>
    <div class="details">
      <p class="play">
        {{ product.data.type === "standalone" ? $t("TILE.PLAY_IT") : $t("TILE.PLAY_IT_IN") }}
      </p>
      <div class="product-logo" />
      <div class="actions">
        <div class="price">
          <span v-if="product.isDiscounted" class="initial">
            {{ product.data.price?.initialFormatted }}
          </span>
          <span class="final">{{ product.data.price?.finalFormatted }}</span>
        </div>
        <button class="action" @click="onPurchaseClick">
          {{ product.isFree ? $t("TILE.CLAIM") : $t("TILE.PURCHASE") }}
        </button>
      </div>
    </div>
    <template v-if="product.isFree">
      <SaleSticker class="sale-sticker" :text="$t('TILE.FREE')" />
      <div class="free-sash">
        <p>{{ $t("TILE.FREE") }}</p>
      </div>
    </template>
    <template v-else-if="product.isDiscounted">
      <SaleSticker class="sale-sticker" :text="`-${product.data.price?.discount}%`" />
      <div class="sale-sash">
        <p>{{ $t("TILE.ON_SALE") }}</p>
      </div>
    </template>
    <div class="glare" />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import Countdown from "./Countdown.vue";
import SaleSticker from "./SaleSticker.vue";
import FavoritesIconSVG from "../../assets/icons/FavoritesIcon.svg.vue";
import FavoritesStickerSVG from "../../assets/icons/FavoritesSticker.svg.vue";
import InfoIconSVG from "../../assets/icons/InfoIcon.svg.vue";
import Launch from "../modals/Launch.vue";
import LaunchOptions from "../modals/LaunchOptions.vue";
import PurchaseOptions from "../modals/PurchaseOptions.vue";
import Details from "../modals/Details.vue";
import { getGameAssetUrl, getProductAssetUrl, pegi16, esrbM } from "../../services/assets";

const LENTICULAR_IDS = [65];

export default defineComponent({
  name: "Tile",
  components: {
    Countdown,
    SaleSticker,
    FavoritesIconSVG,
    FavoritesStickerSVG,
    InfoIconSVG
  },
  props: {
    game: {
      type: Object as PropType<any>,
      required: true
    },
    matches: {
      type: Object as PropType<any>,
      required: false
    }
  },
  data() {
    return {
      isShowingInfo: false,
      draggingFavoriteImage: new Image(),
      timeUntilRelease: null as number | null,
      releaseInterval: null as any,
      localeInfo: (this as any).$mega?.getLocaleInfo?.(),
      images: {
        pegi16,
        esrbM
      }
    };
  },
  computed: {
    classes(): string[] {
      const e: string[] = [];
      if (this.product.isDiscounted) e.push("discounted");
      if (this.product.isFree) e.push("free");
      if (this.isShowingInfo) e.push("showing-info");
      if (this.isLenticular) e.push("is-lenticular");
      return e;
    },
    showCountdown(): boolean {
      return this.timeUntilRelease ? this.timeUntilRelease < 864e5 : false;
    },
    availableText(): string | undefined {
      if (!this.product.releaseDate || !this.timeUntilRelease) return;
      if (this.timeUntilRelease < 864e5) return this.$t("TILE.AVAILABLE_SOON");
      if (this.timeUntilRelease > 31556952e3) return this.$t("TILE.AVAILABLE_SOON");
      const date = this.product.releaseDate?.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric"
      });
      return this.$t("TILE.AVAILABLE_DATE", { date });
    },
    product(): any {
      return this.game.products[0];
    },
    isLenticular(): boolean {
      return LENTICULAR_IDS.includes(this.game.data.id);
    },
    matchIcons(): any[] {
      return [];
    },
    ratingIcon(): string {
      return this.localeInfo && ["US", "MX", "CA"].includes(this.localeInfo.country)
        ? this.images.esrbM
        : this.images.pegi16;
    },
    styles(): Record<string, string> {
      const gameId = this.game.data.id;
      const baseStyles: Record<string, string> = {
        "--background-url": `url(${getGameAssetUrl(gameId, "tile-background.jpg")})`,
        "--color-logo-url": `url(${getGameAssetUrl(gameId, "tile-logo.png")})`,
        "--gray-logo-url": `url(${getGameAssetUrl(gameId, "tile-logo-gray.png")})`,
        "--side-logo-url": `url(${getGameAssetUrl(gameId, "tile-logo-side.png")})`,
        "--sticker-logo-url": `url(${getGameAssetUrl(gameId, "tile-logo-sticker.png")})`,
        "--foil-url": `url(${getGameAssetUrl(gameId, "tile-foil.png")})`,
        "--product-logo-url": `url(${getProductAssetUrl(this.product.data.id, "logo-side.png")})`,
        "--primary": this.game.data?.colors?.primary || "#fad000"
      };
      if (this.isLenticular) {
        baseStyles["--lent-a-url"] = `url(${getGameAssetUrl(gameId, "tile-lenticular-1.png")})`;
        baseStyles["--lent-b-url"] = `url(${getGameAssetUrl(gameId, "tile-lenticular-2.png")})`;
      }
      return baseStyles;
    }
  },
  beforeMount() {
    if (this.product.isUnreleased) {
      this.startReleaseInterval();
    }
  },
  mounted() {
    this.draggingFavoriteImage.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAt1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqt3L///8AAAD60ABfyZUilV0ackcDCwcVXDkNOSTqwwDLqQCcggAgiVYSGAdeTgBOQQDK7dwnrGsLLh0dKg68nAB9aABtWwA/NAAvJwAfGgCH17A3vHve9OmV27lSxYwloGQdfk4SUDIIIhUVJA4FFw7btgCsjwCNdQAQDQDy+/a86dOi4MEydQo7AAAAEHRSTlMAgBDvYFDfv59Az6+PMCBwImzStQAAAbpJREFUOMu9k+eSmzAURgUSxXXNJ1NtL+5tvb0nef/nioRBEjFLZjKTPb+4V0e3aAbyPxl2LNbRYYdZnWGDxrqQ0L4tI7tPIemyPzTbA+I0eXoW6hUhV0J7fkrSGPDsmtdFHI0k4QrwfWAVFmEUo2uaPbzKg+pM3ioJX9Ez5kYsPHUW1yPoDT0kI4MwNKMEnpoQWI6+ZAlUUzpIzZO7xeLOjFM4pWjVOt8Hgvtab0uJkZEfS3FsJCJDnLWJs3+pmLSJekZWbX0T1PhVbc1KcYD4nLoN6pyzMQakxC2H/NEkRnBJhY9VkftZ9xZFcgVfiQ6OxQOdxoJi0Bv5dSoe5wiHKOh2/dXW6y0lGn++TZrFZDuXnXXvt/2sSZzt32RnjZtn6/BSDNdZ7hITB5PJdWkuguD2dPauJxNZ0MQ7cGUKKo8fPFJnSHfa1N6ODpWimk95doi0Fx0yPtWNNUyYPE+X5Z+S5lx4jDTQl+b7y6P0Hl/epdcnjTB8cJ7N04eHNM84/1D1Lk06F8Jmv9/IC1R5lwzco3Akm6M7IC3YPewyUW6Hnk3acdzP6fTTdchfsS1KLVWuXbXJd/AbaEBC4CC+BiIAAAAASUVORK5CYII=";
  },
  beforeUnmount() {
    this.stopReleaseInterval();
  },
  methods: {
    async onInfoClick() {
      (this as any).isShowingInfo = true;
      await (this as any).$showModal(
        Details,
        { game: this.game },
        { originElement: this.$refs.die as HTMLElement }
      );
      (this as any).isShowingInfo = false;
    },
    async onLaunchClick() {
      let productId = this.game.ownedInstallableProducts[0].data.id;
      if (this.game.ownedInstallableProducts.length > 1) {
        const modalRes = await (this as any).$showModal(LaunchOptions, {
          game: this.game,
          title: this.$t("DETAIL.HOW_TO_LAUNCH", { gameTitle: this.game.data.title })
        });
        if (!modalRes) return;
        productId = modalRes.data.id;
        await (this as any).$mega.triggerAction("game/launch", {
          gameId: this.game.data.id,
          productId
        });
        return;
      }
      if (this.game.isInstalled) {
        (this as any).$showModal(
          Launch,
          { options: { game: this.game.data.id, product: this.product.data.id } },
          { originElement: this.$refs.die as HTMLElement }
        );
      }
      await (this as any).$mega.triggerAction("game/launch", {
        gameId: this.game.data.id,
        productId,
        showModal: false
      });
    },
    async onWishlistClick() {
      await (this as any).$mega.triggerAction("game/wishlist", {
        productId: this.product.data.id
      });
    },
    async onPurchaseClick() {
      let productId = this.game.products[0].data.id;
      if (this.game.installableProducts?.length > 1) {
        const modalRes = await (this as any).$showModal(PurchaseOptions, {
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
    },
    async onFavoriteClick() {
      await (this as any).$mega.triggerAction("game/toggleFavorite", {
        gameId: this.game.data.id
      });
    },
    onFavoriteDragStart(e: DragEvent) {
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setDragImage?.(this.draggingFavoriteImage, 20, 20);
        e.dataTransfer.setData("text/plain", `add:${this.game.data.id}`);
      }
    },
    startReleaseInterval() {
      if (this.product.releaseDate && !this.releaseInterval) {
        this.releaseInterval = window.setInterval(this.onReleaseInterval.bind(this), 1000);
      }
    },
    onReleaseInterval() {
      if (!this.product.isUnreleased) {
        this.stopReleaseInterval();
        return;
      }
      this.timeUntilRelease = this.product.releaseDate.getTime() - Date.now();
    },
    stopReleaseInterval() {
      if (this.releaseInterval) {
        window.clearInterval(this.releaseInterval);
        this.timeUntilRelease = null;
        this.releaseInterval = null;
      }
    }
  }
});
</script>

<style scoped>
.die{container-type:size;width:100%;aspect-ratio:2/1;mask-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAH0CAMAAACZ9vcfAAAAM1BMVEX///8AAABAQEDv7++/v79gYGDPz88wMDDg4OCPj48QEBAgICCAgICvr6+fn59QUFBwcHCusreiAAAEVklEQVR42uzdXU7CUBCA0bG9l/5T9r9aARMDCg36ZMdz9vBlGDJto3nb1NWhHAL4u8oyr+Pbpq3Qp7q0AezBYWh+FXotAexIO0w/DH2czXLYn9I8C13mkEhpXg29yhz2q0yvhD7ZzWHX2tOD0I1zyKZM26GPxwB2r222Qh/dxkAO9XnoXR9ADsOz0DvrOeRxvAtd55DT8TZ0+zkkVR+ErnPIZv0W+hBAMm33JfQ1gHQO96GP/oiDjIa70JcAMupuQm8CSOlwE7qLOMiqfoZeA0iq/wjdQIfU6jV0Ax1S66+hu4mD3NZr6F0AiS2X0B2/QnLTJXRHcZDb6Ry6X+6QXDmHPgeQ2zl0r3GH7Jpw5g7pzXEKILkSvtgA6fVhRYd/wAMtAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAO/swYEAAAAAAJD/ayOoqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqgp7cCAAAAAAAOT/2giqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsIeHAgAAAAAAPm/NoKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrAHBwIAAAAAQP6vjaCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqKuzBgQAAAAAAkP9rI6iqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqCntwIAAAAAAA5P/aCKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqwr693SgMBFEU7DZ+wQIm/2hXlj/wLgEgXVXlcNQzox4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL5iLSDeWEC8ZwHh1noVEG6soYBw9xpc0iHdUMO9gGxdw1JAtLFr6EsByV576NcCkv3soTu7Q7RH76H3XECu7Qh9KiDW2kfo7WML5JqO0I10CLb2EbqRDsGmd+gW3iHU3O/Q+1FAouUc+s16HCS69jn03gqIM/ff0C3CQp7L8i90+3GQZ+uP0G9KhyxTf4beiwc5SPLsc+hK57e9e0lhGAaCIErrEyPJTnL/04agRTAN8dYa6t2hGAYGCRE9ZaFPGxdyQBRNFjp7OhBMlYX+0/nPAQggJ1noJ5VFHVhdGboIXYOH3oGl5be+LHSGOhDHHOcWuus7qQNrKkmThU7qQBDnzD10V9nVgaXkNmQsdDPqwVwH1vBoSdN16G6rrXBFA9xYLsf+6vrrAztwC0Ipx1HMAAAAAElFTkSuQmCC)}
.sticker-box.match-none:not(.active) .die{opacity:.1;transform:scale(.9)}
.unowned .clear{opacity:0;border:1px solid #222;border-radius:4%/8%;background-image:linear-gradient(90deg,#fff0,#ffffff1a 70%,#ffffff0d)}
.unowned .details{position:absolute;display:flex;flex-direction:column;top:0;right:0;bottom:0;width:50%;background:var(--primary);opacity:0;transform:translate(25%);transition:transform .1s ease-in,opacity .05s ease-in}
.unowned .details .play{margin:7% 2% 0;font-size:3.5cqw;font-weight:900;line-height:1;text-align:center;text-transform:uppercase;color:#fff}
.unowned .details .product-logo{flex-grow:1;margin:5% 2%;background-image:var(--product-logo-url);background-position:center;background-repeat:no-repeat;background-size:contain}
.unowned .details .actions{text-align:center;background:#00000026}
.unowned .details .price{margin:5% 0 0;font-size:5cqw}
.unowned .details .price .initial{position:relative;padding:0 3%;font-weight:500;color:#ffffffbf}
.unowned .details .price .initial:after{content:"";position:absolute;inset:30% -1%;background:#5d1212d9;transform:skew(-15deg)}
.unowned .details .price .final{padding:0 3%;font-weight:900;color:#fff}
.unowned .details .action{width:80%;margin:2% auto 6%;padding:3%;background:#fad000;color:#000;font-weight:900;font-size:5cqw;text-transform:uppercase;border-radius:7.5cqw;border:2px solid #000;box-shadow:0 2px #000}
.unowned .details .action:hover{background:#ffea81;transform:translateY(-2px);box-shadow:0 4px #000}
.unowned .details .action:active{background:#ffea81;transform:translateY(1px);box-shadow:0 1px #000}
.unowned .gray-logo{background-image:var(--gray-logo-url)}
.unowned .color-logo{position:absolute;inset:8% 55% 8% 8%;background-image:var(--side-logo-url);background-size:contain;opacity:0}
.unowned .dotted{transform:rotate(180deg)}
.unowned .dotted rect{fill:transparent;stroke-width:3px;stroke:#222;stroke-dasharray:6 8;stroke-linecap:round;vector-effect:non-scaling-stroke}
.unowned .sale-sticker{position:absolute;top:50%;left:27%;width:35%;opacity:0;transform:translate(-50%,-50%) rotate(-5deg)}
.unowned .free-sash,.unowned .sale-sash{pointer-events:none;position:absolute;inset:4% 2%;overflow:hidden}
.unowned .free-sash p,.unowned .sale-sash p{position:absolute;width:135px;font-size:13px;background:var(--primary);font-weight:900;text-align:center;text-transform:uppercase;transform-origin:top left;transform:rotate(-45deg) translate(-50%,-50%);transition:opacity .1s linear,transform .1s linear}
.unowned .free-sash p{top:20px;left:20px}
.locale-es-XL .unowned .free-sash p,.locale-fr .unowned .free-sash p{top:25px;left:25px}
.locale-es .unowned .free-sash p,.locale-it .unowned .free-sash p,.locale-pt-BR .unowned .free-sash p{top:30px;left:30px}
.locale-de .unowned .free-sash p{top:35px;left:35px}
.unowned .sale-sash p{top:25px;left:25px;padding:3px 0}
.locale-fr .unowned .sale-sash p{top:30px;left:30px}
.locale-de .unowned .sale-sash p,.locale-it .unowned .sale-sash p{top:35px;left:35px}
.locale-pt-BR .unowned .sale-sash p{top:40px;left:40px}
.unowned.showing-info .gray-logo,.unowned.showing-info .free-sash{opacity:0}
.unowned.showing-info .dotted rect{animation:marching-ants 1s linear infinite}
.sticker-box.active .unowned .clear{opacity:1}
.sticker-box.active .unowned .details{opacity:1;transform:translate(0)}
.sticker-box.active .unowned .gray-logo{opacity:0}
.sticker-box.active .unowned .color-logo{opacity:1}
.sticker-box.active .unowned .glare{opacity:.2}
.sticker-box.active .unowned .dotted rect{stroke-opacity:.2;stroke:#9d9d9d;animation:marching-ants 1s linear infinite}
.sticker-box.active .unowned .sale-sticker{opacity:1}
.sticker-box.active .unowned .free-sash p{opacity:0;transform:rotate(-45deg) translate(-50%,-100%)}
.sticker-box.active .unowned.discounted .dotted rect{stroke-opacity:1;stroke:#fad000}
.sticker-box .unowned.free .dotted rect{stroke-opacity:1;stroke:var(--primary)}
.sticker-box.active .unowned.free .dotted rect{stroke-opacity:1;stroke:var(--primary)}
.owned .background{background-image:var(--background-url)}
.owned .color-logo{background-image:var(--color-logo-url)}
.owned .banner{position:absolute;top:0;left:0;right:0;height:auto;padding:0 2%;background-color:#fad000;font-size:5cqw;font-weight:900;text-transform:uppercase;text-align:center;color:#000;opacity:0}
.owned .favorite-sticker{position:absolute;top:10px;right:5px;width:12%;height:auto;transform:rotate(5deg);transition:opacity .1s linear}
.owned .rating{position:absolute;height:auto;width:10%;left:3%;top:5%}
.owned .full{position:absolute;inset:0}
.owned .match-icons{display:flex;position:absolute;justify-content:flex-end;inset:auto 3% 5%;z-index:1}
.owned .match-icons .icon{width:10%;color:#fad000}
.owned.showing-info{visibility:hidden}
.sticker-box.active .owned .banner{opacity:1}
.sticker-box.active .owned .favorite-sticker{opacity:0}
.sticker-box.match-all .owned .perfect{background-image:url("@/assets/images/tile-border.png");background-size:cover;background-position:center;background-repeat:no-repeat}
.sticker-box.match-all .owned .perfect:after{content:"";position:absolute;inset:0;background-image:linear-gradient(-75deg,#fbff8800,#fbff881a,#fff,#fbff881a,#fbff8800 40%);background-size:200% 100%;background-position:0% 0%;mix-blend-mode:overlay;animation:shine 2s infinite}
.sticker-box.match-all .owned .match-icons .icon{color:#fff}
.sticker-box.match-all.active .owned .perfect{background-image:radial-gradient(circle at calc(var(--percent-from-left) * 100%) calc(var(--percent-from-top) * 100%),#79bfbf 5%,#b892cf 50%,#ded48a 80%),url("@/assets/images/tile-border.png");background-size:120% 120%,cover;background-position:calc(var(--percent-from-right) * 100%) calc(var(--percent-from-bottom) * 100%),center;background-repeat:no-repeat;background-blend-mode:multiply,normal;mask-image:url("@/assets/images/tile-border.png");mask-size:cover;mask-position:center;mask-repeat:no-repeat;mask-mode:alpha;filter:brightness(1) saturate(2)}
.unreleased .background{background-image:var(--background-url)}
.unreleased .color-logo{background-image:var(--color-logo-url)}
.unreleased .info-banner{position:absolute;top:0;left:0;right:0;height:auto;padding:.5% 0;background-color:#000000d9;font-size:4cqw;font-weight:700;text-transform:uppercase;text-align:center;color:#fad000}
.unreleased .banner{position:absolute;top:0;left:0;right:0;height:auto;padding:.5% 0;background-color:#fad000;font-size:5cqw;font-weight:900;text-transform:uppercase;text-align:center;color:#000;opacity:0}
.unreleased .full{position:absolute;inset:0}
.unreleased.showing-info{visibility:hidden}
.sticker-box.active .unreleased .banner{opacity:1}
@keyframes marching-ants{0%{stroke-dashoffset:0}to{stroke-dashoffset:14}}
@keyframes shine{0%{background-position:0% 0%}to{background-position:-200% 0%}}
.side-actions{pointer-events:none;position:absolute;overflow:hidden;display:none;top:0;left:100%;width:20%;padding-top:6%;opacity:0;transform:translate(-20%);transition:none}
.side-actions .action{position:relative;width:100%;padding:4% 6% 4% 18%;margin-bottom:10%;border-radius:0 8px 8px 0;transform:translate(-12%);transition:transform .05s linear}
.side-actions .action.favorite{background:#282828}
.side-actions .action.info{background:#fad000}
.side-actions .action:hover{transform:translate(0)}
.sticker-box.near-right .side-actions{left:auto;right:100%;transform:translate(20%)}
.sticker-box.near-right .side-actions .action{transform:translate(12%);padding:4% 18% 4% 6%;border-radius:8px 0 0 8px}
.sticker-box.near-right .side-actions .action:hover{transform:translate(0)}
.sticker-box.active .side-actions{opacity:1;display:block;pointer-events:all;transform:translate(0);transition:transform .2s .15s linear(0,.003,.013,.03,.05,.08,.11,.15,.2,.26,.31,.38,.45,.53,.62,.71,.81,.9,.99,.94,.89,.85,.82,.79,.77,.76,.752,.75,.755,.77,.78,.81,.84,.87,.92,.97,.99,.97,.95,.94,.938,.94,.949,.96,.99,.994,.986,.985,.989,1 100% 100%),opacity 0s .15s linear}
</style>
