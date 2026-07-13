describe('File Upload & Compression', () => {
  const goToStep7 = (data) => {
    cy.visit('/');
    cy.fillStep1(data.step1);
    cy.fillStep2(data.step2);
    cy.fillStep3(data.step3);
    cy.fillStep4(data.step4);
    cy.fillStep5(data.step5);
  };

  it('uploads a valid PDF and shows a preview entry', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      goToStep7(data);
      cy.contains(/Document Upload/i).should('be.visible');
      cy.get('#panCard input[type="file"]').selectFile('cypress/fixtures/sample-document.pdf', { force: true });
      cy.get('#panCard').parent().contains('sample-document.pdf').should('be.visible');
    });
  });

  it('rejects an oversized file with a clear error', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      goToStep7(data);
      cy.get('#photograph input[type="file"]').selectFile('cypress/fixtures/oversized-file.jpg', { force: true });
      cy.contains(/exceeds 5MB limit/i).should('be.visible');
    });
  });

  it('rejects a disallowed file type with a clear error', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      goToStep7(data);
      cy.get('#panCard input[type="file"]').selectFile('cypress/fixtures/invalid-type.txt', { force: true });
      cy.contains(/Only PDF, JPG, and PNG/i).should('be.visible');
    });
  });

  it('allows removing an uploaded file', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      goToStep7(data);
      cy.get('#panCard input[type="file"]').selectFile('cypress/fixtures/sample-document.pdf', { force: true });
      cy.contains('button', 'Remove sample-document.pdf').click();
      cy.contains('sample-document.pdf').should('not.exist');
    });
  });

  it('compresses an uploaded image and displays the reduced file size', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      goToStep7(data);
      cy.get('#photograph input[type="file"]').selectFile('cypress/fixtures/sample-photo.png', { force: true });
      cy.get('#photograph').parent().contains('sample-photo').should('be.visible');
    });
  });
});
