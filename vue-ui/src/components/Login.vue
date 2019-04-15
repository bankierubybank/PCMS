<template>
  <div class="container">
    <h1>Login</h1>
    <form v-on:submit="login">
      <input type="text" name="username" />
      <br />
      <input type="password" name="password" />
      <br />
      <input type="submit" value="Login" />
    </form>
  </div>
</template>

<script>
import PostServices from "@/services/PostServices";
import router from "@/router";
export default {
  name: "Login",
  data() {
    return {};
  },
  methods: {
    login: e => {
      e.preventDefault();
      let username = e.target.elements.username.value;
      let password = e.target.elements.password.value;
      let login = () => {
        let data = {
          username: username,
          password: password
        };
        PostServices.login(data)
          .then(res => {
            if (res.data.status == true) {
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("type", res.data.type);
              localStorage.setItem("username", res.data.username);
              localStorage.setItem("displayName", res.data.displayName);
              localStorage.setItem("mail", res.data.mail);
              router.push({
                name: "Overview"
              });
            }
          })
          .catch(err => {
            if (err.response.status == 401) {
              alert("Please check your username/password!");
              location.reload();
            }
          });
      };
      login();
    }
  }
};
</script>
