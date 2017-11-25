// scramble.js
// Wrapper for scrambling functions
// Block Keeper
// Created by Dallas McNeil

var scrambleStr = ""
var currentScramble = ""
var scrambleText = document.getElementById("scramble")
var scrambleState = {scramble_string:""}
var scrambleImage = document.getElementById("scrambleImage")
var scrambleSelect = document.getElementById("scramblerSelect")
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

$("#dialogScramble").dialog({
    autoOpen : false,
    modal : true,
    show:"fade",
    hide:"fade",
    position: {
        my:"center",
        at:"center",
        of:"#background"
    },
    width: 484,
    height: 510
}).on('keydown',function(evt) {
    if (evt.keyCode === $.ui.keyCode.ESCAPE) {
        closeScramble()
    }     
    evt.stopPropagation();
});

scrambleText.onclick = function() {
    if (!preferencesOpen) {
        $("#dialogScramble").dialog("open")
        $("#stats").addClass("disabled")
        $("#timer").addClass("disabled")
        $("#scramble").addClass("disabled")
        $("#preferencesButton").addClass("disabled")
        $("#stats").prop("disabled",true)
        $("#timer").prop("disabled",true)
        $("#scramble").prop("disabled",true)
        $("#preferencesButton").prop("disabled",true)
        $("#puzzleSelect").prop('disabled', true)
        $("#sessionSelect").prop('disabled', true)
        $("#sessionButton").prop('disabled', true)
        $("#toolSelect").prop('disabled', true)
        $("#tools").prop('disabled', true)
        $("#toolSelect").addClass("disabled")
        $("#tools").addClass("disabled")
        $("#addToolButton").prop('disabled', true)
        $("#addToolButton").addClass("disabled")
        preferencesOpen = true;
    }
}

function closeScramble() {
    $("#dialogScramble").dialog("close")
    $("#stats").removeClass("disabled")
    $("#timer").removeClass("disabled")
    $("#scramble").removeClass("disabled")
    $("#preferencesButton").removeClass("disabled")
    $("#stats").prop("disabled",false)
    $("#timer").prop("disabled",false)
    $("#scramble").prop("disabled",false)
    $("#preferencesButton").prop("disabled",false)
    $("#puzzleSelect").prop('disabled', false)
    $("#sessionSelect").prop('disabled', false)
    $("#sessionButton").prop('disabled', false)
    $("#toolSelect").prop('disabled', false)
    $("#tools").prop('disabled', false)
    $("#toolSelect").removeClass("disabled")
    $("#tools").removeClass("disabled")
    $("#addToolButton").prop('disabled', false)
    $("#addToolButton").removeClass("disabled")
    preferencesOpen = false;
    scramble()
}

var currentScrambler = "Recommended"
var scrambleOptions = {
    "Recommended":scrambleRecommended,
    "3x3x3":scramble3x3,
    "2x2x2":scramble2x2,
    "4x4x4":scramble4x4,
    "5x5x5":scramble5x5,
    "Pyraminx":scramblePyraminx,
    "Skewb":scrambleSkewb,
    "Megaminx":scrambleMegaminx,
    "Square-1":scrambleSquare1,
    "Clock":scrambleClock,
    "6x6x6":scramble6x6,
    "7x7x7":scramble7x7,               
    "3x3x3 OH":scramble3x3,
    "3x3x3 BLD":scramble3x3BLD,
    "4x4x4 BLD":scramble4x4,
    "5x5x5 BLD":scramble5x5,
    "3x3x3 FT":scramble3x3,
    "None":scrambleNone
}

for (var i=0;i<Object.keys(scrambleOptions).length;i++) {
    var t = Object.keys(scrambleOptions)[i]
    var o = document.createElement("option")
    o.value = t
    o.text = t
    if (i==0) {
        o.selected = true
    }
    scrambleSelect.add(o)
}

// Generate a new scramble and display it
function scramble() {
    currentScrambler = scrambleSelect.value
    if (scrambleOptions[currentScrambler] != undefined) {
        scrambleOptions[currentScrambler]()
        scrambleText.innerHTML = currentScramble    
    } else {
        scrambleOptions["None"]()
    }
    scrambleText.innerHTML = currentScramble        
    updateTool()
}

function scrambleRecommended() {
    if (scrambleOptions[puzzles[currentPuzzle].name] != undefined) {
        scrambleOptions[puzzles[currentPuzzle].name]()
    } else {
        scrambleNone()
    }
}

// Draw the current scramble in the tool canvas
function drawScramble(ctx) {
    if (scramblers[scrambleStr] == undefined || (scrambleStr == "333mbf")) {
        ctx.innerHTML = ""
    } else {
        ctx.innerHTML = ""
        scramblers[scrambleStr].drawScramble(ctx, scrambleState.state, 300, 200);
    }
}

// Calls to get a scramble for each puzzle available
function scramble2x2() {
    scrambleStr = "222"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}

function scramble3x3() {
    scrambleStr = "333"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}

function scramble4x4() {
    scrambleStr = "444"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}

function scramble5x5() {
    scrambleStr = "555"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}

function scramble6x6() {
    scrambleStr = "666"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}

function scramble7x7() {
    scrambleStr = "777"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}

function scramblePyraminx() {
    scrambleStr = "pyram"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}

function scrambleSkewb() {
    scrambleStr = "skewb"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}
 
function scrambleMegaminx() {
    scrambleStr = "minx"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}

function scrambleSquare1() {
    scrambleStr = "sq1"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}

function scrambleClock() {
    scrambleStr = "clock"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    currentScramble = scrambleState.scramble_string
}

function scramble3x3BLD() {
    scrambleStr = "333bf"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    scrambleState.scramble_string+=[" x"," x'"," x2",""][Math.floor(Math.random()*4)];
    scrambleState.scramble_string+=[" z"," z'"," z2",""][Math.floor(Math.random()*4)];
    currentScramble = scrambleState.scramble_string
}
    
function scrambleNone() {
    scrambleStr = "none"
    scrambleState = {scramble_string:""}
    currentScramble = ""
}

function solveEOLine(scramble) {
    var s = scramble.replaceAll("R","X")
    s = s.replaceAll("L","R")
    s = s.replaceAll("X","L")
    s = s.replaceAll("D","X")
    s = s.replaceAll("U","D")
    s = s.replaceAll("X","U")
    return cubeSolver.EOLineSolver(s)
}
    
function solveCross(scramble) {
    var s = scramble.replaceAll("R","X")
    s = s.replaceAll("L","R")
    s = s.replaceAll("X","L")
    s = s.replaceAll("D","X")
    s = s.replaceAll("U","D")
    s = s.replaceAll("X","U")
    return cubeSolver.crossSolver(s)
}
    