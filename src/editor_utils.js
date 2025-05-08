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
    divEditorWindowContainer.style.color = '#eee';
    divEditorWindowContainer.style.width = '80%';
    divEditorWindowContainer.style.maxWidth = '800px';
    {
        const title = document.createElement('h3');
        title.innerText = `File: ${fileName}`;
        title.style.marginTop = '0';
        title.style.color = '#fff';
        divEditorWindowContainer.appendChild(title);

        // Editor container
        const editorContainer = document.createElement('div');
        editorContainer.style.height = '600px'; // Set height for the editor
        divEditorWindowContainer.appendChild(editorContainer);
        // Initialize Ace Editor
        const editor = ace.edit(editorContainer); // Create Ace editor in the div container
        editor.setValue(orginalFileContent);  // Set the initial content of the file
        editor.setTheme("ace/theme/monokai");  // Set the theme for the editor
        editor.session.setMode("ace/mode/javascript");  // Set the mode (e.g., JavaScript)
        editor.setOptions({
            fontSize: "14px",   // Set font size
            showPrintMargin: false, // Disable the print margin
            enableBasicAutocompletion: true, // Enable autocompletion
            enableSnippets: true, // Enable code snippets
            enableLiveAutocompletion: true // Enable live autocompletion
        });

        const divButtons = document.createElement('div');
        divButtons.style.marginTop = '15px';
        divButtons.style.textAlign = 'right';
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
                callbackToSaveFile(editor.getValue());
                divEditorWindowContainer.remove();
            };
            divButtons.appendChild(buttonToSave);

            const buttonToCancel = document.createElement('button');
            buttonToCancel.innerText = '✖ Cancel';
            buttonToCancel.style.backgroundColor = '#f44336';
            initializeButtonProperties(buttonToCancel);
            buttonToCancel.onclick = () => {
                callbackToCancelEdit();
                divEditorWindowContainer.remove();
            };
            divButtons.appendChild(buttonToCancel);
        }
        divEditorWindowContainer.appendChild(divButtons);
    }
    HTMLDivForTerminalWindow.appendChild(divEditorWindowContainer);
}


// try {
//     tfp.changeFileContent(fileName, newFileContent);
//     currentTerminalCore.printToWindow(`✅ ${fileName} updated in memory.`, false, true);
//       /*Save the current in-memory file system to the backend SQLite DB.*/
//       async function saveFSState(fsRoot) {
//           try {
//               await fetch('/api/fs/save', {
//                   method: 'POST',
//                   headers: { 'Content-Type': 'application/json' },
//                   body: JSON.stringify(fsRoot),
//               });
//               console.log('🗄️ File system saved.');
//           } catch (err) {
//               console.error('❌ Failed to save file system:', err);
//           }
//       }
//     await saveFSState(fsRoot);
//     currentTerminalCore.printToWindow(`🗄️ File system saved to database.`, false, true);
// } catch (saveError) {
//     currentTerminalCore.printToWindow(`❌ Error while saving: ${saveError.message}`, false, true);
// }