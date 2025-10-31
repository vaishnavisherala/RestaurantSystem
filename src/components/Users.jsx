import React, { useEffect, useState } from 'react';
import SideBar from './SideBar';
import TopBar from './TopBar';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('access'); // assume JWT stored in localStorage
        
        const response = await fetch('http://192.168.0.198:8000/api/users/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });


        const data = await response.json();

        // If user is superadmin, data will be array, else object
        setUsers(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{display:"flex"}}>
      <TopBar/>
      <SideBar/>
      <div style={{flex:1,marginRight:"200px",marginTop:"100px"}}>
      <h2>Users</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Users;
