<template>
  <svg viewBox="0 0 550 300">
    <rect class="bg" x="0" y="0" width="550" height="300" rx="10" ry="10" />
    <rect class="stripe" x="0" y="30" width="550" height="100" />
    <line class="line" x1="204" y1="118" x2="30" y2="30" />
    <line class="line" x1="520" y1="270" x2="345" y2="181" />
    <line class="line" x1="347" y1="121" x2="520" y2="30" />
    <line class="line" x1="30" y1="270" x2="202" y2="178" />
    <line class="line" y1="150" x2="107" y2="149" />
    <line class="line" x1="442" y1="150" x2="550" y2="149" />
    <text x="275" y="110" class="label">{{ $t("TILE.ON_SALE") }}</text>
    <text x="275" y="260" class="value">{{ text }}</text>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SaleSticker",
  props: {
    text: {
      type: String,
      required: true
    }
  }
});
</script>

<style scoped>
.bg{fill:#fefbda}
.stripe{fill:#dc421c}
.line{fill:none;stroke:#000;stroke-width:3px;stroke-opacity:.45}
text{font-family:var(--font);font-style:normal;text-anchor:middle}
.label{fill:#fad000;font-size:80px;font-weight:500}
.value{fill:#000;font-size:130px;font-weight:900;letter-spacing:-2px}
.locale-de .value{font-size:110px}
</style>
