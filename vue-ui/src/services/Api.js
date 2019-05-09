import axios from "axios";

if (JSON.parse(localStorage.getItem("user"))) {
  axios.defaults.headers.common["x-access-token"] = JSON.parse(
    localStorage.getItem("user")
  ).token;
}

export default () => {
  return axios.create({
    baseURL: `http://localhost:8081`
  });
};
