// src/Pages/Admin/AdminCreateUser.jsx
import ProtectedRoute from "../../Components/ProtectedRoute";
import AdminCreateUserForm from "./AdminCreateUserForm";

const AdminCreateUser = () => {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminCreateUserForm />
    </ProtectedRoute>
  );
};

export default AdminCreateUser;
