export const LOAN_TYPE = {
  PERSONAL: 'personal',
  HOME: 'home',
  BUSINESS: 'business',
};

export const LOAN_TYPE_LABELS = {
  [LOAN_TYPE.PERSONAL]: 'Personal Loan',
  [LOAN_TYPE.HOME]: 'Home Loan',
  [LOAN_TYPE.BUSINESS]: 'Business Loan',
};

export const LOAN_AMOUNT_LIMITS = {
  [LOAN_TYPE.PERSONAL]: { min: 50000, max: 1000000 },
  [LOAN_TYPE.HOME]: { min: 50000, max: 10000000 },
  [LOAN_TYPE.BUSINESS]: { min: 50000, max: 5000000 },
};

export const LOAN_TENURE_LIMITS = {
  [LOAN_TYPE.PERSONAL]: { min: 12, max: 60 },
  [LOAN_TYPE.HOME]: { min: 60, max: 360 },
  [LOAN_TYPE.BUSINESS]: { min: 12, max: 120 },
};

export const LOAN_PURPOSE_OPTIONS = {
  [LOAN_TYPE.PERSONAL]: [
    'Wedding', 'Medical Emergency', 'Travel', 'Education', 'Debt Consolidation', 'Home Renovation', 'Other',
  ],
  [LOAN_TYPE.HOME]: [
    'New Home Purchase', 'Home Construction', 'Home Renovation', 'Plot Purchase', 'Balance Transfer',
  ],
  [LOAN_TYPE.BUSINESS]: [
    'Working Capital', 'Equipment Purchase', 'Business Expansion', 'Inventory Financing', 'Other',
  ],
};

export const EMPLOYMENT_TYPE = {
  SALARIED: 'salaried',
  SELF_EMPLOYED: 'self_employed',
  BUSINESS_OWNER: 'business_owner',
};

export const CO_APPLICANT_THRESHOLDS = {
  [LOAN_TYPE.PERSONAL]: 500000,
  [LOAN_TYPE.BUSINESS]: 2000000,
  // Home loans always require a co-applicant step
};

export function isCoApplicantStepActive(loanType, loanAmount) {
  if (loanType === LOAN_TYPE.HOME) return true;
  if (loanType === LOAN_TYPE.PERSONAL) return Number(loanAmount) > CO_APPLICANT_THRESHOLDS.personal;
  if (loanType === LOAN_TYPE.BUSINESS) return Number(loanAmount) > CO_APPLICANT_THRESHOLDS.business;
  return false;
}

export const REQUIRED_DOCUMENTS = {
  common: ['panCard', 'aadhaarFront', 'aadhaarBack', 'bankStatements', 'photograph'],
  [EMPLOYMENT_TYPE.SALARIED]: ['salarySlips'],
  [EMPLOYMENT_TYPE.SELF_EMPLOYED]: ['itr'],
  [EMPLOYMENT_TYPE.BUSINESS_OWNER]: ['itr', 'gstReturns', 'businessRegistration'],
  [LOAN_TYPE.HOME]: ['propertyDocuments'],
  [LOAN_TYPE.BUSINESS]: ['gstReturns', 'businessRegistration'],
};

export const DOCUMENT_LABELS = {
  panCard: 'PAN Card Copy',
  aadhaarFront: 'Aadhaar Card (Front)',
  aadhaarBack: 'Aadhaar Card (Back)',
  salarySlips: 'Salary Slips (Last 3 months)',
  bankStatements: 'Bank Statements (Last 6 months)',
  itr: 'ITR (Last 2 years)',
  propertyDocuments: 'Property Documents',
  businessRegistration: 'Business Registration Certificate',
  gstReturns: 'GST Returns (Last 4 quarters)',
  photograph: 'Photograph (Passport size)',
};

export const AUTO_SAVE_INTERVAL_MS = 30000;
export const AUTO_SAVE_TTL_HOURS = 72;
export const SCHEMA_VERSION = '1.0';
