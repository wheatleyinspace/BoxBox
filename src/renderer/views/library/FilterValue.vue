<template>
  <div class="value-filter">
    <button
      v-for="opt in (filter?.options || [])"
      :key="opt.value"
      :class="['option', { selected: filter?.value === opt.value }]"
      @click="onClick(opt.value)"
    >
      {{ $t(opt.label) }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "FilterValue",
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
  computed: {
    filter(): any {
      return this.filterManager.filters[this.filterKey];
    }
  },
  methods: {
    onClick(val: any) {
      if (this.filter?.value === val) {
        this.filterManager.setValue(this.filterKey, null);
        return;
      }
      this.filterManager.setValue(this.filterKey, val);
    }
  }
});
</script>

<style scoped>
.option{font-size:12px;font-weight:700;padding:3px 10px;margin:0 5px 3px 0;border-radius:20px;background:#00000080}
.option.selected{background:#fad000;color:#000}
</style>
