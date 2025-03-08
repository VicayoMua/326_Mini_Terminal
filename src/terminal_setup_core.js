/*
* **************************************************************************************************************
*
*                                           START OF MY NEW FILE
*
*                This file initializes the terminal window frame and the virtual file system.
*
* **************************************************************************************************************
* */


const htmlElem_terminalContainer = document.getElementById('terminal-container');

const terminalCore = (() => {
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
    const fsRoot = { // FolderObject
        parentFolder: undefined, // FolderObject
        subfolders: {}, // subfolderName : folderObject
        files: {} // fileName : fileContents
    };
    fsRoot.parentFolder = fsRoot;

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
            getSubfolderNames: ()=>{
                return Object.keys(currentFolder.subfolders);
            },
            getFileNames: ()=>{
                return Object.keys(currentFolder.files);
            },


            gotoRoot: () => {
                currentFolder = fsRoot;
                currentFullPathStack = [];
            },
            gotoSubfolder: (subfolderName) => {
                if (currentFolder.subfolders[subfolderName] === undefined)
                    throw new Error(`Folder ${subfolderName} not found`);
                currentFolder = currentFolder.subfolders[subfolderName];
                currentFullPathStack.push(subfolderName);
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
                // alert(`[${commandParameters}]`);
                if (supportedCommands[commandName] === undefined) return [1, commandName]; // Error: Command is not supported.
                try {
                    supportedCommands[commandName].executable(commandParameters);
                    return [0, commandName]; // Success!
                } catch (e) { // e is alerted as a pop-up!!!
                    alert(`${e}`);
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
        printToWindow: (sentence, if_print_raw_to_window, if_print_to_log) => { // (string, boolean, boolean) => void
            if (if_print_to_log)
                terminalLog.push(sentence);
            if (if_print_raw_to_window) {
                terminal.write(sentence); // leave <sentence> as it was
            } else {
                terminal.write(sentence.replaceAll('\n', '\n\r   ')); // replace all '\n' in <sentence> with '\n\r   '
            }
        },
        createFolderPointer: () => { // () => Folder Pointer
            return createTerminalFolderPointer();
        },
        setDefaultKeyboardListener: () => { // returns void
            setNewTerminalKeyboardListener(defaultTerminalKeyboardListeningCallback);
        },
        setNewKeyboardListener: (keyboard_listening_callback) => { // returns void
            setNewTerminalKeyboardListener(keyboard_listening_callback);
        },
        getIsFitEnabled: () => isFitEnabled,
        getCurrentKeyboardListener: () => currentTerminalKeyboardListener,
        getCurrentFolderPointer: () => currentTerminalFolderPointer,
        getSupportedCommands: () => supportedCommands,
        getLog: () => terminalLog.reduce((acc, elem) => acc + elem, ''),
        getXTermObject: () => terminal, // avoid using this for a maintainable code structure and better performance!!!
    };
})();

// Built-in Command
terminalCore.getSupportedCommands()['help'] = {
    executable: (_) => {
        terminalCore.printToWindow(
            `Supported commands are: ${
                Object.keys(terminalCore.getSupportedCommands()).reduce(
                    (acc, elem, index) => {
                        if (index === 0) return `${elem}`;
                        return `${acc}, ${elem}`;
                    },
                    undefined
                )
            }.\nFor more details, please use the command "man [command_name]".`,
            false,
            true
        );
    },
    description: 'A brief manual of the terminal simulator.',
};

// Built-in Command
terminalCore.getSupportedCommands()['man'] = {
    executable: (parameters) => {
        switch (parameters.length) {
            case 1: {
                const
                    commandName = parameters[0],
                    commandObject = terminalCore.getSupportedCommands()[commandName];
                if (commandObject === undefined) {
                    terminalCore.printToWindow(
                        `The command "${commandName}" is not supported!`,
                        true,
                        true
                    );
                } else {
                    terminalCore.printToWindow(
                        `Description of ${commandName}: \n\n${commandObject.description}`,
                        false,
                        true
                    );
                }
                break;
            }
            default: {
                terminalCore.printToWindow(`Wrong grammar!\nUsage: man [command_name]`, false, true);
            }
        }
    },
    description: 'A detailed manual of the terminal simulator.\nUsage: man [command_name]',
};

// Built-in Command
terminalCore.getSupportedCommands()['echo'] = {
    executable: (parameters) => {
        terminalCore.printToWindow(`"${parameters.reduce((acc, elem, index) => {
            if (index === 0) return elem;
            return `${acc} ${elem}`;
        }, '')}"`, false, true);
    },
    description: 'Simply print all the parameters -- with quotation marks [\"] added at the beginning and the end.\n Usage: echo [parameter_sequence]',
};