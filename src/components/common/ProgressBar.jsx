import React from 'react';

export default function ProgressBar({ currentStep, totalSteps, stepNames }) {
  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-1">
        <span
          className="text-sm font-medium text-slate-700"
          aria-label={`Step ${currentStep} of ${totalSteps}: ${stepNames[currentStep - 1]}`}
        >
          Step {currentStep} of {totalSteps}: {stepNames[currentStep - 1]}
        </span>
        <span className="text-sm text-slate-500">{percent}% complete</span>
      </div>
      <div
        className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
