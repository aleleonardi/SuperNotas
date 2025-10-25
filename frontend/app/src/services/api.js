// src/services/api.js
import axios from "axios";

// 🔹 URL base do backend (ajuste se usar outro host)
const API_BASE_URL = "http://localhost:8002/api/";

// 🔹 Cria uma instância do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔹 Intercepta requisições para adicionar o token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Intercepta respostas para tratar erros comuns
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.warn("Sessão expirada ou não autorizada.");
        localStorage.removeItem("access_token");
        window.location.href = "/login"; // Redireciona para o login
      }

      if (status === 403) {
        console.warn("Acesso negado: você não tem permissão.");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
