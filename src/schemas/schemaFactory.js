import { z } from 'zod';
import {
  isPanFormatValid,
  isPanEntityAllowed,
  isAadhaarValid,
  isGstFormatValid,
  MOBILE_REGEX,
  NAME_REGEX,
  VOTER_ID_REGEX,
  PASSPORT_REGEX,
  PIN_CODE_REGEX,
  REFERRAL_CODE_REGEX,
  calculateAge,
} from '../utils/validators';
import {
  LOAN_TYPE,
  LOAN_AMOUNT_LIMITS,
  LOAN_TENURE_LIMITS,
  EMPLOYMENT_TYPE,
} from '../constants/loanConfig';

const nameSchema = z
  .string()
  .min(2, 'Must be at least 2 characters')
  .max(100, 'Must be under 100 characters')
  .regex(NAME_REGEX, 'Only letters, spaces, and periods are allowed');

/**
 * STEP 1: Loan Type Selection & Basic Information
 * `formState` (already-known values from other steps) lets us apply the
 * age -> max tenure cross-step dependency (Step 2 DOB -> Step 1 tenure).
 */
export function getStep1Schema(formState = {}) {
  return z
    .object({
      loanType: z.enum([LOAN_TYPE.PERSONAL, LOAN_TYPE.HOME, LOAN_TYPE.BUSINESS], {
        errorMap: () => ({ message: 'Please select a loan type' }),
      }),
      loanAmount: z.coerce.number({ invalid_type_error: 'Loan amount is required' }),
      loanTenure: z.coerce.number({ invalid_type_error: 'Loan tenure is required' }),
      loanPurpose: z.string().min(1, 'Please select a loan purpose'),
      referralCode: z
        .string()
        .optional()
        .refine((v) => !v || REFERRAL_CODE_REGEX.test(v), {
          message: 'Referral code must be 6-10 alphanumeric characters',
        }),
    })
    .superRefine((data, ctx) => {
      const amountLimits = LOAN_AMOUNT_LIMITS[data.loanType];
      const tenureLimits = LOAN_TENURE_LIMITS[data.loanType];

      if (amountLimits && (data.loanAmount < amountLimits.min || data.loanAmount > amountLimits.max)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanAmount'],
          message: `Amount must be between \u20B9${amountLimits.min.toLocaleString('en-IN')} and \u20B9${amountLimits.max.toLocaleString('en-IN')}`,
        });
      }

      if (tenureLimits && (data.loanTenure < tenureLimits.min || data.loanTenure > tenureLimits.max)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanTenure'],
          message: `Tenure must be between ${tenureLimits.min} and ${tenureLimits.max} months for this loan type`,
        });
      }

      // Cross-step dependency: Step 2 DOB -> age + tenure must not exceed 65 years
      // Only validate if both tenure and dateOfBirth are present (avoid blocking on stale data)
      if (formState.dateOfBirth && data.loanTenure) {
        const age = calculateAge(formState.dateOfBirth);
        const tenureYears = data.loanTenure / 12;
        if (age !== null && age + tenureYears > 65) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['loanTenure'],
            message: `Your age (${age}) plus tenure exceeds 65 years. Please reduce tenure.`,
          });
        }
      }
    });
}

/**
 * STEP 2: Personal Information
 */
export const step2Schema = z
  .object({
    fullName: nameSchema,
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: 'Please select a gender' }) }),
    maritalStatus: z.string().min(1, 'Please select marital status'),
    fatherName: nameSchema,
    motherName: nameSchema,
    email: z.string().email('Please enter a valid email address'),
    mobileNumber: z.string().regex(MOBILE_REGEX, 'Mobile number must be 10 digits starting with 6-9'),
    alternateMobile: z
      .string()
      .optional()
      .refine((v) => !v || MOBILE_REGEX.test(v), 'Alternate mobile must be a valid 10-digit number'),
  })
  .superRefine((data, ctx) => {
    const age = calculateAge(data.dateOfBirth);
    if (age === null || age < 21 || age > 65) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dateOfBirth'],
        message: 'Applicant age must be between 21 and 65 years',
      });
    }
    if (data.alternateMobile && data.alternateMobile === data.mobileNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alternateMobile'],
        message: 'Alternate mobile must differ from primary mobile',
      });
    }
  });

/**
 * STEP 3: Identity Verification (KYC)
 */
export function getStep3Schema(formState = {}) {
  const allowedEntities = formState.loanType === LOAN_TYPE.BUSINESS ? ['P', 'C', 'F'] : ['P'];
  return z
    .object({
      panNumber: z
        .string()
        .refine((v) => isPanFormatValid(v), 'PAN must be 10 characters in format AAAAA9999A')
        .refine(
          (v) => !isPanFormatValid(v) || isPanEntityAllowed(v, allowedEntities),
          'PAN 4th character must indicate an accepted entity type (P for Individual, C for Company, F for Firm)',
        ),
      panVerified: z.boolean().optional(),
      aadhaarNumber: z.string().refine((v) => isAadhaarValid(v), 'Invalid Aadhaar number (checksum failed)'),
      aadhaarVerified: z.boolean().optional(),
      aadhaarConsent: z.literal(true, {
        errorMap: () => ({ message: 'You must provide consent to proceed' }),
      }),
      voterId: z
        .string()
        .optional()
        .refine((v) => !v || VOTER_ID_REGEX.test(v), 'Voter ID must be 3 letters followed by 7 digits'),
      passport: z
        .string()
        .optional()
        .refine((v) => !v || PASSPORT_REGEX.test(v), 'Passport must be 1 letter followed by 7 digits'),
    });
}

/**
 * STEP 4: Address Information
 */
const addressFieldsSchema = z.object({
  addressLine1: z.string().min(5, 'Address must be at least 5 characters').max(200),
  addressLine2: z.string().optional(),
  pinCode: z.string().regex(PIN_CODE_REGEX, 'PIN code must be 6 digits'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
});

export const step4Schema = z
  .object({
    current: addressFieldsSchema.extend({
      residenceType: z.enum(['owned', 'rented', 'company', 'family'], {
        errorMap: () => ({ message: 'Please select residence type' }),
      }),
      rentAmount: z.coerce.number().optional(),
      yearsAtAddress: z.coerce.number().min(0).max(50),
    }),
    sameAsPermanent: z.boolean(),
    permanent: addressFieldsSchema.partial().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.current.residenceType === 'rented' && (!data.current.rentAmount || data.current.rentAmount <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['current', 'rentAmount'],
        message: 'Rent amount is required for rented residences',
      });
    }
    if (!data.sameAsPermanent) {
      const p = data.permanent || {};
      if (!p.addressLine1 || p.addressLine1.length < 5) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['permanent', 'addressLine1'], message: 'Permanent address is required' });
      }
      if (!p.pinCode || !PIN_CODE_REGEX.test(p.pinCode)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['permanent', 'pinCode'], message: 'Valid permanent PIN code is required' });
      }
    }
  });

/**
 * STEP 5: Employment & Income Details (discriminated by employment type)
 */
export function getStep5Schema(formState = {}) {
  return z
    .object({
      employmentType: z.enum(
        [EMPLOYMENT_TYPE.SALARIED, EMPLOYMENT_TYPE.SELF_EMPLOYED, EMPLOYMENT_TYPE.BUSINESS_OWNER],
        { errorMap: () => ({ message: 'Please select employment type' }) },
      ),
      yearsOfExperience: z.coerce.number().min(0).max(50),
      // Salaried
      companyName: z.string().optional(),
      designation: z.string().optional(),
      monthlyNetSalary: z.coerce.number().optional(),
      // Self-Employed / Business Owner
      businessName: z.string().optional(),
      businessType: z.string().optional(),
      annualTurnover: z.coerce.number().optional(),
      yearsInBusiness: z.coerce.number().optional(),
      monthlyIncomeSelfEmployed: z.coerce.number().optional(),
      gstNumber: z.string().optional(),
      officeAddress: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (formState.loanType === LOAN_TYPE.BUSINESS && data.employmentType === EMPLOYMENT_TYPE.SALARIED) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['employmentType'],
          message: 'Business loans require Business Owner or Self-Employed status',
        });
      }

      if (data.employmentType === EMPLOYMENT_TYPE.SALARIED) {
        if (!data.companyName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['companyName'], message: 'Company name is required' });
        if (!data.designation) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['designation'], message: 'Designation is required' });
        if (!data.monthlyNetSalary || data.monthlyNetSalary < 15000) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyNetSalary'], message: 'Monthly net salary must be at least \u20B915,000' });
        }
      } else {
        if (!data.businessName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['businessName'], message: 'Business name is required' });
        if (!data.businessType) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['businessType'], message: 'Business type is required' });
        if (!data.annualTurnover || data.annualTurnover < 300000) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['annualTurnover'], message: 'Annual turnover must be at least \u20B93,00,000' });
        }
        if (!data.yearsInBusiness || data.yearsInBusiness < 2) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['yearsInBusiness'], message: 'Minimum 2 years in business required' });
        }
        if (data.employmentType === EMPLOYMENT_TYPE.SELF_EMPLOYED && !data.monthlyIncomeSelfEmployed) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyIncomeSelfEmployed'], message: 'Monthly income is required' });
        }
        if (data.employmentType === EMPLOYMENT_TYPE.BUSINESS_OWNER) {
          if (!data.gstNumber || !isGstFormatValid(data.gstNumber)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gstNumber'], message: 'Valid 15-character GST number is required' });
          }
        }
        if (!data.officeAddress) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['officeAddress'], message: 'Office/business address is required' });
        }
      }
    });
}

/**
 * STEP 6: Co-Applicant & Guarantor (conditional step)
 */
export const step6Schema = z.object({
  coApplicantName: nameSchema,
  relationship: z.enum(['spouse', 'parent', 'sibling', 'business_partner'], {
    errorMap: () => ({ message: 'Please select relationship' }),
  }),
  coApplicantPan: z.string().refine((v) => isPanFormatValid(v), 'PAN must be 10 characters in format AAAAA9999A'),
  coApplicantIncome: z.coerce.number().min(1, 'Co-applicant income is required'),
  coApplicantConsent: z.literal(true, {
    errorMap: () => ({ message: 'Co-applicant consent is required to proceed' }),
  }),
});

/**
 * STEP 7: Document Upload & E-Signature - validated at the component level
 * against the document checklist (see Step7Documents.jsx), since it depends
 * on File objects rather than plain form fields.
 */
export const step7Schema = z.object({
  signature: z.string().min(1, 'E-signature is required'),
});

/**
 * STEP 8: Review, Consent & Pre-Approval Summary
 */
export const step8Schema = z.object({
  consentAccurate: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  consentCreditCheck: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  consentTerms: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  consentCommunication: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
});

/**
 * Returns the appropriate Zod schema for a given step number, incorporating
 * cross-step dependencies from the aggregated form state.
 */
export function getSchemaForStep(stepNumber, formState) {
  switch (stepNumber) {
    case 1:
      return getStep1Schema(formState);
    case 2:
      return step2Schema;
    case 3:
      return getStep3Schema(formState);
    case 4:
      return step4Schema;
    case 5:
      return getStep5Schema(formState);
    case 6:
      return step6Schema;
    case 7:
      return step7Schema;
    case 8:
      return step8Schema;
    default:
      return z.object({});
  }
}
