import Api from "@/services/Api";

export default {
  fetchVMs() {
    return Api().get("vms");
  },
  fetchDatastores() {
    return Api().get("datastores");
  },
  fetchDatastoreClusters() {
    return Api().get("datastoreclusters");
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
  fetchQuota() {
    return Api().get("quota");
  },
  logout() {
    return Api().get("logout");
  }
};
