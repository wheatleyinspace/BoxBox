<template>
  <div :class="['between-filter', { 'is-null': isNull }]">
    <input
      v-model.number="index"
      :aria-label="$t(filter?.label || '')"
      class="slider"
      type="range"
      min="0"
      :max="max"
      step="1"
      @input="onInput"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "FilterBetween",
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
      index: 10
    };
  },
  computed: {
    filter(): any {
      return this.filterManager.filters[this.filterKey];
    },
    max(): number {
      return this.isNull ? 10 : (this.filter?.options?.length || 1) - 1;
    }
  },
  watch: {
    "filterManager.filters.playerCount.value": "setFromValue"
  },
  mounted() {
    this.setFromValue();
  },
  methods: {
    onInput() {
      if (this.isNull) {
        const opts = this.filter?.options || [];
        const t = (opts.length - 1) / 2;
        if (this.index < 5) this.index = Math.ceil(t - 1);
        if (this.index > 5) this.index = Math.floor(t + 1);
      }
      const opt = this.filter?.options?.[this.index];
      if (opt?.value != null) {
        this.isNull = false;
        this.filterManager.setBetween(this.filterKey, opt.value);
      }
    },
    setFromValue() {
      if (this.filter?.value == null) {
        this.index = 5;
        this.isNull = true;
        return;
      }
      this.isNull = false;
      const idx = (this.filter?.options || []).findIndex(
        (e: any) => e.value === this.filter.value
      );
      if (idx !== -1) {
        this.index = idx;
      }
    }
  }
});
</script>

<style scoped>
.slider{appearance:none;width:100%;height:10px;background:#000;outline:none;border:none;padding:0;margin:15px 0}
.slider::-webkit-slider-thumb{cursor:pointer;appearance:none;width:30px;height:30px;border-radius:15px;background:#fad000;box-shadow:0 5px #00000080}
.is-null .slider::-webkit-slider-thumb{background:#515151}
.is-null .slider::-webkit-slider-thumb:hover{background:#fad000}
</style>
