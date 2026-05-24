describe("GymTracker PWA", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("loads the page and shows the header", () => {
    cy.contains("h1", "GymProgress").should("be.visible");
  });

  it("switches tabs when clicking navigation", () => {
    cy.get(".nav-item").contains("Щоденник").click();
    cy.get(".logbook-tab-content.active").should("exist");
    cy.get(".nav-item").contains("Статистика").click();
    cy.get("#stats-section").should("be.visible");
    cy.get(".nav-item").contains("Плани").click();
    cy.get("#plans-section").should("be.visible");
  });

  it("opens and closes the timer modal", () => {
    cy.get("#header-timer-btn").click();
    cy.get("#timer-modal").should("be.visible");
    cy.get("#timer-modal .modal-close").click({ force: true });
    cy.get("#timer-modal").should("not.be.visible");
  });

  it("opens and closes the plate calculator modal", () => {
    cy.get(".btn-settings").click();
    cy.get("[data-action='plate']").click();
    cy.get("#plate-modal").should("be.visible");
    cy.get("#plate-modal .modal-close").click({ force: true });
    cy.get("#plate-modal").should("not.be.visible");
  });

  it("opens and closes settings modal", () => {
    cy.get(".btn-settings").click();
    cy.get("[data-action='settings']").click();
    cy.get("#settings-modal").should("be.visible");
    cy.get("#settings-modal .modal-close").click({ force: true });
    cy.get("#settings-modal").should("not.be.visible");
  });

  it("renders muscle groups on the exercises tab", () => {
    cy.get("#muscle-groups").children().should("have.length.at.least", 1);
  });

  it("logs a set and shows it in logbook", () => {
    cy.get("#muscle-groups .group-card").first().click();
    cy.get(".exercise-card").first().click();
    const w = cy.get("#log-weight").clear().type("50");
    const r = cy.get("#log-reps").clear().type("10");
    cy.get("#log-set-btn").click();
    cy.contains("50 кг × 10").should("be.visible");
  });
});