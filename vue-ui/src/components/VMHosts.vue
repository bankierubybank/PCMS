<template>
  <div class="container">
    <h1>All hosts</h1>
    <div class="row">
      <div class="hosts">
        <div v-for="(host, id) in hosts" :key="id">
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <p>
                  <span>
                    <b>Name: {{ host.Name }}</b>
                  </span>
                </p>
                <p>
                  <span
                    >CPU: {{ host.CpuUsageMhz / 1000 }} /
                    {{ host.CpuTotalMhz / 1000 }} GHz</span
                  >
                </p>
                <p>
                  <span
                    >Memory: {{ host.MemoryUsageGB }} /
                    {{ host.MemoryTotalGB }} GB</span
                  >
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
  name: "hosts",
  data() {
    return {
      hosts: []
    };
  },
  mounted() {
    this.getVMHosts();
  },
  methods: {
    async getVMHosts() {
      const response = await GetServices.fetchVMHosts();
      this.hosts = response.data;
    }
  }
};
</script>
