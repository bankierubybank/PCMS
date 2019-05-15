<template>
  <b-container>
    <h1>VM Stat Chart</h1>

    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-form @submit="onSubmit">
        <b-form-select v-model="range" :options="rangeOptions"></b-form-select>
        <b-button type="submit" variant="primary">Submit</b-button>
      </b-form>
      <b-card-group deck>
        <div v-for="vm in this.queryData" v-bind:key="vm.Name">
          <b-card :title="vm.Name">
            <apexchart type="pie" :options="chartOptions" :series="vm.PowerStateSumary"/>
            <b-button v-b-modal="vm.Name" variant="primary" size="sm">ดูข้อมูลโดยละเอียด</b-button>

            <b-modal :id="vm.Name" :title="vm.Name + ' Stats'" size="lg" hide-footer>
              <b-container>
                <b-row>
                  <b-col>
                    PowerState
                    <apexchart
                      type="line"
                      :options="lineOptions"
                      :series="[{ name: vm.Name, data: vm.PowerStateData }]"
                    />
                  </b-col>
                  <b-col>
                    CPU Usage in Percentage
                    <apexchart
                      type="line"
                      :options="lineOptions"
                      :series="[{ name: vm.Name, data: vm.CPUData }]"
                    />
                  </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    Memory Usage in Percentage
                    <apexchart
                      type="line"
                      :options="lineOptions"
                      :series="[{ name: vm.Name, data: vm.MemoryData }]"
                    />
                  </b-col>
                  <b-col>
                    Disk Usage in KBps
                    <apexchart
                      type="line"
                      :options="lineOptions"
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
      },
      lineOptions: {
        toolbar: {
          show: true
        },
        xaxis: {
          type: "datetime"
        }
      },
      range: null,
      rangeOptions: [
        { text: "1 Day", value: { days: 1 } },
        { text: "1 Week", value: { weeks: 1 } },
        { text: "1 Month", value: { months: 1 } }
      ],
      queryData: []
    };
  },
  mounted() {
    this.getPowerState();
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.loading = true;
      this.queryData = [];
      this.data.forEach(vm => {
        let PowerOnCount = 0;
        let MappingPowerState = vm.PowerStateData.map(x => {
          if (moment(x[0]).isBetween(moment().subtract(this.range), moment())) {
            if (x[1]) {
              PowerOnCount++;
            }
            return x;
          }
        }).filter(x => x);
        this.queryData.push({
          Name: vm.Name,
          PowerStateData: MappingPowerState,
          CPUData: vm.CPUData.map(x => {
            if (
              moment(x[0]).isBetween(moment().subtract(this.range), moment())
            ) {
              return x;
            }
          }).filter(x => x),
          MemoryData: vm.MemoryData.map(x => {
            if (
              moment(x[0]).isBetween(moment().subtract(this.range), moment())
            ) {
              return x;
            }
          }).filter(x => x),
          DiskData: vm.DiskData.map(x => {
            if (
              moment(x[0]).isBetween(moment().subtract(this.range), moment())
            ) {
              return x;
            }
          }).filter(x => x),
          PowerStateSumary: [
            PowerOnCount,
            MappingPowerState.length - PowerOnCount
          ]
        });
      });
      this.loading = false;
    },
    async getPowerState() {
      this.data = [];
      await GetServices.fetchPowerState()
        .then(res => {
          res.data.forEach(vm => {
            let PowerOnCount = 0;
            let MappingPowerState = vm.stats.map(x => {
              if (x.PowerState) {
                PowerOnCount++;
                return [new Date(x.timestamp), 1];
              } else {
                return [new Date(x.timestamp), 0];
              }
            });
            this.data.push({
              Name: vm.Name,
              PowerStateData: MappingPowerState,
              CPUData: vm.stats.map(x => [new Date(x.timestamp), x.CPU]),
              MemoryData: vm.stats.map(x => [new Date(x.timestamp), x.Memory]),
              DiskData: vm.stats.map(x => [new Date(x.timestamp), x.Disk]),
              PowerStateSumary: [PowerOnCount, vm.stats.length - PowerOnCount]
            });
          });
          this.queryData = this.data;
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
