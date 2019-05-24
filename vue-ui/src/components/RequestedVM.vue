<template>
  <b-container fluid>
    <h1>คำขอใช้งาน Virtual Machine ทั้งหมด</h1>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-alert show variant="danger">
        *** ตอนนี้ฟังก์ชั่น Auto Create VM ใช้งานได้เฉพาะ Ubuntu Desktop 18.04
        เท่านั้น ***
      </b-alert>
      <b-row>
        <b-col md="6" class="my-1">
          <b-form-group label-cols-sm="3" label="Search" class="mb-0">
            <b-input-group>
              <b-form-input v-model="filter" placeholder="Search"></b-form-input>
              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
      <b-table :items="data" :fields="fields" :filter="filter" @filtered="onFiltered" class="mt-3">
        <template slot="Requestor" slot-scope="data">
          <p v-if="data.item.Requestor.Student != ''">Student : {{data.item.Requestor.Student}}</p>
          <p v-if="data.item.Requestor.Lecturer != ''">Prof : {{data.item.Requestor.Lecturer}}</p>
          <p v-if="data.item.Requestor.Course != ''">Subject : {{data.item.Requestor.Course}}</p>
        </template>
        <template slot="Status" slot-scope="data">
          <div v-if="data.item.Status == 'Pending'">
            <b-button
              v-b-modal="data.item.Name"
              v-on:click="getDatastores(data.item)"
            >Check Resource</b-button>
            <b-modal
              :id="data.item.Name"
              :ref="data.item.Name"
              :title="'Check Resource: ' + data.item.Name"
              hide-footer
              size="lg"
            >
              Please select designated datastore.
              <div v-if="dsloading">
                <b-spinner variant="primary" label="Spinning"></b-spinner>
              </div>
              <div v-else>
                <b-table
                  selectable
                  select-mode="single"
                  selectedVariant="success"
                  @row-selected="rowSelected"
                  :items="datastores"
                  :fields="dsfields"
                  class="mt-3"
                  :sort-by.sync="sortBy"
                  :sort-desc.sync="sortDesc"
                ></b-table>
                <b-button variant="primary" v-on:click="autoCreateVM(data.item.Name)">Approve (Auto Create)</b-button>
                <b-button variant="danger" v-on:click="rejectVM(data.item.Name)">Reject</b-button>
              </div>
            </b-modal>
          </div>
          <div v-else-if="data.item.Status == 'Rejected'">
            <b-badge variant="danger">Rejected</b-badge>
          </div>
          <div v-else>
            <b-badge variant="success">Approve</b-badge>
          </div>
        </template>
      </b-table>
      <b-alert show variant="primary" v-if="data.length == 0">No Data</b-alert>
    </div>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import PostServices from "@/services/PostServices";
import moment from "moment";
export default {
  name: "RequestedVM",
  components: {},
  data() {
    return {
      fields: [
        {
          key: "Name",
          label: "VM Name",
          sortable: true
        },
        {
          key: "NumCpu",
          label: "Core CPU",
          sortable: true
        },
        {
          key: "MemoryGB",
          label: "Memory (GB)",
          sortable: true
        },
        {
          key: "ProvisionedSpaceGB",
          label: "Disk (GB)",
          sortable: true
        },
        { key: "OS", label: "OS", sortable: true },
        { key: "Requestor", label: "Requestor", sortable: true },
        { key: "Type", label: "Type", sortable: true },
        {
          key: "StartDate",
          label: "Start Date",
          sortable: true
        },
        { key: "EndDate", label: "End Date", sortable: true },
        { key: "Status", label: "Status", sortable: true }
      ],
      loading: true,
      username: "",
      displayName: "",
      data: [],
      filter: null,
      datastores: [],
      dsfields: [
        {
          key: "Name",
          label: "Datastore Name"
        },
        {
          key: "Type",
          label: "Type"
        },
        {
          key: "CapacityGB",
          label: "Capacity (GB)",
          sortable: true
        },
        {
          key: "FreeSpaceGB",
          label: "Free Space (GB)",
          sortable: true
        },
        {
          key: "FreeSpaceAfterGB",
          label: "Free Space After Create this VM",
          sortable: true
        }
      ],
      selected: {},
      sortBy: "FreeSpaceAfterGB",
      sortDesc: true,
      dsloading: true
    };
  },
  computed: {
    sortOptions() {
      // Create an options list from our fields
      return this.fields
        .filter(f => f.sortable)
        .map(f => {
          return { text: f.label, value: f.key };
        });
    }
  },
  async mounted() {
    await this.getDetailedCurrentVMs();
  },
  methods: {
    async getDetailedCurrentVMs() {
      this.loading = true;
      this.data = [];
      let r = await GetServices.fetchRegisteredVMs().catch(err => {
        if (err.response.status == 403) {
          localStorage.removeItem("token");
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
          location.reload();
        }
      });
      await r.data.forEach(vm => {
        let vmData = {
          Name: vm.Name,
          NumCpu: vm.NumCpu,
          MemoryGB: vm.MemoryGB,
          ProvisionedSpaceGB: vm.ProvisionedSpaceGB,
          OS: vm.OS,
          Status: vm.Status,
          Requestor: vm.Requestor,
          Type: vm.Type,
          StartDate: moment(vm.StartDate)
            .locale("th")
            .format("LL"),
          EndDate: moment(vm.EndDate)
            .locale("th")
            .format("LL"),
          _rowVariant: ""
        };
        if (vm.Status == "Pending") {
          vmData._rowVariant = "warning";
        } else if (vm.Status == "Rejected") {
          vmData._rowVariant = "danger";
        }
        this.data.push(vmData);
      });
      this.loading = false;
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    async getDatastores(request) {
      this.datastores = [];
      this.dsloading = true;
      await GetServices.fetchDatastores()
        .then(res => {
          Array.prototype.forEach.call(res.data, datastore => {
            let data = {
              Name: datastore.Name,
              Id: datastore.Id,
              FreeSpaceGB: this.round(datastore.FreeSpaceGB, 2),
              CapacityGB: this.round(datastore.CapacityGB, 2),
              FreeSpaceAfterGB: this.round(
                datastore.FreeSpaceGB - request.ProvisionedSpaceGB,
                2
              ),
              Type: "Datastore",
              _rowVariant: ""
            };
            if (datastore.FreeSpaceGB - request.ProvisionedSpaceGB <= 0) {
              data._rowVariant = "danger";
            } else if (
              (request.ProvisionedSpaceGB * 100) / datastore.FreeSpaceGB >=
              80
            ) {
              data._rowVariant = "warning";
            }
            this.datastores.push(data);
          });
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

      await GetServices.fetchDatastoreClusters()
        .then(res => {
          Array.prototype.forEach.call(res.data, dsCluster => {
            let data = {
              Name: dsCluster.Name,
              Id: dsCluster.Id,
              FreeSpaceGB: this.round(dsCluster.FreeSpaceGB, 2),
              CapacityGB: this.round(dsCluster.CapacityGB, 2),
              FreeSpaceAfterGB: this.round(
                dsCluster.FreeSpaceGB - request.ProvisionedSpaceGB,
                2
              ),
              Type: "DatastoreCluster",
              _rowVariant: ""
            };
            if (dsCluster.FreeSpaceGB - request.ProvisionedSpaceGB <= 0) {
              data._rowVariant = "danger";
            }
            this.datastores.push(data);
          });
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
      this.dsloading = false;
    },
    async rowSelected(items) {
      this.selected = items[0];
    },
    async autoCreateVM(vmName) {
      this.$refs[vmName].hide();
      this.$swal("VM Approved!");
      await PostServices.autoCreateVM({
        Name: vmName,
        Datastore: { Name: this.selected.Name, Type: this.selected.Type }
      })
        .then(() => {
          location.reload();
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
    async rejectVM(vmName) {
      this.$refs[vmName].hide();
      this.$swal("VM Rejected!");
      await PostServices.rejectVM({
        Name: vmName
      })
        .then(() => {
          location.reload();
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
    }
  }
};
</script>

<style scope>
.btn {
  margin-right: 0.5rem;
}
</style>