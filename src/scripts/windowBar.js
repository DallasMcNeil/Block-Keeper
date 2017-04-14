// windowBar.js
// Adds menu bar gap on Mac if not fullscreen
// Block Keeper
// Created by Dallas McNeil

var hiddenTitleBar = false

// Make titlebar large if Mac
if (require('electron').remote.getGlobal('sharedObj').titleBar == "hidden") {
    hiddenTitleBar = true
    $('#titleBarStyle')[0].href = "styles/macWindowBar.css"
}

// Hide titlebar if fullscreen
require('electron').ipcRenderer.on('fullscreen', function(event, message) { 
    if (hiddenTitleBar) {
        if (message=="enter") {
            $('#titleBarStyle')[0].href = "styles/standardWindowBar.css"
        } else if (message=="leave") {
            $('#titleBarStyle')[0].href = "styles/macWindowBar.css"
        }
    }
})


