<template>
  <div class="container">
    <h1>All datacenters</h1>
    <div class="row">
      <div class="datacenters">
        <div v-for="(datacenter, id) in datacenters" :key="id">
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <p>
                  <span>
                    <b>Name: {{ datacenter.Name }}</b>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
export default {
  name: "datacenters",
  data() {
    return {
      datacenters: []
    };
  },
  mounted() {
    this.getDatacenters();
  },
  methods: {
    async getDatacenters() {
      const response = await GetServices.fetchDatacenters();
      this.datacenters = response.data;
    }
  }
};
</script>
