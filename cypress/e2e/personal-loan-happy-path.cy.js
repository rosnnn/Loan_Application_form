describe('Personal Loan - Happy Path', () => {
  it('completes a full personal loan application end-to-end', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.visit('/');
      cy.fillStep1(data.step1);
      cy.fillStep2(data.step2);
      cy.fillStep3(data.step3);
      cy.fillStep4(data.step4);
      cy.fillStep5(data.step5);
      // Loan amount 3,00,000 is below the 5,00,000 co-applicant threshold for
      // Personal Loans, so Step 6 should be skipped entirely.
      cy.contains(/Document Upload/i).should('be.visible');
      cy.uploadAllDocuments();
      cy.signAndProceed();

      cy.contains(/Pre-Approval Summary/i).should('be.visible');
      cy.get('#consentAccurate').click({ force: true });
      cy.get('#consentCreditCheck').click({ force: true });
      cy.get('#consentTerms').click({ force: true });
      cy.get('#consentCommunication').click({ force: true });
      cy.contains('button', 'Submit Application').click();

      cy.contains(/Application Submitted/i).should('be.visible');
      cy.get('p.font-mono').invoke('text').should('match', /[0-9a-f-]{36}/);
    });
  });
});
