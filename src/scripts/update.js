// update.js
// Checks for new version and notifies user to update
// Block Keeper
// Created by Dallas McNeil

// Check current version online and show banner if so
$.getJSON("https://dallasmcneil.com/projects/blockkeeper/version.json?nocache="+(new Date()).getTime(), function(data) {
    var version = data.version
    var current = require('electron').remote.getGlobal('sharedObj').version
    $("#versionLabel").prop("innerHTML","Version "+current)
    if (version != current) {
        $("#versionBannerContainer").css("top","0px")
    }
});

// Close download banner
function closeVersion() {
    $("#versionBannerContainer").css("top","-110px")
}

// Open download page in web browser 
function downloadLatestVersion() {
    require('electron').shell.openExternal('https://dallasmcneil.com/projects/blockkeeper')
    closeVersion()
}