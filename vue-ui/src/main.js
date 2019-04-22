import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import VCalendar from "v-calendar";
import Chart from "vue2-frappe";

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.use(VCalendar, {
  firstDayOfWeek: 1
});

Vue.use(Chart);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
