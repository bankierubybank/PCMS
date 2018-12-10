<template>
  <div class="container">
    <h1>All hosts</h1>
      <div class="row">
        <div class="hosts">
          <div v-for="host in hosts">
            <div class="col s12 m6">
              <div class="card">
              <div class="card-content">
                <p><span><b>Name: {{ host.Name }}</b></span></p>
                <p><span>CPU: {{ host.CpuUsageMhz }} / {{ host.CpuTotalMhz }} MHz</span></p>
                <p><span>Memory: {{ host.MemoryUsageGB }} / {{ host.MemoryTotalGB }} GB</span></p>
              </div>
              </div>
            </div>
          </div>
        </div>
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
