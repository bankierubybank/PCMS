<template>
  <b-container>
    <h1>Virtual Machine ทั้งหมดใน Private Cloud</h1>
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
        <template slot="PowerState" slot-scope="data">
          <div v-if="data.item.PowerState">
            <b-badge variant="success">Powered On</b-badge>
          </div>
          <div v-else>
            <b-badge variant="danger">Powered Off</b-badge>
          </div>
        </template>
      </b-table>
    </div>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import moment from "moment";
export default {
  name: "AllVM",
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
          key: "PowerState",
          label: "PowerState",
          sortable: true
        },
        { key: "IPv4", label: "IPv4", sortable: true },
        { key: "IPv6", label: "IPv6", sortable: true },
        { key: "Requestor", label: "ผู้ขอใช้", sortable: true },
        {
          key: "StartDate",
          label: "วันที่ขอ",
          sortable: true
        },
        { key: "EndDate", label: "วันสิ้นสุดการใช้งาน", sortable: true }
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
      this.data = [];
      let v = await GetServices.fetchVMs().catch(err => {
        if (err.response.status == 403) {
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
        }
      });
      let r = await GetServices.fetchRegisteredVMs().catch(err => {
        if (err.response.status == 403) {
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
        }
      });
      v.data.forEach(vm => {
        let registeredVMs = r.data.find(rvm => rvm.Name == vm.Name);
        let vmData = {
          Name: vm.Name,
          Id: vm.Id,
          NumCpu: vm.NumCpu,
          MemoryGB: vm.MemoryGB,
          IPv4: "NOT POWERED ON",
          IPv6: "NOT POWERED ON",
          Guest: vm.Guest,
          Notes: vm.Notes,
          UsedSpaceGB: vm.UsedSpaceGB,
          ProvisionedSpaceGB: vm.ProvisionedSpaceGB,
          PowerState: vm.PowerState,
          Requestor: "NOT REGISTERED",
          StartDate: "NOT REGISTERED",
          EndDate: "NOT REGISTERED",
          _rowVariant: ""
        };
        if (registeredVMs) {
          vmData.Requestor = registeredVMs.Requestor;
          vmData.StartDate = moment(registeredVMs.StartDate)
            .locale("th")
            .format("LL");
          vmData.EndDate = moment(registeredVMs.EndDate)
            .locale("th")
            .format("LL");
          //Set variant to danger if EndDate is less than today
          if (new Date(registeredVMs.EndDate) <= new Date()) {
            vmData._rowVariant = "danger";
          }
        } else {
          vmData._rowVariant = "warning";
        }
        if (vm.PowerState) {
          vmData.IPv4 = vm["IP Address"].split("|")[0];
          vmData.IPv6 = vm["IP Address"].split("|")[1];
        }
        this.data.push(vmData);
      });
      this.loading = false;
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    }
  }
};
</script>
