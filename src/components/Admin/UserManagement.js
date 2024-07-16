import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { updateUserRole } from '../../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (selectedUser && newRole) {
      await updateUserRole(selectedUser, newRole);
      // Optionally, update local state to reflect changes
      setUsers(users.map(user => user.id === selectedUser ? { ...user, role: newRole } : user));
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <select onChange={(e) => setSelectedUser(e.target.value)}>
        <option value="">Select User</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>{user.email}</option>
        ))}
      </select>
      <select onChange={(e) => setNewRole(e.target.value)}>
        <option value="">Select Role</option>
        <option value="free">Free</option>
        <option value="premium">Premium</option>
        <option value="pro">Pro</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleRoleChange}>Update Role</button>
    </div>
  );
};

export default UserManagement;
