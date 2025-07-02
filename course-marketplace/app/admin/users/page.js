"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthProvider";
import { getAllUsers, updateUserRole, updateUserStatus, getUserEnrollments, getUserPurchases } from "@/app/lib/api/profiles";
import { formatDate } from "@/app/lib/utils";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Load users on initial render
  useEffect(() => {
    loadUsers();
  }, []);

  // Load additional user details when a user is selected
  useEffect(() => {
    if (selectedUser) {
      loadUserDetails(selectedUser.id);
    }
  }, [selectedUser]);

  // Function to load all users
  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await getAllUsers();
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Function to load detailed info for a specific user
  async function loadUserDetails(userId) {
    try {
      const [enrollmentsResult, purchasesResult] = await Promise.all([
        getUserEnrollments(userId),
        getUserPurchases(userId)
      ]);

      setUserDetails({
        enrollments: enrollmentsResult.data || [],
        purchases: purchasesResult.data || []
      });
    } catch (error) {
      console.error("Error loading user details:", error);
    }
  }

  // Function to handle role update
  async function handleRoleUpdate(userId, newRole) {
    setUpdatingRole(true);
    try {
      const { success, error } = await updateUserRole(userId, newRole);
      
      if (!success) throw new Error(error || "Failed to update role");
      
      // Update user in the local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      // Update selected user if that's the one being edited
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Failed to update user role. Please try again.");
    } finally {
      setUpdatingRole(false);
    }
  }

  // Function to handle status update
  async function handleStatusUpdate(userId, newStatus) {
    setUpdatingStatus(true);
    try {
      const { success, error } = await updateUserStatus(userId, newStatus);
      
      if (!success) throw new Error(error || "Failed to update status");
      
      // Update user in the local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));
      
      // Update selected user if that's the one being edited
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update user status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const searchMatch = !searchTerm || 
      fullName.includes(searchTerm.toLowerCase()) || 
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const roleMatch = !roleFilter || user.role === roleFilter;
    const statusMatch = !statusFilter || user.status === statusFilter;
    
    return searchMatch && roleMatch && statusMatch;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-4 py-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700">
              Filter by role
            </label>
            <select
              id="role-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 border rounded"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="creator">Creator</option>
              <option value="student">Student</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
              Filter by status
            </label>
            <select
              id="status-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 border rounded"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Users Table */}
        <div className="md:w-2/3">
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-4">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border text-left">Name</th>
                    <th className="py-2 px-4 border text-left">Email</th>
                    <th className="py-2 px-4 border text-left">Role</th>
                    <th className="py-2 px-4 border text-left">Status</th>
                    <th className="py-2 px-4 border text-left">Joined</th>
                    <th className="py-2 px-4 border text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="py-2 px-4 border">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="py-2 px-4 border">{user.email}</td>
                      <td className="py-2 px-4 border">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'creator' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-2 px-4 border">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 border">{formatDate(user.created_at)}</td>
                      <td className="py-2 px-4 border">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* User Details Sidebar */}
        <div className="md:w-1/3 bg-white p-4 border rounded">
          {!selectedUser ? (
            <div className="text-center py-4 text-gray-500">
              Select a user to view details
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">User Details</h2>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-medium text-gray-700 mr-4">
                    {selectedUser.first_name?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{selectedUser.role === 'admin' ? 'Admin' : selectedUser.role === 'creator' ? 'Creator' : 'Student'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium capitalize">{selectedUser.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                  </div>
                </div>
              </div>
              
              {/* Role Management */}
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3">Role Management</h3>
                <div className="flex items-center space-x-2">
                  <select
                    className="form-select flex-1 border rounded px-3 py-2"
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                    aria-label="Change role"
                  >
                    <option value="admin">Admin</option>
                    <option value="creator">Creator</option>
                    <option value="student">Student</option>
                  </select>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                      const select = document.querySelector('[aria-label="Change role"]');
                      handleRoleUpdate(selectedUser.id, select.value);
                    }}
                    disabled={updatingRole}
                  >
                    {updatingRole ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </div>
              
              {/* Status Management */}
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3">Account Status</h3>
                <div className="flex items-center space-x-2">
                  <button
                    className={`flex-1 py-2 rounded ${
                      selectedUser.status === 'active'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                    onClick={() => handleStatusUpdate(
                      selectedUser.id, 
                      selectedUser.status === 'active' ? 'inactive' : 'active'
                    )}
                    disabled={updatingStatus}
                  >
                    {updatingStatus
                      ? 'Updating...'
                      : selectedUser.status === 'active'
                        ? 'Deactivate Account'
                        : 'Activate Account'
                    }
                  </button>
                </div>
              </div>
              
              {/* Enrollments */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Enrollments</h3>
                {!userDetails ? (
                  <p className="text-gray-500">Loading enrollments...</p>
                ) : userDetails.enrollments.length === 0 ? (
                  <p className="text-gray-500">No courses enrolled</p>
                ) : (
                  <ul className="space-y-2">
                    {userDetails.enrollments.map(enrollment => (
                      <li key={enrollment.id} className="border-b pb-2">
                        <p className="font-medium">{enrollment.courses?.title || 'Unnamed Course'}</p>
                        <p className="text-sm text-gray-500">
                          Enrolled: {formatDate(enrollment.purchased_at)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Progress: {enrollment.completion_percentage || 0}%
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* Purchases */}
              <div>
                <h3 className="font-medium mb-2">Purchase History</h3>
                {!userDetails ? (
                  <p className="text-gray-500">Loading purchases...</p>
                ) : userDetails.purchases.length === 0 ? (
                  <p className="text-gray-500">No purchase history</p>
                ) : (
                  <ul className="space-y-2">
                    {userDetails.purchases.map(purchase => (
                      <li key={purchase.id} className="border-b pb-2">
                        <p className="font-medium">{purchase.courses?.title || 'Unnamed Course'}</p>
                        <p className="text-sm text-gray-500">
                          Purchased: {formatDate(purchase.purchased_at)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Amount: ${purchase.amount}
                        </p>
                        <p className="text-sm">
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                            purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            purchase.status === 'refunded' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {purchase.status}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 