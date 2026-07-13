describe('Home Loan - Happy Path', () => {
  it('completes a full home loan application including the mandatory co-applicant step', () => {
    cy.fixture('valid-home-loan.json').then((data) => {
      cy.visit('/');
      cy.fillStep1(data.step1);
      cy.fillStep2(data.step2);
      cy.fillStep3(data.step3);
      cy.fillStep4(data.step4);
      cy.fillStep5(data.step5);

      // Home Loans always require a co-applicant step (Section B2/B3).
      cy.contains(/Co-Applicant/i).should('be.visible');
      cy.fillStep6(data.step6);

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
    });
  });
});
