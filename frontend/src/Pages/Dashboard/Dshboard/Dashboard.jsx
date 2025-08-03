import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // تأكدي إنك مستخدمة useNavigate
import axiosInstance from "../../../Apis/config.js";
import './Dshboard.css'; // استيراد ملف CSS

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  useEffect(() => {
    axiosInstance
      .get('/users')
      .then((res) => {
        setUsers(res.data.users);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      });
  }, []);

  return (
    <div className=" mt-5 dashboard-container">
      <div className="dashboard-header mb-4">
        <h2>Users Dashboard</h2>
        <button className="btn btn-dark btn-logout" onClick={() => navigate('/login')}>
          Logout
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : users.length === 0 ? (
        <div className="alert alert-info">No users found.</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{user.email}</td>
                <td>{user.password}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;