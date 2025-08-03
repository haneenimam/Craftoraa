import { useEffect, useState } from "react";
import axiosInstance from "../../../Apis/config.js";
import styles from "./ManageUsers.module.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.error || "Failed to load users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditedData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/users/${editingUser._id}`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setUsers(
        users.map((user) =>
          user._id === editingUser._id ? response.data : user
        )
      );
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.error || "Failed to update user");
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.error || "Failed to delete user");
    }
  };

  return (
    <div className={styles["manage-users-container"]}>
      <h2>Manage Users</h2>

      {error && (
        <div className={`alert alert-danger ${styles.alert}`}>{error}</div>
      )}
      {loading && (
        <div className={`alert alert-info ${styles.alert}`}>
          Loading users...
        </div>
      )}

      <div className="table-responsive">
        <table className={`table table-striped ${styles.table}`}>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    {editingUser?._id === user._id ? (
                      <input
                        name="firstName"
                        value={editedData.firstName}
                        onChange={handleInputChange}
                        className={`form-control ${styles["form-control"]}`}
                      />
                    ) : (
                      user.firstName
                    )}
                  </td>
                  <td>
                    {editingUser?._id === user._id ? (
                      <input
                        name="lastName"
                        value={editedData.lastName}
                        onChange={handleInputChange}
                        className={`form-control ${styles["form-control"]}`}
                      />
                    ) : (
                      user.lastName
                    )}
                  </td>
                  <td>
                    {editingUser?._id === user._id ? (
                      <input
                        name="email"
                        value={editedData.email}
                        onChange={handleInputChange}
                        className={`form-control ${styles["form-control"]}`}
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingUser?._id === user._id ? (
                      <select
                        name="role"
                        value={editedData.role}
                        onChange={handleInputChange}
                        className={`form-select ${styles["form-select"]}`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td>
                    {editingUser?._id === user._id ? (
                      <>
                        <button
                          className={`btn btn-sm me-2 ${styles["btn-success"]}`}
                          onClick={handleSave}
                        >
                          Save
                        </button>
                        <button
                          className={`btn btn-sm ${styles["btn-cancel"]}`}
                          onClick={() => setEditingUser(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={`btn btn-sm me-2 ${styles["btn-warning"]}`}
                          onClick={() => handleEditClick(user)}
                        >
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm ${styles["btn-danger"]}`}
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUsers;
