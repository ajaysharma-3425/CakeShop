import api from "./axios";

export const fetchAllOrdersAdmin = () =>
  api.get("/admin/orders");

export const updateOrderStatusAdmin = (id, status) =>
  api.put(`/admin/orders/${id}/status`, { status });

export const fetchOrderByIdAdmin = (id) =>
  api.get(`/admin/orders/${id}`);

export const cancelOrderAdmin = (id, reason) =>
  api.put(`/admin/orders/${id}/cancel`, { reason });