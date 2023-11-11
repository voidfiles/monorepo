describe("Play Creation", () => {
  it("should allow user to draw an offensive player", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#to-offense-player-mode").click();
    cy.get("body").click(200, 200);
    cy.compareSnapshot("offensePlayer drawn", 0.2);
  });

  it("should allow user to draw a defense player", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#to-defense-player-mode").click();
    cy.get("body").click(200, 200);
    cy.compareSnapshot("defense player drawn", 0.2);
  });

  it("Should allow a path for an offense player", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#to-offense-player-mode").click();
    cy.get("body").click(200, 200);
    cy.get("#to-line-mode").click();
    cy.get("body").click(200, 200);
    cy.get("body").click(400, 400);
    cy.get("body").click(200, 500);
    cy.get("body").type("{esc}");
    cy.compareSnapshot("offense player wpath", 0.2);
  });

  it("it should allow a zoom", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#zoom-in").click();
    cy.get("#zoom-in").click();
    cy.compareSnapshot("zoomed in", 0.2);
    cy.get("#zoom-out").click();
    cy.get("#zoom-out").click();
    cy.compareSnapshot("zoomed out", 0.2);
  });

  it("it should show help", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#help").click();
    cy.compareSnapshot("help shown", 0.2);
  });

  it("it should open nav", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#open-state-nav").click();
    cy.compareSnapshot("nav open", 0.2);
  });

  it("pans", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#zoom-in").click();
    cy.get("#zoom-out").click();
    cy.get("body").trigger("mousedown", 50, 50);
    cy.compareSnapshot("panning1", 0.2);
    cy.get("body").trigger("mousemove", 100, 100);
    cy.compareSnapshot("panning2", 0.2);
    cy.get("body").trigger("mousemove", 400, 400);
    cy.get("body").trigger("mouseup");
    cy.compareSnapshot("panning3", 0.2);
  });

  it("Should allow for animation", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#to-offense-player-mode").click();
    cy.get("body").click(100, 100);
    cy.get("#to-defense-player-mode").click();
    cy.get("body").click(100, 200);
    cy.get("#to-line-mode").click();
    cy.get("body").click(100, 100);
    cy.get("body").click(400, 400);
    cy.get("body").click(200, 500);
    cy.get("body").type("{esc}");
    cy.get("#add-frame").click();
    cy.compareSnapshot("animated1", 0.2);
    cy.get("body").trigger("mousedown", 100, 200);
    cy.get("body").trigger("mousemove", 400, 200);
    cy.get("body").trigger("mouseup");
    cy.get("#frame-0").click();
    cy.compareSnapshot("animated2", 0.2);
    cy.get("#frame-1").click();
    cy.compareSnapshot("animated3", 0.2);
  });
});
