import Api from "@/services/Api";

export default {
  login(params) {
    return Api().post("login", params);
  },
  newVM(params) {
    return Api().post("newvm", params, {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  },
  approveVM(vmName) {
    return Api().post(
      "vm/" + vmName + "/approve",
      {},
      {
        headers: {
          "x-access-token": localStorage.getItem("token")
        }
      }
    );
  },
  autoCreateVM(vmName) {
    return Api().post(
      "vm/" + vmName + "/autocreate",
      {},
      {
        headers: {
          "x-access-token": localStorage.getItem("token")
        }
      }
    );
  },
  rejectVM(vmName) {
    return Api().post(
      "vm/" + vmName + "/reject",
      {},
      {
        headers: {
          "x-access-token": localStorage.getItem("token")
        }
      }
    );
  }
};
