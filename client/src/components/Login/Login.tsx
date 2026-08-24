import React, { useState } from "react";
import "./Login.css"; // <--- Importamos el archivo CSS que acabamos de crear

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://tintobar-backend.onrender.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, pass: password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      localStorage.setItem("token", data.access_token);
      onLoginSuccess(data.access_token);
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginContainer">
      <form onSubmit={handleSubmit} className="loginForm">
        <h2 className="loginTitle">El TintoBar - Login</h2>

        {error && <div className="errorMessage">{error}</div>}

        <div className="inputGroup">
          <label className="inputLabel">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="inputField"
          />
        </div>

        <div className="inputGroup" style={{ marginBottom: "1.5rem" }}>
          <label className="inputLabel">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="inputField"
          />
        </div>

        <button type="submit" disabled={loading} className="loginButton">
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
};
