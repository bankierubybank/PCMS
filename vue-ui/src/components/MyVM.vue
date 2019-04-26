<template>
  <b-container>
    <h1>My VM</h1>
    <b-card-group deck>
      <div v-for="(vm) in vms" v-bind:key="vm.Name">
        <b-card style="max-width: 20rem;" class="mb-2">
          <b-card-text>Name: {{ vm.Name }}</b-card-text>
          <b-card-text>NumCpu: {{ vm.NumCpu }}</b-card-text>
          <b-card-text>MemoryGB: {{ vm.MemoryGB }}</b-card-text>
          <b-card-text>StartDate: {{ vm.StartDate }}</b-card-text>
          <b-card-text>EndDate: {{ vm.EndDate }}</b-card-text>

          <b-button v-b-modal="vm.Name">See Detail</b-button>

          <b-modal :id="vm.Name" :title="'VM Name: ' + vm.Name" hide-footer>
            <b-form @submit="onSubmit">
              <b-form-group label="EndDate">
                <datepicker v-model="EndDate" name="EndDate"></datepicker>
              </b-form-group>
              <b-button type="submit" variant="primary">Submit</b-button>
            </b-form>
          </b-modal>
        </b-card>
      </div>
    </b-card-group>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import Datepicker from "vuejs-datepicker";
export default {
  name: "MyVM",
  components: {
    Datepicker
  },
  data() {
    return {
      vms: [],
      EndDate: null
    };
  },
  mounted() {
    this.getVMs();
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      console.log(this.EndDate);
    },
    async getVMs() {
      await GetServices.fetchRegisteredVMs()
        .then(res => {
          this.vms = res.data;
        })
        .catch(err => {
          if (err.response.status == 403) {
            alert("Session Timeout!");
            this.$router.push({
              name: "Login"
            });
          }
        });
    }
  }
};
</script>
