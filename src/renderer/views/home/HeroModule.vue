<template>
<div :class="['module hero constrain mp', classes]">
    <component
      :is="isButton ? 'button' : 'div'"
      class="content"
      :style="styles"
      @click.self="onComponentClick"
    >
      <button
        v-if="module.data.isMature"
        class="mature"
        :disabled="isRefreshing"
        @click="onMatureClick"
      >
        {{ $t("MENU.HIDE_MATURE") }}
      </button>
      <div v-if="module.data.cta?.url" class="cta-box">
        <button class="primary" :style="ctaStyles" @click="onClick">
          <span>{{ ctaLabel }}</span>
        </button>
      </div>
    </component>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

const CDN_BASE = "https://cdn.jackboxgames.com/megapicker/images/";

export default defineComponent({
  name: "HeroModule",
  props: {
    module: {
      type: Object as PropType<any>,
      required: true
    }
  },
  data() {
    return {
      isRefreshing: false
    };
  },
  computed: {
    isButton(): boolean {
      return this.module.data.cta?.url ? false : this.module.data.url !== undefined;
    },
    classes(): string[] {
      return [this.module.data.size ?? "small"];
    },
    ctaLabel(): string {
      return this.module.data.cta?.label ?? this.$t("FEED.MORE_DETAILS");
    },
    ctaStyles(): Record<string, string> {
      const e: Record<string, string> = {};
      if (this.module.data.cta?.color) e.color = this.module.data.cta.color;
      if (this.module.data.cta?.backgroundColor)
        e["--cta-background"] = this.module.data.cta.backgroundColor;
      return e;
    },
    styles(): Record<string, string> {
      const e: Record<string, string> = {};
      if (this.module.data.background?.color) {
        e.backgroundColor = this.module.data.background.color;
      }
      if (this.module.data.category === "default" || !this.module.data.background?.url) {
        const defaultHero = new URL("../../assets/images/default-hero.jpg", import.meta.url).href;
        e.backgroundImage = `url(${defaultHero})`;
      } else if (this.module.data.background?.url) {
        const url = this.module.data.background.url.startsWith("http")
          ? this.module.data.background.url
          : `${CDN_BASE}${this.module.data.background.url}`;
        e.backgroundImage = `url(${url})`;
      }
      return e;
    }
  },
  methods: {
    onComponentClick() {
      if (this.isButton && this.module.data.url) {
        (this as any).$mega.triggerAction("game/openExternal", { url: this.module.data.url });
      }
    },
    onClick() {
      if (this.module.data.cta?.url) {
        (this as any).$mega.triggerAction("game/openExternal", { url: this.module.data.cta.url });
      }
    },
    async onMatureClick() {
      this.isRefreshing = true;
      await (this as any).$mega.triggerAction("user/toggleHideMature");
      this.isRefreshing = false;
    }
  }
});
</script>

<style scoped>
.content{position:relative;display:block;width:100%;background-color:#282828;background-size:cover;background-position:center center;aspect-ratio:4/1;border-radius:10px;transition:transform .1s linear}
.small .content{aspect-ratio:4/1}
.medium .content{aspect-ratio:3/1}
.large .content{aspect-ratio:2/1}
.content .mature{position:absolute;top:7px;right:7px;padding:3px 10px;background:#000c;font-weight:500;font-size:13px;color:#9d9d9d;border-radius:15px}
.content .mature:hover{color:#fad000}
.cta-box{position:absolute;padding:10px 20px 20px;display:flex;flex-direction:column;justify-content:center;align-items:center;inset:auto 0 0;background:#0006;text-align:center}
.small .cta-box{aspect-ratio:192/13}
.medium .cta-box{aspect-ratio:192/15}
.large .cta-box{aspect-ratio:192/17}
.cta-box button.primary:before{background:var(--cta-background, #fad000)}
button.content:hover{transform:scale(1.005)}
</style>
