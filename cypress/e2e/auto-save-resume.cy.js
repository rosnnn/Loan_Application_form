describe('Auto-Save & Resume', () => {
  it('saves an encrypted draft and offers to resume it after reload', () => {
    cy.visit('/');
    cy.window().then((win) => win.localStorage.clear());
    cy.reload();

    cy.get('#loanType-personal').click({ force: true });
    cy.get('#loanAmount').type('300000');
    cy.get('#loanTenure').select('36');
    cy.get('#loanPurpose').select('Wedding');
    cy.contains('button', 'Next').click();

    cy.get('#fullName').type('Resume Test User');
    cy.get('#dateOfBirth').type('1995-01-01');

    // Force an immediate save rather than waiting the full 30s interval,
    // by manipulating the clock forward.
    cy.window().then((win) => {
      win.dispatchEvent(new Event('input'));
    });
    cy.wait(31000);

    cy.window().then((win) => {
      const draftKey = 'lendswift_draft_personal';
      expect(win.localStorage.getItem(draftKey)).to.not.be.null;
    });

    cy.reload();
    cy.contains(/Resume Your Application/i).should('be.visible');
    cy.contains('button', 'Resume').click();
    cy.get('#fullName').should('have.value', 'Resume Test User');
  });

  it('discards the draft and starts fresh when the user chooses Start Fresh', () => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    cy.visit('/');
    cy.get('#loanType-home').click({ force: true });
    cy.get('#loanAmount').type('4500000');
    cy.contains('button', 'Next').click();
    cy.wait(31000);
    cy.reload();
    cy.contains(/Resume Your Application/i).should('be.visible');
    cy.contains('button', 'Start Fresh').click();
    cy.contains(/Loan Type & Basic Information/i).should('be.visible');
    cy.get('#loanAmount').should('not.exist');
  });
});
