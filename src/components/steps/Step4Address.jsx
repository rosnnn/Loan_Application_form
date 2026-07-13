import React, { forwardRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormData } from '../../context/FormDataContext';
import { step4Schema } from '../../schemas/schemaFactory';
import Input from '../common/Input';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';
import Checkbox from '../common/Checkbox';
import StepNavigation from '../common/StepNavigation';
import usePinCodeLookup from '../../hooks/usePinCodeLookup';

const RESIDENCE_TYPES = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'company', label: 'Company Provided' },
  { value: 'family', label: 'Family Owned' },
];

const Step4Address = forwardRef(({ onNext, onPrevious, onSaveDraft }, ref) => {
  const { formData, updateFormData } = useFormData();
  const currentPinLookup = usePinCodeLookup();
  const [stateMismatch, setStateMismatch] = useState(false);

  const {
    register, handleSubmit, control, watch, setValue, formState: { errors },
  } = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      current: formData.current,
      sameAsPermanent: formData.sameAsPermanent,
      permanent: formData.permanent,
    },
    mode: 'onBlur',
  });

  const residenceType = watch('current.residenceType');
  const yearsAtAddress = watch('current.yearsAtAddress');
  const sameAsPermanent = watch('sameAsPermanent');
  const currentState = watch('current.state');

  const handlePinBlur = async (pin, prefix) => {
    const result = await currentPinLookup.lookup(pin);
    if (result) {
      setValue(`${prefix}.city`, result.city);
      setValue(`${prefix}.state`, result.state);
      if (prefix === 'current' && currentState && currentState !== result.state) {
        setStateMismatch(true);
      } else {
        setStateMismatch(false);
      }
    }
  };

  const onSubmit = (data) => {
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate ref={ref}>
      <h2 className="text-xl font-semibold text-primary mb-4">Address Information</h2>

      <h3 className="font-medium text-slate-700 mb-2">Current Address</h3>
      <Input
        id="current.addressLine1"
        label="Address Line 1"
        required
        autoComplete="address-line1"
        error={errors.current?.addressLine1?.message}
        {...register('current.addressLine1')}
      />
      <Input
        id="current.addressLine2"
        label="Address Line 2 (optional)"
        autoComplete="address-line2"
        {...register('current.addressLine2')}
      />
      <Input
        id="current.pinCode"
        label="PIN Code"
        required
        maxLength={6}
        autoComplete="postal-code"
        helpText={currentPinLookup.isLoading ? 'Looking up...' : currentPinLookup.error}
        error={errors.current?.pinCode?.message}
        {...register('current.pinCode', {
          onBlur: (e) => handlePinBlur(e.target.value, 'current'),
        })}
      />
      <Input
        id="current.city"
        label="City"
        required
        autoComplete="address-level2"
        error={errors.current?.city?.message}
        {...register('current.city')}
      />
      <Input
        id="current.state"
        label="State"
        required
        autoComplete="address-level1"
        error={errors.current?.state?.message}
        helpText={stateMismatch ? 'The state you entered does not match the PIN code lookup - please verify.' : undefined}
        {...register('current.state')}
      />

      <Select
        id="current.residenceType"
        label="Residence Type"
        required
        error={errors.current?.residenceType?.message}
        options={RESIDENCE_TYPES}
        {...register('current.residenceType')}
      />

      {residenceType === 'rented' && (
        <Controller
          name="current.rentAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput {...field} id="rentAmount" label="Monthly Rent Amount" required error={errors.current?.rentAmount?.message} />
          )}
        />
      )}

      <Input
        id="current.yearsAtAddress"
        label="Years at Current Address"
        type="number"
        required
        min={0}
        max={50}
        error={errors.current?.yearsAtAddress?.message}
        {...register('current.yearsAtAddress')}
      />

      {Number(yearsAtAddress) < 1 && yearsAtAddress !== '' && (
        <p className="text-xs text-slate-500 mb-4">
          Since you have lived here less than a year, additional address proof may be requested during document review.
        </p>
      )}

      <Checkbox
        id="sameAsPermanent"
        label="Same as permanent address"
        {...register('sameAsPermanent')}
      />

      {!sameAsPermanent && (
        <>
          <h3 className="font-medium text-slate-700 mb-2 mt-4">Permanent Address</h3>
          <Input
            id="permanent.addressLine1"
            label="Address Line 1"
            required
            error={errors.permanent?.addressLine1?.message}
            {...register('permanent.addressLine1')}
          />
          <Input
            id="permanent.pinCode"
            label="PIN Code"
            required
            maxLength={6}
            error={errors.permanent?.pinCode?.message}
            {...register('permanent.pinCode', {
              onBlur: (e) => handlePinBlur(e.target.value, 'permanent'),
            })}
          />
          <Input
            id="permanent.city"
            label="City"
            required
            error={errors.permanent?.city?.message}
            {...register('permanent.city')}
          />
          <Input
            id="permanent.state"
            label="State"
            required
            error={errors.permanent?.state?.message}
            {...register('permanent.state')}
          />
        </>
      )}

      <StepNavigation isLastStep={false} onPrevious={onPrevious} onSaveDraft={onSaveDraft} />
    </form>
  );
});
Step4Address.displayName = 'Step4Address';

export default Step4Address;
