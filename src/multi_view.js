function switchView(view) {
    const container = document.getElementById('view-container');
    if (!container) {
        console.error("View container not found!");
        return;
    }

    // switch statement to determine which view to load
    switch (view) {
        case 'terminal':
            container.innerHTML = `
        <div class="terminal-view">
          <h2>Terminal View</h2>
          <p>This is the terminal interface.</p>
        </div>
      `;
            break;
        case 'settings':
            container.innerHTML = `
        <div class="settings-view">
          <h2>Settings</h2>
          <p>Configure your settings here.</p>
        </div>
      `;
            break;
        case 'about':
            container.innerHTML = `
        <div class="about-view">
          <h2>About</h2>
          <p>Information about the Mini Terminal application.</p>
        </div>
      `;
            break;
        default:
            container.innerHTML = `
        <div class="error-view">
          <h2>Error</h2>
          <p>The view "${view}" does not exist.</p>
        </div>
      `;
    }

    //Update the browser URL without reloading using History API
    history.pushState({view: view}, view, '#' + view);
}

window.onpopstate = function (event) {
    if (event.state && event.state.view) {
        switchView(event.state.view);
    }
};

window.addEventListener('load', () => {
    // Default view set to terminal
    const defaultView = window.location.hash.substring(1) || 'terminal';
    switchView(defaultView);
});
