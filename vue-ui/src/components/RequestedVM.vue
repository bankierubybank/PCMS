<template>
  <b-container>
    <h1>คำขอใช้งาน Virtual Machine ทั้งหมด</h1>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-row>
        <b-col md="6" class="my-1">
          <b-form-group label-cols-sm="3" label="Filter" class="mb-0">
            <b-input-group>
              <b-form-input v-model="filter" placeholder="Type to Search"></b-form-input>
              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
      <b-table :items="data" :fields="fields" :filter="filter" @filtered="onFiltered" class="mt-3">
        <template slot="Status" slot-scope="data">
          <div v-if="data.item.Status == 'Pending'">
            <b-button variant="primary" v-on:click="approveVM(data.item.Name)">Approve</b-button>
            <b-button variant="danger" v-on:click="rejectVM(data.item.Name)">Reject</b-button>
          </div>
          <div v-else-if="data.item.Status == 'Rejected'">
            <b-badge variant="danger">Rejected</b-badge>
          </div>
          <div v-else>
            <b-badge variant="success">Approved</b-badge>
          </div>
        </template>
      </b-table>
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
          label: "CPU Cores",
          sortable: true
        },
        {
          key: "MemoryGB",
          label: "Memory in GB",
          sortable: true
        },
        {
          key: "ProvisionedSpaceGB",
          label: "Disk in GB",
          sortable: true
        },
        { key: "Requestor", label: "ผู้ขอใช้", sortable: true },
        {
          key: "StartDate",
          label: "วันที่ขอ",
          sortable: true
        },
        { key: "EndDate", label: "วันสิ้นสุดการใช้งาน", sortable: true },
        { key: "Status", label: "สถานะ", sortable: true }
      ],
      loading: true,
      username: "",
      displayName: "",
      data: [],
      filter: null
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
  mounted() {
    this.getDetailedCurrentVMs();
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
        }
      });
      r.data.forEach(vm => {
        let vmData = {
          Name: vm.Name,
          NumCpu: vm.NumCpu,
          MemoryGB: vm.MemoryGB,
          ProvisionedSpaceGB: vm.ProvisionedSpaceGB,
          Status: vm.Status,
          Requestor: vm.Requestor,
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
    async approveVM(vmName) {
      await PostServices.approveVM(vmName)
        .then(() => {
          location.reload();
        })
        .catch(err => {
          if (err.response.status == 403) {
            localStorage.removeItem("token");
            this.$swal("Session Timeout!");
            this.$router.push({
              name: "Login"
            });
          }
        });
    },
    async rejectVM(vmName) {
      await PostServices.rejectVM(vmName)
        .then(() => {
          location.reload();
        })
        .catch(err => {
          if (err.response.status == 403) {
            localStorage.removeItem("token");
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