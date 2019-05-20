import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/Login";
import NewVM from "@/components/NewVM";
import Monitor from "./views/Monitor.vue";
import Landing from "./views/Landing.vue";
import MyVM from "@/components/MyVM";
import RequestedVM from "@/components/RequestedVM";
import AllVM from "@/components/AllVM";
import Quota from "@/components/Quota";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Login",
      component: Login
    },
    {
      path: "/myvm",
      name: "MyVM",
      component: MyVM
    },
    {
      path: "/newvm",
      name: "NewVM",
      component: NewVM
    },
    {
      path: "/monitor",
      name: "Monitor",
      component: Monitor
    },
    {
      path: "/landing",
      name: "Landing",
      component: Landing
    },
    {
      path: "/requestedvm",
      name: "RequestedVM",
      component: RequestedVM
    },
    {
      path: "/allvm",
      name: "AllVM",
      component: AllVM
    },
    {
      path: "/quota",
      name: "Quota",
      component: Quota
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
});
