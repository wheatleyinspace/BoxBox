<template>
  <button :class="['advanced', { 'has-count': count }]">
    <svg viewBox="0 0 350 100" class="icon">
      <path class="shape background fx sg" />
      <path class="shape fb sb" />
      <polygon class="off-icon fb" points="70 33.15 61.85 25 45 41.85 28.15 25 20 33.15 36.85 50 20 66.85 28.15 75 45 58.15 61.85 75 70 66.85 53.15 50 70 33.15" />
      <polygon class="off-arrow fb" points="335 50 295 90 295 10" />
      <polygon class="on-arrow fy" points="15 50 55 10 55 90" />
      <path class="on-icon fy" d="M333.97,31.69l-18.73,21.77v17.12c0,3.66-4.21,5.73-7.11,3.5l-6.81-5.24c-1.09-.84-1.72-2.13-1.72-3.5v-11.88l-18.25-21.81c-2.26-2.6-.41-6.65,3.03-6.65h46.6c3.47,0,5.3,4.1,2.99,6.69Z" />
    </svg>
    <span class="count">{{ count }}</span>
    <span class="title">
      <span>{{ $t("FILTERS.ADVANCED").toUpperCase() }}</span>
    </span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AdvancedFiltersButton",
  props: {
    count: {
      type: Number,
      required: true
    }
  }
});
</script>

<style scoped>
.advanced{cursor:pointer;position:relative;font-weight:900;font-size:12px;line-height:1.3;transform-origin:right center;transition:transform .1s linear}
.advanced svg,.advanced span{pointer-events:none}
.advanced svg{width:auto;height:100%}
.advanced:hover{transform:scale(1.01)}
.shape{stroke-width:2px;d:path("M0,50 L50,0 L350,0 L350,50 L350,100 L50,100 Z");vector-effect:non-scaling-stroke;stroke-linejoin:round;transition:d .2s linear}
.background{stroke-width:6px}
.off-arrow,.off-icon{opacity:0}
.on-arrow,.on-icon{opacity:1}
.count{display:inline-block;position:absolute;left:35px;top:50%;color:#fad000;font-weight:900;font-size:24px;text-align:left;opacity:0;transform:translateY(-50%)}
.has-count .count{opacity:1;transition:transform .2s .1s linear,opacity .2s .1s linear}
.title{position:absolute;inset:10px 42px;transition:inset .2s linear}
.title span{display:inline-block;position:absolute;left:0;right:0;text-align:right;transition:right .2s linear}
.showing{color:#000}
.showing .shape{fill:#fad000;d:path("M0,50 L0,0 L300,0 L350,50 L300,100 L0,100 Z")}
.showing .off-arrow,.showing .off-icon{opacity:1}
.showing .on-arrow,.showing .on-icon{opacity:0}
.showing .title span{right:100%}
.showing.has-count .count{opacity:0;transform:translate(-5px,-50%)}
</style>
