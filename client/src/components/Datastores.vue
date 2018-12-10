<template>
  <div class="container">
    <h1>All datastores</h1>
      <div class="row">
        <div class="datastores">
          <div v-for="datastore in datastores">
            <div class="col s12 m6">
              <div class="card">
              <div class="card-content">
                <p><span><b>Name: {{ datastore.Name }}</b></span></p>
                <p><span>Free: {{ datastore.FreeSpaceGB }} GB</span></p>
                <p><span>Capacity: {{ datastore.CapacityGB }} GB</span></p>
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
