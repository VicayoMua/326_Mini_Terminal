/*
* **************************************************************************************************************
*
*                                              START OF FILE
*
*             This file initializes the terminal window frame and all the terminal core services.
*
* **************************************************************************************************************
* */

function generateTerminalCore() {
    // Terminal Object
    const terminal = new window.Terminal({
        fontFamily: '"Fira Code", monospace',
        cursorBlink: true,
        allowProposedApi: true,
        theme: {
            foreground: '#f1f1f0',
            background: 'black',
            selection: '#97979b33',
            black: '#282a36',
            brightBlack: '#686868',
            red: '#ff5c57',
            brightRed: '#ff5c57',
            green: '#5af78e',
            brightGreen: '#5af78e',
            yellow: '#f3f99d',
            brightYellow: '#f3f99d',
            blue: '#57c7ff',
            brightBlue: '#57c7ff',
            magenta: '#ff6ac1',
            brightMagenta: '#ff6ac1',
            cyan: '#9aedfe',
            brightCyan: '#9aedfe',
            white: '#f1f1f0',
            brightWhite: '#eff0eb'
        },
    });
    const htmlElem_terminalContainer = document.getElementById('terminal-container');
    // Put Terminal Window to Webpage Container
    terminal.open(htmlElem_terminalContainer);

    // const isWebglEnabled = (() => {
    //     try {
    //         const webgl = new window.WebglAddon.WebglAddon(); // Load the WebGL Addon
    //         terminal.loadAddon(webgl); // Add the WebGL Addon to terminal frame
    //         return true;
    //     } catch (e) {
    //         console.warn('WebGL addon threw an exception during load', e);
    //         return false;
    //     }
    // })();

    // Enabled Fit Addons
    const isFitEnabled = (() => {
        try {
            const fitAddon = new window.FitAddon.FitAddon(); // Load the Fit Addon
            terminal.loadAddon(fitAddon); // Add the Fit Addon to terminal frame
            fitAddon.fit(); // Fit the terminal to the container
            return true;
        } catch (e) {
            console.warn('Fit addon threw an exception during load', e);
            return false;
        }
    })();

    // Create File System Root
    let fsRoot = { // FolderObject
        keyCheck: "TERMINAL FS ROOT",
        parentFolder: undefined, // FolderObject
        subfolders: {}, // subfolderName : folderObject
        files: {} // fileName : fileContents
    };
    fsRoot.parentFolder = fsRoot;

    let terminalFSDB = undefined;

    // Set Up <terminalFSDB> and try to restore old <fsRoot>
    (() => {
        // Open (or create) the IndexedDB database called "TerminalFSDB" with version 1
        const dbRequest = indexedDB.open("TerminalFSDB", 1);
        // Listen for the 'upgradeneeded' event to create the object store if necessary
        dbRequest.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create the object store "TerminalFSStore" with "id" as the key path, if it doesn't exist
            if (!db.objectStoreNames.contains("TerminalfSStore")) {
                db.createObjectStore("TerminalFSStore", {keyPath: "id"});
            }
        };
        dbRequest.onsuccess = (event) => {
            terminalFSDB = event.target.result;

            // Start a read-only transaction for the object store
            const store = terminalFSDB.transaction(["TerminalFSStore"], "readonly")
                .objectStore("TerminalFSStore");

            // Use the get() method to read the terminal file system
            const getRequest = store.get("terminal_file_system");

            // Listen for the success event for the get request
            getRequest.addEventListener("success", (event) => {
                const result = event.target.result; // result: {id: ..., data: ...}
                if (result !== undefined && result.data["keyCheck"] === "TERMINAL FS ROOT") {
                    fsRoot = result;
                    console.log(`Terminal file system restored successfully.`);
                }
            });
        };

        dbRequest.onerror = (event) => {
            alert(`generateTerminalCore: Error opening IndexedDB: ${event.target.error}.`);
        };
    })();

    // Tool to Create Folder Pointer (File Browser)
    function createTerminalFolderPointer() {
        let currentFolder = fsRoot;
        let currentFullPathStack = [];

        return {

            getContentListAsString: () => {
                let contents = '';
                const
                    folderNames = Object.keys(currentFolder.subfolders),
                    fileNames = Object.keys(currentFolder.files);
                if (folderNames.length > 0) {
                    contents += 'Folders:' + folderNames.reduce((acc, elem) =>
                        `${acc}\n            ${elem}`, '');
                }
                if (fileNames.length > 0) {
                    contents += 'Files:' + fileNames.reduce((acc, elem) =>
                        `${acc}\n            ${elem}`, '');
                }
                return contents.length === 0 ? 'No file or folder existing here...' : contents;
            },
            getSubfolderNames: () => {
                return Object.keys(currentFolder.subfolders);
            },
            getFileNames: () => {
                return Object.keys(currentFolder.files);
            },


            gotoRoot: () => {
                currentFolder = fsRoot;
                currentFullPathStack = [];
            },
            gotoSubfolder: (subfolderName) => {
                if (subfolderName.length === 0)
                    throw new Error(`Subfolder names cannot be empty strings`);
                if (currentFolder.subfolders[subfolderName] === undefined)
                    throw new Error(`Folder ${subfolderName} not found`);
                currentFolder = currentFolder.subfolders[subfolderName];
                currentFullPathStack.push(subfolderName);
            },
            gotoSubpath: (subpath) => {
                if (subpath.length === 0)
                    throw new Error(`Subpaths cannot be empty strings`);
                let is_first_time = true;
                for (const subfolderName of subpath.split('/')) {
                    if (subfolderName.length === 0 && !is_first_time)
                        throw new Error(`Subfolder names cannot be empty strings`);
                    if (currentFolder.subfolders[subfolderName] === undefined)
                        throw new Error(`Folder ${subfolderName} not found`);
                    currentFolder = currentFolder.subfolders[subfolderName];
                    currentFullPathStack.push(subfolderName);
                    is_first_time = false;
                }
            },
            gotoParentFolder: () => {
                currentFolder = currentFolder.parentFolder;
                currentFullPathStack.pop();
            },
            getFullPath: () => currentFullPathStack.length === 0 ? '/' :
                currentFullPathStack.reduce((acc, elem) => `${acc}/${elem}`, ''),


            getFile: (fileName) => {
                if (currentFolder.files[fileName] === undefined)
                    throw new Error(`File ${fileName} not found`);
                return currentFolder.files[fileName];
            },
            changeFile: (fileName, newContent) => {
                currentFolder.files[fileName] = newContent;
            },
            renameExistingFile: (oldFileName, newFileName) => {
                if (currentFolder.files[oldFileName] === undefined)
                    throw new Error(`File ${oldFileName} not found`);
                if (currentFolder.files[newFileName] !== undefined)
                    throw new Error(`File ${newFileName} already exists`);
                currentFolder.files[newFileName] = currentFolder.files[oldFileName];
                delete currentFolder.files[oldFileName];
            },
            deleteFile: (fileName) => {
                if (currentFolder.files[fileName] === undefined)
                    throw new Error(`File ${fileName} not found.`);
                delete currentFolder.files[fileName];
            },


            createSubfolder: (newSubfolderName) => {
                if (currentFolder.subfolders[newSubfolderName] !== undefined)
                    throw new Error(`Folder ${newSubfolderName} already exists`);
                currentFolder.subfolders[newSubfolderName] = {
                    parentFolder: currentFolder,
                    subfolders: {},
                    files: {}
                };
            },
            renameExistingSubfolder: (oldSubfolderName, newSubfolderName) => {
                if (currentFolder.subfolders[oldSubfolderName] === undefined)
                    throw new Error(`Folder ${oldSubfolderName} not found`);
                if (currentFolder.subfolders[newSubfolderName] !== undefined)
                    throw new Error(`Folder ${newSubfolderName} already exists`);
                currentFolder.subfolders[newSubfolderName] = currentFolder.subfolders[oldSubfolderName];
                delete currentFolder.subfolders[oldSubfolderName];
            },
            deleteSubfolder: (subfolderName) => {
                if (currentFolder.subfolders[subfolderName] === undefined)
                    throw new Error(`Folder ${subfolderName} not found`);
                delete currentFolder.subfolders[subfolderName]; // doable because of auto-garbage-collection
            },

        };
    }

    // Create Terminal Global Folder Pointer Object
    const currentTerminalFolderPointer = createTerminalFolderPointer();

    // Create Terminal Log Array
    let terminalLog = [];

    // Initialize Supported Commands
    const supportedCommands = {
        // Built-in Command
        hello: {
            executable: (_) => {
                terminal.write("Hello World!");
                terminalLog.push("Hello World!");
            },
            description: 'Say "Hello World!"'
        },

        // A lot of other commands are going to be added in the future (in other .js files)!
    };

    // Initialize Command Handling
    const commandHandler = (() => {
        let commandBuffer = []; // command buffer: char[]

        return {
            addChar: (newChar) => { // returns void
                commandBuffer.push(newChar);
            },
            removeChar: () => { // returns whether the last char is successfully removed
                if (commandBuffer.length > 0) {
                    commandBuffer.pop();
                    return true;
                }
                return false;
            },
            execute: () => { // returns [status_code, command_name]
                if (commandBuffer.length === 0) return [1, '']; // Error: (Empty) Command is not supported.

                let index = 0;

                function parsingHelper() { // returns string
                    let block = '';
                    while (index < commandBuffer.length && commandBuffer[index] === ` `)
                        index++;
                    if (commandBuffer[index] === `"` || commandBuffer[index] === `'`) {
                        const quoteIndex = index++;
                        let quoteNotClosed = true;
                        while (index < commandBuffer.length) {
                            if (commandBuffer[index] === commandBuffer[quoteIndex]) {
                                index++;
                                quoteNotClosed = false;
                                break;
                            }
                            block += commandBuffer[index++];
                        }
                        if (quoteNotClosed)
                            block = commandBuffer[quoteIndex] + block;
                    } else {
                        while (index < commandBuffer.length) {
                            if (commandBuffer[index] === ` `) {
                                index++;
                                break;
                            }
                            block += commandBuffer[index++];
                        }
                    }
                    return block;
                }

                const
                    commandName = parsingHelper(),
                    commandParameters = [];
                while (index < commandBuffer.length) {
                    const param = parsingHelper();
                    if (param.length > 0) commandParameters.push(param);
                }
                if (supportedCommands[commandName] === undefined) return [1, commandName]; // Error: Command is not supported.
                try {
                    supportedCommands[commandName].executable(commandParameters);
                    return [0, commandName]; // Success!
                } catch (e) { // e is alerted as a pop-up!!!
                    alert(`generateTerminalCore: commandHandler: ${e}.`);
                    return [2, commandName]; // Error: Command exists but throws exceptions.
                }
            },
            clear: () => { // returns void
                commandBuffer = [];
            }
        }
    })();

    // Initialize Current Keyboard Listener
    let currentTerminalKeyboardListener = undefined;

    // Set New Keyboard Listener
    function setNewTerminalKeyboardListener(keyboard_listening_callback) {
        if (currentTerminalKeyboardListener !== undefined)
            currentTerminalKeyboardListener.dispose();
        currentTerminalKeyboardListener = terminal.onData(keyboard_listening_callback);
    }

    // Initialize Default Terminal Window's Listening to Keyboard Input
    const defaultTerminalKeyboardListeningCallback =
        (s) => {
            for (const char of s) {
                switch (char) {
                    // case '\x1b[A': { // Up arrow
                    //     break;
                    // }
                    // case '\x1b[B': { // Down arrow
                    //     break;
                    // }
                    // case '\x1b[C': { // Right arrow
                    //     break;
                    // }
                    // case '\x1b[D': { // Left arrow
                    //     break;
                    // }
                    case '\u0003': { // Ctrl+C
                        commandHandler.clear();
                        terminal.write('^C\n\n\r $ ');
                        terminalLog.push('^C\n\n $ ');
                        break;
                    }
                    case '\u000C': { // Ctrl+L
                        commandHandler.clear();
                        terminal.write(`\x1b[2J\x1b[H $ `);
                        terminalLog.push(' $ ');
                        break;
                    }
                    case '\r': { // Enter
                        terminal.write('\n\r   ');
                        terminalLog.push('\n   ');
                        {
                            const [statusCode, commandName] = commandHandler.execute();
                            switch (statusCode) {
                                case 1: {
                                    terminal.write(`${commandName}: command not found`);
                                    terminalLog.push(`${commandName}: command not found`);
                                    break;
                                }
                                case 2: {
                                    terminal.write(`${commandName}: command failed due to uncaught errors`);
                                    terminalLog.push(`${commandName}: command failed due to uncaught errors`);
                                    break;
                                }
                                default: {
                                }
                            }
                        }
                        commandHandler.clear();
                        terminal.write('\n\n\r $ ');
                        terminalLog.push('\n\n $ ');
                        break;
                    }
                    case '\u007F': { // Backspace
                        const success = commandHandler.removeChar();
                        if (success) {
                            terminal.write('\b \b');
                            terminalLog.pop(); // because commandHandler.removeChar() is success!!
                        }
                        break;
                    }
                    default: { // Other keys
                        if (char >= String.fromCharCode(0x20) && char <= String.fromCharCode(0x7E) || char >= '\u00a0') {
                            commandHandler.addChar(char);
                            terminal.write(char);
                            terminalLog.push(char);
                        }
                    }
                }
            }
        };
    setNewTerminalKeyboardListener(defaultTerminalKeyboardListeningCallback);

    // Initialize Terminal Window Display
    terminal.write(` $ `);
    terminalLog.push(` $ `);

    // Finish Setting Up The Terminal Environment!!!
    return {
        /*
        *  Terminal Output Ports
        * */
        printToWindow: (sentence, if_print_raw_to_window, if_print_to_log) => { // (string, boolean, boolean) => void
            if (if_print_to_log)
                terminalLog.push(sentence);
            if (if_print_raw_to_window) {
                terminal.write(sentence); // leave <sentence> as it was
            } else {
                terminal.write(sentence.replaceAll('\n', '\n\r   ')); // replace all '\n' in <sentence> with '\n\r   '
            }
        },

        /*
        *  Terminal Keyboard Listener Controllers
        * */
        setDefaultKeyboardListener: () => { // returns void
            setNewTerminalKeyboardListener(defaultTerminalKeyboardListeningCallback);
        },
        setNewKeyboardListener: (keyboard_listening_callback) => { // returns void
            setNewTerminalKeyboardListener(keyboard_listening_callback);
        },
        getCurrentKeyboardListener: () => currentTerminalKeyboardListener,

        /*
        *  Terminal Status/Content Getters
        * */
        // getIsFitEnabled: () => isFitEnabled,
        // getCurrentLogAsString: () => terminalLog.reduce((acc, elem) => acc + elem, ''),

        /*
        *  Terminal File System Ports
        * */
        getCurrentFolderPointer: () => currentTerminalFolderPointer,
        getNewFolderPointer: () => createTerminalFolderPointer(),

        /*
        *  Terminal Command Controllers
        * */
        getSupportedCommands: () => supportedCommands,

        /*
        *  Terminal Built-in Button Ports
        * */
        button_to_save_terminal_file_system_to_indexDB: () => {
            if (terminalFSDB === undefined) {
                alert(`generateTerminalCore: button_to_save_terminal_file_system_to_indexDB: Error for undefined terminalFSDB.`);
                return;
            }

            // Start a read-write transaction for the object store
            const store = terminalFSDB.transaction(["TerminalFSStore"], "readwrite")
                .objectStore("TerminalFSStore");

            // Use the put() method to insert or update the terminal file system
            const putRequest = store.put({
                id: "terminal_file_system",
                data: fsRoot
            });

            // Listen for the success event for the put request
            putRequest.addEventListener("success", () => {
                console.log(`Terminal file system saved successfully.`);
            });

            // Listen for errors during the put operation
            putRequest.addEventListener("error", event => {
                alert(`generateTerminalCore: button_to_save_terminal_file_system_to_indexDB: Error saving terminal file system: ${event.target.error}.`);
            });
        },
        button_to_download_terminal_log: () => {
            const current_log = terminalLog.reduce((acc, elem) => acc + elem, '');
            const url = URL.createObjectURL(new Blob([current_log], {type: 'text/plain'}));
            const date = new Date();
            const link = document.createElement('a');
            link.href = url;
            link.download = `terminal_log @ ${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`; // the filename the user will get
            link.click();
            URL.revokeObjectURL(url);
        },
        button_to_import_filesystem_json: () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;  // user cancelled
                const reader = new FileReader();
                reader.onload = (evt) => {
                    try {
                        // TODO 2: Use the JSON file to restore the terminal file system.
                        const fsObj = JSON.parse(evt.target.result);
                        const folderPointer = terminalCore.getNewFolderPointer();

                    } catch (e) {
                        alert(`generateTerminalCore: button_to_import_filesystem_json: Error converting JSON: ${e}.`);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        },
        button_to_export_filesystem_json: () => {
            const fsJSON = JSON.stringify(terminalCore.get);
        },

        /*
        *  Other Dangerous Ports, better not to Release!!!
        * */
        // getXTermObject: () => terminal, // avoid using this for a maintainable code structure and better performance!!!
    };
}
