<template>
  <b-container>
    <h1>คำขอใช้งาน Virtual Machine ทั้งหมด</h1>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else>
      <b-table :items="data" :fields="fields" class="mt-3">
      </b-table>
    </div>
  </b-container>
</template>

<script>
import GetServices from "@/services/GetServices";
import PostServices from "@/services/PostServices";
import moment from "moment";
export default {
  name: "Notification",
  components: {},
  data() {
    return {
      data: [],
      loading: true,
      fields: [
        {
          key: "Name",
          label: "VM Name",
          sortable: true
        },
        {
          key: "Subject",
          label: "หัวข้อ",
          sortable: true
        },
        {
          key: "Message",
          label: "ข้อความ",
          sortable: true
        },
        {
          key: "Requestor.Student",
          label: "ผู้ขอ",
          sortable: true
        }
      ]
    };
  },
  mounted() {
    this.getNotifications();
  },
  methods: {
    async getNotifications() {
      this.loading = true;
      await GetServices.fetchNotifications()
        .then(res => {
          this.data = res.data;
        })
        .catch(err => {
          if (err.response.status == 403) {
            localStorage.removeItem("token");
            this.$swal("Session Timeout!");
            this.$router.push({
              name: "Login"
            });
          }
        });
      this.loading = false;
    }
  }
};
</script>
