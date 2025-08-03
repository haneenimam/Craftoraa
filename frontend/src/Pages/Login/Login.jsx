import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Login.module.css";
import { useAuth } from "../../Context/Auth";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setServerError("");

    let isValid = true;

    if (!email) {
      setEmailError("Email is required.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    if (!isValid) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Login failed");
        return;
      }

      login(data.user); 
      localStorage.setItem("token", data.token); 
      navigate("/");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={`text-center fw-bold ${styles.heading}`}>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className={`form-label ${styles.formLabel}`}>Email address</label>
            <input
              type="email"
              className={`form-control ${styles.inputField} ${emailError ? "is-invalid" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <div className="invalid-feedback">{emailError}</div>}
          </div>

          <div className="mb-3">
            <label className={`form-label ${styles.formLabel}`}>Password</label>
            <input
              type="password"
              className={`form-control ${styles.inputField} ${passwordError ? "is-invalid" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && <div className="invalid-feedback">{passwordError}</div>}

            <div className={styles.forgotPasswordWrapper}>
              <a href="/forgot-password" className={styles.forgotPasswordLink}>
                Forgot Password?
              </a>
            </div>
          </div>

          {serverError && <div className="text-danger text-center mb-2">{serverError}</div>}

          <button
            type="submit"
            className={`btn btn-lg w-100 rounded-3 shadow-sm ${styles.customLoginBtn}`}
          >
            Login
          </button>

          <div className={styles.loginPrompt}>
            <small>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
