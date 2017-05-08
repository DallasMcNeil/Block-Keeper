// timer.js
// Provides timer functionality, from keyboard or stackmat
// Block Keeper
// Created by Dallas McNeil

var leftIndicator = document.getElementById("leftIndicator")
var rightIndicator = document.getElementById("rightIndicator")
var statsPanel = document.getElementById("stats")
var statsPanel = document.getElementById("timer")

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

// Get keyboard down events
window.onkeydown = function(e) {
    leftKey = preferences.leftKey
    rightKey = preferences.rightKey
 
    if (!preferences.stackmat) {
        if (preferences.split) {
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
        } else if (!preferences.endSplit) {
            stopTimer()
        }
    } else {
        if (e.key == "Escape") {
            if (timerState != "normal") {
                cancelTimer()
            }
        }
    }}
    
    if(e.keyCode == 32 && !sessionButtonsShowing) {
        e.preventDefault();
        return false;
    }
}

// Get keyboard up events
window.onkeyup = function(e) { 
    if (!preferences.stackmat) {
        if (preferences.split) {
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
    }
    if(e.keyCode == 32) {
        e.preventDefault();
        return false;
    }
}

// Update the timer frequently
function timerUpdate() {
    if (!preferences.stackmat) {
    document.getElementById("background").focus()
    currentTime = new Date();
    
    leftIndicator.style.backgroundColor = indicatorColor
    rightIndicator.style.backgroundColor = indicatorColor
    leftIndicator.style.opacity = 0
    rightIndicator.style.opacity = 0
    switch (timerState) {
        case "normal":       
            if (!preferencesOpen && !sessionButtonsShowing) {
                if (preferences.endSplit&&preferences.split&&cooldown) {
                    if (leftDown) {
                        leftIndicator.style.backgroundColor = secondColour
                        leftIndicator.style.opacity = 1     
                    } 
                    if (rightDown) {
                        rightIndicator.style.backgroundColor = secondColour
                        rightIndicator.style.opacity = 1
                    }        
                }
                if (((preferences.split && leftDown && rightDown)||(!preferences.split && mainDown))&&!cooldown) {
                    if (preferences.inspection) {
                        readyInspection()
                    } else {
                        prepareTimer()
                    }
                } 
                if (preferences.split) {
                    if (leftDown) {
                        leftIndicator.style.backgroundColor = prepareColor
                        leftIndicator.style.opacity = 1
                    } 
                    if (rightDown) {
                        rightIndicator.style.backgroundColor = prepareColor
                        rightIndicator.style.opacity = 1
                    }      
                }
                if (preferences.split && preferences.endSplit && !leftDown && !rightDown) {
                    cooldown = false
                } else if (preferences.split && !preferences.endSplit && !leftDown && !rightDown) {
                    cooldown = false
                } else if (!preferences.endSplit && !preferences.split && !mainDown) {
                    cooldown = false
                }
            }
            break
        case "inspectReady":
            if ((preferences.split && (!leftDown || !rightDown))||(!preferences.split && !mainDown)) {
                startInspection()
            }
            if (preferences.split) {
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
            if ((preferences.split && leftDown && rightDown)||(!preferences.split && mainDown)) {
                prepareTimer()           
            }
            var timeRemaining = Math.ceil(15+(inspectionTime - timeLastUpdate)/1000)
            if (timeRemaining<=-2 && preferences.inspection) {
                timerText.innerHTML = "DNF"
                timerResult = "DNF"
            } else if (timeRemaining<=0 && preferences.inspection) {
                timerText.innerHTML = "+2"
                timerResult = "+2"
            } else if (timeRemaining<=3 && s3 && preferences.inspection) {
                if (preferences.voice != "none") {
                    s3voice.play()
                    s3 = false
                }
            } else if (timeRemaining<=7 && s7 && preferences.inspection) {
                if (preferences.voice != "none") {
                    s7voice.play()
                    s7 = false
                }
            }
            if (preferences.inspection && timeRemaining>0) {
                timerText.innerHTML = timeRemaining
            }
            if (preferences.split) {
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
            if ((preferences.split && (!leftDown || !rightDown))||(!preferences.split && !mainDown)) {
                window.clearTimeout(prepareTimerID)
                if (preferences.inspection) {
                    returnToInspection()
                } else {
                    cancelTimer()
                }
            } else {
                var timeRemaining = Math.ceil(15+(inspectionTime - timeLastUpdate)/1000)
                if (timeRemaining<=-2 && preferences.inspection) {
                    timerText.innerHTML = "DNF"
                    timerResult = "DNF"
                } else if (timeRemaining<=0 && preferences.inspection) {
                    timerText.innerHTML = "+2"
                    timerResult = "+2"
                } else if (timeRemaining<=3 && s3 && preferences.inspection) {
                    if (preferences.voice != "none") {
                        s3voice.play()
                        s3 = false
                    }
                } else if (timeRemaining<=7 && s7 && preferences.inspection) {
                    if (preferences.voice != "none") {
                        s7voice.play()
                        s7 = false
                    }
                }
                if (preferences.inspection && timeRemaining>0) {
                    timerText.innerHTML = timeRemaining
                }
                if (preferences.inspection && timeRemaining>0) {
                    timerText.innerHTML = timeRemaining
                }
            }       
            if (preferences.split) {
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
            if ((preferences.split && (!leftDown || !rightDown))||(!preferences.split && !mainDown)) {
                startTimer()
            } else if (preferences.inspection) {
                var timeRemaining = Math.ceil(15+(inspectionTime - timeLastUpdate)/1000);
                if (timeRemaining<=-2) {
                    timerText.innerHTML = "DNF"
                    timerResult = "DNF"
                } else if (timeRemaining<=0 && preferences.inspection) {
                    timerText.innerHTML = "+2"
                    timerResult = "+2"
                } else if (timeRemaining<=3 && s3 && preferences.inspection) {
                    if (preferences.voice != "none") {
                        s3voice.play()
                        s3 = false
                    }
                } else if (timeRemaining<=7 && s7 && preferences.inspection) {
                    if (preferences.voice != "none") {
                        s7voice.play()
                        s7 = false
                    }
                }
                if (preferences.inspection && timeRemaining>0) {
                    timerText.innerHTML = timeRemaining
                }
            }
            if (preferences.split) {
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
            if (preferences.endSplit&&preferences.split) {
                if (leftDown) {
                    leftIndicator.style.backgroundColor = readyColor
                    leftIndicator.style.opacity = 1
                } 
                if (rightDown) {
                    rightIndicator.style.backgroundColor = readyColor
                    rightIndicator.style.opacity = 1
                }        
            }
            timerTime = ((timeLastUpdate - startTime)/1000)
            if (preferences.hideTiming) {
                timerText.innerHTML = "Solve"
            } else {
                timerText.innerHTML = formatTime(timerTime)
            } 
            if (preferences.endSplit&&leftDown&&rightDown&&preferences.split) {
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
    inspectionTime = currentTime.getTime()
    timerResult = "OK"
    $("#stats").fadeOut()
    $("#scramble").fadeOut()
    $("#preferencesButton").fadeOut()
    $("#tool").fadeOut()
    $("#toolSelect").fadeOut()
    $("#previewButton").fadeOut()
    s3 = true
    s7 = true
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
    $("#tool").fadeOut()
    $("#toolSelect").fadeOut()
    $("#previewButton").fadeOut()
}

// Start timer recording
function startTimer() {
    startRecorder()
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
    timerTime = ((timeLastUpdate - startTime)/1000)
    timerText.innerHTML = formatTime(timerTime)
    submitTime()
    stopRecorder()
    inspectionTime = currentTime.getTime()
    scramble()
    $("#stats").fadeIn()
    $("#scramble").fadeIn()
    $("#preferencesButton").fadeIn()
    $("#toolSelect").fadeIn()
    if (toolSelect.value != "none") {
        $("#tool").fadeIn()
    }
    $("#previewButton").fadeIn()
    cooldown = true
    timerResult = "OK";
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
    scramble()
    $("#stats").fadeIn()
    $("#scramble").fadeIn()
    $("#preferencesButton").fadeIn()
    $("#tool").fadeIn()
    $("#toolSelect").fadeIn()
    $("#previewButton").fadeIn()
}

// Submit a time to be created
function submitTime() {
    createRecord(timerTime,timerResult)
}

// Get stackmat information is used and display it
function SMCallback(state) {
    if (preferences.stackmat) {
        if (state.leftHand) {
            leftDown = true
        } else {
            leftDown = false
        }

        if (state.rightHand) {
            rightDown = true
        } else {
            rightDown = false
        }
    
        document.getElementById("background").focus()

        leftIndicator.style.backgroundColor = indicatorColor
        rightIndicator.style.backgroundColor = indicatorColor
        leftIndicator.style.opacity = 0
        rightIndicator.style.opacity = 0

        if (state.on) {
        switch (timerState) {
            case "normal":       
                if (!preferencesOpen && !sessionButtonsShowing) {
                    if (leftDown) {
                        leftIndicator.style.backgroundColor = prepareColor
                        leftIndicator.style.opacity = 1
                    } else {
                        leftIndicator.style.backgroundColor = normalColor
                        leftIndicator.style.opacity = 1
                    }
                    if (rightDown) {
                        rightIndicator.style.backgroundColor = prepareColor 
                        rightIndicator.style.opacity = 1
                    } else {
                        rightIndicator.style.backgroundColor = normalColor
                        rightIndicator.style.opacity = 1
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
                    $("#tool").fadeOut()
                    $("#toolSelect").fadeOut()
                    $("#previewButton").fadeOut()
                    startRecorder()
                    timerText.style.color = normalColor
                }

                break
            case "timing":
                if (preferences.endSplit&&preferences.split) {
                    if (leftDown) {
                        leftIndicator.style.backgroundColor = readyColor
                        leftIndicator.style.opacity = 1
                    } 
                    if (rightDown) {
                        rightIndicator.style.backgroundColor = readyColor
                        rightIndicator.style.opacity = 1
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
                    stopRecorder()
                    scramble()
                    $("#stats").fadeIn()
                    $("#scramble").fadeIn()
                    $("#preferencesButton").fadeIn()
                    $("#toolSelect").fadeIn()
                    if (toolSelect.value != "none") {
                        $("#tool").fadeIn()
                    }
                    $("#previewButton").fadeIn()
                }   
                break
            }
        } else {
            if (timerState == "timing") {
                timerState = "normal"
                timerText.style.color = normalColor
                submitTime()
                stopRecorder()
                scramble()
                $("#stats").fadeIn()
                $("#scramble").fadeIn()
                $("#preferencesButton").fadeIn()
                $("#toolSelect").fadeIn()
                if (toolSelect.value != "none") {
                    $("#tool").fadeIn()
                }
                $("#previewButton").fadeIn()
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
