// timer.js
// Provides timer functionality, from keyboard or stackmat
// Block Keeper
// Created by Dallas McNeil

var timer = function() {
    
    var leftIndicator = document.getElementById("leftIndicator");
    var rightIndicator = document.getElementById("rightIndicator");
    var timerText = document.getElementById("timer");
    var timerSplit = document.getElementById("timerSplit");

    // Various timer and indicator colors
    var prepareColor = globals.prepareColor;
    var inspectColor = globals.inspectColor;
    var readyColor = globals.readyColor;
    var normalColor = timerText.style.color;
    var indicatorColor = leftIndicator.style.backgroundColor;
       
    // Keys to control the timer
    var mainKey = " ";
    var leftKey = preferences.leftKey;
    var rightKey = preferences.rightKey;

    // If the keys are down
    var mainDown = false;
    var leftDown = false;
    var rightDown = false;

    // Timer state information
    var timerState = "normal";
    var timerRunning = false;
    
    // Time information
    var currentTime = Date.now();
    var startTime = currentTime;
    var inspectionTime = currentTime;
    var splitTime = currentTime;
    var splitRecorded = false;
    
    // Current record information
    var timerTime = 0;
    var timerResult = "OK"; //OK, +2, DNF

    // Other inspection state information
    var prepareTimerID = 0;
    var cooldown = false;
    var s3 = true;
    var s7 = true;
    var s3voice = new Audio("sounds/male8s.mp3");
    var s7voice = new Audio("sounds/male12s.mp3");

    // Diffent timer properties based on event and preferences
    var inspectionEnabled = false;
    var splitEnabled = false;
    var OHSplitEnabled = false;
    
    // Prevent key repeats
    var keysDown = {}
    
    // Get keyboard down events
    window.onkeydown = function(e) {
        leftKey = preferences.leftKey;
        rightKey = preferences.rightKey;
        
        if (e.keyCode === $.ui.keyCode.ESCAPE && $("#dialogRecord").dialog("isOpen")) {
            events.closeDialogRecord();
        }

        if ((leftDown && e.key === leftKey) || (rightDown && e.key === rightKey) || (mainDown && e.key === mainKey)){
            e.preventDefault();
            return;
        }
    
        if (!preferences.stackmat) {
            if (splitEnabled) {
                if (e.key === leftKey) {
                    leftDown = true;
                } else if (e.key === rightKey) {
                    rightDown = true;
                }
                
                if (!cooldown && (OHSplitEnabled || preferences.endSplit) && leftDown && rightDown && timerState === "timing") {
                    cooldown = true;
                    stopTimer();
                }
            } else {
                if (e.key === mainKey) {
                    mainDown = true;
                }
            }
            if (timerState === "timing") {
                if (e.key === "Escape") {
                    timerResult = "DNF";
                    stopTimer(true);
                } else if (!(preferences.endSplit || OHSplitEnabled)) {
                    cooldown = true;
                    stopTimer();
                }
            } else {
                if (e.key === "Escape") {
                    if (timerState != "normal") {
                        cancelTimer();
                    }
                }
            }
        } else {
            if (e.key === mainKey) {
                mainDown = true;
                if (!splitRecorded && preferences.blindSplit && events.getCurrentEvent().blind && timerState === "timing") {
                    stopTimer();
                }
            } else if (e.key === "Escape") {
                if (timerState === "inspecting" || timerState === "readyInspection") {
                    cancelTimer();
                }
            }
        }

        if (e.keyCode === 32 && !globals.menuOpen) {
            e.preventDefault();
            return false;
        }
    }

    // Get keyboard up events
    window.onkeyup = function(e) { 
        if (!preferences.stackmat) {
            if (splitEnabled) {
                if (e.key === leftKey) {
                    leftDown = false;
                } else if (e.key === rightKey) {
                    rightDown = false;
                }
                if ((OHSplitEnabled || preferences.endSplit) && !leftDown && !rightDown) {
                    cooldown = false;
                }
            } else {
                if (e.key === mainKey) {
                    mainDown = false;
                }
            }
        } else {
            if (e.key === mainKey) {
                mainDown = false;
            }
        }

        if (e.keyCode === 32) {
            e.preventDefault();
            return false;
        } 
    }

    document.getElementById("background").onmousedown = function(e) {
        if (preferences.useMouse) {
            if (e.button === 0) {
                mainDown = true;
            }
            if (timerState === "timing") {
                stopTimer();
            }
        }
    }

    document.getElementById("background").onmouseup = function(e) {
        if (e.button === 0) {
            mainDown = false;
        }
    }

    function manageInspection() {
        var timeRemaining = Math.ceil(15 + (inspectionTime - currentTime) / 1000);
        if (timeRemaining <= -2 && inspectionEnabled) {
            timerText.innerHTML = "DNF";
            timerResult = "DNF";
        } else if (timeRemaining <= 0 && inspectionEnabled) {
            timerText.innerHTML = "+2";
            timerResult = "+2";
        } else if (timeRemaining <= 3 && s3 && inspectionEnabled) {
            if (preferences.voice != "none") {
                s3voice.play();
                s3 = false;
            }
        } else if (timeRemaining <= 7 && s7 && inspectionEnabled) {
            if (preferences.voice != "none") {
                s7voice.play();
                s7 = false;
            }
        }
        if (inspectionEnabled && timeRemaining > 0) {
            timerText.innerHTML = timeRemaining;
        }
    }
    
    // Update the timer frequently
    function timerUpdate() {
        inspectionEnabled = (preferences.inspection && !events.getCurrentEvent().blind);
        splitEnabled = preferences.split || (events.getCurrentEvent().OH && preferences.OHSplit);
        OHSplitEnabled = preferences.OHSplit && events.getCurrentEvent().OH;
        
        if (!preferences.stackmat) {
            document.getElementById("background").focus()
            currentTime = Date.now();

            leftIndicator.style.backgroundColor = indicatorColor;
            rightIndicator.style.backgroundColor = indicatorColor;
            leftIndicator.style.opacity = 0;
            rightIndicator.style.opacity = 0;
            switch (timerState) {
                case "normal":       
                    if (!globals.menuOpen) {
                        if ((preferences.endSplit || OHSplitEnabled) && splitEnabled && cooldown) {
                            if (leftDown) {
                                leftIndicator.style.backgroundColor = prepareColor;
                                leftIndicator.style.opacity = 1;
                            } 
                            if (rightDown) {
                                rightIndicator.style.backgroundColor = prepareColor;
                                rightIndicator.style.opacity = 1;
                            }        
                        }
                        if (((splitEnabled && leftDown && rightDown) || (!splitEnabled && mainDown)) && !cooldown) {
                            if (inspectionEnabled) {
                                readyInspection();
                            } else {
                                prepareTimer();
                            }
                        } 
                        if (splitEnabled) {
                            if (leftDown) {
                                leftIndicator.style.backgroundColor = prepareColor;
                                leftIndicator.style.opacity = 1;
                            } 
                            if (rightDown) {
                                rightIndicator.style.backgroundColor = prepareColor;
                                rightIndicator.style.opacity = 1;
                            }      
                        }
                        if (splitEnabled && !leftDown && !rightDown) {
                            cooldown = false;
                        } else if (!splitEnabled && !mainDown) {
                            cooldown = false;
                        }
                    }
                    break;
                case "inspectReady":
                    if ((splitEnabled && (!leftDown || !rightDown)) || (!splitEnabled && !mainDown)) {
                        startInspection();
                    }
                    if (splitEnabled) {
                        if (leftDown) {
                            leftIndicator.style.backgroundColor = readyColor;
                            leftIndicator.style.opacity = 1;
                        } 
                        if (rightDown) {
                            rightIndicator.style.backgroundColor = readyColor;
                            rightIndicator.style.opacity = 1;
                        }        
                    }
                    break;
                case "inspecting":
                    if ((splitEnabled && leftDown && rightDown) || (!splitEnabled && mainDown)) {
                        prepareTimer();        
                    }
                    manageInspection();
                    if (splitEnabled) {
                        if (leftDown) {
                            leftIndicator.style.backgroundColor = inspectColor;
                            leftIndicator.style.opacity = 1;
                        } 
                        if (rightDown) {
                            rightIndicator.style.backgroundColor = inspectColor;
                            rightIndicator.style.opacity = 1;
                        }        
                    }
                    break;
                case "preparing":
                    if ((splitEnabled && (!leftDown || !rightDown)) || (!splitEnabled && !mainDown)) {
                        window.clearTimeout(prepareTimerID);
                        if (inspectionEnabled) {
                            returnToInspection();
                        } else {
                            cancelTimer();
                        }
                    } else {
                        manageInspection();
                    }       
                    if (splitEnabled) {
                        if (leftDown) {
                            leftIndicator.style.backgroundColor = prepareColor;
                            leftIndicator.style.opacity = 1;
                        } 
                        if (rightDown) {
                            rightIndicator.style.backgroundColor = prepareColor;
                            rightIndicator.style.opacity = 1;
                        }        
                    }
                    break;
                case "ready":
                    if ((splitEnabled && (!leftDown || !rightDown)) || (!splitEnabled && !mainDown)) {
                        startTimer();
                    } else if (inspectionEnabled) {
                        manageInspection();
                    }
                    if (splitEnabled) {
                        if (leftDown) {
                            leftIndicator.style.backgroundColor = readyColor;
                            leftIndicator.style.opacity = 1;
                        } 
                        if (rightDown) {
                            rightIndicator.style.backgroundColor = readyColor;
                            rightIndicator.style.opacity = 1;
                        }        
                    }
                    break;
                case "timing":
                    if (cooldown && preferences.endSplit && splitEnabled) {
                        if (leftDown) {
                            leftIndicator.style.backgroundColor = inspectColor;
                            leftIndicator.style.opacity = 1;
                        } 
                        if (rightDown) {
                            rightIndicator.style.backgroundColor = inspectColor;
                            rightIndicator.style.opacity = 1;
                        }     
                    } else if (preferences.endSplit && splitEnabled) {
                        if (leftDown) {
                            leftIndicator.style.backgroundColor = readyColor;
                            leftIndicator.style.opacity = 1;
                        } 
                        if (rightDown) {
                            rightIndicator.style.backgroundColor = readyColor;
                            rightIndicator.style.opacity = 1;
                        }        
                    } 

                    if (splitEnabled && OHSplitEnabled) {
                        if (!leftDown && !rightDown) {
                            timerResult = "DNF";
                            timerText.style.color = prepareColor;
                        }
                    }
                    currentTime = Date.now();
                    timerTime = ((currentTime - startTime) / 1000)
                    if (preferences.hideTiming) {
                        timerText.innerHTML = "Solve";
                    } else {
                        timerText.innerHTML = formatTime(timerTime);
                    } 
                    
                    break;
            }
        }
    }
    
    // Fade out surround UI and show only timer
    function fadeOutUI() {
        timerRunning = true;
        $("#stats").fadeOut();
        $("#scramble").fadeOut();
        $("#preferencesButton").fadeOut();
        $("#tools").fadeOut();
        $("#addToolButton").fadeOut();
        $("#toolSelect").fadeOut();
        $("#previewButton").fadeOut();
    }
    
    // Fade in UI again
    function fadeInUI() {
        timerRunning = false;
        $("#stats").fadeIn();
        $("#scramble").fadeIn();
        $("#preferencesButton").fadeIn();
        $("#tools").fadeIn();
        $("#addToolButton").fadeIn();
        $("#toolSelect").fadeIn();
        $("#previewButton").fadeIn();
    }

    // Inspection ready to start
    function readyInspection() {
        timerState = "inspectReady";
        timerText.style.color = readyColor; 
    }

    // Start inspecting puzzle
    function startInspection() {
        timerState = "inspecting";
        timerText.style.color = inspectColor; 
        timerSplit.innerHTML = "";
        timerText.innerHTML = "15";
        inspectionTime = currentTime;
        timerResult = "OK";
        fadeOutUI();
        s3 = true;
        s7 = true;
        if (preferences.extendedVideos) {
            record.startRecorder();
        }
    }

    // Prepare timer to start timing
    function prepareTimer() {
        timerState = "preparing";
        timerText.style.color = prepareColor;
        prepareTimerID = window.setTimeout(readyTimer, preferences.timerDelay * 1000);
    }

    // Return from readying to inspecting
    function returnToInspection() {
        timerState = "inspecting";
        timerText.style.color = inspectColor;
    }

    // Timer is ready to start
    function readyTimer() {
        timerState = "ready";
        timerText.style.color = readyColor;
        fadeOutUI();
    }

    // Start timer recording
    function startTimer() {
        currentTime = Date.now();
        startTime = currentTime;
        if (!preferences.extendedVideos || events.getCurrentEvent().blind || (!preferences.inspection && preferences.extendedVideos)) {
            record.startRecorder();
        }
        timerState = "timing";
        timerText.style.color = normalColor;

        timerSplit.innerHTML = "";
    }

    $("#dialogBlindResult").dialog({
        autoOpen:false,
        modal:true,
        hide:"fade",
        show:"fade",
        position: {
            my:"center",
            at:"center",
            of:"#background"
        },
        width:"220",
        height:"102" 
    }).on('keydown',function(evt) {
        if (evt.keyCode === 13) {
            blindResult("OK");
            evt.preventDefault();
        } else if (evt.keyCode === $.ui.keyCode.ESCAPE) {
            blindResult("DNF");
            evt.preventDefault();
        }     
        evt.stopPropagation();
        
    });
    
    // Stop the timer
    function stopTimer(forced = false, SM = false) {
        currentTime = Date.now();
        if (!forced && !splitRecorded && preferences.blindSplit && events.getCurrentEvent().blind) {
            splitTime = ((currentTime - startTime) / 1000);
            splitRecorded = true;
            if (preferences.hideTiming) {
                timerSplit.innerHTML = "Split";
            } else {
                timerSplit.innerHTML = formatTime(splitTime);
            }
            return;
        }
        if (!SM) {
            timerText.style.color = normalColor;
            timerTime = ((currentTime - startTime) / 1000);
            timerText.innerHTML = formatTime(timerTime);
        }
        timerState = "normal";
        setTimeout(function () {
            if (!preferences.extendedVideos) {
                record.stopRecorder();
            } else {
                setTimeout(function() {
                    record.stopRecorder();
                }, 3000)
            }
            inspectionTime = currentTime;
            if (events.getCurrentEvent().blind) {
                $("#dialogBlindResult").dialog("open")
                globals.menuOpen = true;
                timerText.innerHTML = "";
                timerSplit.innerHTML = "";
                return;
            } 
            submitTime();
            timerResult = "OK";
            fadeInUI();
        },0);
    }
    
    // Set result at the end of a blind solve
    function blindResult(res) {
        $("#dialogBlindResult").dialog("close")
        timerResult = res;
        timerText.innerHTML = formatTime(timerTime);
        if (splitRecorded && preferences.blindSplit) {
            timerSplit.innerHTML = formatTime(splitTime) + " / " + formatTime(timerTime - splitTime);
        } else {
            timerSplit.innerHTML = "";
        }
        submitTime();
        timerResult = "OK";
        globals.menuOpen = false;
        fadeInUI();
    }
    
    // Cancel the timer at anytime
    function cancelTimer() {
        timerState = "normal";
        timerText.style.color = normalColor;
        timerText.innerHTML = (0).toFixed(preferences.timerDetail);
        timerTime = 0;
        timerResult = "OK";
        inspectionTime = currentTime;
        startTime = currentTime;
        fadeInUI();
        if (preferences.extendedVideos) {
            record.cancelRecorder();
        }
    }

    // Submit a time to be created
    function submitTime() {
        if (splitRecorded && preferences.blindSplit && events.getCurrentEvent().blind) {
            events.createRecord(timerTime, timerResult, [splitTime])
            splitRecorded = false;
        } else {
            events.createRecord(timerTime, timerResult);
        }
        scramble.scramble();
        
    }

    // Get stackmat information is used and display it
    function SMCallback(state) {
        if (preferences.stackmat && !globals.menuOpen) {
            currentTime = Date.now();
            // Boolean will guarantee the variable is not undefined
            leftDown = Boolean(state.leftHand);
            rightDown = Boolean(state.rightHand);

            document.getElementById("background").focus();

            leftIndicator.style.backgroundColor = indicatorColor;
            rightIndicator.style.backgroundColor = indicatorColor;
            leftIndicator.style.opacity = 0;
            rightIndicator.style.opacity = 0;

            if (state.on) {
                switch (timerState) {
                    case "normal":      
                        if (mainDown && inspectionEnabled) {
                            readyInspection();
                        }
                        leftIndicator.style.opacity = 1;
                        if (leftDown) {
                            leftIndicator.style.backgroundColor = prepareColor;
                        } else {
                            leftIndicator.style.backgroundColor = normalColor;
                        }

                        rightIndicator.style.opacity = 1;
                        if (rightDown) {
                            rightIndicator.style.backgroundColor = prepareColor;
                        } else {
                            rightIndicator.style.backgroundColor = normalColor;
                        }    

                        if (leftDown && rightDown && (state.time_milli === 0)) {
                            timerText.style.color = prepareColor;
                            leftIndicator.style.backgroundColor = prepareTimer;
                            rightIndicator.style.backgroundColor = prepareTimer;
                            leftIndicator.style.opacity = 1;
                            rightIndicator.style.opacity = 1;
                        } else {
                            timerText.style.color = normalColor;
                        }
                        
                        if (state.greenLight) {
                            timerText.style.color = readyColor;
                            leftIndicator.style.backgroundColor = readyColor;
                            rightIndicator.style.backgroundColor = readyColor;
                            leftIndicator.style.opacity = 1;
                            rightIndicator.style.opacity = 1;
                        }

                        if (!($("#dialogBlindResult").dialog("isOpen"))) {
                            timerText.innerHTML = formatTime(state.time_milli / 1000);
                        }

                        if (state.running) {
                            timerState = "timing";
                            timerSplit.innerHTML = "";
                            startTime = Date.now();
                            fadeOutUI();
                            record.startRecorder();
                            timerText.style.color = normalColor;
                        }

                        break;
                    case "inspectReady":
                        timerText.style.color = readyColor;
                        if (!mainDown) {
                            currentTime = Date.now();
                            startInspection();
                        }
                        break;
                    case "inspecting":
                        timerText.style.color = prepareColor;
                        var timeRemaining = Math.ceil(15 + ((inspectionTime - currentTime) / 1000));
                        if (timeRemaining <= -2 && inspectionEnabled) {
                            timerText.innerHTML = "DNF";
                            timerResult = "DNF";
                        } else if (timeRemaining <= 0 && inspectionEnabled) {
                            timerText.innerHTML = "+2";
                            timerResult = "+2";
                        } else if (timeRemaining <= 3 && s3 && inspectionEnabled) {
                            if (preferences.voice !== "none") {
                                s3voice.play();
                                s3 = false;
                            }
                        } else if (timeRemaining <= 7 && s7 && inspectionEnabled) {
                            if (preferences.voice !== "none") {
                                s7voice.play();
                                s7 = false;
                            }
                        }
                        if (timeRemaining > 0) {
                            timerText.innerHTML = timeRemaining;
                        }

                        if (leftDown) {
                            leftIndicator.style.backgroundColor = inspectColor;
                            leftIndicator.style.opacity = 1;
                        }
                        if (rightDown) {
                            rightIndicator.style.backgroundColor = inspectColor;
                            rightIndicator.style.opacity = 1;
                        }

                        if (leftDown && rightDown && (state.time_milli === 0)){
                            timerText.style.color = prepareColor;
                            leftIndicator.style.backgroundColor = prepareColor;
                            leftIndicator.style.opacity = 1;
                            rightIndicator.style.backgroundColor = prepareColor;
                            rightIndicator.style.opacity = 1;
                        } else {
                            timerText.style.color = inspectColor;
                        }

                        if (state.greenLight) {
                            timerText.style.color = readyColor;
                            leftIndicator.style.backgroundColor = readyColor;
                            rightIndicator.style.backgroundColor = readyColor;
                            leftIndicator.style.opacity = 1;
                            rightIndicator.style.opacity = 1;
                        }

                        if (state.running) {
                            timerState = "timing";
                            fadeOutUI();
                            if (!preferences.extendedVideos) {
                                record.startRecorder();
                            }
                            timerText.style.color = normalColor;
                        }
                        break;
                    case "timing":
                        if (preferences.endSplit && splitEnabled) {
                            if (leftDown) {
                                leftIndicator.style.backgroundColor = readyColor;
                                leftIndicator.style.opacity = 1;
                            } 
                            if (rightDown) {
                                rightIndicator.style.backgroundColor = readyColor;
                                rightIndicator.style.opacity = 1;
                            }        
                        }

                        if (splitEnabled && OHSplitEnabled) {
                            if (!leftDown && !rightDown) {
                                timerResult = "DNF";
                                timerText.style.color = prepareColor;
                            }
                        }

                        if (preferences.hideTiming) {
                            timerText.innerHTML = "Solve";
                        } else {
                            timerText.innerHTML = formatTime(state.time_milli/1000);
                        } 

                        timerTime = state.time_milli / 1000;

                        if (!state.running) {
                            stopTimer(true, true);
                        }   
                        break;
                }
            } else {
                if (timerState === "timing") {
                    timerState = "normal";
                    timerText.style.color = normalColor;
                    submitTime();
                    fadeInUI();
                    if (!preferences.extendedVideos) {
                        record.stopRecorder();
                    } else {
                        setTimeout(function() {
                            record.stopRecorder();
                        }, 3000)
                    }
                }
                timerText.style.color = normalColor;
                var s = "--";
                if (preferences.timerDetail > 0) {
                    s += ".";
                }
                for (var i = 0; i < preferences.timerDetail; i++) {
                    s += "-";
                }
                timerText.innerHTML = s;
            }
        }
    }
    
    timerText.innerHTML = (0).toFixed(preferences.timerDetail)

    // Update timer every 17 milliseconds
    window.setInterval(timerUpdate, 17);

    function returnTimerRunning() {
        return timerRunning;
    }
    
    function returnTimerState() {
        return timerState;
    }
    
    function setS3Voice(v) {
        s3voice = v;
    }
    
    function setS7Voice(v) {
        s7voice = v;
    }
    
    function clearTimer() {
        if (preferences.stackmat) {
            var s = "--";
            if (preferences.timerDetail > 0) {
                s += ".";
            }
            for (var i = 0; i < preferences.timerDetail; i++) {
                s += "-";
            }
        } else {
            timerText.innerHTML = formatTime(0);
        }
        timerSplit.innerHTML = "";
        timerTime = 0;
    }
    
    return {
        timerRunning:returnTimerRunning,
        timerState:returnTimerState,
        cancelTimer:cancelTimer,
        SMCallback:SMCallback,
        s3voice:setS3Voice,
        s7voice:setS7Voice,
        blindResult:blindResult,
        clearTimer:clearTimer
    }
}()