<template>
  <div id="app">
    <b-container class="bv-example-row">
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
            <b-nav-item-dropdown right>
              <template slot="button-content">
                <em>User</em>
              </template>
              <b-dropdown-item href="#">Profile</b-dropdown-item>
              <b-dropdown-item v-on:click="logout">Sign Out</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
      <b-row>
        <b-col>
          <b-list-group>
            <b-list-group-item>
              <router-link to="/overview" class="collection-item">All VM</router-link>
            </b-list-group-item>
            <b-list-group-item>
              <router-link to="/newvm" class="collection-item">Request New VM</router-link>
            </b-list-group-item>
            <b-list-group-item>
              <router-link to="/requestedvms" class="collection-item">Requested VM</router-link>
            </b-list-group-item>
          </b-list-group>
        </b-col>
        <b-col cols="10">
          <router-view/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
export default {
  data() {
    return {
      username: "",
      displayName: ""
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
      this.$router.push({
        name: "Login"
      });
    }
  }
};
</script>
