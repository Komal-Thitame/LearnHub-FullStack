import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // Aapke Node.js backend ka address
});

export default api;