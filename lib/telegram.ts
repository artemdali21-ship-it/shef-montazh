export const useTelegram = () => {
  if (typeof window === 'undefined') return null;
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return null;
  
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#8B8B8B');
  tg.setBackgroundColor('#8B8B8B');
  
  return {
    user: tg.initDataUnsafe?.user,
    close: () => tg.close(),
    haptic: (style: string) => tg.HapticFeedback?.impactOccurred(style)
  };
};
