// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegistrosPage from "./pages/RegistrosPage";

// 🔒 Componente para proteger rotas privadas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de login */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registros" element={<RegistrosPage />} />

        {/* Painel protegido */}
        <Route
          path="/registros"
          element={
            <PrivateRoute>
              <RegistrosPage />
            </PrivateRoute>
          }
        />

        {/* Redireciona / para /registros se estiver logado */}
        <Route
          path="/"
          element={
            localStorage.getItem("access_token") ? (
              <Navigate to="/registros" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Rota de fallback (404 simples) */}
        <Route path="*" element={<h2 style={{ textAlign: "center", marginTop: "3rem" }}>Página não encontrada</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
