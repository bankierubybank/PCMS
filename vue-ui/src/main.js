import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import VueApexCharts from "vue-apexcharts";
import VueSwal from "vue-swal";

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.use(VueSwal);

Vue.component("apexchart", VueApexCharts);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
