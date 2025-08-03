import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "./ResetPassword.module.css";
import axiosInstance from "../../Apis/config";

function ResetPassword() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [code, setCode] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...code];
    updated[index] = value;
    setCode(updated);
    if (value && index < 3) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const validateForm = () => {
    const formErrors = {};
    if (!newPassword) formErrors.password = "Password is required.";
    else if (newPassword.length < 6) formErrors.password = "Password must be at least 6 characters.";
    if (newPassword !== confirmPassword) formErrors.confirmPassword = "Passwords do not match.";
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const fullCode = code.join("");

    if (fullCode.length !== 4) {
      setError("Please enter the 4-digit verification code.");
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }

    try {
      const { data } = await axiosInstance.post("/api/auth/reset-password", {
        userId,
        email,
        code: fullCode,
        newPassword,
      });

      if (data.success) {
        setMessage("Password reset successful!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Reset failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className="mb-4 text-center">Reset Your Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className={styles.label}>Verification Code</label>
            <div className={styles.codeWrapper}>
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  id={`code-${idx}`}
                  type="text"
                  maxLength="1"
                  className={styles.codeInput}
                  value={digit}
                  onChange={(e) => handleCodeChange(idx, e.target.value)}
                />
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              className={`form-control ${styles.input}`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div className="mb-3">
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              className={`form-control ${styles.input}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          {error && <div className="text-danger mb-2">{error}</div>}
          {message && <div className="text-success mb-2">{message}</div>}

          <button type="submit" className={`btn w-100 ${styles.resetBtn}`}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
