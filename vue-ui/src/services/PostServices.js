import Api from "@/services/Api";

export default {
  newVM(params) {
    return Api().post("newvm", params);
  }
};
