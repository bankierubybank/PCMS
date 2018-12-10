<template>
  <div class="vms">
    <h1>Posts</h1>
    This file will list all the vms.

    <div v-for="vm in vms">
      <p>
        <span><b>VM Name: {{ vm.Name }}</b></span><br />
        <span>PowerState: {{ vm.PowerState }}</span><br />
        <span>Guest: {{ vm.Guest }}</span><br />
        <span>Cpu: {{ vm.NumCpu }} Core</span><br />
        <span>Memory: {{ vm.MemoryGB }} GB</span>
      </p>
    </div>
  </div>
</template>

<script>
import PostsService from '@/services/PostsService'
export default {
  name: 'vms',
  data () {
    return {
      vms: []
    }
  },
  mounted () {
    this.getPosts()
  },
  methods: {
    async getPosts () {
      const response = await PostsService.fetchVMs()
      this.vms = response.data
    }
  }
}
</script>
