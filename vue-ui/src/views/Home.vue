<template>
  <div class="home">
    <nav class="top-nav">
      <ul class="navbar-nav">
        <li class="logo">
          <img
            fluid
            alt="IT KMITL"
            src="../assets/itkmitl.svg"
            width="50%"
            height="50%"
          />
        </li>
        <li class="nav-item">
          <router-link to="/" class="nav-link">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link">About</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/login" class="nav-link">Login</router-link>
        </li>
      </ul>
    </nav>

    <h3>IT KMITL Private Cloud Management System</h3>
  </div>
</template>

<script>
import router from "@/router";
export default {
  name: "home",
  components: {},
  methods: {}
};
</script>
