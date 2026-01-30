'use client'

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

export const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: Home, label: 'Смены', path: '/feed' },
    { icon: Search, label: 'Заявки', path: '/applications' },
    { icon: User, label: 'Профиль', path: '/profile' }
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#2A2A2A]/90 backdrop-blur-md border-t border-white/10 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`
                flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all
                ${active ? 'text-[#E85D2F]' : 'text-[#9B9B9B]'}
                hover:text-[#E85D2F]
                active:scale-95
              `}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#E85D2F] rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-montserrat font-800 text-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-montserrat font-700 ${active ? 'font-800' : 'font-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
