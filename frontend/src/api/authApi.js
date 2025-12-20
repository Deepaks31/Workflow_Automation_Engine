import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api"
});

export const loginUser = (data) => API.post("/auth/login", data);
export const signupUser = (data) => API.post("/auth/signup", data);
export const logout = () => API.post("/auth/logout");