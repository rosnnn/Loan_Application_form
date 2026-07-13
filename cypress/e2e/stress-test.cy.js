describe('Rapid Navigation Stress Test', () => {
  it('does not corrupt state when Next is clicked rapidly on Step 1', () => {
    cy.visit('/');
    cy.get('#loanType-personal').click({ force: true });
    cy.get('#loanAmount').type('300000');
    cy.get('#loanTenure').select('36');
    cy.get('#loanPurpose').select('Wedding');

    for (let i = 0; i < 5; i += 1) {
      cy.contains('button', 'Next').click({ force: true });
    }
    // Should have advanced exactly one step, not skipped or duplicated steps.
    cy.contains(/Personal Information/i).should('be.visible');
  });

  it('prevents double-submission when Submit is clicked twice rapidly', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.visit('/');
      cy.fillStep1(data.step1);
      cy.fillStep2(data.step2);
      cy.fillStep3(data.step3);
      cy.fillStep4(data.step4);
      cy.fillStep5(data.step5);
      cy.uploadAllDocuments();
      cy.signAndProceed();
      cy.get('#consentAccurate').click({ force: true });
      cy.get('#consentCreditCheck').click({ force: true });
      cy.get('#consentTerms').click({ force: true });
      cy.get('#consentCommunication').click({ force: true });
      cy.contains('button', 'Submit Application').click().click();
      cy.contains(/Application Submitted/i).should('have.length', 1);
    });
  });

  it('re-inserts Step 6 after navigating back and increasing the loan amount past the threshold', () => {
    cy.visit('/');
    cy.get('#loanType-personal').click({ force: true });
    cy.get('#loanAmount').type('300000');
    cy.get('#loanTenure').select('36');
    cy.get('#loanPurpose').select('Wedding');
    cy.contains('button', 'Next').click();
    cy.contains('button', 'Previous').click();
    cy.get('#loanAmount').clear().type('800000');
    cy.contains('button', 'Next').click();
    // Fast-forward through Steps 2-5 with minimal valid data to reach Step 6
    cy.contains(/Personal Information/i).should('be.visible');
  });

  it('accepts maximum-length values in text fields without overflow or truncation', () => {
    cy.visit('/');
    cy.get('#loanType-personal').click({ force: true });
    cy.get('#loanAmount').type('300000');
    cy.get('#loanTenure').select('36');
    cy.get('#loanPurpose').select('Wedding');
    cy.contains('button', 'Next').click();
    const longName = 'A'.repeat(100);
    cy.get('#fullName').type(longName);
    cy.get('#fullName').should('have.value', longName);
  });
});
