import { useEffect, useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import api from '../lib/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import type { Message } from '../types';
import { Button } from './ui/Button';
import { formatDate } from '../lib/utils';

interface OrderChatProps {
  orderId: string;
  onClose?: () => void;
}

export function OrderChat({ orderId }: OrderChatProps) {
  const { joinOrder, leaveOrder, sendMessage, socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    joinOrder(orderId);
    api.get(`/api/orders/${orderId}`).then((res) => setMessages(res.data.messages || []));

    const handler = (msg: Message) => {
      if (msg.orderId === orderId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket?.on('new_message', handler);
    return () => {
      leaveOrder(orderId);
      socket?.off('new_message', handler);
    };
  }, [orderId, joinOrder, leaveOrder, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(orderId, text.trim());
    setText('');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      sendMessage(orderId, `📎 ${file.name}`, res.data.fileUrl);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">Нет сообщений</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                isOwn ? 'bg-accent text-white' : 'bg-gray-700 text-gray-200'
              }`}>
                {!isOwn && msg.sender && (
                  <div className="text-xs opacity-70 mb-1">{msg.sender.email}</div>
                )}
                {msg.fileUrl ? (
                  <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="underline">
                    {msg.text}
                  </a>
                ) : (
                  <p>{msg.text}</p>
                )}
                <div className="text-xs opacity-60 mt-1">{formatDate(msg.createdAt)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} accept="image/*,.pdf" />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="p-2 text-gray-400 hover:text-accent transition-colors"
        >
          <Paperclip size={18} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Сообщение..."
          className="flex-1 px-3 py-2 bg-bg-primary border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-accent"
        />
        <Button onClick={handleSend} size="sm"><Send size={16} /></Button>
      </div>
    </div>
  );
}
