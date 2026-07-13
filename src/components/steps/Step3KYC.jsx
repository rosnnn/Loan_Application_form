import React, { forwardRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormData } from '../../context/FormDataContext';
import { getStep3Schema } from '../../schemas/schemaFactory';
import MaskedInput from '../common/MaskedInput';
import Input from '../common/Input';
import Checkbox from '../common/Checkbox';
import StepNavigation from '../common/StepNavigation';
import useVerification from '../../hooks/useVerification';
import { isPanFormatValid, isAadhaarValid } from '../../utils/validators';

const Step3KYC = forwardRef(({ onNext, onPrevious, onSaveDraft }, ref) => {
  const { formData, updateFormData } = useFormData();
  const panVerification = useVerification();
  const aadhaarVerification = useVerification();
  const [panVerified, setPanVerified] = useState(formData.panVerified);
  const [aadhaarVerified, setAadhaarVerified] = useState(formData.aadhaarVerified);

  const {
    register, handleSubmit, control, watch, formState: { errors }, setValue,
  } = useForm({
    resolver: zodResolver(getStep3Schema(formData)),
    defaultValues: {
      panNumber: formData.panNumber,
      aadhaarNumber: formData.aadhaarNumber,
      aadhaarConsent: formData.aadhaarConsent,
      voterId: formData.voterId,
      passport: formData.passport,
    },
    mode: 'onBlur',
  });

  const panValue = watch('panNumber');
  const aadhaarValue = watch('aadhaarNumber');

  const handlePanBlur = async () => {
    if (isPanFormatValid(panValue)) {
      const ok = await panVerification.verify(panValue, 'pan');
      setPanVerified(ok);
      setValue('panVerified', ok);
    }
  };

  const handleAadhaarBlur = async () => {
    if (isAadhaarValid(aadhaarValue)) {
      const ok = await aadhaarVerification.verify(aadhaarValue, 'aadhaar');
      setAadhaarVerified(ok);
      setValue('aadhaarVerified', ok);
    }
  };

  const onSubmit = (data) => {
    updateFormData({ ...data, panVerified, aadhaarVerified });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate ref={ref}>
      <h2 className="text-xl font-semibold text-primary mb-4">Identity Verification (KYC)</h2>

      <Controller
        name="panNumber"
        control={control}
        render={({ field }) => (
          <MaskedInput
            {...field}
            id="panNumber"
            label="PAN Number"
            required
            maxLength={10}
            helpText="Format: AAAAA9999A"
            error={errors.panNumber?.message || panVerification.error}
            isVerifying={panVerification.isVerifying}
            isVerified={panVerified}
            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
            onBlur={(e) => { field.onBlur(e); handlePanBlur(); }}
          />
        )}
      />

      <Controller
        name="aadhaarNumber"
        control={control}
        render={({ field }) => (
          <MaskedInput
            {...field}
            id="aadhaarNumber"
            label="Aadhaar Number"
            required
            maxLength={12}
            helpText="12 digits"
            error={errors.aadhaarNumber?.message || aadhaarVerification.error}
            isVerifying={aadhaarVerification.isVerifying}
            isVerified={aadhaarVerified}
            onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={(e) => { field.onBlur(e); handleAadhaarBlur(); }}
          />
        )}
      />

      <Checkbox
        id="aadhaarConsent"
        label="I explicitly consent to LendSwift verifying my Aadhaar details for this loan application, in accordance with RBI Digital Lending Guidelines."
        error={errors.aadhaarConsent?.message}
        {...register('aadhaarConsent')}
      />

      <Input
        id="voterId"
        label="Voter ID (optional)"
        helpText="3 letters followed by 7 digits"
        error={errors.voterId?.message}
        {...register('voterId')}
      />

      {formData.loanType === 'home' && Number(formData.loanAmount) > 5000000 && (
        <Input
          id="passport"
          label="Passport Number (optional)"
          helpText="1 letter followed by 7 digits"
          error={errors.passport?.message}
          {...register('passport')}
        />
      )}

      <StepNavigation isLastStep={false} onPrevious={onPrevious} onSaveDraft={onSaveDraft} />
    </form>
  );
});
Step3KYC.displayName = 'Step3KYC';

export default Step3KYC;
