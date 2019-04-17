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
  fetchVMStat(params) {
    return Api().get("vmstat", params, {
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  }
};
