<template>
  <div id="app">
    <div id="nav"><nav>
    <div class="nav-wrapper">
      <a href="#" class="brand-logo">PCMS</a>
      <ul id="nav-mobile" class="right hide-on-med-and-down">
        <li><router-link to="/" class="nav-link">Home</router-link></li>
        <li><router-link to="/about" class="nav-link">About</router-link></li>
        <li><a href="">Notification<span class="new badge">4</span></a></li> 
        <li><router-link to="/login" class="nav-link">Login</router-link></li>
      </ul>
    </div>
  </nav> </div>
     
    <router-view />
  </div>
  
</template>

<script>
</script>

<style>
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
@import "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css";
@import "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js";
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin: 0;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
