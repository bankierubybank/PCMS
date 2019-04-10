import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Login from "@/components/Login";
import VMs from "@/components/VMs";
import VMHosts from "@/components/VMHosts";
import Datastores from "@/components/Datastores";
import Datacenters from "@/components/Datacenters";
import NewVM from "@/components/NewVM";
import Chart from "@/components/Chart";
import Overview from "@/components/Overview";
import Content from "@/components/Content";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
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
      path: "/vms",
      name: "VMs",
      component: VMs
    },
    {
      path: "/vmhosts",
      name: "VMHosts",
      component: VMHosts
    },
    {
      path: "/datastores",
      name: "Datastores",
      component: Datastores
    },
    {
      path: "/datacenters",
      name: "Datacenters",
      component: Datacenters
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
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    },
    {
      path: "/overview",
      name: "Overview",
      component: Overview
    },
    {
      path: "/content",
      name: 'Content',
      component: Content
    }
  ]
});
