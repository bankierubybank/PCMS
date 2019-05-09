<template>
  <b-container>
    <h1>VM Stat Chart</h1>

    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-card-group deck>
        <div v-for="vm in this.data" v-bind:key="vm.Name">
          <b-card :title="vm.Name">
            <apexchart
              type="pie"
              :options="chartOptions"
              :series="vm.PowerStateSumary"
            />
            <b-button v-b-modal="vm.Name" variant="primary" size="sm"
              >ดูข้อมูลโดยละเอียด</b-button
            >

            <b-modal
              :id="vm.Name"
              :title="vm.Name + ' Stats'"
              size="lg"
              hide-footer
            >
              <b-container>
                <b-row>
                  <b-col>
                    PowerState
                    <apexchart
                      type="line"
                      :options="vm.lineOptions"
                      :series="[{ name: vm.Name, data: vm.PowerStateData }]"
                    />
                  </b-col>
                  <b-col>
                    CPU Usage in Percentage
                    <apexchart
                      type="line"
                      :options="vm.lineOptions"
                      :series="[{ name: vm.Name, data: vm.CPUData }]"
                    />
                  </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    Memory Usage in Percentage
                    <apexchart
                      type="line"
                      :options="vm.lineOptions"
                      :series="[{ name: vm.Name, data: vm.MemoryData }]"
                    />
                  </b-col>
                  <b-col>
                    Disk Usage in KBps
                    <apexchart
                      type="line"
                      :options="vm.lineOptions"
                      :series="[{ name: vm.Name, data: vm.DiskData }]"
                    />
                  </b-col>
                </b-row>
              </b-container>
            </b-modal>
          </b-card>
        </div>
      </b-card-group>
    </div>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import moment from "moment";
export default {
  name: "Monitor",
  components: {},
  data() {
    return {
      data: [],
      loading: true,
      chartOptions: {
        labels: ["Power On", "Power Off"],
        colors: ["#28a745", "#dc3545"]
      }
    };
  },
  mounted() {
    this.getPowerState();
  },
  methods: {
    async getPowerState() {
      this.data = [];
      await GetServices.fetchPowerState()
        .then(res => {
          res.data.forEach(vm => {
            let PowerOnCount = 0;
            let MappingPowerState = vm.stats.map(x => {
              if (x.PowerState) {
                PowerOnCount++;
                return 1;
              } else {
                return 0;
              }
            });
            this.data.push({
              Name: vm.Name,
              PowerStateData: MappingPowerState,
              CPUData: vm.stats.map(x => x.CPU),
              MemoryData: vm.stats.map(x => x.Memory),
              DiskData: vm.stats.map(x => x.Disk),
              lineOptions: {
                chart: {
                  zoom: {
                    type: "x",
                    enabled: true
                  }
                },
                xaxis: {
                  categories: vm.stats.map(x =>
                    moment(x.timestamp)
                      .locale("th")
                      .format("lll")
                  )
                }
              },
              PowerStateSumary: [PowerOnCount, vm.stats.length - PowerOnCount]
            });
          });
          this.loading = false;
        })
        .catch(err => {
          if (err.response.status == 403) {
            localStorage.removeItem("user");
            this.$swal("Session Timeout!");
            this.$router.push({
              name: "Login"
            });
          }
        });
    }
  }
};
</script>
