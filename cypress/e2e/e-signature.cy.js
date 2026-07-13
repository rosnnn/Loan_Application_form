describe('E-Signature Capture', () => {
  const goToStep7 = (data) => {
    cy.visit('/');
    cy.fillStep1(data.step1);
    cy.fillStep2(data.step2);
    cy.fillStep3(data.step3);
    cy.fillStep4(data.step4);
    cy.fillStep5(data.step5);
  };

  it('draws a signature and shows it captured, then verifies it in the Step 8 review', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      goToStep7(data);
      cy.uploadAllDocuments();
      cy.get('canvas.signature-canvas').then(($canvas) => {
        const canvas = $canvas[0];
        const rect = canvas.getBoundingClientRect();
        cy.wrap($canvas)
          .trigger('mousedown', { clientX: rect.left + 20, clientY: rect.top + 20, force: true })
          .trigger('mousemove', { clientX: rect.left + 120, clientY: rect.top + 70, force: true })
          .trigger('mouseup', { force: true });
      });
      cy.contains(/Signature captured/i).should('be.visible');
      cy.contains('button', 'Next').click();
      cy.contains(/Your Signature/i).should('be.visible');
      cy.get('img[alt="Captured e-signature"]').should('be.visible');
    });
  });

  it('shows a validation error and prevents progress when the signature is cleared', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      goToStep7(data);
      cy.uploadAllDocuments();
      cy.get('canvas.signature-canvas').then(($canvas) => {
        const canvas = $canvas[0];
        const rect = canvas.getBoundingClientRect();
        cy.wrap($canvas)
          .trigger('mousedown', { clientX: rect.left + 20, clientY: rect.top + 20, force: true })
          .trigger('mousemove', { clientX: rect.left + 120, clientY: rect.top + 70, force: true })
          .trigger('mouseup', { force: true });
      });
      cy.contains('button', 'Clear').click();
      cy.contains('button', 'Next').click();
      cy.contains(/provide your e-signature/i).should('be.visible');
    });
  });
});
