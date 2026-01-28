'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Plus, MessageCircle, User } from 'lucide-react';

interface ShefLayoutProps {
  children: React.ReactNode;
}

export default function ShefLayout({ children }: ShefLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { icon: Home, label: 'Проекты', path: '/shef-dashboard' },
    { icon: Users, label: 'Бригады', path: '/teams' },
    { icon: Plus, label: 'Создать', path: '/create-shift' },
    { icon: MessageCircle, label: 'Чат', path: '/messages' },
    { icon: User, label: 'Профиль', path: '/profile' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      {/* CONTENT */}
      <div className="pb-24 overflow-y-auto min-h-screen">
        {children}
      </div>

      {/* TABBAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-2xl border-t border-white/10 h-20 z-50">
        <div className="flex items-center justify-around h-full px-4 max-w-screen-md mx-auto">
          {tabs.map(({ icon: Icon, label, path }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all"
                style={{
                  background: isActive ? 'rgba(232, 93, 47, 0.15)' : 'transparent',
                }}
              >
                <Icon
                  size={24}
                  strokeWidth={1.5}
                  style={{
                    color: isActive ? '#E85D2F' : 'rgba(255, 255, 255, 0.6)',
                    transition: 'color 0.2s'
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#E85D2F' : 'rgba(255, 255, 255, 0.6)',
                    transition: 'color 0.2s'
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
