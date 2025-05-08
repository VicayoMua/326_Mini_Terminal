function openFileEditor(HTMLDivForTerminalWindow, fileName, orginalFileContent, callbackToSaveFile) {
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
        title.innerText = `Editing: ${fileName}`;
        title.style.marginTop = '0';
        title.style.color = '#fff';
        divEditorWindowContainer.appendChild(title);

        const textarea = document.createElement('textarea');
        textarea.value = orginalFileContent;
        textarea.rows = 20;
        textarea.style.width = '100%';
        textarea.style.boxSizing = 'border-box';
        textarea.style.fontFamily = 'monospace';
        textarea.style.fontSize = '14px';
        textarea.style.marginTop = '10px';
        textarea.style.backgroundColor = '#2e2e2e';
        textarea.style.color = '#eee';
        textarea.style.border = '1px solid #555';
        textarea.style.padding = '10px';
        textarea.style.borderRadius = '4px';
        divEditorWindowContainer.appendChild(textarea);

        const divButtons = document.createElement('div');
        divButtons.style.marginTop = '15px';
        divButtons.style.textAlign = 'right';
        {
            const buttonToSave = document.createElement('button');
            buttonToSave.innerText = '💾 Save';
            buttonToSave.style.marginRight = '10px';
            buttonToSave.style.padding = '6px 12px';
            buttonToSave.style.borderRadius = '4px';
            buttonToSave.style.border = 'none';
            buttonToSave.style.cursor = 'pointer';
            buttonToSave.style.backgroundColor = '#4CAF50';
            buttonToSave.style.color = 'white';
            buttonToSave.onclick = () => {
                callbackToSaveFile(textarea.value);
                divEditorWindowContainer.remove();
            };
            divButtons.appendChild(buttonToSave);

            const buttonToCancel = document.createElement('button');
            buttonToCancel.innerText = '✖ Cancel';
            buttonToCancel.style.padding = '6px 12px';
            buttonToCancel.style.borderRadius = '4px';
            buttonToCancel.style.border = 'none';
            buttonToCancel.style.cursor = 'pointer';
            buttonToCancel.style.backgroundColor = '#f44336';
            buttonToCancel.style.color = 'white';
            buttonToCancel.onclick = () => {
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