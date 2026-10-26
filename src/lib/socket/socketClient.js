import { io } from "socket.io-client";
import { ENV } from "@/config/env";

let socket = null;
let connectedToken = null;

export function getSocketUrl() {
  return String(ENV.API_BASE_URL || "").replace(/(\/crm)?\/api\/v1\/?$/, "");
}

export function connectSocket(token) {
  if (!token) return null;
  if (socket && connectedToken === token && socket.connected) return socket;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectedToken = null;
  }
  socket = io(getSocketUrl(), {
    auth: { token: `Bearer ${token}` },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    timeout: 20000,
  });
  connectedToken = token;
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectedToken = null;
  }
}

export default {
  connectSocket,
  getSocket,
  disconnectSocket,
  getSocketUrl,
};
