import { useEffect, useRef, useState } from 'react';
import { encryptData } from '../utils/encryption';
import { SCHEMA_VERSION } from '../constants/loanConfig';

/**
 * useAutoSave(formState, loanType, interval)
 * Serialises + encrypts the form state and writes it to LocalStorage every
 * `interval` ms (default 30000). Non-blocking: encryption + write happen
 * inside an async callback so the UI thread is never held.
 */
export default function useAutoSave(formState, loanType, interval = 30000) {
  const timerRef = useRef(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!loanType) return undefined;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const encrypted = await encryptData(formState);
        const key = `lendswift_draft_${loanType}`;
        const metadata = {
          version: SCHEMA_VERSION,
          timestamp: new Date().toISOString(),
          loanType,
        };
        window.localStorage.setItem(key, JSON.stringify({ ...encrypted, metadata }));
        setLastSavedAt(new Date());
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (err) {
        // Auto-save failures should never break the user's flow.
        console.warn('Auto-save failed', err.name);
      }
    }, interval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formState), loanType, interval]);

  return { lastSavedAt, showToast };
}
