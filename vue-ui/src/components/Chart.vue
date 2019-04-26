<template>
  <b-container>
    <h1>VM Stat Chart</h1>

    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-card-group deck>
        <div v-for="(vm) in this.data" v-bind:key="vm.name">
          <b-card>
            <b-card-text>VM Name: {{ vm.name }}</b-card-text>
            <apexchart type="pie" :options="chartOptions" :series="vm.sum"/>
            <b-button v-b-modal="vm.name">See Detail</b-button>

            <b-modal :id="vm.name" :title="'VM Name: ' + vm.name" hide-footer>
              <apexchart
                type="line"
                :options="vm.lineOptions"
                :series="[{ name: vm.name, data: vm.data}]"
              />
            </b-modal>
          </b-card>
        </div>
      </b-card-group>
    </div>
  </b-container>
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
      maxLength: 0,
      series: [44, 55],
      chartOptions: {
        labels: ["Power On", "Power Off"],
        colors: ["#28a745", "#dc3545"]
      }
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
            let PowerOnCount = 0;
            let temp = vm.stats.map(x => {
              if (x.PowerState) {
                PowerOnCount++;
                return 1;
              } else {
                return 0;
              }
            });
            this.data.push({
              name: vm.Name,
              data: temp,
              lineOptions: {
                chart: {
                  zoom: {
                    enabled: true
                  }
                },
                xaxis: {
                  categories: vm.stats.map(x => x.timestamp)
                }
              },
              sum: [PowerOnCount, vm.stats.length - PowerOnCount]
            });
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
