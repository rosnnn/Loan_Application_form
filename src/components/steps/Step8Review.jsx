import React, { forwardRef, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useFormData } from '../../context/FormDataContext';
import {
  calculateEMI, calculateTotalCostOfBorrowing, calculateProcessingFee, getInterestRate, calculateEmiToIncomeRatio,
} from '../../utils/emiCalculator';
import { formatINR } from '../../utils/formatters';
import { LOAN_TYPE_LABELS } from '../../constants/loanConfig';
import Checkbox from '../common/Checkbox';
import StepNavigation from '../common/StepNavigation';

function getMonthlyIncome(formData) {
  const base = Number(formData.monthlyNetSalary || formData.monthlyIncomeSelfEmployed
    || (formData.annualTurnover ? formData.annualTurnover / 12 : 0));
  const coApplicant = Number(formData.coApplicantIncome || 0);
  return base + coApplicant;
}

const Step8Review = forwardRef(({ onPrevious, goToStep }, ref) => {
  const { formData, updateFormData, resetFormData } = useFormData();
  const [consents, setConsents] = useState({
    consentAccurate: formData.consentAccurate,
    consentCreditCheck: formData.consentCreditCheck,
    consentTerms: formData.consentTerms,
    consentCommunication: formData.consentCommunication,
  });
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const {
    emi, totalCost, processingFee, rate, emiRatio,
  } = useMemo(() => {
    const principal = Number(formData.loanAmount || 0);
    const tenure = Number(formData.loanTenure || 0);
    const interestRate = getInterestRate(formData.loanType);
    const calculatedEmi = calculateEMI(principal, interestRate, tenure);
    const income = getMonthlyIncome(formData);
    return {
      emi: calculatedEmi,
      totalCost: calculateTotalCostOfBorrowing(calculatedEmi, tenure, principal),
      processingFee: calculateProcessingFee(principal),
      rate: interestRate,
      emiRatio: calculateEmiToIncomeRatio(calculatedEmi, income),
    };
  }, [formData]);

  const allConsentsChecked = Object.values(consents).every(Boolean);
  const allDocsUploaded = Object.values(formData.documents || {}).every((files) => (files || []).length > 0)
    && Object.keys(formData.documents || {}).length > 0;
  const canSubmit = allConsentsChecked && allDocsUploaded && !!formData.signature;

  const handleConsentChange = (key) => (e) => {
    setConsents((prev) => ({ ...prev, [key]: e.target.checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    updateFormData(consents);
    const refNumber = uuidv4();
    setReferenceNumber(refNumber);
    setSubmitted(true);
    // Clear the encrypted auto-save draft on successful submission
    if (formData.loanType) {
      window.localStorage.removeItem(`lendswift_draft_${formData.loanType}`);
    }
  };

  if (submitted) {
    return (
      <div role="alertdialog" aria-labelledby="success-title" className="text-center py-8">
        <div className="text-accent text-5xl mb-4" aria-hidden="true">&#10003;</div>
        <h2 id="success-title" className="text-2xl font-semibold text-primary mb-2">Application Submitted!</h2>
        <p className="text-slate-600 mb-1">Your application reference number is:</p>
        <p className="font-mono text-lg font-semibold text-slate-800 mb-6">{referenceNumber}</p>
        <p className="text-sm text-slate-500 mb-6">
          You will receive updates via email at {formData.email}. You may exit this loan within the
          cooling-off period without penalty. For grievances, contact our nodal officer or escalate to
          the RBI Banking Ombudsman.
        </p>
        <button
          type="button"
          onClick={resetFormData}
          className="min-h-[44px] px-6 py-2 bg-primary text-white rounded-md"
        >
          Start a New Application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate ref={ref}>
      <h2 className="text-xl font-semibold text-primary mb-4">Review & Pre-Approval Summary</h2>

      <div className="bg-primary/5 border border-primary/20 rounded-md p-4 mb-6">
        <h3 className="font-semibold text-primary mb-3">Pre-Approval Summary (Key Fact Statement)</h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-slate-500">Loan Type</dt>
          <dd className="text-right font-medium">{LOAN_TYPE_LABELS[formData.loanType]}</dd>
          <dt className="text-slate-500">Loan Amount</dt>
          <dd className="text-right font-medium">{formatINR(formData.loanAmount)}</dd>
          <dt className="text-slate-500">Tenure</dt>
          <dd className="text-right font-medium">{formData.loanTenure} months</dd>
          <dt className="text-slate-500">Indicative Interest Rate</dt>
          <dd className="text-right font-medium">{rate}% p.a.</dd>
          <dt className="text-slate-500">Estimated EMI</dt>
          <dd className="text-right font-medium">{formatINR(emi)}</dd>
          <dt className="text-slate-500">Total Cost of Borrowing</dt>
          <dd className="text-right font-medium">{formatINR(totalCost)}</dd>
          <dt className="text-slate-500">Processing Fee</dt>
          <dd className="text-right font-medium">{formatINR(processingFee)}</dd>
        </dl>
        {emiRatio > 50 && (
          <p role="alert" className="mt-3 text-sm text-warning">
            Your estimated EMI is {emiRatio.toFixed(0)}% of monthly income, above the recommended 50% threshold.
            You may still submit, but please review your affordability carefully.
          </p>
        )}
      </div>

      <div className="mb-6 space-y-3 text-sm">
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Personal Info</span>
          <button type="button" onClick={() => goToStep(2)} className="text-primary underline min-h-[44px]">Edit</button>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">KYC Details</span>
          <button type="button" onClick={() => goToStep(3)} className="text-primary underline min-h-[44px]">Edit</button>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Address</span>
          <button type="button" onClick={() => goToStep(4)} className="text-primary underline min-h-[44px]">Edit</button>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Employment & Income</span>
          <button type="button" onClick={() => goToStep(5)} className="text-primary underline min-h-[44px]">Edit</button>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Documents</span>
          <button type="button" onClick={() => goToStep(7)} className="text-primary underline min-h-[44px]">Edit</button>
        </div>
      </div>

      {formData.signature && (
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-1">Your Signature</p>
          <img src={formData.signature} alt="Captured e-signature" className="border border-slate-200 rounded-md max-w-xs" />
        </div>
      )}

      <div className="mb-6 space-y-1">
        <Checkbox
          id="consentAccurate"
          label="I confirm that all information provided in this application is accurate to the best of my knowledge."
          checked={consents.consentAccurate}
          onChange={handleConsentChange('consentAccurate')}
        />
        <Checkbox
          id="consentCreditCheck"
          label="I authorise LendSwift to check my credit score via CIBIL/Equifax."
          checked={consents.consentCreditCheck}
          onChange={handleConsentChange('consentCreditCheck')}
        />
        <Checkbox
          id="consentTerms"
          label={<>I agree to the <a href="#terms" className="underline text-primary">Terms and Conditions</a>.</>}
          checked={consents.consentTerms}
          onChange={handleConsentChange('consentTerms')}
        />
        <Checkbox
          id="consentCommunication"
          label="I consent to receive communications regarding this application via email and SMS."
          checked={consents.consentCommunication}
          onChange={handleConsentChange('consentCommunication')}
        />
      </div>

      <StepNavigation
        isLastStep
        onPrevious={onPrevious}
        onSaveDraft={() => {}}
        isSubmitDisabled={!canSubmit}
      />
    </form>
  );
});
Step8Review.displayName = 'Step8Review';

export default Step8Review;
