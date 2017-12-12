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
        {name:"3x3x3",sessions:[],scrambler:"3x3x3",enabled:true,OH:false,blind:false},
        {name:"2x2x2",sessions:[],scrambler:"2x2x2",enabled:true,OH:false,blind:false},
        {name:"4x4x4",sessions:[],scrambler:"4x4x4",enabled:true,OH:false,blind:false},
        {name:"5x5x5",sessions:[],scrambler:"5x5x5",enabled:true,OH:false,blind:false},

        {name:"Pyraminx",sessions:[],scrambler:"Pyraminx",enabled:true,OH:false,blind:false},
        {name:"Skewb",sessions:[],scrambler:"Skewb",enabled:true,OH:false,blind:false},
        {name:"Megaminx",sessions:[],scrambler:"Megaminx",enabled:true,OH:false,blind:false},
        {name:"Square-1",sessions:[],scrambler:"Square-1",enabled:true,OH:false,blind:false},
        {name:"Clock",sessions:[],scrambler:"Clock",enabled:true,OH:false,blind:false},
        {name:"6x6x6",sessions:[],scrambler:"6x6x6",enabled:true,OH:false,blind:false},
        {name:"7x7x7",sessions:[],scrambler:"7x7x7",enabled:true,OH:false,blind:false},

        {name:"3x3x3 OH",sessions:[],scrambler:"3x3x3",enabled:true,OH:true,blind:false},
        {name:"3x3x3 BLD",sessions:[],scrambler:"3x3x3 BLD",enabled:true,OH:false,blind:true},
        {name:"4x4x4 BLD",sessions:[],scrambler:"4x4x4",enabled:false,OH:false,blind:true},
        {name:"5x5x5 BLD",sessions:[],scrambler:"5x5x5",enabled:true,OH:false,blind:true},
        {name:"3x3x3 FT",sessions:[],scrambler:"3x3x3",enabled:true,OH:false,blind:false},

        {name:"Other",sessions:[],scrambler:"None",enabled:true,OH:false,blind:false}
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
        storage.set("puzzles",{puzzles:internalEvents, puzzle:currentEvent, session:currentSession, tools:tools.toolTypes()}, function(error) {
            if (error) {
                throw error;
            }
        })
    }

    // Save events to a seperate backup file before closing
    var letClose = false;
    function closeApp() {
        storage.set("puzzlesBackup", {puzzles:puzzles, puzzle:currentPuzzle, session:currentSession, tools:toolTypes}, function(error) {
            if (error) {
                throw error;
            }
            letClose = true;
            remote.getCurrentWindow().close();
        })
    }

    window.onbeforeunload = function (e) {
        if (!letClose) {
            closeApp();
            return false;
        }
    }

    // Merge two sets of events, overriding x with y
    function mergeSessions(x,y) {
        var final = [];
        var a = x.slice();
        var b = y.slice();
        
        // Override all defaults (x) with saved (y)
        for (var i in a) {
            var shared = false;
            for (var j in b) {
                if (b[j].name !== null) {
                    if (b[j].name === a[i].name) {
                        shared = true;
                        break;
                    }
                }
            }
            if (shared && (b[j].name !== null)) {
                final.push(Object.assign({}, a[i], b[j]));
                b.splice(j, 1);
            } else {
                final.push(a[i]);
            }
        }
        
        // Add all other saved (y)
        var length = b.length
        for (var i = length - 1; i >= 0; i--) {
            if ((b[i].name !== null)) {
                if (!b[i].scrambler) {
                    b[i].scramble = "None";
                }
                if (!b[i].OH) {
                    b[i].OH = false;
                }
                if (!b[i].blind) {
                    b[i].blind = false;
                }
                if (!b[i].enabled) {
                    b[i].enabled = true;
                }
                if (!b[i].sessions) {
                    b[i].sessions = [];
                }
                final.push(b[i]);
            }
        }
        return final;
    }

    // Load session from file
    function loadSessions() {
        // Setup loaded object
        var setup = function(object) {
            if (object.puzzles !== null) {
                if (object.puzzles.length !== 0) {
                    internalEvents = mergeSessions(internalEvents, object.puzzles);
                }
            }

            if (object.puzzle !== null) {
                currentEvent = object.puzzle;
                if (currentEvent >= internalEvents.length || isNaN(currentEvent)) {
                    currentEvent = 0;
                }
            }
            if (object.session !== null) {
                currentSession = object.session;
                if (currentSession >= getCurrentEvent().sessions.length) {
                    currentSession = 0;
                }
            }
            
            if (object.tools != null) {
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
                            setup(object);
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

        var session = {date:new Date(), name:name, records:[]};
        getCurrentEvent().sessions.push(session);
        currentSession = getCurrentEvent().sessions.length - 1;
    }

    // Deletes current session
    function deleteSession() {
        if (confirm("Delete Session?")) {
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
    function createRecord(time, result) {
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
        
        var record = {time:time, scramble:scramble.currentScramble(), result:result};
        getCurrentSession().records.push(record);
        $("#sessionRecordsContainer").animate({scrollTop:Number.MAX_SAFE_INTEGER + "px"}, 100);
        if (updateStats) {
            updateRecords();
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
        var t = parseFloat(parseFloat(document.getElementById("addTimeInput").value).toFixed(3))
        document.getElementById("addTimeInput").value = ""
        if (isNaN(t) || t === undefined) {
            return;
        }
        if (t <= 0) {
            return;
        }
        createRecord(t, "OK");
       
        getLastRecord().scramble = document.getElementById("addScrambleInput").value;
        timerText.innerHTML = formatTime(t);
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
        updateRecords();
        scramble.scramble();
    }

    // Set the session based on the dropdown
    function setSession() {
         currentSession = sessionSelect.value;
         updateRecords();
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
        
    // RESUME HERE

    // Update all records displayed on screen
    function updateRecords() {
        setTimeout(function() { 
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
            var times = [];
            var mo3s = records.length > 2 ? new Array(records.length - 2) : [];
            var ao5s = records.length > 4 ? new Array(records.length - 4) : [];
            var ao12s = records.length > 11 ? new Array(records.length - 11) : [];
            var ao50s = records.length > 49 ? new Array(records.length - 49) : [];
            var ao100s = records.length > 99 ? new Array(records.length - 99) : [];
            var ao500s = records.length > 499 ? new Array(records.length - 499) : [];
            var ao1000s = records.length > 999 ? new Array(records.length - 999) : [];
            var DNFsolves = 0;

            for (var i = 0; i < records.length; i++) {
                if (records[i].result === "DNF") {
                    DNFsolves++;
                }
                times.push(extractTime(records[i]));
                var ao5t = "-";
                var ao12t = "-";
                
                if (i >= 2) {
                    mo3s[i-2] = averageLastRecords(times, 3);
                }
                if (i >= 4) {
                    ao5s[i-4] = averageLastRecords(times, 5);
                    ao5t = ao5s[i-4];
                }
                if (i >= 11) {
                    ao12s[i-11] = averageLastRecords(times, 12);
                    ao12t = ao12s[i-11];
                }
                if (i >= 49) {
                    ao50s[i-49] = averageLastRecords(times, 50);
                }
                if (i >= 99) {
                    ao100s[i-99] = averageLastRecords(times, 100);
                } 
                if (i >= 499) {
                    ao500s[i-499] = averageLastRecords(times, 500);
                }
                if (i >= 999) {
                    ao1000s[i-999] = averageLastRecords(times, 1000);
                }
                
                sessionRecordsTable.rows[i + 1].cells[0].children[0].innerHTML = i + 1;
                sessionRecordsTable.rows[i + 1].cells[1].children[0].innerHTML = formatRecord(records[i]);
                sessionRecordsTable.rows[i + 1].cells[2].children[0].innerHTML = formatTime(ao5t);
                sessionRecordsTable.rows[i + 1].cells[3].children[0].innerHTML = formatTime(ao12t);   
            }

            // Create session stats
            var mean = meanTimes(removeDNFs(times));
            if (mean === -1) {
                $("#sessionMean").prop("innerHTML", "<b>Mean:</b> " + formatTime(0));
                $("#sessionSD").prop("innerHTML", "<b>σ(s.d):</b> " + formatTime(0));
                $("#sessionMedian").prop("innerHTML", "<b>Median:</b> " + formatTime(0));
            } else {
                $("#sessionMean").prop("innerHTML", "<b>Mean:</b> " + formatTime(mean));
                $("#sessionSD").prop("innerHTML", "<b>σ(s.d):</b> " + formatTime(standardDeviation(times)));

                var sortedTimes = times.filter(function(t) {return t != -1}).sort();
                $("#sessionMedian").prop("innerHTML", "<b>Median:</b> " + formatTime((sortedTimes[Math.ceil((sortedTimes.length - 1) / 2)] + sortedTimes[Math.floor((sortedTimes.length - 1) / 2)]) / 2));
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
                    if (times.length == 0) {
                        bestP.innerHTML = "-";
                    } else {
                        var t = removeDNFs(ts).min();
                        if (t == Infinity) {// TODO FIX
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
            createRow("Time",1,times);
            createRow("Mo3",3,mo3s);
            createRow("Ao5",5,ao5s);
            createRow("Ao12",12,ao12s);
            createRow("Ao50",50,ao50s);
            createRow("Ao100",100,ao100s);
            createRow("Ao500",500,ao500s);
            createRow("Ao1000",1000,ao1000s);

            // On hover record details
            $("#sessionRecords td").hover(function(e) {
                if (!globals.menuOpen) {
                    var column = parseInt($(this).index());
                    var row = parseInt($(this).parent().index());  
                    if (column == 1 && row > 0) {
                        $("#dialogRecord").dialog("open");
                        $("#dialogRecord").dialog({
                            autoOpen:false,
                            modal:true,
                            hide:"fade",
                            width:"199",
                            height:"120",
                            position: {
                                my:"left top",
                                at:"right top",
                                of:sessionRecordsTable.rows[row].cells[column]
                            }
                        });
                        currentRecord = row - 1;
                        $("#recordScramble").html(getCurrentRecord().scramble);
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
            }, 10);

            tools.updateTools();
            saveSessions();
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
            newElement.title = "Session Select";
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
            newElement.title = "Session Name";
            newElement.id = "sessionSelectText";
            newElement.value = getCurrentSession().name;
            document.getElementById("sessionContainer").replaceChild(newElement, sessionSelect);
            sessionSelect = document.getElementById("sessionSelectText");
            $("#sessionButtons").animate({height:'40px'}, 200);
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
        updateRecords();
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
            updateRecords();
            $("#sessionButtons").animate({height:'0px'}, 200);
        }
    }

    // Hide the session stats
    function disableStats() {
        disableElement("#puzzleSelect");
        disableElement("#sessionStats");
        disableElement("#sessionRecordsContainer");
        disableElement("#sessionDetails");
    }

    // Show the session stats
    function enableStats() {
        enableElement("#puzzleSelect");
        enableElement("#sessionStats");
        enableElement("#sessionRecordsContainer");
        enableElement("#sessionDetails");
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
            updateRecords();
        }
    }

    // Set last record to +2 result
    function recordResult2() {
        if (getCurrentSession().records.length > 0) {
            getCurrentRecord().result = "+2";
            $("#dialogRecord").dialog("close");
            updateRecords();
        }
    }

    // Set last record to DNF result
    function recordResultDNF() {
        if (getCurrentSession().records.length > 0) {
            getCurrentRecord().result = "DNF";
            $("#dialogRecord").dialog("close");
            updateRecords();
        }
    }

    // Delete the last record in the current session
    function deleteRecord() {
        if (getCurrentSession().records.length > 0) {
            getCurrentSession().records.splice(currentRecord, 1);
            $("#dialogRecord").dialog("close");
            updateRecords();
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
        height:"265",
        show:"fade",
        hide:"fade"
    }).on('keydown', function(evt) {
        if (evt.keyCode === $.ui.keyCode.ESCAPE) {
            closeTimeDialog();
        } else if (evt.keyCode === 13) {
            addTime();
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
    
    function infoHeader() {
        return "Generated by Block Keeper on " + new Date().toDateString() + "<br>"
    }
    
    function averageExport(a,size) {
        var r = getCurrentSession().records.slice(a - size, a);
        console.log(a+":"+size)
        str = infoHeader();
        var toRemove = [];
        var ts = extractTimes(r);
        if (size == 1) {
            str += "Time: " + formatRecord(r[0]);
            return str;
        } else if (size < 5) {
            str+= "Mo"+size+": " + formatTime(meanTimes(extractTimes(r))) + "<br>";
        } else {
            str+= "Ao"+size+": " + formatTime(averageTimes(extractTimes(r))) + "<br>";
            toRemove = getMinsAndMaxs(ts);
            console.log(toRemove)
        }
        for (var i = 0; i < size; i++) {
            var didRemove = false;
            str+=("<br>" + (i + 1) + ". ")
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
                var best = -1
                var index = 0
                var r = getCurrentSession().records;
                for (var i = 0; i < r.length; i++) {
                    var t = extractTime(r[i]);
                    if (t != -1 && (t < best || best == -1)) {
                        best = t;
                        index = i;
                    }
                }
                str = averageExport(i, 1);
            } else if (a == 3) {
                var best = -1
                var index = 0
                var r = getCurrentSession().records;
                for (var i = 3; i < r.length; i++) {
                    var t = meanTimes(extractTimes(r.slice(i - (a - 1), i + 1)));
                    if (t != -1 && (t < best || best == -1)) {
                        best = t;
                        index = i;
                    }
                }
                str = averageExport(i, 3);
            } else {
                var best = -1
                var index = 0
                var r = getCurrentSession().records;
                for (var i = a; i < r.length; i++) {
                    var t = averageTimes(extractTimes(r.slice(i - (a - 1), i + 1)));
                    if (t != -1 && (t < best || best == -1)) {
                        best = t;
                        index = i;
                    }
                }
                str = averageExport(i, a);
            }
        } else if (type == "All") {
            if (a == 1) {
                var records = getCurrentSession().records;
                str = infoHeader() + "<br>Time list<br>";
                str += "σ(s.d): " + formatTime(standardDeviation(extractTimes(records))) + "<br>";
                for (var i = 0; i < records.length; i++) {
                    str += "<br>" + (i + 1) + ". ";
                    str += formatRecord(records[i]);
                    if (preferences.scramblesInList) {
                        str += " (" + records[i].scramble.trim() + ")";
                    }
                }
            } else if (a == 3) {
                str = infoHeader() + "<br>Mo3 list<br>";
                var means = [];
                var records = getCurrentSession().records;
                for (var i = 2; i < records.length; i++) {
                    means.push(meanTimes(extractTimes(records.slice(i - 2, i + 1))));
                }
                str += "σ(s.d): " + formatTime(standardDeviation(means)) + "<br>";
                for (var i = 0; i < means.length; i++) {
                    str += "<br>" + (i + 1) + ". ";
                    str += formatTime(means[i]);
                }
            } else {
                str = infoHeader() + "<br>Ao" + a + " list<br>";
                var means = [];
                var records = getCurrentSession().records;
                for (var i = 0; i < records.length - a + 1; i++) {
                    means.push(averageTimes(extractTimes(records.slice(i, i + a))));
                }
                str += "σ(s.d): " + formatTime(standardDeviation(means)) + "<br>";
                for (var i = 0;i < means.length; i++) {
                    str += "<br>" + (i + 1) + ". ";
                    str += formatTime(means[i]);
                }
            }
        }

        $("#messageShowInfo").html(str);
        $("#dialogShowInfo").dialog("open");
        disableAllElements();
        if (timerState === "inspectReady") {
            cancelTimer();
        }
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
    
    loadSessions();
        
    return {
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
        deleteSessionButton:deleteSessionButton,
        toggleSessionButtons:toggleSessionButtons,
        setCurrentRecord:setCurrentRecord,
        recordResultOK:recordResultOK,
        recordResult2:recordResult2,
        recordResultDNF:recordResultDNF,
        setSession:setSession,
        resetUI:resetUI,
        setSessionOptions:setSessionOptions,
        currentSession:returnCurrentSession
    }
}()