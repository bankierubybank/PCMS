<template>
  <div class="container">
    <h1>Requested virtual machines</h1>
    <div class="row">
      <div class="vms">
        <div v-for="(vm, id) in vms" :key="id">
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <p>
                  <span>
                    <b>VM Name: {{ vm.Name }}</b>
                  </span>
                </p>
                <p>
                  <span>Guest: {{ vm.Guest }}</span>
                </p>
                <p>
                  <span>Cpu: {{ vm.NumCpu }} Core</span>
                </p>
                <p>
                  <span>Memory: {{ vm.MemoryGB }} GB</span>
                </p>
                <p>
                  <span>Storage: {{ vm.ProvisionedSpaceGB }} GB</span>
                </p>
                <p>
                  <span>OS: {{ vm.OS }}</span>
                </p>
                <p>
                  <span>StartDate: {{ vm.StartDate }}</span>
                </p>
                <p>
                  <span>EndDate: {{ vm.EndDate }}</span>
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
