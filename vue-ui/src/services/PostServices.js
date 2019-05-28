import Api from "@/services/Api";

export default {
  login(params) {
    return Api().post("login", params, {
      headers: {
        "x-access-token": null
      }
    });
  },
  newVM(params) {
    return Api().post("newvm", params);
  },
  approveVM(params) {
    return Api().post("approve", params);
  },
  autoCreateVM(params) {
    return Api().post("autocreate", params);
  },
  rejectVM(params) {
    return Api().post("reject", params);
  },
  extendVM(params) {
    return Api().post("extendvm", params);
  },
  approveExtendVM(params) {
    return Api().post("extendvm/approve", params);
  },
  setVMQuota(params) {
    return Api().post("quota/vm", params);
  },
  setUserQuota(params) {
    return Api().post("quota/user", params);
  },
  recalQuota(params) {
    return Api().post("recalquota", params);
  }
};