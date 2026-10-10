<template>
<Splash v-if="screen === 'splash'" @dataIsReady="onDataIsReady" />
  <div v-else :class="`locale-${$i18next.language}`">
    <Home :class="['screen', { active: screen === 'home' }]" />
    <Library :class="['screen', { active: screen === 'library' }]" :filter-manager="filterManager" />
    <Tester :class="['screen', { active: screen === 'tester' }]" />
    <SideNav :screen="screen" @didRequestScreen="onDidRequestScreen" />
  </div>
  <Modal />
  <TopBar
    :filter-manager="filterManager"
    :screen="screen"
    @didRequestScreen="onDidRequestScreen"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TopBar from "./global/TopBar.vue";
import SideNav from "./global/SideNav.vue";
import Splash from "./Splash.vue";
import Home from "./home/Home.vue";
import Library from "./library/Library.vue";
import Tester from "./Tester.vue";
import Modal from "../plugins/modal/Modal.vue";
import { FilterManager } from "../services/FilterManager";
import Confirm from "./modals/Confirm.vue";
import Launch from "./modals/Launch.vue";
import Message from "./modals/Message.vue";
import Text from "./modals/Text.vue";
import Details from "./modals/Details.vue";

export default defineComponent({
  name: "Main",
  components: {
    TopBar,
    SideNav,
    Splash,
    Home,
    Library,
    Tester,
    Modal
  },
  data() {
    return {
      filterManager: new FilterManager(),
      pendingFn: [] as Array<() => void>,
      screen: "splash"
    };
  },
  computed: {
    mega(): any {
      return (this as any).$mega;
    }
  },
  mounted() {
    this.mega.on("didDemandScreen", (s: string) => {
      this.screen = s;
    });
    this.mega.on("didRequestScreen", (s: string) => {
      this.whenReady(() => {
        this.screen = s;
      });
    });
    this.mega.on("didRequestDetail", (slug: string) => {
      this.whenReady(() => {
        this.onDidRequestDetail(slug);
      });
    });
    this.mega.on("didRequestProduct", (slug: string) => {
      this.whenReady(() => {
        this.onDidRequestProduct(slug);
      });
    });
    this.mega.on("didRequestFilters", (filters: any) => {
      this.whenReady(() => {
        this.onDidRequestFilters(filters);
      });
    });
    this.mega.on("didRequestDialog", (dialog: any) => {
      this.whenReady(() => {
        this.onDidRequestDialog(dialog);
      });
    });
  },
  methods: {
    whenReady(fn: () => void) {
      if (this.screen === "splash") {
        this.pendingFn.push(fn);
      } else {
        fn();
      }
    },
    onDataIsReady() {
      if (this.pendingFn.length) {
        this.pendingFn.forEach((fn) => fn());
        this.pendingFn = [];
        return;
      }
      this.screen = "home";
    },
    onDidRequestScreen(s: string) {
      this.screen = s;
    },
    onDidRequestDetail(slug: string) {
      const game = this.mega.getGameBySlug(slug);
      this.screen = "home";
      if (game) {
        (this as any).$showModal(Details, { game });
      }
    },
    onDidRequestProduct(slug: string) {
      const product = this.mega.getProductBySlug(slug);
      this.screen = "library";
      if (product) {
        this.filterManager.updateFromQueryParams({ product: [product.data.id] });
      }
    },
    onDidRequestFilters(filters: any) {
      this.filterManager.updateFromQueryParams(filters);
      this.screen = "library";
    },
    async onDidRequestDialog(dialog: any) {
      let comp: any;
      if (dialog.type === "confirm") comp = Confirm;
      if (dialog.type === "launch") comp = Launch;
      if (dialog.type === "message") comp = Message;
      if (dialog.type === "text") comp = Text;
      if (!comp) return;

      const res = await (this as any).$showModal(comp, { options: dialog });
      const params = dialog.params ?? {};
      if (dialog.resolveAction && res !== undefined) {
        params.value = res;
        await this.mega.triggerAction(dialog.resolveAction, params);
      }
    }
  }
});
</script>
