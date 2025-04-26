let
    button_to_save_terminal_file_system_to_indexDB = undefined,
    button_to_download_terminal_log = undefined,
    button_to_add_local_file = undefined;

document.addEventListener('DOMContentLoaded', () => {
    const terminalCore = generateTerminalCore(
        new window.Terminal({
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
        }),
        document.getElementById('terminal-container')
    );

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
            terminalCore.printToWindow(
                `'${
                    parameters.reduce(
                        (acc, elem, index) => {
                            if (index === 0) return elem;
                            return `${acc} ${elem}`;
                        },
                        ''
                    )
                }'`,
                false, true
            );
        },
        description: 'Simply print all the parameters -- with quotation marks [\'] added at the beginning and the end.\n Usage: echo [parameter_sequence]',
    };

    // Finished
    terminalCore.getSupportedCommands()['ls'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 0: { // print current folder info
                    terminalCore.printToWindow(`${terminalCore.getCurrentFolderPointer().getContentListAsString()}`, false, true);
                    break;
                }
                case 1: { // print the folder info of given path
                    try {
                        let path = parameters[0];
                        if (path[0] === '/') { // begin with '/', so the path is from the root
                            // The path is from the root, so we need a new_pointer!
                            path = path.slice(1); // take off the '/'
                            const tempFolderPointer = terminalCore.getNewFolderPointer();
                            tempFolderPointer.gotoSubpath(path);
                            terminalCore.printToWindow(`${tempFolderPointer.getContentListAsString()}`, false, true);
                        } else { // the path is not from the root
                            if (path[0] === '.' && path[1] === '/') { // begin with './'
                                path = path.slice(2);
                            }
                            const tempFolderPointer = terminalCore.getCurrentFolderPointer().duplicate();
                            tempFolderPointer.gotoSubpath(path);
                            terminalCore.printToWindow(`${tempFolderPointer.getContentListAsString()}`, false, true);
                        }
                    } catch (error) {
                        terminalCore.printToWindow(`${error}`, false, true);
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

    // Finished
    terminalCore.getSupportedCommands()['mkdir'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 1: {
                    try {
                        let path = parameters[0];
                        if (path[0] === '/') { // begin with '/', so the path is from the root
                            // The path is from the root, so we need a new_pointer!
                            path = path.slice(1); // take off the '/'
                            terminalCore.getNewFolderPointer().createSubpath(path);
                        } else { // the path is not from the root
                            if (path[0] === '.' && path[1] === '/') { // begin with './'
                                path = path.slice(2);
                            }
                            terminalCore.getCurrentFolderPointer().createSubpath(path);
                        }
                        terminalCore.printToWindow(`Success!`, false, true);
                    } catch (error) {
                        terminalCore.printToWindow(`${error}`, false, true);
                    }
                    break;
                }
                default: {
                    terminalCore.printToWindow(`Wrong grammar!\nUsage: mkdir folder_name/folder_path`, false, true);
                }
            }
        },
        description: 'Make a new directory.\nUsage: mkdir folder_name/folder_path'
    };

    // Finished
    terminalCore.getSupportedCommands()['pwd'] = {
        executable: (_) => {
            terminalCore.printToWindow(
                terminalCore.getCurrentFolderPointer().getFullPath(),
                false, true
            );
        },
        description: 'Print the current full path.'
    };

    // Finished
    terminalCore.getSupportedCommands()['touch'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 1: {
                    try {
                        terminalCore.getCurrentFolderPointer().createNewFile(parameters[0]);
                        terminalCore.printToWindow(`Success!`, false, true);
                    } catch (error) {
                        terminalCore.printToWindow(`${error}`, false, true);
                    }
                    break;
                }
                default: {
                    terminalCore.printToWindow(`Wrong grammar!\nUsage: touch file_name`, false, true);
                }
            }
        },
        description: 'Make a new file in the current directory.\nUsage: touch file_name'
    };

    terminalCore.getSupportedCommands()['cd'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 1: {
                    try {
                        let path = parameters[0];
                        const fp = terminalCore.getCurrentFolderPointer();
                        if (path === '/') { // goto root
                            fp.gotoRoot();
                        } else if (path === '.' || path === './') { // goto current
                            // do nothing !!!!
                        } else if (path === '..' || path === '../') { // goto parent
                            fp.gotoParentFolder();
                        } else { // goto some path
                            if (path[0] === '/') { // the path is from the root
                                path = path.slice(1);
                                fp.gotoPathFromRoot(path);
                            } else { // the path is from the current folder
                                if (path[0] === '.' && path[1] === '/') {
                                    path = path.slice(2);
                                }
                                fp.gotoSubpath(path);
                            }
                        }
                        terminalCore.printToWindow(`Success!`, false, true);
                    } catch (error) {
                        terminalCore.printToWindow(`${error}`, false, true);
                    }
                    break;
                }
                default: {
                    terminalCore.printToWindow(`Wrong grammar!\nUsage: cd folder_name/folder_path`, false, true);
                }
            }
        },
        description: 'Goto the given folder.\nUsage: cd folder_name/folder_path'
    };

    terminalCore.getSupportedCommands()['rename'] = {
        executable: (parameters) => {

        },
        description: ''
    };

    terminalCore.getSupportedCommands()['cp'] = {
        executable: (parameters) => {

        },
        description: ''
    };

    terminalCore.getSupportedCommands()['edit'] = {
        executable: (parameters) => {
            //
        },
        description: ''
    };

    terminalCore.getSupportedCommands()['wget'] = {
        executable: (parameters) => {
            //
        },
        description: ''
    };

    terminalCore.getSupportedCommands()['ping'] = {
        executable: (parameters) => {
            if (parameters.length === 0) {
                terminalCore.printToWindow(`Usage: ping [hostname]`, false, true);
                return;
            }

            const fullCommand = `ping -c 4 ${parameters.join(" ")}`;
            terminalCore.printToWindow(`Running: ${fullCommand}\n`, false, true);

            fetch('http://localhost:3000/api/run', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({command: fullCommand})
            })
                .then(res => res.text())
                .then(output => {
                    terminalCore.printToWindow(output, false, true);
                })
                .catch(err => {
                    terminalCore.printToWindow(`Error executing ping: ${err}`, false, true);
                });
        },
        description: 'Ping a domain or IP address.\nUsage: ping [hostname]'
    };

    terminalCore.getSupportedCommands()['curl'] = {
        executable: (params) => {
            // Validate
            if (params.length !== 1) {
                terminalCore.printToWindow("Usage: curl <url>\n", false, true);
                return;
            }
            // Pull the URL from params
            const url = params[0];

            // Print a fetch banner
            terminalCore.printToWindow(`Fetching ${url} …\n`, false, true);

            fetch(`http://localhost:3000/api/proxy?url=${encodeURIComponent(url)}`)
                .then(res => {
                    // 5) Print status + headers
                    terminalCore.printToWindow(
                        `$ HTTP ${res.status} ${res.statusText}` +
                        [...res.headers.entries()]
                            .map(([k, v]) => `\n${k}: ${v}`)
                            .join('') +
                        `\n\n`,
                        false,
                        true
                    );
                    // Return the body text
                    return res.text();
                })
                .then(body => {
                    // Print the HTML snippet
                    const snippet = body.slice(0, 1000);
                    terminalCore.printToWindow(
                        snippet + (body.length > 1000 ? "\n...[truncated]\n" : "\n"),
                        false,
                        true
                    );
                })
                .catch(err => {
                    terminalCore.printToWindow(`curl failed: ${err.message}\n`, false, true);
                });
        },
        description: "Fetch a URL via your server proxy and show status, headers & a 1 000-char body snippet"
    };

    terminalCore.getSupportedCommands()['files'] = {
        executable: (params) => {
            const fp = terminalCore.getCurrentFolderPointer();
            const [action, ...rest] = params;

            switch (action) {
                case 'list': {
                    // show folders and files in current dir
                    const folders = fp.getSubfolderNames();
                    const files = fp.getFileNames();
                    terminalCore.printToWindow(
                        `Folders:\n  ${folders.join('\n  ')}\n\n` +
                        `Files:\n  ${files.join('\n  ')}\n`,
                        false, true
                    );
                    break;
                }

                case 'read': {
                    // files read <filename>
                    if (rest.length !== 1) {
                        terminalCore.printToWindow('Usage: files read <path>\n', false, true);
                        return;
                    }
                    try {
                        const content = fp.getFileContent(rest[0]);
                        terminalCore.printToWindow(content + '\n', false, true);
                    } catch (e) {
                        terminalCore.printToWindow(`files read failed: ${e.message}\n`, false, true);
                    }
                    break;
                }

                case 'create': {
                    // files create <filename> [initial content...]
                    if (rest.length < 1) {
                        terminalCore.printToWindow('Usage: files create <path> [content]\n', false, true);
                        return;
                    }
                    const [path, ...txt] = rest;
                    try {
                        fp.createNewFile(path);
                        if (txt.length) fp.changeFileContent(path, txt.join(' '));
                        terminalCore.printToWindow(`Created ${path}\n`, false, true);
                    } catch (e) {
                        terminalCore.printToWindow(`files create failed: ${e.message}\n`, false, true);
                    }
                    break;
                }

                case 'update': {
                    // files update <filename> <new content...>
                    if (rest.length < 2) {
                        terminalCore.printToWindow('Usage: files update <path> <content>\n', false, true);
                        return;
                    }
                    const [path, ...txt] = rest;
                    try {
                        fp.changeFileContent(path, txt.join(' '));
                        terminalCore.printToWindow(`Updated ${path}\n`, false, true);
                    } catch (e) {
                        terminalCore.printToWindow(`files update failed: ${e.message}\n`, false, true);
                    }
                    break;
                }

                case 'delete': {
                    // files delete <filename>
                    if (rest.length !== 1) {
                        terminalCore.printToWindow('Usage: files delete <path>\n', false, true);
                        return;
                    }
                    try {
                        fp.deleteFile(rest[0]);
                        terminalCore.printToWindow(`Deleted ${rest[0]}\n`, false, true);
                    } catch (e) {
                        terminalCore.printToWindow(`files delete failed: ${e.message}\n`, false, true);
                    }
                    break;
                }

                case 'rename': {
                    // files rename <oldName> <newName>
                    if (rest.length !== 2) {
                        terminalCore.printToWindow('Usage: files rename <old> <new>\n', false, true);
                        return;
                    }
                    try {
                        fp.renameExistingFile(rest[0], rest[1]);
                        terminalCore.printToWindow(`Renamed ${rest[0]} → ${rest[1]}\n`, false, true);
                    } catch (e) {
                        terminalCore.printToWindow(`files rename failed: ${e.message}\n`, false, true);
                    }
                    break;
                }

                default:
                    terminalCore.printToWindow(
                        'Usage: files <list|read|create|update|delete|rename> [args]\n',
                        false, true
                    );
            }
        },
        description:
            'Virtual-FS CRUD operations:\n' +
            '  files list\n' +
            '  files read <path>\n' +
            '  files create <path> [content]\n' +
            '  files update <path> <content>\n' +
            '  files delete <path>\n' +
            '  files rename <old> <new>'
    };

});

























