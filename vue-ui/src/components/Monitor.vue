<template>
  <b-container>
    <h1>VM Stat Chart</h1>

    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
        <b-form-select v-model="range" :options="rangeOptions" @change="onChange()"></b-form-select>
      <b-row>
        <b-col>
          <b-table
            :items="queryData"
            :fields="psfields"
            class="mt-3"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
          >
            <template slot="FreeUsedRatio" slot-scope="vm">
              <div>
                <b-button v-b-modal="vm.item.Name" variant="primary" size="sm">ดูข้อมูลโดยละเอียด</b-button>

                <b-modal :id="vm.item.Name" :title="vm.item.Name + ' Stats'" size="lg" hide-footer>
                  <b-container>
                    <b-row>
                      <b-col>
                        PowerState
                        <apexchart
                          type="line"
                          :options="lineOptions"
                          :series="[{ name: vm.item.Name, data: vm.item.PowerStateData }]"
                        />
                      </b-col>
                      <b-col>
                        CPU Usage in Percentage
                        <apexchart
                          type="line"
                          :options="lineOptions"
                          :series="[{ name: vm.item.Name, data: vm.item.CPUData }]"
                        />
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col>
                        Memory Usage in Percentage
                        <apexchart
                          type="line"
                          :options="lineOptions"
                          :series="[{ name: vm.item.Name, data: vm.item.MemoryData }]"
                        />
                      </b-col>
                      <b-col>
                        Disk Usage in KBps
                        <apexchart
                          type="line"
                          :options="lineOptions"
                          :series="[{ name: vm.item.Name, data: vm.item.DiskData }]"
                        />
                      </b-col>
                    </b-row>
                  </b-container>
                </b-modal>
              </div>
            </template>
          </b-table>
          <div>
            Sorting By:
            <b>{{ sortBy }}</b>, Sort Direction:
            <b>{{ sortDesc ? 'Descending' : 'Ascending' }}</b>
          </div>
        </b-col>
        <b-col>
          <b-table :items="datastores" :fields="dsfields" class="mt-3">
        <template slot="FreeUsedRatio" slot-scope="data">
          <div>
            <apexchart
              type="bar"
              height="100"
              :options="barchartOptions"
              :series="[
                {
                  name: 'Used Space',
                  data: [data.item.FreeUsedRatio.UsedSpaceGB]
                },
                {
                  name: 'Free Space',
                  data: [data.item.FreeUsedRatio.FreeSpaceGB]
                }
              ]"
            />
          </div>
        </template>
      </b-table>
        </b-col>
      </b-row>
      <b-row>
        <b-col></b-col>
        <b-col></b-col>
      </b-row>
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
        { text: "--- Please select range ---", value: null, disabled: true },
        { text: "1 Day", value: { days: 1 } },
        { text: "1 Week", value: { weeks: 1 } },
        { text: "1 Month", value: { months: 1 } }
      ],
      queryData: [],
      psfields: [
        {
          key: "Name",
          label: "Datastore Name"
        },
        {
          key: "PowerStatePercentage",
          label: "Power On Percentage"
        },
        {
          key: "FreeUsedRatio",
          label: "Chart"
        }
      ],
      sortBy: "PowerStatePercentage",
      sortDesc: false,
      dsfields: [
        {
          key: "Name",
          label: "Datastore Name",
          sortable: true
        },
        {
          key: "FreeSpaceGB",
          label: "Free Space in GB",
          sortable: true
        },
        {
          key: "CapacityGB",
          label: "Capacity in GB",
          sortable: true
        },
        {
          key: "UsedSpaceGB",
          label: "Used Space in GB",
          sortable: true
        },
        {
          key: "FreeUsedRatio",
          label: "Chart"
        }
      ],
      datastores: [],
      barchartOptions: {
        colors: ["#dc3545", "#28a745"],
        chart: {
          stacked: true,
          stackType: "100%",
          sparkline: {
            enabled: true
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: "20%"
          }
        }
      }
    };
  },
  mounted() {
    this.getPowerState();
    this.getDetailedDatastores();
  },
  methods: {
    async onChange() {
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
          PowerStateSummary: [
            PowerOnCount,
            MappingPowerState.length - PowerOnCount
          ],
          PowerStatePercentage: this.round(
            (PowerOnCount / MappingPowerState.length) * 100,
            2
          )
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
              PowerStateSummary: [PowerOnCount, vm.stats.length - PowerOnCount],
              PowerStatePercentage: this.round(
                (PowerOnCount / vm.stats.length) * 100,
                2
              )
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
    },
    round(value, decimals) {
      return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    },
    async getDetailedDatastores() {
      this.datastores = [];
      this.loading = true;
      let datastores = await GetServices.fetchDatastores().catch(err => {
        if (err.response.status == 403) {
          localStorage.removeItem("user");
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
        }
      });
      Array.prototype.forEach.call(datastores.data, datastore => {
        this.datastores.push({
          Name: datastore.Name,
          Id: datastore.Id,
          FreeSpaceGB: this.round(datastore.FreeSpaceGB, 2),
          CapacityGB: this.round(datastore.CapacityGB, 2),
          UsedSpaceGB: this.round(
            datastore.CapacityGB - datastore.FreeSpaceGB,
            2
          ),
          FreeUsedRatio: {
            FreeSpaceGB: this.round(datastore.FreeSpaceGB, 2),
            UsedSpaceGB: this.round(
              datastore.CapacityGB - datastore.FreeSpaceGB,
              2
            )
          }
        });
      });
      this.loading = false;
    }
  }
};
</script>
