<template>
  <b-container fluid>
    <h1>Set Quota Rule</h1>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-form @submit="onSubmit">
        <b-form-group label="Core CPU:">
          <b-form-select v-model="quota.NumCpu" :options="cpuOptions" required></b-form-select>
        </b-form-group>

        <b-form-group label="RAM (GB):">
          <b-form-select v-model="quota.MemoryGB" :options="memOptions" required></b-form-select>
        </b-form-group>

        <b-form-group label="Disk (GB):">
          <b-form-input v-model="quota.ProvisionedSpaceGB" type="number" required></b-form-input>
        </b-form-group>

        <b-form-group label="Users:">
          <b-form-input v-model="quota.Users" type="number" required></b-form-input>
        </b-form-group>

        <br>
        <b-button type="submit" variant="primary">Assign New Quota Rule</b-button>
        <b-button variant="success" v-on:click="recalQuota()">Auto Calculate Quota Rule</b-button>
      </b-form>
    </div>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import PostServices from "@/services/PostServices";
export default {
  name: "Quota",
  components: {},
  data() {
    return {
      quota: {
        NumCpu: 1,
        MemoryGB: 1,
        ProvisionedSpaceGB: 1,
        Users: 1
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
      loading: true
    };
  },
  mounted() {
    this.getQuota();
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      PostServices.setQuota(this.quota).then(this.$swal("Quota Updated!"));
    },
    async getQuota() {
      this.loading = true;
      await GetServices.fetchQuota()
        .then(res => {
          this.quota = res.data[0];
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
    },
    async recalQuota() {
      this.loading = true;
      await PostServices.recalQuota()
        .then(async () => {
          await this.getQuota();
          this.$swal("Quota Updated!");
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
