// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("setRating", () => {
    cy.get("#rating")
      .should("have.attr", "min", "1")
      .should("have.attr", "max", "5")
      .invoke("val", "5")
      .click({ force: true })
      .trigger("input", { bubbles: true });
  });

  Cypress.Commands.add("calculateCaptcha",()=>{
    cy.get('#captcha').then(($val)=>{
        let captchaText = $val.text()
        cy.log(captchaText)
        const result = eval(captchaText)
        cy.log(result)
        cy.get('#captchaControl').type(result)
    })
})
