// scramble.js
// Wrapper for scrambling functions
// Block Keeper
// Created by Dallas McNeil

var scramble = function() {

    // cubesolver is used to solve Cross, EOLine and first block for tools
    // Scrambo is used to scramble major events and draw scrambles for tool

    // To add a new scramble
    // 1. Write a function which generates a scramble. The function must set 'currentScramble' to the final scramble. It should also set 'scrambleStr' to the type of puzzle and if possible set up the 'scrambleState' object. The 'scrambleState.scramble_str' should be the same as 'currentScramble' and 'scrambleState.STATE' to the face colors of the puzzle, if possible. If this cannot be done, or the puzzle doesn't support drawing, set the scrambleStr to 'none'. Check out https://github.com/nickcolley/scrambo for more information
    // 2. Add the scramble to the 'scrambleOptions' object with the key being the displayed name of the scramble and the value being the function. If the function must be called with paramaters, call it within another function
    
    // All scramblers and which one is currently being used
    // Scramblers are in displayed order
    var currentScrambler = "Recommended";
    var scrambleOptions = {
        "Recommended":scrambleRecommended,
        "Custom...":scrambleCustom,
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
        "8x8x8":function(){scrambleNxNxN(8,100)},
        "9x9x9":function(){scrambleNxNxN(9,120)},
        "10x10x10":function(){scrambleNxNxN(10,140)},
        "11x11x11":function(){scrambleNxNxN(11,160)},
        "13x13x13":function(){scrambleNxNxN(13,180)},
        "15x15x15":function(){scrambleNxNxN(15,200)},
        "17x17x17":function(){scrambleNxNxN(17,220)},
        "2x2x2 - 5x5x5":scramble2to5Relay,
        "2x2x2 - 7x7x7":scramble2to7Relay,
        "None":scrambleNone
    }
    
    // Internal scrambler being used for tool drawing
    var scrambleStr = "";
    // The current scramble being used
    var currentScramble = "";
    // Hold state information about the scramble (if applicable)
    var scrambleState = {scramble_string:""};
    
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

    // Open the scramble menu when the scramble is cicked
    function openScramble() {
        if ($("#dialogScramble").dialog("isOpen")) {
            closeScramble();
        } else if (!globals.menuOpen) {
            $("#dialogScramble").dialog("open");
            disableAllElements("scramble");
            globals.menuOpen = true;
        }
    }

    // Close the scramble menu
    function closeScramble() {
        $("#dialogScramble").dialog("close");
        enableAllElements();
        globals.menuOpen = false;
        scramble();
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
    }
    
    // Setup main scramble select
    setScramblerOptions(scrambleSelect);

    // Generate a new scramble and display it
    function scramble() {
        currentScrambler = scrambleSelect.value;
        if (scrambleOptions[currentScrambler] != undefined) {
            scrambleOptions[currentScrambler]();
            scrambleText.innerHTML = currentScramble;
        } else {
            scrambleOptions["None"]();
        }
        scrambleText.innerHTML = currentScramble;      
        tools.updateTools();
    }
    
    // Draw the current scramble in the canvas, if possible
    function drawScramble(ctx) {
        ctx.innerHTML = ""
        if (!(scramblers[scrambleStr] == undefined || (scrambleStr == "333mbf"))) {
            scramblers[scrambleStr].drawScramble(ctx, scrambleState.state, 300, 200);
        }
    }

    // Use the recommended scrambler for the event
    function scrambleRecommended() {
        if (scrambleOptions[events.getCurrentEvent().scrambler] != undefined) {
            scrambleOptions[events.getCurrentEvent().scrambler]()
        } else {
            scrambleNone()
        }
    }

    // Use the custom scramble 
    function scrambleCustom() {
        scrambleStr = "none";
        currentScramble = document.getElementById("customScramble").value;
    }

    // Get a scramble for each puzzle available, including it's state if possible
    function scramble2x2x2() {
        scrambleStr = "222";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    function scramble3x3x3() {
        scrambleStr = "333";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    function scramble4x4x4() {
        scrambleStr = "444";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    function scramble5x5x5() {
        scrambleStr = "555";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    function scramble6x6x6() {
        scrambleStr = "666";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    function scramble7x7x7() {
        scrambleStr = "777";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    function scramblePyraminx() {
        scrambleStr = "pyram";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    function scrambleSkewb() {
        scrambleStr = "skewb";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    function scrambleMegaminx() {
        scrambleStr = "minx";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    function scrambleSquare1() {
        scrambleStr = "sq1";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    function scrambleClock() {
        // Legacy scramble
        //scrambleStr = "clock";
        //scrambleState = scramblers[scrambleStr].getRandomScramble();
        //currentScramble = scrambleState.scramble_string;
        
        scrambleStr = "other";
        var str = "";
        for (var i = 0; i < 14; i++) {
            str += "(";
            for (var j = 0; j < 4; j++) {
                if (Math.random() < 0.5) {
                    str += "d";
                } else {
                    str += "U";
                }
            }
            var moves = [6,5,4,3,2,1,-1,-2,-3,-4,-5];
            str += ", " + moves[Math.floor(Math.random() * 11)];
            str += ", " + moves[Math.floor(Math.random() * 12)] + ") ";
        }
        scrambleState = {scramble_string:str};
        currentScramble = str;
    }

    // Add roation to 3x3x3 scramble
    function scramble3x3x3BLD() {
        scrambleStr = "333bf";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        
        // Orientate up face and then orient front face
        scrambleState.scramble_string += [" "," z"," z2"," z'"," x"," x'"][Math.floor(Math.random() * 6)];
        scrambleState.scramble_string += [" y", " y'", " y2", ""][Math.floor(Math.random() * 4)];
        currentScramble = scrambleState.scramble_string;
    }

    function scrambleNone() {
        scrambleStr = "none";
        scrambleState = {scramble_string:""};
        currentScramble = "";
    }
    
    // Use random move to create a scramble for NxNxN puzzles
    function scrambleNxNxN(n,length) {
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
        
        scrambleStr = "" + n + n + n;
        scrambleState = {scramble_string:str};
        currentScramble = str;    
    }
    
    // Scramble for 2x2x2 to 5x5x5 relay
    function scramble2to5Relay() {
        var str = "(2x2x2) " + scramblers["222"].getRandomScramble().scramble_string + "<br>";
        str += "(3x3x3) " + scramblers["333"].getRandomScramble().scramble_string + "<br>";
        str += "(4x4x4) " + scramblers["444"].getRandomScramble().scramble_string + "<br>";
        str += "(5x5x5) " + scramblers["555"].getRandomScramble().scramble_string;
        
        scrambleStr = "relay";
        scrambleState.scramble_string = str;
        currentScramble = str;
    }
    
    // Scramble for 2x2x2 to 7x7x7 relay
    function scramble2to7Relay() {
        var str = "(2x2x2) " + scramblers["222"].getRandomScramble().scramble_string + "<br>";
        str += "(3x3x3) " + scramblers["333"].getRandomScramble().scramble_string + "<br>";
        str += "(4x4x4) " + scramblers["444"].getRandomScramble().scramble_string + "<br>";
        str += "(5x5x5) " + scramblers["555"].getRandomScramble().scramble_string + "<br>";
        str += "(6x6x6) " + scramblers["666"].getRandomScramble().scramble_string + "<br>";
        str += "(7x7x7) " + scramblers["777"].getRandomScramble().scramble_string;
        
        scrambleStr = "relay";
        scrambleState.scramble_string = str;
        currentScramble = str;
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
        return currentScramble;
    }
    
    function getCurrentScrambler() {
        return currentScrambler;
    }
    
    function setCurrentScrambler(s) {
        currentScrambler = s;
        scrambleSelect.value = s;
    }
    
    function returnScrambleType() {
        return scrambleStr;
    }

    return {
        currentScramble:returnCurrentScramble,
        scramble:scramble,
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
    }
}()