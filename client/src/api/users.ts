import { request } from "./http";
import type { StaffInput, StaffUser } from "../types";

export const getUsers = () => request<StaffUser[]>("/api/users");

export const createStaff = (input: StaffInput) =>
  request<StaffUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const setUserActive = (id: number, isActive: boolean) =>
  request<StaffUser>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
