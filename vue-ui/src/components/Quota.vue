<template>
  <b-container fluid>
    <h1>Set Quota Rule</h1>
    <b-row>
      <b-col>
        <h3>Quota per VM</h3>
        <div v-if="elements.vmLoading">
          <b-spinner variant="primary" label="Spinning"></b-spinner>
        </div>
        <div v-else>
          <b-form @submit="submitVMQuota">
            <b-form-group label="Core CPU:">
              <b-form-select v-model="vmQuota.NumCpu" :options="cpuOptions" required></b-form-select>
            </b-form-group>

            <b-form-group label="RAM (GB):">
              <b-form-select v-model="vmQuota.MemoryGB" :options="memOptions" required></b-form-select>
            </b-form-group>

            <b-form-group label="Disk (GB):">
              <b-form-input v-model="vmQuota.ProvisionedSpaceGB" type="number" required></b-form-input>
            </b-form-group>

            <br>
            <b-button type="submit" variant="primary">Assign New Quota Rule</b-button>
          </b-form>
        </div>
      </b-col>
      <b-col>
        <h3>Quota per User</h3>
        <div v-if="elements.userLoading">
          <b-spinner variant="primary" label="Spinning"></b-spinner>
        </div>
        <div v-else>
          <b-form @submit="submitUserQuota">
            <b-form-group label="Core CPU:">
              <b-form-select v-model="userQuota.NumCpu" :options="cpuOptions" required></b-form-select>
            </b-form-group>

            <b-form-group label="RAM (GB):">
              <b-form-select v-model="userQuota.MemoryGB" :options="memOptions" required></b-form-select>
            </b-form-group>

            <b-form-group label="Disk (GB):">
              <b-form-input v-model="userQuota.ProvisionedSpaceGB" type="number" required></b-form-input>
            </b-form-group>

            <br>
            <b-button type="submit" variant="primary">Assign New Quota Rule</b-button>
            <b-button v-b-modal.userQuota variant="success">Calculate Quota</b-button>

            <b-modal id="userQuota" ref="userQuota" title="Set New Quota per User" hide-footer>
              <b-form-group label="Users:">
                <b-form-input v-model="userQuota.Users" type="number" required></b-form-input>
              </b-form-group>

              <b-button variant="success" v-on:click="recalQuota()">Auto Calculate Quota Rule</b-button>
            </b-modal>
          </b-form>
        </div>
      </b-col>
    </b-row>
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
      vmQuota: {
        NumCpu: 1,
        MemoryGB: 1,
        ProvisionedSpaceGB: 1,
        Users: 1
      },
      userQuota: {
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
      elements: {
        vmLoading: true,
        userLoading: true
      }
    };
  },
  async mounted() {
    await this.getVMQuota();
    await this.getUserQuota();
  },
  methods: {
    submitVMQuota(evt) {
      evt.preventDefault();
      PostServices.setVMQuota(this.vmQuota).then(this.$swal("Quota Updated!"));
    },
    submitUserQuota(evt) {
      evt.preventDefault();
      PostServices.setUserQuota(this.userQuota).then(this.$swal("Quota Updated!"));
    },
    async getVMQuota() {
      this.elements.vmLoading = true;
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
      this.elements.vmLoading = false;
    },
    async getUserQuota() {
      this.elements.userLoading = true;
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
      this.elements.userLoading = false;
    },
    async recalQuota() {
      await PostServices.recalQuota(this.userQuota)
        .then(async () => {
          await this.getVMQuota();
          await this.getUserQuota();
          this.$refs["userQuota"].hide();
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
    }
  }
};
</script>
