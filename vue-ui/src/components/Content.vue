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
      cont: {}
    };
  },
  mounted() {
    this.getContent();
  },
  methods: {
    async getContent() {
      /* await GetServices.fetchSession().then(res => {
        console.log(res.data)
        
        if (!res.data.username) {
          router.push("/login");
        } else {
          GetServices.fetchContent().then(res => {
            if (res.data.status == true) {
              this.data = res.data.content;
            }
          });
        }
      }); */
      const response = await GetServices.fetchSession();
      console.log(response);
      this.cont = response.data;
    },
    async logout() {
      await GetServices.logout();
      router.push("/login");
    }
  }
};
</script>
