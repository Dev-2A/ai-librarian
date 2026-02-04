import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 30000, // 임베딩 처리 시간 고려
  headers: { "Content-Type": "application/json" },
});

export default api;
