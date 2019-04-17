<template>
  <div class="container">
    <h1>Requested virtual machines</h1>
    <div v-for="(vm, id) in vms" :key="id">
      <b-card
        tag="article"
        style="max-width: 20rem;"
        class="mb-2"
      >
        <b-card-text>Name: {{ vm.Name }}</b-card-text>
        <b-card-text>NumCpu: {{ vm.NumCpu }}</b-card-text>
        <b-card-text>MemoryGB: {{ vm.MemoryGB }}</b-card-text>
        <b-card-text>StartDate: {{ vm.StartDate }}</b-card-text>
        <b-card-text>EndDate: {{ vm.EndDate }}</b-card-text>
      </b-card>
    </div>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
export default {
  name: "RequestedVMs",
  data() {
    return {
      vms: []
    };
  },
  mounted() {
    this.getVMs();
  },
  methods: {
    async getVMs() {
      await GetServices.fetchRegisteredVMs()
        .then(res => {
          this.vms = res.data;
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
