<template>
  <b-container>
    <h1>Virtual Machine ทั้งหมดใน Private Cloud</h1>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-table :items="data" :fields="fields" class="mt-3">
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
import router from "@/router";
export default {
  name: "AllVM",
  components: {},
  data() {
    return {
      fields: {
        Name: {
          label: "VM Name",
          sortable: true
        },
        NumCpu: {
          label: "CPU Cores",
          sortable: true
        },
        MemoryGB: {
          label: "Memory in GB",
          sortable: true
        },
        PowerState: {
          label: "PowerState"
        },
        IPv4: {},
        IPv6: {},
        Requestor: {
          label: "ผู้ขอใช้",
          sortable: true
        },
        StartDate: {
          label: "วันที่ขอ",
          sortable: true
        },
        EndDate: {
          label: "วันสิ้นสุดการใช้งาน",
          sortable: true
        }
      },
      loading: true,
      username: "",
      displayName: "",
      data: []
    };
  },
  mounted() {
    this.getDetailedCurrentVMs();
  },
  methods: {
    async getDetailedCurrentVMs() {
      this.data = [];
      let v = await GetServices.fetchVMs().catch(err => {
        if (err.response.status == 403) {
          alert("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
        }
      });
      let r = await GetServices.fetchRegisteredVMs().catch(err => {
        if (err.response.status == 403) {
          alert("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
        }
      });
      v.data.forEach(vm => {
        let registeredVMs = r.data.find(rvm => rvm.Name == vm.Name);
        if (registeredVMs) {
          if (new Date(registeredVMs.EndDate) <= new Date()) {
            this.data.push({
              Name: vm.Name,
              Id: vm.Id,
              NumCpu: vm.NumCpu,
              MemoryGB: vm.MemoryGB,
              IPv4: vm["IP Address"].split("|")[0],
              IPv6: vm["IP Address"].split("|")[1],
              Guest: vm.Guest,
              Notes: vm.Notes,
              UsedSpaceGB: vm.UsedSpaceGB,
              ProvisionedSpaceGB: vm.ProvisionedSpaceGB,
              PowerState: vm.PowerState,
              Requestor: registeredVMs.Requestor,
              StartDate: registeredVMs.StartDate,
              EndDate: registeredVMs.EndDate,
              _rowVariant: "danger"
            });
          } else {
            this.data.push({
              Name: vm.Name,
              Id: vm.Id,
              NumCpu: vm.NumCpu,
              MemoryGB: vm.MemoryGB,
              IPv4: vm["IP Address"].split("|")[0],
              IPv6: vm["IP Address"].split("|")[1],
              Guest: vm.Guest,
              Notes: vm.Notes,
              UsedSpaceGB: vm.UsedSpaceGB,
              ProvisionedSpaceGB: vm.ProvisionedSpaceGB,
              PowerState: vm.PowerState,
              Requestor: registeredVMs.Requestor,
              StartDate: registeredVMs.StartDate,
              EndDate: registeredVMs.EndDate
            });
          }
        } else {
          this.data.push({
            Name: vm.Name,
            Id: vm.Id,
            NumCpu: vm.NumCpu,
            MemoryGB: vm.MemoryGB,
            IPv4: vm["IP Address"].split("|")[0],
            IPv6: vm["IP Address"].split("|")[1],
            Guest: vm.Guest,
            Notes: vm.Notes,
            UsedSpaceGB: vm.UsedSpaceGB,
            ProvisionedSpaceGB: vm.ProvisionedSpaceGB,
            PowerState: vm.PowerState,
            Requestor: "NOT REGISTERED",
            StartDate: "NOT REGISTERED",
            EndDate: "NOT REGISTERED",
            _rowVariant: "warning"
          });
        }
      });
      this.loading = false;
    }
  }
};
</script>
