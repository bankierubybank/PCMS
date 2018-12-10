<template>
  <div class="datastores">
    <h1>Posts</h1>
    This file will list all the datastores.

    <div v-for="datastore in datastores">
      <p>
        <span><b>Name: {{ datastore.Name }}</b></span><br />
        <span>Free: {{ datastore.FreeSpaceGB }} GB</span><br />
        <span>Capacity: {{ datastore.CapacityGB }} GB</span>
      </p>
    </div>
  </div>
</template>

<script>
import PostsService from '@/services/PostsService'
export default {
  name: 'datastores',
  data () {
    return {
      datastores: []
    }
  },
  mounted () {
    this.getPosts()
  },
  methods: {
    async getPosts () {
      const response = await PostsService.fetchDatastores()
      this.datastores = response.data
    }
  }
}
</script>
