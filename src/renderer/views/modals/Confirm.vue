<template>
  <div class="modal-container mp">
    <div v-if="options.sticker" :class="['sticker', options.sticker]" />
    <h2 v-if="options.title" class="modal-title">{{ options.title }}</h2>
    <p v-if="options.message" class="message">{{ options.message }}</p>
    <button class="primary outlined" @click="onOkayClick">
      <span>{{ options.okay ?? $t("MENU.CONTINUE") }}</span>
    </button>
    <button class="primary outlined secondary" @click="onCancelClick">
      <span>{{ options.cancel ?? $t("MENU.CANCEL") }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "Confirm",
  props: {
    options: {
      type: Object as PropType<{
        sticker?: string;
        title?: string;
        message?: string;
        okay?: string;
        cancel?: string;
      }>,
      required: true
    }
  },
  emits: {
    didResolve: (val: boolean) => true
  },
  methods: {
    onOkayClick() {
      this.$emit("didResolve", true);
    },
    onCancelClick() {
      this.$emit("didResolve", false);
    }
  }
});
</script>

<style scoped>
.modal-container{text-align:center}
button{margin:0 10px}
</style>
