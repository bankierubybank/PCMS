<template>
  <div class="container">
    <h1>Login</h1>
    <form v-on:submit="login">
      <input type="text" name="username">
      <br>
      <input type="password" name="password">
      <br>
      <input type="submit" value="Login">
    </form>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
import PostServices from "@/services/PostServices";
import router from "@/router";
export default {
  name: "Login",
  data() {
    return {
    };
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
            router.push("/content");
          })
          .catch(err => console.log(err));
      };
      login();
    }
  }
};
</script>
