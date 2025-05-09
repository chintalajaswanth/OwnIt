import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/admin/users');
      setUsers(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error fetching users');
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/admin/users/${userId}/role`, { role });
      toast.success('User role updated successfully');
      
      // Update users list with new role
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role } : user
      ));
      
      // Close modal
      setSelectedUser(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error updating user role');
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loader">Loading...</div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">User Management</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-center">Created At</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {users.map(user => (
              <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-left">
                  {user.username}
                </td>
                <td className="py-3 px-6 text-left">
                  {user.email}
                </td>
                <td className="py-3 px-6 text-left">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' ? 'bg-red-200 text-red-800' : 
                    user.role === 'seller' ? 'bg-green-200 text-green-800' : 
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-6 text-center">
                  <button
                    onClick={() => openRoleModal(user)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                  >
                    Change Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Change Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Change User Role</h3>
            <p className="mb-4">
              User: <span className="font-semibold">{selectedUser.email}</span>
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Role</label>
              <select 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedUser(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleRoleChange(selectedUser._id, newRole)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
