describe("F-01: Aufgabe anlegen", () => {
    beforeEach(() => {
        // 1) App starten
        cy.visit("/");
        // 2) localStorage leeren
        cy.window().then(win => win.localStorage.removeItem("todoTasks"));
    });

    it("➔ #addTaskBtn ist disabled, wenn #taskInput leer ist", () => {
        cy.get("#taskInput").should("have.value", "");
        cy.get("#addTaskBtn").should("be.disabled");
    });

    it("➔ #addTaskBtn wird aktiv, sobald Text eingegeben wird", () => {
        cy.get("#taskInput").type("Meine erste Aufgabe");
        cy.get("#addTaskBtn").should("not.be.disabled");
    });

    it("➔ Aufgabe erscheint in #taskList und in localStorage", () => {
        const text = "Test-Task";
        cy.get("#taskInput").type(text);
        cy.get("#addTaskBtn").click();

        // Check: Existiert genau eine li in #taskList mit diesem Text?
        cy.get("#taskList li .task-text")
            .should("have.length", 1)
            .and("contain.text", text);

        // Check: localStorage["todoTasks"] enthält genau 1 Element mit text="Test-Task" und isDone=false
        cy.window().then(win => {
            const tasks = JSON.parse(win.localStorage.getItem("todoTasks"));
            expect(tasks).to.have.length(1);
            expect(tasks[0].text).to.equal(text);
            expect(tasks[0].isDone).to.be.false;
            expect(tasks[0]).to.have.property("createdAt");
            expect(tasks[0].priority).to.equal("medium"); // default selection
        });
    });

    it("➔ #taskInput akzeptiert maximal 200 Zeichen", () => {
        const longText = "a".repeat(250);
        cy.get("#taskInput").type(longText).invoke("val").should("have.length", 200);
    });
});
