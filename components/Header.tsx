'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Share2 } from 'lucide-react';

export function Header({ 
  title, 
  showBack = true, 
  showNotifications = false,
  showShare = false,
  onBack 
}: {
  title: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showShare?: boolean;
  onBack?: () => void;
}) {
  const router = useRouter();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };
  
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between max-w-[390px] mx-auto"
      style={{
        height: '64px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '16px 20px',
      }}
    >
      {showBack ? (
        <button 
          onClick={handleBack} 
          className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
        </button>
      ) : (
        <div className="w-10" />
      )}
      
      <h1 
        className="font-montserrat font-bold text-lg flex-1 text-center"
        style={{ color: '#FFFFFF' }}
      >
        {title}
      </h1>
      
      {showShare ? (
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Share2 className="w-5 h-5 text-white" strokeWidth={1.5} />
        </button>
      ) : showNotifications ? (
        <button 
          onClick={() => router.push('/notifications')} 
          className="relative w-10 h-10 flex items-center justify-center rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Bell className="w-5 h-5 text-white" strokeWidth={1.5} />
          <span 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
            style={{ background: '#E85D2F' }}
          >
            3
          </span>
        </button>
      ) : (
        <div className="w-10" />
      )}
    </header>
  );
}
