let
    button_to_open_new_terminal_window = undefined,
    button_to_save_terminal_fs = undefined,
    button_to_download_terminal_log = undefined,
    button_to_add_local_file = undefined;

// Set Up System Time Object
const date = new Date();

// --- paste this at the very top of terminal_setup_core_and_commands.js ---

// serialize a FolderObject tree into plain JS objects
function serializeFolder(folder) {
  return {
    files: { ...folder.files },
    subfolders: Object.fromEntries(
      Object.entries(folder.subfolders)
        .map(([name, sub]) => [name, serializeFolder(sub)])
    )
  };
}

// export the full FS tree plus cwd
function exportFS(root, cwd) {
  return {
    fs: serializeFolder(root),
    cwd
  };
}

// recursively rebuild a FolderObject tree from plain data
function buildFolder(folder, data) {
  folder.files = { ...data.files };
  folder.subfolders = {};
  for (const [name, subData] of Object.entries(data.subfolders)) {
    folder.subfolders[name] = { parentFolder: folder, subfolders: {}, files: {} };
    buildFolder(folder.subfolders[name], subData);
  }
}

// import the saved state back into in‑memory root
function importFS(root, state) {
  buildFolder(root, state.fs);
}

// --- end of paste ---


document.addEventListener('DOMContentLoaded', () => {

    const
        fsRoot = generateRootDirectory(), // Initialize File System Root
        supportedCommands = {}, // Initialize Supported Commands
        terminalHTMLDivElements = [];

    // Set Up Current Terminal Core Services
    let currentTerminalCore = null;

    // Set Up Button Functions Links
    button_to_open_new_terminal_window = (() => {
        const divTerminalContainer = document.getElementById('terminal-container');
        const navViewNavigation = document.getElementById('view-navigation');
        let windowCount = 0;
        return () => {
            if (windowCount === 8) {
                alert('You can open at most 8 terminal windows.');
                return;
            }
            windowCount++;
            const divNewTerminalHTMLDivElement = document.createElement('div');
            divNewTerminalHTMLDivElement.setAttribute('class', 'terminal-window');
            divNewTerminalHTMLDivElement.setAttribute('id', `terminal-window-${windowCount}`);
            divNewTerminalHTMLDivElement.style.display = 'none';
            divTerminalContainer.appendChild(divNewTerminalHTMLDivElement);
            terminalHTMLDivElements.push(divNewTerminalHTMLDivElement);
            const newXtermObject = new window.Terminal({
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
            const newTerminalCore = generateTerminalCore(
                newXtermObject,
                divNewTerminalHTMLDivElement,
                fsRoot,
                supportedCommands
            );
            window.addEventListener('resize', () => {
                if (currentTerminalCore !== newTerminalCore) // if the current terminal core is not on the front
                    return;
                const fitAddon = newTerminalCore.getFitAddon();
                if (fitAddon !== null) fitAddon.fit();
            });
            const buttonNewTerminalViewNavigation = document.createElement('button');
            buttonNewTerminalViewNavigation.type = 'button';
            buttonNewTerminalViewNavigation.textContent = `{ Window #${windowCount} }`;
            buttonNewTerminalViewNavigation.addEventListener('mouseover', () => {
                buttonNewTerminalViewNavigation.style.textDecoration = 'underline';
            });
            buttonNewTerminalViewNavigation.addEventListener('mouseout', () => {
                buttonNewTerminalViewNavigation.style.textDecoration = 'none';
            });
            buttonNewTerminalViewNavigation.addEventListener('click', () => {
                if (currentTerminalCore !== newTerminalCore) { // view switching needed
                    for (const div of terminalHTMLDivElements)
                        div.style.display = 'none';
                    divNewTerminalHTMLDivElement.style.display = 'block';
                    currentTerminalCore = newTerminalCore;
                }
                setTimeout(() => {
                    const fitAddon = newTerminalCore.getFitAddon(); // has to be newTerminalCore since 10ms waiting race
                    if (fitAddon !== null) fitAddon.fit();
                }, 50);
            });
            navViewNavigation.appendChild(buttonNewTerminalViewNavigation);
            if (currentTerminalCore === null) // if the terminal window is <Window #1>
                buttonNewTerminalViewNavigation.click();
        };
    })();

    // Automatically open one terminal window
    button_to_open_new_terminal_window();

    // Save FS button handler
    button_to_save_terminal_fs = () => {
        const cmd = supportedCommands['save'];
        if (cmd && typeof cmd.executable === 'function') {
            cmd.executable();
        } else {
            console.error('Save command not found');
        }
    };


    button_to_download_terminal_log = () => {
        const
            url = URL.createObjectURL(new Blob([currentTerminalCore.getTerminalLogString()], {type: 'text/plain'})),
            link = document.createElement('a');
        link.href = url;
        link.download = `terminal_log @ ${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`; // the filename the user will get
        link.click();
        URL.revokeObjectURL(url);
    };

    button_to_add_local_file = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;   // user hit “cancel”
            const reader = new FileReader();
            reader.onload = (evt) => {
                const fileContent = evt.target.result;  // the file’s text content
                const cfp = currentTerminalCore.getCurrentFolderPointer();
                let filename = file.name;
                if (cfp.haveFile(filename))
                    filename = `${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}_${filename}`;
                cfp.changeFileContent(filename, fileContent);
                alert(`Successfully added file "${filename}" to the current directory (${cfp.getFullPath()}).`);
            };
            reader.onerror = (error) => {
                alert(`generateTerminalCore: button_to_add_local_file: error reading the file "${file.name}", ${error}.`);
            };
            reader.readAsText(file);
        };
        input.click();
    };

    // Finished
    supportedCommands['hello'] = {
        executable: (_) => {
            currentTerminalCore.printToWindow('Hello World!', false, true);
        },
        description: 'Say "Hello World!"'
    };

    // Finished
    supportedCommands['help'] = {
        executable: (_) => {
            currentTerminalCore.printToWindow(
                `Supported commands are: ${
                    Object.keys(supportedCommands).reduce(
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
    supportedCommands['man'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 1: {
                    const
                        commandName = parameters[0],
                        commandObject = supportedCommands[commandName];
                    if (commandObject === undefined) {
                        currentTerminalCore.printToWindow(
                            `The command "${commandName}" is not supported!`,
                            true,
                            true
                        );
                    } else {
                        currentTerminalCore.printToWindow(
                            `Description of ${commandName}: \n\n${commandObject.description}`,
                            false,
                            true
                        );
                    }
                    break;
                }
                default: {
                    currentTerminalCore.printToWindow(`Wrong grammar!\nUsage: man [command_name]`, false, true);
                }
            }
        },
        description: 'A detailed manual of the terminal simulator.\nUsage: man [command_name]',
    };

    // Finished
    supportedCommands['echo'] = {
        executable: (parameters) => {
            currentTerminalCore.printToWindow(
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

    // Update Needed
    supportedCommands['ls'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 0: { // print current folder info
                    currentTerminalCore.printToWindow(`${currentTerminalCore.getCurrentFolderPointer().getContentListAsString()}`, false, true);
                    break;
                }
                case 1: { // print the folder info of given path
                    try {
                        let path = parameters[0];
                        if (path[0] === '/') { // begin with '/', so the path is from the root
                            // The path is from the root, so we need a new_pointer!
                            path = path.slice(1); // take off the '/'
                            const tempFolderPointer = currentTerminalCore.getNewFolderPointer();
                            tempFolderPointer.gotoSubpath(path);
                            currentTerminalCore.printToWindow(`${tempFolderPointer.getContentListAsString()}`, false, true);
                        } else { // the path is not from the root
                            if (path[0] === '.' && path[1] === '/') { // begin with './'
                                path = path.slice(2);
                            }
                            const tempFolderPointer = currentTerminalCore.getCurrentFolderPointer().duplicate();
                            tempFolderPointer.gotoSubpath(path);
                            currentTerminalCore.printToWindow(`${tempFolderPointer.getContentListAsString()}`, false, true);
                        }
                    } catch (error) {
                        currentTerminalCore.printToWindow(`${error}`, false, true);
                    }
                    break;
                }
                default: {
                    currentTerminalCore.printToWindow(`Wrong grammar!\nUsage: ls [folder_path]`, false, true);
                }
            }
        },
        description: 'List all the folders and files.\nUsage: ls [folder_path]'
    };

    // Update Needed
    supportedCommands['mkdir'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 1: {
                    try {
                        let path = parameters[0];
                        if (path[0] === '/') { // begin with '/', so the path is from the root
                            // The path is from the root, so we need a new_pointer!
                            path = path.slice(1); // take off the '/'
                            currentTerminalCore.getNewFolderPointer().createSubpath(path);
                            currentTerminalCore.printToWindow(`Successfully created a path (${path}).`, false, true);
                        } else { // the path is not from the root
                            if (path[0] === '.' && path[1] === '/') { // begin with './'
                                path = path.slice(2);
                            }
                            currentTerminalCore.getCurrentFolderPointer().createSubpath(path);
                            currentTerminalCore.printToWindow(`Successfully created a path (./${path}).`, false, true);
                        }
                    } catch (error) {
                        currentTerminalCore.printToWindow(`${error}`, false, true);
                    }
                    break;
                }
                default: {
                    currentTerminalCore.printToWindow(`Wrong grammar!\nUsage: mkdir folder_name/folder_path`, false, true);
                }
            }
        },
        description: 'Make a new directory.\nUsage: mkdir folder_name/folder_path'
    };

    // Finished
    supportedCommands['pwd'] = {
        executable: (_) => {
            currentTerminalCore.printToWindow(
                currentTerminalCore.getCurrentFolderPointer().getFullPath(),
                false, true
            );
        },
        description: 'Print the current full path.'
    };

    // Finished
    supportedCommands['touch'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 1: {
                    try {
                        currentTerminalCore.getCurrentFolderPointer().createNewFile(parameters[0]);
                        currentTerminalCore.printToWindow(`Successfully create a file (${parameters[0]}).`, false, true);
                    } catch (error) {
                        currentTerminalCore.printToWindow(`${error}`, false, true);
                    }
                    break;
                }
                default: {
                    currentTerminalCore.printToWindow(`Wrong grammar!\nUsage: touch file_name`, false, true);
                }
            }
        },
        description: 'Make a new file in the current directory.\nUsage: touch file_name'
    };

    // Update Needed
    supportedCommands['cd'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 1: {
                    try {
                        let path = parameters[0];
                        const fp = currentTerminalCore.getCurrentFolderPointer();
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
                        currentTerminalCore.printToWindow(`Successfully went to the folder (${path}).`, false, true);
                    } catch (error) {
                        currentTerminalCore.printToWindow(`${error}`, false, true);
                    }
                    break;
                }
                default: {
                    currentTerminalCore.printToWindow(`Wrong grammar!\nUsage: cd folder_name/folder_path`, false, true);
                }
            }
        },
        description: 'Goto the given folder.\nUsage: cd folder_name/folder_path'
    };

    supportedCommands['rename'] = {
        executable: (parameters) => {

        },
        description: ''
    };

    supportedCommands['cp'] = {
        executable: (parameters) => {

        },
        description: ''
    };

    supportedCommands['edit'] = {
        executable: (parameters) => {
            //
        },
        description: ''
    };

    supportedCommands['wget'] = {
        executable: (parameters) => {
            switch (parameters.length) {
                case 1: {
                    const url = parameters[0];
                    // Example URL: https://static.vecteezy.com/system/resources/previews/036/333/113/large_2x/monarch-beautiful-butterflygraphy-beautiful-butterfly-on-flower-macrography-beautyful-nature-photo.jpg
                    try {
                        fetch(url)
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error(`Could not find ${parameters[0]}`);
                                }
                                return response.text();
                            })
                            .then((text) => {
                                const
                                    date = new Date(),
                                    filename = `wget_${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`;
                                currentTerminalCore.getCurrentFolderPointer().changeFileContent(
                                    filename,
                                    text
                                );
                                currentTerminalCore.printToWindow(`Success!`, false, true);
                            });
                    } catch (error) {
                        currentTerminalCore.printToWindow(`${error}`, false, true);
                    }
                    break;
                }
                default: {
                    currentTerminalCore.printToWindow(`Wrong grammar!\nUsage: wget html_link`, false, true);
                }
            }
        },
        description: 'Download file from html link.\nUsage: wget html_link'
    };

    supportedCommands['ping'] = {
        executable: (parameters) => {
            if (parameters.length === 0) {
                currentTerminalCore.printToWindow(`Usage: ping [hostname]`, false, true);
                return;
            }

            const fullCommand = `ping -c 4 ${parameters.join(" ")}`;
            currentTerminalCore.printToWindow(`Running: ${fullCommand}\n`, false, true);

            fetch('http://localhost:3000/api/run', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({command: fullCommand})
            })
                .then(res => res.text())
                .then(output => {
                    currentTerminalCore.printToWindow(output, false, true);
                })
                .catch(err => {
                    currentTerminalCore.printToWindow(`Error executing ping: ${err}`, false, true);
                });
        },
        description: 'Ping a domain or IP address.\nUsage: ping [hostname]'
    };

    supportedCommands['curl'] = {
        executable: (params) => {
            // Validate
            if (params.length !== 1) {
                currentTerminalCore.printToWindow("Usage: curl <url>\n", false, true);
                return;
            }
            // Pull the URL from params
            const url = params[0];

            // Print a fetch banner
            currentTerminalCore.printToWindow(`Fetching ${url} …\n`, false, true);

            fetch(`http://localhost:3000/api/proxy?url=${encodeURIComponent(url)}`)
                .then(res => {
                    // 5) Print status + headers
                    currentTerminalCore.printToWindow(
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
                    currentTerminalCore.printToWindow(
                        snippet + (body.length > 1000 ? "\n...[truncated]\n" : "\n"),
                        false,
                        true
                    );
                })
                .catch(err => {
                    currentTerminalCore.printToWindow(`curl failed: ${err.message}\n`, false, true);
                });
        },
        description: "Fetch a URL via your server proxy and show status, headers & a 1 000-char body snippet"
    };

    supportedCommands['files'] = {
        executable: (params) => {
            const fp = currentTerminalCore.getCurrentFolderPointer();
            const [action, ...rest] = params;

            switch (action) {
                case 'list': {
                    // show folders and files in current dir
                    const folders = fp.getSubfolderNames();
                    const files = fp.getFileNames();
                    currentTerminalCore.printToWindow(
                        `Folders:\n  ${folders.join('\n  ')}\n\n` +
                        `Files:\n  ${files.join('\n  ')}\n`,
                        false, true
                    );
                    break;
                }

                case 'read': {
                    // files read <filename>
                    if (rest.length !== 1) {
                        currentTerminalCore.printToWindow('Usage: files read <path>\n', false, true);
                        return;
                    }
                    try {
                        const content = fp.getFileContent(rest[0]);
                        currentTerminalCore.printToWindow(content + '\n', false, true);
                    } catch (e) {
                        currentTerminalCore.printToWindow(`files read failed: ${e.message}\n`, false, true);
                    }
                    break;
                }

                case 'create': {
                    // files create <filename> [initial content...]
                    if (rest.length < 1) {
                        currentTerminalCore.printToWindow('Usage: files create <path> [content]\n', false, true);
                        return;
                    }
                    const [path, ...txt] = rest;
                    try {
                        fp.createNewFile(path);
                        if (txt.length) fp.changeFileContent(path, txt.join(' '));
                        currentTerminalCore.printToWindow(`Created ${path}\n`, false, true);
                    } catch (e) {
                        currentTerminalCore.printToWindow(`files create failed: ${e.message}\n`, false, true);
                    }
                    break;
                }

                case 'update': {
                    // files update <filename> <new content...>
                    if (rest.length < 2) {
                        currentTerminalCore.printToWindow('Usage: files update <path> <content>\n', false, true);
                        return;
                    }
                    const [path, ...txt] = rest;
                    try {
                        fp.changeFileContent(path, txt.join(' '));
                        currentTerminalCore.printToWindow(`Updated ${path}\n`, false, true);
                    } catch (e) {
                        currentTerminalCore.printToWindow(`files update failed: ${e.message}\n`, false, true);
                    }
                    break;
                }

                case 'delete': {
                    // files delete <filename>
                    if (rest.length !== 1) {
                        currentTerminalCore.printToWindow('Usage: files delete <path>\n', false, true);
                        return;
                    }
                    try {
                        fp.deleteFile(rest[0]);
                        currentTerminalCore.printToWindow(`Deleted ${rest[0]}\n`, false, true);
                    } catch (e) {
                        currentTerminalCore.printToWindow(`files delete failed: ${e.message}\n`, false, true);
                    }
                    break;
                }

                case 'rename': {
                    // files rename <oldName> <newName>
                    if (rest.length !== 2) {
                        currentTerminalCore.printToWindow('Usage: files rename <old> <new>\n', false, true);
                        return;
                    }
                    try {
                        fp.renameExistingFile(rest[0], rest[1]);
                        currentTerminalCore.printToWindow(`Renamed ${rest[0]} → ${rest[1]}\n`, false, true);
                    } catch (e) {
                        currentTerminalCore.printToWindow(`files rename failed: ${e.message}\n`, false, true);
                    }
                    break;
                }

                default:
                    currentTerminalCore.printToWindow(
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

    supportedCommands['save'] = {
        description: 'Persist FS to SQLite',
        executable: () => {
          const cwd   = currentTerminalCore.getCurrentFolderPointer().getFullPath();
          const state = exportFS(fsRoot, cwd);
      
          fetch('http://localhost:3000/api/fs/save', {
            method: 'POST',                            
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state),               
          })
          .then(res => {
            if (!res.ok) throw new Error(res.statusText);
            currentTerminalCore.printToWindow('✅ Saved to SQLite', false, true);
          })
          .catch(err => {
            currentTerminalCore.printToWindow(`Save failed: ${err}`, false, true);
          });
        }
      };
      
      
      supportedCommands['load'] = {
        description: 'Load FS from SQLite',
        executable: () => {
          fetch('http://localhost:3000/api/fs/load')
            .then(res => res.json())
            .then(state => {
              importFS(fsRoot, state);                  
              // restore working directory
              const cwd = state.cwd.startsWith('/') ? state.cwd.slice(1) : state.cwd;
              if (cwd) currentTerminalCore.getCurrentFolderPointer().gotoPathFromRoot(cwd);
              currentTerminalCore.printToWindow('✅ Loaded from SQLite', false, true);
            })
            .catch(err => currentTerminalCore.printToWindow(`Load failed: ${err}`, false, true));
        }
      };
      

});

























