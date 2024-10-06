describe('Assessment', () => {
  beforeEach(() => {
    cy.deleteAllButArs();
    cy.createAssessmentDemoEntities();
  });

  afterEach(() => {
    cy.deleteAllButArs();
  });

  it('create assessment', () => {
    const NAME = 'A1';
    const REGION = 'Lisbon';
    const NUMBER = '1';
    const DESCRIPTION = 'Same institution is enrolled and participates';
    const REVIEW = "Speed limit is too low, should be at least 150kmh";

    cy.demoVolunteerLogin()
    // intercept get activities
    cy.intercept('GET', '/activities').as('getActivities');

    // go to list of activities
    cy.get('[data-cy="volunteerActivities"]').click();
    cy.wait('@getActivities');

    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .should('have.length', 6)
        .eq(0)
        .children()
        .should('have.length', 10)

    // check columns
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(0).children().eq(0).should('contain', NAME)
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(0).children().eq(1).should('contain', REGION)
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(0).children().eq(2).should('contain', NUMBER)
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(0).children().eq(4).should('contain', DESCRIPTION);

    //check assess button existence
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(0).find('[data-cy="assessButton"]').should('exist');
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(1).find('[data-cy="assessButton"]').should('exist');
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(2).find('[data-cy="assessButton"]').should('not.exist');
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(3).find('[data-cy="assessButton"]').should('not.exist');
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(4).find('[data-cy="assessButton"]').should('not.exist');
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(5).find('[data-cy="assessButton"]').should('exist');

    //intercept create assessment request
    cy.intercept('POST', '/institutions/*/assessments').as('assess');

    //create
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(0).find('[data-cy="assessButton"]')
        .click();

    // fill form
    cy.get('[data-cy="reviewInput"]').type(REVIEW);
    // save form
    cy.get('[data-cy="saveButton"]').click()
    // check request was done
    cy.wait('@assess')
    // check results
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
      .should('have.length', 6)
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(0).find('[data-cy="assessButton"]').should('not.exist');
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(1).find('[data-cy="assessButton"]').should('not.exist');
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(2).find('[data-cy="assessButton"]').should('not.exist');
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(3).find('[data-cy="assessButton"]').should('not.exist');
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(4).find('[data-cy="assessButton"]').should('not.exist');
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(5).find('[data-cy="assessButton"]').should('exist');
    cy.logout();

    // Test as a member

    cy.demoMemberLogin();

    // intercept get institutions
    cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');
    cy.intercept('GET', '/institutions/*/assessments').as('getAssessments');

    // go to assessments table
    cy.get('[data-cy="institution"]').click();
    cy.get('[data-cy="assessments"]').click();

    cy.wait('@getInstitutions');
    cy.wait('@getAssessments');

    // wait for the table to load
    cy.get('[data-cy="institutionAssessmentsTable"] tbody tr').should('have.length', 1);

    // check the number of columns in the first row
    cy.get('[data-cy="institutionAssessmentsTable"] tbody tr').eq(0).as('firstRow');
    cy.get('@firstRow').children().should('have.length', 3);

    // check the columns in the first row
    cy.get('@firstRow').children().eq(0).should('contain', REVIEW);
    cy.logout();
  });
});
