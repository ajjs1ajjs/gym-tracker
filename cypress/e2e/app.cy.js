describe("GymTracker PWA", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/index.html");
  });

  it("loads the page and shows the header", () => {
    cy.contains("h1", "GymProgress").should("be.visible");
  });

  it("switches tabs when clicking navigation", () => {
    cy.get(".nav-item").contains("Журнал").click();
    cy.get("#logbook-section").should("be.visible");
    cy.get(".nav-item").contains("Історія").click();
    cy.get("#history-section").should("be.visible");
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
    cy.get("[data-action='plate']").click({ force: true });
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
    cy.get(".muscle-group").should("have.length.at.least", 1);
  });

  it("filters exercises by muscle group", () => {
    cy.get(".muscle-group").first().click();
    cy.get(".exercise-card").should("have.length.at.least", 1);
    cy.get(".muscle-group.active").should("have.length", 1);
  });

  it("searches exercises by name", () => {
    cy.get("#exercise-search").type("жим");
    cy.get(".exercise-card").should("have.length.at.least", 1);
  });

  it("toggles exercise completion on click", () => {
    cy.get(".exercise-card").first().as("firstCard");
    cy.get("@firstCard").find(".check-btn").click();
    cy.get("@firstCard").should("have.class", "completed");
  });

  it("opens exercise detail modal", () => {
    cy.get(".exercise-card").first().click({ multiple: true });
    cy.get(".modal").should("be.visible");
    cy.get(".modal-content h2").should("be.visible");
    cy.get(".modal-close").first().click({ force: true });
    cy.get(".modal").should("not.be.visible");
  });

  it("creates a workout plan", () => {
    cy.get(".nav-item").contains("Плани").click();
    cy.get("#plans-section").should("be.visible");
    cy.get("[data-action='add-plan']").click();

    cy.get("#plan-modal").should("be.visible");
    cy.get("#plan-name").type("Тестовий план");
    cy.get("#plan-modal .btn-save-plan").click();
    cy.get(".plan-card").should("have.length.at.least", 1);
  });

  it("completes the full workout flow: toggle exercise + finish", () => {
    cy.get(".exercise-card").eq(0).find(".check-btn").click();
    cy.get(".exercise-card").eq(1).find(".check-btn").click();

    cy.get("#finish-workout-btn").click({ force: true });

    cy.get(".nav-item").contains("Історія").click();
    cy.get("#history-section").should("be.visible");
  });

  it("adds body weight entry", () => {
    cy.get(".nav-item").contains("Тіло").click();
    cy.get("#body-section").should("be.visible");
    cy.get("#body-weight-input").type("80");
    cy.get("[data-action='save-body-weight']").click();
    cy.get("#body-history-list").should("be.visible");
  });

  it("logs water intake", () => {
    cy.get(".nav-item").contains("Тіло").click();
    cy.get("#body-section").should("be.visible");
    cy.get(".btn-water-add").first().click();
    cy.get("#water-progress-bar").should("be.visible");
  });

  it("selects timer preset", () => {
    cy.get("#header-timer-btn").click();
    cy.get("#timer-modal").should("be.visible");
    cy.get(".timer-preset").eq(2).click();
    cy.get(".timer-preset.active").should("have.length", 1);
  });

  it("calculates plates", () => {
    cy.get(".btn-settings").click();
    cy.get("[data-action='plate']").click({ force: true });
    cy.get("#plate-weight-input").clear().type("100");
    cy.wait(500);
    cy.get("#plate-visualizer .barbell").should("be.visible");
  });

  it("shows exercise image in detail modal", () => {
    cy.get(".exercise-card").first().click({ multiple: true });
    cy.get(".modal").should("be.visible");
    cy.get("#modal-image").should("be.visible");
  });

  it("switches between dark and light theme", () => {
    cy.get(".btn-settings").click();
    cy.get("[data-action='settings']").click();
    cy.get("#settings-modal .modal-close").click({ force: true });
    cy.get("#theme-toggle").click();
    cy.get("body").should("have.class", "light-theme");
  });

  it("navigates to logbook tab and shows log entry form", () => {
    cy.get(".nav-item").contains("Журнал").click();
    cy.get("#logbook-section").should("be.visible");
    cy.get("#logbook-ex-select").should("be.visible");
  });
});
