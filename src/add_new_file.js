// Toggle form visibility when "Add Local File" is clicked
document.querySelectorAll("button").forEach((btn) => {
    if (btn.textContent.includes("Add New File")) {
      btn.onclick = () => {
        const form = document.getElementById("add-file-form");
        form.style.display = form.style.display === "none" ? "block" : "none";
      };
    }
  });
  
  function validateFilename() {
    const input = document.getElementById("filename-input");
    const feedback = document.getElementById("filename-feedback");
    const value = input.value.trim();
  
    if (value === "") {
      feedback.textContent = "Filename cannot be empty.";
      feedback.style.color = "red";
      return false;
    } else if (!/^[\w\-\.]+$/.test(value)) {
      feedback.textContent = "Filename contains invalid characters.";
      feedback.style.color = "red";
      return false;
    } else {
      feedback.textContent = "✓ Valid filename.";
      feedback.style.color = "green";
      return true;
    }
  }
  
  window.submitFile = function () {
    if (!validateFilename()) {
      alert("Please fix the filename before submitting.");
      return;
    }
  
    const filename = document.getElementById("filename-input").value.trim();
  
    try {
      const folderPointer = terminalCore.getCurrentFolderPointer();
      folderPointer.changeFile(filename, ""); // create file with empty content
  
      // Feedback in terminal
      terminalCore.printToWindow(`File "${filename}" created in current directory.`, false, true);
    } catch (err) {
      terminalCore.printToWindow(`Error creating file: ${err.message}`, false, true);
    }
  
    // Reset and close form
    document.getElementById("filename-input").value = "";
    document.getElementById("filename-feedback").textContent = "";
    document.getElementById("add-file-form").style.display = "none";
  };
  