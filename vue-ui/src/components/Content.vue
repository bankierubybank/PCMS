<template>
  <div class="container">
    <h1>{{ cont }}</h1>
    <div id="logout">
      <button v-on:click="logout">LOG OUT</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import router from "@/router";
import GetServices from "@/services/GetServices";
export default {
  name: "content",
  data() {
    return {
      cont: []
    };
  },
  mounted() {
    if (localStorage.getItem("token") == null) {
      router.push({
        name: "Login"
      });
      alert("Please Login!");
    } else {
      this.getContent();
    }
  },
  methods: {
    async getContent() {
      const response = await GetServices.fetchContent();
      this.cont = response.data.content;
    },
    async logout() {
      await GetServices.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      router.push({ name: "Login" });
    }
  }
};
</script>
