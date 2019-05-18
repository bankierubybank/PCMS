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
    return Api().post("vm/approve", params);
  },
  autoCreateVM(params) {
    return Api().post("vm/autocreate", params);
  },
  rejectVM(params) {
    return Api().post("vm/reject", params);
  }
};