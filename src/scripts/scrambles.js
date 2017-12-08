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
    width: 408,
    height: 266
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
    "Custom...":scrambleCustom,
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
    "3x3x3 BLD":scramble3x3BLD,
    "8x8x8":function(){scrambleNxNxN(8,100)},
    "9x9x9":function(){scrambleNxNxN(9,120)},
    "10x10x10":function(){scrambleNxNxN(10,140)},
    "11x11x11":function(){scrambleNxNxN(11,160)},
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
    if (scrambleOptions[puzzles[currentPuzzle].scrambler] != undefined) {
        scrambleOptions[puzzles[currentPuzzle].scrambler]()
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

function scrambleCustom() {
    scrambleStr = "none"
    currentScramble = document.getElementById("customScramble").value
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

function scrambleNxNxN(n,length) {
    var moves = []
    if (n > 1) {
        moves.push("R")
        moves.push("F")
        moves.push("U")
    }
    if (n > 2) {
        moves.push("L")
        moves.push("B")
        moves.push("D")
    }
    
    for (var i=2;i<=(n/2);i++) {
        moves.push(i+"R")
        moves.push(i+"L")
        moves.push(i+"F")
        moves.push(i+"B")
        moves.push(i+"U")
        moves.push(i+"D")
    }
    
    var finalMoves = moves
    for (m in moves) {
        finalMoves.push(moves[m]+"'")
        finalMoves.push(moves[m]+"2")
    }
    
    var s = ""
    for (var i=0;i<length;i++) {
        s+=finalMoves[Math.floor(Math.random()*finalMoves.length)]+" "
    }
    scrambleStr = ""+n+n+n
    scrambleState = {scramble_string:""}
    currentScramble = s
}

// Length (RL), Depth (FB), Height (UD)
function scrambleLxMxN(l,m,n) {
    var RL = []
    var FB = []
    var UD = []
    if (l > 1) {
        RL.push("R")
    }
    if (m > 1) {
        FB.push("F")
    }
    if (n > 1) {
        UD.push("U")
    }
    
    if (l > 2) {
        RL.push("L")
    }
    if (m > 2) {
        FB.push("B")
    }
    if (n > 2) {
        UD.push("D")
    }
    
    for (var li=2;li<=(l/2);li++) {
        RL.push(li+"R")
        RL.push(li+"L")
    }
    for (var mi=2;mi<=(m/2);mi++) {
        FB.push(mi+"F")
        FB.push(mi+"B")
    }
    for (var ni=2;ni<=(n/2);ni++) {
        UD.push(ni+"U")
        UD.push(ni+"D")
    }
    
    console.log(RL)
    console.log(FB)
    console.log(UD)
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
    
function solveCross(scramble,type) {
    var s = formatScrambleForFace(scramble,type)
    return cubeSolver.crossSolver(s)
}

function solveEOLine(scramble,type) {
    var s = formatScrambleForFace(scramble,type)
    return cubeSolver.EOLineSolver(s)
}

function solveFirstBlock(scramble,type) {
    var s = formatScrambleForFace(scramble,type)
    return cubeSolver.firstBlockSolver(s)
}
    
function formatScrambleForFace(s,type) {
    // type = 1 = Yellow
    if (type==0) { 
        // Whitte
        s = s.replaceAll("R","X")
        s = s.replaceAll("L","R")
        s = s.replaceAll("X","L")
        s = s.replaceAll("D","X")
        s = s.replaceAll("U","D")
        s = s.replaceAll("X","U")
    } else if (type==2) { 
        // Red
        s = s.replaceAll("U","X")
        s = s.replaceAll("L","U")
        s = s.replaceAll("D","L")
        s = s.replaceAll("R","D")
        s = s.replaceAll("X","R")
    } else if (type==3) { 
        // Orange
        s = s.replaceAll("U","X")
        s = s.replaceAll("R","U")
        s = s.replaceAll("D","R")
        s = s.replaceAll("L","D")
        s = s.replaceAll("X","L")
    } else if (type==4) { 
        // Blue
        s = s.replaceAll("U","X")
        s = s.replaceAll("L","U")
        s = s.replaceAll("D","L")
        s = s.replaceAll("R","D")
        s = s.replaceAll("X","R")
        
        s = s.replaceAll("U","X")
        s = s.replaceAll("F","U")
        s = s.replaceAll("D","F")
        s = s.replaceAll("B","D")
        s = s.replaceAll("X","B")
    } else if (type==5) { 
        // Green
        s = s.replaceAll("U","X")
        s = s.replaceAll("R","U")
        s = s.replaceAll("D","R")
        s = s.replaceAll("L","D")
        s = s.replaceAll("X","L")
        
        s = s.replaceAll("U","X")
        s = s.replaceAll("B","U")
        s = s.replaceAll("D","B")
        s = s.replaceAll("F","D")
        s = s.replaceAll("X","F")
    }
    return s
}