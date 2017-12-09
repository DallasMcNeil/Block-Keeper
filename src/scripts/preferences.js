// preferences.js
// Manages preferences and preferences menu including functionality
// Block Keeper
// Created by Dallas McNeil

const storage = require('electron-json-storage'); 
var remote = require('electron').remote; 
const {remote:{dialog}} = require('electron');
var fs = require('fs');
const {clipboard} = require('electron')
const app = remote.app

// Default preferences overrided by loaded preferences
var preferences = {
    theme:0,
    customTheme:["#181818",
     "#F0F0F0",
     "#B0B0B0",
     "#303030",
     "#606060",
     "#E0E0E0"],
    inspection:false,
    split:false,
    timerDetail:2,
    hideTimer:false,
    voice:"none",
    formatTime:true,
    recordSolve:false,
    endSplit:false,
    stackmat:false,
    leftKey:"z",
    rightKey:"/",
    OHSplit:false,
    scrambleSize:4,
    backgroundImage:"",
    autosaveLocation:"",
    timerDelay:0.55,
    scrambleAlign:"right",
    showBestTime:true,
    useMouse:false,
    extendedVideos:false,
    scramblesInList:true,
    metronomeBPM:90
}

var s7voice = new Audio("sounds/male8s.mp3")
var s3voice = new Audio("sounds/male12s.mp3")
var preferencesInterface = document.forms[2]
var preferencesTimer = document.forms[1]
var preferencesGeneral = document.forms[0]
var timerText = document.getElementById("timer")
timerText.innerHTML = (0).toFixed(preferences.timerDetail)

// Saves preferences to file
function savePreferences() {
    /*fs.writeFile(app.getAppPath()+"/data/preferences.json", JSON.stringify(preferences), function(err) {
        if (err) {
            return console.log(err);
        }
    })*/
    storage.set("preferences",preferences,function(error){})
    setStylesheet()
    $("#centreBackground").css("background-image",'url("'+preferences.backgroundImage+'")') 
    $("#scramble").css("text-align",preferences.scrambleAlign)
    $("#scramble").css("font-size",preferences.scrambleSize+"vh")
    $("#scramble").css("line-height",preferences.scrambleSize+"vh")
    
    if (preferences.voice != "none") {
        s7voice = new Audio("sounds/"+preferences.voice+"8s.mp3")
        s3voice = new Audio("sounds/"+preferences.voice+"12s.mp3")
    }
}

// Loads preferences from file and fills in preferences forms
function loadPreferences() {
    var setup = function () {
        setStylesheet()
        savePreferences()

        if (!isNaN(parseInt(preferences.theme))||preferences.theme == "custom") {
            preferencesInterface.theme.value = preferences.theme
        } else {
            preferencesInterface.theme.value = 0
        }

        preferencesTimer.inspection.checked = preferences.inspection
        preferencesTimer.splitMode.checked = preferences.split
        preferencesTimer.endSplit.checked = preferences.endSplit
        preferencesGeneral.timerDetail.value = preferences.timerDetail
        preferencesTimer.hideTiming.checked = preferences.hideTiming
        preferencesGeneral.recordSolve.checked = preferences.recordSolve
        preferencesTimer.voice.value = preferences.voice
        preferencesGeneral.formatTime.checked = preferences.formatTime
        preferencesTimer.stackmat.checked = preferences.stackmat
        preferencesTimer.leftKey.value = preferences.leftKey  
        preferencesTimer.rightKey.value = preferences.rightKey 
        preferencesInterface.scrambleSize.value = preferences.scrambleSize+""
        preferencesInterface.backgroundImage.value = preferences.backgroundImage
        preferencesTimer.timerDelay.value = preferences.timerDelay
        preferencesGeneral.autosaveLocation.value = preferences.autosaveLocation
        preferencesTimer.OHSplit.checked = preferences.OHSplit
        preferencesInterface.scrambleAlign.value = preferences.scrambleAlign
        preferencesInterface.showBestTime.checked = preferences.showBestTime
        preferencesTimer.useMouse.checked = preferences.useMouse
        preferencesGeneral.extendedVideos.checked = preferences.extendedVideos
        preferencesGeneral.scramblesInList.checked = preferences.scramblesInList

        timerText.innerHTML = (0).toFixed(preferences.timerDetail)
        writeTheme(preferences.customTheme) 
        $("#centreBackground").css("background-image",'url("'+preferences.backgroundImage+'")')
        $("#scramble").css("text-align",preferences.scrambleAlign)

        if (preferences.stackmat) {
            stackmat.init()
            stackmat.setCallBack(SMCallback)
        }

        if (preferences.recordSolve) {
            record.setupRecorder()
        }
    }
    
    //fs.readFile(app.getAppPath()+"/data/preferences.json",function (err,data) {
    //    if (err) {
            // Look in default location, if data hasn't been setup in data folder yet
            storage.get("preferences",function(error,object) {
                if (error) {
                    savePreferences()
                } else {
                    preferences = Object.assign({},preferences,object)
                }
                setup()
            })
    /*    } else {
            var object = JSON.parse(data)
            preferences = Object.assign({},preferences,object)
            setup()
        }
    })*/
}

// Initialise preferences dialog
$("#dialogPreferences").dialog({
    autoOpen : false,
    modal : true,
    show:"fade",
    hide:"fade",
    position: {
        my:"center",
        at:"center",
        of:"#background"
    },
    width: "520",
    height: "520" 
}).on('keydown',function(evt) {
    if (evt.keyCode === $.ui.keyCode.ESCAPE) {
        closePreferences()
    } else if (evt.keyCode === 13) {
        savePreferencesForm()
        evt.preventDefault();
    }        
    evt.stopPropagation();
});

var preferencesOpen = false

// Open preferences dialog
function openPreferences() {
    if ($('#dialogPreferences').dialog('isOpen')) {
        closePreferences()
    } else { 
        $("#dialogPreferences").dialog("open")
        $("#stats").addClass("disabled")
        $("#timer").addClass("disabled")
        $("#scramble").addClass("disabled")
        $("#previewButton").addClass("disabled")
        $("#stats").prop("disabled",true)
        $("#timer").prop("disabled",true)
        $("#scramble").prop("disabled",true)
        $("#previewButton").prop("disabled",true)
        $("#puzzleSelect").prop('disabled', true)
        $("#sessionSelect").prop('disabled', true)
        $("#sessionButton").prop('disabled', true)
        $("#toolSelect").prop('disabled', true)
        $("#tools").prop('disabled', true)
        $("#toolSelect").addClass("disabled")
        $("#tools").addClass("disabled")
        
        $("#addToolButton").prop('disabled', true)
        $("#addToolButton").addClass("disabled")
        if (timerState == "inspectReady") {
            cancelTimer()
        }
        
        preferencesOpen = true
    }
}

// Close preferences dialog and reset forms
function closePreferences() {
    preferencesInterface.theme.value = preferences.theme
    preferencesTimer.inspection.checked = preferences.inspection
    preferencesTimer.splitMode.checked = preferences.split
    preferencesTimer.endSplit.checked = preferences.endSplit
    preferencesGeneral.timerDetail.value = preferences.timerDetail
    preferencesTimer.hideTiming.checked = preferences.hideTiming
    preferencesTimer.voice.value = preferences.voice
    preferencesGeneral.formatTime.checked = preferences.formatTime
    preferencesGeneral.recordSolve.checked = preferences.recordSolve
    preferencesTimer.timerDelay.value = preferences.timerDelay
    preferencesTimer.stackmat.checked = preferences.stackmat  
    preferencesTimer.leftKey.value = preferences.leftKey  
    preferencesTimer.rightKey.value = preferences.rightKey 
    preferencesInterface.scrambleSize.value = preferences.scrambleSize
    preferencesInterface.backgroundImage.value = preferences.backgroundImage
    preferencesGeneral.autosaveLocation.value = preferences.autosaveLocation
    preferencesTimer.OHSplit.checked = preferences.OHSplit
    preferencesInterface.scrambleAlign.value = preferences.scrambleAlign
    preferencesInterface.showBestTime.checked = preferences.showBestTime
    preferencesTimer.useMouse.checked = preferences.useMouse
    preferencesGeneral.extendedVideos.checked = preferences.extendedVideos
    preferencesGeneral.scramblesInList.checked = preferences.scramblesInList
          
    writeTheme(preferences.customTheme)
    
    if (preferences.stackmat) {
        stackmat.stop()
        stackmat.init()
        stackmat.setCallBack(SMCallback)
    } else {
        stackmat.stop()
    }
    
    timerText.innerHTML = (0).toFixed(preferences.timerDetail)
       
    $("#dialogPreferences").dialog("close")
    $("#stats").removeClass("disabled")
    $("#timer").removeClass("disabled")
    $("#scramble").removeClass("disabled")
    $("#stats").prop("disabled",false)
    $("#timer").prop("disabled",false)
    $("#scramble").prop("disabled",false)
    $("#puzzleSelect").prop('disabled', false)
    $("#sessionSelect").prop('disabled', false)
    $("#sessionButton").prop('disabled', false)
    $("#toolSelect").prop('disabled', false)
    $("#tools").prop('disabled', false)
    $("#toolSelect").removeClass("disabled")
    $("#tools").removeClass("disabled")
    $("#addToolButton").prop('disabled', false)
    $("#addToolButton").removeClass("disabled")
        
    if (record.hasVideo() && preferences.recordSolve && !videoLoading) {
        $("#previewButton").removeClass("disabled")
        $("#previewButton").prop("disabled",false)
    }
    
    record.setupRecorder()
    setStylesheet()
    
    preferencesOpen = false
}

// Save preferences and close dialog
function savePreferencesForm() {
    preferences.theme = preferencesInterface.theme.value
    preferences.inspection = preferencesTimer.inspection.checked
    preferences.split = preferencesTimer.splitMode.checked
    preferences.endSplit = preferencesTimer.endSplit.checked        
    preferences.timerDetail = preferencesGeneral.timerDetail.value
    preferences.hideTiming = preferencesTimer.hideTiming.checked
    preferences.voice = preferencesTimer.voice.value
    preferences.formatTime = preferencesGeneral.formatTime.checked
    preferences.recordSolve = preferencesGeneral.recordSolve.checked
    preferences.stackmat = preferencesTimer.stackmat.checked 
    preferences.scrambleSize = preferencesInterface.scrambleSize.value 
    preferences.backgroundImage = preferencesInterface.backgroundImage.value
    preferences.timerDelay = preferencesTimer.timerDelay.value
    preferences.autosaveLocation = preferencesGeneral.autosaveLocation.value 
    preferences.OHSplit = preferencesTimer.OHSplit.checked 
    preferences.scrambleAlign = preferencesInterface.scrambleAlign.value
    preferences.showBestTime = preferencesInterface.showBestTime.checked
    preferences.useMouse = preferencesTimer.useMouse.checked
    preferences.extendedVideos = preferencesGeneral.extendedVideos.checked
    preferences.scramblesInList = preferencesGeneral.scramblesInList.checked
   
    if (preferencesTimer.leftKey.value != "") {
        preferences.leftKey = preferencesTimer.leftKey.value
        leftKey = preferences.leftKey
    }
    if (preferencesTimer.rightKey.value != "") {
        preferences.rightKey = preferencesTimer.rightKey.value   
        rightKey = preferences.rightKey 
    }
    
    preferences.customTheme = readTheme() 
    writeTheme(preferences.customTheme) 

    savePreferences()
    updateRecords()
    closePreferences()
}

// Set the style of the application based on the theme in preferences
function setStylesheet() {
    if (preferences.theme == "custom") {
        style.setStyle(preferences.customTheme)
    } else if (isNaN(parseInt(preferences.theme))) {
        style.setStyle = globals.themeColors[0]
    } else {
        style.setStyle(globals.themeColors[parseInt(preferences.theme)])
    }
}

// Set the style of the application based on the theme selected in preferences
function previewStylesheet() {
    if (preferencesInterface.theme.value == "custom") {
        style.setStyle(readTheme())
    } else {
        style.setStyle(globals.themeColors[preferencesInterface.theme.value])
    }
    updateTool()
}

// Read the theme from the preferences form and return an array of values
function readTheme() {
    var t = []
    for (var i = 0;i<6;i++) {
        t.push(preferencesInterface["theme"+i].value)
    }
    return t
}

// Write the array of values into the preferences form
function writeTheme(theme) {
    for (var i = 0;i<6;i++) {
        preferencesInterface["theme"+i].value = theme[i]
    }
}

$( "#tabs" ).tabs();

// Import Block Keeper session data from a file
function importBK() {
    closePreferences()
    dialog.showOpenDialog({
        filters: [{name: 'JSON', extensions: ['json']},]
    },function(fileNames) {
        if (fileNames === undefined){
            return
        } else {
            fs.readFile(fileNames[0],'utf-8',function(err,data) {
                if (err) {
                    alert("An error ocurred reading the file:" + err.message);
                    return;
                }
                var result = JSON.parse(data)
                if (result.puzzles != null) {
                    puzzles = mergeSessions(puzzles,result.puzzles)
                    setPuzzleOptions()
                    updateSessions()
                }
            })
        }
    });
}

// Export Block Keeper session data to a file
function exportBK() {
    closePreferences()
    dialog.showSaveDialog({
        defaultPath:"blockkeeper "+new Date().toLocaleDateString().replace(/\//g,"-")+".json"    
    },function (fileName) {
        if (fileName === undefined){
            return;
        }
        fs.writeFile(fileName, JSON.stringify(puzzles), function (err) {
            if (err) {
                alert("An error ocurred creating the file: "+ err.message)
            }
        });
    }); 
}

var CSData = []

// Import session data from a csTimer file and also bring up a dialog to select event
function importCS() {
    closePreferences()
    dialog.showOpenDialog({
        filters: [{name: 'JSON', extensions: ['json','txt']}]
    },function (fileNames) {
        if(fileNames === undefined){
            return
        } else {
            fs.readFile(fileNames[0], 'utf-8', function (err, data) {
            if (err) {
                alert("An error ocurred reading the file:" + err.message);
                return
            }
            var newstr = data
            var first = JSON.parse(newstr)
            
            for (var property in first) {
                if (first.hasOwnProperty(property) && property != "properties") {
                    var session = JSON.parse(first[property])
                    CSData.push(session)
                }
            }
                
            preferencesOpen = true
            $("#dialogPreferences").dialog("close")
            $("#preferencesButton").addClass("disabled")
            $("#preferencesButton").prop("disabled",true)
            $("#stats").prop("disabled",false)
            $("#stats").removeClass("disabled")
            $("#puzzleSelect").prop('disabled', false)
            $("#puzzleSelect").removeClass("disabled")
            $("#sessionDetails").prop("disabled",true)
            $("#sessionDetails").addClass("disabled")
            $("#sessionRecords").prop("disabled",true)
            $("#sessionRecords").addClass("disabled")
            $("#sessionStats").prop("disabled",true)
            $("#sessionStats").addClass("disabled")
            $("#sessionSelect").prop('disabled', true)
            $("#sessionSelect").addClass("disabled")
            $("#sessionButton").prop('disabled', true)
            $("#sessionButton").addClass("disabled")
            $("#toolSelect").prop('disabled', true)
            $("#tools").prop('disabled', true)
            $("#toolSelect").addClass("disabled")
            $("#tools").addClass("disabled")
            $("#addTimeButton").prop('disabled', true)
            $("#addTimeButton").addClass("disabled")
            $("#addToolButton").prop('disabled', true)
            $("#addToolButton").addClass("disabled")
            $("#dialogCSTimer").dialog("open")

            importCSTime(false) 
        });
    }
})}

// Initialise csTimer import dialog
$("#dialogCSTimer").dialog({
    autoOpen : false,
    modal : true,
    hide:"fade",
    show:"fade",
    position: {
        my:"center",
        at:"center",
        of:"#background"
    },
    width: "380",
    height: "270" 
})

var currentCS = 0

// Imports csTimer session into selected event
function importCSTime(doImport) {
    if (currentCS < CSData.length) {
        if (doImport) {
            createSession()
            puzzles[currentPuzzle].sessions[currentSession].name = "csTimer Import"
            disableUpdate = true
            for (var i=0;i<CSData[currentCS].length;i++) {
                if (CSData[currentCS][i][0][0] == 0) {
                    createRecord(CSData[currentCS][i][0][1]/1000,"OK")
                } else if (CSData[currentCS][i][0][0] == 2000) {
                    createRecord(CSData[currentCS][i][0][1]/1000,"+2")
                } else if (CSData[currentCS][i][0][0] == -1) {
                    createRecord(CSData[currentCS][i][0][1]/1000,"DNF")
                } else {
                    break
                }
                puzzles[currentPuzzle].sessions[currentSession].records[i].scramble = CSData[currentCS][i][1]
            }
            disableUpdate = false
            updateSessions()
            currentCS++
        }
        if (CSData[currentCS].length > 0) {
            var str = (CSData[currentCS][0][0][1]/1000)
            if ((CSData[currentCS][0][0][0] == 2000)) {
                str = ((CSData[currentCS][0][0][1]/1000)+2)+"+"
            } else if ((CSData[currentCS][0][0][0] == -1)) {
                str = "DNF ("+(CSData[currentCS][0][0][1]/1000)+")"
            }
            $("#messageCSTimer").prop("innerHTML","Session begins with following time<br><br>"+str+"<br><br>Please select the event you would like this session to be placed in using the event select dropdown. Press 'Import' once you have made your choice.")
        } else {
            currentCS++
            importCSTime(false)
        }
    } else {
        preferencesOpen = false
        $("#dialogCSTimer").dialog("close")

        $("#stats").removeClass("disabled")
        $("#timer").removeClass("disabled")
        $("#scramble").removeClass("disabled")
        $("#stats").prop("disabled",false)
        $("#timer").prop("disabled",false)
        $("#scramble").prop("disabled",false)
        $("#puzzleSelect").prop('disabled', false)
        $("#sessionSelect").prop('disabled', false)
        $("#sessionButton").prop('disabled', false)
        $("#preferencesButton").removeClass("disabled")
        $("#preferencesButton").prop("disabled",false)
        $("#sessionDetails").prop("disabled",false)
        $("#sessionDetails").removeClass("disabled")
        $("#sessionRecords").prop("disabled",false)
        $("#sessionRecords").removeClass("disabled")
        $("#sessionStats").prop("disabled",false)
        $("#sessionStats").removeClass("disabled")
        $("#sessionSelect").prop('disabled', false)
        $("#sessionSelect").removeClass("disabled")
        $("#sessionButton").prop('disabled', false)
        $("#sessionButton").removeClass("disabled")
        $("#toolSelect").prop('disabled', false)
        $("#tools").prop('disabled', false)
        $("#toolSelect").removeClass("disabled")
        $("#tools").removeClass("disabled")
        $("#addToolButton").prop('disabled', false)
        $("#addToolButton").removeClass("disabled")
        $("#addTimeButton").prop('disabled', false)
        $("#addTimeButton").removeClass("disabled")
        
                
        if (record.hasVideo() && preferences.recordSolve && !videoLoading) {
            $("#previewButton").removeClass("disabled")
            $("#previewButton").prop("disabled",false)
        }
    } 
}

// Exports all session data as CSV data
function exportCSV() {
    closePreferences()
    dialog.showSaveDialog({
        defaultPath:"blockkeeper "+new Date().toLocaleDateString().replace(/\//g,"-")+".csv"    
    },function (fileName) {
        if (fileName === undefined){
            return;
        }  
        var str = "Event, Session, Order, Time, Result, Scramble"
        for (var p = 0;p<puzzles.length;p++) {
            if (puzzles[p].sessions.length == 0) {
                continue
            }
            for (var s=0;s<puzzles[p].sessions.length;s++) {
                if (puzzles[p].sessions[s].records.length == 0) {
                    continue
                }
                for (var r=0;r<puzzles[p].sessions[s].records.length;r++) {
                    str+="\n\""+puzzles[p].name+"\", \""+puzzles[p].sessions[s].name+"\", \""+(r+1)+"\", \""+puzzles[p].sessions[s].records[r].time+"\", \""+puzzles[p].sessions[s].records[r].result+"\", \""+puzzles[p].sessions[s].records[r].scramble+"\""
                }
            }   
        }     
        fs.writeFile(fileName, str, function (err) {
            if (err) {
                alert("An error ocurred creating the file: "+ err.message)
            }
        });
    }); 
}

// Export current session data as text with session statistics
function exportPretty() {
    closePreferences()
    dialog.showSaveDialog({
        defaultPath:"blockkeeper "+new Date().toLocaleDateString().replace(/\//g,"-")+".txt"    
    },function (fileName) {
        if (fileName === undefined){
            return;
        }
        var str = "Generated by Block Keeper on "+new Date().toDateString()
        str += "\n"+document.getElementById("sessionSolves").innerHTML
        str += "\n"+document.getElementById("sessionMean").innerHTML
        str += "\n"+document.getElementById("sessionMedian").innerHTML
        str += "\n"+document.getElementById("sessionSD").innerHTML

        for (var r=0;r<puzzles[currentPuzzle].sessions[currentSession].records.length;r++) {
            str+="\n"+(r+1)+". "+sessionRecords.rows[r+1].children[1].children[0].innerHTML+" ("+puzzles[currentPuzzle].sessions[currentSession].records[r].scrambletrim()+")"
        }
        
        str = str.replace(new RegExp("<b>", 'g'),"").replace(new RegExp("</b>", 'g'),"").replace(new RegExp("<br>", 'g'),"\n")
        
        fs.writeFile(fileName, str, function (err) {
            if (err) {
                alert("An error ocurred creating the file: "+ err.message)
            }
        });
    }); 
}

// Copy current session data as text with session statistics to clipboard
function clipboardPretty() {
    closePreferences()
    var str = "Generated by Block Keeper on "+new Date().toDateString()
    str += "\n"+document.getElementById("sessionSolves").innerHTML
    str += "\n"+document.getElementById("sessionMean").innerHTML
    str += "\n"+document.getElementById("sessionMedian").innerHTML
    str += "\n"+document.getElementById("sessionSD").innerHTML

    for (var r=0;r<puzzles[currentPuzzle].sessions[currentSession].records.length;r++) {
        str+="\n"+(r+1)+". "+sessionRecords.rows[r+1].children[1].children[0].innerHTML
        if (preferences.scramblesInList) {
            str+=" ("+puzzles[currentPuzzle].sessions[currentSession].records[r].scramble+")"
        }
    }
        
    str = str.replace(new RegExp("<b>", 'g'),"").replace(new RegExp("</b>", 'g'),"").replace(new RegExp("<br>", 'g'),"\n")
        
    clipboard.writeText(str)
}

// Open dialog to select image for background image
function selectImage() {
    dialog.showOpenDialog({
        filters: []
    },function (fileNames) {
        if (fileNames === undefined) {
            return
        } else {
            preferencesInterface.backgroundImage.value = fileNames[0].replace(new RegExp("\\\\", "g"),"/")
        } 
    });
}

// Open dialog to select a video autosave location
function selectLocation() {
    dialog.showOpenDialog({
        filters: [],
        properties: ['openDirectory']
    },function (fileNames) {
        if (fileNames === undefined) {
            return
        } else {
            preferencesGeneral.autosaveLocation.value = fileNames[0].replace(new RegExp("\\\\", "g"),"/")
        } 
    });
}

loadPreferences()
