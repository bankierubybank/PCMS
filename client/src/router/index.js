import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import VMs from '@/components/VMs'
import VMHosts from '@/components/VMHosts'
import Datastores from '@/components/Datastores'
import Datacenters from '@/components/Datacenters'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/vms',
      name: 'VMs',
      component: VMs
    },
    {
      path: '/vmhosts',
      name: 'VMHosts',
      component: VMHosts
    },
    {
      path: '/datastores',
      name: 'Datastores',
      component: Datastores
    },
    {
      path: '/datacenters',
      name: 'Datacenters',
      component: Datacenters
    }
  ]
})
