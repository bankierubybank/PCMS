<template>
  <div class="container">
    <h1>Create New VM</h1>
    <div class="form">
      <div>
        VM Name:
        <input type="text" name="Name" placeholder="VM Name" v-model="Name">
      </div>
      <div>
        Host:
        <select v-model="VMHost">
          <option v-for="(host, id) in hosts" v-bind:value="host.Name" :key="id">
              {{ host.Name }}
          </option>
        </select>
      </div>
      <div>
        <button class="app_post_btn" @click="newVM">Create New VM</button>
      </div>
    </div>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
import PostServices from "@/services/PostServices";
export default {
  name: "hosts",
  data() {
    return {
      hosts: [],
      Name: '',
      VMHost: ''
    };
  },
  mounted() {
    this.getVMHosts();
  },
  methods: {
    async getVMHosts() {
      const response = await GetServices.fetchVMHosts();
      this.hosts = response.data;
    },
    async newVM() {
      await PostServices.newVM({
          Name: this.Name,
          VMHost: this.VMHost
      });
    }
  }
};
</script>
