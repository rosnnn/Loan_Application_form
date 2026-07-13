describe('Step 6 - Conditional Visibility', () => {
  it('shows the Co-Applicant step for Home Loans regardless of amount', () => {
    cy.visit('/');
    cy.get('#loanType-home').click({ force: true });
    cy.get('#loanAmount').type('600000');
    cy.get('#loanTenure').select('120');
    cy.get('#loanPurpose').select('New Home Purchase');
    cy.contains('button', 'Next').click();
    cy.contains(/Personal Information/i).should('be.visible');
    // Full visibility verified in home-loan-happy-path.cy.js; here we assert
    // the step registry marks Home Loan as always requiring Step 6, matching
    // the progress bar's total step count.
    cy.contains(/Step 1 of 8/i).should('be.visible');
  });

  it('does not show the Co-Applicant step for a small Personal Loan under the threshold', () => {
    cy.visit('/');
    cy.get('#loanType-personal').click({ force: true });
    cy.get('#loanAmount').type('200000');
    cy.get('#loanTenure').select('24');
    cy.get('#loanPurpose').select('Travel');
    cy.contains('button', 'Next').click();
    cy.contains(/Step 1 of 7/i).should('be.visible');
  });
});
