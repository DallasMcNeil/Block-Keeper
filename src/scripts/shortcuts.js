// shortcuts.js
// Event listener for shortcuts being pressed and menu items
// Block Keeper
// Created by Dallas McNeil

(function() {
    
    // Recieve shortcuts and perform the acording actions
    require('electron').ipcRenderer.on('shortcut', function(event, message) { 
        if (timerState === "normal" && !globals.menuOpen) {
            if (message === "CommandOrControl+1") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.recordResultOK();
                events.updateRecords();
            } else if (message === "CommandOrControl+2") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.recordResult2();
                events.updateRecords();
            } else if (message === "CommandOrControl+3") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.recordResultDNF();
                events.updateRecords();
            } else if (message === "CommandOrControl+Backspace") {
                events.setCurrentRecord(events.getCurrentSession().records.length - 1);
                events.deleteRecord();
            } else if (message === "CommandOrControl+N") {
                events.createSession();
                events.setSessionOptions($("#sessionSelect")[0]);
                events.updateRecords();
            } else if (message === "CommandOrControl+E") {
                events.toggleSessionButtons();
            } else if (message === "CommandOrControl+S") {
                scramble.scramble();
            } else if (message === "CommandOrControl+T") {
                events.showTimeDialog();
            } else if (message === "CommandOrControl+,") {
                openPreferences();
            } else if (message === "CommandOrControl+R") {
                if (record.hasVideo() && preferences.recordSolve && !record.recording()) {
                    record.openPreview();
                }
            }
        }
    })
}())