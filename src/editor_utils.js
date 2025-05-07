function showEditor(fileName, orginalFileContent, callbackToSaveFile) {
    // remove any potentially existing terminal file editor
    const existingEditor = document.getElementById('terminal-file-editor');
    if (existingEditor) existingEditor.remove();
    // set up a new terminal file editor
    const container = document.createElement('div');
    container.id = 'terminal-file-editor';
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.backgroundColor = '#1e1e1e';
    container.style.padding = '20px';
    container.style.border = '2px solid #888';
    container.style.borderRadius = '8px';
    container.style.zIndex = '9999';
    container.style.color = '#eee';
    container.style.width = '80%';
    container.style.maxWidth = '800px';
    {
        const title = document.createElement('h3');
        title.innerText = `Editing: ${fileName}`;
        title.style.marginTop = '0';
        title.style.color = '#fff';
        container.appendChild(title);

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
        container.appendChild(textarea);

        const buttons = document.createElement('div');
        buttons.style.marginTop = '15px';
        buttons.style.textAlign = 'right';
        {
            const saveBtn = document.createElement('button');
            saveBtn.innerText = '💾 Save';
            saveBtn.style.marginRight = '10px';
            saveBtn.style.padding = '6px 12px';
            saveBtn.style.borderRadius = '4px';
            saveBtn.style.border = 'none';
            saveBtn.style.cursor = 'pointer';
            saveBtn.style.backgroundColor = '#4CAF50';
            saveBtn.style.color = 'white';
            saveBtn.onclick = () => {
                callbackToSaveFile(textarea.value);
                container.remove();
            };
            buttons.appendChild(saveBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.innerText = '✖ Cancel';
            cancelBtn.style.padding = '6px 12px';
            cancelBtn.style.borderRadius = '4px';
            cancelBtn.style.border = 'none';
            cancelBtn.style.cursor = 'pointer';
            cancelBtn.style.backgroundColor = '#f44336';
            cancelBtn.style.color = 'white';
            cancelBtn.onclick = () => {
                container.remove();
            };
            buttons.appendChild(cancelBtn);
        }
        container.appendChild(buttons);
    }
    document.body.appendChild(container);
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