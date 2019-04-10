<template>
  <div class="home">
    <nav class="top-nav">
      <div class="container">
        <div class="logo">
          <img
            fluid
            alt="IT KMITL"
            src="../assets/itkmitl.svg"
            width="25%"
            height="25%"
          />
        </div>
      </div>
      <div class="nav-links">
        <span class="normal-links"></span>
      </div>
    </nav>

    <h3>IT KMITL Private Cloud Management System</h3>
    <button v-on:click="login">LOG IN</button>
    <h5><a href="http://localhost/about">About</a></h5>
  </div>
</template>

<script>
import router from "@/router";
export default {
  name: "home",
  components: {},
  methods: {
    login() {
      router.push({
        name: "Login"
      });
    },
    About() {
      router.push({
        name: "About"
      });
    }
  }
};
</script>
