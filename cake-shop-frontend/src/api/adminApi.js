
import api from "./axios";

export const fetchAdminStats = () =>
  api.get("/admin/stats");

export const fetchAllUsersAdmin = () =>
  api.get("/admin/users");

// Get single user details
export const getUserDetailsAdmin = (userId) =>
  api.get(`/admin/users/${userId}`);

// Block or unblock a user
export const updateUserBlockStatus = (userId, isBlocked) =>
  api.patch(`/admin/users/${userId}/block`, { isBlocked });

// Update a user's role
export const updateUserRoleAdmin = (userId, role) =>
  api.patch(`/admin/users/${userId}/role`, { role });

// Delete a user
export const deleteUserAdmin = (userId) =>
  api.delete(`/admin/users/${userId}`);
