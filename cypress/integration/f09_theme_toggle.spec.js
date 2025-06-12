describe("F-09: Light/Dark Theme", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.window().then(win => {
            win.localStorage.removeItem("todoTheme");
        });
    });

    it("➔ Klick auf #themeToggle schaltet Theme und speichert in localStorage", () => {
        // Standard: kein theme vermutlich "dark"
        cy.get("html").should("not.have.attr", "data-theme", "light");

        // Klick → light
        cy.get("#themeToggle").click();
        cy.get("html").should("have.attr", "data-theme", "light");
        cy.window().its("localStorage.todoTheme").should("equal", "light");

        // Klick → zurück auf dark
        cy.get("#themeToggle").click();
        cy.get("html").should("have.attr", "data-theme", "dark");
        cy.window().its("localStorage.todoTheme").should("equal", "dark");
    });

    it("➔ Lädt dunkles Theme, wenn localStorage vorher auf ‚dark‘ gesetzt ist", () => {
        cy.window().then(win => {
            win.localStorage.setItem("todoTheme", "dark");
        });
        cy.visit("/");
        cy.get("html").should("have.attr", "data-theme", "dark");
    });

    it("➔ Nutzt prefers-color-scheme, wenn kein localStorage-Eintrag existiert", () => {
        // Simuliere prefers-color-scheme: dark
        cy.visit("/", {
            onBeforeLoad(win) {
                Object.defineProperty(win, "matchMedia", {
                    value: query => ({
                        matches: query.includes("dark"),
                        media: query,
                        addListener: () => {},
                        removeListener: () => {}
                    })
                });
            }
        });
        cy.get("html").should("have.attr", "data-theme", "dark");
    });
});
