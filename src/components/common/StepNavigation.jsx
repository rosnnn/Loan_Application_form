import React from 'react';

export default function StepNavigation({
  onPrevious, onNext, onSaveDraft, isFirstStep, isLastStep, nextLabel = 'Next', isSubmitDisabled = false,
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 pt-4 border-t border-slate-200">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep}
        className="min-h-[44px] px-6 py-2 border border-slate-300 rounded-md text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={onSaveDraft}
        className="min-h-[44px] px-6 py-2 text-sm text-primary underline"
      >
        Save Draft
      </button>
      <button
        type="submit"
        onClick={onNext}
        disabled={isLastStep && isSubmitDisabled}
        className="min-h-[44px] px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLastStep ? 'Submit Application' : nextLabel}
      </button>
    </div>
  );
}
