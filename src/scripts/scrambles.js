// scramble.js
// Wrapper for scrambling functions
// Block Keeper
// Created by Dallas McNeil

var scramble = function() {
    
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

    // All scramblers and which on is currently being used
    var currentScrambler = "Recommended";
    var scrambleOptions = {
        "Recommended":scrambleRecommended,
        "Custom...":scrambleCustom,
        "3x3x3":scramble3x3x3,
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
        "3x3x3 BLD":scramble3x3x3BLD,
        "8x8x8":function(){scrambleNxNxN(8,100)},
        "9x9x9":function(){scrambleNxNxN(9,120)},
        "10x10x10":function(){scrambleNxNxN(10,140)},
        "11x11x11":function(){scrambleNxNxN(11,160)},
        "None":scrambleNone
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
        scrambleStr = "clock";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        currentScramble = scrambleState.scramble_string;
    }

    // Add roation to
    function scramble3x3x3BLD() {
        scrambleStr = "333bf";
        scrambleState = scramblers[scrambleStr].getRandomScramble();
        scrambleState.scramble_string += [" x", " x'", " x2", ""][Math.floor(Math.random() * 4)];
        scrambleState.scramble_string += [" z", " z'", " z2", ""][Math.floor(Math.random() * 4)];
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

        for (var i = 0; i < n / 2; i++) {
            moves.push(i+"R");
            moves.push(i+"L");
            moves.push(i+"F");
            moves.push(i+"B");
            moves.push(i+"U");
            moves.push(i+"D");
        }

        var finalMoves = moves;
        for (var m = 0; i < moves.length; i++) {
            finalMoves.push(moves[m] + "'");
            finalMoves.push(moves[m] + "2");
        }

        var s = "";
        for (var i = 0; i < length; i++) {
            s += finalMoves[Math.floor(Math.random() * finalMoves.length)] + " ";
        }
        scrambleStr = "" + n + n + n;
        scrambleState = {scramble_string:""};
        currentScramble = s;
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
        setScramblerOptions:setScramblerOptions
    }
}()