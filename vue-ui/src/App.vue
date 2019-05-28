<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand>PCMS</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="https://github.com/easuck/PCMS">Github</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <div v-if="this.user">
            <b-nav-item-dropdown class="nav-noti" v-if="this.user.type != 'Staff'" right>
              <b-dropdown-item
                class="noti"
                v-for="notification in this.notifications.slice(0,5)"
                v-bind:key="notification.id"
              >
                <p class="text-primary">{{notification.Subject}}</p>
                <p class="text-body">
                  {{notification.Message}}
                  <br>
                  Requested by {{notification.Requestor.Student}}
                </p>
              </b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown class="user-nav" right>
              <template slot="button-content">
                <em>{{ this.user.username }}</em>
              </template>
              <b-dropdown-item v-on:click="logout()">Sign Out</b-dropdown-item>
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
    <b-row>
      <b-col cols="2">
        <div v-if="this.user">
          <div v-if="this.user.type === 'Staff'">
            <b-list-group>
              <b-list-group-item to="/monitor">Monitor</b-list-group-item>
              <b-list-group-item to="/requestedvm">Requested VM</b-list-group-item>
              <b-list-group-item to="/quota">Set Quota</b-list-group-item>
            </b-list-group>
          </div>
          <div v-else>
            <b-list-group>
              <b-list-group-item to="/myvm">My VM</b-list-group-item>
              <b-list-group-item to="/newvm">Request</b-list-group-item>
            </b-list-group>
          </div>
        </div>
        <div v-else></div>
      </b-col>
      <b-col cols="10">
        <router-view/>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
export default {
  data() {
    return {
      user: null,
      notifications: []
    };
  },
  mounted() {
    if (JSON.parse(localStorage.getItem("user")) == null) {
      this.$router.push({
        name: "Login"
      });
      this.$swal("Please Login!");
    } else {
      this.user = JSON.parse(localStorage.getItem("user"));
      if (this.user.type != "Staff") {
        this.getNotifications();
      }
    }
  },
  methods: {
    async logout() {
      await GetServices.logout();
      localStorage.removeItem("user");
      this.$router.push({
        name: "Home"
      });
      location.reload();
    },
    async getNotifications() {
      await GetServices.fetchNotifications()
        .then(res => {
          this.notifications = res.data.reverse();
        })
        .catch(err => {
          if (err.response.status == 403) {
            localStorage.removeItem("user");
            this.$swal("Session Timeout!");
            this.$router.push({
              name: "Login"
            });
          }
        });
    }
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Athiti&display=swap");
html {
  width: 100%;
  height: 100%;
}
#app {
  font-family: "Athiti", sans-serif;
}
.row {
  margin-right: 0px !important;
}
.list-group-item {
  padding: 1rem 1.25rem !important;
  border-right: 0px solid !important;
}
li,
.dropdown {
  display: inline-block;
}
.nav-noti {
  background-size: cover;
  background-position: center;
  background-image: url("./image/noti_w.png");
  width: 24px;
  height: 24px;
}
li,
.nav-noti > .dropdown-toggle {
  padding: 0;
  color: rgba(0, 0, 0, 0) !important;
}
li,
.user-nav {
  margin: 0rem 0.25rem;
}
.btn{
  margin-top: 1em;
  margin-bottom: 0.75em;
}
</style>
