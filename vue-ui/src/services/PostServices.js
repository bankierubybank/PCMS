import Api from "@/services/Api";

export default {
  login(params) {
    return Api().post("login", params);
    /*
    if (localStorage.getItem("token") == null) {
      return Api().post("login", params);
    } else {
      return Api().post("login", params, {
        headers: {
          "x-access-token": localStorage.getItem("token")
        }
      })
    }*/
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
