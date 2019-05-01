<template>
  <b-container>
    <h1>ยินดีต้อนรับ {{ this.displayName }}</h1>
  </b-container>
</template>

<script>
export default {
  name: "Landing",
  components: {},
  data() {
    return {
      displayName: ""
    };
  },
  mounted() {
    this.displayName = localStorage.getItem("displayName");
  },
  methods: {}
};
</script>
