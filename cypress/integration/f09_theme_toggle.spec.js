/// <reference types="cypress" />

describe("F-09: Light/Dark Theme", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.window().then(win => {
            win.localStorage.removeItem("todoTheme");
        });
    });

    it("➔ Klick auf #themeToggle schaltet Theme und speichert in localStorage", () => {
        // Default: body hat beim ersten Laden sofort light
        cy.get("body").should("have.attr", "data-theme", "light");

        // Klick → dark
        cy.get("#themeToggle").click();
        cy.get("body").should("have.attr", "data-theme", "dark");
        cy.window().its("localStorage.todoTheme").should("equal", "dark");

        // Klick → zurück auf light
        cy.get("#themeToggle").click();
        cy.get("body").should("have.attr", "data-theme", "light");
        cy.window().its("localStorage.todoTheme").should("equal", "light");
    });

    it("➔ Lädt dunkles Theme, wenn localStorage vorher auf ‚dark‘ gesetzt ist", () => {
        cy.window().then(win => {
            win.localStorage.setItem("todoTheme", "dark");
        });
        cy.visit("/");
        cy.get("body").should("have.attr", "data-theme", "dark");
    });

    it("➔ Fällt ohne localStorage und ohne prefers-color zurück auf light", () => {
        // wir simulieren hier absichtlich keine prefers-media, also bleibt default light
        cy.visit("/");
        cy.get("body").should("have.attr", "data-theme", "light");
    });
});
