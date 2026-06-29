import { createContext, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  joinOrder: (orderId: string) => void;
  leaveOrder: (orderId: string) => void;
  sendMessage: (orderId: string, text: string, fileUrl?: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const url = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(url, { auth: { token } });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const joinOrder = (orderId: string) => socketRef.current?.emit('join_order', orderId);
  const leaveOrder = (orderId: string) => socketRef.current?.emit('leave_order', orderId);
  const sendMessage = (orderId: string, text: string, fileUrl?: string) =>
    socketRef.current?.emit('send_message', { orderId, text, fileUrl });

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, joinOrder, leaveOrder, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
