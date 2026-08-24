import React, { useState } from "react";
import styles from "./Login.module.css";

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

      // Recarga la página automáticamente para entrar limpio al panel
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2 className={styles.loginTitle}>El TintoBar - Login</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>

        <div className={styles.inputGroup} style={{ marginBottom: "1.5rem" }}>
          <label className={styles.inputLabel}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>

        <button type="submit" disabled={loading} className={styles.loginButton}>
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
};
