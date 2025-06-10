describe("F-04: Aufgabe wiederherstellen", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.window().then(win => win.localStorage.removeItem("todoTasks"));

        // Seed: Ein erledigter Task
        const task = {
            id: "done-restore-1",
            text: "Aufgabe zum Wiederherstellen",
            priority: "low",
            createdAt: new Date().toISOString(),
            doneAt: new Date().toISOString(),
            isDone: true,
            order: 0
        };
        cy.window().then(win => {
            win.localStorage.setItem("todoTasks", JSON.stringify([task]));
        });

        cy.visit("/");
        // einmal zur Erledigt-View wechseln
        cy.get('a[href="#/done"]').click();
    });

    it("➔ In der Erledigt-Ansicht hat jeder Task einen Wiederherstellen-Button", () => {
        cy.get("#doneList li").should("have.length", 1);
        cy.get("#doneList li button").should("have.length", 1);
    });

    it("➔ Nach Klick auf ‚Wiederherstellen‘ landet der Task wieder in offener Liste", () => {
        // Klick auf restore-Button
        cy.get("#doneList li button").click();

        // zurück zur offenen View
        cy.get('a[href="#/"]').click();
        cy.get("#taskList li .task-text").should("contain.text", "Aufgabe zum Wiederherstellen");

        // localStorage prüfen: isDone=false, doneAt=null
        cy.window().then(win => {
            const tasks = JSON.parse(win.localStorage.getItem("todoTasks"));
            expect(tasks[0].isDone).to.be.false;
            expect(tasks[0].doneAt).to.be.null;
        });
    });
});

