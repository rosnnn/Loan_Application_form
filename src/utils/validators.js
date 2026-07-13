// ---------------------------------------------------------------------------
// PAN validation
// Format: AAAAA9999A (5 letters, 4 digits, 1 letter)
// 4th character indicates entity type: P=Individual, C=Company, H=HUF, A=AOP,
// B=BOI, G=Government, J=Artificial Juridical Person, L=Local Authority,
// F=Firm, T=Trust
// ---------------------------------------------------------------------------
export const PAN_ENTITY_TYPES = {
  P: 'Individual',
  C: 'Company',
  H: 'HUF',
  A: 'AOP',
  B: 'BOI',
  G: 'Government',
  J: 'Artificial Juridical Person',
  L: 'Local Authority',
  F: 'Firm',
  T: 'Trust',
};

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export function isPanFormatValid(pan) {
  if (!pan) return false;
  return PAN_REGEX.test(pan.toUpperCase());
}

export function getPanEntityType(pan) {
  if (!pan || pan.length < 4) return null;
  const char = pan.toUpperCase()[3];
  return PAN_ENTITY_TYPES[char] || null;
}

export function isPanEntityAllowed(pan, allowedEntityChars) {
  if (!pan || pan.length < 4) return false;
  const char = pan.toUpperCase()[3];
  return allowedEntityChars.includes(char);
}

// ---------------------------------------------------------------------------
// Aadhaar validation via Verhoeff algorithm
// ---------------------------------------------------------------------------
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

export function isAadhaarFormatValid(value) {
  return /^[0-9]{12}$/.test(value || '');
}

export function verhoeffChecksum(numString) {
  let c = 0;
  const digits = numString.split('').reverse().map(Number);
  for (let i = 0; i < digits.length; i += 1) {
    c = d[c][p[i % 8][digits[i]]];
  }
  return c;
}

export function isAadhaarValid(aadhaar) {
  if (!isAadhaarFormatValid(aadhaar)) return false;
  return verhoeffChecksum(aadhaar) === 0;
}

export function verhoeffGenerateCheckDigit(numStringWithoutCheck) {
  let c = 0;
  const digits = numStringWithoutCheck.split('').reverse().map(Number);
  for (let i = 0; i < digits.length; i += 1) {
    c = d[c][p[(i + 1) % 8][digits[i]]];
  }
  return inv[c];
}

// ---------------------------------------------------------------------------
// GST validation (15 chars): 2 state code + 10 PAN + 1 entity number + Z + checksum
// ---------------------------------------------------------------------------
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function isGstFormatValid(gst) {
  if (!gst) return false;
  return GST_REGEX.test(gst.toUpperCase());
}

// ---------------------------------------------------------------------------
// Mobile / name / voter / passport
// ---------------------------------------------------------------------------
export const MOBILE_REGEX = /^[6-9][0-9]{9}$/;
export const NAME_REGEX = /^[A-Za-z. ]{2,100}$/;
export const VOTER_ID_REGEX = /^[A-Z]{3}[0-9]{7}$/;
export const PASSPORT_REGEX = /^[A-Z]{1}[0-9]{7}$/;
export const PIN_CODE_REGEX = /^[1-9][0-9]{5}$/;
export const REFERRAL_CODE_REGEX = /^[A-Za-z0-9]{6,10}$/;

export function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}
