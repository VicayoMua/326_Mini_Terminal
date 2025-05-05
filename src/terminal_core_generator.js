/*
* **************************************************************************************************************
*
*                                              START OF FILE
*
*             This file initializes the terminal window frame and all the terminal core services.
*
* **************************************************************************************************************
* */

const
    isLegalKeyNameInFileSystem = (() => {
        const reg = /^(?!\.{1,2}$)[^\/\0]{1,255}$/;
        return (x) => reg.test(x);
    })(),
    isLegalPathNameInFileSystem = (() => {
        const reg = /^(?!\.{1,2}$)[^\0]{1,255}$/;
        return (x) => reg.test(x);
    })();

function generateRootDirectory() {
    const fsRoot = { // FolderObject
        keyCheck: "TERMINAL FS ROOT",
        parentFolder: null, // FolderObject
        subfolders: {}, // subfolderName : folderObject
        files: {} // fileName : fileContents
    };
    fsRoot.parentFolder = fsRoot;
    return fsRoot;
}

class TerminalFolderPointer {
    #fsRoot;
    #currentFolder;
    #currentFullPathStack;

    constructor(fsRoot, currentFolder = fsRoot, currentFullPathStack = []) {
        this.#fsRoot = fsRoot;
        this.#currentFolder = currentFolder;
        this.#currentFullPathStack = currentFullPathStack;
    }

    /*
    *  Duplication
    * */
    duplicate() {
        return new TerminalFolderPointer(
            this.#currentFolder, // shallow copy of pointer
            this.#currentFullPathStack.map(x => x) // deep copy of array of strings
        )
    }

    /*
    *  Directory Information Getters
    * */
    getContentListAsString() {
        let contents = '';
        const
            folderNames = Object.keys(this.#currentFolder.subfolders),
            fileNames = Object.keys(this.#currentFolder.files);
        if (folderNames.length > 0) {
            contents += 'Folders:' + folderNames.reduce((acc, elem) =>
                `${acc}\n            ${elem}`, '');
        }
        if (folderNames.length > 0 && fileNames.length > 0)
            contents += '\n';
        if (fileNames.length > 0) {
            contents += 'Files:' + fileNames.reduce((acc, elem) =>
                `${acc}\n            ${elem}`, '');
        }
        return contents.length === 0 ? 'No file or folder existing here...' : contents;
    }

    getFullPath() {
        return this.#currentFullPathStack.length === 0 ? '/' :
            this.#currentFullPathStack.reduce((acc, elem) => `${acc}/${elem}`, '');
    }

    getSubfolderNames() {
        return Object.keys(this.#currentFolder.subfolders);
    }

    getFileNames() {
        return Object.keys(this.#currentFolder.files);
    }

    haveFile(fileName) {
        return (isLegalKeyNameInFileSystem(fileName) && this.#currentFolder.files[fileName] !== undefined);
    }

    haveSubfolder(subfolderName) {
        return (isLegalKeyNameInFileSystem(subfolderName) && this.#currentFolder.subfolders[subfolderName] !== undefined);
    }

    /*
    *  Directory Pointer Controllers
    * */
    gotoRoot() {
        this.#currentFolder = this.#fsRoot;
        this.#currentFullPathStack = [];
    }

    gotoSubfolder(subfolderName) {
        if (!isLegalKeyNameInFileSystem(subfolderName))
            throw new Error(`Subfolder name is illegal`);
        if (this.#currentFolder.subfolders[subfolderName] === undefined)
            throw new Error(`Folder ${subfolderName} not found`);
        this.#currentFolder = this.#currentFolder.subfolders[subfolderName];
        this.#currentFullPathStack.push(subfolderName);
    }

    gotoSubpath(subpath) {
        // NOTE: `./` is not allowed!!!
        if (!isLegalPathNameInFileSystem(subpath) || subpath[0] === "/")
            throw new Error(`Subpath name is illegal`);
        // Temporary Update
        let temp_currentFolder = this.#currentFolder;
        const subfolderNames = subpath.split('/');
        for (const subfolderName of subfolderNames) {
            if (!isLegalKeyNameInFileSystem(subfolderName))
                throw new Error(`Subpath name is illegal`);
            if (temp_currentFolder.subfolders[subfolderName] === undefined)
                throw new Error(`Folder ${subfolderName} not found`);
            temp_currentFolder = temp_currentFolder.subfolders[subfolderName];
        }
        // Apply Long-term Update
        this.#currentFolder = temp_currentFolder;
        for (const subfolderName of subfolderNames)
            this.#currentFullPathStack.push(subfolderName);
    }

    gotoPathFromRoot(path) {
        // NOTE: `/` is not allowed!!!
        if (!isLegalPathNameInFileSystem(path) || path[0] === "/")
            throw new Error(`Subpath name is illegal`);
        // Temporary Update
        let temp_currentFolder = this.#fsRoot;
        const subfolderNames = path.split('/');
        for (const subfolderName of subfolderNames) {
            if (!isLegalKeyNameInFileSystem(subfolderName))
                throw new Error(`Subpath name is illegal`);
            if (temp_currentFolder.subfolders[subfolderName] === undefined)
                throw new Error(`Folder ${subfolderName} not found`);
            temp_currentFolder = temp_currentFolder.subfolders[subfolderName];
        }
        // Apply Long-term Update
        this.#currentFolder = temp_currentFolder;
        this.#currentFullPathStack = subfolderNames;
    }

    gotoParentFolder() {
        this.#currentFolder = this.#currentFolder.parentFolder;
        this.#currentFullPathStack.pop();
    }

    /*
    *  Directory File Controllers
    * */
    getFileContent(fileName) {
        if (!isLegalKeyNameInFileSystem(fileName))
            throw new Error(`File name is illegal`);
        if (this.#currentFolder.files[fileName] === undefined)
            throw new Error(`File ${fileName} not found`);
        return this.#currentFolder.files[fileName];
    }

    changeFileContent(fileName, newContent) {
        if (!isLegalKeyNameInFileSystem(fileName))
            throw new Error(`File name is illegal`);
        this.#currentFolder.files[fileName] = newContent;
    }

    createNewFile(fileName) {
        if (!isLegalKeyNameInFileSystem(fileName))
            throw new Error(`File name is illegal`);
        if (this.#currentFolder.files[fileName] !== undefined)
            throw new Error(`File ${fileName} is already existing`);
        this.#currentFolder.files[fileName] = "";
    }

    renameExistingFile(oldFileName, newFileName) {
        if (!isLegalKeyNameInFileSystem(oldFileName) || !isLegalKeyNameInFileSystem(newFileName))
            throw new Error(`File name is illegal`);
        if (this.#currentFolder.files[oldFileName] === undefined)
            throw new Error(`File ${oldFileName} not found`);
        if (this.#currentFolder.files[newFileName] !== undefined)
            throw new Error(`File ${newFileName} already exists`);
        this.#currentFolder.files[newFileName] = this.#currentFolder.files[oldFileName];
        delete this.#currentFolder.files[oldFileName];
    }

    deleteFile(fileName) {
        if (!isLegalKeyNameInFileSystem(fileName))
            throw new Error(`File name is illegal`);
        if (this.#currentFolder.files[fileName] === undefined)
            throw new Error(`File ${fileName} not found.`);
        delete this.#currentFolder.files[fileName];
    }

    /*
    *  Directory Subfolder Controllers
    * */
    createSubfolder(newSubfolderName, gotoNewFolder = false) {
        if (!isLegalKeyNameInFileSystem(newSubfolderName))
            throw new Error(`Subfolder name is illegal`);
        if (this.#currentFolder.subfolders[newSubfolderName] !== undefined)
            throw new Error(`Folder ${newSubfolderName} already exists`);
        this.#currentFolder.subfolders[newSubfolderName] = {
            parentFolder: this.#currentFolder,
            subfolders: {},
            files: {}
        };
        if (gotoNewFolder === true) {
            this.#currentFolder = this.#currentFolder.subfolders[newSubfolderName];
        }
    }

    createSubpath(subpath, gotoNewFolder = false) {
        // NOTE: `./` is not allowed!!!
        if (!isLegalPathNameInFileSystem(subpath) || subpath[0] === "/")
            throw new Error(`Subpath name is illegal`);
        const subfolderNames = subpath.split('/');
        // Verify the subpath name in details
        for (const subfolderName of subfolderNames) {
            if (!isLegalKeyNameInFileSystem(subfolderName))
                throw new Error(`Subpath name is illegal`);
        }
        let temp_currentFolder = this.#currentFolder;
        for (const subfolderName of subfolderNames) {
            if (temp_currentFolder.subfolders[subfolderName] === undefined) {
                // Create new subfolder
                temp_currentFolder.subfolders[subfolderName] = {
                    parentFolder: temp_currentFolder,
                    subfolders: {},
                    files: {}
                };
            }
            temp_currentFolder = temp_currentFolder.subfolders[subfolderName];
        }
        if (gotoNewFolder === true) {
            this.#currentFolder = temp_currentFolder;
        }
    }

    renameExistingSubfolder(oldSubfolderName, newSubfolderName) {
        if (!isLegalKeyNameInFileSystem(oldSubfolderName) || !isLegalKeyNameInFileSystem(newSubfolderName))
            throw new Error(`Subfolder name is illegal`);
        if (this.#currentFolder.subfolders[oldSubfolderName] === undefined)
            throw new Error(`Folder ${oldSubfolderName} not found`);
        if (this.#currentFolder.subfolders[newSubfolderName] !== undefined)
            throw new Error(`Folder ${newSubfolderName} already exists`);
        this.#currentFolder.subfolders[newSubfolderName] = this.#currentFolder.subfolders[oldSubfolderName];
        delete this.#currentFolder.subfolders[oldSubfolderName];
    }

    deleteSubfolder(subfolderName) {
        if (!isLegalKeyNameInFileSystem(subfolderName))
            throw new Error(`Subfolder name is illegal`);
        if (this.#currentFolder.subfolders[subfolderName] === undefined)
            throw new Error(`Folder ${subfolderName} not found`);
        delete this.#currentFolder.subfolders[subfolderName]; // doable because of auto-garbage-collection
    }

}

function generateTerminalCore(xtermObj, htmlElem_terminalContainer, fsRoot, supportedCommands) {
    // Put Terminal Window to Webpage Container
    xtermObj.open(htmlElem_terminalContainer);

    // const isWebglEnabled = (() => {
    //     try {
    //         const webgl = new window.WebglAddon.WebglAddon(); // Load the WebGL Addon
    //         xtermObj.loadAddon(webgl); // Add the WebGL Addon to xtermObj frame
    //         return true;
    //     } catch (e) {
    //         console.warn('WebGL addon threw an exception during load', e);
    //         return false;
    //     }
    // })();

    // Enabled Fit Addons
    const fitAddon = (() => { // every fit-addon can be subcribed to exactly ONE XTerm object!!!
        try {
            const fitAddon = new window.FitAddon.FitAddon(); // Load the Fit Addon
            xtermObj.loadAddon(fitAddon); // Add the Fit Addon to xtermObj frame
            return fitAddon;
        } catch (error) {
            alert(`Failed to load the fit-addon (${error})`);
            return null;
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


        // ── serialize fsRoot into a pure JSON tree ──
        function exportFS(folder) {
            const out = { keyCheck: folder.keyCheck, files: {}, subfolders: {} };
            // copy files
            for (const [fname, content] of Object.entries(folder.files)) {
                out.files[fname] = content;
            }
            // recurse into subfolders
            for (const [dname, sub] of Object.entries(folder.subfolders)) {
                out.subfolders[dname] = exportFS(sub);
            }
            return out;
        }
    
        // ── rebuild FolderObject tree from JSON ──
        function importFS(obj, parent = null) {
            const folder = { keyCheck: obj.keyCheck, parentFolder: undefined, subfolders: {}, files: {} };
            // copy files
            for (const [fname, content] of Object.entries(obj.files)) {
                folder.files[fname] = content;
            }
            // recurse into subfolders
            for (const [dname, subJSON] of Object.entries(obj.subfolders)) {
                folder.subfolders[dname] = importFS(subJSON, folder);
            }
            // set parent pointer (self for root)
            folder.parentFolder = parent || folder;
            return folder;
        }
    

    // Set Up <terminalFSDB> and try to restore old <fsRoot>
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

    //         // Start a read-only transaction for the object store
    //         const store = terminalFSDB.transaction(["TerminalFSStore"], "readonly")
    //             .objectStore("TerminalFSStore");

    //         // Use the get() method to read the xtermObj file system
    //         const getRequest = store.get("terminal_file_system");

    //         // Listen for the success event for the get request
    //         getRequest.addEventListener("success", (event) => {
    //             const result = event.target.result; // result: {id: ..., data: ...}
    //             if (result !== undefined && result.data["keyCheck"] === "TERMINAL FS ROOT") {
    //                 fsRoot = result;
    //                 console.log(`Terminal file system restored successfully.`);
    //             }
    //         });
    //     };

    //     dbRequest.onerror = (event) => {
    //         alert(`generateTerminalCore: Error opening IndexedDB: ${event.target.error}.`);
    //     };
    // })();



    // ── Load FS from server instead of IndexedDB ──
(async () => {
    try {
      const resp = await fetch('http://localhost:3000/api/fs/load');
      const json = await resp.json();
      if (json && json.keyCheck === 'TERMINAL FS ROOT') {
        fsRoot = importFS(json);
        // reset your folder pointer to the new root
        currentTerminalFolderPointer.gotoRoot();
        console.log('Terminal FS loaded from server');
    }
  } catch (e) {
    console.warn('Could not load FS from server', e);
  }
  })();
  


    // Function to Create Folder Pointer (File Browser)
    function createTerminalFolderPointer(
        duplicationOfOldCurrentFolder = undefined,
        duplicationOfOldCurrentFullPathStack = undefined
    ) {
        let
            currentFolder = undefined,
            currentFullPathStack = undefined;
        if (duplicationOfOldCurrentFolder === undefined || duplicationOfOldCurrentFullPathStack === undefined) { // old information is not complete
            currentFolder = fsRoot;
            currentFullPathStack = [];
        } else { // old information is complete
            currentFolder = duplicationOfOldCurrentFolder;
            currentFullPathStack = duplicationOfOldCurrentFullPathStack;
        }

        return {
            /*
            *  Duplication
            * */
            duplicate: () => createTerminalFolderPointer(
                currentFolder, // simple copy of pointer
                currentFullPathStack.map(x => x) // deep copy of array
            ),

            /*
            *  Directory Information Getters
            * */
            getContentListAsString: () => {
                let contents = '';
                const
                    folderNames = Object.keys(currentFolder.subfolders),
                    fileNames = Object.keys(currentFolder.files);
                if (folderNames.length > 0) {
                    contents += 'Folders:' + folderNames.reduce((acc, elem) =>
                        `${acc}\n            ${elem}`, '');
                }
                if (folderNames.length > 0 && fileNames.length > 0)
                    contents += '\n';
                if (fileNames.length > 0) {
                    contents += 'Files:' + fileNames.reduce((acc, elem) =>
                        `${acc}\n            ${elem}`, '');
                }
                return contents.length === 0 ? 'No file or folder existing here...' : contents;
            },
            getFullPath: () => currentFullPathStack.length === 0 ? '/' :
                currentFullPathStack.reduce((acc, elem) => `${acc}/${elem}`, ''),
            getSubfolderNames: () => {
                return Object.keys(currentFolder.subfolders);
            },
            getFileNames: () => {
                return Object.keys(currentFolder.files);
            },
            haveFile: (fileName) => (isLegalKeyNameInFileSystem(fileName) && currentFolder.files[fileName] !== undefined),
            haveSubfolder: (subfolderName) => (isLegalKeyNameInFileSystem(subfolderName) && currentFolder.subfolders[subfolderName] !== undefined),

            /*
            *  Directory Pointer Controllers
            * */
            gotoRoot: () => {
                currentFolder = fsRoot;
                currentFullPathStack = [];
            },
            gotoSubfolder: (subfolderName) => {
                if (!isLegalKeyNameInFileSystem(subfolderName))
                    throw new Error(`Subfolder name is illegal`);
                if (currentFolder.subfolders[subfolderName] === undefined)
                    throw new Error(`Folder ${subfolderName} not found`);
                currentFolder = currentFolder.subfolders[subfolderName];
                currentFullPathStack.push(subfolderName);
            },
            gotoSubpath: (subpath) => {
                // NOTE: `./` is not allowed!!!
                if (!isLegalPathNameInFileSystem(subpath) || subpath[0] === "/")
                    throw new Error(`Subpath name is illegal`);
                // Temporary Update
                let temp_currentFolder = currentFolder;
                const subfolderNames = subpath.split('/');
                for (const subfolderName of subfolderNames) {
                    if (!isLegalKeyNameInFileSystem(subfolderName))
                        throw new Error(`Subpath name is illegal`);
                    if (temp_currentFolder.subfolders[subfolderName] === undefined)
                        throw new Error(`Folder ${subfolderName} not found`);
                    temp_currentFolder = temp_currentFolder.subfolders[subfolderName];
                }
                // Apply Long-term Update
                currentFolder = temp_currentFolder;
                for (const subfolderName of subfolderNames)
                    currentFullPathStack.push(subfolderName);
            },
            gotoPathFromRoot: (path) => {
                // NOTE: `/` is not allowed!!!
                if (!isLegalPathNameInFileSystem(path) || path[0] === "/")
                    throw new Error(`Subpath name is illegal`);
                // Temporary Update
                let temp_currentFolder = fsRoot;
                const subfolderNames = path.split('/');
                for (const subfolderName of subfolderNames) {
                    if (!isLegalKeyNameInFileSystem(subfolderName))
                        throw new Error(`Subpath name is illegal`);
                    if (temp_currentFolder.subfolders[subfolderName] === undefined)
                        throw new Error(`Folder ${subfolderName} not found`);
                    temp_currentFolder = temp_currentFolder.subfolders[subfolderName];
                }
                // Apply Long-term Update
                currentFolder = temp_currentFolder;
                currentFullPathStack = subfolderNames;
            },
            gotoParentFolder: () => {
                currentFolder = currentFolder.parentFolder;
                currentFullPathStack.pop();
            },

            /*
            *  Directory File Controllers
            * */
            getFileContent: (fileName) => {
                if (!isLegalKeyNameInFileSystem(fileName))
                    throw new Error(`File name is illegal`);
                if (currentFolder.files[fileName] === undefined)
                    throw new Error(`File ${fileName} not found`);
                return currentFolder.files[fileName];
            },
            changeFileContent: (fileName, newContent) => {
                if (!isLegalKeyNameInFileSystem(fileName))
                    throw new Error(`File name is illegal`);
                currentFolder.files[fileName] = newContent;
            },
            createNewFile: (fileName) => {
                if (!isLegalKeyNameInFileSystem(fileName))
                    throw new Error(`File name is illegal`);
                if (currentFolder.files[fileName] !== undefined)
                    throw new Error(`File ${fileName} is already existing`);
                currentFolder.files[fileName] = "";
            },
            renameExistingFile: (oldFileName, newFileName) => {
                if (!isLegalKeyNameInFileSystem(oldFileName) || !isLegalKeyNameInFileSystem(newFileName))
                    throw new Error(`File name is illegal`);
                if (currentFolder.files[oldFileName] === undefined)
                    throw new Error(`File ${oldFileName} not found`);
                if (currentFolder.files[newFileName] !== undefined)
                    throw new Error(`File ${newFileName} already exists`);
                currentFolder.files[newFileName] = currentFolder.files[oldFileName];
                delete currentFolder.files[oldFileName];
            },
            deleteFile: (fileName) => {
                if (!isLegalKeyNameInFileSystem(fileName))
                    throw new Error(`File name is illegal`);
                if (currentFolder.files[fileName] === undefined)
                    throw new Error(`File ${fileName} not found.`);
                delete currentFolder.files[fileName];
            },

            /*
            *  Directory Subfolder Controllers
            * */
            createSubfolder: (newSubfolderName, gotoNewFolder = false) => {
                if (!isLegalKeyNameInFileSystem(newSubfolderName))
                    throw new Error(`Subfolder name is illegal`);
                if (currentFolder.subfolders[newSubfolderName] !== undefined)
                    throw new Error(`Folder ${newSubfolderName} already exists`);
                currentFolder.subfolders[newSubfolderName] = {
                    parentFolder: currentFolder,
                    subfolders: {},
                    files: {}
                };
                if (gotoNewFolder === true){
                    currentFolder = currentFolder.subfolders[newSubfolderName];
                }
            },
            createSubpath: (subpath, gotoNewFolder = false) => {
                // NOTE: `./` is not allowed!!!
                if (!isLegalPathNameInFileSystem(subpath) || subpath[0] === "/")
                    throw new Error(`Subpath name is illegal`);
                const subfolderNames = subpath.split('/');
                // Verify the subpath name in details
                for (const subfolderName of subfolderNames) {
                    if (!isLegalKeyNameInFileSystem(subfolderName))
                        throw new Error(`Subpath name is illegal`);
                }
                let temp_currentFolder = currentFolder;
                for (const subfolderName of subfolderNames) {
                    if (temp_currentFolder.subfolders[subfolderName] === undefined) {
                        // Create new subfolder
                        temp_currentFolder.subfolders[subfolderName] = {
                            parentFolder: temp_currentFolder,
                            subfolders: {},
                            files: {}
                        };
                    }
                    temp_currentFolder = temp_currentFolder.subfolders[subfolderName];
                }
                if (gotoNewFolder === true){
                    currentFolder = temp_currentFolder;
                }
            },
            renameExistingSubfolder: (oldSubfolderName, newSubfolderName) => {
                if (!isLegalKeyNameInFileSystem(oldSubfolderName) || !isLegalKeyNameInFileSystem(newSubfolderName))
                    throw new Error(`Subfolder name is illegal`);
                if (currentFolder.subfolders[oldSubfolderName] === undefined)
                    throw new Error(`Folder ${oldSubfolderName} not found`);
                if (currentFolder.subfolders[newSubfolderName] !== undefined)
                    throw new Error(`Folder ${newSubfolderName} already exists`);
                currentFolder.subfolders[newSubfolderName] = currentFolder.subfolders[oldSubfolderName];
                delete currentFolder.subfolders[oldSubfolderName];
            },
            deleteSubfolder: (subfolderName) => {
                if (!isLegalKeyNameInFileSystem(subfolderName))
                    throw new Error(`Subfolder name is illegal`);
                if (currentFolder.subfolders[subfolderName] === undefined)
                    throw new Error(`Folder ${subfolderName} not found`);
                delete currentFolder.subfolders[subfolderName]; // doable because of auto-garbage-collection
            },

        };
    }

    // Create Terminal Global Folder Pointer Object
    const currentTerminalFolderPointer = new TerminalFolderPointer(fsRoot);

    // Create Terminal Log Array
    let terminalLog = [];

    // Initialize Current Keyboard Listener
    let currentTerminalKeyboardListener = undefined;

    // Function to Set New Keyboard Listener
    function setNewTerminalKeyboardListener(keyboard_listening_callback) {
        if (currentTerminalKeyboardListener !== undefined)
            currentTerminalKeyboardListener.dispose();
        currentTerminalKeyboardListener = xtermObj.onData(keyboard_listening_callback);
    }

    // Initialize Command Buffer & Handler
    let commandInputBuffer = []; // command buffer: char[]
    const commandInputBufferHandler = {
        addChar: (newChar) => { // returns void
            commandInputBuffer.push(newChar);
        },
        removeChar: () => { // returns whether the last char is successfully removed
            if (commandInputBuffer.length > 0) {
                commandInputBuffer.pop();
                return true;
            }
            return false;
        },
        execute: () => { // returns [status_code, command_name]
            if (commandInputBuffer.length === 0) return [-1, '']; // Error: (Empty) Command is not supported.

            let index = 0;

            function parsingHelper() { // returns string
                let block = '';
                while (index < commandInputBuffer.length && commandInputBuffer[index] === ` `)
                    index++;
                if (commandInputBuffer[index] === `"` || commandInputBuffer[index] === `'`) {
                    const quoteIndex = index++;
                    let quoteNotClosed = true;
                    while (index < commandInputBuffer.length) {
                        if (commandInputBuffer[index] === commandInputBuffer[quoteIndex]) {
                            index++;
                            quoteNotClosed = false;
                            break;
                        }
                        block += commandInputBuffer[index++];
                    }
                    if (quoteNotClosed)
                        block = commandInputBuffer[quoteIndex] + block;
                } else {
                    while (index < commandInputBuffer.length) {
                        if (commandInputBuffer[index] === ` `) {
                            index++;
                            break;
                        }
                        block += commandInputBuffer[index++];
                    }
                }
                return block;
            }

            const
                commandName = parsingHelper(),
                commandParameters = [];
            while (index < commandInputBuffer.length) {
                const param = parsingHelper();
                if (param.length > 0) commandParameters.push(param);
            }
            if (supportedCommands[commandName] === undefined) return [1, commandName]; // Error: Command is not supported.
            try {
                supportedCommands[commandName].executable(commandParameters);
                return [0, commandName]; // Success!
            } catch (e) { // e is alerted as a pop-up!!!
                alert(`generateTerminalCore: commandInputBufferHandler: ${e}.`);
                return [2, commandName]; // Error: Command exists but throws exceptions.
            }
        },
        clear: () => { // returns void
            commandInputBuffer = [];
        }
    };

    // Function to Initialize Default Terminal Window's Listening to Keyboard Input
    function setDefaultTerminalKeyboardListener() {
        setNewTerminalKeyboardListener((s) => {
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
                        commandInputBufferHandler.clear();
                        xtermObj.write('^C\n\n\r $ ');
                        terminalLog.push('^C\n\n $ ');
                        break;
                    }
                    case '\u000C': { // Ctrl+L
                        commandInputBufferHandler.clear();
                        xtermObj.write(`\x1b[2J\x1b[H $ `);
                        terminalLog.push(' $ ');
                        break;
                    }
                    case '\r': { // Enter
                        xtermObj.write('\n\r   ');
                        terminalLog.push('\n   ');
                        {
                            const [statusCode, commandName] = commandInputBufferHandler.execute();
                            switch (statusCode) {
                                case -1: {
                                    // (Empty) Command is not supported.
                                    break;
                                }
                                case 1: {
                                    xtermObj.write(`${commandName}: command not found`);
                                    terminalLog.push(`${commandName}: command not found`);
                                    break;
                                }
                                case 2: {
                                    xtermObj.write(`${commandName}: command failed due to uncaught errors`);
                                    terminalLog.push(`${commandName}: command failed due to uncaught errors`);
                                    break;
                                }
                                default: {
                                }
                            }
                        }
                        commandInputBufferHandler.clear();
                        xtermObj.write('\n\n\r $ ');
                        terminalLog.push('\n\n $ ');
                        break;
                    }
                    case '\u007F': { // Backspace
                        const success = commandInputBufferHandler.removeChar();
                        if (success) {
                            xtermObj.write('\b \b');
                            terminalLog.pop(); // because commandInputBufferHandler.removeChar() is success!!
                        }
                        break;
                    }
                    default: { // Other keys
                        if (char >= String.fromCharCode(0x20) && char <= String.fromCharCode(0x7E) || char >= '\u00a0') {
                            commandInputBufferHandler.addChar(char);
                            xtermObj.write(char);
                            terminalLog.push(char);
                        }
                    }
                }
            }
        });
    }

    // Initialize Default Terminal Window's Listening to Keyboard Input
    setDefaultTerminalKeyboardListener();

    // Initialize Terminal Window Display
    xtermObj.write(` $ `);
    terminalLog.push(` $ `);

    // Securely Release the Terminal APIs
    return {
        /*
        *  Terminal Output Ports
        * */
        printToWindow: (sentence, if_print_raw_to_window, if_print_to_log) => { // (string, boolean, boolean) => void
            if (if_print_to_log)
                terminalLog.push(sentence);
            if (if_print_raw_to_window) {
                xtermObj.write(sentence); // leave <sentence> as it was
            } else {
                xtermObj.write(sentence.replaceAll('\n', '\n\r   ')); // replace all '\n' in <sentence> with '\n\r   '
            }
        },


        /*
        *  Terminal Keyboard Listener Controllers
        * */
        setDefaultKeyboardListener: () => { // returns void
            setDefaultTerminalKeyboardListener();
        },
        setNewKeyboardListener: (keyboard_listener_callback) => { // returns void
            setNewTerminalKeyboardListener(keyboard_listener_callback);
        },
        getCurrentKeyboardListener: () => currentTerminalKeyboardListener,


        /*
        *  Terminal Status/Content Getters
        * */
        getFitAddon: () => fitAddon,
        getTerminalLogString: () => terminalLog.reduce((acc, elem) => acc + elem, ''),


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
        // button_to_save_terminal_file_system_to_indexDB: () => {
        //     if (terminalFSDB === undefined) {
        //         alert(`generateTerminalCore: button_to_save_terminal_file_system_to_indexDB: Error for undefined terminalFSDB.`);
        //         return;
        //     }

        //     // Start a read-write transaction for the object store
        //     const store = terminalFSDB.transaction(["TerminalFSStore"], "readwrite")
        //         .objectStore("TerminalFSStore");

        //     // Use the put() method to insert or update the xtermObj file system
        //     const putRequest = store.put({
        //         id: "terminal_file_system",
        //         data: fsRoot
        //     });

        //     // Listen for the success event for the put request
        //     putRequest.addEventListener("success", () => {
        //         console.log(`Terminal file system saved successfully.`);
        //     });

        //     // Listen for errors during the put operation
        //     putRequest.addEventListener("error", event => {
        //         alert(`generateTerminalCore: button_to_save_terminal_file_system_to_indexDB: Error saving terminal file system: ${event.target.error}.`);
        //     });
        // },
        button_to_save_terminal_file_system_to_indexDB: () => {
            // ── POST the FS tree to our new endpoint ──
            fetch('http://localhost:3000/api/fs/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(exportFS(fsRoot))
            })
            .then(res => {
              if (!res.ok) throw new Error('Save failed');
              console.log('Terminal FS saved to server');
            })
            .catch(err => {
              alert(`Error saving terminal FS: ${err}`);
            });
          },
          
        button_to_download_terminal_log: () => {
            const
                full_current_log = terminalLog.reduce((acc, elem) => acc + elem, ''),
                url = URL.createObjectURL(new Blob([full_current_log], {type: 'text/plain'})),
                date = new Date(),
                link = document.createElement('a');
            link.href = url;
            link.download = `terminal_log @ ${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`; // the filename the user will get
            link.click();
            URL.revokeObjectURL(url);
        },
        button_to_add_local_file: () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '';
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) return;   // user hit “cancel”
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const
                        fileContent = evt.target.result,  // the file’s text content
                        date = new Date();
                    let
                        filename = file.name;
                    while (currentTerminalFolderPointer.haveFile(filename))
                        filename = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} __ ` + filename;
                    currentTerminalFolderPointer.changeFileContent(filename, fileContent);
                    xtermObj.write(`[Button:] Successfully added file "${filename}" to the current directory.\n\n\r $ `);
                    terminalLog.push(`[Button:] Successfully added file "${filename}" to the current directory.\n\n $ `);
                };
                reader.onerror = (error) => {
                    alert(`generateTerminalCore: button_to_add_local_file: error reading the file "${file.name}", ${error}.`);
                };
                reader.readAsText(file);
            };
            input.click();
        },
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

        /*
        *  Other Dangerous Ports, better not to Release!!!
        * */
        // getXTermObject: () => xtermObj, // avoid using this for a maintainable code structure and better performance!!!

    };
}
