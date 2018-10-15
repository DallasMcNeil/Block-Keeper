// scramble.js
// Wrapper for scrambling functions
// Block Keeper
// Created by Dallas McNeil

// Receive TNoodle puzzles 
function puzzlesLoaded(puzzles) {
    window.puzzles = puzzles;
}

var {ipcRenderer, remote} = require('electron'); 

var scramble = function() {

    // tnoodle is used to scramble major events and draw scrambles for tool
    // cubesolver is used to solve Cross, EOLine and first block for tools
    // random move scrambles for puzzles above 7x7x7

    // All scramblers and which one is currently being used
    // Scramblers are in displayed order
    var currentScrambler = "Recommended";
    var scrambleOptions = {
        "Recommended":"recommended",
        "3x3x3":"333",   
        "2x2x2":"222",
        "4x4x4":"444",
        "5x5x5":"555",
        "Pyraminx":"pyram",
        "Skewb":"skewb",
        "Megaminx":"minx",
        "Square-1":"sq1",
        "Clock":"clock",
        "6x6x6":"666",
        "7x7x7":"777",

        "3x3x3 BLD":"333ni",
        "4x4x4 BLD":"444ni",
        "5x5x5 BLD":"555ni",

        "8x8x8":"888",
        "9x9x9":"999",
        "10x10x10":"101010",
        "11x11x11":"111111",
        "13x13x13":"131313",
        "15x15x15":"151515",
        "17x17x17":"171717",

        "2x2x2 - 5x5x5":"relay2-5",
        "2x2x2 - 7x7x7":"relay2-7",

        "3x3x3 F2L":"333f2l",
        "3x3x3 LL":"333ll",
        "3x3x3 PLL":"333pll",
        "3x3x3 Edges":"333edge",
        "3x3x3 Corners":"333corner",
        "3x3x3 Last Slot":"333ls",

        "3x3x3 COLL":"333coll",
        "3x3x3 CMLL":"333cmll",
        "3x3x3 ELL":"333ell",
        "3x3x3 ZBLL":"333zbll",

        "None":"none"
    };
    
    const saveHistory = 3;

    // Internal scrambler being used for tool drawing
    var scrambleStr = "";
    // Scramble history
    var scrambleList = [];
    // The current scramble being used from the list
    var currentScramble = 0; 

    var scrambleText = document.getElementById("scramble");
    var scrambleImage = document.getElementById("scrambleImage");
    var scrambleSelect = document.getElementById("scramblerSelect");

    $("#dialogScramble").dialog({
        autoOpen:false,
        modal:true,
        show:"fade",
        hide:"fade",
        position: {
            my:"center",
            at:"center",
            of:"#background"
        },
        width:408,
        height:266
    }).on('keydown', function(evt) {
        if (evt.keyCode === $.ui.keyCode.ESCAPE) {
            closeScramble();
        }     
        evt.stopPropagation();
    });

    // Open the scramble menu when the scramble is clicked
    function openScramble() {
        if ($("#dialogScramble").dialog("isOpen")) {
            closeScramble();
        } else if (!globals.menuOpen) {
            $("#dialogScramble").dialog("open");
            disableAllElements("scramble");
            document.getElementById("customScramble").value = "";
            globals.menuOpen = true;
        }
    }

    // Close the scramble menu
    function closeScramble() {
        $("#dialogScramble").dialog("close");
        enableAllElements();
        scrambleList = [];
        appendCustomScrambles();
        if (scrambleList.length == 0) {
            currentScramble = -1;
            nextScramble();
        } else {
            currentScramble = 0;
            updateScramble();
        }
        globals.menuOpen = false;
    }

    // Sets up a select element with all the scrambler options
    function setScramblerOptions(selectElem) {
        var keys = Object.keys(scrambleOptions);
        for (var i = 0; i < keys.length; i++) {
            var t = keys[i];
            var o = document.createElement("option");
            o.value = t;
            o.text = t;
            if (i == 0) {
                o.selected = true;
            }
            selectElem.add(o);
        }
        selectElem.selectedIndex = 0;
    }
    
    function setupList() {
        scrambleList = [];
        currentScramble = -1;
        scrambleSelect.value = "Recommended";
        enableElement("#scrambleNext");
        generating = false;
        nextScramble();
    }

    function resetList() {
        scrambleList = [];
        currentScramble = -1;
        enableElement("#scrambleNext");
        generating = false;
        nextScramble();
    }

    var generating = false;

    // Move to next scramble in list
    function nextScramble() {
        if (generating) {
            return;
        }

        currentScramble++;
        if (currentScramble >= scrambleList.length) {
            scrambleText.innerHTML = "Generating...";
            
            if (preloading) {
                disableElement("#scramblePrevious");
                disableElement("#scrambleNext");
                generating = true;
                return;
            }

            generating = true;

            var scrambler = scrambleOptions[scrambleSelect.value];
            
            if (scrambler == "recommended") {
                scrambler = scrambleRecommended();
            }
            if (!resolveScrambler(scrambler)) {
                if ((scrambler == "444" || scrambler == "sq1") && preferences.fastScramblers) {
                    scrambler += "fast";
                }
                disableElement("#scramblePrevious");
                disableElement("#scrambleNext");
                
                requestScrambleForType(scrambler);
            }
        } else {
            if (currentScramble + 1 == scrambleList.length) {
                preloadScramble();
            }
            updateScramble();
        }
    }

    var preloading = false;

    // Preload the next scramble to reduce wait time
    function preloadScramble() {
        setTimeout(function() {   
            if (generating || preloading) {
                return;
            }
            preloading = true;
            var scrambler = scrambleOptions[scrambleSelect.value];
                
            if (scrambler == "recommended") {
                scrambler = scrambleRecommended();
            }
            if (!resolveScrambler(scrambler)) {
                if ((scrambler == "444" || scrambler == "sq1") && preferences.fastScramblers) {
                    scrambler += "fast";
                }
                requestScrambleForType(scrambler);
            }
        },0);
        
    }

    // Send message to scramble process to create scramble object
    function requestScrambleForType(type) {
        ipcRenderer.send('scramble', type);
    }

    // Take scramble and add to list
    function receiveScramble(scrambleObj, ignoreInvalid=false) {
        var scrambler = scrambleOptions[scrambleSelect.value];
        if (scrambler == "recommended") {
            scrambler = scrambleRecommended();
        }

        if (!ignoreInvalid && scrambleObj.type != scrambler && scrambleObj.type != scrambler+"fast") {
             if (currentScramble >= scrambleList.length) {
                currentScramble--;
                generating = false;
                preloading = false;
                nextScramble();
            }
            return;
        }
        
        enableElement("#scrambleNext");

        scrambleList.push(scrambleObj);

        if (currentScramble > saveHistory) {
            scrambleList.splice(0,1);
            currentScramble--;
        }

        generating = false;
        preloading = false;
        if (currentScramble + 1 == scrambleList.length) {
            preloadScramble();
        }

        updateScramble();
    }

    // Receive scramble from other process
    require('electron').ipcRenderer.on('scramble-done', function(event, message) { 
        receiveScramble(message);
    });
    
    // Move to previous scramble in list
    function previousScramble() {
        if (currentScramble > 0) {
            currentScramble--;
            updateScramble();
        } 
    }

    // Add custom scrambles to list
    function appendCustomScrambles() {
        var customScramble = document.getElementById("customScramble").value;
        var scrambles = customScramble.split(/\r?\n/);
        for (var i=0; i<scrambles.length; i++) {
            if (scrambles[i] != "") {
                var scrambleObject = {};

                var scrambler = scrambleOptions[scrambleSelect.value];
                if (scrambler == "recommended") {
                    scrambler = scrambleRecommended();
                }

                scrambleObject.type = scrambler;
                scrambleObject.scramble = scrambles[i];
                scrambleList.push(scrambleObject);
            }
        }
    }

    // Show current scramble
    function updateScramble() {
        if (!generating) {
            scrambleText.innerHTML = scrambleList[currentScramble].scramble;      
            if (tools != undefined && tools.updateTools != undefined) {
                if (returnCurrentScramble() != lastDrawnScramble) {
                    tools.updateTools();
                    lastDrawnScramble = returnCurrentScramble()+"";
                }

                if (currentScramble == 0) {
                    disableElement("#scramblePrevious");
                } else {
                    enableElement("#scramblePrevious");
                }
            }
        }
    }
    
    var lastDrawnScramble = "";

    // Draw the current scramble in the canvas, if possible
    function drawScramble(ctx) {
        if (returnCurrentScramble() != lastDrawnScramble) {
            ctx.innerHTML = "";
            if (currentScramble < scrambleList.length) {
                if (puzzles[scrambleList[currentScramble].type] != undefined) {
                    lastDrawnScramble = returnCurrentScramble()+"";
                    try {
                        ctx.innerHTML = tnoodlejs.scrambleToSvg(scrambleList[currentScramble].scramble, puzzles[scrambleList[currentScramble].type]);
                    } catch(err) {
                        console.log("Can't draw scramble" + scrambleList[currentScramble].scramble);
                        return;
                    }
                    ctx.children[0].setAttribute("width", "300px");
                    ctx.children[0].setAttribute("height", "200px");
                }
            }
        }
    }

    // Use the recommended scrambler for the event
    function scrambleRecommended() {
        if (scrambleOptions[events.getCurrentEvent().scrambler] != undefined) {
            return scrambleOptions[events.getCurrentEvent().scrambler];
        } else {
            return "none";
        }
    }

    // Try and create scramble, otherwise require TNoodle
    function resolveScrambler(scrambler) {
        if (scrambler == "none") {
            var scrambleObject = {};
            scrambleObject.type = "none";
            scrambleObject.scramble = "";
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else if (scrambler == "888") {
            receiveScramble(scrambleNxNxN(8,120), ignoreInvalid=true);
        } else if (scrambler == "999") {
            receiveScramble(scrambleNxNxN(9,140), ignoreInvalid=true);
        } else if (scrambler == "101010") {
            receiveScramble(scrambleNxNxN(10,160), ignoreInvalid=true);
        } else if (scrambler == "111111") {
            receiveScramble(scrambleNxNxN(11,180), ignoreInvalid=true);
        } else if (scrambler == "131313") {
            receiveScramble(scrambleNxNxN(13,200), ignoreInvalid=true);
        } else if (scrambler == "151515") {
            receiveScramble(scrambleNxNxN(15,220), ignoreInvalid=true);
        } else if (scrambler == "171717") {
            receiveScramble(scrambleNxNxN(17,240), ignoreInvalid=true);
        } else if (scrambler == "333f2l") {
            var scrambleObject = {};
            scrambleObject.type = "333";
            scrambleObject.scramble = scramble_333.getF2LScramble();
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else if (scrambler == "333ll") {
            var scrambleObject = {};
            scrambleObject.type = "333";
            scrambleObject.scramble = scramble_333.getLLScramble();
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else if (scrambler == "333pll") {
            var scrambleObject = {};
            scrambleObject.type = "333";
            scrambleObject.scramble = scramble_333.getPLLScramble();
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else if (scrambler == "333edge") {
            var scrambleObject = {};
            scrambleObject.type = "333";
            scrambleObject.scramble = scramble_333.getEdgeScramble();
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else if (scrambler == "333corner") {
            var scrambleObject = {};
            scrambleObject.type = "333";
            scrambleObject.scramble = scramble_333.getCornerScramble();
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else if (scrambler == "333ls") {
            var scrambleObject = {};
            scrambleObject.type = "333";
            scrambleObject.scramble = scramble_333.getLSLLScramble();
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else if (scrambler == "333coll") {
            var scrambleObject = {};
            scrambleObject.type = "333";
            scrambleObject.scramble = scramble_333.getCLLScramble();
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else if (scrambler == "333cmll") {
            var scrambleObject = {};
            scrambleObject.type = "333";
            scrambleObject.scramble = scramble_333.getCMLLScramble();
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else if (scrambler == "333ell") {
            var scrambleObject = {};
            scrambleObject.type = "333";
            scrambleObject.scramble = scramble_333.getELLScramble()
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else if (scrambler == "333zbll") {
            var scrambleObject = {};
            scrambleObject.type = "333";
            scrambleObject.scramble = scramble_333.getZBLLScramble(); 
            receiveScramble(scrambleObject, ignoreInvalid=true);
        } else {
            return false;
        }
        return true;
    }
    
    // Use random move to create a scramble for NxNxN puzzles
    function scrambleNxNxN(n,length) {
        var scrambleObject = {};

        var moves = [];
        if (n > 1) {
            moves.push("R");
            moves.push("F");
            moves.push("U");
        }
        if (n > 2) {
            moves.push("L");
            moves.push("B");
            moves.push("D");
        }

        if (n > 3) {
            moves.push("Rw");
            moves.push("Lw");
            moves.push("Fw");
            moves.push("Bw");
            moves.push("Uw");
            moves.push("Dw");
        }

        for (var i = 3; i <= n / 2; i++) {
            moves.push(i + "Rw");
            moves.push(i + "Lw");
            moves.push(i + "Fw");
            moves.push(i + "Bw");
            moves.push(i + "Uw");
            moves.push(i + "Dw");
        }
 
        var str = "";
        var lastMove = "";
        var move = "";
        for (var i = 0; i < length; i++) {
            while (move == lastMove) {
                move = moves[Math.floor(Math.random() * moves.length)];
            }
            
            lastMove = move;
            
            var mod = ["","'","2"][Math.floor(Math.random() * 3)];
            str += move + mod + " ";
        }
 
        scrambleObject.type = "" + n + n + n;
        scrambleObject.scramble = str;
        return scrambleObject;
    }
    
    // Find cross solution to scramble for side
    function solveCross(scramble,type) {
        try {
            var s = formatScrambleForFace(scramble,type);
            return cubeSolver.crossSolver(s);
        } catch (err) {
            return "";
        }
    }

    // Find EOline solution to scramble for side
    function solveEOLine(scramble,type) {
        try {
            var s = formatScrambleForFace(scramble,type);
            return cubeSolver.EOLineSolver(s);
        } catch (err) {
            return "";
        }
    }

    // Find first block solution to scramble for side
    function solveFirstBlock(scramble,type) {
        try {
            var s = formatScrambleForFace(scramble,type);
            return cubeSolver.firstBlockSolver(s);
        } catch (err) {
            return "";
        }
    }

    // Adjust scramble for different face
    function formatScrambleForFace(s,type) {
        // type = 1: Yellow
        if (type == 0) { 
            // Whitte
            s = s.replaceAll("R","X");
            s = s.replaceAll("L","R");
            s = s.replaceAll("X","L");
            s = s.replaceAll("D","X");
            s = s.replaceAll("U","D");
            s = s.replaceAll("X","U");
        } else if (type == 2) { 
            // Red
            s = s.replaceAll("U","X");
            s = s.replaceAll("L","U");
            s = s.replaceAll("D","L");
            s = s.replaceAll("R","D");
            s = s.replaceAll("X","R");
        } else if (type == 3) { 
            // Orange
            s = s.replaceAll("U","X");
            s = s.replaceAll("R","U");
            s = s.replaceAll("D","R");
            s = s.replaceAll("L","D");
            s = s.replaceAll("X","L");
        } else if (type == 4) { 
            // Blue
            s = s.replaceAll("U","X");
            s = s.replaceAll("L","U");
            s = s.replaceAll("D","L");
            s = s.replaceAll("R","D");
            s = s.replaceAll("X","R");

            s = s.replaceAll("U","X");
            s = s.replaceAll("F","U");
            s = s.replaceAll("D","F");
            s = s.replaceAll("B","D");
            s = s.replaceAll("X","B");
        } else if (type == 5) { 
            // Green
            s = s.replaceAll("U","X");
            s = s.replaceAll("R","U");
            s = s.replaceAll("D","R");
            s = s.replaceAll("L","D");
            s = s.replaceAll("X","L");

            s = s.replaceAll("U","X");
            s = s.replaceAll("B","U");
            s = s.replaceAll("D","B");
            s = s.replaceAll("F","D");
            s = s.replaceAll("X","F");
        }
        return s;
    }
    
    function returnCurrentScramble() {
        if (scrambleList.length > currentScramble) {
            return scrambleList[currentScramble].scramble;
        }
        return "";
    }
    
    function getCurrentScrambler() {
        return currentScrambler;
    }
    
    function setCurrentScrambler(s) {
        currentScrambler = s;
        scrambleSelect.value = s;
    }
    
    function returnScrambleType() {
        if (scrambleList.length > currentScramble) {
            return scrambleList[currentScramble].type;
        }
        return "none";
    }

    function setup() {
        // Setup main scramble select
        setScramblerOptions(scrambleSelect);
    }

    return {
        setup:setup,
        currentScramble:returnCurrentScramble,
        resetList:resetList,
        nextScramble:nextScramble,
        updateScramble:updateScramble,
        previousScramble:previousScramble,
        scrambleType:returnScrambleType,
        drawScramble:drawScramble,
        openScramble:openScramble,
        closeScramble:closeScramble,
        solveCross:solveCross,
        solveEOLine:solveEOLine,
        solveFirstBlock:solveFirstBlock,
        setScramblerOptions:setScramblerOptions,
        getCurrentScrambler:getCurrentScrambler,
        setCurrentScrambler:setCurrentScrambler
    };
}();