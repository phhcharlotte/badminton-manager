// src/lib/socket.ts
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/apis/tokenStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;

let socket: Socket | null = null;

/**
 * Ket noi socket, gui kem access token hien tai de BE xac thuc.
 * Goi ham nay SAU KHI dang nhap thanh cong (co accessToken trong tokenStore).
 */
export const connectSocket = (): Socket => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: getAccessToken() },
    withCredentials: true,
    transports: ["websocket", "polling"], // uu tien websocket, tu fallback neu bi chan
  });

  socket.on("connect_error", (err) => {
    // Thuong xay ra khi access token trong bo nho da het han luc F5 xong chua kip refresh
    // -> khong can xu ly gi dac biet, socket se tu retry; neu can, goi lai connectSocket()
    // sau khi co access token moi (xem AuthContext / authStore initAuth()).
    console.warn("Socket loi ket noi:", err.message);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = (): Socket | null => socket;
