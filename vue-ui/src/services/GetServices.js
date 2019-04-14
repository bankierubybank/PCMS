import Api from "@/services/Api";

export default {
  fetchVMs() {
    return Api().get("vms", {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  },
  fetchVMbyName(vmName) {
    return Api().get("vm/" + vmName, {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  },
  fetchVMHosts() {
    return Api().get("vmhosts", {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  },
  fetchDatastores() {
    return Api().get("datastores", {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  },
  fetchDatacenters() {
    return Api().get("datacenters", {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  },
  fetchVMTemplates() {
    return Api().get("templates", {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  },
  fetchVMStat(params) {
    return Api().get("vmstat/", params, {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  },
  fetchContent() {
    return Api().get("content", {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  },
  logout() {
    return Api().get("logout", {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  }
};
