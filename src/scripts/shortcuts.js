// shortcuts.js
// Event listener for shortcuts being pressed and menu items
// Block Keeper
// Created by Dallas McNeil

// Recieve shortcuts and perform the acording actions
require('electron').ipcRenderer.on('shortcut', function(event, message) { 
    if (message=="CommandOrControl+1") {
        currentRecord = puzzles[currentPuzzle].sessions[currentSession].records.length-1
        recordResultOK()
        updateRecords()
    } else if (message=="CommandOrControl+2") {
        currentRecord = puzzles[currentPuzzle].sessions[currentSession].records.length-1
        recordResult2()
        updateRecords()
    } else if (message=="CommandOrControl+3") {
        currentRecord = puzzles[currentPuzzle].sessions[currentSession].records.length-1
        recordResultDNF()
        updateRecords()
    } else if (message=="CommandOrControl+Backspace") {
        currentRecord = puzzles[currentPuzzle].sessions[currentSession].records.length-1
        deleteRecord()
    } else if (message=="CommandOrControl+N") {
        createSession()
        updateSessions()
        updateRecords()
    } else if (message=="CommandOrControl+E") {
        toggleSessionButtons()
    } else if (message=="CommandOrControl+S") {
        scramble()
    } else if (message=="CommandOrControl+T") {
        showTimeDialog()
    } else if (message=="CommandOrControl+P") {
        openPreferences()
    } else if (message=="CommandOrControl+R") {
        if (hasVideo && preferences.recordSolve) {
            showPreview()
        }
    }
});