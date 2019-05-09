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
  approveVM(vmName) {
    return Api().post("vm/" + vmName + "/approve", {});
  },
  autoCreateVM(vmName) {
    return Api().post("vm/" + vmName + "/autocreate", {});
  },
  rejectVM(vmName) {
    return Api().post("vm/" + vmName + "/reject", {});
  }
};
