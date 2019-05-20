<template>
  <b-container>
    <b-form class="login" @submit="onSubmit">
      <h2>Login</h2>
      <b-form-group id="input-group-1" label="Username:" label-for="input-1">
        <b-form-input
          id="input-1"
          v-model="loginData.username"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-2" label="Password:" label-for="input-2">
        <b-form-input
          id="input-2"
          v-model="loginData.password"
          type="password"
          required
        ></b-form-input>
      </b-form-group>
      <b-button type="submit" variant="primary">Log In</b-button>
    </b-form>
  </b-container>
</template>

<style scoped>
.login {
  margin: auto;
  padding-top: 2.5em;
  width: 50%;
}
.form-control {
  width: 75%;
}
</style>

<script>
import PostServices from "@/services/PostServices";
export default {
  name: "Login",
  data() {
    return {
      loginData: {
        username: "",
        password: ""
      }
    };
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      PostServices.login(this.loginData)
        .then(res => {
          if (res.data.status == true) {
            localStorage.setItem("user", JSON.stringify(res.data))
            this.$router.push({
              name: "Landing"
            });
            location.reload();
          }
        })
        .catch(err => {
          if (err.response.status == 401) {
            this.$swal("Please check your username/password!");
          }
        });
    }
  }
};
</script>

<style scoped>
  .container{
    margin-right: 0px;
    margin-left: 0px;
  }
</style>
