// scramble.js
// Wrapper for scrambling functions
// Block Keeper
// Created by Dallas McNeil

// Receive TNoodle puzzles
function puzzlesLoaded(puzzles) {
    window.puzzles = puzzles;
}

var scramble = function() {

    // tnoodle is used to scramble major events and draw scrambles for tool
    // cubesolver is used to solve Cross, EOLine and first block for tools
    // random move scrambles for puzzles above 7x7x7

    // To add a new scramble
    // 1. Write a function which generates a scramble. The function must set 'currentScramble' to the final scramble. It should also set 'scrambleStr' to the type of puzzle and if possible set up the 'scrambleState' object. The 'scrambleState.scramble_str' should be the same as 'currentScramble' and 'scrambleState.STATE' to the face colors of the puzzle, if possible. If this cannot be done, or the puzzle doesn't support drawing, set the scrambleStr to 'none'. Check out https://github.com/nickcolley/scrambo for more information
    // 2. Add the scramble to the 'scrambleOptions' object with the key being the displayed name of the scramble and the value being the function. If the function must be called with paramaters, call it within another function
    
    // All scramblers and which one is currently being used
    // Scramblers are in displayed order
    var currentScrambler = "Recommended";
    var scrambleOptions = {
        "Recommended":scrambleRecommended,
        "3x3x3":scramble3x3x3,   
        "3x3x3 BLD":scramble3x3x3BLD,
        "2x2x2":scramble2x2x2,
        "4x4x4":scramble4x4x4,
        "5x5x5":scramble5x5x5,
        "Pyraminx":scramblePyraminx,
        "Skewb":scrambleSkewb,
        "Megaminx":scrambleMegaminx,
        "Square-1":scrambleSquare1,
        "Clock":scrambleClock,
        "6x6x6":scramble6x6x6,
        "7x7x7":scramble7x7x7,
        "8x8x8":function(){return scrambleNxNxN(8,100);},
        "9x9x9":function(){return scrambleNxNxN(9,120);},
        "10x10x10":function(){return scrambleNxNxN(10,140);},
        "11x11x11":function(){return scrambleNxNxN(11,160);},
        "13x13x13":function(){return scrambleNxNxN(13,180);},
        "15x15x15":function(){return scrambleNxNxN(15,200);},
        "17x17x17":function(){return scrambleNxNxN(17,220);},
        "2x2x2 - 5x5x5":scramble2to5Relay,
        "2x2x2 - 7x7x7":scramble2to7Relay,
        "None":scrambleNone
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
        nextScramble();
    }

    function resetList() {
        scrambleList = [];
        currentScramble = -1;
        nextScramble();
    }

    // Move to next scramble in list
    function nextScramble() {
        currentScramble++;
        if (currentScramble >= scrambleList.length) {
            var scrambler = scrambleSelect.value;
            var newObject;
            if (scrambleOptions[scrambler] != undefined) {
                newObject = scrambleOptions[scrambler]();
            } else {
                newObject = scrambleOptions["None"]();
            }
            scrambleList.push(newObject);
        } 
        if (currentScramble > saveHistory) {
            scrambleList.splice(0,1);
            currentScramble--;
        }
        
        updateScramble();
    }
    
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
    
    // Draw the current scramble in the canvas, if possible
    function drawScramble(ctx) {
        ctx.innerHTML = "";
        if (puzzles[scrambleList[currentScramble].type] != undefined) {
            ctx.innerHTML = tnoodlejs.scrambleToSvg(scrambleList[currentScramble].scramble, puzzles[scrambleList[currentScramble].type]);
            ctx.children[0].setAttribute("width", "300px");
            ctx.children[0].setAttribute("height", "200px");
        }
    }

    // Use the recommended scrambler for the event
    function scrambleRecommended() {
        if (scrambleOptions[events.getCurrentEvent().scrambler] != undefined) {
            return scrambleOptions[events.getCurrentEvent().scrambler]();
        } else {
            return scrambleNone();
        }
    }

    // Uses library scramblers to create scramble object
    function scrambleObjectFromType(type) {
        var scrambleObject = {};
        scrambleObject.type = type;
        scrambleObject.scramble = puzzles[scrambleObject.type].generateScramble();
        return scrambleObject;
    }

    // Get a scramble for each puzzle available, including it's state if possible
    function scramble2x2x2() {
        return scrambleObjectFromType("222");
    }

    function scramble3x3x3() {
        return scrambleObjectFromType("333");
    }

    function scramble4x4x4() {
        return scrambleObjectFromType("444");
    }

    function scramble5x5x5() {
        return scrambleObjectFromType("555");
    }

    function scramble6x6x6() {
        return scrambleObjectFromType("666");
    }

    function scramble7x7x7() {
        return scrambleObjectFromType("777");
    }

    function scramblePyraminx() {
        return scrambleObjectFromType("pyram");
    }

    function scrambleSkewb() {
        return scrambleObjectFromType("skewb");
    }

    function scrambleMegaminx() {
        return scrambleObjectFromType("minx");
    }

    function scrambleSquare1() {
        return scrambleObjectFromType("sq1");
    }

    function scrambleClock() {
        return scrambleObjectFromType("clock");
    }

    // Add rotation to 3x3x3 scramble
    function scramble3x3x3BLD() {
        var obj = scrambleObjectFromType("333");

        // Orientate up face and then orient front face
        //obj.scramble += [" "," z"," z2"," z'"," x"," x'"][Math.floor(Math.random() * 6)];
        //obj.scramble += [" y", " y'", " y2", ""][Math.floor(Math.random() * 4)];

        return obj;
    }

    function scrambleNone() {
        var scrambleObject = {};
        scrambleObject.type = "none";
        scrambleObject.scramble = "";
        return scrambleObject;
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
    
    // Scramble for 2x2x2 to 5x5x5 relay
    function scramble2to5Relay() {
        var scrambleObject = {};
        
        var str = "(2x2x2) " + puzzles["222"].generateScramble() + "<br>";
        str += "(3x3x3) " + puzzles["333"].generateScramble() + "<br>";
        str += "(4x4x4) " + puzzles["444"].generateScramble() + "<br>";
        str += "(5x5x5) " + puzzles["555"].generateScramble();
        
        scrambleObject.type = "relay";
        scrambleObject.scramble = str;
        return scrambleObject;
    }
    
    // Scramble for 2x2x2 to 7x7x7 relay
    function scramble2to7Relay() {
        var scrambleObject = {};
        
        var str = "(2x2x2) " + puzzles["222"].generateScramble() + "<br>";
        str += "(3x3x3) " + puzzles["333"].generateScramble() + "<br>";
        str += "(4x4x4) " + puzzles["444"].generateScramble() + "<br>";
        str += "(5x5x5) " + puzzles["555"].generateScramble() + "<br>";
        str += "(6x6x6) " + puzzles["666"].generateScramble() + "<br>";
        str += "(7x7x7) " + puzzles["777"].generateScramble();
        
        scrambleObject.type = "relay";
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

        // Setup scramble list
        setupList();
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