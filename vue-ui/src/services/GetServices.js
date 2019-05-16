import Api from "@/services/Api";

export default {
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
  fetchRegisteredVMs() {
    return Api().get("registeredvm");
  },
  fetchLecturers() {
    return Api().get("lecturer");
  },
  fetchNotifications() {
    return Api().get("notification");
  },
  fetchVMTemplates() {
    return Api().get("templates");
  },
  fetchPowerState() {
    return Api().get("powerstate");
  },
  fetchVMStat(params) {
    return Api().post("vmstat", params);
  },
  logout() {
    return Api().get("logout");
  }
};
