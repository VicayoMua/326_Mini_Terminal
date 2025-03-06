/*
*
* The command "cd" uses session
*
* */
terminalCore.getSupportedCommands()['cd'] = {
    executable: (parameters) => {

    },
    description: 'Goto the given path.'
};
