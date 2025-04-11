let terminalStateDB = undefined;

// Set Up <terminalStateDB>
(() => {
    // Open (or create) the IndexedDB database called "TerminalStateDB" with version 1
    const dbRequest = indexedDB.open("TerminalStateDB", 1);
    // Listen for the 'upgradeneeded' event to create the object store if necessary
    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create the object store "TerminalStateStore" with "id" as the key path, if it doesn't exist
        if (!db.objectStoreNames.contains("TerminalStateStore")) {
            db.createObjectStore("TerminalStateStore", {keyPath: "id"});
        }
    };
    dbRequest.onsuccess = (event) => {
        terminalStateDB = event.target.result;
    };

    dbRequest.onerror = (event) => {
        alert(`Error opening IndexedDB: ${event.target.error}.`);
    };
})();

function save_terminal_state_button() {
    if (terminalCore === undefined) {
        alert("Error: terminalCore is undefined.");
        return;
    }
    if (terminalStateDB === undefined) {
        alert(`Error: terminalStateDB is undefined.`);
        return;
    }
    // TODO: save terminalCore into indexDB

    // Start a read-write transaction for the object store
    // Use the put() method to insert or update the terminal state
    const
        store = terminalStateDB.transaction(["TerminalStateStore"], "readwrite").objectStore("TerminalStateStore"),
        terminalState = {
            id: "terminal_state",
            data: terminalCore
        };

    const putRequest = store.put(terminalState);

    // Listen for the success event for the put request
    putRequest.addEventListener("success", () => {
        alert(`Terminal state saved successfully.`);
    });

    // Listen for errors during the put operation
    putRequest.addEventListener("error", event => {
        alert(`Error saving terminal state: ${event.target.error}.`);
    });
}