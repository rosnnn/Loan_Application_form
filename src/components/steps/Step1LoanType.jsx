import React, { useEffect, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormData } from '../../context/FormDataContext';
import { getStep1Schema } from '../../schemas/schemaFactory';
import RadioGroup from '../common/RadioGroup';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';
import Input from '../common/Input';
import StepNavigation from '../common/StepNavigation';
import {
  LOAN_TYPE, LOAN_TYPE_LABELS, LOAN_TENURE_LIMITS, LOAN_PURPOSE_OPTIONS,
} from '../../constants/loanConfig';

const Step1LoanType = forwardRef(({ onNext, onSaveDraft }, ref) => {
  const { formData, updateFormData } = useFormData();

  const {
    register, handleSubmit, watch, control, formState: { errors }, setFocus,
  } = useForm({
    resolver: zodResolver(getStep1Schema(formData)),
    defaultValues: {
      loanType: formData.loanType,
      loanAmount: formData.loanAmount,
      loanTenure: formData.loanTenure,
      loanPurpose: formData.loanPurpose,
      referralCode: formData.referralCode,
    },
    mode: 'onBlur',
  });

  const loanType = watch('loanType');

  useEffect(() => { setFocus('loanType'); }, [setFocus]);

  const tenureLimits = loanType ? LOAN_TENURE_LIMITS[loanType] : null;
  const purposeOptions = loanType ? LOAN_PURPOSE_OPTIONS[loanType] : [];

  const onSubmit = (data) => {
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate ref={ref}>
      <h2 className="text-xl font-semibold text-primary mb-4">Loan Type & Basic Information</h2>

      <Controller
        name="loanType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            {...field}
            label="Loan Type"
            required
            error={errors.loanType?.message}
            options={Object.values(LOAN_TYPE).map((t) => ({ value: t, label: LOAN_TYPE_LABELS[t] }))}
          />
        )}
      />

      {loanType && (
        <>
          <Controller
            name="loanAmount"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                {...field}
                id="loanAmount"
                label="Loan Amount"
                required
                error={errors.loanAmount?.message}
              />
            )}
          />

          <Select
            id="loanTenure"
            label={`Loan Tenure (months)${tenureLimits ? ` - ${tenureLimits.min} to ${tenureLimits.max}` : ''}`}
            required
            error={errors.loanTenure?.message}
            options={tenureLimits
              ? Array.from(
                { length: Math.floor((tenureLimits.max - tenureLimits.min) / 6) + 1 },
                (_, i) => tenureLimits.min + i * 6,
              ).map((m) => ({ value: m, label: `${m} months` }))
              : []}
            {...register('loanTenure')}
          />

          <Select
            id="loanPurpose"
            label="Loan Purpose"
            required
            error={errors.loanPurpose?.message}
            options={purposeOptions}
            {...register('loanPurpose')}
          />

          <Input
            id="referralCode"
            label="Referral Code (optional)"
            helpText="6-10 alphanumeric characters"
            error={errors.referralCode?.message}
            {...register('referralCode')}
          />
        </>
      )}

      <StepNavigation
        isFirstStep
        isLastStep={false}
        onNext={onNext}
        onPrevious={() => {}}
        onSaveDraft={onSaveDraft}
      />
    </form>
  );
});
Step1LoanType.displayName = 'Step1LoanType';

export default Step1LoanType;
