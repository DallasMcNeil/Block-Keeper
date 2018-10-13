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

    /*
    this.onmessage = function(event) {
        console.log("X")
        importScripts("libs/tnoodle.js");
        console.log(tnoodlejs.getVersion())
        var scrambleObject;
        /*postMessage(event.data);
        postMessage("B")
        
        postMessage(scrambleObject)
            
    // Once scramble is generated
    worker.onmessage = function(event) {
        console.log(event.data);
    };
    */

    // tnoodle is used to scramble major events and draw scrambles for tool
    // cubesolver is used to solve Cross, EOLine and first block for tools
    // random move scrambles for puzzles above 7x7x7

    // To add a new scramble generator
    // 1. Write a function which generates a scramble. It should return an object with a 'scramble' property being the string and 'type' being the puzzle (e.g '333', 'pyram', 'other')
    // 2. Add the scramble to the 'scrambleOptions' object with the key being the displayed name of the scramble and the value being the function. If the function must be called with parameters, call it within another function
    
    // All scramblers and which one is currently being used
    // Scramblers are in displayed order
    var currentScrambler = "Recommended";
    var scrambleOptions = {
        "Recommended":"recommended",
        "3x3x3":"333",   
        "3x3x3 BLD":"333",
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
        "8x8x8":"888",
        "9x9x9":"999",
        "10x10x10":"101010",
        "11x11x11":"111111",
        "13x13x13":"131313",
        "15x15x15":"151515",
        "17x17x17":"171717",
        "2x2x2 - 5x5x5":"relay2-5",
        "2x2x2 - 7x7x7":"relay2-7",
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
            var scrambler = scrambleOptions[scrambleSelect.value];
            console.log(scrambler);
            if (scrambler == "recommended") {
                scrambler = scrambleRecommended();
            }
            if (scrambler == "none") {
                var scrambleObject = {};
                scrambleObject.type = "none";
                scrambleObject.scramble = "";
                receiveScramble(scrambleObject);
            } else if (scrambler == "888") {
                var scrambleObject = {};
                scrambleObject.type = "888";
                scrambleObject.scramble = scrambleNxNxN(8,120);
                receiveScramble(scrambleObject);
            } else if (scrambler == "999") {
                var scrambleObject = {};
                scrambleObject.type = "999";
                scrambleObject.scramble = scrambleNxNxN(9,140);
                receiveScramble(scrambleObject);
            } else if (scrambler == "101010") {
                var scrambleObject = {};
                scrambleObject.type = "101010";
                scrambleObject.scramble = scrambleNxNxN(10,160);
                receiveScramble(scrambleObject);
            } else if (scrambler == "111111") {
                var scrambleObject = {};
                scrambleObject.type = "111111";
                scrambleObject.scramble = scrambleNxNxN(11,180);
                receiveScramble(scrambleObject);
            } else if (scrambler == "131313") {
                var scrambleObject = {};
                scrambleObject.type = "131313";
                scrambleObject.scramble = scrambleNxNxN(13,200);
                receiveScramble(scrambleObject);
            } else if (scrambler == "151515") {
                var scrambleObject = {};
                scrambleObject.type = "151515";
                scrambleObject.scramble = scrambleNxNxN(15,220);
                receiveScramble(scrambleObject);
            } else if (scrambler == "171717") {
                var scrambleObject = {};
                scrambleObject.type = "171717";
                scrambleObject.scramble = scrambleNxNxN(17,240);
                receiveScramble(scrambleObject);
            } else {
                requestScrambleForType(scrambler);
            }
        } else {
            updateScramble();
        }
    }

    // Send message to scramble process to create scramble object
    function requestScrambleForType(type) {
        console.log("SEND: " + type);
        disableElement("#scrambleNext");
        ipcRenderer.send('scramble', type);
        generating = true;
    }

    function receiveScramble(scrambleObj) {
        console.log("RECEIVE: ");
        console.log(scrambleObj);

        var scrambler = scrambleOptions[scrambleSelect.value];
        if (scrambler == "recommended") {
            scrambler = scrambleRecommended();
        }
        console.log(scrambler)
        if (scrambleObj.type != scrambler) {
            console.log("Invalid");
            return;
        }
        
        enableElement("#scrambleNext");

        scrambleList.push(scrambleObj);

        if (currentScramble > saveHistory) {
            scrambleList.splice(0,1);
            currentScramble--;
        }

        if (currentScramble + 1 == scrambleList.length) {
            console.log("END of list");
        }

        generating = false;
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
                scrambleObject.type = "other";
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
                tools.updateTools();

                if (currentScramble == 0) {
                    disableElement("#scramblePrevious");
                } else {
                    enableElement("#scramblePrevious");
                }
            }
        }
    }
    
    // Draw the current scramble in the canvas, if possible
    function drawScramble(ctx) {
        ctx.innerHTML = "";
        if (currentScramble < scrambleList.length) {
            if (puzzles[scrambleList[currentScramble].type] != undefined) {
                ctx.innerHTML = tnoodlejs.scrambleToSvg(scrambleList[currentScramble].scramble, puzzles[scrambleList[currentScramble].type]);
                ctx.children[0].setAttribute("width", "300px");
                ctx.children[0].setAttribute("height", "200px");
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
        var s = formatScrambleForFace(scramble,type);
        return cubeSolver.crossSolver(s);
    }

    // Find EOline solution to scramble for side
    function solveEOLine(scramble,type) {
        var s = formatScrambleForFace(scramble,type);
        return cubeSolver.EOLineSolver(s);
    }

    // Find first block solution to scramble for side
    function solveFirstBlock(scramble,type) {
        var s = formatScrambleForFace(scramble,type);
        return cubeSolver.firstBlockSolver(s);
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
        return scrambleList[currentScramble].scramble;
    }
    
    function getCurrentScrambler() {
        return currentScrambler;
    }
    
    function setCurrentScrambler(s) {
        currentScrambler = s;
        scrambleSelect.value = s;
    }
    
    function returnScrambleType() {
        return scrambleList[currentScramble].type;
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