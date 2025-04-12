document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("upload-file-input");
    const previewBox = document.getElementById("upload-file-preview");
    const previewContent = document.getElementById("upload-file-content");
    const closeBtn = document.getElementById("close-preview-btn");
  
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
  
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const content = e.target.result;
  
        // ✅ Add to virtual FS
        try {
          const folderPointer = terminalCore.getCurrentFolderPointer();
          folderPointer.changeFile(file.name, content);
          terminalCore.printToWindow(`File "${file.name}" uploaded successfully.`, false, true);
        } catch (err) {
          terminalCore.printToWindow(`Upload failed: ${err.message}`, false, true);
          return;
        }
  
        // ✅ Show content in preview
        previewContent.innerText = `${file.name}\n\n${content}`;
        previewBox.style.display = "block";
      };
  
      reader.onerror = () => {
        previewContent.innerText = "Failed to read file.";
        previewBox.style.display = "block";
      };
  
      reader.readAsText(file);
    });
  
    closeBtn.addEventListener("click", () => {
      previewBox.style.display = "none";
      previewContent.innerText = "";
    });
  });
  