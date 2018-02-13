// windowBar.js
// Adds menu bar gap on Mac if not fullscreen
// Block Keeper
// Created by Dallas McNeil

var windowBar = function() {
    
    // If the windowbar is hidden
    var hiddenWindowBar = false;

    // Allow windowbar to be large if MacOS
    if (require('electron').remote.getGlobal('appDetails').titleBar === "hidden") {
        hiddenWindowBar = true;
        $('#titleBarStyle')[0].href = "styles/macWindowBar.css";
    }

    // Make large windowbar when not fullscreen 
    require('electron').ipcRenderer.on('fullscreen', function(event, message) { 
        if (!hiddenWindowBar) {
            if (message === "enter") {
                $('#titleBarStyle')[0].href = "styles/standardWindowBar.css";
            } else if (message === "leave") {
                $('#titleBarStyle')[0].href = "styles/macWindowBar.css";
            }
        }
    })
    
    function resizeWindowBar(factor) {
        if (hiddenWindowBar) {
            $("#windowBar").css("height", (22 / factor) + "px");
            $("#content").css("top", (22 / factor) + "px");
            $("#scramble").css("height", (5 + (22 / factor)) + "px");
            $("#stats").css("height", (5 + (22 / factor)) + "px");
        }
    }
    
    return {
        resizeWindowBar:resizeWindowBar
    }
}()

