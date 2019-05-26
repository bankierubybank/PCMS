<template>
  <b-container fluid>
    <h1>Monitor Dashboard</h1>
    <b-row>
      <b-col>
        <div v-if="elements.chartLoading">
          <b-spinner variant="primary" label="Spinning"></b-spinner>
        </div>
        <div v-else>
          <b-card-group deck>
            <b-card title="Storage Summary">
              <apexchart
                type="pie"
                width="100%"
                height="200"
                :options="pieChartOptions"
                :series="[storageSummary.totalFree, storageSummary.totalUsed]"
              />
            </b-card>
          </b-card-group>
        </div>
      </b-col>
      <b-col></b-col>
    </b-row>
    <br>
    <b-row>
      <b-col>
        Top Powered Off VM
        <div v-if="elements.poweredOffVMLoading">
          <b-spinner variant="primary" label="Spinning"></b-spinner>
        </div>
        <div v-else>
          <b-form-select v-model="range" :options="rangeOptions" @change="onChange()"></b-form-select>
          <b-table
            :items="queryData"
            :fields="psfields"
            class="mt-3"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :per-page="perPage"
            :current-page="currentPage"
          >
            <template slot="detail" slot-scope="vm">
              <div>
                <b-button v-b-modal="vm.item.Name" variant="primary" size="sm">View</b-button>

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
          <b-pagination
            v-model="currentPage"
            :total-rows="rows"
            :per-page="perPage"
            aria-controls="my-table"
          ></b-pagination>

          <p class="mt-3">Current Page: {{ currentPage }}</p>
        </div>
      </b-col>
      <b-col>
        Top Used Datastores Cluster
        <div v-if="elements.topDatastoresLoading">
          <b-spinner variant="primary" label="Spinning"></b-spinner>
        </div>
        <div v-else>
          <b-table
            :items="datastoreClusters"
            :fields="clusterfields"
            class="mt-3"
            :sort-by.sync="sortBy2"
            :sort-desc.sync="sortDesc"
          >
            <template slot="FreeUsedRatio" slot-scope="data">
              <div>
                <apexchart
                  type="bar"
                  height="100"
                  :options="barchartOptions"
                  :series="[
                {
                  name: 'Used Space',
                  data: [data.item.UsedSpaceGB]
                },
                {
                  name: 'Free Space',
                  data: [data.item.FreeSpaceGB]
                }
              ]"
                />
              </div>
            </template>
            <template slot="Datastores" slot-scope="data">
              <div>
                <b-button v-b-modal="data.item.Name" variant="primary" size="sm">View</b-button>

                <b-modal
                  :id="data.item.Name"
                  :title="data.item.Name + ' Stats'"
                  size="lg"
                  hide-footer
                >
                  <b-container>
                    <b-table
                      :items="data.item.Datastores"
                      :fields="dsfields"
                      class="mt-3"
                      :sort-by.sync="sortBy2"
                      :sort-desc.sync="sortDesc"
                    >
                      <template slot="FreeUsedRatio" slot-scope="data">
                        <div>
                          <apexchart
                            type="bar"
                            height="100"
                            :options="barchartOptions"
                            :series="[
                {
                  name: 'Used Space',
                  data: [data.item.UsedSpaceGB]
                },
                {
                  name: 'Free Space',
                  data: [data.item.FreeSpaceGB]
                }
              ]"
                          />
                        </div>
                      </template>
                    </b-table>
                  </b-container>
                </b-modal>
              </div>
            </template>
          </b-table>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import moment from "moment";
console.log(GetServices);

export default {
  
  name: "Monitor",
  components: {},
  computed: {
    rows() {
      return this.queryData.length;
    }
  },
  data() {
    return {
      //Elements loading state
      elements: {
        chartLoading: true,
        poweredOffVMLoading: true,
        topDatastoresLoading: true,
        datastoreClusterLoading: true
      },
      //Data from API
      vmStat: [],
      queryData: [],
      datastoreClusters: [],
      datastores: [],
      storageSummary: {
        totalFree: 0,
        totalCapacity: 0,
        totalUsed: 0,
        Storage: []
      },
      //Data scope
      range: null,
      rangeOptions: [
        { text: "--- Please select range ---", value: null, disabled: true },
        { text: "Last Day", value: { days: 1 } },
        { text: "Last Week", value: { weeks: 1 } },
        { text: "Last Month", value: { months: 1 } }
      ],
      //Table key
      psfields: [
        {
          key: "Name",
          label: "VM Name"
        },
        {
          key: "PowerStatePercentage",
          label: "Power On Percentage"
        },
        {
          key: "detail",
          label: "Detail"
        }
      ],
      clusterfields: [
        {
          key: "Name",
          label: "Datastore Name",
          sortable: true
        },
        {
          key: "FreeSpaceGB",
          label: "Free Space (GB)",
          sortable: true
        },
        {
          key: "CapacityGB",
          label: "Capacity (GB)",
          sortable: true
        },
        {
          key: "FreeUsedRatio",
          label: "Chart"
        },
        {
          key: "Datastores",
          label: "Datastores in Cluster"
        }
      ],
      dsfields: [
        {
          key: "Name",
          label: "Datastore Name",
          sortable: true
        },
        {
          key: "FreeSpaceGB",
          label: "Free Space (GB)",
          sortable: true
        },
        {
          key: "CapacityGB",
          label: "Capacity (GB)",
          sortable: true
        },
        {
          key: "FreeUsedRatio",
          label: "Chart"
        }
      ],
      sortBy: "PowerStatePercentage",
      sortBy2: "FreeSpacePercentage",
      sortDesc: false,
      currentPage: 1,
      perPage: 5,
      //Chart options
      pieChartOptions: {
        labels: ["Free Space", "Used Space"],
        colors: ["#28a745", "#dc3545"],
        grid: {
          show: true,
          padding: {
            top: 0,
            bottom: 0
          }
        }
      },
      lineOptions: {
        toolbar: {
          show: true
        },
        xaxis: {
          type: "datetime"
        }
      },
      barchartOptions: {
        labels: ["Free Space Percentage"],
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
            barHeight: "15%"
          }
        }
      }
    };
  },
  async mounted() {
    await this.getPowerState();
    await this.getDetailedDatastores();
    await this.getDatastoreClusters();
  },
  methods: {
    async onChange() {
      this.elements.poweredOffVMLoading = true;
      this.queryData = [];
      this.vmStat.forEach(vm => {
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
      this.elements.poweredOffVMLoading = false;
    },
    async getPowerState() {
      this.elements.poweredOffVMLoading = true;
      this.vmStat = [];
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
            this.vmStat.push({
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
          this.queryData = this.vmStat;
          this.elements.poweredOffVMLoading = false;
        })
        .catch(err => {
          if (err.response.status == 403) {
            localStorage.removeItem("user");
            this.$swal("Session Timeout!");
            this.$router.push({
              name: "Login"
            });
            location.reload();
          }
        });
    },
    round(value, decimals) {
      return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    },
    async getDetailedDatastores() {
      this.elements.chartLoading = true;
      this.elements.topDatastoresLoading = true;
      this.datastores = [];
      this.storageSummary = {
        totalFree: 0,
        totalCapacity: 0,
        totalUsed: 0
      };
      let datastores = await GetServices.fetchDatastores().catch(err => {
        if (err.response.status == 403) {
          localStorage.removeItem("user");
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
          location.reload();
        }
      });
      console.log(datastores);
      
      Array.prototype.forEach.call(datastores.data, datastore => {
        this.datastores.push({
          Name: datastore.Name,
          Id: datastore.Id,
          ParentFolderId: datastore.ParentFolderId,
          FreeSpaceGB: this.round(datastore.FreeSpaceGB, 2),
          CapacityGB: this.round(datastore.CapacityGB, 2),
          UsedSpaceGB: this.round(
            datastore.CapacityGB - datastore.FreeSpaceGB,
            2
          ),
          FreeSpacePercentage: this.round(
            (datastore.FreeSpaceGB / datastore.CapacityGB) * 100,
            2
          )
        });
        this.storageSummary.totalFree += datastore.FreeSpaceGB;
        this.storageSummary.totalCapacity += datastore.CapacityGB;
        this.storageSummary.totalUsed +=
          datastore.CapacityGB - datastore.FreeSpaceGB;
      });
      this.storageSummary.totalFree = this.round(
        this.storageSummary.totalFree,
        2
      );
      this.storageSummary.totalCapacity = this.round(
        this.storageSummary.totalCapacity,
        2
      );
      this.storageSummary.totaltotalUsed = this.round(
        this.storageSummary.totalUsed,
        2
      );
      this.elements.chartLoading = false;
      this.elements.topDatastoresLoading = false;
    },
    async getDatastoreClusters() {
      this.elements.datastoreClusterLoading = true;
      let datastoreCluster = await GetServices.fetchDatastoreClusters().catch(
        err => {
          if (err.response.status == 403) {
            localStorage.removeItem("user");
            this.$swal("Session Timeout!");
            this.$router.push({
              name: "Login"
            });
            location.reload();
          }
        }
      );
      Array.prototype.forEach.call(datastoreCluster.data, dsCluster => {
        this.datastoreClusters.push({
          Name: dsCluster.Name,
          Id: dsCluster.Id,
          FreeSpaceGB: this.round(dsCluster.FreeSpaceGB, 2),
          CapacityGB: this.round(dsCluster.CapacityGB, 2),
          UsedSpaceGB: this.round(
            dsCluster.CapacityGB - dsCluster.FreeSpaceGB,
            2
          ),
          Datastores: this.datastores.filter(
            x => x.ParentFolderId == dsCluster.Id
          )
        });
      });
      this.elements.datastoreClusterLoading = false;
    }
  }
};
</script>
