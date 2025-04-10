document.addEventListener('DOMContentLoaded', function() {
    initRouter();
});


function initRouter() {
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();
}

function handleRouteChange() {
    const view = window.location.hash.slice(1) || 'terminal';
    const terminalContainer = document.getElementById('terminal-container');
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) {
        console.error('Error: The element with id "view-container" was not found. ' +
                      'Please add a <div id="view-container"></div> in your HTML.');
        return;
    }
    switch (view) {
        case 'terminal':
            terminalContainer.style.display = 'block';
            viewContainer.style.display = 'none';
            break;

        case 'settings':
            terminalContainer.style.display = 'none';
            viewContainer.style.display = 'block';
            viewContainer.innerHTML = `
                <h1>Settings</h1>
                <p>Manage your settings here.</p>
            `;
            break;

        case 'about':
            // Hide the terminal and show an about view in view-container
            terminalContainer.style.display = 'none';
            viewContainer.style.display = 'block';
            viewContainer.innerHTML = `
                <h1>About</h1>
                <p>This Mini Terminal application was built by Vicayo Zhang, Aryan Ghosh, and Stella Dey.</p>
            `;
            break;
            
        default:
            // For any other undefined view, display a 404 message
            terminalContainer.style.display = 'none';
            viewContainer.style.display = 'block';
            viewContainer.innerHTML = `
                <h1>404 - Not Found</h1>
                <p>The view "${view}" does not exist.</p>
            `;
            break;
    }
}
