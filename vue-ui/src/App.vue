<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand>PCMS</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item>
            <router-link to="/" class="nav-link">Home</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="/about" class="nav-link">About</router-link>
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <div v-if="loggedIn">
            <b-nav-item-dropdown right>
              <template slot="button-content">
                <em>{{this.username}}</em>
              </template>
              <b-dropdown-item v-on:click="logout">Sign Out</b-dropdown-item>
            </b-nav-item-dropdown>
          </div>
          <div v-else>
            <b-nav-item>
              <router-link to="/login" class="nav-link">Login</router-link>
            </b-nav-item>
          </div>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <router-view/>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
export default {
  data() {
    return {
      username: "",
      displayName: "",
      loggedIn: false
    };
  },
  mounted() {
    if (localStorage.getItem("token") == null) {
      this.$router.push({
        name: "Login"
      });
      alert("Please Login!");
    } else {
      this.username = localStorage.getItem("username");
      this.displayName = localStorage.getItem("displayName");
      this.loggedIn = true;
    }
  },
  methods: {
    async logout() {
      await GetServices.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("type");
      localStorage.removeItem("username");
      localStorage.removeItem("displayName");
      localStorage.removeItem("mail");
      this.loggedIn = false;
      this.$router.push({
        name: "Login"
      });
    }
  }
};
</script>
