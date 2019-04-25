<template>
  <b-row>
    <b-col cols="2">
      <b-list-group>
        <b-list-group-item>
          <router-link to="/overview" class="collection-item"
            >All VM</router-link
          >
        </b-list-group-item>
        <b-list-group-item>
          <router-link to="/newvm" class="collection-item"
            >Request New VM</router-link
          >
        </b-list-group-item>
        <b-list-group-item>
          <router-link to="/requestedvms" class="collection-item"
            >Requested VM</router-link
          >
        </b-list-group-item>
      </b-list-group>
    </b-col>
    <b-col cols="8">
      <div class="container">
        <h1>Create New VM</h1>
        <b-form @submit="onSubmit">
          <b-form-group id="input-group-1" label="Name:" label-for="input-1">
            <b-form-input
              id="input-1"
              v-model="vmSpec.Name"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-2" label="NumCPU:" label-for="input-2">
            <b-form-input
              id="input-2"
              v-model="vmSpec.NumCpu"
              type="number"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group
            id="input-group-3"
            label="MemoryGB:"
            label-for="input-3"
          >
            <b-form-input
              id="input-3"
              v-model="vmSpec.MemoryGB"
              type="number"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-4" label="DiskGB:" label-for="input-4">
            <b-form-input
              id="input-4"
              v-model="vmSpec.DiskGB"
              type="number"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="StartDate">
            <datepicker
              v-model="vmSpec.StartDate"
              name="StartDate"
            ></datepicker>
          </b-form-group>
          <b-form-group label="EndDate">
            <datepicker v-model="vmSpec.EndDate" name="EndDate"></datepicker>
          </b-form-group>
          <b-button type="submit" variant="primary">Submit</b-button>
        </b-form>
      </div>
    </b-col>
  </b-row>
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
      vmSpec: {
        Name: "",
        NumCpu: "",
        MemoryGB: "",
        DiskGB: "",
        StartDate: null,
        EndDate: null
      },
      OSs: [],
      OS: "UbuntuTemplate"
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
    onSubmit(evt) {
      evt.preventDefault();
      PostServices.newVM({
        Name: this.Name,
        NumCpu: this.NumCpu,
        MemoryGB: this.MemoryGB,
        DiskGB: this.DiskGB,
        OS: this.OS,
        StartDate: this.StartDate,
        EndDate: this.EndDate
      });
    },
    async getVMTemplates() {
      const response = await GetServices.fetchVMTemplates();
      this.OSs = response.data;
    }
  }
};
</script>
