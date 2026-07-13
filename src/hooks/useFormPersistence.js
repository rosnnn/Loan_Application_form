import { useEffect, useState, useCallback } from 'react';
import { decryptData } from '../utils/encryption';
import { AUTO_SAVE_TTL_HOURS, SCHEMA_VERSION, LOAN_TYPE } from '../constants/loanConfig';

function isFresh(timestamp) {
  const savedAt = new Date(timestamp).getTime();
  const ageHours = (Date.now() - savedAt) / (1000 * 60 * 60);
  return ageHours < AUTO_SAVE_TTL_HOURS;
}

function getDraftKeys() {
  return Object.values(LOAN_TYPE).map((t) => `lendswift_draft_${t}`);
}

/**
 * Checks LocalStorage on mount for a saved draft. If found and fresh
 * (< 72 hours old) and passing schema validation, exposes it so the caller
 * can show a Resume/Start Fresh modal.
 */
export default function useFormPersistence() {
  const [savedDraft, setSavedDraft] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      for (const key of getDraftKeys()) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (!parsed.metadata || parsed.metadata.version !== SCHEMA_VERSION) {
            window.localStorage.removeItem(key);
            continue;
          }
          if (!isFresh(parsed.metadata.timestamp)) {
            window.localStorage.removeItem(key);
            continue;
          }
          // eslint-disable-next-line no-await-in-loop
          const data = await decryptData(parsed);
          setSavedDraft({ key, data, metadata: parsed.metadata });
          break;
        } catch {
          window.localStorage.removeItem(key);
        }
      }
      setChecked(true);
    };
    check();
  }, []);

  const clearDraft = useCallback((key) => {
    if (key) window.localStorage.removeItem(key);
    setSavedDraft(null);
  }, []);

  return { savedDraft, checked, clearDraft };
}
