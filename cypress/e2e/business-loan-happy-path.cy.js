describe('Business Loan - Happy Path', () => {
  it('completes a full business loan application with GST and business documents', () => {
    cy.fixture('valid-business-loan.json').then((data) => {
      cy.visit('/');
      cy.fillStep1(data.step1);
      cy.fillStep2(data.step2);
      cy.fillStep3(data.step3);
      cy.fillStep4(data.step4);
      cy.fillStep5(data.step5);

      // Business Loan of 25,00,000 exceeds the 20,00,000 threshold -> Step 6 required.
      cy.contains(/Co-Applicant/i).should('be.visible');
      cy.fillStep6(data.step6);

      cy.contains(/Document Upload/i).should('be.visible');
      cy.contains(/GST Returns/i).should('be.visible');
      cy.contains(/Business Registration/i).should('be.visible');
      cy.contains(/ITR/i).should('be.visible');
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
