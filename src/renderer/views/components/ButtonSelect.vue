<template>
<div class="buttons-select">
    <button
      v-for="(opt, idx) in displayOptions"
      :key="opt.value"
      :class="{ selected: opt.selected }"
      :disabled="opt.disabled"
      :aria-selected="opt.selected"
      @click="onOptionClick(idx)"
      @keydown.enter="onOptionClick(idx)"
    >
      {{ opt.label ?? opt.value }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "ButtonSelect",
  props: {
    modelValue: {
      type: [Number, String, Array] as PropType<number | string | any[]>,
      required: false
    },
    allowsUndefined: {
      type: Boolean,
      default: true
    },
    options: {
      type: Array as PropType<Array<{ label?: string; value: any; disabled?: boolean }>>,
      required: true
    }
  },
  emits: {
    "update:modelValue": (val: any) => true
  },
  computed: {
    displayOptions(): any[] {
      return this.options.map((opt) => ({
        label: opt.label,
        value: opt.value,
        disabled: opt.disabled,
        selected: this.isMulti
          ? (this.modelValue as any[]).includes(opt.value)
          : this.modelValue === opt.value
      }));
    },
    isMulti(): boolean {
      return Array.isArray(this.modelValue);
    }
  },
  methods: {
    onOptionClick(idx: number) {
      if (this.isMulti) {
        this.onMultiOptionClick(this.displayOptions[idx]);
      } else {
        this.onSingleOptionClick(this.displayOptions[idx]);
      }
    },
    onSingleOptionClick(opt: any) {
      if (this.allowsUndefined && opt.value === this.modelValue) {
        this.$emit("update:modelValue", undefined);
      } else {
        this.$emit("update:modelValue", opt.value);
      }
    },
    onMultiOptionClick(opt: any) {
      const arr = (this.modelValue as any[]).filter((v) => v !== opt.value);
      if (arr.length === (this.modelValue as any[]).length) {
        arr.push(opt.value);
      }
      this.$emit("update:modelValue", arr);
    }
  }
});
</script>

<style scoped>
.buttons-select{display:flex}
</style>
