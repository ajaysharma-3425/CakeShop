import api from "./axios";

export const getUserProfile = () => api.get("/users/profile");

export const updateUserProfile = (data) =>
  api.put("/users/profile", data, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

