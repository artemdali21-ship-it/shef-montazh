'use client'

import { useEffect } from 'react'

export default function TelegramViewportHandler() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    const setHeight = () => {
      const h = tg?.viewportHeight || window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${h}px`);
    };

    setHeight();
    tg?.onEvent?.("viewportChanged", setHeight);
    tg?.expand?.();

    return () => {
      tg?.offEvent?.("viewportChanged", setHeight);
    };
  }, []);

  return null;
}
