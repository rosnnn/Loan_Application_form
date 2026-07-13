describe('Step 5 - Employment Type Switching', () => {
  const reachStep5 = () => {
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
    cy.get('#current\\.addressLine1').type('123 Main Street');
    cy.get('#current\\.pinCode').type('560001');
    cy.get('#current\\.pinCode').blur();
    cy.wait(700);
    cy.get('#current\\.residenceType').select('owned');
    cy.get('#current\\.yearsAtAddress').type('5');
    cy.contains('button', 'Next').click();
  };

  it('shows salaried fields for Salaried and switches to business fields for Business Owner', () => {
    reachStep5();
    cy.get('#employmentType-salaried').click({ force: true });
    cy.get('#companyName').should('be.visible');
    cy.get('#monthlyNetSalary').should('be.visible');
    cy.get('#businessName').should('not.exist');

    cy.get('#employmentType-business_owner').click({ force: true });
    cy.get('#businessName').should('be.visible');
    cy.get('#gstNumber').should('be.visible');
    cy.get('#companyName').should('not.exist');
  });

  it('shows self-employed income field but no GST field for Self-Employed', () => {
    reachStep5();
    cy.get('#employmentType-self_employed').click({ force: true });
    cy.get('#businessName').should('be.visible');
    cy.get('#monthlyIncomeSelfEmployed').should('be.visible');
    cy.get('#gstNumber').should('not.exist');
  });
});
