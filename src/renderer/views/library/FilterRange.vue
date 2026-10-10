<template>
  <div :class="['range-filter', { 'is-null': isNull }]">
    <div class="range">
      <input
        v-model.number="minIndex"
        :aria-label="`Min ${$t(filter?.label || '')}`"
        class="slider min-slider"
        type="range"
        min="0"
        :max="max"
        step="1"
        @pointerdown="onDown('min')"
        @input="onInput('min')"
      />
      <input
        v-model.number="maxIndex"
        :aria-label="`Max ${$t(filter?.label || '')}`"
        class="slider max-slider"
        type="range"
        min="0"
        :max="max"
        step="1"
        @pointerdown="onDown('max')"
        @input="onInput('max')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "FilterRange",
  props: {
    filterKey: {
      type: String,
      required: true
    },
    filterManager: {
      type: Object as PropType<any>,
      required: true
    }
  },
  data() {
    return {
      isNull: false,
      minIndex: 0,
      maxIndex: 10
    };
  },
  computed: {
    filter(): any {
      return this.filterManager.filters?.[this.filterKey];
    },
    max(): number {
      return (this.filter?.options?.length || 1) - 1;
    }
  },
  watch: {
    "filterManager.filters.duration.value": "setFromValue"
  },
  mounted() {
    this.setFromValue();
  },
  methods: {
    onInput(e: "min" | "max") {
      if (e === "min" && this.minIndex > this.maxIndex - 1) {
        this.minIndex -= 1;
      }
      if (e === "max" && this.maxIndex < this.minIndex + 1) {
        this.maxIndex += 1;
      }
      const minOpt = this.filter?.options?.[this.minIndex];
      if (minOpt == null) return;
      const maxOpt = this.filter?.options?.[this.maxIndex];
      if (maxOpt != null) {
        this.isNull = false;
        this.filterManager.setRange("duration", [minOpt.value, maxOpt.value]);
      }
    },
    onDown(e: "min" | "max") {
      if (this.isNull) {
        if (e === "min") this.minIndex = 0;
        if (e === "max") this.maxIndex = this.max;
        this.onInput(e);
      }
    },
    setFromValue() {
      if (!this.filter || this.filter.value === null) {
        this.minIndex = 0;
        this.maxIndex = this.max;
        this.isNull = true;
        return;
      }
      this.isNull = false;
      const opts = this.filter.options || [];
      this.minIndex = opts.findIndex(
        (opt: any) => opt.value === this.filter.value[0]
      );
      this.maxIndex = opts.findIndex(
        (opt: any) => opt.value === this.filter.value[1]
      );
    }
  }
});
</script>

<style scoped>
.range{position:relative;height:40px}
.slider{pointer-events:none;position:absolute;appearance:none;width:100%;height:10px;background:#000;outline:none;border:none;padding:0;margin:15px 0}
.slider.max-slider{background-color:transparent}
.slider::-webkit-slider-thumb{cursor:pointer;pointer-events:all;appearance:none;width:30px;height:30px;border-radius:15px;background:#fad000;box-shadow:0 5px #00000080}
.is-null .slider::-webkit-slider-thumb{background:#515151}
.is-null .slider::-webkit-slider-thumb:hover{background:#fad000}
</style>
