import React, { useState } from "react";
import axios from "axios";
import styles from "../SignUp/Signup.module.css"; // Reuse existing styles

const AdminCreateUserForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Seller", // default role
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
    setSuccessMsg("");
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, role } = formData;
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!email) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email format.";
    if (!password || password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (!["Seller", "Admin"].includes(role))
      newErrors.role = "Invalid role.";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/admin/register`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMsg(res.data.message || "User created successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "Seller",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <h2 className="text-center mb-4 fw-bold">Create Seller/Admin</h2>
        {successMsg && (
          <div className="alert alert-success text-center">{successMsg}</div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className={styles.formLabel}>First Name</label>
              <input
                type="text"
                name="firstName"
                className={`${styles.formControl} ${
                  errors.firstName ? styles.invalidInput : ""
                }`}
                value={formData.firstName}
                onChange={handleChange}
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
                name="lastName"
                className={`${styles.formControl} ${
                  errors.lastName ? styles.invalidInput : ""
                }`}
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <div className="invalid-feedback d-block">
                  {errors.lastName}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              name="email"
              className={`${styles.formControl} ${
                errors.email ? styles.invalidInput : ""
              }`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <div className="invalid-feedback d-block">{errors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label className={styles.formLabel}>Password</label>
            <input
              type="password"
              name="password"
              className={`${styles.formControl} ${
                errors.password ? styles.invalidInput : ""
              }`}
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <div className="invalid-feedback d-block">
                {errors.password}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className={styles.formLabel}>Role</label>
            <select
              name="role"
              className={`${styles.formControl} ${
                errors.role ? styles.invalidInput : ""
              }`}
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Seller">Seller</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.role && (
              <div className="invalid-feedback d-block">{errors.role}</div>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-lg w-100 rounded-3 shadow-sm ${styles.customSignupBtn}`}
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateUserForm;
