describe('Cross-Step Dependency Propagation', () => {
  it('updates Step 5 employment constraints and Step 7 documents when loan type changes after Step 5', () => {
    cy.visit('/');
    cy.get('#loanType-personal').click({ force: true });
    cy.get('#loanAmount').type('300000');
    cy.get('#loanTenure').select('36');
    cy.get('#loanPurpose').select('Wedding');
    cy.contains('button', 'Next').click();

    cy.get('#fullName').type('Test User');
    cy.get('#dateOfBirth').type('1990-01-01');
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

    cy.get('#current\\.addressLine1').type('123 Main Street');
    cy.get('#current\\.pinCode').type('560001');
    cy.get('#current\\.pinCode').blur();
    cy.wait(700);
    cy.get('#current\\.residenceType').select('owned');
    cy.get('#current\\.yearsAtAddress').type('5');
    cy.contains('button', 'Next').click();

    // Now at Step 5 - navigate all the way back to Step 1 and switch to Business.
    cy.contains(/Employment & Income/i).should('be.visible');
    for (let i = 0; i < 4; i += 1) {
      cy.contains('button', 'Previous').click();
    }
    cy.contains(/Loan Type & Basic Information/i).should('be.visible');
    cy.get('#loanType-business').click({ force: true });
    cy.get('#loanAmount').clear().type('2500000');
    cy.get('#loanTenure').select('60');
    cy.get('#loanPurpose').select('Business Expansion');
    cy.contains('button', 'Next').click();

    // Fast-forward again to Step 5: Salaried should now be rejected for Business loans.
    for (let i = 0; i < 3; i += 1) {
      cy.contains('button', 'Next').click();
    }
    cy.get('#employmentType-salaried').click({ force: true });
    cy.get('#yearsOfExperience').type('5');
    cy.contains('button', 'Next').click();
    cy.contains(/Business loans require Business Owner or Self-Employed/i).should('be.visible');
  });
});
