<template>
  <b-container>
    <h1>Create New VM</h1>
    <b-form @submit="onSubmit">
      <b-form-group label="VM Name:">
        <b-form-input id="input-1" v-model="vmSpec.Name" required></b-form-input>
      </b-form-group>

      <b-form-group label="จำนวน Core CPU:">
        <b-form-input id="input-2" v-model="vmSpec.NumCpu" type="number" required></b-form-input>
      </b-form-group>

      <b-form-group label="จำนวน RAM (GB):">
        <b-form-input v-model="vmSpec.MemoryGB" type="number" required></b-form-input>
      </b-form-group>

      <b-form-group label="ขนาด Harddisk (GB):">
        <b-form-input v-model="vmSpec.DiskGB" type="number" required></b-form-input>
      </b-form-group>

      <b-form-group label="OS:">
        <template slot="first">
          <option :value="null" disabled>-- Please select OS --</option>
        </template>
        <b-form-select v-model="vmSpec.OS" :options="OSs" required class></b-form-select>
      </b-form-group>

      <b-form-group label="วันเริ่มใช้งาน">
        <datepicker v-model="vmSpec.StartDate" name="StartDate"></datepicker>
      </b-form-group>
      <b-form-group label="วันสิ้นสุดการใช้งาน">
        <datepicker v-model="vmSpec.EndDate" name="EndDate"></datepicker>
      </b-form-group>

      <b-form-checkbox v-model="Accpeted" value="true" unchecked-value="false">
        ฉันได้ยอมรับ
        <b-link v-b-modal.terms>ข้อตกลงในการใช้งาน</b-link>
        <b-modal id="terms" hide-footer>
          1. การขอใช้งาน ระบบจะยังไม่สร้าง VM ให้ทันที จะต้องรอเจ้าหน้าที่ IT Support อนุมัติคำขอใช้ก่อน<br>
          2. เมื่อ VM ใกล้จะครบกำหนดระยะเวลาที่ขอใช้ไว้ หากไม่ทำการต่ออายุ เมื่อครบกำหนดระบบจะลบ VM ทันทีเพื่อคืนพื้นที่ให้กับผู้ใช้ท่านอื่น<br>
          3. หากมีข้อมูลใน VM ถูกลบไปเนื่อจากครบกำหนดระยะเวลาใช้งาน ทาง IT Support จะไม่รับผิดชอบใด ๆ กับข้อมูลเหล่านั้น<br>
        </b-modal>
      </b-form-checkbox>
      <br>
      <b-button type="submit" variant="primary">ส่งคำขอใช้งาน</b-button>
    </b-form>
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
        StartDate: null,
        EndDate: null
      },
      OSs: [
        { value: "Ubuntu", text: "Ubuntu" },
        { value: "CentOS", text: "CentOS" },
        { value: "Windows 7", text: "Windows 7" },
        { value: "Windows 10", text: "Windows 10" }
      ],
      Accpeted: false
    };
  },
  mounted() {},
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
        }
      });
      this.OSs = response.data;
    }
  }
};
</script>
