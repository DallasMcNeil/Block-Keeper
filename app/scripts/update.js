// update.js
// Checks for new version and notifies user to update
// Block Keeper
// Created by Dallas McNeil

var update = function() {   
    
    // Check current version online and show banner if the versions don't match
    $.getJSON("https://dallasmcneil.com/projects/blockkeeper/version.json?nocache=" + (new Date()).getTime(), function(data) {
        var current = require('electron').remote.getGlobal('appDetails').version;
        $("#versionLabel").prop("innerHTML", "Version " + current);
        if (data.version !== current) {
            $("#versionBannerContainer").css("top", "0px");
        }
    })

    // Close download banner
    function closeBanner() {
        $("#versionBannerContainer").css("top", "-110px");
    }

    // Open download page in web browser 
    function downloadLatestVersion() {
        require('electron').shell.openExternal('https://dallasmcneil.com/projects/blockkeeper');
        closeBanner();
    }
    
    return {
        closeBanner:closeBanner,
        download:downloadLatestVersion
    }
}()