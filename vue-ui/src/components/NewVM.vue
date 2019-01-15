<template>
  <div class="container">
    <h1>Create New VM</h1>
    <div class="form">
      <div>
        VM Name:
        <input type="text" name="Name" placeholder="VM Name" v-model="Name">
      </div>
      <div>
        NumCpu:
        <input type="text" name="NumCpu" placeholder="NumCpu" v-model="NumCpu">
      </div>
      <div>
        MemoryMB:
        <input type="text" name="MemoryMB" placeholder="MemoryMB" v-model="MemoryMB">
      </div>
      <div>
        DiskGB:
        <input type="text" name="DiskGB" placeholder="DiskGB" v-model="DiskGB">
      </div>
      <div>
        NetworkName:
        <input type="text" name="NetworkName" placeholder="NetworkName" v-model="NetworkName">
      </div>
      <div>
        Host:
        <!-- <v-select class="form-control"> -->
        <v-select v-model="selectedHost" label="Name" :options="hosts">
          <!-- <option v-for="(host, id) in hosts" :key="id" v-bind:value="host.Name">{{ host.Name }}</option> -->
        </v-select>
      </div>
      <div>
        <button class="app_post_btn" @click="newVM">Create New VM</button>
      </div>
    </div>
  </div>
</template>

<script src="https://unpkg.com/vue@latest"></script>
<script>
import GetServices from "@/services/GetServices";
import PostServices from "@/services/PostServices";
import Vue from 'vue'
import vSelect from 'vue-select'
window.Vue = Vue;
Vue.component("v-select", vSelect);
export default {
  name: "app",
  data() {
    return {
      hosts: [],
      Name: "",
      NumCpu: "",
      MemoryMB: "",
      DiskGB: "",
      NetworkName: "",
      VMHost: "",
      selectedHost: ""
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
        NumCpu: this.NumCpu,
        MemoryMB: this.MemoryMB,
        DiskGB: this.DiskGB,
        NetworkName: this.NetworkName,
        VMHost: this.selectedHost.Name
      });
    }
  }
};
</script>
