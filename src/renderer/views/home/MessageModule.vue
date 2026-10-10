<template>
<div :class="['module constrain message', classes]">
    <component
      :is="isButton ? 'button' : 'div'"
      class="content"
      :style="styles"
      @click="onClick"
    >
      <span v-if="icon" class="icon-wrapper">
        <component :is="icon" />
      </span>
      <span class="text-wrapper">
        <span class="title">{{ module.data.title }}</span>
        <span class="text">{{ module.data.text }}</span>
      </span>
      <span v-if="module.data.cta" class="cta">
        <span>{{ module.data.cta.label ?? "MORE DETAILS" }} </span>
        <DisclosureIconSVG class="icon" />
      </span>
    </component>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import DisclosureIconSVG from "../../assets/icons/DisclosureIcon.svg.vue";

export default defineComponent({
  name: "MessageModule",
  components: {
    DisclosureIconSVG
  },
  props: {
    module: {
      type: Object as PropType<any>,
      required: true
    }
  },
  computed: {
    isButton(): boolean {
      return this.module.data.cta !== undefined;
    },
    classes(): string[] {
      const e: string[] = [];
      if (this.module.data.category === "alert") e.push("alert");
      return e;
    },
    styles(): Record<string, string> {
      const e: Record<string, string> = {};
      if (this.module.data.color) e["--message-color"] = this.module.data.color;
      if (this.module.data.backgroundColor)
        e["--message-background-color"] = this.module.data.backgroundColor;
      if (this.module.data.hoverColor)
        e["--message-hover-color"] = this.module.data.hoverColor;
      return e;
    },
    icon(): any {
      return null;
    }
  },
  methods: {
    onClick() {
      if (this.module.data.cta?.url) {
        (this as any).$mega.triggerAction("game/openExternal", { url: this.module.data.cta.url });
      }
    }
  }
});
</script>

<style scoped>
.content{display:flex;gap:10px;align-items:center;width:100%;min-height:80px;padding:18px 30px;border-radius:10px;background-color:var(--message-background-color, #fad000);background-image:linear-gradient(to right,#0000,#0000001a);color:var(--message-color, #000);text-align:left;transition:transform .1s linear,background-color .1s linear,color .1s linear}
button.content:hover{background-color:var(--message-hover-background-color, var(--message-background-color, #fad000));background-image:linear-gradient(to right,#fff3,#fff0);color:var(--message-hover-color, var(--message-color, #000));transform:scale(1.005)}
.box span{display:block}
.box.icon-box{flex-shrink:0;width:42px;height:42px}
.box.text-box{flex-grow:1}
.box.cta-box{flex-shrink:0}
.title{font-size:18px;line-height:1.4;font-weight:600}
.text{font-size:15px}
.box .cta{display:flex;align-items:center;gap:3px;padding:8px 12px;font-size:11px;font-weight:800;text-transform:uppercase;border-radius:6px;background:#00000080;color:#fff}
.box .cta .icon{height:10px}
.message.alert .content{background-image:linear-gradient(to right,#ff4032,#b32d23)}
</style>
