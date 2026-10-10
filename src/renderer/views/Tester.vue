<template>
  <div class="tester mp">
    <h1>Test Screen</h1>

    <details class="user-entitlements">
      <summary>User entitlements</summary>
      <p class="form-info">Toggle how many products megapicker thinks the local user owns.</p>
      <ButtonsSelect
        v-model="userType"
        :options="userTypeOptions"
        :allows-undefined="false"
      />
      <p class="user-product-array">
        Current user owned Product ID array:<br />
        {{ $mega.user?.data.ownedProductIds }}
      </p>
    </details>

    <details class="tiles-test">
      <summary>Tiles</summary>
      <div
        v-for="g in $mega.games"
        :key="g.data.id"
        class="test-sticker"
      >
        <Sticker class="tile-sticker" :debug="true">
          <Tile :game="g" />
        </Sticker>
      </div>
    </details>

    <details id="audio">
      <summary>Audio</summary>
    </details>

    <details class="open-external">
      <summary>Open external</summary>
      <p class="form-info">
        Enter any path and megapicker will open it using its openExternal method. Useful for testing different ways to launch games.
      </p>
      <form @submit.prevent="onExternalPathSubmit">
        <div class="form-inline">
          <input v-model="externalPath" placeholder="Enter Path" />
          <button class="submit" :disabled="!externalPath">
            <span>open</span>
          </button>
        </div>
      </form>
    </details>

    <details class="open-login">
      <summary>Open login window</summary>
      <p class="form-info">Opens the login window for a jbg user in a web window.</p>
      <button class="primary" @click="onLoginWindowClick" @keydown.enter="onLoginWindowClick">
        <span>Open Login Window</span>
      </button>
      <button class="primary" @click="onLogCookiesClick" @keydown.enter="onLogCookiesClick">
        <span>Log Cookies</span>
      </button>
    </details>

    <details class="launch-test">
      <summary>Launch Test</summary>
      <p class="form-info">A bunch of tiles representing each game allowing you to test various action on them.</p>
      <div class="test-tiles">
        <div
          v-for="item in games"
          :key="item.game.data.id"
          class="test-tile"
        >
          <p class="game-title">{{ item.game.data.title }}</p>
          <div class="tabs">
            <button
              v-for="prod in item.launchable"
              :key="prod.data.id"
              :class="['tab', { selected: item.selected === prod }]"
              @click="onTabClick(item.game, prod)"
            >
              {{ prod.data.title }}
            </button>
          </div>
          <div class="info">
            <p class="info-item">slug: {{ item.game.slug }}</p>
            <p class="info-item">isOwner: {{ item.game.isOwned }}</p>
            <p class="info-item">steamId: {{ item.selected?.data?.steamId }}</p>
            <p class="info-item">{{ item.game.data.launchInfo?.[item.selected?.data?.id]?.path }}</p>
          </div>
          <button class="action" @click="onClickRun('run', item.game, item.selected)">steam://run</button>
          <button class="action" @click="onClickRun('runGameId', item.game, item.selected)">steam://rungameid</button>
          <button class="action" @click="onClickRun('launch', item.game, item.selected)">steam://launch</button>
          <button class="action" @click="onClickOverlay(0, item.selected)">overlay None</button>
          <button class="action" @click="onClickOverlay(1, item.selected)">overlay AddToCart</button>
          <button class="action" @click="onClickOverlay(2, item.selected)">overlay AddToCartAndShow</button>
        </div>
      </div>
    </details>

    <div v-if="toastMessage" class="dev-toast">{{ toastMessage }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ButtonsSelect from "./components/ButtonSelect.vue";
import Sticker from "./components/Sticker.vue";
import Tile from "./components/Tile.vue";

export default defineComponent({
  name: "Tester",
  components: {
    ButtonsSelect,
    Sticker,
    Tile
  },
  data() {
    return {
      toastMessage: null as string | null,
      externalPath: "",
      webPath: "",
      selections: {} as Record<number, any>,
      userType: "all",
      userTypeOptions: [
        { label: "All", value: "all" },
        { label: "Some", value: "some" },
        { label: "None", value: "none" }
      ]
    };
  },
  computed: {
    games(): any[] {
      const rawGames = (this as any).$mega?.data?.games ?? [];
      return rawGames.map((g: any) => {
        const installable = g.products.filter((p: any) => p.isInstallable);
        let selected = installable[0];
        if (this.selections[g.data.id]) {
          selected = this.selections[g.data.id];
        }
        return {
          game: g,
          selected,
          launchable: installable
        };
      });
    }
  },
  watch: {
    userType: "updateUserEntitlements"
  },
  methods: {
    async onExternalPathSubmit() {
      await (this as any).$mega.triggerAction("game/openExternal", { url: this.externalPath });
    },
    onTabClick(game: any, product: any) {
      this.selections[game.data.id] = product;
    },
    setToast(msg: string) {
      this.toastMessage = msg;
    },
    async onClickRun(command: string, game: any, product: any) {
      const res = await (this as any).$mega.triggerAction("game/testLaunch", {
        command,
        gameId: game.data.id,
        productId: product.data.id
      });
      this.setToast(`ran: ${res}`);
    },
    async onClickOverlay(flag: number, product: any) {
      await (this as any).$mega.triggerAction("game/openInOverlay", {
        flag,
        productId: product.data.id
      });
      this.setToast(`opened: ${product.data.title} with flag ${flag}`);
    },
    async onLoginWindowClick() {
      await (this as any).$mega.triggerAction("user/openLoginWindow");
    },
    async updateUserEntitlements() {
      await (this as any).$mega.triggerAction("user/updateDummyUser", this.userType);
    },
    async onLogCookiesClick() {
      await (this as any).$mega.triggerAction("user/logCookies");
    }
  }
});
</script>

<style scoped>
.tester{padding:120px 30px 30px 140px}
h1{margin-bottom:20px;font-weight:900;color:#fefbda}
details{margin-bottom:10px}
details[open]{padding-bottom:30px}
summary{font-size:20px;font-weight:700;margin-bottom:3px}
.test-sticker{margin-bottom:20px}
.tile-sticker{width:300px}
.test-tiles{display:flex;gap:20px;flex-wrap:wrap}
.test-tile{width:calc(25% - 20px);padding:10px;border:1px solid #666;border-radius:10px;text-align:center}
.test-tile .game-title{font-size:14px;font-weight:700}
.test-tile .tabs{display:flex;justify-content:center}
.test-tile .tabs .tab{font-size:10px;font-weight:700;opacity:.4}
.test-tile .tabs .tab.selected{opacity:1}
.test-tile .info{margin:2px 0 5px;padding:2px 0;border-top:1px solid rgba(255,255,255,.2);border-bottom:1px solid rgba(255,255,255,.2)}
.test-tile .info .info-item{font-size:10px;font-weight:400}
.test-tile .action{font-size:13px;margin:2px 0;padding:2px 10px;width:100%;text-align:left;background:#ffffff0d}
.test-tile .action:hover{background:#ffffff1a}
.dev-toast{position:fixed;bottom:0;left:0;right:0;padding:3px 0;background:#b0b0b0;text-align:center;color:#000;user-select:all}
</style>
