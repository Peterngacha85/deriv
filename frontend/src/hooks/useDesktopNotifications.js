import { useEffect, useRef, useState } from 'react';
import { useMarket } from '../context/MarketContext';

const STORAGE_KEY = 'desktopNotificationsEnabled';
const isSupported = typeof window !== 'undefined' && 'Notification' in window;

export function useDesktopNotifications() {
  const { alerts } = useMarket();
  const [enabled, setEnabled] = useState(() => isSupported && localStorage.getItem(STORAGE_KEY) === 'true');
  const notifiedIds = useRef(new Set());

  useEffect(() => {
    if (!enabled || !isSupported) return;
    for (const alert of alerts) {
      if (notifiedIds.current.has(alert.id)) continue;
      notifiedIds.current.add(alert.id);
      if (Notification.permission === 'granted') {
        new Notification(alert.title, { body: alert.message, tag: alert.id });
      }
    }
  }, [alerts, enabled]);

  async function toggle() {
    if (!isSupported) return;
    if (enabled) {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, 'false');
      return;
    }
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission === 'granted') {
      setEnabled(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }

  return { supported: isSupported, enabled, toggle };
}
