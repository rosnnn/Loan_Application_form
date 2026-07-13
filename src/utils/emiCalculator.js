export const INTEREST_RATES = {
  personal: 10.5,
  home: 8.5,
  business: 14,
};

/**
 * Standard reducing-balance EMI formula:
 * EMI = P x r x (1+r)^n / ((1+r)^n - 1)
 * where r = monthly interest rate (annual / 12 / 100)
 */
export function calculateEMI(principal, annualRate, tenureMonths) {
  if (!principal || !tenureMonths) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / tenureMonths;
  const factor = (1 + r) ** tenureMonths;
  const emi = (principal * r * factor) / (factor - 1);
  return Math.round(emi);
}

export function calculateTotalCostOfBorrowing(emi, tenureMonths, principal) {
  return Math.round(emi * tenureMonths - principal);
}

export function calculateProcessingFee(loanAmount) {
  const fee = loanAmount * 0.01;
  return Math.round(Math.min(Math.max(fee, 2000), 25000));
}

export function getInterestRate(loanType) {
  return INTEREST_RATES[loanType] || INTEREST_RATES.personal;
}

export function calculateEmiToIncomeRatio(emi, monthlyIncome) {
  if (!monthlyIncome) return 0;
  return (emi / monthlyIncome) * 100;
}
