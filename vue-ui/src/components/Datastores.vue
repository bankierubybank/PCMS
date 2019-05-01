<template>
  <b-container>
    <h1>All datastores</h1>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-card-group deck>
        <div v-for="(datastore) in this.datastores" v-bind:key="datastore.Id">
          <b-card>
            <b-card-text>Datastore Name: {{ datastore.Name }}</b-card-text>
            <b-card-text>FreeSpace GB: {{ datastore.FreeSpaceGB }}</b-card-text>
            <b-card-text>UsedSpace GB: {{ datastore.UsedSpaceGB }}</b-card-text>
            <b-card-text>Capacity GB: {{ datastore.CapacityGB }}</b-card-text>
            <apexchart type="pie" :options="chartOptions" :series="[datastore.FreeSpaceGB, datastore.UsedSpaceGB]"/>
          </b-card>
        </div>
      </b-card-group>
    </div>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
export default {
  name: "Datastores",
  data() {
    return {
      datastores: [],
      chartOptions: {
        labels: ["FreeSpace GB", "Used GB"],
        colors: ["#28a745", "#dc3545"]
      },
      loading: true
    };
  },
  mounted() {
    this.getDatastores();
  },
  methods: {
    async getDatastores() {
      this.datastores = [];
      await GetServices.fetchDatastores()
        .then(res => {
          res.data.forEach(datastore => {
            this.datastores.push({
              Name: datastore.Name,
              FreeSpaceGB: datastore.FreeSpaceGB,
              CapacityGB: datastore.CapacityGB,
              UsedSpaceGB: (datastore.CapacityGB - datastore.FreeSpaceGB)
            })
          })
          this.loading = false;
        })
        .catch(err => {
          if (err.response.status == 403) {
            alert("Session Timeout!");
            this.$router.push({
              name: "Login"
            });
          }
        });
    }
  }
};
</script>
