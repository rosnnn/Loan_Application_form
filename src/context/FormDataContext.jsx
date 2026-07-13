import React, {
  createContext, useContext, useState, useCallback, useMemo,
} from 'react';

const FormDataContext = createContext(null);

const initialState = {
  // Step 1
  loanType: '',
  loanAmount: '',
  loanTenure: '',
  loanPurpose: '',
  referralCode: '',
  // Step 2
  fullName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  fatherName: '',
  motherName: '',
  email: '',
  mobileNumber: '',
  alternateMobile: '',
  // Step 3
  panNumber: '',
  panVerified: false,
  aadhaarNumber: '',
  aadhaarVerified: false,
  aadhaarConsent: false,
  voterId: '',
  passport: '',
  // Step 4
  current: {
    addressLine1: '', addressLine2: '', pinCode: '', city: '', state: '', residenceType: '', rentAmount: '', yearsAtAddress: '',
  },
  sameAsPermanent: true,
  permanent: {
    addressLine1: '', addressLine2: '', pinCode: '', city: '', state: '',
  },
  // Step 5
  employmentType: '',
  yearsOfExperience: '',
  companyName: '',
  designation: '',
  monthlyNetSalary: '',
  businessName: '',
  businessType: '',
  annualTurnover: '',
  yearsInBusiness: '',
  monthlyIncomeSelfEmployed: '',
  gstNumber: '',
  officeAddress: '',
  // Step 6
  coApplicantName: '',
  relationship: '',
  coApplicantPan: '',
  coApplicantIncome: '',
  coApplicantConsent: false,
  // Step 7
  documents: {},
  signature: '',
  // Step 8
  consentAccurate: false,
  consentCreditCheck: false,
  consentTerms: false,
  consentCommunication: false,
};

export function FormDataProvider({ children, initialData }) {
  // Initialize with base state, only apply initialData if it's actually from a valid resume
  const [formData, setFormData] = useState(() => {
    const base = { ...initialState };
    // Only merge initialData if it's explicitly provided (from useFormPersistence)
    if (initialData && Object.keys(initialData).length > 0) {
      return { ...base, ...initialData };
    }
    return base;
  });
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(initialState);
    setCurrentStep(1);
  }, []);

  const value = useMemo(() => ({
    formData, updateFormData, resetFormData, currentStep, setCurrentStep,
  }), [formData, updateFormData, resetFormData, currentStep]);

  return <FormDataContext.Provider value={value}>{children}</FormDataContext.Provider>;
}

export function useFormData() {
  const ctx = useContext(FormDataContext);
  if (!ctx) throw new Error('useFormData must be used within a FormDataProvider');
  return ctx;
}

export { initialState };
