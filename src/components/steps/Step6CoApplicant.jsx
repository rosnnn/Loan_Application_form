import React, { forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormData } from '../../context/FormDataContext';
import { step6Schema } from '../../schemas/schemaFactory';
import Input from '../common/Input';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';
import Checkbox from '../common/Checkbox';
import StepNavigation from '../common/StepNavigation';

const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'business_partner', label: 'Business Partner' },
];

const Step6CoApplicant = forwardRef(({ onNext, onPrevious, onSaveDraft }, ref) => {
  const { formData, updateFormData } = useFormData();

  const {
    register, handleSubmit, control, formState: { errors },
  } = useForm({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      coApplicantName: formData.coApplicantName,
      relationship: formData.maritalStatus === 'Married' ? (formData.relationship || 'spouse') : formData.relationship,
      coApplicantPan: formData.coApplicantPan,
      coApplicantIncome: formData.coApplicantIncome,
      coApplicantConsent: formData.coApplicantConsent,
    },
    mode: 'onBlur',
  });

  const onSubmit = (data) => {
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate ref={ref}>
      <h2 className="text-xl font-semibold text-primary mb-4">Co-Applicant & Guarantor</h2>
      <p className="text-sm text-slate-500 mb-4">
        Based on your loan type and amount, a co-applicant is required for this application.
      </p>

      <Input
        id="coApplicantName"
        label="Co-Applicant Name"
        required
        error={errors.coApplicantName?.message}
        {...register('coApplicantName')}
      />

      <Select
        id="relationship"
        label="Relationship to Applicant"
        required
        options={RELATIONSHIP_OPTIONS}
        error={errors.relationship?.message}
        {...register('relationship')}
      />

      <Input
        id="coApplicantPan"
        label="Co-Applicant PAN"
        required
        maxLength={10}
        helpText="Format: AAAAA9999A"
        error={errors.coApplicantPan?.message}
        {...register('coApplicantPan')}
      />

      <Controller
        name="coApplicantIncome"
        control={control}
        render={({ field }) => (
          <CurrencyInput {...field} id="coApplicantIncome" label="Co-Applicant Monthly Income" required error={errors.coApplicantIncome?.message} />
        )}
      />

      <Checkbox
        id="coApplicantConsent"
        label="The co-applicant consents to being included in this loan application and to a credit bureau check."
        error={errors.coApplicantConsent?.message}
        {...register('coApplicantConsent')}
      />

      <StepNavigation isLastStep={false} onPrevious={onPrevious} onSaveDraft={onSaveDraft} />
    </form>
  );
});
Step6CoApplicant.displayName = 'Step6CoApplicant';

export default Step6CoApplicant;
