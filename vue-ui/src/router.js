import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import VMs from "@/components/VMs";
import VMHosts from "@/components/VMHosts";
import Datastores from "@/components/Datastores";
import Datacenters from "@/components/Datacenters";

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
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    }
  ]
});
