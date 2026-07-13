describe('Step 4 - PIN Code Lookup', () => {
  const reachStep4 = () => {
    cy.visit('/');
    cy.get('#loanType-personal').click({ force: true });
    cy.get('#loanAmount').type('300000');
    cy.get('#loanTenure').select('36');
    cy.get('#loanPurpose').select('Wedding');
    cy.contains('button', 'Next').click();
    cy.get('#fullName').type('Test User');
    cy.get('#dateOfBirth').type('1995-01-01');
    cy.get('#gender-male').click({ force: true });
    cy.get('#maritalStatus').select('Single');
    cy.get('#fatherName').type('Father Name');
    cy.get('#motherName').type('Mother Name');
    cy.get('#email').type('test@example.com');
    cy.get('#mobileNumber').type('9876543210');
    cy.contains('button', 'Next').click();
    cy.get('#panNumber').type('ABCPD1234E');
    cy.get('#panNumber').blur();
    cy.wait(1700);
    cy.get('#aadhaarNumber').type('234123412346');
    cy.get('#aadhaarNumber').blur();
    cy.wait(1700);
    cy.get('#aadhaarConsent').click({ force: true });
    cy.contains('button', 'Next').click();
  };

  it('auto-fills city and state when a valid PIN code is entered', () => {
    reachStep4();
    cy.get('#current\\.pinCode').type('560001');
    cy.get('#current\\.pinCode').blur();
    cy.wait(700);
    cy.get('#current\\.city').should('have.value', 'Bengaluru');
    cy.get('#current\\.state').should('have.value', 'Karnataka');
  });

  it('shows an error for a PIN code not found in the dataset', () => {
    reachStep4();
    cy.get('#current\\.pinCode').type('999999');
    cy.get('#current\\.pinCode').blur();
    cy.wait(700);
    cy.contains(/PIN code not found/i).should('be.visible');
  });
});
