<template>
<p class="chip">
    <component :is="resolvedIcon" v-if="resolvedIcon" class="icon" />
    <span class="text">{{ label }}</span>
  </p>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DrawingIcon from "../../assets/icons/FilterDrawingIcon.svg.vue";
import TriviaIcon from "../../assets/icons/FilterTriviaIcon.svg.vue";
import DeceptionIcon from "../../assets/icons/FilterDeceptionIcon.svg.vue";
import WritingIcon from "../../assets/icons/FilterWritingIcon.svg.vue";
import SoundIcon from "../../assets/icons/FilterSoundIcon.svg.vue";
import PresentationIcon from "../../assets/icons/FilterPresentationIcon.svg.vue";
import PuzzleIcon from "../../assets/icons/FilterPuzzleIcon.svg.vue";
import RolePlayIcon from "../../assets/icons/FilterRolePlayIcon.svg.vue";
import StrategyIcon from "../../assets/icons/FilterStrategyIcon.svg.vue";
import ActionIcon from "../../assets/icons/FilterActionIcon.svg.vue";

const iconMap: Record<string, any> = {
  drawing: DrawingIcon,
  trivia: TriviaIcon,
  deception: DeceptionIcon,
  writing: WritingIcon,
  sound: SoundIcon,
  speaking: PresentationIcon,
  puzzle: PuzzleIcon,
  rolePlay: RolePlayIcon,
  strategy: StrategyIcon,
  action: ActionIcon
};

function getFilterKey(e: string): string {
  switch (e) {
    case "action": return "FILTERS.TYPE.ACTION";
    case "deception": return "FILTERS.TYPE.DECEPTION";
    case "drawing": return "FILTERS.TYPE.DRAWING";
    case "duration": return "FILTERS.DURATION.LABEL";
    case "features": return "FILTERS.FEATURES.LABEL";
    case "language": return "FILTERS.LANGUAGE.LABEL";
    case "playerCount": return "FILTERS.PLAYER_COUNT.LABEL";
    case "product": return "FILTERS.PRODUCT.LABEL";
    case "puzzle": return "FILTERS.TYPE.PUZZLE";
    case "rolePlay": return "FILTERS.TYPE.ROLE_PLAY";
    case "singlePlayer": return "FILTERS.FEATURES.SINGLE_PLAYER";
    case "speaking": return "FILTERS.TYPE.SPEAKING";
    case "sound": return "FILTERS.TYPE.SOUND";
    case "strategy": return "FILTERS.TYPE.STRATEGY";
    case "teamWork": return "FILTERS.FEATURES.TEAM_WORK";
    case "trivia": return "FILTERS.TYPE.TRIVIA";
    case "type": return "FILTERS.TYPE.LABEL";
    case "writing": return "FILTERS.TYPE.WRITING";
    default: return "";
  }
}

export default defineComponent({
  name: "Chip",
  components: {
    DrawingIcon,
    TriviaIcon,
    DeceptionIcon,
    WritingIcon,
    SoundIcon,
    PresentationIcon,
    PuzzleIcon,
    RolePlayIcon,
    StrategyIcon,
    ActionIcon
  },
  props: {
    icon: {
      type: String,
      required: false
    },
    text: {
      type: String,
      required: true
    }
  },
  computed: {
    resolvedIcon(): any {
      return this.icon ? iconMap[this.icon] : null;
    },
    label(): string {
      const key = getFilterKey(this.text);
      return key ? this.$t(key) : this.text;
    }
  }
});
</script>

<style scoped>
.chip{display:inline-flex;gap:4px;height:25px;border-radius:26px;align-items:center;background-color:#000000bf;font-weight:800;padding:0 15px;font-size:13px;text-transform:capitalize;vertical-align:bottom;line-height:1}
.chip .icon{display:inline;height:22px}
</style>
