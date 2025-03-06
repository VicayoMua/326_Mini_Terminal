/*
*
* Using { terminalFilePointer, printToTerminal } from terminal_setup_core.js
*
* */

terminalCore.getSupportedCommands()['pwd'] = {
    executable: (parameters) => {
        terminalCore.printToWindow(`${terminalCore.getCurrentFolderPointer().getFullPath()}`, false, true);
    },
    description: 'Print the current full path.'
};