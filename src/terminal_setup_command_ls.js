/*
*
* */

terminalCore.getSupportedCommands()['ls'] = (() => {
    // Inner Environment
    const newFolderPointer = terminalCore.createFolderPointer();

    return {
        executable: (parameters) => {
            switch (parameters.length) {
                case 0: { // print current folder info
                    terminalCore.printToWindow(`${terminalCore.getCurrentFolderPointer().getContentListAsString()}`, false, true);
                    break;
                }
                case 1: { // print the folder info of given path
                    try {
                        newFolderPointer.gotoRoot();
                        parameters[0].split('/').forEach((folderName) => {
                            if (folderName.length > 0) // maybe meet "/" which yields ""
                                newFolderPointer.gotoSubfolder(folderName);
                        });
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
})();