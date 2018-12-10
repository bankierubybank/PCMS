<template>
  <div class="datacenters">
    <h1>Posts</h1>
    This file will list all the datacenters.

    <div v-for="datacenter in datacenters">
      <p>
        <span><b>Name: {{ datacenter.Name }}</b></span>
      </p>
    </div>
  </div>
</template>

<script>
import PostsService from '@/services/PostsService'
export default {
  name: 'datacenters',
  data () {
    return {
      datacenters: []
    }
  },
  mounted () {
    this.getPosts()
  },
  methods: {
    async getPosts () {
      const response = await PostsService.fetchDatastores()
      this.datacenters = response.data
    }
  }
}
</script>
