<template>
  <div class="container">
    <h1>Virtual Machines</h1>
    <div>
      <b-table :items="vms" :fields="fields" :busy="loading" class="mt-3">
        <div slot="table-busy" class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong> Loading...</strong>
        </div>
      </b-table>
    </div>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
import router from "@/router";
export default {
  name: "vms",
  components: {},
  data() {
    return {
      vms: [],
      fields: ["Name", "NumCpu", "MemoryGB"],
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
