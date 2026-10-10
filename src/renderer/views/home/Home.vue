<template>
<div class="home">
    <component
      :is="mod[0]"
      v-for="(mod, idx) in modules"
      :key="idx"
      :module="mod[1]"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import GameFeatureModule from "./GameFeatureModule.vue";
import GamesModule from "./GamesModule.vue";
import HeroModule from "./HeroModule.vue";
import MessageModule from "./MessageModule.vue";

export default defineComponent({
  name: "Home",
  components: {
    GameFeatureModule,
    GamesModule,
    HeroModule,
    MessageModule
  },
  computed: {
    modules(): Array<[any, any]> {
      const list: Array<[any, any]> = [];
      const rawModules = (this as any).$mega?.modules ?? [];
      rawModules.forEach((m: any) => {
        if (!m || !m.data?.kind) return;
        switch (m.data.kind) {
          case "gameFeature":
            list.push([GameFeatureModule, m]);
            break;
          case "games":
            list.push([GamesModule, m]);
            break;
          case "hero":
            list.push([HeroModule, m]);
            break;
          case "message":
            list.push([MessageModule, m]);
            break;
          default:
            console.log("Unknown Module Type:", m.data.kind);
        }
      });
      return list;
    }
  }
});
</script>

<style scoped>
.home{padding-top:75px}
.module{width:100%;margin-bottom:30px}
</style>
