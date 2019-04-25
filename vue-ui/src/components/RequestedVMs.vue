<template>
  <b-row>
    <b-col cols="2">
      <b-list-group>
        <b-list-group-item>
          <router-link to="/overview" class="collection-item"
            >All VM</router-link
          >
        </b-list-group-item>
        <b-list-group-item>
          <router-link to="/newvm" class="collection-item"
            >Request New VM</router-link
          >
        </b-list-group-item>
        <b-list-group-item>
          <router-link to="/requestedvms" class="collection-item"
            >Requested VM</router-link
          >
        </b-list-group-item>
      </b-list-group>
    </b-col>
    <b-col cols="8">
      <div class="container">
        <h1>Requested virtual machines</h1>
        <b-card-group deck>
        <div v-for="(vm, id) in vms" :key="id">
          <b-card style="max-width: 20rem;" class="mb-2">
            <b-card-text>Name: {{ vm.Name }}</b-card-text>
            <b-card-text>NumCpu: {{ vm.NumCpu }}</b-card-text>
            <b-card-text>MemoryGB: {{ vm.MemoryGB }}</b-card-text>
            <b-card-text>StartDate: {{ vm.StartDate }}</b-card-text>
            <b-card-text>EndDate: {{ vm.EndDate }}</b-card-text>
          </b-card>
        </div>
        </b-card-group>
      </div>
    </b-col>
  </b-row>
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
