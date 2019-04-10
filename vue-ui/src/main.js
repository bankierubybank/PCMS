import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Axios from "axios";
import VueResource from "vue-resource";

Vue.use({ VueResource });

Vue.config.productionTip = false;

/*
Vue.prototype.$http = Axios;
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
if (token) {
  Vue.prototype.$http.defaults.headers.common["Authorization"] = token;
  Vue.prototype.$http.defaults.headers.common["username"] = username;
}
*/

/*
Vue.prototype.$http = Axios;
Vue.prototype.$http.defaults.headers.common[
  "Access-Control-Allow-Origin"
] = true;
Axios.defaults.withCredentials = true;
*/

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
