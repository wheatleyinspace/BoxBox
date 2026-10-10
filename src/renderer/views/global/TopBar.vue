<template>
  <div :class="['top-bar', { 'is-splash': isSplash }]">
    <button class="menu-button" @click="onMenuClick">
      <MenuIconSVG class="icon" />
    </button>
    <form
      v-if="!isSplash"
      class="search-bar"
      @submit.prevent="onQuerySubmit"
      @reset="onQueryReset"
    >
      <input
        v-model="query"
        :placeholder="$t('FILTERS.QUERY.LABEL')"
        @input="onQueryInput"
      />
      <button v-if="query" class="reset" type="reset">
        <XIconSVG class="icon" />
      </button>
      <button v-else type="button">
        <SearchIconSVG class="icon" />
      </button>
    </form>
    <button
      v-if="!isSplash && $mega.user"
      class="user-bug"
      @click="onUserBugClick"
    >
      <span>{{ $mega.user.data?.steamUsername }}</span>
      <img
        :src="$mega.user.data?.profilePicture || defaultAvatar"
        :alt="$mega.user.data?.steamUsername"
      />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import MenuIconSVG from "../../assets/icons/MenuIcon.svg.vue";
import SearchIconSVG from "../../assets/icons/SearchIcon.svg.vue";
import XIconSVG from "../../assets/icons/XIcon.svg.vue";
import { defaultAvatar } from "../../assets/default_avatar"; 

export default defineComponent({
  name: "TopBar",
  components: {
    MenuIconSVG,
    SearchIconSVG,
    XIconSVG
  },
  props: {
    filterManager: {
      type: Object as PropType<any>,
      required: true
    },
    screen: {
      type: String,
      required: true
    }
  },
  emits: {
    didRequestScreen: (screen: string) => true
  },
  data() {
    return {
      query: ""
    };
  },
  computed: {
    isSplash(): boolean {
      return this.screen === "splash";
    },
    defaultAvatar(): string {
      return defaultAvatar;
    }
  },
  watch: {
    "filterManager.filters.query.value": {
      handler(newVal: string) {
        this.query = newVal || "";
      },
      immediate: true
    }
  },
  methods: {
    onMenuClick() {
      (this as any).$mega.triggerAction("user/showMenu", { x: 40, y: 40 });
    },
    onQueryInput() {
      this.filterManager.updateQuery("query", this.query);
    },
    onQuerySubmit() {
      this.$emit("didRequestScreen", "library");
    },
    onQueryReset() {
      this.query = "";
      this.filterManager.updateQuery("query", null);
    },
    onUserBugClick() {
      (this as any).$mega.triggerAction("user/showProfile");
    }
  }
});
</script>

<style scoped>
.top-bar{-webkit-app-region:drag;background-color:#000;border-bottom:1px solid #282828;z-index:1}
.top-bar.is-splash{background-color:#000c}
.menu-button{display:block;cursor:pointer;-webkit-app-region:no-drag;position:absolute;top:14px;left:20px;width:29px}
.platform-darwin .menu-button{display:none}
.search-bar{-webkit-app-region:no-drag;display:flex;gap:10px;align-items:center;position:absolute;top:8px;left:70px;height:39px;width:calc(100% - 480px);max-width:700px;padding:0 20px 0 22px;border-radius:23px;border:2px solid #282828;background-color:#282828;transform:none;transition:border-color .15s linear,background-color .15s linear}
.platform-darwin .search-bar{left:50%;width:calc(100% - 480px);max-width:900px;transform:translate(-50%)}
.search-bar:focus-within{border:2px solid #fad000;background-color:#000}
.search-bar input{position:relative;flex-grow:1;padding:0;background:none;border:none;color:#fefbda;font-weight:800}
.search-bar input:focus{border:none;outline:none}
.search-bar button{position:relative;width:25px;height:25px}
.user-bug{cursor:pointer;-webkit-app-region:no-drag;position:absolute;top:13px;right:20px;font-weight:700}
.user-bug span{display:inline-block;overflow:hidden;max-width:200px;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle}
.user-bug img{height:29px;width:29px;margin-left:5px;border-radius:16px}
.platform-win32 .user-bug,.platform-linux .user-bug{top:14px;right:155px}
</style>
