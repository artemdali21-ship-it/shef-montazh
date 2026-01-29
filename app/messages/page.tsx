'use client'

import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import WorkerLayout from '@/components/layouts/WorkerLayout';
import ClientLayout from '@/components/layouts/ClientLayout';
import ShefLayout from '@/components/layouts/ShefLayout';
import { getUserRole } from '@/lib/auth';

export default function MessagesPage() {
  const [role, setRole] = useState<'worker' | 'client' | 'shef'>('worker');
  const [mounted, setMounted] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setRole(getUserRole());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const Layout = role === 'worker' ? WorkerLayout : role === 'client' ? ClientLayout : ShefLayout;

  const chats = [
    { id: '1', name: 'Decor Factory', lastMessage: 'Спасибо за работу!', time: '10:30' },
    { id: '2', name: 'Event Pro', lastMessage: 'Когда ты свободен?', time: '09:15' },
    { id: '3', name: 'Crocus Support', lastMessage: 'Вопрос по платежу', time: 'вчера' },
  ];

  const messages = [
    { id: '1', sender: 'other', text: 'Привет! Как дела с проектом?' },
    { id: '2', sender: 'user', text: 'Все хорошо, работаю над монтажом' },
    { id: '3', sender: 'other', text: 'Отлично! Ждём результатов' },
  ];

  return (
    <Layout>
      <div style={{ display: 'flex', height: 'calc(100vh - 80px - 60px)' }}>
        {/* CHATS LIST */}
        <div style={{
          width: selectedChat ? '0' : '100%',
          transition: 'width 0.3s',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          overflowY: 'auto',
        }}>
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: selectedChat === chat.id ? 'rgba(232, 93, 47, 0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(232, 93, 47, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MessageCircle size={24} color="#E85D2F" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>
                  {chat.name}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {chat.lastMessage}
                </div>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                {chat.time}
              </div>
            </button>
          ))}
        </div>

        {/* CHAT VIEW */}
        {selectedChat && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0, 0, 0, 0.3)' }}>
            {/* HEADER */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <button
                onClick={() => setSelectedChat(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
              >
                ←
              </button>
              <div style={{ color: 'white', fontWeight: 600 }}>
                {chats.find(c => c.id === selectedChat)?.name}
              </div>
            </div>

            {/* MESSAGES */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.sender === 'user' ? '#E85D2F' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* INPUT */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              gap: '12px',
            }}>
              <input
                type="text"
                placeholder="Сообщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
              <button
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  background: '#E85D2F',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
