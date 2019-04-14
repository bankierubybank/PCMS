<template>
  <div class="container">
    <h1>Create New VM</h1>
    <div class="row">
      <div class="col s3"></div>
      <div class="col s6">
        <div class="form">
          VM Name:
          <input type="text" name="Name" placeholder="VM Name" v-model="Name">
          NumCpu:
          <input type="text" name="NumCpu" placeholder="NumCpu" v-model="NumCpu">
          MemoryGB:
          <input type="text" name="MemoryGB" placeholder="MemoryGB" v-model="MemoryGB">
          DiskGB:
          <input type="text" name="DiskGB" placeholder="DiskGB" v-model="DiskGB">
          OS: {{ this.OS }} <br>
          Start Date:
          <datepicker name="StartDate" placeholder="StartDate" v-model="StartDate"></datepicker>
          End Date:
          <datepicker name="EndDate" placeholder="EndDate" v-model="EndDate"></datepicker>
          <button class="app_post_btn" @click="newVM">Create New VM</button>
        </div>
      </div>
      <div class="col s3"></div>
    </div>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
import PostServices from "@/services/PostServices";
import Datepicker from "vuejs-datepicker";
export default {
  name: "newvm",
  components: {
    Datepicker
  },
  data() {
    return {
      OSs: [],
      OS: "UbuntuTemplate",
      Name: "",
      NumCpu: "",
      MemoryGB: "",
      DiskGB: "",
      StartDate: "",
      EndDate: ""
    };
  },
  mounted() {
    if (localStorage.getItem("token") == null) {
      router.push({
        name: "Login"
      });
      alert("Please Login!");
    } else {
      this.username = localStorage.getItem("username");
      this.displayName = localStorage.getItem("displayName");
    }
  },
  methods: {
    async getVMTemplates() {
      const response = await GetServices.fetchVMTemplates();
      this.OSs = response.data;
    },
    async newVM() {
      console.log(this.EndDate);
      /*
      await PostServices.newVM({
        Name: this.Name,
        NumCpu: this.NumCpu,
        MemoryGB: this.MemoryGB,
        DiskGB: this.DiskGB,
        OS: this.OS,
        StartDate: this.StartDate,
        EndDate: this.EndDate
      });*/
    }
  }
};
</script>
