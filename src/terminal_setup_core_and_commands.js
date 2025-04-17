let
    button_to_save_terminal_file_system_to_indexDB = undefined,
    button_to_download_terminal_log = undefined,
    button_to_add_local_file = undefined;

document.addEventListener('DOMContentLoaded', () => {
    const terminalCore = generateTerminalCore();

    // Set Up Button Functions Linking
    button_to_save_terminal_file_system_to_indexDB = terminalCore.button_to_save_terminal_file_system_to_indexDB;
    button_to_download_terminal_log = terminalCore.button_to_download_terminal_log;
    button_to_add_local_file = terminalCore.button_to_add_local_file;

    // Finished
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

    // Finished
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

    // Finished
    terminalCore.getSupportedCommands()['echo'] = {
        executable: (parameters) => {
            terminalCore.printToWindow(`"${parameters.reduce((acc, elem, index) => {
                if (index === 0) return elem;
                return `${acc} ${elem}`;
            }, '')}"`, false, true);
        },
        description: 'Simply print all the parameters -- with quotation marks [\"] added at the beginning and the end.\n Usage: echo [parameter_sequence]',
    };

    // TODO: Update it!!!
    terminalCore.getSupportedCommands()['ls'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 0: { // print current folder info
                    terminalCore.printToWindow(`${terminalCore.getCurrentFolderPointer().getContentListAsString()}`, false, true);
                    break;
                }
                case 1: { // print the folder info of given path
                    try {
                        const newFolderPointer = terminalCore.getNewFolderPointer();
                        newFolderPointer.gotoRoot();
                        newFolderPointer.gotoSubpath(parameters[0]);
                        terminalCore.printToWindow(`${newFolderPointer.getContentListAsString()}`, false, true);
                    } catch (e) {
                        terminalCore.printToWindow(`${e}`, false, true);
                    }
                    break;
                }
                default: {
                    terminalCore.printToWindow(`Wrong grammar!\nUsage: ls [folder_path]`, false, true);
                }
            }
        },
        description: 'List all the folders and files.\nUsage: ls [folder_path]'
    };

    terminalCore.getSupportedCommands()['mkdir'] = {
        executable: (parameters) => {
            if (parameters.length !== 1)
                return;
        },
        description: 'Make a new directory.\nUsage: mkdir [folder_name/folder_path]'
    };

    terminalCore.getSupportedCommands()['touch'] = {
        executable: (parameters) => {
            //

        },
        description: ''
    };

    terminalCore.getSupportedCommands()['pwd'] = {
        executable: (parameters) => {

        },
        description: 'Print the current full path.'
    };

    terminalCore.getSupportedCommands()['cd'] = {
        executable: (parameters) => {

        },
        description: 'Goto the given path.'
    };

    terminalCore.getSupportedCommands()['rename'] = {
        executable: (parameters) => {

        },
        description: ''
    };


});

// terminalCore.getSupportedCommands()['edit'] = {
//     executable: (parameters) => {
//         //
//     },
//     description: ''
// };