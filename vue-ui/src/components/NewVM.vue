<template>
  <b-container fluid>
    <h1>Create New VM</h1>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-alert show variant="danger">
        *** ถ้าสร้าง VM โดยที่ Harddisk ไม่เกิน
        {{ this.vmQuota.ProvisionedSpaceGB }} GB และทุก VM รวมกันไม่เกิน
        {{ this.userQuota.ProvisionedSpaceGB }} GB ระบบจะสร้างให้ทันที ***
      </b-alert>
      <b-form @submit="onSubmit">
        <b-form-group label="VM Name:">
          <b-form-input v-model="vmSpec.Name" required></b-form-input>
        </b-form-group>

        <b-form-group label="Core CPU:">
          <b-form-select
            v-model="vmSpec.NumCpu"
            :options="cpuOptions"
            required
          ></b-form-select>
        </b-form-group>

        <b-form-group label="RAM (GB):">
          <b-form-select
            v-model="vmSpec.MemoryGB"
            :options="memOptions"
            required
          ></b-form-select>
        </b-form-group>

        <b-form-group label="Harddisk (GB):">
          <b-form-select
            v-model="vmSpec.DiskGB"
            :options="diskOptions"
            required
          ></b-form-select>
        </b-form-group>

        <b-form-group label="OS:">
          <b-form-select
            v-model="vmSpec.OS"
            :options="OSs"
            required
          ></b-form-select>
        </b-form-group>

        <b-form-group label="Start Date">
          <datepicker
            v-model="vmSpec.StartDate"
            name="StartDate"
            :disabledDates="this.state.disabledDates"
          ></datepicker>
        </b-form-group>
        <b-form-group label="End Date">
          <datepicker
            v-model="vmSpec.EndDate"
            name="EndDate"
            :disabledDates="this.state.disabledDates"
          ></datepicker>
        </b-form-group>

        <b-form-group label="Type Project:">
          <b-form-select
            v-model="vmSpec.Type"
            :options="types"
            required
          ></b-form-select>
        </b-form-group>

        <div v-if="this.user.type === 'Student'">
          <b-form-group label="Prof. Adviser:">
            <b-form-select
              v-model="vmSpec.Requestor.Lecturer"
              :options="lecturers"
              required
            ></b-form-select>
          </b-form-group>

          <b-form-group label="Subject:">
            <b-form-input v-model="vmSpec.Requestor.Course"></b-form-input>
          </b-form-group>
        </div>

        <b-form-checkbox
          v-model="Accpeted"
          value="true"
          unchecked-value="false"
        >
          I accept
          <b-link v-b-modal.terms>terms and conditions</b-link>
          <b-modal id="terms" hide-footer>
            1. การขอใช้งาน ระบบจะยังไม่สร้าง VM ให้ทันที จะต้องรอเจ้าหน้าที่ IT
            Support อนุมัติคำขอใช้ก่อน
            <br />2. เมื่อ VM ใกล้จะครบกำหนดระยะเวลาที่ขอใช้ไว้
            หากไม่ทำการต่ออายุ เมื่อครบกำหนดระบบจะลบ VM
            ทันทีเพื่อคืนพื้นที่ให้กับผู้ใช้ท่านอื่น <br />3. หากมีข้อมูลใน VM
            ถูกลบไปเนื่อจากครบกำหนดระยะเวลาใช้งาน ทาง IT Support
            จะไม่รับผิดชอบใด ๆ กับข้อมูลเหล่านั้น
            <br />
          </b-modal>
        </b-form-checkbox>
        <br />
        <b-button type="submit" variant="primary">Send Request</b-button>
      </b-form>
    </div>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import PostServices from "@/services/PostServices";
import Datepicker from "vuejs-datepicker";
export default {
  name: "NewVM",
  components: {
    Datepicker
  },
  data() {
    return {
      vmSpec: {
        Name: "",
        NumCpu: "",
        MemoryGB: "",
        DiskGB: "",
        OS: null,
        Requestor: {
          Lecturer: "",
          Student: "",
          Course: ""
        },
        Type: "",
        StartDate: null,
        EndDate: null
      },
      cpuOptions: [
        {
          value: null,
          text: "--- Please select CPU Cores ---",
          disabled: true
        },
        { value: 1, text: "1" },
        { value: 2, text: "2" },
        { value: 4, text: "4" }
      ],
      memOptions: [
        {
          value: null,
          text: "--- Please select Memory ---",
          disabled: true
        },
        { value: 1, text: "1" },
        { value: 2, text: "2" },
        { value: 4, text: "4" },
        { value: 8, text: "8" }
      ],
      diskOptions: [
        {
          value: null,
          text: "--- Please select Harddisk Capacity ---",
          disabled: true
        },
        { value: 16, text: "16" },
        { value: 32, text: "32" },
        { value: 64, text: "64" }
      ],
      OSs: [
        { value: null, text: "--- Please select OS ---", disabled: true },
        { value: "Ubuntu", text: "Ubuntu" },
        { value: "Windows 10", text: "Windows 10" }
      ],
      Accpeted: false,
      loading: true,
      lecturers: [{ value: "lecturer", text: "lecturer" }],
      types: [
        { value: "Senior Project", text: "โปรเจคจบ" },
        { value: "Project", text: "โปรเจครายวิชา" },
        { value: "Research", text: "งานวิจัย" }
      ],
      user: null,
      vmQuota: {},
      userQuota: {},
      state: {
        disabledDates: {
          to: new Date(Date.now() - 1000 * 60 * 60 * 24), // Disable all dates up to specific date
          from: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) // Disable all dates up to specific date
        }
      }
    };
  },
  mounted() {
    this.loading = true;
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getLecturer();
    this.getQuota();
    this.loading = false;
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      if (this.Accpeted) {
        PostServices.newVM(this.vmSpec);
        this.$swal("ส่งคำขอใช้งาน VM แล้ว").then(
          this.$router.push({ name: "MyVM" })
        );
      } else {
        this.$swal("กรุณายอมรับกฎ");
      }
    },
    async getVMTemplates() {
      const response = await GetServices.fetchVMTemplates().catch(err => {
        if (err.response.status == 403) {
          localStorage.removeItem("token");
          this.$swal("Session Timeout!");
          this.$router.push({
            name: "Login"
          });
          location.reload();
        }
      });
      this.OSs = response.data;
    },
    async getLecturer() {
      this.lecturers = [{ value: "lecturer", text: "lecturer" }];
      await GetServices.fetchLecturers()
        .then(res => {
          res.data.forEach(t =>
            this.lecturers.push({
              value: t.sAMAccountName,
              text: t.displayName
            })
          );
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
    async getQuota() {
      this.loading = true;
      await GetServices.fetchVMQuota()
        .then(res => {
          this.vmQuota = res.data[0];
        })
        .catch(err => {
          if (err.response.status == 403) {
            localStorage.removeItem("token");
            this.$swal("Session Timeout!");
            this.$router.push({
              name: "Login"
            });
            location.reload();
          }
        });
      await GetServices.fetchUserQuota()
        .then(res => {
          this.userQuota = res.data[0];
        })
        .catch(err => {
          if (err.response.status == 403) {
            localStorage.removeItem("token");
            this.$swal("Session Timeout!");
            this.$router.push({
              name: "Login"
            });
            location.reload();
          }
        });
      this.loading = false;
    }
  }
};
</script>
<style scoped>
.form-group {
  width: 80%;
}
</style>
