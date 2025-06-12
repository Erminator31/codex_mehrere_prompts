describe("F-03: Erledigt-Ansicht", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.window().then(win => win.localStorage.removeItem("todoTasks"));

        // Seed: Drei erledigte Tasks mit unterschiedlichen doneAt-Zeitpunkten
        const now = Date.now();
        const tasks = [
            {
                id: "done-1",
                text: "Alte Aufgabe",
                priority: "low",
                createdAt: new Date(now - 1000000).toISOString(),
                doneAt: new Date(now - 50000).toISOString(),
                isDone: true,
                order: 0
            },
            {
                id: "done-2",
                text: "Mittlere Aufgabe",
                priority: "medium",
                createdAt: new Date(now - 2000000).toISOString(),
                doneAt: new Date(now - 100000).toISOString(),
                isDone: true,
                order: 1
            },
            {
                id: "done-3",
                text: "Neue Aufgabe",
                priority: "high",
                createdAt: new Date(now - 500000).toISOString(),
                doneAt: new Date(now - 10000).toISOString(),
                isDone: true,
                order: 2
            }
        ];
        cy.window().then(win => {
            win.localStorage.setItem("todoTasks", JSON.stringify(tasks));
        });

        cy.visit("/");
        // Navigation: Klick auf "Erledigt" (href="#/done")
        cy.get('a[href="#/done"]').click();
    });

    it("➔ URL enthält #/done und Liste zeigt genau 3 erledigte Tasks", () => {
        cy.url().should("include", "#/done");
        cy.get("#taskList li").should("have.length", 3);
    });

    it("➔ Jeder li hat .text, .small (erstellt+erledigt) und einen Wiederherstellen-Button", () => {
        cy.get("#taskList li").each($li => {
            cy.wrap($li).find(".text").should("exist");
            cy.wrap($li).find(".small").should("exist");
            cy.wrap($li).find("button").should("exist").and("contain.text", "Wiederherstellen");
        });
    });

    it("➔ Sortierung nach doneAt descending funktioniert (neuestes zuerst)", () => {
        // Das erste Element in der Liste sollte "Neue Aufgabe" sein
        cy.get("#taskList li").first().within(() => {
            cy.get(".text").should("contain.text", "Neue Aufgabe");
        });
    });
});
