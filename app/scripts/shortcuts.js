// shortcuts.js
// Event listener for shortcuts being pressed and menu items
// Block Keeper
// Created by Dallas McNeil

(function() {
    const {webFrame} = require('electron');

    // Recieve shortcuts and perform the acording actions
    require('electron').ipcRenderer.on('shortcut', function(event, message) { 
        if (message === "CommandOrControl+R") {
            events.reloadApp();
        } else if (message === "CommandOrControl+Plus") {
            if (webFrame.getZoomFactor() < 2) {
                webFrame.setZoomFactor(webFrame.getZoomFactor() * 1.2);
                windowBar.resizeWindowBar(webFrame.getZoomFactor());
            }
        } else if (message === "CommandOrControl+-") {
            if (webFrame.getZoomFactor() > 0.5) {
                webFrame.setZoomFactor(webFrame.getZoomFactor() / 1.2);
                windowBar.resizeWindowBar(webFrame.getZoomFactor());
            }
        } else if ((events.sessionButtonsShowing() || !globals.menuOpen) && !timer.timerRunning() && message === "CommandOrControl+E") {
            events.toggleSessionButtons();
        } else if (!timer.timerRunning() && !globals.menuOpen) {
            if (message === "CommandOrControl+1") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.recordResultOK();
            } else if (message === "CommandOrControl+2") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.recordResult2();
            } else if (message === "CommandOrControl+3") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.recordResultDNF();
            } else if (message === "CommandOrControl+Backspace") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.deleteRecord();
            } else if (message === "CommandOrControl+N") {
                events.createSession();
                events.setSessionOptions($("#sessionSelect")[0]);
            } else if (message === "CommandOrControl+Left") {
                scramble.previousScramble();
            } else if (message === "CommandOrControl+Right") {
                scramble.nextScramble();
            } else if (message === "CommandOrControl+R") {
                events.openTimeDialog();
            } else if (message === "CommandOrControl+,") {
                prefs.openPreferences();
            } else if (message === "CommandOrControl+P") {
                if (record.hasVideo() && preferences.recordSolve && !record.recording()) {
                    record.openPreview();
                }
            }
        }
    })
}())