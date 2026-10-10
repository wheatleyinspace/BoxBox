<template>
  <div class="slider">
    <div ref="scroll" class="content" @scroll="onScroll">
      <slot />
    </div>
    <button :class="['arrow left', { visible: arrows[0] }]" @click="onArrowClick('left')">
      <LeftIconSvg class="icon" />
    </button>
    <button :class="['arrow right', { visible: arrows[1] }]" @click="onArrowClick('right')">
      <RightIconSvg class="icon" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LeftIconSvg from "../../assets/icons/LeftIcon.svg.vue";
import RightIconSvg from "../../assets/icons/RightIcon.svg.vue";

export default defineComponent({
  name: "Slider",
  components: {
    LeftIconSvg,
    RightIconSvg
  },
  props: {
    willChange: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      elWidth: 0,
      scrollWidth: 0,
      scrollLeft: 0,
      observer: null as MutationObserver | null
    };
  },
  computed: {
    arrows(): [boolean, boolean] {
      if (this.scrollWidth <= this.elWidth) return [false, false];
      return [
        this.scrollLeft > 0,
        this.scrollLeft + this.elWidth + 140 < this.scrollWidth
      ];
    }
  },
  mounted() {
    window.addEventListener("resize", this.setDimensions.bind(this));
    this.setDimensions();
    if (this.willChange) {
      this.observer = new MutationObserver(this.onObserverChange.bind(this));
      this.observer.observe(this.$refs.scroll as Node, { childList: true, subtree: true });
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.setDimensions.bind(this));
    this.observer?.disconnect();
  },
  methods: {
    setDimensions() {
      const el = this.$refs.scroll as HTMLElement;
      if (!el) return;
      this.elWidth = el.clientWidth;
      this.scrollWidth = el.scrollWidth;
      this.scrollLeft = el.scrollLeft;
    },
    onScroll() {
      this.setDimensions();
    },
    onObserverChange() {
      this.setDimensions();
    },
    onArrowClick(dir: "left" | "right") {
      const el = this.$refs.scroll as HTMLElement;
      if (!el) return;
      const delta = dir === "left" ? -this.elWidth * 0.75 : this.elWidth * 0.75;
      el.scrollBy({ left: delta, behavior: "smooth" });
    }
  }
});
</script>

<style scoped>
.slider{position:relative;overflow:hidden}
.content{padding:10px 13px 10px 128px;display:flex;flex-wrap:nowrap;overflow-x:scroll;scroll-snap-type:x mandatory;scroll-behavior:smooth;scroll-snap-stop:always;scroll-padding-left:128px}
.content :deep(> div),.content :deep(> button),.content :deep(> .item),.content > div,.content > button,.content > .item{flex-shrink:0;flex-basis:20%;scroll-snap-align:start}
.content :deep(> .empty),.content > .empty{flex-basis:100%}
@media (max-width: 1400px){.content :deep(> div),.content :deep(> button),.content :deep(> .item),.content > div,.content > button,.content > .item{flex-basis:25%}}
@media (max-width: 1100px){.content :deep(> div),.content :deep(> button),.content :deep(> .item),.content > div,.content > button,.content > .item{flex-basis:33.3%}}
.arrow{position:absolute;pointer-events:none;top:50%;width:50px;height:50px;color:#fff;opacity:0;transition:opacity .2s linear,translate .2s linear,transform .1s linear}
.arrow.left{translate:-20% -50%;left:115px}
.arrow.right{translate:20% -50%;right:0}
.arrow.visible{translate:0% -50%;pointer-events:all;opacity:1;z-index:1}
.arrow:hover{transform:scale(1.1)}
.arrow svg{width:100%;height:100%}
</style>
