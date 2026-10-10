<template>
<div class="splash" :style="{ backgroundImage: `url(${collageSrc})` }">
    <div class="glow" />
    <div class="spinner" />
    <Sticker class="sticker-logo" :ambience="1">
      <div class="die">
        <div class="background layer" />
        <div class="holo layer" />
        <div class="glare layer" />
      </div>
    </Sticker>
    <div class="legal-box">
      <div class="legal">
        <div class="fmod">
          <FmodLogoSVG />
          <p>This product uses FMOD Sound System by Firelight Technologies.</p>
        </div>
        <div class="criware">
          <CriwareLogoSVG />
          <p>Powered by "CRIWARE". CRIWARE is a trademark of CRI Middleware Co., Ltd.</p>
        </div>
        <p class="trademark">Software © {{ year }} Jackbox Games, Inc. All rights reserved. Jackbox Games and the Jackbox Games logo are registered trademarks of Jackbox Games, Inc. Megapicker and all game titles are trademarks of Jackbox Games, Inc. All other trademarks and logos are property of their respective owners.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sticker from "./components/Sticker.vue";
import CriwareLogoSVG from "../assets/images/CriwareLogo.svg.vue";
import FmodLogoSVG from "../assets/images/FmodLogo.svg.vue";

export default defineComponent({
  name: "Splash",
  components: {
    Sticker,
    CriwareLogoSVG,
    FmodLogoSVG
  },
  emits: {
    dataIsReady: () => true
  },
  data() {
    return {
      collageSrc: this.getSplash(),
      readyTimeout: null as any,
      hasLoaded: false
    };
  },
  computed: {
    year(): number {
      return new Date().getFullYear();
    }
  },
  mounted() {
    this.readyTimeout = window.setTimeout(() => {
      this.readyTimeout = null;
      if (this.hasLoaded) this.$emit("dataIsReady");
    }, 3000);
    this.initData();
  },
  methods: {
    async initData() {
      await (this as any).$mega.triggerAction("data/fetchAll", true);
      this.hasLoaded = true;
      if (!this.readyTimeout) this.$emit("dataIsReady");
    },
    getSplash(): string {
      const holidays: Record<string, string[]> = {
        "10/28": ["halloween"],
        "10/29": ["halloween"],
        "10/30": ["halloween"],
        "10/31": ["halloween"],
        "12/23": ["winter"],
        "12/24": ["winter"],
        "12/25": ["winter"],
        "12/26": ["winter"],
        "12/27": ["winter"]
      };
      const now = new Date();
      const isGene = Math.floor(Math.random() * 101) === 100;
      if (isGene) {
        return new URL("../assets/images/splash/gene.png", import.meta.url).href;
      }
      const holidaySplashes = holidays[`${now.getMonth() + 1}/${now.getDate()}`];
      if (holidaySplashes) {
        const choice = holidaySplashes[Math.floor(Math.random() * holidaySplashes.length)];
        return new URL(`../assets/images/splash/${choice}.png`, import.meta.url).href;
      }
      const idx = Math.floor(Math.random() * 8);
      return new URL(`../assets/images/splash/${idx}.png`, import.meta.url).href;
    }
  }
});
</script>

<style scoped>
.splash{display:flex;flex-direction:column;width:100%;height:100%;padding:30px;font-weight:500;font-size:13px;background-color:#000;background-position:center;background-size:cover}
.glow{position:absolute;inset:0;background-position:center;background-size:cover;background-image:url("@/assets/images/glow.png");animation:glow-in-e7523e74 1s linear forwards}
.sticker-logo{position:absolute;top:47.5%;left:50%;height:32%;aspect-ratio:50/26;transform:translate(-50%,-50%);--holo-url: url("@/assets/images/logo-glitter.png")}
.sticker-logo .die{width:100%;height:100%;aspect-ratio:50/26;mask-image:url("@/assets/images/logo-die.png")}
.sticker-logo .background{background-image:url("@/assets/images/logo-background.jpg")}
.legal-box{position:absolute;padding:30px 20px 40px;inset:auto 0 0;background:#000000e6}
.legal{max-width:1400px;display:flex;gap:20px;margin:auto}
.legal div{display:flex;align-items:start;gap:10px}
.legal .fmod{flex:0 0 30%}
.legal .fmod svg{overflow:hidden;flex:0 0 40%}
.legal .criware{flex:0 0 20%}
.legal .criware svg{overflow:hidden;flex:0 0 25%}
@media (min-aspect-ratio: 16/9){.sticker-logo{height:auto;width:34%}}
</style>
