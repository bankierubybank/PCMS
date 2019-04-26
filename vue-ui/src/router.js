import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Login from "@/components/Login";
import NewVM from "@/components/NewVM";
import Chart from "@/components/Chart";
import Landing from "./views/Landing.vue";
import MyVM from "@/components/MyVM";
import AllVM from "@/components/AllVM";
import Datastores from "@/components/Datastores";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [{
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/login",
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
      path: "/chart",
      name: "Chart",
      component: Chart
    },
    {
      path: "/about",
      name: "About",
      component: About
    },
    {
      path: "/landing",
      name: "Landing",
      component: Landing
    },
    {
      path: "/allvm",
      name: "AllVM",
      component: AllVM
    },
    {
      path: "/datastores",
      name: "Datastores",
      component: Datastores
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
});