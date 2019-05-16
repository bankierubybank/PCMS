<template>
  <b-container>
    <h1>ดู Datastores ทั้งหมดใน Private Cloud</h1>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
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
        <template slot="VMs" slot-scope="data">
          <div>
            <b-button v-b-modal="data.item.Name" variant="primary" size="sm"
              >ดู VM ใน Datastore นี้</b-button
            >

            <b-modal
              :id="data.item.Name"
              :title="data.item.Name + ' Stats'"
              size="lg"
              hide-footer
            >
              <b-container>
                <b-table
                  :items="data.item.VMs"
                  :fields="fields"
                  class="mt-3"
                ></b-table>
              </b-container>
            </b-modal>
          </div>
        </template>
      </b-table>
    </div>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import D3Network from "vue-d3-network";
export default {
  name: "Datastores",
  components: { D3Network },
  data() {
    return {
      datastores: [],
      vms: [],
      chartOptions: {
        labels: ["FreeSpace GB", "Used GB"],
        colors: ["#28a745", "#dc3545"]
      },
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
      },
      loading: true,
      nodes: [],
      links: [],
      options: {
        force: 1500,
        nodeSize: 13,
        nodeLabels: true,
        linkWidth: 5
      },
      fields: [
        {
          key: "Name",
          label: "VM Name",
          sortable: true
        },
        {
          key: "UsedSpaceGB",
          label: "Used Space in GB",
          sortable: true
        },
        {
          key: "ProvisionedSpaceGB",
          label: "Provisioned Space in GB",
          sortable: true
        }
      ],
      dsfields: [
        {
          key: "Name",
          label: "Datastore Name",
          sortable: true
        },
        {
          key: "Id",
          label: "Id",
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
        },
        {
          key: "VMs",
          label: "VM in Datastore"
        }
      ]
    };
  },
  mounted() {
    this.getDetailedDatastores();
  },
  methods: {
    async getDetailedDatastores() {
      this.datastores = [];
      this.loading = true;
      this.nodes = [];
      this.links = [];
      let datastores = await GetServices.fetchDatastores().catch(err => {
        if (err.response.status == 403) {
          localStorage.removeItem("user");
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
        }
      });
      let vms = await GetServices.fetchVMs().catch(err => {
        if (err.response.status == 403) {
          localStorage.removeItem("user");
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
        }
      });
      vms.data.forEach(vm => {
        //Push VM nodes
        this.nodes.push({
          id: vm.Id,
          name: vm.Name,
          _color: "#0074D9"
        });
        vm.DatastoreIdList.split(" ").forEach(ds => {
          this.links.push({
            sid: vm.Id,
            tid: ds,
            _color: "#7FDBFF"
          });
        });
        this.vms.push({
          Name: vm.Name,
          Id: vm.Id,
          UsedSpaceGB: this.round(vm.UsedSpaceGB, 2),
          ProvisionedSpaceGB: this.round(vm.ProvisionedSpaceGB, 2),
          DatastoreIdList: vm.DatastoreIdList
        });
      });
      Array.prototype.forEach.call(datastores.data, datastore => {
        //Push datastore nodes
        this.nodes.push({
          id: datastore.Id,
          name: datastore.Name,
          _color: "#01FF70"
        });
        let VMsInDatastore = this.vms.filter(
          x => x.DatastoreIdList == datastore.Id
        );
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
          },
          VMs: VMsInDatastore,
          VMsUsedSpaceGB: VMsInDatastore.map(x => x.UsedSpaceGB).reduce(
            (x, y) => x + y,
            0
          ),
          VMsProvisionedSpaceGB: VMsInDatastore.map(
            x => x.ProvisionedSpaceGB
          ).reduce((x, y) => x + y, 0)
        });
      });
      this.loading = false;
    },
    round(value, decimals) {
      return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    }
  }
};
</script>
