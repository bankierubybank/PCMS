<template>
  <b-container>
    <h1>All datastores</h1>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-jumbotron border-variant="primary">
        <d3-network :net-nodes="nodes" :net-links="links" :options="options"/>
      </b-jumbotron>

      <b-card-group deck>
        <div v-for="datastore in this.datastores" v-bind:key="datastore.Id">
          <b-card :title="datastore.Name">
            <b-card-text>FreeSpace GB: {{ datastore.FreeSpaceGB }}</b-card-text>
            <b-card-text>UsedSpace GB: {{ datastore.UsedSpaceGB }}</b-card-text>
            <b-card-text>Capacity GB: {{ datastore.CapacityGB }}</b-card-text>
            <b-card-text>VMsUsedSpace GB: {{ datastore.VMsUsedSpaceGB }}</b-card-text>
            <b-card-text>VMsProvisionedSpace GB: {{ datastore.VMsProvisionedSpaceGB }}</b-card-text>
            <apexchart
              type="pie"
              :options="chartOptions"
              :series="[datastore.FreeSpaceGB, datastore.UsedSpaceGB]"
            />
            <b-button v-b-modal="datastore.Name" variant="primary">ดูข้อมูลโดยละเอียด</b-button>

            <b-modal :id="datastore.Name" :title="datastore.Name + ' Stats'" size="lg" hide-footer>
              <b-container>
                <b-table :items="datastore.VMs" :fields="fields" class="mt-3"></b-table>
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
      loading: true,
      nodes: [],
      links: [],
      options: {
        force: 3000,
        nodeSize: 20,
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
          label: "UsedSpaceGB",
          sortable: true
        },
        {
          key: "ProvisionedSpaceGB",
          label: "ProvisionedSpaceGB",
          sortable: true
        }
      ]
    };
  },
  mounted() {
    //this.getDatastores();
    this.getDetailedDatastores();
  },
  methods: {
    async getDetailedDatastores() {
      this.datastores = [];
      this.nodes = [];
      this.links = [];
      let datastores = await GetServices.fetchDatastores().catch(err => {
        if (err.response.status == 403) {
          localStorage.removeItem("token");
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
        }
      });
      let vms = await GetServices.fetchVMs().catch(err => {
        if (err.response.status == 403) {
          localStorage.removeItem("token");
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
        this.links.push({
          sid: vm.Id,
          tid: vm.DatastoreIdList,
          _color: "#7FDBFF"
        });
        this.vms.push({
          Name: vm.Name,
          Id: vm.Id,
          UsedSpaceGB: vm.UsedSpaceGB,
          ProvisionedSpaceGB: vm.ProvisionedSpaceGB,
          DatastoreIdList: vm.DatastoreIdList
        });
      });
      datastores.data.forEach(datastore => {
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
          FreeSpaceGB: datastore.FreeSpaceGB,
          CapacityGB: datastore.CapacityGB,
          UsedSpaceGB: datastore.CapacityGB - datastore.FreeSpaceGB,
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
    }
  }
};
</script>
