/// <reference types="Cypress" />

const endPoint = "https://juice-shop.herokuapp.com/api/Feedbacks/";

describe("Customer FeedBack Form", function () {
  beforeEach(() => {
    cy.visit("https://juice-shop.herokuapp.com/#/");
    cy.get("#mat-dialog-0", { timeout: 10000 })
      .should("be.visible")
      .within(() => {
        cy.contains("Welcome to OWASP Juice Shop!").should("be.visible");
        cy.get(".close-dialog").click();
      });

    cy.contains("a", "Me want it!").should("be.visible").click();
    cy.get("button[aria-label='Open Sidenav']")
      .click()
      .then(() => {
        cy.get("h2").contains("OWASP Juice Shop").should("be.visible");
        cy.get("a[aria-label='Go to contact us page']")
          .click()
          .then(() => {
            cy.url().should("include", "/contact");
            cy.get(".mat-card.mat-focus-indicator")
              .should("be.visible")
              .find("h1")
              .should("have.text", "Customer Feedback");
          });
      });
  });

  it("validate form", function () {
    cy.get(".mat-form-field-label").should(
      "have.text",
      "AuthorComment *Result *"
    );
    cy.get("#mat-input-1").should("be.disabled");
    cy.get("#comment")
      .click()
      .then(() => {
        const maxLength = 160;
        const input = "110010101101011111000110001101101100010100111011101011001000111100010110011101001100101011010111110001100011011011000101001110111010110010001111000101100111010011";
        cy.wait(3000);
        cy.get("#captchaControl").click();
        cy.get("#mat-error-0")
          .should("be.visible")
          .and("have.text", "Please provide a comment. ")
          .and("have.css", "color", "rgb(255, 87, 34)");

        cy.wait(3000);

        cy.get("#comment")
          .should("have.attr", "maxlength", maxLength.toString())
          .and("have.attr", "required");
        cy.get("#comment").click().type(input.substring(0, maxLength));
        cy.get("#mat-hint-0")
          .should("be.visible")
          .and("have.text", "Max. 160 characters")
          .and("have.css", "color", "rgba(255, 255, 255, 0.7)");
        cy.get("#mat-hint-1").should("be.visible").and("have.text", "160/160");
      });

    cy.setRating();

    cy.get("#rating").should("have.attr", "aria-valuetext", "3★");

    cy.get("#captchaControl").click();
    cy.get("#comment").click();
    cy.wait(3000);

    cy.get("#mat-error-1")
      .should("be.visible")
      .and("have.text", "Please enter the result of the CAPTCHA. ")
      .and("have.css", "color", "rgb(255, 87, 34)");

    cy.wait(3000);

    cy.get("#captchaControl")
      .as("captcha")
      .should("have.attr", "type", "text")
      .then(($captcha) => {
        cy.wrap($captcha)
          .clear()
          .type("aa")
          .then(() => {
            cy.contains("Invalid CAPTCHA code");
          });
        cy.wrap($captcha)
          .clear()
          .type("12.5")
          .then(() => {
            cy.contains("Invalid CAPTCHA code");
          });
        cy.wrap($captcha)
          .clear()
          .type("-3")
          .then(() => {
            cy.get($captcha).should(
              "have.css",
              "caret-color",
              "rgb(104, 159, 56)"
            );
          });
        cy.wrap($captcha)
          .clear()
          .type("3")
          .then(() => {
            cy.get($captcha).should(
              "have.css",
              "caret-color",
              "rgb(104, 159, 56)"
            );
          });
      });
  });

  it("validate request", () => {
    cy.get("#comment").click().type("comment");
    cy.setRating();
    cy.calculateCaptcha();
    cy.intercept("POST", endPoint).as("feedBacks");
    cy.get("#submitButton")
      .contains("Submit")
      .should("be.visible")
      .click()
      .wait("@feedBacks")
      .then((interception) => {
        const { response } = interception;
        expect(response.statusCode).to.equal(201);
        expect(response.headers["content-type"]).to.include("application/json", "charset=utf-8");
        console.log(response.body);
        expect(response.body.data.comment).to.equal("comment (anonymous)");
        expect(response.body.data.rating).to.equal(3);
        expect(response.body.data.UserId).to.equal(null);
      });

    cy.wait(3000);
    cy.get('#comment').click().type('comment');
    cy.setRating();
    cy.get('#captchaControl').type('0');
    cy.intercept('POST', endPoint).as('feedbacks');
    cy.get('#submitButton').click();
    cy.wait('@feedbacks').then((interception) => {
      const { response } = interception;
      //console.log(response.body)
      expect(response.statusCode).to.equal(401);
      expect(response.body).to.equal('Wrong answer to CAPTCHA. Please try again.');
    });

    cy.wait(3000);
    cy.get("#userId")
      .as("userInput")
      .invoke("removeAttr", "hidden")
      .should("not.have.attr", "hidden");
    cy.get("@userInput").focus().type(1).blur();
    cy.get("#comment").click().type("user 1");
    cy.setRating();
    cy.calculateCaptcha();
    cy.intercept("POST", endPoint).as("feedbacks");
    cy.get("#submitButton").click();
    cy.wait("@feedbacks").then((interception) => {
      const { response } = interception;
      expect(response.body.data.comment).to.equal("commentuser 1 (anonymous)");
      expect(response.body.data.rating).to.equal(3);
      //console.log(response.body)
      expect(response.body.data.UserId).to.equal(1);
    });
  });
});
