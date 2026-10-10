import { createApp, watch } from "vue";
import i18next from "i18next";
import I18NextVue from "i18next-vue";
import Main from "./views/Main.vue";
import ModalPlugin from "./plugins/modal";
import MegaPickerPlugin, { megaService } from "./plugins/mega";
import "./assets/styles/index.css";

import de from "../shared/locales/de.json";
import en from "../shared/locales/en.json";
import esXL from "../shared/locales/es-XL.json";
import es from "../shared/locales/es.json";
import fr from "../shared/locales/fr.json";
import it from "../shared/locales/it.json";
import ptBR from "../shared/locales/pt-BR.json";

async function init() {
  await megaService.ready();

  const supportedLngs = ["de", "en", "es-XL", "es", "fr", "it", "pt-BR"];
  const resources = {
    de: { ns: de, translation: de },
    en: { ns: en, translation: en },
    "es-XL": { ns: esXL, translation: esXL },
    es: { ns: es, translation: es },
    fr: { ns: fr, translation: fr },
    it: { ns: it, translation: it },
    "pt-BR": { ns: ptBR, translation: ptBR }
  };

  await i18next.init({
    defaultNS: "ns",
    fallbackNS: "ns",
    lng: megaService.settings?.language || "en",
    fallbackLng: "en",
    supportedLngs,
    resources
  });

  watch(
    () => megaService.settings?.language,
    (newLang) => {
      if (newLang && newLang !== i18next.language) {
        i18next.changeLanguage(newLang);
      }
    }
  );

  const app = createApp(Main);
  app.use(I18NextVue, { i18next });
  app.use(MegaPickerPlugin);
  app.use(ModalPlugin);
  document.getElementById("app")?.classList.add(`platform-${megaService.env?.PLATFORM || "win32"}`);
  app.mount("#app");
}

init();

