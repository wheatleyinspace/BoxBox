<template>
<div
    :class="['sticker-box', classes]"
    :style="styles"
    @pointerenter="onPointerEnter"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <div class="sticker">
      <slot />
    </div>
    <pre v-if="debug" class="debug">{{ JSON.stringify(styles, null, 2) }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Sticker",
  props: {
    ambience: {
      type: Number,
      required: false
    },
    dampening: {
      type: Number,
      default: 1
    },
    debug: {
      type: Boolean,
      required: false
    },
    suppressBounce: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      isActive: false,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      distanceFromRight: 99999,
      distanceFromBottom: 99999
    };
  },
  computed: {
    classes(): string[] {
      const e: string[] = [];
      if (this.ambience) e.push("ambient");
      if (this.isActive) e.push("active");
      if (this.suppressBounce) e.push("suppress-bounce");
      if (this.distanceFromRight < 360) e.push("near-right");
      if (this.distanceFromBottom < 100) e.push("near-bottom");
      return e;
    },
    styles(): Record<string, any> {
      const e = this.width / 2;
      const t = this.height / 2;
      const s = this.x - e;
      const n = this.y - t;
      const i = Math.sqrt(s ** 2 + n ** 2);
      const A = Math.sqrt((-e) ** 2 + (-t) ** 2);
      return {
        "--ambience": this.ambience ?? 0,
        "--dampening": 1 / (this.dampening || 1),
        "--tilt-x": this.width ? (this.x * 2) / this.width - 1 : 0,
        "--tilt-y": this.height ? (this.y * 2) / this.height - 1 : 0,
        "--x": this.x,
        "--y": this.y,
        "--width": this.width,
        "--height": this.height,
        "--degrees-from-center": Math.atan2(s, n) * (180 / Math.PI),
        "--from-center": i,
        "--percent-from-center-to-corner": i / A,
        "--percent-from-center-to-top": (i / this.height) * 2 || 0,
        "--percent-from-center-to-left": (i / this.width) * 2 || 0
      };
    }
  },
  methods: {
    onPointerEnter() {
      this.isActive = true;
    },
    onPointerMove(e: PointerEvent) {
      const t = e.currentTarget as HTMLElement;
      const s = t.getBoundingClientRect();
      this.width = t.clientWidth;
      this.height = t.clientHeight;
      this.x = e.clientX - s.left;
      if (this.x < 0) this.x = 0;
      if (this.x > this.width) this.x = this.width;
      this.y = e.clientY - s.top;
      if (this.y < 0) this.y = 0;
      if (this.y > this.height) this.y = this.height;
      this.distanceFromRight = window.innerWidth - s.right;
      this.distanceFromBottom = window.innerHeight - s.bottom;
    },
    onPointerLeave() {
      this.isActive = false;
      this.x = this.width / 2;
      this.y = this.height / 2;
    }
  }
});
</script>

<style>
@property --tilt-x{syntax: "<number>"; inherits: true; initial-value: 0;}
@property --tilt-y{syntax: "<number>"; inherits: true; initial-value: 0;}
.sticker-box{--from-left: var(--x);--from-top: var(--y);--from-right: calc(var(--width) - var(--x));--from-bottom: calc(var(--height) - var(--y));--center-x: calc(var(--width) / 2);--center-y: calc(var(--height) / 2);--from-center-x: calc(var(--x) - var(--center-x));--from-center-y: calc(var(--y) - var(--center-y));--percent-from-left: calc(var(--x) / var(--width));--percent-from-top: calc(var(--y) / var(--height));--percent-from-right: calc(1 - var(--x) / var(--width));--percent-from-bottom: calc(1 - var(--y) / var(--height));--percent-from-center-x: calc(var(--x) * 2 / var(--width) - 1);--percent-from-center-y: calc(var(--y) * 2 / var(--height) - 1);--tilt-ease: .12s linear;position:relative;perspective:600px;transition:transform .2s ease,--tilt-x var(--tilt-ease),--tilt-y var(--tilt-ease)}
.sticker-box .sticker{position:relative;width:100%;scale:1;transform:rotateX(calc(var(--tilt-y) * var(--dampening) * -7deg + 360deg)) rotateY(calc(var(--tilt-x) * var(--dampening) * 7deg));transform-style:preserve-3d;transition:scale .1s ease-out}
.sticker-box .die{position:relative;mask-mode:luminance;mask-size:100% 100%}
.sticker-box .layer,.sticker-box .foil,.sticker-box .glare{pointer-events:none;position:absolute;inset:0;image-rendering:optimizeQuality}
.sticker-box .layer{background-size:cover;background-position:center;background-repeat:no-repeat}
.sticker-box .foil{background-image:radial-gradient(circle at calc(var(--percent-from-left) * 100%) calc(var(--percent-from-top) * 100%),#fff 5%,#000 50%,#fff 80%),linear-gradient(-45deg,#000 15%,#fff,#000 85%),var(--foil-url);background-size:120% 120%,200% 200%,cover;background-position:center center,calc(var(--percent-from-left) * 100%) calc(var(--percent-from-top) * 100%),center center;background-repeat:no-repeat;background-blend-mode:soft-light,difference;mask-image:var(--foil-url);mask-size:cover;mask-position:center center;mask-repeat:no-repeat;mask-mode:alpha;mix-blend-mode:color-dodge;opacity:0;transform:translateZ(1px);filter:brightness(.5) contrast(1.5) saturate(1)}
.sticker-box .glare{background-image:radial-gradient(farthest-corner circle at calc(var(--percent-from-left) * 100%) calc(var(--percent-from-top) * 100%),#fffc 10%,#ffffffa6 20%,#0000004d 90%);mix-blend-mode:overlay;opacity:0;transform:translateZ(1px);transition:opacity .2s}
.sticker-box .lenticular{--lent-wipe: 110cqw;--lent-cycles: .5;--lent-feather: .07;--lent-pitch: 2.5px;--lent-haze: .09;--lent-phase: calc(var(--tilt-x) * var(--dampening) * var(--lent-cycles) * var(--lent-wipe));--lent-abs-tilt: max(var(--tilt-x), calc(var(--tilt-x) * -1));pointer-events:none;position:absolute;inset:0;overflow:hidden;border-radius:0;transform:translate(calc(var(--tilt-x) * var(--dampening) * -1.5px));filter:contrast(.92) saturate(.95) brightness(.97)}
.sticker-box .lent-back,.sticker-box .lent-front,.sticker-box .lent-interference,.sticker-box .lent-specular{position:absolute;inset:0}
.sticker-box .lent-back{background-image:var(--lent-a-url);background-size:cover;background-position:center}
.sticker-box .lent-front{background-image:var(--lent-b-url);background-size:cover;background-position:center;mask-image:linear-gradient(90deg,transparent 0%,#fff calc(var(--lent-feather) * 100%),#fff calc(50% - var(--lent-feather) * 100%),transparent 50%,transparent 100%);mask-size:var(--lent-wipe) 100%;mask-repeat:repeat;mask-position:var(--lent-phase) 0;mask-mode:alpha}
.sticker-box .lent-interference{background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.3) 0,rgba(0,0,0,.3) calc(var(--lent-pitch) / 2),rgba(255,255,255,.3) var(--lent-pitch));mask-image:linear-gradient(90deg,#fff 0%,transparent calc(var(--lent-feather) * 70%),transparent calc(50% - var(--lent-feather) * 70%),#fff 50%,transparent calc(50% + var(--lent-feather) * 70%),transparent calc(100% - var(--lent-feather) * 70%),#fff 100%);mask-size:var(--lent-wipe) 100%;mask-repeat:repeat;mask-position:var(--lent-phase) 0;mask-mode:alpha;mix-blend-mode:overlay;opacity:0}
.sticker-box .lent-specular{background-image:linear-gradient(90deg,transparent calc(var(--percent-from-left) * 100% - 20%),rgba(255,255,255,.34) calc(var(--percent-from-left) * 100%),transparent calc(var(--percent-from-left) * 100% + 20%)),repeating-linear-gradient(90deg,rgba(255,255,255,.045) 0,rgba(0,0,0,.045) calc(var(--lent-pitch) / 2),rgba(255,255,255,.045) var(--lent-pitch));mix-blend-mode:overlay;opacity:0}
.sticker-box .lenticular:after{content:"";pointer-events:none;position:absolute;inset:0;background:#fff;opacity:calc(var(--lent-abs-tilt) * var(--lent-haze))}
.sticker-box.ambient{animation:ambient 2s linear infinite}
.sticker-box.active{z-index:1}
.sticker-box.active .sticker{scale:1.05;filter:drop-shadow(calc(var(--tilt-x) * -10px) calc(var(--tilt-y) * -10px) 0px rgba(0,0,0,.4));transition:scale .5s linear(0,.3,.8,1.2,1.4,1.35,1.2,1.1,.9,.87,.878,.92,.98,1.03,1.05,1.043,1.03,1.01,.99,.984,.985,.991,.998,1.004,1.006,1.0052,1.003,1,.999,.998,.9982,.999,.9999,1 100% 100%)}
.sticker-box.active .foil{opacity:1}
.sticker-box.active .glare{opacity:.6}
.sticker-box.active .lent-interference{opacity:.55}
.sticker-box.active .lent-specular{opacity:calc(1 - (max(var(--tilt-y),var(--tilt-y) * -1)*.45))}
.sticker-box.active.suppress-bounce .sticker{scale:1}
.debug{pointer-events:none;position:absolute;top:0;left:110%;width:300px;font-family:monospace;font-size:10px;z-index:100}
</style>

