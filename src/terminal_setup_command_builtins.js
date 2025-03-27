const terminalCore = generateTerminalCore();

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
