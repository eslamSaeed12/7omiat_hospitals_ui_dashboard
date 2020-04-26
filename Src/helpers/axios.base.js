import axios from "axios";

export default (jwt) => {
  axios.defaults.headers.token = jwt;
  axios.defaults.baseURL = "http://localhost:3001";
  return axios;
};
