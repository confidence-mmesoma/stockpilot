import { request } from "./http";
import type { User } from "../types";

export const login = (email: string, password: string) =>
  request<User>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () =>
  request<{ message: string }>("/api/auth/logout", { method: "POST" });

export const getMe = () => request<User>("/api/auth/me");
