<template>
  <svg viewBox="0 0 500 500">
    <path class="heart" d="M158.13,361.46c40.76,35.94,82.05,58.17,91.87,63.24,9.82-5.06,51.11-27.3,91.87-63.24,27.15-23.93,48.75-49.17,64.22-75.02,19.18-32.06,28.91-65.17,28.91-98.39s-10.25-63.54-29.63-84.18c-17.29-18.42-40.43-28.56-65.15-28.56-45.52,0-86.08,45.18-86.48,45.64l-3.74,4.22-3.74-4.22c-.4-.45-41.05-45.64-86.48-45.64-24.72,0-47.86,10.14-65.15,28.56-19.38,20.65-29.63,49.76-29.63,84.18s9.73,66.33,28.91,98.39c15.46,25.85,37.07,51.09,64.22,75.02Z" />
    <rect class="subtract" x="170.33" y="229.51" width="159.33" height="42.97" rx="15.91" ry="15.91" />
    <path class="plus" d="M313.76,229.51h-42.27v-42.27c0-8.75-7.16-15.91-15.91-15.91h-11.16c-8.75,0-15.91,7.16-15.91,15.91v42.27h-42.27c-8.75,0-15.91,7.16-15.91,15.91v11.16c0,8.75,7.16,15.91,15.91,15.91h42.27v42.27c0,8.75,7.16,15.91,15.91,15.91h11.16c8.75,0,15.91-7.16,15.91-15.91v-42.27h42.27c8.75,0,15.91-7.16,15.91-15.91v-11.16c0-8.75-7.16-15.91-15.91-15.91Z" />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FavoritesIcon.svg"
});
</script>

<style scoped>
.heart{fill:transparent;stroke:#fefbda;stroke-width:20px}
.favorited .heart{fill:#ff6b6b;stroke:#ff6b6b}
.plus,.subtract{display:none}
.signed .heart{fill:#ff6b6b;stroke:#000;stroke-width:30px}
.signed .plus{display:block;fill:#fefbda}
.signed.favorited .plus{display:none}
.signed.favorited .subtract{display:block;fill:#000}
</style>
