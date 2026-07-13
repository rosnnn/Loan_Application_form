import React, { useEffect, useRef, useState } from 'react';
import { useFormData } from '../context/FormDataContext';
import ProgressBar from './common/ProgressBar';
import useAutoSave from '../hooks/useAutoSave';
import useFormPersistence from '../hooks/useFormPersistence';
import { isCoApplicantStepActive } from '../constants/loanConfig';

import Step1LoanType from './steps/Step1LoanType';
import Step2PersonalInfo from './steps/Step2PersonalInfo';
import Step3KYC from './steps/Step3KYC';
import Step4Address from './steps/Step4Address';
import Step5Employment from './steps/Step5Employment';
import Step6CoApplicant from './steps/Step6CoApplicant';
import Step7Documents from './steps/Step7Documents';
import Step8Review from './steps/Step8Review';

const STEP_REGISTRY = [
  { number: 1, name: 'Loan Type', component: Step1LoanType },
  { number: 2, name: 'Personal Info', component: Step2PersonalInfo },
  { number: 3, name: 'KYC Verification', component: Step3KYC },
  { number: 4, name: 'Address', component: Step4Address },
  { number: 5, name: 'Employment', component: Step5Employment },
  { number: 6, name: 'Co-Applicant', component: Step6CoApplicant },
  { number: 7, name: 'Documents', component: Step7Documents },
  { number: 8, name: 'Review & Submit', component: Step8Review },
];

export default function Wizard() {
  const {
    formData, currentStep, setCurrentStep,
  } = useFormData();
  const [resumeChoiceMade, setResumeChoiceMade] = useState(false);
  const stepRef = useRef(null);

  const { savedDraft, clearDraft } = useFormPersistence();
  const { updateFormData } = useFormData();
  const { showToast } = useAutoSave(formData, formData.loanType);

  // Determine which steps are actually visible given current form state.
  const coApplicantActive = isCoApplicantStepActive(formData.loanType, formData.loanAmount);
  const visibleSteps = STEP_REGISTRY.filter((s) => s.number !== 6 || coApplicantActive);
  const totalSteps = visibleSteps.length;
  const stepNames = visibleSteps.map((s) => s.name);
  const visibleIndex = visibleSteps.findIndex((s) => s.number === currentStep) + 1
    || visibleSteps.findIndex((s) => s.number > currentStep) + 1
    || 1;

  useEffect(() => {
    // Move focus to the first input on step change (WCAG 2.4.3 Focus Order)
    if (stepRef.current) {
      const firstInput = stepRef.current.querySelector('input, select, textarea, button');
      if (firstInput) firstInput.focus();
    }
  }, [currentStep]);

  const goToNextStep = () => {
    const currentIdx = visibleSteps.findIndex((s) => s.number === currentStep);
    const next = visibleSteps[currentIdx + 1];
    if (next) setCurrentStep(next.number);
  };

  const goToPreviousStep = () => {
    const currentIdx = visibleSteps.findIndex((s) => s.number === currentStep);
    const prev = visibleSteps[currentIdx - 1];
    if (prev) setCurrentStep(prev.number);
  };

  const goToStep = (stepNumber) => setCurrentStep(stepNumber);

  const handleResume = () => {
    if (savedDraft) {
      updateFormData(savedDraft.data);
      setCurrentStep(savedDraft.metadata.step || 1);
    }
    clearDraft(savedDraft?.key);
    setResumeChoiceMade(true);
  };

  const handleStartFresh = () => {
    clearDraft(savedDraft?.key);
    setResumeChoiceMade(true);
  };

  if (savedDraft && !resumeChoiceMade) {
    return (
      <div role="alertdialog" aria-labelledby="resume-title" className="max-w-md mx-auto mt-12 bg-white rounded-lg shadow p-6 text-center">
        <h2 id="resume-title" className="text-lg font-semibold text-primary mb-2">Resume Your Application?</h2>
        <p className="text-sm text-slate-600 mb-6">
          You have a saved application for {savedDraft.metadata.loanType} loan. Would you like to resume where you left off?
        </p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={handleStartFresh} className="min-h-[44px] px-5 py-2 border border-slate-300 rounded-md">
            Start Fresh
          </button>
          <button type="button" onClick={handleResume} className="min-h-[44px] px-5 py-2 bg-primary text-white rounded-md">
            Resume
          </button>
        </div>
      </div>
    );
  }

  const activeStepConfig = STEP_REGISTRY.find((s) => s.number === currentStep);
  const StepComponent = activeStepConfig.component;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <a href="#main-form" className="skip-link">Skip to form</a>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary">LendSwift Loan Application</h1>
        <p className="text-sm text-slate-500">Complete all steps to receive your pre-approval decision.</p>
      </header>

      <ProgressBar currentStep={visibleIndex} totalSteps={totalSteps} stepNames={stepNames} />

      {showToast && (
        <div role="status" aria-live="polite" className="mb-4 text-xs text-accent bg-accent/10 rounded px-3 py-1 inline-block">
          Draft saved at {new Date().toLocaleTimeString()}
        </div>
      )}

      <main id="main-form" className="bg-white rounded-lg shadow p-4 sm:p-6">
        <StepComponent
          ref={stepRef}
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          onSaveDraft={() => {}}
          goToStep={goToStep}
        />
      </main>

      <footer className="mt-6 text-xs text-slate-400 text-center">
        <p>LendSwift is an RBI-registered NBFC. Nodal Grievance Officer: grievance@lendswift.example | RBI Ombudsman: cms.rbi.org.in</p>
      </footer>
    </div>
  );
}
