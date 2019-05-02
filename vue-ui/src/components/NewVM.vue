<template>
  <b-container>
    <h1>Create New VM</h1>
    <b-form @submit="onSubmit">
      <b-form-group id="input-group-1" label="Name:" label-for="input-1">
        <b-form-input id="input-1" v-model="vmSpec.Name" required></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-2" label="NumCPU:" label-for="input-2">
        <b-form-input id="input-2" v-model="vmSpec.NumCpu" type="number" required></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-3" label="MemoryGB:" label-for="input-3">
        <b-form-input id="input-3" v-model="vmSpec.MemoryGB" type="number" required></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-4" label="DiskGB:" label-for="input-4">
        <b-form-input id="input-4" v-model="vmSpec.DiskGB" type="number" required></b-form-input>
      </b-form-group>

      <b-form-group label="StartDate">
        <datepicker v-model="vmSpec.StartDate" name="StartDate"></datepicker>
      </b-form-group>
      <b-form-group label="EndDate">
        <datepicker v-model="vmSpec.EndDate" name="EndDate"></datepicker>
      </b-form-group>
      <b-button type="submit" variant="primary">Submit</b-button>
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
        OS: "UbuntuTemplate",
        StartDate: null,
        EndDate: null
      },
      OSs: []
    };
  },
  mounted() {},
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      PostServices.newVM(this.vmSpec);
      this.$swal("กำลังสร้าง VM");
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
