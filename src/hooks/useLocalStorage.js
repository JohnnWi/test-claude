import { useCallback, useEffect, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

export function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (!isBrowser) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Errore nella lettura della chiave "${key}" da localStorage:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback((value) => {
    if (!isBrowser) {
      console.warn('Tentativo di impostare localStorage in un ambiente non browser.');
      return;
    }

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Errore nel salvataggio della chiave "${key}" in localStorage:`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    if (!isBrowser) {
      return undefined;
    }

    const handleStorage = (event) => {
      if (event.key === key) {
        setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [initialValue, key]);

  return [storedValue, setValue];
}
