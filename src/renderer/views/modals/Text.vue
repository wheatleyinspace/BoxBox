<template>
  <div class="modal-container mp">
    <div v-if="options.sticker" :class="['sticker', options.sticker]" />
    <h2 v-if="options.title" class="modal-title">{{ options.title }}</h2>
    <p v-if="options.message" class="message">{{ options.message }}</p>
    <form @submit.prevent="onSubmit">
      <input
        v-model="text"
        type="text"
        :placeholder="options.placeholder ?? 'Enter Text'"
      />
      <button class="primary outlined full" type="submit">
        <span>{{ options.okay }}</span>
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "Text",
  props: {
    options: {
      type: Object as PropType<{
        sticker?: string;
        title?: string;
        message?: string;
        placeholder?: string;
        okay: string;
        value?: string;
        initialValue?: string;
      }>,
      required: true
    }
  },
  emits: {
    didResolve: (val: string) => true
  },
  data() {
    return {
      text: (this.options as any).value ?? (this.options as any).initialValue ?? ""
    };
  },
  methods: {
    onSubmit() {
      if (this.text) {
        this.$emit("didResolve", this.text);
      }
    }
  }
});
</script>
