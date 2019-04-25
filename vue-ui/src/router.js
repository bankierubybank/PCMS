import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Login from "@/components/Login";
import NewVM from "@/components/NewVM";
import Chart from "@/components/Chart";
import Overview from "@/components/Overview";
import RequestedVMs from "@/components/RequestedVMs";
import Datastores from "@/components/Datastores";
import Datacenters from "@/components/Datacenters";

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
      path: "/requestedvms",
      name: "RequestedVMs",
      component: RequestedVMs
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
      path: "/overview",
      name: "Overview",
      component: Overview
    },
    {
      path: "/test",
      name: "Datacenters",
      component: Datacenters
    },
    {
      path: "/datastores",
      name: "Datastores",
      component: Datastores
    }
  ]
});