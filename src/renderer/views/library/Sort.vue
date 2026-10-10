<template>
  <div class="sort">
    <button
      :class="['option', { selected: filterManager.currentSort === 'default' }]"
      @click="onClick('default')"
    >
      {{ $t("FILTERS.SORT.DEFAULT") }}
    </button>
    <button
      :class="['option', { selected: filterManager.currentSort === 'aToZ' }]"
      @click="onClick('aToZ')"
    >
      A-Z
    </button>
    <button
      :class="['option', { selected: filterManager.currentSort === 'zToA' }]"
      @click="onClick('zToA')"
    >
      Z-A
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "Sort",
  props: {
    filterManager: {
      type: Object as PropType<any>,
      required: true
    }
  },
  methods: {
    onClick(sortKey: string) {
      this.filterManager.setSort(sortKey);
    }
  }
});
</script>

<style scoped>
.option{width:100%;font-size:14px;font-weight:700;padding:5px 15px;margin-bottom:5px;border:2px solid #000;border-radius:20px;background:#fad000;color:#000;text-align:left}
.option.selected{background:#000;color:#fff}
</style>
