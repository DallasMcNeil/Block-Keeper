// timer.js
// Provides timer functionality, from keyboard or stackmat
// Block Keeper
// Created by Dallas McNeil

var leftIndicator = document.getElementById("leftIndicator")
var rightIndicator = document.getElementById("rightIndicator")

var prepareColor = "#FF0000"
var inspectColor = "#FFFF00"
var readyColor = "#00FF00"
var normalColor = timerText.style.color
var indicatorColor = leftIndicator.style.backgroundColor
    
var mainKey = " "
var leftKey = preferences.leftKey
var rightKey = preferences.rightKey

var mainDown = false
var leftDown = false
var rightDown = false

var timerState = "normal"

var currentTime = new Date();

var startTime = currentTime.getTime()
var inspectionTime = currentTime.getTime()
var timeLastUpdate = currentTime.getTime()
var timerTime = 0
var timerResult = "OK" //OK, +2, DNF

var prepareTimerID = 0
var cooldown = false
var s3 = true
var s7 = true

var inspectionEnabled = false
var splitEnabled = false
var OHSplitEnabled = false

// Get keyboard down events
window.onkeydown = function(e) {
    leftKey = preferences.leftKey
    rightKey = preferences.rightKey
 
    if (!preferences.stackmat) {
        if (splitEnabled) {
            if (e.key == leftKey) {
                leftDown = true
            } else if (e.key == rightKey) {
                rightDown = true
            }
        } else {
            if (e.key == mainKey) {
                mainDown = true
            }
        }
        if (timerState == "timing") {
            if (e.key == "Escape") {
                timerResult = "DNF"
                stopTimer() 
            } else if (!(preferences.endSplit||OHSplitEnabled)) {
                stopTimer()
            }
        } else {
            if (e.key == "Escape") {
                if (timerState != "normal") {
                    cancelTimer()
                }
            }
        }
    } else {
        if (e.key == mainKey) {
            mainDown = true
        } else if (e.key == "Escape") {
            if (timerState == "inspecting"||timerState == "readyInspection") {
                cancelTimer()
            }
        }
        
    }

    if (e.keyCode == 32 && !globals.menuOpen) {
        e.preventDefault();
        return false;
    }
}

// Get keyboard up events
window.onkeyup = function(e) { 
    if (!preferences.stackmat) {
        if (splitEnabled) {
            if (e.key == leftKey) {
                leftDown = false
            } else if (e.key == rightKey) {
                rightDown = false
            }
        } else {
            if (e.key == mainKey) {
                mainDown = false
            }
        }
    } else {
        if (e.key == mainKey) {
            mainDown = false
        }
    }
    
    if(e.keyCode == 32) {
        e.preventDefault();
        return false;
    } 
}

document.getElementById("background").onmousedown = function(e) {
    if (preferences.useMouse) {
        if (e.button == 0) {
            mainDown = true
        }
        if (timerState == "timing") {
            stopTimer()
        }
    }
}

document.getElementById("background").onmouseup = function(e) {
    if (e.button == 0) {
        mainDown = false
    }
}

// Update the timer frequently
function timerUpdate() {
    inspectionEnabled = (preferences.inspection&&!events.getCurrentEvent().blind)
    splitEnabled = preferences.split||(events.getCurrentEvent().OH&&preferences.OHSplit)
    OHSplitEnabled = preferences.OHSplit&&events.getCurrentEvent().OH
    if (!preferences.stackmat) {
    document.getElementById("background").focus()
    currentTime = new Date();
    
    leftIndicator.style.backgroundColor = indicatorColor
    rightIndicator.style.backgroundColor = indicatorColor
    leftIndicator.style.opacity = 0
    rightIndicator.style.opacity = 0
    switch (timerState) {
        case "normal":       
            if (!globals.menuOpen) {
                if ((preferences.endSplit||OHSplitEnabled)&&splitEnabled&&cooldown) {
                    if (leftDown) {
                        leftIndicator.style.backgroundColor = secondColour
                        leftIndicator.style.opacity = 1     
                    } 
                    if (rightDown) {
                        rightIndicator.style.backgroundColor = secondColour
                        rightIndicator.style.opacity = 1
                    }        
                }
                if (((splitEnabled && leftDown && rightDown)||(!splitEnabled && mainDown))&&!cooldown) {
                    if (inspectionEnabled) {
                        readyInspection()
                    } else {
                        prepareTimer()
                    }
                } 
                if (splitEnabled) {
                    if (leftDown) {
                        leftIndicator.style.backgroundColor = prepareColor
                        leftIndicator.style.opacity = 1
                    } 
                    if (rightDown) {
                        rightIndicator.style.backgroundColor = prepareColor
                        rightIndicator.style.opacity = 1
                    }      
                }
                if (splitEnabled && !leftDown && !rightDown) {
                    cooldown = false
                } else if (!splitEnabled && !mainDown) {
                    cooldown = false
                }
            }
            break
        case "inspectReady":
            if ((splitEnabled && (!leftDown || !rightDown))||(!splitEnabled && !mainDown)) {
                startInspection()
            }
            if (splitEnabled) {
                if (leftDown) {
                    leftIndicator.style.backgroundColor = readyColor
                    leftIndicator.style.opacity = 1
                } 
                if (rightDown) {
                    rightIndicator.style.backgroundColor = readyColor
                    rightIndicator.style.opacity = 1
                }        
            }
            break
        case "inspecting":
            if ((splitEnabled && leftDown && rightDown)||(!splitEnabled && mainDown)) {
                prepareTimer()           
            }
            var timeRemaining = Math.ceil(15+(inspectionTime - timeLastUpdate)/1000)
            if (timeRemaining<=-2 && inspectionEnabled) {
                timerText.innerHTML = "DNF"
                timerResult = "DNF"
            } else if (timeRemaining<=0 && inspectionEnabled) {
                timerText.innerHTML = "+2"
                timerResult = "+2"
            } else if (timeRemaining<=3 && s3 && inspectionEnabled) {
                if (preferences.voice != "none") {
                    s3voice.play()
                    s3 = false
                }
            } else if (timeRemaining<=7 && s7 && inspectionEnabled) {
                if (preferences.voice != "none") {
                    s7voice.play()
                    s7 = false
                }
            }
            if (inspectionEnabled && timeRemaining>0) {
                timerText.innerHTML = timeRemaining
            }
            if (splitEnabled) {
                if (leftDown) {
                    leftIndicator.style.backgroundColor = inspectColor
                    leftIndicator.style.opacity = 1
                } 
                if (rightDown) {
                    rightIndicator.style.backgroundColor = inspectColor
                    rightIndicator.style.opacity = 1
                }        
            }
            break
        case "preparing":
            if ((splitEnabled && (!leftDown || !rightDown))||(!splitEnabled && !mainDown)) {
                window.clearTimeout(prepareTimerID)
                if (inspectionEnabled) {
                    returnToInspection()
                } else {
                    cancelTimer()
                }
            } else {
                var timeRemaining = Math.ceil(15+(inspectionTime - timeLastUpdate)/1000)
                if (timeRemaining<=-2 && inspectionEnabled) {
                    timerText.innerHTML = "DNF"
                    timerResult = "DNF"
                } else if (timeRemaining<=0 && inspectionEnabled) {
                    timerText.innerHTML = "+2"
                    timerResult = "+2"
                } else if (timeRemaining<=3 && s3 && inspectionEnabled) {
                    if (preferences.voice != "none") {
                        s3voice.play()
                        s3 = false
                    }
                } else if (timeRemaining<=7 && s7 && inspectionEnabled) {
                    if (preferences.voice != "none") {
                        s7voice.play()
                        s7 = false
                    }
                }
                if (inspectionEnabled && timeRemaining>0) {
                    timerText.innerHTML = timeRemaining
                }
                if (inspectionEnabled && timeRemaining>0) {
                    timerText.innerHTML = timeRemaining
                }
            }       
            if (splitEnabled) {
                if (leftDown) {
                    leftIndicator.style.backgroundColor = prepareColor
                    leftIndicator.style.opacity = 1
                } 
                if (rightDown) {
                    rightIndicator.style.backgroundColor = prepareColor
                    rightIndicator.style.opacity = 1
                }        
            }
            break
        case "ready":
            if ((splitEnabled && (!leftDown || !rightDown))||(!splitEnabled && !mainDown)) {
                startTimer()
            } else if (inspectionEnabled) {
                var timeRemaining = Math.ceil(15+(inspectionTime - timeLastUpdate)/1000);
                if (timeRemaining<=-2) {
                    timerText.innerHTML = "DNF"
                    timerResult = "DNF"
                } else if (timeRemaining<=0 && inspectionEnabled) {
                    timerText.innerHTML = "+2"
                    timerResult = "+2"
                } else if (timeRemaining<=3 && s3 && inspectionEnabled) {
                    if (preferences.voice != "none") {
                        s3voice.play()
                        s3 = false
                    }
                } else if (timeRemaining<=7 && s7 && inspectionEnabled) {
                    if (preferences.voice != "none") {
                        s7voice.play()
                        s7 = false
                    }
                }
                if (inspectionEnabled && timeRemaining>0) {
                    timerText.innerHTML = timeRemaining
                }
            }
            if (splitEnabled) {
                if (leftDown) {
                    leftIndicator.style.backgroundColor = readyColor
                    leftIndicator.style.opacity = 1
                } 
                if (rightDown) {
                    rightIndicator.style.backgroundColor = readyColor
                    rightIndicator.style.opacity = 1
                }        
            }
            break
        case "timing":
            if (preferences.endSplit&&splitEnabled) {
                if (leftDown) {
                    leftIndicator.style.backgroundColor = readyColor
                    leftIndicator.style.opacity = 1
                } 
                if (rightDown) {
                    rightIndicator.style.backgroundColor = readyColor
                    rightIndicator.style.opacity = 1
                }        
            }
            
            
            if (splitEnabled&&OHSplitEnabled) {
                if (!leftDown&&!rightDown) {
                    timerResult = "DNF"
                    timerText.style.color = prepareColor
                }
            }
            timerTime = ((timeLastUpdate - startTime)/1000)
            if (preferences.hideTiming) {
                timerText.innerHTML = "Solve"
            } else {
                timerText.innerHTML = formatTime(timerTime)
            } 
            if ((OHSplitEnabled||preferences.endSplit)&&leftDown&&rightDown&&splitEnabled) {
                stopTimer()
            }
            break
        }
        
        timeLastUpdate = currentTime.getTime()
    }
}

// Inspection ready to start
function readyInspection() {
    timerState = "inspectReady"
    timerText.style.color = readyColor    
}

// Start inspecting puzzle
function startInspection() {
    timerState = "inspecting"
    timerText.style.color = inspectColor 
    timerText.innerHTML = "15"
    inspectionTime = currentTime.getTime()
    timerResult = "OK"
    $("#stats").fadeOut()
    $("#scramble").fadeOut()
    $("#preferencesButton").fadeOut()
    $("#tools").fadeOut()
    $("#addToolButton").fadeOut()
    $("#toolSelect").fadeOut()
    $("#previewButton").fadeOut()
    s3 = true
    s7 = true
    if (preferences.extendedVideos) {
        record.startRecorder()
    }
}

// Prepare timer to start timing
function prepareTimer() {
    timerState = "preparing"
    timerText.style.color = prepareColor 
    prepareTimerID = window.setTimeout(readyTimer,preferences.timerDelay*1000)
}

// Return from readying to inspecting
function returnToInspection() {
    timerState = "inspecting"
    timerText.style.color = inspectColor 
}

// Timer is ready to start
function readyTimer() {
    timerState = "ready"
    timerText.style.color = readyColor
    $("#stats").fadeOut()
    $("#scramble").fadeOut()
    $("#preferencesButton").fadeOut()
    $("#tools").fadeOut()
    $("#addToolButton").fadeOut()
    $("#toolSelect").fadeOut()
    $("#previewButton").fadeOut()
}

// Start timer recording
function startTimer() {
    if (!preferences.extendedVideos||(!preferences.inspection&&preferences.extendedVideos)) {
        record.startRecorder()
    }
    timerState = "timing"
    timerText.style.color = normalColor
    
    currentTime = new Date();
    startTime = currentTime.getTime()
}

// Stop the timer
function stopTimer() {
    timerState = "normal"
    timerText.style.color = normalColor
    currentTime = new Date();
    timerTime = ((currentTime - startTime)/1000)
    timerText.innerHTML = formatTime(timerTime)
    submitTime()
    inspectionTime = currentTime.getTime()
    scramble.scramble()
    $("#stats").fadeIn()
    $("#scramble").fadeIn()
    $("#preferencesButton").fadeIn()
    $("#toolSelect").fadeIn()
    $("#tools").fadeIn()
    $("#addToolButton").fadeIn()
    
    $("#previewButton").fadeIn()
    cooldown = true
    timerResult = "OK";
    if (!preferences.extendedVideos) {
        record.stopRecorder()
    } else {
        setTimeout(function(){
            record.stopRecorder()
        },3000)
    }
}

// Cancel the timer at anytime
function cancelTimer() {
    timerState = "normal"
    timerText.style.color = normalColor
    timerText.innerHTML = (0).toFixed(preferences.timerDetail)
    timerTime = 0
    timerResult = "OK"
    inspectionTime = currentTime.getTime()
    startTime = currentTime.getTime()
    $("#stats").fadeIn()
    $("#scramble").fadeIn()
    $("#preferencesButton").fadeIn()
    $("#tools").fadeIn()
    $("#addToolButton").fadeIn()
    $("#toolSelect").fadeIn()
    $("#previewButton").fadeIn()
    if (preferences.extendedVideos) {
        record.cancelRecorder()
    }
}

// Submit a time to be created
function submitTime() {
    events.createRecord(timerTime,timerResult);
}

// Get stackmat information is used and display it
function SMCallback(state) {
    if (preferences.stackmat) {
        leftDown = Boolean(state.leftHand)  // Boolean will guarantee the variable is not undefined
        rightDown = Boolean(state.rightHand)
    
        document.getElementById("background").focus()

        leftIndicator.style.backgroundColor = indicatorColor
        rightIndicator.style.backgroundColor = indicatorColor
        leftIndicator.style.opacity = 0
        rightIndicator.style.opacity = 0

        if (state.on) {
        switch (timerState) {
            case "normal":      
                if (mainDown&&inspectionEnabled) {
                    readyInspection()
                }
                if (!globals.menuOpen) {
                    leftIndicator.style.opacity = 1
                    if (leftDown) {
                        leftIndicator.style.backgroundColor = prepareColor
                    } else {
                        leftIndicator.style.backgroundColor = normalColor
                    }
                    
                    rightIndicator.style.opacity = 1
                    if (rightDown) {
                        rightIndicator.style.backgroundColor = prepareColor 
                    } else {
                        rightIndicator.style.backgroundColor = normalColor
                    }    
                }

                if (leftDown && rightDown && (state.time_milli == 0)){
                    timerText.style.color = prepareColor
                } else {
                    timerText.style.color = normalColor
                }
                if (state.greenLight) {
                    timerText.style.color = readyColor
                    leftIndicator.style.backgroundColor = readyColor
                    rightIndicator.style.backgroundColor = readyColor
                    leftIndicator.style.opacity = 1
                    rightIndicator.style.opacity = 1
                }
                
                timerText.innerHTML = formatTime(state.time_milli/1000)

                if (state.running) {
                    timerState = "timing"
                    $("#stats").fadeOut()
                    $("#scramble").fadeOut()
                    $("#preferencesButton").fadeOut()
                    $("#tools").fadeOut()
                    $("#addToolButton").fadeOut()
                    $("#toolSelect").fadeOut()
                    $("#previewButton").fadeOut()
                    record.startRecorder()
                    timerText.style.color = normalColor
                }

                break
            case "inspectReady":
                timerText.style.color = readyColor
                if (!mainDown) {
                    currentTime = new Date()
                    timeLastUpdate = currentTime.getTime()
                    startInspection()
                }
                break
            case "inspecting":
                timerText.style.color = prepareColor
                var timeRemaining = Math.ceil(15+(inspectionTime - timeLastUpdate)/1000)
                if (timeRemaining<=-2 && inspectionEnabled) {
                    timerText.innerHTML = "DNF"
                    timerResult = "DNF"
                } else if (timeRemaining<=0 && inspectionEnabled) {
                    timerText.innerHTML = "+2"
                    timerResult = "+2"
                } else if (timeRemaining<=3 && s3 && inspectionEnabled) {
                    if (preferences.voice != "none") {
                        s3voice.play()
                        s3 = false
                    }
                } else if (timeRemaining<=7 && s7 && inspectionEnabled) {
                    if (preferences.voice != "none") {
                        s7voice.play()
                        s7 = false
                    }
                }
                if (timeRemaining>0) {
                    timerText.innerHTML = timeRemaining
                }
                
                if (leftDown) {
                    leftIndicator.style.backgroundColor = inspectColor
                    leftIndicator.style.opacity = 1
                }
                if (rightDown) {
                    rightIndicator.style.backgroundColor = inspectColor
                    rightIndicator.style.opacity = 1
                }
                
                if (leftDown && rightDown && (state.time_milli == 0)){
                    timerText.style.color = prepareColor
                    leftIndicator.style.backgroundColor = prepareColor
                    leftIndicator.style.opacity = 1
                    rightIndicator.style.backgroundColor = prepareColor
                    rightIndicator.style.opacity = 1
                } else {
                    timerText.style.color = inspectColor
                }
                
                if (state.greenLight) {
                    timerText.style.color = readyColor
                    leftIndicator.style.backgroundColor = readyColor
                    rightIndicator.style.backgroundColor = readyColor
                    leftIndicator.style.opacity = 1
                    rightIndicator.style.opacity = 1
                }
                
                if (state.running) {
                    timerState = "timing"
                    $("#stats").fadeOut()
                    $("#scramble").fadeOut()
                    $("#preferencesButton").fadeOut()
                    $("#tools").fadeOut()
                    $("#addToolButton").fadeOut()
                    $("#toolSelect").fadeOut()
                    $("#previewButton").fadeOut()
                    if (!preferences.extendedVideos) {
                        record.startRecorder()
                    }
                    timerText.style.color = normalColor
                }
                timeLastUpdate = new Date().getTime()
                break
            
            case "timing":
                if (preferences.endSplit&&splitEnabled) {
                    if (leftDown) {
                        leftIndicator.style.backgroundColor = readyColor
                        leftIndicator.style.opacity = 1
                    } 
                    if (rightDown) {
                        rightIndicator.style.backgroundColor = readyColor
                        rightIndicator.style.opacity = 1
                    }        
                }
                
                if (splitEnabled&&OHSplitEnabled) {
                    if (!leftDown&&!rightDown) {
                        timerResult = "DNF"
                        timerText.style.color = prepareColor
                    }
                }

                if (preferences.hideTiming) {
                    timerText.innerHTML = "Solve"
                } else {
                    timerText.innerHTML = formatTime(state.time_milli/1000)
                } 
                
                timerTime = state.time_milli/1000

                if (!state.running) {
                    timerState = "normal"
                    timerText.style.color = normalColor
                    submitTime()
                    scramble.scramble()
                    $("#stats").fadeIn()
                    $("#scramble").fadeIn()
                    $("#preferencesButton").fadeIn()
                    $("#toolSelect").fadeIn()
                    $("#tools").fadeIn()
                    $("#addToolButton").fadeIn()
                    
                    $("#previewButton").fadeIn()
                    if (!preferences.extendedVideos) {
                        record.stopRecorder()
                    } else {
                        setTimeout(function(){
                            record.stopRecorder()
                        },3000)
                    }
                }   
                break
            }
        } else {
            if (timerState == "timing") {
                timerState = "normal"
                timerText.style.color = normalColor
                submitTime()
                scramble.scramble()
                $("#stats").fadeIn()
                $("#scramble").fadeIn()
                $("#preferencesButton").fadeIn()
                $("#toolSelect").fadeIn()
                $("#tools").fadeIn()
                $("#addToolButton").fadeIn()
                
                $("#previewButton").fadeIn()
                if (!preferences.extendedVideos) {
                    record.stopRecorder()
                } else {
                    setTimeout(function(){
                        record.stopRecorder()
                    },3000)
                }
            }
            timerText.style.color = normalColor
            var s = "--"
            if (preferences.timerDetail > 0) {
                s+="."
            }
            for (var i = 0;i<preferences.timerDetail;i++) {
                s+="-"
            }
            timerText.innerHTML = s
        }
    }
}

// Update timer every 17 milliseconds
window.setInterval(timerUpdate, 17)
