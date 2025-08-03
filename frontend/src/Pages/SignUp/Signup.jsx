import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Signup.module.css";
import { Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  //const [role, setRole] = useState("User");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSignup = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!firstName.trim()) formErrors.firstName = "First name is required.";
    if (!lastName.trim()) formErrors.lastName = "Last name is required.";
    if (!email) formErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      formErrors.email = "Invalid email format.";

    if (!password) formErrors.password = "Password is required.";
    else if (password.length < 6)
      formErrors.password = "Password must be at least 6 characters.";

    if (confirmPassword !== password)
      formErrors.confirmPassword = "Passwords do not match.";

    //if (!role) formErrors.role = "Please select a role.";

    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      navigate("/login");
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <h2 className="text-center mb-4 fw-bold">Create Account</h2>
        <form onSubmit={handleSignup} noValidate>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className={styles.formLabel}>First Name</label>
              <input
                type="text"
                className={`${styles.formControl} ${
                  errors.firstName ? styles.invalidInput : ""
                }`}
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setErrors({ ...errors, firstName: "" });
                }}
              />
              {errors.firstName && (
                <div className="invalid-feedback d-block">
                  {errors.firstName}
                </div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className={styles.formLabel}>Last Name</label>
              <input
                type="text"
                className={`${styles.formControl} ${
                  errors.lastName ? styles.invalidInput : ""
                }`}
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setErrors({ ...errors, lastName: "" });
                }}
              />
              {errors.lastName && (
                <div className="invalid-feedback d-block">
                  {errors.lastName}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className={styles.formLabel}>Email address</label>
            <input
              type="email"
              className={`${styles.formControl} ${
                errors.email ? styles.invalidInput : ""
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: "" });
              }}
            />
            {errors.email && (
              <div className="invalid-feedback d-block">{errors.email}</div>
            )}
          </div>

          {/* <div className="mb-3">
            <label className={styles.formLabel}>Role</label>
            <select
              className={`${styles.formControl} ${
                errors.role ? styles.invalidInput : ""
              }`}
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setErrors({ ...errors, role: "" });
              }}
            >
              <option value="User">User</option>
              <option value="Seller">Seller</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.role && (
              <div className="invalid-feedback d-block">{errors.role}</div>
            )}
          </div> */}

          <div className="mb-3">
            <label className={styles.formLabel}>Password</label>
            <input
              type="password"
              className={`${styles.formControl} ${
                errors.password ? styles.invalidInput : ""
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: "" });
              }}
            />
            {errors.password && (
              <div className="invalid-feedback d-block">{errors.password}</div>
            )}
          </div>

          <div className="mb-4">
            <label className={styles.formLabel}>Confirm Password</label>
            <input
              type="password"
              className={`${styles.formControl} ${
                errors.confirmPassword ? styles.invalidInput : ""
              }`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({ ...errors, confirmPassword: "" });
              }}
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback d-block">
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-lg w-100 rounded-3 shadow-sm ${styles.customSignupBtn}`}
          >
            Sign Up
          </button>

          <div className={styles.loginPrompt}>
            <small>
              Already have an account? <Link to="/login">Login</Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
