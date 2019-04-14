<template>
  <div id="app">
    <div id="nav">
      <div class="row">
        <div id="sidebar-menu" class="col s2 m2 l2">
          <div class="collection">
            <router-link to="/overview" class="collection-item">All VM</router-link>
            <router-link to="/newvm" class="collection-item">Request New VM</router-link>
            <router-link to="/requestedvms" class="collection-item">Requested VM</router-link>
          </div>
        </div>
        <div class="col s10 m10 l10">
          <nav>
            <div class="nav-wrapper">
              <a href="#" class="brand-logo">PCMS</a>
              <ul id="nav-mobile" class="right hide-on-med-and-down">
                <li>
                  <router-link to="/" class="nav-link">Home</router-link>
                </li>
                <li>
                  <router-link to="/about" class="nav-link">About</router-link>
                </li>
                <li>
                  <a href>
                    Notification
                    <span class="new badge">4</span>
                  </a>
                </li>
                <li>
                  <router-link to="/login" class="nav-link">Login</router-link>
                </li>
              </ul>
            </div>
          </nav>
          <div class="col s12 m12"></div>
        </div>
      </div>
    </div>

    <router-view/>
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

.row,
.col {
  padding: 0;
}
.collection {
  border: 0;
  border-radius: 0;
  margin-top: 7.5em;
}
.collection a.collection-item {
  color: #222222;
}
.collection .collection-item {
  background-color: #fff;
  line-height: 1.5rem;
  padding: 1em 1.5em;
  margin: 0;
  border: 0;
}
.collection a.collection-item:hover {
  background-color: #222222;
  color: #fff;
}
</style>
