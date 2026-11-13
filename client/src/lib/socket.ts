import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// Does not connect by itself. The layout connects it after login.
// withCredentials sends the login cookie, which is how the server knows who we are.
export const socket = io(API_URL, {
  autoConnect: false,
  withCredentials: true,
});
