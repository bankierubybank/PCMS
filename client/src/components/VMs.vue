<template>
  <div class="container">
    <h1>All virtual machines</h1>
      <div class="row">
        <div class="vms">
          <div v-for="vm in vms">
            <div class="col s12 m6">
              <div class="card">
              <div class="card-content">
                <p><span><b>VM Name: {{ vm.Name }}</b></span></p>
                <p><span>PowerState: {{ vm.PowerState }}</span></p>
                <p><span>Guest: {{ vm.Guest }}</span></p>
                <p><span>Cpu: {{ vm.NumCpu }} Core</span></p>
                <p><span>Memory: {{ vm.MemoryGB }} GB</span></p>
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
