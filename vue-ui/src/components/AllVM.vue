<template>
  <b-container>
      <h1>Virtual Machines</h1>
      <div>
        <b-table :items="vms" :fields="fields" :busy="loading" class="mt-3">
          <div slot="table-busy" class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </b-table>
      </div>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import router from "@/router";
export default {
  name: "AllVM",
  components: {},
  data() {
    return {
      vms: [],
      fields: ["Name", "Id", "NumCpu", "MemoryGB", "PowerState"],
      loading: true,
      username: "",
      displayName: ""
    };
  },
  mounted() {
    this.getVMs();
  },
  methods: {
    async getVMs() {
      await GetServices.fetchVMs()
        .then(res => {
          this.vms = res.data;
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
