import { useState, useCallback } from 'react';
import pinCodeData from '../utils/pinCodeData.json';
import { PIN_CODE_REGEX } from '../utils/validators';

/**
 * usePinCodeLookup - simulates the India Post PIN code lookup API using a
 * static dataset. Returns { lookup(pin), isLoading, error, result }.
 */
export default function usePinCodeLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const lookup = useCallback((pin) => new Promise((resolve) => {
    setError(null);
    setResult(null);

    if (!PIN_CODE_REGEX.test(pin || '')) {
      setError('Enter a valid 6-digit PIN code');
      resolve(null);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const match = pinCodeData[pin];
      setIsLoading(false);
      if (match) {
        setResult(match);
        resolve(match);
      } else {
        setError('PIN code not found. Please enter city/state manually.');
        resolve(null);
      }
    }, 600);
  }), []);

  return {
    lookup, isLoading, error, result,
  };
}
