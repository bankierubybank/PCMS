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
  autoCreateVM(params) {
    return Api().post("vm/" + params.Name + "/autocreate", params, {});
  },
  rejectVM(vmName) {
    return Api().post("vm/" + vmName + "/reject", {});
  }
};