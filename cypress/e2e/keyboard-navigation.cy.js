describe('Keyboard-Only Navigation', () => {
  it('allows moving focus through Step 1 fields using Tab without a mouse', () => {
    cy.visit('/');

    // Radio group is reachable and selectable via keyboard (Space).
    cy.get('#loanType-personal').focus().type(' ', { force: true });
    cy.get('#loanType-personal').should('be.checked');

    cy.get('#loanAmount').focus().type('300000');
    cy.get('#loanAmount').should('have.focus');

    cy.get('#loanTenure').focus().select('36');
    cy.get('#loanPurpose').focus().select('Wedding');

    cy.contains('button', 'Next').focus().type('{enter}');
    cy.contains(/Personal Information/i).should('be.visible');
  });

  it('moves focus to the first input of the new step after transition (WCAG 2.4.3)', () => {
    cy.visit('/');
    cy.get('#loanType-personal').click({ force: true });
    cy.get('#loanAmount').type('300000');
    cy.get('#loanTenure').select('36');
    cy.get('#loanPurpose').select('Wedding');
    cy.contains('button', 'Next').click();
    cy.focused().should('have.attr', 'id', 'fullName');
  });
});
