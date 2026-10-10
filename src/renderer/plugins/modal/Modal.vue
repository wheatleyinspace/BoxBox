<template>
<div
    v-if="content"
    :class="['modal', classes]"
    @keyup.esc="onEscapeUp"
    @click.self="onCloseClick"
  >
    <Sticker :dampening="5" :suppress-bounce="true">
      <div ref="content" class="content-box">
        <component
          :is="content"
          class="content"
          v-bind="props"
          @didResolve="onDidResolve"
        />
        <button class="close icon" @click="onCloseClick">
          <CloseIconSVG />
        </button>
      </div>
    </Sticker>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import Sticker from "../../views/components/Sticker.vue";
import CloseIconSVG from "../../assets/icons/CloseIcon.svg.vue";

export default defineComponent({
  name: "Modal",
  components: {
    Sticker,
    CloseIconSVG
  },
  data() {
    return {
      content: null as any,
      props: {} as Record<string, any>,
      options: {} as Record<string, any>,
      animation: null as any,
      transitionState: "didLeave",
      resolveFn: null as ((val?: any) => void) | null
    };
  },
  computed: {
    classes(): string[] {
      const e: string[] = [];
      if (this.transitionState === "willEnter") e.push("enter-from");
      if (this.transitionState === "entering") e.push("enter-active");
      if (this.transitionState === "leaving") e.push("leave-to", "leave-active");
      if (this.options.hideCloseButton || this.options.selfCloseOnly) e.push("hide-close");
      return e;
    }
  },
  beforeMount() {
    (this as any).$registerModal(this);
  },
  methods: {
    show(component: any, props = {}, options = {}) {
      this.props = props;
      this.options = options;
      this.content = markRaw(component);
      window.addEventListener("keydown", this.onKeyDown.bind(this));
      this.transitionIn();
      return new Promise((resolve) => {
        this.resolveFn = resolve;
      });
    },
    onDidResolve(...args: any[]) {
      this.resolve(...args);
    },
    async resolve(...args: any[]) {
      window.removeEventListener("keydown", this.onKeyDown.bind(this));
      await this.transitionOut();
      this.resolveFn?.(...args);
      this.content = null;
      this.props = {};
      this.options = {};
      this.animation = null;
      this.resolveFn = null;
    },
    async transitionIn() {
      if (!this.options.originElement) return;
      this.transitionState = "willEnter";
      await this.$nextTick();
      this.transitionState = "entering";
      const e = this.options.originElement.getBoundingClientRect();
      e.x += window.scrollX;
      e.y += window.scrollY;
      const t = this.$refs.content as HTMLElement;
      if (!t) return;
      const s = t.getBoundingClientRect();
      const n = {
        x: e.x - s.x,
        y: e.y - s.y,
        width: e.width / s.width,
        height: e.height / s.height
      };
      this.animation = t.animate(
        [
          {
            transformOrigin: "top left",
            transform: `translate(${n.x}px, ${n.y}px) scale(${n.width}, ${n.height})`
          },
          { transformOrigin: "top left", transform: "none" }
        ],
        { duration: 200, easing: "ease-in-out", fill: "both" }
      );
      this.animation.onfinish = () => {
        this.transitionState = "didEnter";
      };
    },
    async transitionOut() {
      this.transitionState = "willLeave";
      await this.$nextTick();
      return new Promise<void>((resolve) => {
        if (!this.animation) {
          resolve();
          return;
        }
        this.transitionState = "leaving";
        this.animation.onfinish = () => {
          this.transitionState = "didLeave";
          resolve();
        };
        this.animation.reverse();
      });
    },
    onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "escape") this.resolve();
    },
    onEscapeUp() {
      if (!this.options.selfCloseOnly) this.resolve();
    },
    onCloseClick() {
      if (!this.options.selfCloseOnly) this.resolve();
    }
  }
});
</script>

<style scoped>
.modal{position:fixed;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background-color:#000c;z-index:1000;transition:background-color .1s .1s linear,backdrop-filter .1s .1s linear}
.close{position:absolute;top:-20px;right:-20px;width:50px;height:50px;opacity:1;z-index:1;filter:drop-shadow(1px 2px rgba(0,0,0,.75));transform:rotate(10deg);transition:opacity .1s .1s linear}
.close:hover{scale:1.05}
.modal.enter-from,.modal.leave-to{background:#0000}
.modal.enter-from .close,.modal.leave-to .close{opacity:0}
</style>
