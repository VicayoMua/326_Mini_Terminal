/*
*
* Using { terminalFilePointer, printToTerminal } from terminal_setup_core.js
*
* */

terminalCore.getSupportedCommands()['pwd'] = {
    executable: (parameters) => {

    },
    description: 'Print the current full path.'
};