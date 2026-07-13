// Custom Cypress commands - one helper per wizard step to keep specs concise.

Cypress.Commands.add('fillStep1', (data) => {
  cy.get(`#loanType-${data.loanType}`).click({ force: true });
  cy.get('#loanAmount').clear().type(data.loanAmount);
  cy.get('#loanTenure').select(String(Number(data.loanTenure)));
  cy.get('#loanPurpose').select(data.loanPurpose);
  if (data.referralCode) cy.get('#referralCode').type(data.referralCode);
  cy.contains('button', 'Next').click();
});

Cypress.Commands.add('fillStep2', (data) => {
  cy.get('#fullName').clear().type(data.fullName);
  cy.get('#dateOfBirth').clear().type(data.dateOfBirth);
  cy.get(`#gender-${data.gender}`).click({ force: true });
  cy.get('#maritalStatus').select(data.maritalStatus);
  cy.get('#fatherName').clear().type(data.fatherName);
  cy.get('#motherName').clear().type(data.motherName);
  cy.get('#email').clear().type(data.email);
  cy.get('#mobileNumber').clear().type(data.mobileNumber);
  if (data.alternateMobile) cy.get('#alternateMobile').type(data.alternateMobile);
  cy.contains('button', 'Next').click();
});

Cypress.Commands.add('fillStep3', (data) => {
  cy.get('#panNumber').clear().type(data.panNumber);
  cy.get('#panNumber').blur();
  cy.wait(1700);
  cy.get('#aadhaarNumber').clear().type(data.aadhaarNumber);
  cy.get('#aadhaarNumber').blur();
  cy.wait(1700);
  cy.get('#aadhaarConsent').click({ force: true });
  if (data.voterId) cy.get('#voterId').type(data.voterId);
  cy.contains('button', 'Next').click();
});

Cypress.Commands.add('fillStep4', (data) => {
  cy.get('#current\\.addressLine1').clear().type(data.addressLine1);
  if (data.addressLine2) cy.get('#current\\.addressLine2').type(data.addressLine2);
  cy.get('#current\\.pinCode').clear().type(data.pinCode);
  cy.get('#current\\.pinCode').blur();
  cy.wait(700);
  cy.get('#current\\.residenceType').select(data.residenceType);
  if (data.residenceType === 'rented' && data.rentAmount) {
    cy.get('#rentAmount').clear().type(data.rentAmount);
  }
  cy.get('#current\\.yearsAtAddress').clear().type(data.yearsAtAddress);
  cy.contains('button', 'Next').click();
});

Cypress.Commands.add('fillStep5', (data) => {
  cy.get(`#employmentType-${data.employmentType}`).click({ force: true });
  cy.get('#yearsOfExperience').clear().type(data.yearsOfExperience);
  if (data.employmentType === 'salaried') {
    cy.get('#companyName').clear().type(data.companyName);
    cy.get('#designation').clear().type(data.designation);
    cy.get('#monthlyNetSalary').clear().type(data.monthlyNetSalary);
  } else {
    cy.get('#businessName').clear().type(data.businessName);
    cy.get('#businessType').select(data.businessType);
    cy.get('#annualTurnover').clear().type(data.annualTurnover);
    cy.get('#yearsInBusiness').clear().type(data.yearsInBusiness);
    if (data.employmentType === 'self_employed' && data.monthlyIncomeSelfEmployed) {
      cy.get('#monthlyIncomeSelfEmployed').clear().type(data.monthlyIncomeSelfEmployed);
    }
    if (data.employmentType === 'business_owner') {
      cy.get('#gstNumber').clear().type(data.gstNumber);
    }
    cy.get('#officeAddress').clear().type(data.officeAddress);
  }
  cy.contains('button', 'Next').click();
});

Cypress.Commands.add('fillStep6', (data) => {
  cy.get('#coApplicantName').clear().type(data.coApplicantName);
  cy.get('#relationship').select(data.relationship);
  cy.get('#coApplicantPan').clear().type(data.coApplicantPan);
  cy.get('#coApplicantIncome').clear().type(data.coApplicantIncome);
  cy.get('#coApplicantConsent').click({ force: true });
  cy.contains('button', 'Next').click();
});

Cypress.Commands.add('uploadAllDocuments', () => {
  cy.get('input[type="file"]').each(($input) => {
    const isPdfDoc = !/photograph/i.test($input.attr('id') || '');
    cy.wrap($input).selectFile(
      isPdfDoc ? 'cypress/fixtures/sample-document.pdf' : 'cypress/fixtures/sample-photo.png',
      { force: true },
    );
  });
});

Cypress.Commands.add('signAndProceed', () => {
  cy.get('canvas.signature-canvas').then(($canvas) => {
    const canvas = $canvas[0];
    const rect = canvas.getBoundingClientRect();
    cy.wrap($canvas)
      .trigger('mousedown', { clientX: rect.left + 20, clientY: rect.top + 20, force: true })
      .trigger('mousemove', { clientX: rect.left + 100, clientY: rect.top + 60, force: true })
      .trigger('mouseup', { force: true });
  });
  cy.contains('button', 'Next').click();
});
