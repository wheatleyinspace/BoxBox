<template>
  <div class="modal-container mp">
    <div v-if="options.sticker" :class="['sticker', options.sticker]" />
    <h2 v-if="options.title" class="modal-title">{{ options.title }}</h2>
    <p v-if="options.message" class="message">{{ options.message }}</p>
    <button class="primary outlined full" @click="onCloseClick">
      <span>{{ options.okay ?? $t("MENU.CONTINUE") }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "Message",
  props: {
    options: {
      type: Object as PropType<{
        sticker?: string;
        title?: string;
        message?: string;
        okay?: string;
      }>,
      required: true
    }
  },
  emits: {
    didResolve: (val: boolean) => true
  },
  methods: {
    onCloseClick() {
      this.$emit("didResolve", true);
    }
  }
});
</script>

<style scoped>
.modal-container{text-align:center}
</style>
