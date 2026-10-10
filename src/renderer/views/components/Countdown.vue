<template>
<div class="countdown">
    <div class="gradient" />
    <div class="glitter" />
    <div class="digit">
      <span>{{ $t("TILE.HOURS") }}</span>{{ parts[0] }}
    </div>
    <div class="divider">:</div>
    <div class="digit">
      <span>{{ $t("TILE.MINUTES") }}</span>{{ parts[1] }}
    </div>
    <div class="divider">:</div>
    <div class="digit">
      <span>{{ $t("TILE.SECONDS") }}</span>{{ parts[2] }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Countdown",
  props: {
    time: {
      type: Number,
      required: true
    }
  },
  computed: {
    parts(): string[] {
      const hours = Math.floor(this.time / 36e5);
      const minutes = Math.floor((this.time % (1e3 * 60 * 60)) / (1e3 * 60));
      const seconds = Math.floor((this.time % (1e3 * 60)) / 1e3);
      return [
        `${hours}`.padStart(2, "0"),
        `${minutes}`.padStart(2, "0"),
        `${seconds}`.padStart(2, "0")
      ];
    }
  }
});
</script>

<style scoped>
.countdown{position:absolute;display:flex;inset:28% -2% 25%;padding-top:2%;transform:translateZ(5px) rotate(-2deg);align-items:center;justify-content:center;background:#000000bf}
.countdown .gradient{position:absolute;inset:0;background-image:linear-gradient(90deg,#cc4cf4,#1e9cd7 50%,#00c8be 80%,#25a1f5);background-size:120% 120%;background-repeat:no-repeat;mix-blend-mode:multiply;opacity:.5;filter:hue-rotate(calc(var(--percent-from-center-x) * 90deg))}
.countdown .glitter{position:absolute;inset:0;background-image:linear-gradient(90deg,#61ff9b,#fff768 50%,#f5b8ff 80%,#65ff18);background-size:120% 120%;background-repeat:no-repeat;mix-blend-mode:hard-light;opacity:.25;mask-image:url("@/assets/images/glitter-a.png");mask-size:cover;mask-position:center center;mask-repeat:no-repeat;mask-mode:luminance;filter:hue-rotate(calc(var(--percent-from-center-x) * 90deg))}
.countdown .digit{position:relative;width:20%;color:#fefbda;font-size:12cqw;font-weight:900;text-align:center;line-height:1.1;text-transform:uppercase;transform:translateZ(5px)}
.countdown .digit span{display:block;font-size:3cqw;font-weight:700}
.countdown .divider{position:relative;color:#fefbda;font-size:8cqw;font-weight:900}
.sticker-box.active .countdown .glitter{opacity:1}
.sticker-box.active .countdown .digit,.sticker-box.active .countdown .divider{scale:1.05;transition:scale .15s linear;backface-visibility:hidden;-webkit-font-smoothing:subpixel-antialiased;filter:drop-shadow(calc(var(--percent-from-center-x) * -8px) calc(var(--percent-from-center-y) * -8px) 0px rgba(0,0,0,.5))}
</style>
