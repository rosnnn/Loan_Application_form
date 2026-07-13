import React, { forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormData } from '../../context/FormDataContext';
import { step2Schema } from '../../schemas/schemaFactory';
import Input from '../common/Input';
import Select from '../common/Select';
import RadioGroup from '../common/RadioGroup';
import StepNavigation from '../common/StepNavigation';

const MARITAL_STATUS_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];

const Step2PersonalInfo = forwardRef(({ onNext, onPrevious, onSaveDraft }, ref) => {
  const { formData, updateFormData } = useFormData();

  const {
    register, handleSubmit, control, formState: { errors },
  } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      alternateMobile: formData.alternateMobile,
    },
    mode: 'onBlur',
  });

  const onSubmit = (data) => {
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate ref={ref}>
      <h2 className="text-xl font-semibold text-primary mb-4">Personal Information</h2>

      <Input
        id="fullName"
        label="Full Name (as per PAN)"
        required
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <Input
        id="dateOfBirth"
        label="Date of Birth"
        type="date"
        required
        autoComplete="bday"
        error={errors.dateOfBirth?.message}
        {...register('dateOfBirth')}
      />

      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <RadioGroup
            {...field}
            label="Gender"
            required
            error={errors.gender?.message}
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
          />
        )}
      />

      <Select
        id="maritalStatus"
        label="Marital Status"
        required
        error={errors.maritalStatus?.message}
        options={MARITAL_STATUS_OPTIONS}
        {...register('maritalStatus')}
      />

      <Input
        id="fatherName"
        label="Father's Name"
        required
        error={errors.fatherName?.message}
        {...register('fatherName')}
      />

      <Input
        id="motherName"
        label="Mother's Name"
        required
        error={errors.motherName?.message}
        {...register('motherName')}
      />

      <Input
        id="email"
        label="Email"
        type="email"
        required
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        id="mobileNumber"
        label="Mobile Number"
        type="tel"
        required
        autoComplete="tel"
        helpText="10 digits, starting with 6-9"
        error={errors.mobileNumber?.message}
        {...register('mobileNumber')}
      />

      <Input
        id="alternateMobile"
        label="Alternate Mobile (optional)"
        type="tel"
        error={errors.alternateMobile?.message}
        {...register('alternateMobile')}
      />

      <StepNavigation isLastStep={false} onPrevious={onPrevious} onSaveDraft={onSaveDraft} />
    </form>
  );
});
Step2PersonalInfo.displayName = 'Step2PersonalInfo';

export default Step2PersonalInfo;
