<template>
  <b-container>
    <h1>My VM</h1>
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
        <template slot="EndDate" slot-scope="data">
          {{ data.item.EndDate }}
          <div
            v-if="
              data.item._rowVariant != 'danger' &&
                data.item.Status == 'Approved'
            "
          >
            <b-button v-b-modal="data.item.Name" variant="primary" size="sm">ต่ออายุ VM</b-button>

            <b-modal :id="data.item.Name" :title="'VM Name: ' + data.item.Name" hide-footer>
              <b-form @submit="onSubmit">
                <b-form-group label="EndDate">
                  <datepicker v-model="EndDate" name="EndDate"></datepicker>
                </b-form-group>
                <b-button type="submit" variant="primary">Submit</b-button>
              </b-form>
            </b-modal>
          </div>
        </template>
        <template slot="Status" slot-scope="data">
          <div v-if="data.item.Status == 'Pending'">
            <b-badge variant="warning">รอการอนุมัติ</b-badge>
          </div>
          <div v-else-if="data.item.Status == 'Rejected'">
            <b-badge variant="danger">ไม่อนุมัติ</b-badge>
          </div>
          <div v-else>
            <b-badge variant="success">อนุมัติ</b-badge>
          </div>
        </template>
      </b-table>
      <b-alert show variant="primary" v-if="data.length == 0">ไม่มีข้อมูล</b-alert>
    </div>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import Datepicker from "vuejs-datepicker";
import moment from "moment";
export default {
  name: "MyVM",
  components: {
    Datepicker
  },
  data() {
    return {
      fields: [
        {
          key: "Name",
          label: "ชื่อ VM",
          sortable: true
        },
        {
          key: "NumCpu",
          label: "จำนวน Core CPU",
          sortable: true
        },
        {
          key: "MemoryGB",
          label: "Memory (GB)",
          sortable: true
        },
        {
          key: "DiskGB",
          label: "Disk (GB)",
          sortable: true
        },
        {
          key: "PowerState",
          label: "Power State",
          sortable: true
        },
        { key: "IPv4", sortable: true },
        { key: "IPv6", sortable: true },
        {
          key: "StartDate",
          label: "วันที่เริ่มใช้งาน",
          sortable: true
        },
        { key: "EndDate", label: "วันสิ้นสุดการใช้งาน", sortable: true },
        { key: "Status", label: "สถานะ", sortable: true }
      ],
      data: [],
      EndDate: null,
      loading: true
    };
  },
  mounted() {
    this.getDetailedCurrentVMs();
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
    },
    async getDetailedCurrentVMs() {
      this.data = [];
      let v = await GetServices.fetchVMs().catch(err => {
        if (err.response.status == 403) {
          localStorage.removeItem("user");
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
        }
      });
      let r = await GetServices.fetchRegisteredVMs().catch(err => {
        if (err.response.status == 403) {
          localStorage.removeItem("user");
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
        }
      });
      r.data.forEach(registeredVMs => {
        let vm = v.data.find(vm => vm.Name == registeredVMs.Name);
        let vmData = {
          Name: registeredVMs.Name,
          NumCpu: registeredVMs.NumCpu,
          MemoryGB: registeredVMs.MemoryGB,
          DiskGB: registeredVMs.ProvisionedSpaceGB,
          PowerState: 0,
          IPv4: "NOT POWERED ON",
          IPv6: "NOT POWERED ON",
          Requestor: "NOT REGISTERED",
          StartDate: "NOT REGISTERED",
          EndDate: "NOT REGISTERED",
          Status: registeredVMs.Status,
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
        if (vm) {
          vmData.PowerState = vm.PowerState;
          vmData.IPv4 = vm["IP Address"].split("|")[0];
          vmData.IPv6 = vm["IP Address"].split("|")[1];
        }
        this.data.push(vmData);
      });
      this.loading = false;
    }
  }
};
</script>
