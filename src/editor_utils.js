function openFileEditor(HTMLDivForTerminalWindow, fileName, orginalFileContent, callbackToSaveFile, callbackToCancelEdit) {
    const divEditorWindowContainer = document.createElement('div');
    divEditorWindowContainer.style.position = 'fixed';
    divEditorWindowContainer.style.top = '50%';
    divEditorWindowContainer.style.left = '50%';
    divEditorWindowContainer.style.transform = 'translate(-50%, -50%)';
    divEditorWindowContainer.style.backgroundColor = '#1e1e1e';
    divEditorWindowContainer.style.padding = '20px';
    divEditorWindowContainer.style.border = '2px solid #888';
    divEditorWindowContainer.style.borderRadius = '8px';
    divEditorWindowContainer.style.zIndex = '9999';
    divEditorWindowContainer.style.width = '60%';
    {
        // the title of the editor window
        const title = document.createElement('h3');
        title.innerText = `Editing File: ${fileName}`;
        title.style.marginTop = '0';
        title.style.color = '#fff';
        divEditorWindowContainer.appendChild(title);

        // Ace-Editor container
        const aceEditorContainer = document.createElement('div');
        aceEditorContainer.style.height = '600px'; // Set height for the editor
        // Initialize Ace-Editor
        const aceEditor = ace.edit(aceEditorContainer); // Create Ace editor in the div container
        aceEditor.setValue(orginalFileContent);  // Set the initial content of the file
        aceEditor.setTheme("ace/theme/monokai");  // Set the theme for the editor
        aceEditor.session.setMode("ace/mode/javascript");  // Set the mode (e.g., JavaScript)
        aceEditor.setOptions({
            fontSize: "14px",   // Set font size
            showPrintMargin: false, // Disable the print margin
            enableBasicAutocompletion: true, // Enable autocompletion
            enableSnippets: true, // Enable code snippets
            enableLiveAutocompletion: true // Enable live autocompletion
        });
        {
            // // Resize handle (bottom-right corner)
            // const resizeHandle = document.createElement('div');
            // resizeHandle.style.position = 'absolute';
            // resizeHandle.style.right = '5px';
            // resizeHandle.style.bottom = '5px';
            // resizeHandle.style.width = '15px';
            // resizeHandle.style.height = '15px';
            // resizeHandle.style.backgroundColor = '#888';
            // resizeHandle.style.cursor = 'se-resize'; // Indicates it's for resizing
            // // Function to handle resizing
            // let isResizing = false;
            // let lastDownX = 0;
            // let lastDownY = 0;
            //
            // function resizeWindow(e) {
            //     if (!isResizing) return;
            //     const dx = e.clientX - lastDownX;
            //     const dy = e.clientY - lastDownY;
            //
            //     const newWidth = divEditorWindowContainer.offsetWidth + dx;
            //     const newHeight = divEditorWindowContainer.offsetHeight + dy;
            //
            //     // Update the width and height of the editor window
            //     divEditorWindowContainer.style.width = `${newWidth}px`;
            //     divEditorWindowContainer.style.height = `${newHeight}px`;
            //
            //     lastDownX = e.clientX;
            //     lastDownY = e.clientY;
            // }
            //
            // resizeHandle.addEventListener('mousedown', (e) => {
            //     e.preventDefault(); // Prevent text selection while resizing
            //     isResizing = true;
            //     lastDownX = e.clientX;
            //     lastDownY = e.clientY;
            //
            //     // Mousemove listener to adjust the window size
            //     document.addEventListener('mousemove', resizeWindow, false);
            //
            //     // Mouseup listener to stop resizing
            //     document.addEventListener('mouseup', () => {
            //         isResizing = false;
            //         document.removeEventListener('mousemove', resizeWindow, false);
            //     }, false);
            // });
            // divEditorWindowContainer.appendChild(resizeHandle);
        }
        divEditorWindowContainer.appendChild(aceEditorContainer);

        // exit buttons
        const divExitButtons = document.createElement('div');
        divExitButtons.style.marginTop = '15px';
        divExitButtons.style.textAlign = 'right';
        {
            function initializeButtonProperties(buttonElement) {
                buttonElement.style.padding = '6px 12px';
                buttonElement.style.borderRadius = '4px';
                buttonElement.style.border = 'none';
                buttonElement.style.cursor = 'pointer';
                buttonElement.style.color = 'white';
                buttonElement.onmouseenter = () => {
                    buttonElement.style.transform = 'translateY(-1.5px)'; // Apply the lift effect
                };
                buttonElement.onmouseleave = () => {
                    buttonElement.style.transform = ''; // Reset transform to original state when hover ends
                };
                buttonElement.onmousedown = () => {
                    buttonElement.style.transform = 'translateY(0)'; // Reset to original position on click
                };
                buttonElement.onmouseup = () => {
                    buttonElement.style.transform = 'translateY(-1.5px)'; // Apply the lift effect when mouse button is released
                };
            }

            const buttonToSave = document.createElement('button');
            buttonToSave.innerText = '💾 Save';
            buttonToSave.style.backgroundColor = '#4CAF50';
            buttonToSave.style.marginRight = '10px';
            initializeButtonProperties(buttonToSave);
            buttonToSave.onclick = () => {
                callbackToSaveFile(aceEditor.getValue());
                divEditorWindowContainer.remove();
            };
            divExitButtons.appendChild(buttonToSave);

            const buttonToCancel = document.createElement('button');
            buttonToCancel.innerText = '✖ Cancel';
            buttonToCancel.style.backgroundColor = '#f44336';
            initializeButtonProperties(buttonToCancel);
            buttonToCancel.onclick = () => {
                callbackToCancelEdit();
                divEditorWindowContainer.remove();
            };
            divExitButtons.appendChild(buttonToCancel);
        }
        divEditorWindowContainer.appendChild(divExitButtons);
    }
    HTMLDivForTerminalWindow.appendChild(divEditorWindowContainer);
}