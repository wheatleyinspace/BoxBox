import type { App } from "vue";
import Modal from "./Modal.vue";

export default {
  install(app: App) {
    if (app.config.globalProperties.$showModal) return;
    let modalInstance: any = null;
    app.config.globalProperties.$registerModal = (instance: any) => {
      modalInstance = instance;
    };
    app.config.globalProperties.$showModal = (component: any, props = {}, options = {}) => {
      return modalInstance?.show(component, props, options);
    };
    app.component("Modal", Modal);
  }
};
