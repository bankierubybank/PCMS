<template>
  <div class="hosts">
    <h1>Posts</h1>
    This file will list all the hosts.

    <div v-for="host in hosts">
      <p>
        <span><b>Host: {{ host.Name }}</b></span><br />
        <span>CPU: {{ host.CpuUsageMhz }} / {{ host.CpuTotalMhz }} MHz</span><br />
        <span>Memory: {{ host.MemoryUsageGB }} / {{ host.MemoryTotalGB }} GB</span>
      </p>
    </div>
  </div>
</template>

<script>
import PostsService from '@/services/PostsService'
export default {
  name: 'hosts',
  data () {
    return {
      hosts: []
    }
  },
  mounted () {
    this.getPosts()
  },
  methods: {
    async getPosts () {
      const response = await PostsService.fetchVMHosts()
      this.hosts = response.data
    }
  }
}
</script>
