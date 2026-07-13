import React, { forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormData } from '../../context/FormDataContext';
import { getStep5Schema } from '../../schemas/schemaFactory';
import Input from '../common/Input';
import Select from '../common/Select';
import RadioGroup from '../common/RadioGroup';
import CurrencyInput from '../common/CurrencyInput';
import StepNavigation from '../common/StepNavigation';
import { EMPLOYMENT_TYPE } from '../../constants/loanConfig';

const BUSINESS_TYPES = ['Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'Other'];

const Step5Employment = forwardRef(({ onNext, onPrevious, onSaveDraft }, ref) => {
  const { formData, updateFormData } = useFormData();

  const {
    register, handleSubmit, control, watch, formState: { errors },
  } = useForm({
    resolver: zodResolver(getStep5Schema(formData)),
    defaultValues: {
      employmentType: formData.employmentType,
      yearsOfExperience: formData.yearsOfExperience,
      companyName: formData.companyName,
      designation: formData.designation,
      monthlyNetSalary: formData.monthlyNetSalary,
      businessName: formData.businessName,
      businessType: formData.businessType,
      annualTurnover: formData.annualTurnover,
      yearsInBusiness: formData.yearsInBusiness,
      monthlyIncomeSelfEmployed: formData.monthlyIncomeSelfEmployed,
      gstNumber: formData.gstNumber,
      officeAddress: formData.officeAddress,
    },
    mode: 'onBlur',
  });

  const employmentType = watch('employmentType');

  const onSubmit = (data) => {
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate ref={ref}>
      <h2 className="text-xl font-semibold text-primary mb-4">Employment & Income Details</h2>

      <Controller
        name="employmentType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            {...field}
            label="Employment Type"
            required
            layout="vertical"
            error={errors.employmentType?.message}
            options={[
              { value: EMPLOYMENT_TYPE.SALARIED, label: 'Salaried' },
              { value: EMPLOYMENT_TYPE.SELF_EMPLOYED, label: 'Self-Employed' },
              { value: EMPLOYMENT_TYPE.BUSINESS_OWNER, label: 'Business Owner' },
            ]}
          />
        )}
      />

      <Input
        id="yearsOfExperience"
        label="Years of Experience"
        type="number"
        required
        min={0}
        max={50}
        error={errors.yearsOfExperience?.message}
        {...register('yearsOfExperience')}
      />

      {employmentType === EMPLOYMENT_TYPE.SALARIED && (
        <>
          <Input id="companyName" label="Company Name" required error={errors.companyName?.message} {...register('companyName')} />
          <Input id="designation" label="Designation" required error={errors.designation?.message} {...register('designation')} />
          <Controller
            name="monthlyNetSalary"
            control={control}
            render={({ field }) => (
              <CurrencyInput {...field} id="monthlyNetSalary" label="Monthly Net Salary" required error={errors.monthlyNetSalary?.message} />
            )}
          />
        </>
      )}

      {(employmentType === EMPLOYMENT_TYPE.SELF_EMPLOYED || employmentType === EMPLOYMENT_TYPE.BUSINESS_OWNER) && (
        <>
          <Input id="businessName" label="Business Name" required error={errors.businessName?.message} {...register('businessName')} />
          <Select
            id="businessType"
            label="Business Type"
            required
            options={BUSINESS_TYPES}
            error={errors.businessType?.message}
            {...register('businessType')}
          />
          <Controller
            name="annualTurnover"
            control={control}
            render={({ field }) => (
              <CurrencyInput {...field} id="annualTurnover" label="Annual Turnover" required error={errors.annualTurnover?.message} />
            )}
          />
          <Input
            id="yearsInBusiness"
            label="Years in Business"
            type="number"
            required
            min={2}
            error={errors.yearsInBusiness?.message}
            {...register('yearsInBusiness')}
          />
          {employmentType === EMPLOYMENT_TYPE.SELF_EMPLOYED && (
            <Controller
              name="monthlyIncomeSelfEmployed"
              control={control}
              render={({ field }) => (
                <CurrencyInput {...field} id="monthlyIncomeSelfEmployed" label="Monthly Income" required error={errors.monthlyIncomeSelfEmployed?.message} />
              )}
            />
          )}
          {employmentType === EMPLOYMENT_TYPE.BUSINESS_OWNER && (
            <Input
              id="gstNumber"
              label="GST Number"
              required
              maxLength={15}
              helpText="15-character format"
              error={errors.gstNumber?.message}
              {...register('gstNumber')}
            />
          )}
          <Input id="officeAddress" label="Office/Business Address" required error={errors.officeAddress?.message} {...register('officeAddress')} />
        </>
      )}

      <StepNavigation isLastStep={false} onPrevious={onPrevious} onSaveDraft={onSaveDraft} />
    </form>
  );
});
Step5Employment.displayName = 'Step5Employment';

export default Step5Employment;
