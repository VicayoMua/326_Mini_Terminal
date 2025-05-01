/*
* **************************************************************************************************************
*
*                                           START OF MY JS FILE
*
* **************************************************************************************************************
* */




// // Set Up <terminalFSDB> and try to restore old <fsRoot>
// let terminalFSDB = undefined;
// (() => {
//     // Open (or create) the IndexedDB database called "TerminalFSDB" with version 1
//     const dbRequest = indexedDB.open("TerminalFSDB", 1);
//     // Listen for the 'upgradeneeded' event to create the object store if necessary
//     dbRequest.onupgradeneeded = (event) => {
//         const db = event.target.result;
//         // Create the object store "TerminalFSStore" with "id" as the key path, if it doesn't exist
//         if (!db.objectStoreNames.contains("TerminalfSStore")) {
//             db.createObjectStore("TerminalFSStore", {keyPath: "id"});
//         }
//     };
//     dbRequest.onsuccess = (event) => {
//         terminalFSDB = event.target.result;
//
//         // Start a read-only transaction for the object store
//         const store = terminalFSDB.transaction(["TerminalFSStore"], "readonly")
//             .objectStore("TerminalFSStore");
//
//         // Use the get() method to read the xtermObj file system
//         const getRequest = store.get("terminal_file_system");
//
//         // Listen for the success event for the get request
//         getRequest.addEventListener("success", (event) => {
//             const result = event.target.result; // result: {id: ..., data: ...}
//             if (result !== undefined && result.data["keyCheck"] === "TERMINAL FS ROOT") {
//                 fsRoot = result;
//                 console.log(`Terminal file system restored successfully.`);
//             }
//         });
//     };
//
//     dbRequest.onerror = (event) => {
//         alert(`generateTerminalCore: Error opening IndexedDB: ${event.target.error}.`);
//     };
// })();