// sessions.js
// Loads, saves, manages and updates sessions, events and records
// Block Keeper
// Created by Dallas McNeil

var webFrame = require('electron').webFrame;

webFrame.setZoomLevelLimits(1, 1);

var puzzleSelect = document.getElementById("puzzleSelect")
var sessionSelect = document.getElementById("sessionSelect")
var sessionSolves = document.getElementById("sessionSolves")
var sessionMean = document.getElementById("sessionMean")
var sessionRecordsTable = document.getElementById("sessionRecords")
var sessionStatsTable = document.getElementById("sessionStats")
var sessionButtonsDiv = document.getElementById("sessionButtons") 

// Take a number and return a string taking into account minutes and timer detail
function formatTime(s) {
    if (s == "-") {
        return "-"
    }
    if (preferences.formatTime && s>=60) {
        if (s%60<10) {
            return Math.floor(s/60)+":0"+(s%60).toFixed(preferences.timerDetail)    
        } else {
            return Math.floor(s/60)+":"+(s%60).toFixed(preferences.timerDetail)
        }
    } else { 
        return s.toFixed(preferences.timerDetail)
    }
}

// Average all the times
function averageTimes(times) {
    if (times.length > 2) {
        times.sort(function(a, b){return a-b})
        if (times[times.length-1] != -1) {
            while (times[0] == -1) {
                times.push(times.shift())
            }
        }
        times = times.slice(1,-1)
        if (times[0] == -1) {
            return -1
        }
    }
    return meanTimes(times)
}

// Get the mean of all times
function meanTimes(times) {
    var sum = 0
    if (times.length == 0) {
        return -1;
    }
    for( var i = 0; i < times.length; i++ ){
        sum = sum + times[i]
        if (times[i] == -1) {
            return -1
        }
    }
    return sum/times.length
}

// Get the times from the records, including +2's and removing DNF's
function rawTimes(times) {
    var raw = []
    for (var i = 0;i<times.length;i++) {
        if (times[i].result == "OK") {
            raw.push(times[i].time)
        } else if (times[i].result == "+2") {
            raw.push(times[i].time+2)
        }
    }
    return raw
}

// All events, holding all session and record data
var puzzles = [{name:"3x3x3",sessions:[],scramble:scramble3x3},
               {name:"2x2x2",sessions:[],scramble:scramble2x2},
               {name:"4x4x4",sessions:[],scramble:scramble4x4},
               {name:"5x5x5",sessions:[],scramble:scramble5x5},
               
               {name:"Pyraminx",sessions:[],scramble:scramblePyraminx},
               {name:"Skewb",sessions:[],scramble:scrambleSkewb},
               {name:"Megaminx",sessions:[],scramble:scrambleMegaminx},
               {name:"Square-1",sessions:[],scramble:scrambleSquare1},
               {name:"Clock",sessions:[],scramble:scrambleClock},
               {name:"6x6x6",sessions:[],scramble:scramble6x6},
               {name:"7x7x7",sessions:[],scramble:scramble7x7},
               
               {name:"3x3x3 OH",sessions:[],scramble:scramble3x3},
               {name:"3x3x3 BLD",sessions:[],scramble:scramble3x3BLD},
               {name:"4x4x4 BLD",sessions:[],scramble:scramble4x4},
               {name:"5x5x5 BLD",sessions:[],scramble:scramble5x5},
               {name:"3x3x3 FT",sessions:[],scramble:scramble3x3},
               
               {name:"Other",sessions:[],scramble:scrambleNone},
             ]

// Set the scamble function for each event
var scrambleFunctions = [scramble3x3,scramble2x2,scramble4x4,scramble5x5,scramblePyraminx,scrambleSkewb,scrambleMegaminx,scrambleSquare1,scramble3x3,scramble3x3BLD,scrambleClock,scramble6x6,scramble7x7,,scramble4x4,scramble5x5,scramble3x3,scrambleNone] 
var currentPuzzle = 0
var currentSession = 0
var currentRecord = 0


// Save events to a file
function saveSessions() {
    storage.set("puzzles",{puzzles:puzzles, puzzle:currentPuzzle,session:currentSession, tools:toolTypes},
    function(error) {
        if (error) {
            console.log(error)
        }
    })

}

// Save events to a seperate backup file
function closeApp() {
    storage.set("puzzlesBackup",{puzzles:puzzles,puzzle:currentPuzzle,session:currentSession,tools:toolTypes},function(error) {
        if (error) {
            console.log(error)
        }
        letClose = true
        remote.getCurrentWindow().close();
    })
}

var letClose = false
window.onbeforeunload = function (e) {
    if (!letClose) {
        closeApp()
        return false
    }
}

// Merge two sets of events, overriding x with y
function mergeSessions(x,y) {
    var final = [];
    var a = x.slice()
    var b = y.slice()
    for(var i in a){
        var shared = false;
        for (var j in b) {
            if (b[j].name != null) {
                if (b[j].name == a[i].name) {
                    shared = true;
                    break;
                }
            }
        }
        if(shared && (b[j].name != null) && (b[j].sessions != null)) {
            final.push(Object.assign({},a[i],b[j]))
            b.splice(j,1)
        } else {
            if (b[j].name == "Other") {
                b[j].scramble = scrambleNone
            }
            final.push(a[i])
        }
    }
    var length = b.length
    for (var i=length-1;i>=0;i--) {
        if ((b[i].name != null) && (b[i].sessions != null)) {
            if (b[i].name == "Other") {
                b[i].scramble = scrambleNone
            }
            final.push(b[i])
        }
    }
    return final
}

// Load session from file
function loadSessions() {
    var setup = function (object) {
        if (object.puzzles != null) {
            if (object.puzzles.length != 0) {
                puzzles = mergeSessions(puzzles,object.puzzles)
            }
        }

        // Remove MBLD and FM if they are empty
        for (var i=0;i<puzzles.length;i++) {
            if (puzzles[i].name=="3x3x3 MBLD") {
                if (puzzles[i].sessions.length == 0) {
                    puzzles.splice(i,1)
                    break
                }
            }
        }
        for (var i=0;i<puzzles.length;i++) {
            if (puzzles[i].name=="3x3x3 FM") {
                if (puzzles[i].sessions.length == 0) {
                    puzzles.splice(i,1)
                    break
                }
            }
        }


        if (object.puzzle != null) {
            currentPuzzle = object.puzzle
            if (currentPuzzle >= puzzles.length) {
                currentPuzzle = 0
            }
        }
        if (object.session != null) {
            currentSession = object.session
            if (currentSession >= puzzles[currentPuzzle].sessions.length) {
                currentSession = 0
            }
        }
        if (object.tools != null) {
            setupTools(object.tools)
        }
    
        setPuzzleOptions()
        setPuzzle()
    }


    var load = function() {
        storage.get("puzzles",function(error,object) {
            if (error) {
                storage.get("puzzlesBackup",function(error,object) {
                    if (error) {
                         if (confirm("Sessions couldn't be loaded. They may be damaged. Please contact dallas@dallasmcneil.com for help. You will need to quit Block Keeper to preserve the damaged session data, or you could erase it and continue using Block Keeper. Would you like to quit?")) {
                            letClose = true
                            remote.getCurrentWindow().close();
                         } else {
                             setup({})
                         }
                    } else {
                        setup(object)
                        alert("Sessions were restored from backup. Some recent records may be missing.")
                    }
                })
            } else {
                setup(object)
            }
        })
    }
    var loadBackup = function() {
       storage.get("puzzlesBackup",function(error,object) {
            if (error) {
                 if (confirm("Sessions couldn't be loaded. They may be damaged. Please contact dallas@dallasmcneil.com for help. You will need to quit Block Keeper to preserve the damaged session data, or you could erase it and continue using Block Keeper. Would you like to quit?")) {
                     //QUIT
                 } else {
                     saveSessions()
                 }
            } else {
                alert("Sessions were restored from backup. Some recent records may be missing.")
                setup(object)
            }
        })
    }
    storage.has("puzzles", function(error, hasKey) {
        if (hasKey) {
            load()
        } else {
            storage.has("puzzlesBackup", function(error, hasKey) {
                if (hasKey) {
                    loadBackup()
                } else {
                    setup({})
                }
            })
        }
    })
}

// Create a new session in current event
function createSession() {
    var name = new Date().toLocaleDateString()
    var ext = 2
    var shouldBreak = false
    while (!shouldBreak) {
        shouldBreak = true
        for (var i=0;i<puzzles[currentPuzzle].sessions.length;i++) {
            if (name == puzzles[currentPuzzle].sessions[i].name) {
                name = (new Date().toLocaleDateString())+" "+ext
                ext++
                shouldBreak = false
                break
            }
        }
    }   
        
    var session = {date: new Date(), name: (name), records:[]}
    puzzles[currentPuzzle].sessions.push(session)
    currentSession = puzzles[currentPuzzle].sessions.length-1
}

// Deletes current session
function deleteSession() {
    if (confirm("Delete Session?")) {
        var oldLength = puzzles[currentPuzzle].sessions.length
        
        if (oldLength > 1) {
            puzzles[currentPuzzle].sessions.splice(currentSession,1)
            currentSession = puzzles[currentPuzzle].sessions.length-1
        }
    }
}

var disableUpdate = false
// Create a record in the current session
function createRecord(time,result) {
    // Find best time
    if (!disableUpdate&&preferences.showBestTime) {
        var btime = -1
        for (var s=0;s<puzzles[currentPuzzle].sessions.length;s++) {
            for (var r=0;r<puzzles[currentPuzzle].sessions[s].records.length;r++) {
                var t = puzzles[currentPuzzle].sessions[s].records[r].time
                if (puzzles[currentPuzzle].sessions[s].records[r].result == "+2") {
                    t=t+2
                } else if (puzzles[currentPuzzle].sessions[s].records[r].result == "DNF") {
                    continue
                }
                if (t<btime||btime==-1) {
                    btime = t
                }
            }
        }
        
        if (time<=btime&&btime!=-1&&result!="DNF") {
            // New PB, launch the confetti
            $("#announcement").animate({opacity:1},500)
            $("#confetti").animate({opacity:1},500)
            confettiCanvas = Confetti.createCanvas(
              document.getElementById('background'),
              document.getElementById('confetti')
            );
            confettiCanvas.halt = false;
            confettiCanvas.canvas.halt = false;

            var particles = Array.apply(null, Array(Math.floor(confettiCanvas.width/8))).map(function (_, i) {return i;}).map(function () {
              return Confetti.create({
                x: Confetti.randomFrom(0, confettiCanvas.width),
                y: Confetti.randomFrom(-confettiCanvas.height, 0),
                c:Math.floor(Math.random()*6),
                r: Confetti.randomFrom(10, 30),
                tilt: Confetti.randomFrom(-10, 10),
                tiltAngle: 0,
                tiltAngleIncrement: Confetti.randomFrom(0.05, 0.12, 100)
              });
            });
            confettiCanvas.step(particles, confettiConfig)();
            setTimeout(function(){
                $("#announcement").animate({opacity:0},2000)
                $("#confetti").animate({opacity:0},2000,function(){
                     confettiCanvas.destroy()
                })   
            },5000)
        }
    }
    var record = {time:time,scramble:currentScramble,result:result}
    puzzles[currentPuzzle].sessions[currentSession].records.push(record)
    $("#sessionRecordsContainer").animate({scrollTop:Number.MAX_SAFE_INTEGER+"px"},100)
    if (!disableUpdate) {
        updateRecords()
    }
}

// Show time dialog to add a custom time
function showTimeDialog() {
    if ($("#dialogAddTime").dialog("isOpen")) {
        closeTimeDialog()
        return
    }
    $("#dialogAddTime").dialog("open")
    $("#preferencesButton").addClass("disabled")
    $("#preferencesButton").prop("disabled",true)
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
    preferencesOpen = true
}

// Close the time dialog
function closeTimeDialog() {
    $("#preferencesButton").removeClass("disabled")
    $("#preferencesButton").prop("disabled",false)
    $("#dialogAddTime").dialog("close")
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
        
    if (hasVideo && preferences.recordSolve && !videoLoading) {
        $("#previewButton").removeClass("disabled")
        $("#previewButton").prop("disabled",false)
    }
    preferencesOpen = false
}

// Create record from the timer
function addTime() {
    var t = parseFloat(parseFloat(document.getElementById("addTimeInput").value).toFixed(3))
    document.getElementById("addTimeInput").value = ""
    if (isNaN(t)) {
        return
    }
    if (t<=0) {
        return
    }
    createRecord(t,"OK")
    timerText.innerHTML = formatTime(t)
    scramble()
    closeTimeDialog()
}

// Set the event based on the selected dropdown
function setPuzzle() {
    if (puzzles[currentPuzzle].sessions.length != 0) {
        if (puzzles[currentPuzzle].sessions[puzzles[currentPuzzle].sessions.length-1].records.length == 0) {
            puzzles[currentPuzzle].sessions.pop()
        }
    }
    currentPuzzle = parseInt(puzzleSelect.value)
    if (puzzles[currentPuzzle].sessions.length == 0) {
        createSession()
    }
    updateSessions()
    currentSession = puzzles[currentPuzzle].sessions.length-1
    sessionSelect.value = currentSession
    updateRecords()
    scramble()
}

// Populate the event dropdown with events
function setPuzzleOptions() {
    var length = puzzleSelect.options.length;
    for (var i=length-1;i>=0;i--) {
        puzzleSelect.options[i] = null;
    }
    for (var i = 0;i<puzzles.length;i++) {
        var option = document.createElement("option");
        option.text = puzzles[i].name;
        option.value = i;
        puzzleSelect.add(option);
    }
    puzzleSelect.value = currentPuzzle
}

// Set the session based on the dropdown
function setSession() {
     currentSession = sessionSelect.value
     updateRecords()
}

// Update all records displayed on screen
function updateRecords() {
    var debugTime = new Date().getTime()
 
    var records = puzzles[currentPuzzle].sessions[currentSession].records
    var length = sessionRecordsTable.rows.length-1
    if (records.length < length) {
        for (var i = 0;i<length-records.length;i++) {
            sessionRecordsTable.deleteRow(-1)
        }
    } else if (length < records.length) {
        for (var i = 0;i<records.length-length;i++) {
            (function () {
                var row = sessionRecordsTable.insertRow(-1)
                var cell = row.insertCell(-1)
                cell.appendChild(document.createElement("p")) 
                cell = row.insertCell(-1)
                cell.appendChild(document.createElement("p"))
                cell = row.insertCell(-1)
                cell.appendChild(document.createElement("p"))
                var n = sessionRecordsTable.rows.length-1
                if (n>4) {
                    cell.className+=" selectable"
                }
                cell.onclick = function(){
                    openShowInfo("Ao5",n);
                }   
                cell = row.insertCell(-1)
                if (n>11) {
                    cell.className+=" selectable"
                }
                cell.appendChild(document.createElement("p"))  
                cell.onclick = function(){
                    openShowInfo("Ao12",n);
                } 
            }())
        }
    }

    var times = records.length>0 ? new Array(records.length) : []
    var mo3s = records.length>2 ? new Array(records.length-2) : []
    var ao5s = records.length>4 ? new Array(records.length-4) : []
    var ao12s = records.length>11 ? new Array(records.length-11) : []
    var ao50s = records.length>49 ? new Array(records.length-49) : []
    var ao100s = records.length>99 ? new Array(records.length-99) : []
    var DNFsolves = 0

    for (var i = 0;i<records.length;i++) {
        if (records[i].result != "DNF") {
            DNFsolves++
        }
        var tResult = records[i].time
        if (records[i].result == "DNF") {
            tResult = -1
        } else if (records[i].result == "+2") {
            tResult=tResult+2
        }
        times[i] = tResult
        var ao5t = "-"
        var ao12t = "-"
        if (i >= 2) {
            mo3s[i-2] = (meanTimes(times.slice(i-2,i+1)))
        }
        if (i >= 4) {
            ao5s[i-4] = (averageTimes(times.slice(i-4,i+1)))
            ao5t = ao5s[i-4]
        }
        if (i >= 11) {
            ao12s[i-11] = (averageTimes(times.slice(i-11,i+1)))
            ao12t = ao12s[i-11]
        }
        if (i >= 49) {
            ao50s[i-49] = (averageTimes(times.slice(i-49,i+1)))
        }
        if (i >= 99) {
            ao100s[i-99] = (averageTimes(times.slice(i-99,i+1)))
        } 
        sessionRecordsTable.rows[i+1].cells[0].children[0].innerHTML = i+1

        if (times[i] == -1) {
            sessionRecordsTable.rows[i+1].cells[1].children[0].innerHTML = "DNF"
        } else if (records[i].result == "+2") {
            sessionRecordsTable.rows[i+1].cells[1].children[0].innerHTML = formatTime(times[i]) + "+"
        } else {
            sessionRecordsTable.rows[i+1].cells[1].children[0].innerHTML = formatTime(times[i])
        }
        
        if (ao5t == -1) {
            sessionRecordsTable.rows[i+1].cells[2].children[0].innerHTML = "DNF"
        } else if (ao5t == "-") {
            sessionRecordsTable.rows[i+1].cells[2].children[0].innerHTML = ao5t
        } else {
            sessionRecordsTable.rows[i+1].cells[2].children[0].innerHTML = formatTime(ao5t)
        }
        
        if (ao12t == -1) {
            sessionRecordsTable.rows[i+1].cells[3].children[0].innerHTML = "DNF"
        } else if (ao12t == "-") {
            sessionRecordsTable.rows[i+1].cells[3].children[0].innerHTML = ao12t
        } else {
            sessionRecordsTable.rows[i+1].cells[3].children[0].innerHTML = formatTime(ao12t)
        }
    }

    var mean = meanTimes(times.filter(function(t) {return t!=-1}))
    if (mean == -1) {
        $("#sessionMean").prop("innerHTML","<b>Mean:</b> "+formatTime(0))
        $("#sessionSD").prop("innerHTML","<b>σ(s.d):</b> "+formatTime(0))
        $("#sessionMedian").prop("innerHTML","<b>Median:</b> "+formatTime(0))
    } else {
        $("#sessionMean").prop("innerHTML","<b>Mean:</b> "+formatTime(mean))
        var sum = 0
        var t = times.filter(function(t) {return t!=-1})
        for (var i=0;i<t.length;i++) {
            sum+=((t[i]-mean)*(t[i]-mean))
        }
        $("#sessionSD").prop("innerHTML","<b>σ(s.d):</b> "+formatTime(Math.sqrt(sum/t.length)))
        
        var sortedTimes = t.sort()
        $("#sessionMedian").prop("innerHTML","<b>Median:</b> "+formatTime((sortedTimes[Math.ceil((sortedTimes.length-1)/2)]+sortedTimes[Math.floor((sortedTimes.length-1)/2)])/2))
    }
    $("#sessionSolves").prop("innerHTML","<b>Solves:</b> "+DNFsolves+"/"+records.length)
        
    for (var i = 0;sessionStatsTable.rows.length>1;i++) {
        sessionStatsTable.deleteRow(-1)
    }
    
    var extraHeight = 0
    var row = sessionStatsTable.insertRow(-1)
    var name = row.insertCell(-1)
    var nameP = document.createElement("p")
    nameP.innerHTML = "Time"
    name.appendChild(nameP)

    var current = row.insertCell(-1)
    current.className+=" selectable"
    current.onclick = function(){
        openShowInfo("Current",1);
    } 
    var currentP = document.createElement("p")
    if (times.length == 0) {
        currentP.innerHTML = "-"
    } else if (times[times.length-1] == -1) {
        currentP.innerHTML = "DNF"
    } else {
        currentP.innerHTML = formatTime(times[times.length-1])
    }
    current.appendChild(currentP)

    var best = row.insertCell(-1)
    best.className+=" selectable"
    best.onclick = function(){
        openShowInfo("Best",1);
    } 
    var bestP = document.createElement("p")
    if (times.length == 0) {
        bestP.innerHTML = "-"
    } else {
        var t = Math.min.apply(null,times.filter(function(t) {return t!=-1}))
        if (t == Infinity) {
            bestP.innerHTML = "DNF"
        } else {
            bestP.innerHTML = formatTime(t)
        }
    }
    best.appendChild(bestP)
    extraHeight=extraHeight+30

    if (records.length > 2) {
        var row = sessionStatsTable.insertRow(-1)
        var name = row.insertCell(-1)
        var nameP = document.createElement("p")
        nameP.innerHTML = "Mo3"
        name.appendChild(nameP)
        
        var current = row.insertCell(-1)
        current.className+=" selectable"
        current.onclick = function(){
            openShowInfo("Current",3);
        } 
        var currentP = document.createElement("p")
        if (mo3s[mo3s.length-1] == -1) {
            currentP.innerHTML = "DNF"
        } else {
            currentP.innerHTML = formatTime(mo3s[mo3s.length-1])
        }
        current.appendChild(currentP)
        
        var best = row.insertCell(-1)
        best.className+=" selectable"
        best.onclick = function(){
            openShowInfo("Best",3);
        } 
        var bestP = document.createElement("p")
        var t = Math.min.apply(null,mo3s.filter(function(t) {return t!=-1}))
        if (t == Infinity) {
            bestP.innerHTML = "DNF"
        } else {
            bestP.innerHTML = formatTime(t)
        }
        best.appendChild(bestP)
        extraHeight=extraHeight+30
    }
    
    if (records.length > 4) {
        var row = sessionStatsTable.insertRow(-1)
        var name = row.insertCell(-1)
        var nameP = document.createElement("p")
        nameP.innerHTML = "Ao5"
        name.appendChild(nameP)
        
        var current = row.insertCell(-1)
        current.className+=" selectable"
        current.onclick = function(){
            openShowInfo("Current",5);
        } 
        var currentP = document.createElement("p")
        if (ao5s[ao5s.length-1] == -1) {
            currentP.innerHTML = "DNF"
        } else {
            currentP.innerHTML = formatTime(ao5s[ao5s.length-1])
        }
        current.appendChild(currentP)
        
        var best = row.insertCell(-1)
        best.className+=" selectable"
        best.onclick = function(){
            openShowInfo("Best",5);
        } 
        var bestP = document.createElement("p")
        var t = Math.min.apply(null,ao5s.filter(function(t) {return t!=-1}))
        if (t == Infinity) {
            bestP.innerHTML = "DNF"
        } else {
            bestP.innerHTML = formatTime(t)
        }
        best.appendChild(bestP)  
        extraHeight=extraHeight+30
    }
    if (records.length > 11) {
        var row = sessionStatsTable.insertRow(-1)
        var name = row.insertCell(-1)
        var nameP = document.createElement("p")
        nameP.innerHTML = "Ao12"
        name.appendChild(nameP)
        
        var current = row.insertCell(-1)
        current.className+=" selectable"
        current.onclick = function(){
            openShowInfo("Current",12);
        }
        var currentP = document.createElement("p")
        if (ao12s[ao12s.length-1] == -1) {
            currentP.innerHTML = "DNF"
        } else {
            currentP.innerHTML = formatTime(ao12s[ao12s.length-1])
        }
        current.appendChild(currentP)
        
        var best = row.insertCell(-1)
        best.className+=" selectable"
        best.onclick = function(){
            openShowInfo("Best",12);
        } 
        var bestP = document.createElement("p")
        var t = Math.min.apply(null,ao12s.filter(function(t) {return t!=-1}))
        if (t == Infinity) {
            bestP.innerHTML = "DNF"
        } else {
            bestP.innerHTML = formatTime(t)
        }
        best.appendChild(bestP)
        extraHeight=extraHeight+30
    }
    if (records.length > 49) {
        var row = sessionStatsTable.insertRow(-1)
        
        var name = row.insertCell(-1)
        
        var nameP = document.createElement("p")
        nameP.innerHTML = "Ao50"
        name.appendChild(nameP)
        
        var current = row.insertCell(-1)
        current.className+=" selectable"
        current.onclick = function(){
            openShowInfo("Current",50);
        }
        var currentP = document.createElement("p")
        if (ao50s[ao50s.length-1] == -1) {
            currentP.innerHTML = "DNF"
        } else {
            currentP.innerHTML = formatTime(ao50s[ao50s.length-1])
        }
        current.appendChild(currentP)
        
        var best = row.insertCell(-1)
        best.className+=" selectable"
        best.onclick = function(){
            openShowInfo("Best",50);
        } 
        var bestP = document.createElement("p")
        var t = Math.min.apply(null,ao50s.filter(function(t) {return t!=-1}))
        if (t == Infinity) {
            bestP.innerHTML = "DNF"
        } else {
            bestP.innerHTML = formatTime(t)
        }
        best.appendChild(bestP)
        extraHeight=extraHeight+30
    }
    if (records.length > 99) {
        var row = sessionStatsTable.insertRow(-1)
        
        var name = row.insertCell(-1)
        var nameP = document.createElement("p")
        nameP.innerHTML = "Ao100"
        name.appendChild(nameP)
        
        var current = row.insertCell(-1)
        current.className+=" selectable"
        current.onclick = function(){
            openShowInfo("Current",100);
        }
        var currentP = document.createElement("p")
        if (ao100s[ao100s.length-1] == -1) {
            currentP.innerHTML = "DNF"
        } else {
            currentP.innerHTML = formatTime(ao100s[ao100s.length-1])
        }
        current.appendChild(currentP)
        
        var best = row.insertCell(-1)
        best.className+=" selectable"
        best.onclick = function(){
            openShowInfo("Best",100);
        } 
        var bestP = document.createElement("p")
        var t = Math.min.apply(null,ao100s.filter(function(t) {return t!=-1}))
        if (t == Infinity) {
            bestP.innerHTML = "DNF"
        } else {
            bestP.innerHTML = formatTime(t)
        }
        best.appendChild(bestP)
        extraHeight=extraHeight+30
    }
    $("#sessionRecords td").hover(function(e) {
        if (!preferencesOpen) {
            var column = parseInt( $(this).index());
            var row = parseInt( $(this).parent().index());  
            if (column == 1 && row > 0) {
                $("#dialogRecord").dialog("open")
                $("#dialogRecord").dialog({
                    autoOpen : false,
                    modal : true,
                    hide: "fade",
                    width: "199",
                    height: "120",
                    position: {
                        my:"left top",
                        at:"right top",
                        of:sessionRecordsTable.rows[row].cells[column]
                    }
                });
                currentRecord = row-1
                $("#recordScramble").html(puzzles[currentPuzzle].sessions[currentSession].records[currentRecord].scramble)
            } else {
                if ($("#dialogRecord").dialog('isOpen')) {
                    $("#dialogRecord").dialog("close")
                }
            }
        }
    })    

    setTimeout(function() {
        extraHeight+=$("#sessionDetails").height()
        $("#sessionRecordsContainer").css("max-height","calc(100vh - ("+extraHeight+"px + 170px))")
    },10);
    
    updateTool()
    saveSessions()
}

var sessionButtonsShowing = false

// Toggle session options showing
function toggleSessionButtons() {
    if (puzzles[currentPuzzle].sessions.length < 2) {
        $("#deleteSessionButton").addClass("disabled")
        $("#deleteSessionButton").disabled = false
    } else {
        $("#deleteSessionButton").removeClass("disabled")
        $("#deleteSessionButton").disabled = true
    }
    if (sessionButtonsShowing) {
        var newElement = document.createElement("select")
        newElement.id = "sessionSelect"
        newElement.title = "Session Select"
        newElement.onchange = setSession
        puzzles[currentPuzzle].sessions[currentSession].name = sessionSelect.value
        document.getElementById("sessionContainer").replaceChild(newElement,sessionSelect)
        sessionSelect = document.getElementById("sessionSelect")
        updateSessions()
        newElement.value = currentSession
        $("#sessionButtons").animate({height:'0px'},200)
        sessionButtonsShowing = false
        showStats()
    } else {
        var newElement = document.createElement("input")
        newElement.type = "text"
        newElement.title = "Session Name"
        newElement.id = "sessionSelectText"
        newElement.value = puzzles[currentPuzzle].sessions[currentSession].name
        document.getElementById("sessionContainer").replaceChild(newElement,sessionSelect)
        sessionSelect = document.getElementById("sessionSelectText")
        $("#sessionButtons").animate({height:'40px'},200)
        sessionButtonsShowing = true
        hideStats()
    } 
}

// Create session button pressed
function createSessionButton() {
    puzzles[currentPuzzle].sessions[currentSession].name = sessionSelect.value
    createSession()
    sessionSelect.value =  puzzles[currentPuzzle].sessions[currentSession].name 
    updateRecords()
    if (puzzles[currentPuzzle].sessions.length > 1) {
        $("#deleteSessionButton").removeClass("disabled")
        $("#deleteSessionButton").disabled = false
    }
}

// Delete session button pressed
function deleteSessionButton() {
    if (puzzles[currentPuzzle].sessions.length > 1) {
        deleteSession()
        var newElement = document.createElement("select")
        newElement.id = "sessionSelect"
        newElement.onchange = setSession
        document.getElementById("sessionContainer").replaceChild(newElement,sessionSelect)
        sessionSelect = document.getElementById("sessionSelect")
        updateSessions()
        sessionButtonsShowing = false
        showStats()
        updateRecords()
        $("#sessionButtons").animate({height:'0px'},200)
    }
}

// Update sessions dropdown
function updateSessions() {
    var length = sessionSelect.options.length
    for (var i = length-1; i>=0 ; i--) {
        sessionSelect.options[i] = null;
    }
    for (var i = 0;i<puzzles[currentPuzzle].sessions.length;i++) {
        var option = document.createElement("option");
        option.text = puzzles[currentPuzzle].sessions[i].name;
        option.value = i;
        sessionSelect.add(option);
    }
    sessionSelect.value = puzzles[currentPuzzle].sessions.length-1
}

// Hide the session stats
function hideStats() {
    $("#puzzleSelect").addClass("disabled")
    $("#puzzleSelect").prop('disabled', true)
    $("#sessionStats").addClass("disabled")
    $("#sessionStats").prop('disabled', true)
    $("#sessionRecordsContainer").addClass("disabled")
    $("#sessionRecordsContainer").prop('disabled', true)
    $("#sessionDetails").addClass("disabled")
    $("#sessionDetails").prop('disabled', true)
}

// Show the session stats
function showStats() {
    $("#puzzleSelect").removeClass("disabled")
    $("#puzzleSelect").prop('disabled', false)
    $("#sessionStats").removeClass("disabled")
    $("#sessionStats").prop('disabled', false)
    $("#sessionRecordsContainer").removeClass("disabled")
    $("#sessionRecordsContainer").prop('disabled', false)
    $("#sessionDetails").removeClass("disabled")
    $("#sessionDetails").prop('disabled', false)
}

// Reset the session buttons
function resetUI() {
    if (sessionButtonsShowing) {
        toggleSessionButtons()
    }
}

// Set last record to OK result
function recordResultOK() {
    if (puzzles[currentPuzzle].sessions[currentSession].records.length > 0) {
        puzzles[currentPuzzle].sessions[currentSession].records[currentRecord].result = "OK"
        $("#dialogRecord").dialog("close")
        updateRecords()
    }
}

// Set last record to +2 result
function recordResult2() {
    if (puzzles[currentPuzzle].sessions[currentSession].records.length > 0) {
        puzzles[currentPuzzle].sessions[currentSession].records[currentRecord].result = "+2"
        $("#dialogRecord").dialog("close")
        updateRecords()
    }
}

// Set last record to DNF result
function recordResultDNF() {
    if (puzzles[currentPuzzle].sessions[currentSession].records.length > 0) {
        puzzles[currentPuzzle].sessions[currentSession].records[currentRecord].result = "DNF"
        $("#dialogRecord").dialog("close")
        updateRecords()
    }
}

// Delete the last record in the current session
function deleteRecord() {
    if (puzzles[currentPuzzle].sessions[currentSession].records.length > 0) {
        puzzles[currentPuzzle].sessions[currentSession].records.splice(currentRecord,1)
        $("#dialogRecord").dialog("close")
        updateRecords()
    }
}

// Close record dialog on background hover
$("#background").hover(function() {
    $("#dialogRecord").dialog("close")
})

// Create dialog record to view record details
$("#dialogRecord").dialog({
    autoOpen : false,
    modal : true,
    width: "199",
    height: "92" 
});

// Create add time dialog
$("#dialogAddTime").dialog({
    autoOpen : false,
    modal : true,
    width: "225",
    height: "144",
    show:"fade",
    hide:"fade"
}).on('keydown', function(evt) {
    if (evt.keyCode === $.ui.keyCode.ESCAPE) {
        closeTimeDialog()
    } else if (evt.keyCode === 13) {
        addTime()
        evt.preventDefault();
    }
    evt.stopPropagation();
});


$("#dialogShowInfo").dialog({
    autoOpen : false,
    modal : true,    
    position: {
        my:"center",
        at:"center",
        of:"#background"
    },
    width: "640",
    height: "480",
    show:"fade",
    hide:"fade"
})

function openShowInfo(type,a) {
    if (preferencesOpen) {
        return
    }
    var str = ""
    if (type == "Ao5") {
        if (a < 5) {
            return
        }
        var r = puzzles[currentPuzzle].sessions[currentSession].records.slice(a-5,a)
        var ao5 = (averageTimes(extractTimes(r)))
        if (ao5 == -1) {
            str = "Ao5: DNF<br>"
        } else {
            str = "Ao5: "+formatTime(ao5)+"<br>"
        }
        var ts = extractTimes(r)
        var sts = ts.slice();
        sts.sort((a,b)=>{
            if (a==-1) {
                return -1
            } else if (b==-1) {
                return 1
            } else {
                return a-b
            }
        });
        var min = sts[0]
        var max = sts[4]
        for (var i=0;i<5;i++) {
            str+=("<br>"+(i+1)+". ")
            
            if (ts[i] == max) {
                str+="("
            } else if (ts[i] == min) {
                str+="("
            }
            if (r[i].result == "OK") {
                str+=(formatTime(r[i].time))
            } else if (r[i].result == "+2") {
                str+=(formatTime(r[i].time+2)+"+")
            } else {
                str+="DNF"
            }
            if (ts[i] == max) {
                str+=")"
                max = -2
            } else if (ts[i] == min) {
                str+=")"
                min = -2
            }
            str+=(" ("+r[i].scramble.trim()+")")
        }   
        
    } else if (type == "Ao12") {
        if (a < 12) {
            return
        }
        var r = puzzles[currentPuzzle].sessions[currentSession].records.slice(a-12,a)
        var ao12 = (averageTimes(extractTimes(r)))
        if (ao12 == -1) {
            str = "Ao12: DNF<br>"
        } else {
            str = "Ao12: "+formatTime(ao12)+"<br>"
        }
        var ts = extractTimes(r)
        var sts = ts.slice();
        sts.sort((a,b)=>{
            if (a==-1) {
                return -1
            } else if (b==-1) {
                return 1
            } else {
                return a-b
            }
        });
        var min = sts[0]
        var max = sts[11]
        for (var i=0;i<12;i++) {
            str+=("<br>"+(i+1)+". ")
            
            if (ts[i] == max) {
                str+="("
            } else if (ts[i] == min) {
                str+="("
            }
            if (r[i].result == "OK") {
                str+=(formatTime(r[i].time))
            } else if (r[i].result == "+2") {
                str+=(formatTime(r[i].time+2)+"+")
            } else {
                str+="DNF"
            }
            if (ts[i] == max) {
                str+=")"
                max = -2
            } else if (ts[i] == min) {
                str+=")"
                min = -2
            }
            str+=(" ("+r[i].scramble.trim()+")")
        }   
    } else if (type == "Current") {
        if (a == 1) {
            var r = puzzles[currentPuzzle].sessions[currentSession].records[puzzles[currentPuzzle].sessions[currentSession].records.length-1]
            str+=("1. ")

            if (r.result == "OK") {
                str+=(formatTime(r.time))
            } else if (r.result == "+2") {
                str+=(formatTime(r.time+2)+"+")
            } else {
                str+="DNF"
            }
            str+=(" ("+r.scramble.trim()+")")
        } else if (a == 3) {
            var r = puzzles[currentPuzzle].sessions[currentSession].records.slice(-3)
            var mo3 = (meanTimes(extractTimes(r)))
            if (mo3 == -1) {
                str = "Mo3: DNF<br>"
            } else {
                str = "Mo3: "+formatTime(mo3)+"<br>"
            }
            var ts = extractTimes(r)
            
            for (var i=0;i<a;i++) {
                str+=("<br>"+(i+1)+". ")

                if (r[i].result == "OK") {
                    str+=(formatTime(r[i].time))
                } else if (r[i].result == "+2") {
                    str+=(formatTime(r[i].time+2)+"+")
                } else {
                    str+="DNF"
                }
                str+=(" ("+r[i].scramble.trim()+")")
            }   
        } else {
            var r = puzzles[currentPuzzle].sessions[currentSession].records.slice(-a)
            var aoa = (averageTimes(extractTimes(r)))
            if (aoa == -1) {
                str = "Ao"+a+": DNF<br>"
            } else {
                str = "Ao"+a+": "+formatTime(aoa)+"<br>"
            }
            var ts = extractTimes(r)
            var sts = ts.slice();
            sts.sort((a,b)=>{
                if (a==-1) {
                    return -1
                } else if (b==-1) {
                    return 1
                } else {
                    return a-b
                }
            });
            var min = sts[0]
            var max = sts[a-1]
            for (var i=0;i<a;i++) {
                str+=("<br>"+(i+1)+". ")

                if (ts[i] == max) {
                    str+="("
                } else if (ts[i] == min) {
                    str+="("
                }
                if (r[i].result == "OK") {
                    str+=(formatTime(r[i].time))
                } else if (r[i].result == "+2") {
                    str+=(formatTime(r[i].time+2)+"+")
                } else {
                    str+="DNF"
                }
                if (ts[i] == max) {
                    str+=")"
                    max = -2
                } else if (ts[i] == min) {
                    str+=")"
                    min = -2
                }
                str+=(" ("+r[i].scramble.trim()+")")
            }   
        }
        
    } else if (type == "Best") {
        
        if (a == 1) {
            var best = -1
            var index = 0
            for (var i=0;i<puzzles[currentPuzzle].sessions[currentSession].records.length;i++) {
                var t = extractTimes([puzzles[currentPuzzle].sessions[currentSession].records[i]])
                if (t!=-1&&(t<best||best==-1)) {
                    best = t
                    index = i
                }
            }
            var r = puzzles[currentPuzzle].sessions[currentSession].records[index]
            str+=("1. ")

            if (r.result == "OK") {
                str+=(formatTime(r.time))
            } else if (r.result == "+2") {
                str+=(formatTime(r.time+2)+"+")
            } else {
                str+="DNF"
            }
            str+=(" ("+r.scramble.trim()+")")
        } else if (a == 3) {
            var best = -1
            var index = 0
            for (var i=0;i<puzzles[currentPuzzle].sessions[currentSession].records.length-2;i++) {
                var t = meanTimes(extractTimes(puzzles[currentPuzzle].sessions[currentSession].records.slice(i,i+3)))
                if (t!=-1&&(t<best||best==-1)) {
                    best = t
                    index = i
                }
            }
            
            var r = puzzles[currentPuzzle].sessions[currentSession].records.slice(index,index+3)
            var mo3 = (meanTimes(extractTimes(r)))
            if (mo3 == -1) {
                str = "Mo3: DNF<br>"
            } else {
                str = "Mo3: "+formatTime(mo3)+"<br>"
            }
            var ts = extractTimes(r)
            
            for (var i=0;i<a;i++) {
                str+=("<br>"+(i+1)+". ")

                if (r[i].result == "OK") {
                    str+=(formatTime(r[i].time))
                } else if (r[i].result == "+2") {
                    str+=(formatTime(r[i].time+2)+"+")
                } else {
                    str+="DNF"
                }
                str+=(" ("+r[i].scramble.trim()+")")
            }   
        
        } else {
            var best = -1
            var index = 0
            for (var i=0;i<puzzles[currentPuzzle].sessions[currentSession].records.length-a;i++) {
                var t = averageTimes(extractTimes(puzzles[currentPuzzle].sessions[currentSession].records.slice(i,i+a)))
                if (t!=-1&&(t<best||best==-1)) {
                    best = t
                    index = i
                }
            }
            
            var r = puzzles[currentPuzzle].sessions[currentSession].records.slice(index,index+a)
            
            var aoa = (averageTimes(extractTimes(r)))
            if (aoa == -1) {
                str = "Ao"+a+": DNF<br>"
            } else {
                str = "Ao"+a+": "+formatTime(aoa)+"<br>"
            }
            var ts = extractTimes(r)
            var sts = ts.slice();
            sts.sort((a,b)=>{
                if (a==-1) {
                    return -1
                } else if (b==-1) {
                    return 1
                } else {
                    return a-b
                }
            });
            var min = sts[0]
            var max = sts[a-1]
            for (var i=0;i<a;i++) {
                str+=("<br>"+(i+1)+". ")

                if (ts[i] == max) {
                    str+="("
                } else if (ts[i] == min) {
                    str+="("
                }
                if (r[i].result == "OK") {
                    str+=(formatTime(r[i].time))
                } else if (r[i].result == "+2") {
                    str+=(formatTime(r[i].time+2)+"+")
                } else {
                    str+="DNF"
                }
                if (ts[i] == max) {
                    str+=")"
                    max = -2
                } else if (ts[i] == min) {
                    str+=")"
                    min = -2
                }
                str+=(" ("+r[i].scramble.trim()+")")
            }   
        
        }
    }
    
    $("#messageShowInfo").html(str)
    $("#dialogShowInfo").dialog("open")
    $("#preferencesButton").addClass("disabled")
    $("#preferencesButton").prop("disabled",true)
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

function closeShowInfo() {
    $("#dialogShowInfo").dialog("close")
    $("#preferencesButton").removeClass("disabled")
    $("#preferencesButton").prop("disabled",false)
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
        
    if (hasVideo && preferences.recordSolve && !videoLoading) {
        $("#previewButton").removeClass("disabled")
        $("#previewButton").prop("disabled",false)
    }
    preferencesOpen = false
}

// Confetti functions
var confettiCanvas;
var confettiConfig = {
    angle: 0.01,
    tiltAngle: 0.1,
    draw: confettiDraw,
    updatePosition: confettiUpdatePosition,
    updateState: confettiUpdateState
};

function confettiDraw(confetti) {
  confettiCanvas.context.beginPath();
  confettiCanvas.context.lineWidth = confetti.r / 2;
  confettiCanvas.context.strokeStyle = colorScheme[confetti.c];
  confettiCanvas.context.moveTo(confetti.x + confetti.tilt + (confetti.r / 4),
    confetti.y);
  confettiCanvas.context.lineTo(confetti.x + confetti.tilt, confetti.y +
    confetti.tilt + (confetti.r / 4));
  confettiCanvas.context.stroke();
}

function confettiUpdatePosition(confetti, idx) {
  confetti.tiltAngle += confetti.tiltAngleIncrement;
  confetti.y += (Math.cos(confettiConfig.angle + confetti.d) + 1 + confetti.r / 2) / 2;
  confetti.x += Math.sin(confettiConfig.angle);
  confetti.tilt = 15 * Math.sin(confetti.tiltAngle - idx / 3);

  if (confetti.isFlakeExiting(confettiCanvas)) {
    if (idx % 5 > 0 || idx % 2 === 0) {
      confetti.x = Confetti.randomFrom(0, confettiCanvas.width);
      confetti.y = -10;
      confetti.tilt = Confetti.randomFrom(-10, 0);

    } else {
      if (Math.sin(confettiConfig.angle) > 0) {
        confetti.x = -5;
        confetti.y = Confetti.randomFrom(0, confettiCanvas.height);
        confetti.tilt = Confetti.randomFrom(-10, 0);
      } else {
        confetti.x = confettiCanvas.width + 5;
        confetti.y = Confetti.randomFrom(0, confettiCanvas.height);
        confetti.tilt = Confetti.randomFrom(-10, 0);
      }
    }
  }
}

function confettiUpdateState() {
  this.angle += 0.01;
  this.tiltAngle += 0.1;
}


loadSessions()
