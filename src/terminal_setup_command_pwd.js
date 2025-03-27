/*
*
* Using { terminalFilePointer, printToTerminal } from terminal_core_generator.js
*
* */

terminalCore.getSupportedCommands()['pwd'] = {
    executable: (parameters) => {

    },
    description: 'Print the current full path.'
};