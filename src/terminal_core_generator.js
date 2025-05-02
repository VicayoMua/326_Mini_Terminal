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
        getNewFolderPointer: () => new TerminalFolderPointer(fsRoot),
    };
}
