import { useState, useCallback } from 'react';
import { isPanFormatValid, isAadhaarValid } from '../utils/validators';

const VERIFICATION_DELAY_MS = 1500;

/**
 * useVerification - simulates a KYC verification API call for PAN/Aadhaar.
 * Returns { verify(value, type), isVerifying, isVerified, error, reset }.
 */
export default function useVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);

  const verify = useCallback((value, type) => new Promise((resolve) => {
    setError(null);
    setIsVerified(false);

    const isValidFormat = type === 'pan' ? isPanFormatValid(value) : isAadhaarValid(value);

    if (!isValidFormat) {
      setError(type === 'pan' ? 'Invalid PAN format' : 'Invalid Aadhaar number');
      resolve(false);
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      resolve(true);
    }, VERIFICATION_DELAY_MS);
  }), []);

  const reset = useCallback(() => {
    setIsVerified(false);
    setError(null);
    setIsVerifying(false);
  }, []);

  return {
    verify, isVerifying, isVerified, error, reset,
  };
}
