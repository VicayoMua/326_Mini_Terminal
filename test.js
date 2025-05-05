/*
* **************************************************************************************************************
*
*                                           START OF MY JS FILE
*
* **************************************************************************************************************
* */

async function ds() {
    const l = [1];
    for (let i = 0; i < 10000000000; i++) {
        l[0] = i;
    }
    console.log("finish inside");
    return l;
}

function does(){
    (async () => {
        const r = await ds();
        console.log("finish outside");
    })();
}

does();

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


/*
        *  Terminal Built-in Button Ports
        * */
// button_to_save_terminal_file_system_to_indexDB: () => {
//     if (terminalFSDB === undefined) {
//         alert(`generateTerminalCore: button_to_save_terminal_file_system_to_indexDB: Error for undefined terminalFSDB.`);
//         return;
//     }
//
//     // Start a read-write transaction for the object store
//     const store = terminalFSDB.transaction(["TerminalFSStore"], "readwrite")
//         .objectStore("TerminalFSStore");
//
//     // Use the put() method to insert or update the xtermObj file system
//     const putRequest = store.put({
//         id: "terminal_file_system",
//         data: fsRoot
//     });
//
//     // Listen for the success event for the put request
//     putRequest.addEventListener("success", () => {
//         alert(`Terminal file system saved successfully.`);
//     });
//
//     // Listen for errors during the put operation
//     putRequest.addEventListener("error", event => {
//         alert(`generateTerminalCore: button_to_save_terminal_file_system_to_indexDB: Error saving terminal file system: ${event.target.error}.`);
//     });
// },
// button_to_download_terminal_log: () => {
//     const
//         full_current_log = terminalLog.reduce((acc, elem) => acc + elem, ''),
//         url = URL.createObjectURL(new Blob([full_current_log], {type: 'text/plain'})),
//         date = new Date(),
//         link = document.createElement('a');
//     link.href = url;
//     link.download = `terminal_log @ ${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`; // the filename the user will get
//     link.click();
//     URL.revokeObjectURL(url);
// },
// button_to_add_local_file: () => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = '';
//     input.onchange = (event) => {
//         const file = event.target.files[0];
//         if (!file) return;   // user hit “cancel”
//         const reader = new FileReader();
//         reader.onload = (evt) => {
//             const
//                 fileContent = evt.target.result,  // the file’s text content
//                 date = new Date();
//             let
//                 filename = file.name;
//             if (currentTerminalFolderPointer.haveFile(filename))
//                 filename = `${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}_${filename}`;
//             currentTerminalFolderPointer.changeFileContent(filename, fileContent);
//             xtermObj.write(`[Button:] Successfully added file "${filename}" to the current directory.\n\n\r $ `);
//             terminalLog.push(`[Button:] Successfully added file "${filename}" to the current directory.\n\n $ `);
//         };
//         reader.onerror = (error) => {
//             alert(`generateTerminalCore: button_to_add_local_file: error reading the file "${file.name}", ${error}.`);
//         };
//         reader.readAsText(file);
//     };
//     input.click();
// },
// button_to_import_filesystem_json: () => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = 'application/json';
//     input.onchange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;  // user cancelled
//         const reader = new FileReader();
//         reader.onload = (evt) => {
//             try {
//                 // TODO: Use the JSON file to restore the xtermObj file system.
//                 const fsObj = JSON.parse(evt.target.result);
//
//             } catch (error) {
//                 alert(`generateTerminalCore: button_to_import_filesystem_json: Error importing filesystem: ${error}.`);
//             }
//         };
//         reader.readAsText(file);
//     };
//     input.click();
// },
// button_to_export_filesystem_json: () => {
//     try {
//         const fsJSON = JSON.stringify(fsRoot);
//         const url = URL.createObjectURL(new Blob([fsJSON], {type: 'text/plain'}));
//         const date = new Date();
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `terminal_log @ ${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`; // the filename the user will get
//         link.click();
//         URL.revokeObjectURL(url);
//     } catch (error) {
//         alert(`generateTerminalCore: button_to_export_filesystem_json: Error exporting filesystem: ${error}.`);
//     }
// },