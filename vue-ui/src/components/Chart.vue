<template>
  <div class="container">
    <h1>Chart</h1>

    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <vue-frappe
        id="test"
        :labels="this.labels"
        title="My Awesome Chart"
        type="axis-mixed"
        :height="300"
        :colors="['purple', '#ffa3ef', 'light-blue']"
        :dataSets="this.data"
      ></vue-frappe>
    </div>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
export default {
  name: "chart",
  components: {},
  data() {
    return {
      chartData: [],
      data: [],
      labels: [],
      loading: true,
      maxLength: 0
    };
  },
  mounted() {
    //this.getVMStat();
    this.getPowerState();
  },
  methods: {
    async getVMStat() {
      const response = await GetServices.fetchVMStat({
        vmName: "PCMS-Server",
        intervalMins: 1440,
        stat: "mem.usage.average"
      });
      this.chartData = response.data;
      console.log(this.chartData);
    },
    async getPowerState() {
      await GetServices.fetchPowerState()
        .then(res => {
          res.data.forEach(vm => {
            this.data.push({
              name: vm.Name,
              chartType: "line",
              values: vm.stats.map(x => {
                if (x.PowerState) {
                  return 1;
                } else {
                  return 0;
                }
              })
            });
            //Get maxinum length of datasets
            if (vm.stats.length > this.maxLength) {
              this.maxLength = vm.stats.length;
              this.labels = vm.stats.map(x => x.timestamp);
            }
          });
          //Pad 0 at beginning for datasets that length are less than the maxinum length of datasets
          this.data.forEach(vm => {
            for (let i = vm.values.length; i < this.maxLength; i++) {
              vm.values = [0].concat(vm.values);
            }
          });
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
