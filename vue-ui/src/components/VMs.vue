<template>
  <div class="container">
    <h1>All virtual machines</h1>
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
                  <span v-if="vm.PowerState">PowerState: On</span>
                  <span v-else>PowerState: Off</span>
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
                  <span>Storage: {{ vm.UsedSpaceGB }} GB</span>
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
  name: "vms",
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
      const response = await GetServices.fetchVMs();
      this.vms = response.data;
    }
  }
};
</script>
