// preferences.js
// Manages preferences and preferences menu including functionality
// Block Keeper
// Created by Dallas McNeil
const storage = require('electron-json-storage');
var remote = require('electron').remote;
const {remote:{dialog}} = require('electron');
var fs = require('fs');
const {clipboard} = require('electron');
const app = remote.app;

var current = require('electron').remote.getGlobal('appDetails').version;
$("#versionLabel").prop("innerHTML", "Version " + current);

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
    metronomeBPM:90,
    onlyList:false,
    videoResolution:720,
    timeSplits:false,
    timerSize:25,
    timerSecondSize:15
}

// Preference management functions
var prefs = function() {
  storage.setDataPath(data);
    // Preference forms
    var preferencesInterface = document.forms[2];
    var preferencesTimer = document.forms[1];
    var preferencesGeneral = document.forms[0];

    // Saves preferences to file
    function savePreferences() {
        storage.set("preferences", preferences, function(error) {
            if (error) {
                throw error;
            }
        })
        setStylesheet();
        $("#centreBackground").css("background-image", 'url("' + preferences.backgroundImage + '")');
        $("#scramble").css("text-align", preferences.scrambleAlign);
        $("#scramble").css("font-size", preferences.scrambleSize + "vh");
        $("#scramble").css("line-height", preferences.scrambleSize + "vh");

        if (preferences.voice != "none") {
            timer.s7voice(new Audio("sounds/" + preferences.voice + "8s.mp3"));
            timer.s3voice(new Audio("sounds/" + preferences.voice + "12s.mp3"));
        }
    }

    function setFormsFromPreferences() {
        if (!isNaN(parseInt(preferences.theme)) || preferences.theme == "custom") {
            preferencesInterface.theme.value = preferences.theme;
        } else {
            preferencesInterface.theme.value = 0;
        }
        preferencesTimer.inspection.checked = preferences.inspection;
        preferencesTimer.splitMode.checked = preferences.split;
        preferencesTimer.endSplit.checked = preferences.endSplit;
        preferencesGeneral.timerDetail.value = preferences.timerDetail;
        preferencesTimer.hideTiming.checked = preferences.hideTiming;
        preferencesGeneral.recordSolve.checked = preferences.recordSolve;
        preferencesTimer.voice.value = preferences.voice;
        preferencesGeneral.formatTime.checked = preferences.formatTime;
        preferencesTimer.stackmat.checked = preferences.stackmat;
        preferencesTimer.leftKey.value = preferences.leftKey;
        preferencesTimer.rightKey.value = preferences.rightKey;
        preferencesInterface.scrambleSize.value = preferences.scrambleSize + "";
        preferencesInterface.backgroundImage.value = preferences.backgroundImage;
        preferencesTimer.timerDelay.value = preferences.timerDelay;
        preferencesGeneral.autosaveLocation.value = preferences.autosaveLocation;
        preferencesTimer.OHSplit.checked = preferences.OHSplit;
        preferencesInterface.scrambleAlign.value = preferences.scrambleAlign;
        preferencesInterface.showBestTime.checked = preferences.showBestTime;
        preferencesTimer.useMouse.checked = preferences.useMouse;
        preferencesGeneral.extendedVideos.checked = preferences.extendedVideos;
        preferencesGeneral.scramblesInList.checked = preferences.scramblesInList;
        preferencesGeneral.onlyList.checked = preferences.onlyList;
        preferencesGeneral.videoResolution.value = preferences.videoResolution;
        preferencesTimer.timeSplits.checked = preferences.timeSplits;
        preferencesInterface.timerSecondSize.value = preferences.timerSecondSize;
        preferencesInterface.timerSize.value = preferences.timerSize;
    }

    // Loads preferences from file and fills in preferences forms
    function loadPreferences() {
        var setup = function () {
            setStylesheet();
            savePreferences();

            setFormsFromPreferences()

            $("#timer")[0].innerHTML = (0).toFixed(preferences.timerDetail);
            writeTheme(preferences.customTheme);
            $("#centreBackground").css("background-image", 'url("' + preferences.backgroundImage + '")')
            $("#scramble").css("text-align", preferences.scrambleAlign);

            if (preferences.stackmat) {
                stackmat.init();
                stackmat.setCallBack(timer.SMCallback);
            }

            if (preferences.recordSolve) {
                record.setupRecorder();
            }
        }

        storage.get("preferences", function(error, object) {
            if (error) {
                savePreferences();
            } else {
                preferences = Object.assign({}, preferences, object);
            }
            setup();
        })
    }

    // Initialise preferences dialog
    $("#dialogPreferences").dialog({
        autoOpen:false,
        modal:true,
        show:"fade",
        hide:"fade",
        position: {
            my:"center",
            at:"center",
            of:"#background"
        },
        width:"520",
        height:"520"
    }).on('keydown',function(evt) {
        if (evt.keyCode === $.ui.keyCode.ESCAPE) {
            closePreferences();
        } else if (evt.keyCode === 13) {
            savePreferencesForm();
            evt.preventDefault();
        }
        evt.stopPropagation();
    });

    // Open preferences dialog
    function openPreferences() {
        if ($('#dialogPreferences').dialog('isOpen')) {
            closePreferences();
        } else {
            $("#dialogPreferences").dialog("open")
            disableAllElements("preferencesButton");
            globals.menuOpen = true;
        }
    }

    // Close preferences dialog and reset forms
    function closePreferences() {
        setFormsFromPreferences();
        writeTheme(preferences.customTheme);
        if (preferences.stackmat) {
            stackmat.stop();
            stackmat.init();
            stackmat.setCallBack(timer.SMCallback);
        } else {
            stackmat.stop();
        }

        timer.clearTimer();

        $("#dialogPreferences").dialog("close");

        record.setupRecorder();
        setStylesheet();

        enableAllElements();
        globals.menuOpen = false;
    }

    // Save preferences and close dialog
    function savePreferencesForm() {
        preferences.theme = preferencesInterface.theme.value;
        preferences.inspection = preferencesTimer.inspection.checked;
        preferences.split = preferencesTimer.splitMode.checked;
        preferences.endSplit = preferencesTimer.endSplit.checked;
        preferences.timerDetail = preferencesGeneral.timerDetail.value;
        preferences.hideTiming = preferencesTimer.hideTiming.checked;
        preferences.voice = preferencesTimer.voice.value;
        preferences.formatTime = preferencesGeneral.formatTime.checked;
        preferences.recordSolve = preferencesGeneral.recordSolve.checked;
        preferences.stackmat = preferencesTimer.stackmat.checked;
        preferences.scrambleSize = preferencesInterface.scrambleSize.value;
        preferences.backgroundImage = preferencesInterface.backgroundImage.value;
        preferences.timerDelay = preferencesTimer.timerDelay.value;
        preferences.autosaveLocation = preferencesGeneral.autosaveLocation.value;
        preferences.OHSplit = preferencesTimer.OHSplit.checked;
        preferences.scrambleAlign = preferencesInterface.scrambleAlign.value;
        preferences.showBestTime = preferencesInterface.showBestTime.checked;
        preferences.useMouse = preferencesTimer.useMouse.checked;
        preferences.extendedVideos = preferencesGeneral.extendedVideos.checked;
        preferences.scramblesInList = preferencesGeneral.scramblesInList.checked;
        preferences.onlyList = preferencesGeneral.onlyList.checked;
        preferences.videoResolution = preferencesGeneral.videoResolution.value;
        preferences.timeSplits = preferencesTimer.timeSplits.checked;
        preferences.timerSecondSize = preferencesInterface.timerSecondSize.value;
        preferences.timerSize = preferencesInterface.timerSize.value;

        if (preferencesTimer.leftKey.value != "") {
            preferences.leftKey = preferencesTimer.leftKey.value;
        }
        if (preferencesTimer.rightKey.value != "") {
            preferences.rightKey = preferencesTimer.rightKey.value;
        }

        preferences.customTheme = readTheme();
        writeTheme(preferences.customTheme);

        savePreferences();
        events.updateRecords();
        closePreferences();
    }

    // Set the style of the application based on the theme in preferences
    function setStylesheet() {
        if (preferences.theme === "custom") {
            style.setStyle(preferences.customTheme);
        } else if (isNaN(parseInt(preferences.theme))) {
            style.setStyle = globals.themeColors[0];
        } else {
            style.setStyle(globals.themeColors[parseInt(preferences.theme)]);
        }
    }

    // Set the style of the application based on the theme selected in preferences
    function previewStylesheet() {
        if (preferencesInterface.theme.value == "custom") {
            style.setStyle(readTheme());
        } else {
            style.setStyle(globals.themeColors[preferencesInterface.theme.value]);
        }
        tools.updateTools();
        // Stop forms from refreshing
        return false;
    }

    // Read the theme from the preferences form and return an array of values
    function readTheme() {
        var t = [];
        for (var i = 0; i < 6; i++) {
            t.push(preferencesInterface["theme" + i].value);
        }
        return t;
    }

    // Write the array of values into the preferences form
    function writeTheme(theme) {
        for (var i = 0;i<6;i++) {
            preferencesInterface["theme" + i].value = theme[i];
        }
    }

    $("#tabs").tabs();
//Change storage location
function setStorageLocation(data) {
    closePreferences();
    dialog.showOpenDialog({
       properties: ["openDirectory"],
    }, function(filesPaths) {
        var data = ''+filesPaths+''.substr(1).slice(0, -1);
        storage.setDataPath(data);
      })
}

var data;

    // Import Block Keeper session data from a file
    function importBK() {
        closePreferences();
        dialog.showOpenDialog({
            filters: [{name: 'JSON', extensions: ['json']}]
        }, function(fileNames) {
            if (fileNames === undefined) {
                return;
            } else {
                fs.readFile(fileNames[0], 'utf-8', function(err, data) {
                    if (err) {
                        alert("An error ocurred reading the file:" + err.message);
                        return;
                    }
                    try {
                        var result = JSON.parse(data).puzzles;
                    } catch (err) {
                        alert("An error ocurred reading the file: " + err.message);
                        return;
                    }
                    events.mergeEvents(result);
                    events.setEventOptions($("#eventSelect")[0]);
                })
            }
        });
    }

    // Export Block Keeper session data to a file
    function exportBK() {
        closePreferences();
        dialog.showSaveDialog({
            defaultPath:"blockkeeper " + new Date().toLocaleDateString().replace(/\//g,"-") + ".json"
        },function(fileName) {
            if (fileName === undefined){
                return;
            }
            fs.writeFile(fileName, JSON.stringify({
                puzzles:events.getAllEvents()
            }), function (err) {
                if (err) {
                    alert("An error ocurred creating the file: " + err.message);
                }
            });
        });
    }

    var CSData = []
    // Import session data from a csTimer file and also bring up a dialog to select event to import into
    function importCS() {
        closePreferences();
        dialog.showOpenDialog({
            filters:[{name:'JSON', extensions: ['json', 'txt']}]
        },function (fileNames) {
            if (fileNames === undefined) {
                return;
            } else {
                CSData = [];
                currentCS = 0;
                fs.readFile(fileNames[0], 'utf-8', function (err, data) {
                if (err) {
                    alert("An error ocurred reading the file:" + err.message);
                    return;
                }

                var first = JSON.parse(data);
                for (var property in first) {
                    if (first.hasOwnProperty(property) && property != "properties") {
                        var session = JSON.parse(first[property]);
                        if (session.length > 0) {
                            CSData.push(session);
                        }
                    }
                }

                globals.menuOpen = true;
                disableAllElements();
                events.setEventOptions($("#eventSelectCSTimer")[0]);
                $("#dialogCSTimer").dialog("open");
                importCSTime(false);
            });
        }
    })}

    // Initialise csTimer import dialog
    $("#dialogCSTimer").dialog({
        autoOpen:false,
        modal:true,
        hide:"fade",
        show:"fade",
        position: {
            my:"center",
            at:"center",
            of:"#background"
        },
        width:"380",
        height:"353"
    })

    var currentCS = 0;

    // Imports csTimer session into selected event
    function importCSTime(doImport) {
        if (currentCS < CSData.length) {
            if (doImport) {
                events.setCurrentEvent($("#eventSelectCSTimer")[0].value);
                events.createSession();
                events.getCurrentSession().name = "csTimer Import " + (currentCS + 1);
                events.shouldUpdateStats(false);
                for (var i = 0; i < CSData[currentCS].length; i++) {
                    if (CSData[currentCS][i][0][0] === 2000) {
                        events.createRecord(CSData[currentCS][i][0][1] / 1000, "+2");
                    } else if (CSData[currentCS][i][0][0] === -1) {
                        events.createRecord(CSData[currentCS][i][0][1] / 1000, "DNF");
                    } else {
                        events.createRecord(CSData[currentCS][i][0][1] / 1000, "OK");
                    }
                    events.getCurrentSession().records[i].scramble = CSData[currentCS][i][1];
                    events.getCurrentSession().records[i].comment = CSData[currentCS][i][2];
                }
                events.shouldUpdateStats(true);
                events.setSessionOptions($("#sessionSelect")[0]);
                events.updateRecords(true);
                currentCS++;
            }
            if (CSData[currentCS] && CSData[currentCS].length > 0) {
                var str = (CSData[currentCS][0][0][1] / 1000);
                if ((CSData[currentCS][0][0][0] === 2000)) {
                    str = ((CSData[currentCS][0][0][1] / 1000) + 2) + "+";
                } else if ((CSData[currentCS][0][0][0] === -1)) {
                    str = "DNF (" + (CSData[currentCS][0][0][1] / 1000)+ ")";
                }
                $("#messageCSTimer").prop("innerHTML","Session " + (currentCS + 1) + " of " + CSData.length + "<br>Session begins with the following record.<br><br>" + str + "<br><br>Please select the event you would like this session to be placed into. Press 'Import' once you have made your choice.");
            } else {
                currentCS++;
                importCSTime(false);
            }
        } else {
            globals.menuOpen = false;
            $("#dialogCSTimer").dialog("close");
            enableAllElements();
        }
    }

    function cancelCSTime() {
        globals.menuOpen = false;
        $("#dialogCSTimer").dialog("close");
        enableAllElements();
    }

    // Exports all session data as CSV data
    function exportCSV() {
        closePreferences();
        dialog.showSaveDialog({
            defaultPath:"blockkeeper " + new Date().toLocaleDateString().replace(/\//g, "-") + ".csv"
        },function (fileName) {
            if (fileName === undefined){
                return;
            }
            var str = "Event,Session,SessionOrder,Order,Time,Result,Scramble,Split,Date,FormattedDate,Comment"
            var e = events.getAllEvents();
            for (var p = 0; p < e.length; p++) {
                if (!e[p].sessions) {
                    continue;
                }
                for (var s = 0; s < e[p].sessions.length; s++) {
                    if (e[p].sessions[s].records.length === 0) {
                        continue;
                    }

                    for (var r = 0; r < e[p].sessions[s].records.length; r++) {
                        var d = 0;
                        if (e[p].sessions[s].records[r].date != undefined) {
                            d = e[p].sessions[s].records[r].date;
                        }
                        var com = "";
                        if (e[p].sessions[s].records[r].comment != undefined) {
                            com = e[p].sessions[s].records[r].comment;
                        }
                        var sp = 0;
                        if (e[p].sessions[s].records[r].split != undefined) {
                            if (e[p].sessions[s].records[r].split.length > 0) {
                                sp = e[p].sessions[s].records[r].split[0];
                            }
                        }
                        str += "\n\"" + e[p].name.replaceAll('"','""') + "\",\"" + e[p].sessions[s].name.replaceAll('"','""') + "\"," + (s + 1) + "," + (r + 1) + "," + e[p].sessions[s].records[r].time + "," + e[p].sessions[s].records[r].result + ",\"" + e[p].sessions[s].records[r].scramble.replaceAll('"','""') + "\"," + sp + "," + d + ",\"" + new Date(d).toUTCString() + "\",\"" + com + "\"";
                    }
                }
            }
            fs.writeFile(fileName, str, function (err) {
                if (err) {
                    alert("An error ocurred creating the file: " + err.message);
                }
            });
        });
    }

    // Open dialog to select image for background image
    function selectImage() {
        dialog.showOpenDialog({
            filters:[]
        },function (fileNames) {
            if (fileNames === undefined) {
                return;
            } else {
                preferencesInterface.backgroundImage.value = fileNames[0].replace(new RegExp("\\\\", "g"), "/");
            }
        })
    }

    // Open dialog to select a video autosave location
    function selectLocation() {
        dialog.showOpenDialog({
            filters:[],
            properties:['openDirectory']
        },function (fileNames) {
            if (fileNames === undefined) {
                return;
            } else {
                preferencesGeneral.autosaveLocation.value = fileNames[0].replace(new RegExp("\\\\", "g"), "/");
            }
        })
    }

    loadPreferences();

    return {
        openPreferences:openPreferences,
        closePreferences:closePreferences,
        savePreferences:savePreferencesForm,
        selectLocation:selectLocation,
        selectImage:selectImage,
        previewStylesheet:previewStylesheet,
        setStylesheet:setStylesheet,
        readTheme:readTheme,
        importCS:importCS,
        importCSTime:importCSTime,
        cancelCSTime:cancelCSTime,
        importBK:importBK,
        setStorageLocation:setStorageLocation,
        exportBK:exportBK,
        exportCSV:exportCSV
    }
}()
