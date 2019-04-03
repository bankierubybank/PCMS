import Api from "@/services/Api";

export default {
  fetchSession() {
    return Api().get("session");
  },
  fetchVMs() {
    return Api().get("vms");
  },
  fetchVMbyName(vmName) {
    return Api().get("vm/" + vmName);
  },
  fetchVMHosts() {
    return Api().get("vmhosts");
  },
  fetchDatastores() {
    return Api().get("datastores");
  },
  fetchDatacenters() {
    return Api().get("datacenters");
  },
  fetchVMStat(params) {
    return Api().get("vmstat/", params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  fetchContent() {
    return Api().get("content");
  },
  logout() {
    return Api().get("logout")
  }
};