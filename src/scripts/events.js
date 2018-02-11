// events.js
// Loads, saves, manages and updates sessions, events and records
// Block Keeper
// Created by Dallas McNeil

var events = function() {
    
    // Stats document elements
    var eventSelect = document.getElementById("eventSelect");
    var sessionSelect = document.getElementById("sessionSelect");
    var sessionSolves = document.getElementById("sessionSolves");
    var sessionMean = document.getElementById("sessionMean");
    var sessionMedian = document.getElementById("sessionMedian");
    var sessionSD = document.getElementById("sessionSD");
    var sessionRecordsTable = document.getElementById("sessionRecords");
    var sessionStatsTable = document.getElementById("sessionStats");
    var sessionButtonsDiv = document.getElementById("sessionButtons"); 

    // All events, holding all session and record data
    // These are the default events and settings
    var internalEvents = [
        {name:"3x3x3",sessions:[],scrambler:"3x3x3",enabled:true,OH:false,blind:false,default:true},
        {name:"2x2x2",sessions:[],scrambler:"2x2x2",enabled:true,OH:false,blind:false,default:true},
        {name:"4x4x4",sessions:[],scrambler:"4x4x4",enabled:true,OH:false,blind:false,default:true},
        {name:"5x5x5",sessions:[],scrambler:"5x5x5",enabled:true,OH:false,blind:false,default:true},

        {name:"Pyraminx",sessions:[],scrambler:"Pyraminx",enabled:true,OH:false,blind:false,default:true},
        {name:"Skewb",sessions:[],scrambler:"Skewb",enabled:true,OH:false,blind:false,default:true},
        {name:"Megaminx",sessions:[],scrambler:"Megaminx",enabled:true,OH:false,blind:false,default:true},
        {name:"Square-1",sessions:[],scrambler:"Square-1",enabled:true,OH:false,blind:false,default:true},
        {name:"Clock",sessions:[],scrambler:"Clock",enabled:true,OH:false,blind:false,default:true},
        {name:"6x6x6",sessions:[],scrambler:"6x6x6",enabled:true,OH:false,blind:false,default:true},
        {name:"7x7x7",sessions:[],scrambler:"7x7x7",enabled:true,OH:false,blind:false,default:true},

        {name:"3x3x3 OH",sessions:[],scrambler:"3x3x3",enabled:true,OH:true,blind:false,default:true},
        {name:"3x3x3 BLD",sessions:[],scrambler:"3x3x3 BLD",enabled:true,OH:false,blind:true,default:true},
        {name:"4x4x4 BLD",sessions:[],scrambler:"4x4x4",enabled:true,OH:false,blind:true,default:true},
        {name:"5x5x5 BLD",sessions:[],scrambler:"5x5x5",enabled:true,OH:false,blind:true,default:true},
        {name:"3x3x3 FT",sessions:[],scrambler:"3x3x3",enabled:true,OH:false,blind:false,default:true},

        {name:"Other",sessions:[],scrambler:"None",enabled:true,OH:false,blind:false,default:true}
    ]

    var currentEvent = 0;
    var currentSession = 0;
    var currentRecord = 0;
    
    function getCurrentEvent() {
        return internalEvents[currentEvent];
    }
    
    function getCurrentSession() {
        return internalEvents[currentEvent].sessions[currentSession];
    }
    
    function getCurrentRecord() {
        if (currentRecord >= internalEvents[currentEvent].sessions[currentSession].records.length) {
            currentRecord = internalEvents[currentEvent].sessions[currentSession].records.length - 1;
        }
        return internalEvents[currentEvent].sessions[currentSession].records[currentRecord];
    }
    
    function getLastSession() {
        return internalEvents[currentEvent].sessions[internalEvents[currentEvent].sessions.length - 1];
    }
    
    function getLastRecord() {
        return internalEvents[currentEvent].sessions[currentSession].records[internalEvents[currentEvent].sessions[currentSession].records.length - 1];
    }

    // Save events to a file
    // Note: Events are stored as puzzles as to not interfere with pre-existing records which were saved before the name was changed
    function saveSessions() {
        storage.set("puzzles", {puzzles:internalEvents, puzzle:currentEvent, session:currentSession, tools:tools.toolTypes(),currentScrambler:scramble.getCurrentScrambler()}, function(error) {
            if (error) {
                throw error;
            }
        })
    }
    
    // Merges current events with other events
    function mergeEvents(newEvents) {
        for (var i=0; i < newEvents.length; i++) {
            var didAdd = false;
            for (var j=0; j < internalEvents.length; j++) {
                if (newEvents[i].name === internalEvents[j].name && newEvents[i].name != undefined) {
                    internalEvents[j].sessions = internalEvents[j].sessions.concat(newEvents[i].sessions);
                    didAdd = true;
                    break;
                }
            }
            if (!didAdd) {
                internalEvents.push(newEvents[i]);
            }
        }
        setSessionOptions(sessionSelect);
    }

    // Save events to a seperate backup file before closing
    var letClose = false;
    var reloading = false;
    function closeApp() {
        storage.set("puzzlesBackup", {puzzles:events, puzzle:currentEvent, session:currentSession, tools:tools.toolTypes()}, function(error) {
            if (error) {
                throw error;
            }
            letClose = true;
            if (reloading) {
                remote.getCurrentWindow().reload();
            } else {
                remote.getCurrentWindow().close();
            }
        })
    }
    
    function reloadApp() {
        reloading = true;
        closeApp();
    }

    window.onbeforeunload = function(e) {
        if (!letClose) {
            closeApp();
            return false;
        }
    }

    // Merge two sets of events, overriding x with y
    function mergeSessions(x,y) {
        var final = [];
        // Override all defaults (x) with saved (y)
        for (var i = 0; i < y.length; i++) {
            var shared = false;
            var j;
            for (j = 0; j < x.length; j++) {
                if (x[j].name !== null) {
                    if (x[j].name === y[i].name) {
                        shared = true;
                        break;
                    }
                }
            }
            if (shared) {
                final.push(Object.assign({}, x[j], y[i]));
                x.splice(j, 1);
            } else {
                if (y[i].name === undefined) {
                    y[i].name = "Unknown";
                }
                if (y[i].scrambler === undefined) {
                    y[i].scramble = "None";
                }
                if (y[i].OH === undefined) {
                    y[i].OH = false;
                }
                if (y[i].blind === undefined) {
                    y[i].blind = false;
                }
                if (y[i].enabled === undefined) {
                    y[i].enabled = true;
                }
                if (y[i].sessions === undefined) {
                    y[i].sessions = [];
                }
                y[i].default = false;
                final.push(y[i]);
            }
        }
        // Add all other saved (y)
        var length = x.length;
        for (var i = length - 1; i >= 0; i--) {
            final.push(x[i]);
        }
        return final.filter(function(a) {return !$.isEmptyObject(a)});
    }

    // Load session from file
    function loadSessions() {
        // Setup loaded object
        var setup = function(object) {
            if (object.puzzles !== undefined) {
                if (object.puzzles.length !== 0) {
                    internalEvents = mergeSessions(internalEvents, object.puzzles);
                }
            }

            if (object.puzzle !== undefined) {
                currentEvent = object.puzzle;
                if (currentEvent >= internalEvents.length || isNaN(currentEvent)) {
                    currentEvent = 0;
                }
            }
            if (object.session !== undefined) {
                currentSession = object.session;
                if (currentSession >= getCurrentEvent().sessions.length) {
                    currentSession = 0;
                }
            }
            
            if (object.currentScrambler !== undefined) {
                scramble.setCurrentScrambler(object.currentScrambler);
            }
            
            if (object.tools != undefined) {
                tools.setupTools(object.tools);
            }

            setEventOptions(eventSelect);
            setEvent();
        }

        // Load events
        var load = function() {
            storage.get("puzzles", function(error, object) {
                if (error) {
                    storage.get("puzzlesBackup", function(error, object) {
                        if (error) {
                             if (confirm("Sessions couldn't be loaded. They may be damaged. Please contact dallas@dallasmcneil.com for help. You will need to quit Block Keeper to preserve the damaged session data, or you could erase it and continue using Block Keeper. Would you like to quit?")) {
                                 letClose = true;
                                 remote.getCurrentWindow().close();
                             } else {
                                 setup({});
                             }
                        } else {
                            alert("Sessions were restored from backup. Some recent records may be missing.");
                        }
                    })
                } else {
                    setup(object);
                }
            })
        }
        
        // Load backup events
        var loadBackup = function() {
           storage.get("puzzlesBackup", function(error, object) {
                if (error) {
                     if (confirm("Sessions couldn't be loaded. They may be damaged. Please contact dallas@dallasmcneil.com for help. You will need to quit Block Keeper to preserve the damaged session data, or you could erase it and continue using Block Keeper. Would you like to quit?")) {
                         letClose = true;
                         remote.getCurrentWindow().close();
                     } else {
                         saveSessions();
                     }
                } else {
                    alert("Sessions were restored from backup. Some recent records may be missing.");
                    setup(object);
                }
            })
        }
        
        storage.has("puzzles", function(error, hasKey) {
            if (hasKey) {
                load();
            } else {
                storage.has("puzzlesBackup", function(error, hasKey) {
                    if (hasKey) {
                        loadBackup();
                    } else {
                        // First time load, welcome :)
                        setup({});
                    }
                })
            }
        })
    }

    // Create a new session in current event
    function createSession() {
        var name = new Date().toLocaleDateString();
        var ext = 2;
        var shouldBreak = false;
        var sessions = getCurrentEvent().sessions;
        var length = sessions.length;       
        while (!shouldBreak) {
            shouldBreak = true;
            for (var i = 0; i < length; i++) {
                if (name === sessions[i].name) {
                    name = (new Date().toLocaleDateString()) + " " + ext;
                    ext++;
                    shouldBreak = false;
                    break;
                }
            }
        }   
        var session = {date:new Date().getTime(), name:name, records:[]};
        getCurrentEvent().sessions.push(session);
        currentSession = getCurrentEvent().sessions.length - 1;
        updateRecords();
    }

    // Deletes current session
    function deleteSession() {
        if (confirm("Delete session?")) {
            var oldLength = getCurrentEvent().sessions.length;
            if (oldLength > 1) {
                getCurrentEvent().sessions.splice(currentSession, 1);
                currentSession = getCurrentEvent().sessions.length - 1;
            }
        }
    }

    var updateStats = true;
    function shouldUpdateStats(b) {
        updateStats = b;
    }
    
    // Create a record in the current session
    function createRecord(time, result, split=[]) {
        // Find best time
        if (updateStats && preferences.showBestTime) {
            var btime = Number.MAX_SAFE_INTEGER;
            var sessions = getCurrentEvent().sessions;
            for (var s = 0; s < sessions.length; s++) {
                btime = Math.min(btime, removeDNFs(extractTimes(sessions[s].records)).min());
            }
            if (time <= btime && btime !== Number.MAX_SAFE_INTEGER && result !== "DNF") {
                // New PB, launch the confetti
                launchConfetti()
            }
        }
        
        var record = {time:time, scramble:scramble.currentScramble(), result:result, date: new Date().getTime(), split:split};
        getCurrentSession().records.push(record);
        if (updateStats) {
            updateRecords(true, getCurrentSession().records.length-1);
        }
    }
           
    // Show time dialog to add a custom time
    function openTimeDialog() {
        if ($("#dialogAddTime").dialog("isOpen")) {
            closeTimeDialog();
            return;
        }
        $("#dialogAddTime").dialog("open");
        disableAllElements();
        globals.menuOpen = true;
    }

    // Close the time dialog
    function closeTimeDialog() {
        $("#dialogAddTime").dialog("close")
        enableAllElements();
        globals.menuOpen = false
    }

    // Create record from the add time menu
    function addRecord() {
        var t = parseFloat(parseFloat(document.getElementById("addTimeInput").value).toFixed(3));
        if (isNaN(t) || t === undefined || t <= 0) {
            $("#addTimeMessage")[0].innerHTML = "Invalid time";
            return;
        }
        $("#addTimeMessage")[0].innerHTML = "";
        document.getElementById("addTimeInput").value = "";
    
        createRecord(t, "OK");
        if ($("#addTimeScramble")[0].checked) {
            getLastRecord().scramble = document.getElementById("addScrambleInput").value;
        } else {
            getLastRecord().scramble = scramble.currentScramble();
        }
        $("#timer")[0].innerHTML = formatTime(t);
        scramble.scramble();
        closeTimeDialog();
    }

    // Set the event based on the selected dropdown
    function setEvent() {
        // Remove empty session at the end
        /*if (getCurrentEvent().length !== 0) {
            if (getLastSession().length == 0) {
                puzzles[currentEvent].sessions.pop()
            }
        }*/
        currentEvent = parseInt(eventSelect.value);
        if (isNaN(currentEvent)) {
            currentEvent = 0;
            eventSelect.value = currentEvent;
        }
        if (getCurrentEvent().sessions.length === 0) {
            createSession();
        }
        setSessionOptions(sessionSelect);
        currentSession = getCurrentEvent().sessions.length - 1;
        sessionSelect.value = currentSession;
        updateRecords(true);
        scramble.scramble();
    }

    // Set the session based on the dropdown
    function setSession() {
         currentSession = sessionSelect.value;   
         updateRecords(true);
    }
        
    // Populate a dropdown with events
    function setEventOptions(selectElem) {
        var length = selectElem.options.length;
        for (var i = length - 1; i >= 0; i--) {
            selectElem.options[i] = null;
        }
        for (var i = 0; i < internalEvents.length; i++) {
            if (internalEvents[i].enabled) {
                var option = document.createElement("option");
                option.text = internalEvents[i].name;
                option.value = i;
                selectElem.add(option);
            }
        }
        if (!internalEvents[currentEvent].enabled) {
            currentEvent = 0;
        }
        selectElem.value = currentEvent;
    }
    

    // Populate a dropdown with sessions
    function setSessionOptions(selectElem) {
        var length = selectElem.options.length;
        for (var i = length - 1; i >= 0; i--) {
            selectElem.options[i] = null;
        }
        var sessions = getCurrentEvent().sessions;
        for (var i = 0; i < sessions.length; i++) {
            var option = document.createElement("option");
            option.text = sessions[i].name;
            option.value = i;
            selectElem.add(option);
        }
        selectElem.value = sessions.length - 1;
    }
    
    // Update all records displayed on screen
    var calculatedTimes = {
        times:[],
        mo3s:[],
        ao5s:[],
        ao12s:[],
        ao50s:[],
        ao100s:[],
        ao500s:[],
        ao1000s:[],
    }
        
    function updateRecords(scrollDown = false, updateFrom = 0) {
        setTimeout(function() { 
            var debugTime = new Date();
            console.log("Benchmark Start")
            
            var records = getCurrentSession().records;
            // Set records table up for adding records
            var length = sessionRecordsTable.rows.length - 1;
            if (records.length < length) {
                for (var i = 0; i < length - records.length;i++) {
                    sessionRecordsTable.deleteRow(-1);
                }
            } else if (records.length > length) {
                for (var i = 0; i < records.length - length;i++) {
                    (function () {
                        var row = sessionRecordsTable.insertRow(-1);
                        var cell = row.insertCell(-1);
                        cell.appendChild(document.createElement("p"));
                        cell = row.insertCell(-1);
                        cell.appendChild(document.createElement("p"));
                        cell.className+=" selectable";
                        cell = row.insertCell(-1);
                        cell.appendChild(document.createElement("p"));
                        var n = sessionRecordsTable.rows.length - 1;
                        if (n > 4) {
                            cell.className+=" selectable";
                        }
                        cell.onclick = function() {
                            openShowInfo("Ao5", n);
                        }   
                        cell = row.insertCell(-1);
                        cell.appendChild(document.createElement("p"));
                        if (n > 11) {
                            cell.className+=" selectable";
                        }
                        cell.onclick = function() {
                            openShowInfo("Ao12", n);
                        } 
                    }())
                }
            }
            
            // Calculate all times, means, averages
            calculatedTimes.times = [];
            if (updateFrom === 0 || calculatedTimes.length === 0) {
                calculatedTimes.mo3s = records.length > 2 ? new Array(records.length - 2) : [];
                calculatedTimes.ao5s = records.length > 4 ? new Array(records.length - 4) : [];
                calculatedTimes.ao12s = records.length > 11 ? new Array(records.length - 11) : [];
                calculatedTimes.ao50s = records.length > 49 ? new Array(records.length - 49) : [];
                calculatedTimes.ao100s = records.length > 99 ? new Array(records.length - 99) : [];
                calculatedTimes.ao500s = records.length > 499 ? new Array(records.length - 499) : [];
                calculatedTimes.ao1000s = records.length > 999 ? new Array(records.length - 999) : [];
            }
            var DNFsolves = 0;

            for (var i = 0; i < records.length; i++) {
                if (records[i].result === "DNF") {
                    DNFsolves++;
                }
                calculatedTimes.times.push(extractTime(records[i]));
                if (i >= updateFrom) {
                    var ao5t = "-";
                    var ao12t = "-";

                    if (i >= 2) {
                        calculatedTimes.mo3s[i-2] = averageLastRecords(calculatedTimes.times, 3);
                    }
                    if (i >= 4) {
                        calculatedTimes.ao5s[i-4] = averageLastRecords(calculatedTimes.times, 5);
                        ao5t = calculatedTimes.ao5s[i-4];
                    }
                    if (i >= 11) {
                        calculatedTimes.ao12s[i-11] = averageLastRecords(calculatedTimes.times, 12);
                        ao12t = calculatedTimes.ao12s[i-11];
                    }
                    if (i >= 49) {
                        calculatedTimes.ao50s[i-49] = averageLastRecords(calculatedTimes.times, 50);
                    }
                    if (i >= 99) {
                        calculatedTimes.ao100s[i-99] = averageLastRecords(calculatedTimes.times, 100);
                    } 
                    if (i >= 499) {
                        calculatedTimes.ao500s[i-499] = averageLastRecords(calculatedTimes.times, 500);
                    }
                    if (i >= 999) {
                        calculatedTimes.ao1000s[i-999] = averageLastRecords(calculatedTimes.times, 1000);
                    }

                    sessionRecordsTable.rows[i + 1].cells[0].children[0].innerHTML = i + 1;
                    sessionRecordsTable.rows[i + 1].cells[1].children[0].innerHTML = formatRecord(records[i]);
                    sessionRecordsTable.rows[i + 1].cells[2].children[0].innerHTML = formatTime(ao5t);
                    sessionRecordsTable.rows[i + 1].cells[3].children[0].innerHTML = formatTime(ao12t);   
                }
            }

            // Create session stats
            var mean = meanTimes(removeDNFs(calculatedTimes.times));
            if (mean === -1) {
                $("#sessionMean").prop("innerHTML", "<b>Mean:</b> " + formatTime(0));
                $("#sessionSD").prop("innerHTML", "<b>σ(s.d):</b> " + formatTime(0));
                $("#sessionMedian").prop("innerHTML", "<b>Median:</b> " + formatTime(0));
            } else {
                $("#sessionMean").prop("innerHTML", "<b>Mean:</b> " + formatTime(mean));
                $("#sessionSD").prop("innerHTML", "<b>σ(s.d):</b> " + formatTime(standardDeviation(calculatedTimes.times)));
                $("#sessionMedian").prop("innerHTML", "<b>Median:</b> " + formatTime(medianTimes(calculatedTimes.times)));
            }
            $("#sessionSolves").prop("innerHTML", "<b>Solves:</b> " + (records.length - DNFsolves) + "/" + records.length);

            while (sessionStatsTable.rows.length > 1) {
                sessionStatsTable.deleteRow(-1);
            }
            
            var extraHeight = 0;
            function createRow(title,size,ts) {
                if (ts.length > 0) {
                    var row = sessionStatsTable.insertRow(-1);
                    var name = row.insertCell(-1);
                    name.className += " selectable";
                    name.onclick = function() {
                        openShowInfo("All", size);
                    }
                    var nameP = document.createElement("p");
                    nameP.innerHTML = title;
                    name.appendChild(nameP);

                    var current = row.insertCell(-1);
                    current.className+=" selectable";
                    current.onclick = function() {
                        openShowInfo("Current", size);
                    } 
                    var currentP = document.createElement("p");
                    if (ts.length == 0) {
                        currentP.innerHTML = "-";
                    } else {
                        currentP.innerHTML = formatTime(ts[ts.length-1]);
                    }
                    current.appendChild(currentP);

                    var best = row.insertCell(-1);
                    best.className += " selectable";
                    best.onclick = function() {
                        openShowInfo("Best", size);
                    } 
                    var bestP = document.createElement("p");
                    if (calculatedTimes.times.length == 0) {
                        bestP.innerHTML = "-";
                    } else {
                        var t = removeDNFs(ts).min();
                        if (t == Infinity) { // TODO FIX
                            bestP.innerHTML = "DNF";
                        } else {
                            bestP.innerHTML = formatTime(t);
                        }
                    }
                    best.appendChild(bestP);
                    extraHeight = extraHeight + 30;
                }
            }
            
            // Create session stats
            createRow("Time",1,calculatedTimes.times);
            createRow("Mo3",3,calculatedTimes.mo3s);
            createRow("Ao5",5,calculatedTimes.ao5s);
            createRow("Ao12",12,calculatedTimes.ao12s);
            createRow("Ao50",50,calculatedTimes.ao50s);
            createRow("Ao100",100,calculatedTimes.ao100s);
            createRow("Ao500",500,calculatedTimes.ao500s);
            createRow("Ao1000",1000,calculatedTimes.ao1000s);

            // On hover record details
            $("#sessionRecords td").hover(function(e) {
                if (!globals.menuOpen) {
                    var column = parseInt($(this).index());
                    var row = parseInt($(this).parent().index());  
                    if (column == 1 && row > 0) {
                        currentRecord = row - 1;
                        var detail = preferences.timerDetail;
                        var str = "";
                        var height = 172;
                        preferences.timerDetail = 3;
                        if (getCurrentRecord().split) {
                            if (getCurrentRecord().split.length > 0) {
                                height += 20;
                                str += "(" + formatTime(getCurrentRecord().split[0]) + " / " + formatTime(getCurrentRecord().time - getCurrentRecord().split[0]) + ")<br>";
                                $("#recordScramble").css("top", "83px");
                            } else {
                                $("#recordScramble").css("top", "63px");
                            }
                        } else {
                            $("#recordScramble").css("top", "63px");
                        }
                        str += formatTime(getCurrentRecord().time) + " " + getCurrentRecord().result;
                        $("#recordTime").html(str);
                        preferences.timerDetail = detail;
                        
                        
                        $("#dialogRecord").dialog("open");
                        $("#dialogRecord").dialog({
                            autoOpen:false,
                            modal:true,
                            hide:"fade",
                            width:"271",
                            height:height + "",
                            position: {
                                my:"left top",
                                at:"right top",
                                of:sessionRecordsTable.rows[row].cells[column]
                            }
                        });
                        $("#recordScramble").html(getCurrentRecord().scramble);
                        if (getCurrentRecord().date !== undefined) {
                            // Doesn't include Daylight savings
                            // Consider replacing with a library
                            var d = new Date(getCurrentRecord().date);
                            var options = {
                                year: "numeric", 
                                month: "short",  
                                day: "numeric", 
                                hour: "2-digit", 
                                minute: "2-digit"  
                            };  
                            $("#recordDate").html(d.toLocaleTimeString("en-us",options));
                        } else {
                            $("#recordDate").html("-");
                        }
                    } else {
                        if ($("#dialogRecord").dialog('isOpen')) {
                            $("#dialogRecord").dialog("close");
                        }
                    }
                }
            })    
            setTimeout(function() {
                extraHeight+=$("#sessionDetails").height();
                $("#sessionRecordsContainer").css("max-height","calc(100vh - (" + extraHeight + "px + 170px))");
                if (scrollDown) {
                    $("#sessionRecordsContainer").animate({scrollTop:Number.MAX_SAFE_INTEGER + "px"}, 100);
                }
            }, 20);
            
            tools.updateTools();
            saveSessions();
            
            console.log("Done: " + (new Date().getTime() - debugTime))
            
        }, 0)
    }

    var sessionButtonsShowing = false;

    // Toggle session options showing
    function toggleSessionButtons() {
        if (getCurrentEvent().sessions.length < 2) {
            disableElement("#deleteSessionButton");
        } else {
            enableElement("#deleteSessionButton");     
        }
        if (sessionButtonsShowing) {
            var newElement = document.createElement("select");
            newElement.id = "sessionSelect";
            newElement.title = "Session select";
            newElement.onchange = setSession;
            getCurrentSession().name = sessionSelect.value;
            document.getElementById("sessionContainer").replaceChild(newElement, sessionSelect);
            sessionSelect = document.getElementById("sessionSelect");
            setSessionOptions(sessionSelect);
            newElement.value = currentSession;
            $("#sessionButtons").animate({height:'0px'}, 200);
            sessionButtonsShowing = false;
            enableStats();
            globals.menuOpen = false;
        } else {
            var newElement = document.createElement("input");
            newElement.type = "text";
            newElement.title = "Session name";
            newElement.id = "sessionSelectText";
            newElement.value = getCurrentSession().name;
            document.getElementById("sessionContainer").replaceChild(newElement, sessionSelect);
            sessionSelect = document.getElementById("sessionSelectText");
            $("#sessionButtons").animate({height:'80px'}, 200);
            sessionButtonsShowing = true;
            disableStats();
            globals.menuOpen = true;
        } 
    }

    // Create session button pressed
    function createSessionButton() {
        getCurrentSession().name = sessionSelect.value;
        createSession();
        sessionSelect.value = getCurrentSession().name; 
        updateRecords(true);
        if (getCurrentEvent().sessions.length > 1) {
            enableElement("#deleteSessionButton");
        }
    }

    // Delete session button pressed
    function deleteSessionButton() {
        if (getCurrentEvent().sessions.length > 1) {
            deleteSession();
            var newElement = document.createElement("select");
            newElement.id = "sessionSelect";
            newElement.onchange = setSession;
            document.getElementById("sessionContainer").replaceChild(newElement, sessionSelect);
            sessionSelect = document.getElementById("sessionSelect");
            setSessionOptions(sessionSelect);
            sessionButtonsShowing = false;
            enableStats();
            updateRecords(true);
            $("#sessionButtons").animate({height:'0px'}, 200);
        }
    }
    
    // Clear the session by removing all records
    function clearSessionButton() {
        if (confirm("Delete all records?")) {
            getCurrentSession().records = [];
            updateRecords(true);
        }
    }
    
    $("#dialogTransferSession").dialog({
        autoOpen:false,
        modal:true,
        width:"306",
        height:"185",
        show:"fade",
        hide:"fade"
    }).on('keydown', function(evt) {
        if (evt.keyCode === 13) {
            transferSession();
            evt.preventDefault();
        }
        evt.stopPropagation();
    });
    
    // Open transfer session dialog
    function transferSessionButton() {
        $("#dialogTransferSession").dialog("open");
        toggleSessionButtons();
        setEventOptions($("#eventSelectTransfer")[0]);
        disableAllElements();
    }
    
    // Move a session to an event
    function transferSession() {
        $("#dialogTransferSession").dialog("close");
        var sess = getCurrentEvent().sessions.splice(currentSession, 1);
        currentEvent = $("#eventSelectTransfer")[0].value;
        getCurrentEvent().sessions.push(sess[0]);
        enableAllElements();
        eventSelect.value = currentEvent;
        setEvent();
    }

    // Hide the session stats
    function disableStats() {
        disableAllElements("sessionSelectText");
        enableElement("#sessionContainer");
        enableElement("#sessionButton");
        enableElement("#sessionButtons");
        globals.menuOpen = true;
    }

    // Show the session stats
    function enableStats() {
        enableAllElements();
        globals.menuOpen = false;
    }

    // Reset the session buttons
    function resetUI() {
        if (sessionButtonsShowing) {
            toggleSessionButtons();
        }
    }

    // Set last record to OK result
    function recordResultOK() {
        if (getCurrentSession().records.length > 0) {
            getCurrentRecord().result = "OK";
            $("#dialogRecord").dialog("close");
            updateRecords(false,currentRecord);
        }
    }

    // Set last record to +2 result
    function recordResult2() {
        if (getCurrentSession().records.length > 0) {
            getCurrentRecord().result = "+2";
            $("#dialogRecord").dialog("close");
            updateRecords(false,currentRecord);
        }
    }

    // Set last record to DNF result
    function recordResultDNF() {
        if (getCurrentSession().records.length > 0) {
            getCurrentRecord().result = "DNF";
            $("#dialogRecord").dialog("close");
            updateRecords(false,currentRecord);
        }
    }

    // Delete the last record in the current session
    function deleteRecord() {
        if (getCurrentSession().records.length > 0) {
            getCurrentSession().records.splice(currentRecord, 1);
            $("#dialogRecord").dialog("close");
            updateRecords(false);
        }
    }

    // Close record dialog on background hover
    $("#background").hover(function() {
        $("#dialogRecord").dialog("close");
    })

    // Create dialog record to view record details
    $("#dialogRecord").dialog({
        autoOpen:false,
        modal:true,
        width:"199",
        height:"92" 
    });

    // Create add time dialog
    $("#dialogAddTime").dialog({
        autoOpen:false,
        modal:true,
        width:"307",
        height:"311",
        show:"fade",
        hide:"fade"
    }).on('keydown', function(evt) {
        if (evt.keyCode === $.ui.keyCode.ESCAPE) {
            closeTimeDialog();
        } else if (evt.keyCode === 13) {
            addRecord();
            evt.preventDefault();
        }
        evt.stopPropagation();
    });


    $("#dialogShowInfo").dialog({
        autoOpen:false,
        modal:true,    
        position: {
            my:"center",
            at:"center",
            of:"#background"
        },
        width:"640",
        height:"480",
        show:"fade",
        hide:"fade"
    }).on('keydown', function(evt) {
        if (evt.keyCode === $.ui.keyCode.ESCAPE) {
            closeShowInfo();
        } else if (evt.keyCode === 13) {
            closeShowInfo();
            evt.preventDefault();
        }        
        evt.stopPropagation();
    })
    
    $("#dialogManageEvents").dialog({
        autoOpen:false,
        modal:true,    
        position: {
            my:"center",
            at:"center",
            of:"#background"
        },
        width:"640",
        height:"480",
        show:"fade",
        hide:"fade"
    }).on('keydown', function(evt) {
        if (evt.keyCode === $.ui.keyCode.ESCAPE) {
            closeEvents();
        } else if (evt.keyCode === 13) {
            closeEvents();
            evt.preventDefault();
        }        
        evt.stopPropagation();
    })
    
    // Create a row in the event list
    function addEventItem(list, index) {
        // Enabled, name, scrambler, OH, Blind, remove
        (function() {
            var li = document.createElement("li");
            li.eventname = internalEvents[index].name; 
            li.style.position = "relative";
                
            event = internalEvents[index];

            var enable = document.createElement("input");
            enable.type = "checkbox";
            enable.className = "checkbox";
            enable.style.position = "absolute";
            enable.style.top = "3px";
            enable.style.left = "30px";
            
            enable.checked = event.enabled;
            li.appendChild(enable);
            enable.onchange = function() {
                internalEvents[index].enabled = enable.checked;
            }

            if (internalEvents[index].default) {
                var name = document.createElement("p");
                name.style.width = "200px"; 
                name.style.display = "inline-block";
                name.style.lineHeight = "30px";
                name.style.margin = "0px";
                name.style.position = "absolute";
                name.style.top = "0px";
                name.style.left = "65px";
                name.innerHTML = event.name;
                li.appendChild(name);
            } else {
                var name = document.createElement("input");
                name.type = "text";
                name.style.width = "200px"; 
                name.style.position = "absolute";
                name.style.top = "0px";
                name.style.left = "65px";
                name.value = event.name;
                li.appendChild(name);
                name.onchange = function() {
                    var n = name.value;
                    var mod = 1;
                    var didMod = false;
                    do {
                        didMod = false;
                        for (var i = 0; i < internalEvents.length; i++) {
                            if (mod > 1) {
                                if (internalEvents[i].name === (n + " " + mod)) {
                                    mod++;
                                    didMod = true;
                                    break;
                                }
                            } else {
                                if (internalEvents[i].name === n || n === "") {
                                    mod++;
                                    didMod = true;
                                    break;
                                }
                            }
                        }
                    } while (didMod);
                    if (mod === 1) {
                        name.value = n;
                    } else {
                        name.value = n + " " + mod;
                    }
                    internalEvents[index].name = name.value;
                    li.eventname = name.value;
                }
            }

            var scrambler = document.createElement("select");
            scramble.setScramblerOptions(scrambler);
            scrambler.options.remove(0);
            scrambler.style.width = "200px"; 
            scrambler.style.position = "absolute";
            scrambler.style.top = "0px";
            scrambler.style.left = "275px";
            scrambler.value = event.scrambler;
            li.appendChild(scrambler);
            scrambler.onchange = function() {
                internalEvents[index].scrambler = scrambler.value;
            }

            var blind = document.createElement("input");
            blind.type = "checkbox";
            blind.className = "checkbox";
            blind.checked = event.blind;
            blind.style.position = "absolute";
            blind.style.top = "3px";
            blind.style.left = "485px";
            
            var OH = document.createElement("input");
            OH.type = "checkbox";
            OH.className = "checkbox";
            OH.checked = event.OH;
            OH.style.position = "absolute";
            OH.style.top = "3px";
            OH.style.left = "520px";
            
            li.appendChild(OH);
            OH.onchange = function() {
                internalEvents[index].OH = OH.checked;
            }
            
            li.appendChild(blind);
            blind.onchange = function() {
                internalEvents[index].blind = blind.checked;
            }
            
            if (event.default) {
                scrambler.className += " disabled";
                scrambler.disabled = true;
                OH.className += " disabled";
                OH.disabled = true;
                blind.className += " disabled";
                blind.disabled = true;
            }
            
            if (!internalEvents[index].default) {
                var remove = document.createElement("button");
                remove.className = "delete";
                remove.style.position = "absolute";
                remove.style.top = "0px";
                remove.style.left = "570px";
            
                
                remove.onclick = function() {
                    if (confirm("Do you want to remove this event? All of it's sessions will also be deleted.")) {
                        var scroll = $("#eventsList")[0].scrollTop;
                        var n = internalEvents[index].name;
                        removeEventsList();
                        for (var i = 0; i < internalEvents.length; i++) {
                            if (internalEvents[i].name === n) {
                                internalEvents.splice(i,1);
                                break;
                            } 
                        }
                        for (var i = 0; i < internalEvents.length; i++) {
                            addEventItem($("#eventsList")[0], i);
                        }
                        $("#eventsList").sortable();
                        $("#eventsList").disableSelection();
                        $("#eventsList")[0].scrollTop = scroll;
                    }
                }
                li.appendChild(remove);
            }

            li.className = "eventItem";
            list.appendChild(li);
        })()
    }
    
    // Open the event management dialog
    function openEvents() {
        if (globals.menuOpen) {
            closeEvents();
            return;
        }
        var eventsList = document.getElementById("eventsList");
        for (var i = 0; i < internalEvents.length; i++) {
            addEventItem(eventsList, i);
        }
        $("#eventsList").sortable();
        $("#eventsList").disableSelection();
        $("#dialogManageEvents").dialog("open");
        disableAllElements("eventButton");
        globals.menuOpen = true;
    }
    
    // Create a new event and add it to the events list
    function createNewEvent() {
        var newEvent = {name:"New Event",sessions:[],scrambler:"3x3x3",enabled:true,OH:false,blind:false,default:false};
        internalEvents.push(newEvent);
        addEventItem($("#eventsList")[0], internalEvents.length - 1);
        $("#eventsList").sortable();
        $("#eventsList").disableSelection();
        $("#eventsList")[0].scrollTop = Number.MAX_SAFE_INTEGER;
    }
    
    // Remove all event items and reorder events in the lists order
    function removeEventsList() {
        var eventsList = document.getElementById("eventsList");
        var newEvents = [];
        while (eventsList.firstChild) {
            for (var i = 0; i < internalEvents.length; i++) {
                if (eventsList.firstChild.eventname === internalEvents[i].name) {
                    newEvents.push(internalEvents[i]);
                    break;
                }
            }
            eventsList.removeChild(eventsList.firstChild);
        }
        internalEvents = newEvents;
        
        eventSelect.value =  eventSelect.firstChild.value;
        setEvent();
        setEventOptions(eventSelect);
        saveSessions();
    }

    // Close event management dialog
    function closeEvents() {
        removeEventsList();
        saveSessions();
        $("#dialogManageEvents").dialog("close");
        enableAllElements();
        globals.menuOpen = false;
    }
    
    
    function infoHeader() {
        return "Generated by Block Keeper on " + new Date().toDateString() + "<br>"
    }
    
    function averageExport(a,size) {
        var r = getCurrentSession().records.slice(a - size, a);
        var str = ""
        var toRemove = [];
        var ts = extractTimes(r);
        
        if (!preferences.onlyList) {
            str = infoHeader() + "<br>";
            if (size === 1) {
                str += "Time: " + formatRecord(r[0]);
                if (preferences.scramblesInList) {
                    str += " (" + r[0].scramble.trim() + ")";
                }
                return str;
            } else if (size < 5) {
                str+= "Mo"+size+": " + formatTime(meanTimes(extractTimes(r))) + "<br>";
            } else {
                str+= "Ao"+size+": " + formatTime(averageTimes(extractTimes(r))) + "<br>";
            }
        }
        if (size > 4) {
            toRemove = getMinsAndMaxs(ts);
        }
        for (var i = 0; i < size; i++) {
            var didRemove = false;
            if (preferences.onlyList) {
                str += formatRecord(r[i]) + "<br>";
                continue;
            } else {
                str += ("<br>" + (i + 1) + ". ");
            }
            for (var j = 0; j < toRemove.length; j++) {
                if (ts[i] === toRemove[j]) {
                    str += "(" + formatRecord(r[i]) + ")";
                    toRemove.splice(j, 1);
                    didRemove = true;
                    break;
                }
            }
            if (!didRemove) {
                str += (formatRecord(r[i]));                       
            }
            if (preferences.scramblesInList) {
                str += " (" + r[i].scramble.trim() + ")";
            }
        } 
        return str;
    }

    // Show time lists and other time and average details
    function openShowInfo(type,a) {
        if (globals.menuOpen) {
            return;
        }
        var str = "";
        if (type == "Ao5") {
            if (a < 5) {
                return;
            }
            str = averageExport(a,5);
        } else if (type == "Ao12") {
            if (a < 12) {
                return
            }
            str = averageExport(a,12);
        } else if (type == "Current") {
            str = averageExport(getCurrentSession().records.length, a);
        } else if (type == "Best") {
            if (a == 1) {
                var best = -1;
                var index = 0;
                var r = getCurrentSession().records;
                for (var i = 0; i < r.length; i++) {
                    var t = extractTime(r[i]);
                    if (t != -1 && (t < best || best == -1)) {
                        best = t;
                        index = i;
                    }
                }
                str = averageExport(index + 1, 1);
            } else if (a == 3) {
                var best = -1;
                var index = 3;
                var r = getCurrentSession().records;
                for (var i = 3; i < r.length; i++) {
                    var t = meanTimes(extractTimes(r.slice(i - (a - 1), i + 1)));
                    if (t != -1 && (t < best || best == -1)) {
                        best = t;
                        index = i + 1;
                    }
                }
                str = averageExport(index, 3);
            } else {
                var best = -1
                var index = a;
                var r = getCurrentSession().records;
                for (var i = a; i < r.length; i++) {
                    var t = averageTimes(extractTimes(r.slice(i - (a - 1), i + 1)));
                    if (t != -1 && (t < best || best == -1)) {
                        best = t;
                        index = i + 1;
                    }
                }
                str = averageExport(index, a);
            }
        } else if (type == "All") {
            if (a == 1) {
                var records = getCurrentSession().records;
                if (!preferences.onlyList) {
                    str = infoHeader() + "<br>Time list<br>";
                    str += "Mean: " + formatTime(meanTimes(removeDNFs(extractTimes(records)))) + "<br>";
                    str += "Median: " + formatTime(medianTimes(extractTimes(records))) + "<br>";
                    str += "σ(s.d): " + formatTime(standardDeviation(extractTimes(records))) + "<br>";
                }
                for (var i = 0; i < records.length; i++) {
                    if (preferences.onlyList) {
                        str += formatRecord(records[i]) + "<br>";
                    } else {
                        str += "<br>" + (i + 1) + ". ";
                        str += formatRecord(records[i]);
                        if (preferences.scramblesInList) {
                            str += " (" + records[i].scramble.trim() + ")";
                        }
                    }
                }
            } else if (a == 3) {
                var means = [];
                var records = getCurrentSession().records;
                for (var i = 2; i < records.length; i++) {
                    means.push(meanTimes(extractTimes(records.slice(i - 2, i + 1))));
                }
                if (!preferences.onlyList) {
                    str = infoHeader() + "<br>Mo3 list<br>";
                    str += "σ(s.d): " + formatTime(standardDeviation(means)) + "<br>";    
                }
                for (var i = 0; i < means.length; i++) {
                    if (preferences.onlyList) {
                        str += formatTime(means[i]) + "<br>";
                    } else {
                        str += "<br>" + (i + 1) + ". ";
                        str += formatTime(means[i]);
                    }
                }
            } else {
                var means = [];
                var records = getCurrentSession().records;
                for (var i = 0; i < records.length - a + 1; i++) {
                    means.push(averageTimes(extractTimes(records.slice(i, i + a))));
                }
                if (!preferences.onlyList) {
                    str = infoHeader() + "<br>Ao" + a + " list<br>";
                    str += "σ(s.d): " + formatTime(standardDeviation(means)) + "<br>";
                }
                for (var i = 0; i < means.length; i++) {
                    if (preferences.onlyList) {
                        str += formatTime(means[i]) + "<br>";
                    } else {
                        str += "<br>" + (i + 1) + ". ";
                        str += formatTime(means[i]);
                    }
                }
            }
        }

        $("#messageShowInfo").html(str);
        $("#dialogShowInfo").dialog("open");
        disableAllElements();
        globals.menuOpen = true;
    }

    function closeShowInfo() {
        $("#dialogShowInfo").dialog("close");
        enableAllElements();
        globals.menuOpen = false;
    }

    // Confetti functions
    var confettiCanvas;
    var confettiConfig = {
        angle:0.01,
        tiltAngle:0.1,
        draw:confettiDraw,
        updatePosition:confettiUpdatePosition,
        updateState:confettiUpdateState
    };

    function confettiDraw(confetti) {
        confettiCanvas.context.beginPath();
        confettiCanvas.context.lineWidth = confetti.r / 2;
        confettiCanvas.context.strokeStyle = globals.cubeColors[confetti.c];
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

    function launchConfetti() {
        $("#announcement").animate({opacity:1} ,500);
        $("#confetti").animate({opacity:1} ,500);
        confettiCanvas = Confetti.createCanvas(
            document.getElementById('background'),
            document.getElementById('confetti')
        );
        confettiCanvas.halt = false;
        confettiCanvas.canvas.halt = false;

        var particles = Array.apply(null, Array(Math.floor(confettiCanvas.width / 8))).map(function(_, i) {return i;}).map(function() {
            return Confetti.create({
                x:Confetti.randomFrom(0, confettiCanvas.width),
                y:Confetti.randomFrom(-confettiCanvas.height, 0),
                c:Math.floor(Math.random() * 6),
                r:Confetti.randomFrom(10, 30),
                tilt:Confetti.randomFrom(-10, 10),
                tiltAngle:0,
                tiltAngleIncrement:Confetti.randomFrom(0.05, 0.12, 100)
            })
        })
        confettiCanvas.step(particles, confettiConfig)();
        setTimeout(function() {
            $("#announcement").animate({opacity:0}, 2000);
            $("#confetti").animate({opacity:0}, 2000, function() {
                 confettiCanvas.destroy();
            })   
        }, 5000)
    }
        
    function returnCurrentRecord() {
        return currentRecord;
    }
    
    function returnCurrentSession() {
        return currentSession;
    }
    
    function setCurrentRecord(i) {
        currentRecord = i;
    }
    
    function setCurrentEvent(i) {
        currentEvent = i;
    }
    
    function returnEvents() {
        return internalEvents;
    }
    
    function returnSessionButtonsShowing() {
        return sessionButtonsShowing;
    }
    
    loadSessions();
        
    return {
        getAllEvents:returnEvents,
        getCurrentEvent:getCurrentEvent,
        getCurrentSession:getCurrentSession,
        getCurrentRecord:getCurrentRecord,
        getLastSession:getLastSession,
        getLastRecord:getLastRecord,
        setEvent:setEvent,
        createRecord:createRecord,
        createSession:createSession,
        currentRecord:returnCurrentRecord,
        shouldUpdateStats:shouldUpdateStats,
        openTimeDialog:openTimeDialog,
        closeTimeDialog:closeTimeDialog,
        addRecord:addRecord,
        deleteRecord:deleteRecord,
        updateRecords:updateRecords,
        openShowInfo:openShowInfo,
        closeShowInfo:closeShowInfo,
        createSessionButton:createSessionButton,
        clearSessionButton:clearSessionButton,
        deleteSessionButton:deleteSessionButton,
        toggleSessionButtons:toggleSessionButtons,
        setCurrentRecord:setCurrentRecord,
        recordResultOK:recordResultOK,
        recordResult2:recordResult2,
        recordResultDNF:recordResultDNF,
        setSession:setSession,
        setCurrentEvent:setCurrentEvent,
        resetUI:resetUI,
        setSessionOptions:setSessionOptions,
        currentSession:returnCurrentSession,
        mergeEvents:mergeEvents,
        setEventOptions:setEventOptions,
        reloadApp:reloadApp,
        openEvents:openEvents,
        closeEvents:closeEvents,
        sessionButtonsShowing:returnSessionButtonsShowing,
        createNewEvent:createNewEvent,
        transferSessionButton:transferSessionButton,
        transferSession:transferSession
    }
}()