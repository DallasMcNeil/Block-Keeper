// scramble.js
// Wrapper for scrambling functions
// Block Keeper
// Created by Dallas McNeil

var currentScramble = ""
var scrambleStr = "333"
var scrambleText = document.getElementById("scramble")
var scrambleState = {scramble_string:""}
var scrambleImage = document.getElementById("scrambleImage")

// Generate a new scramble and display it
function scramble() {
    if (puzzles[currentPuzzle].scramble != undefined) {
        puzzles[currentPuzzle].scramble()
        if (scrambleState.scramble_string != "") {
            scrambleText.innerHTML = scrambleState.scramble_string
            currentScramble = scrambleState.scramble_string
            if (scrambleState.state != undefined) {
                drawScramble()
                return
            }
        } else {
            currentScramble = ""
            scrambleText.innerHTML = ""
        }
    } else {
        currentScramble = ""
        scrambleText.innerHTML = "" 
    }
    hideScramble()
}

// Draw the current scramble in the tool canvas
function drawScramble() {
    if (scramblers[scrambleStr] == undefined || (scrambleStr == "333mbf")) {
        hideScramble()
    } else if (toolSelect.value == "scramble") {
        scrambleImage.innerHTML = ""
        ctx.clearRect(0,0,300,200)
        scrambleImage.style.display = "block"
        canvas.style.display = "none"
        scramblers[scrambleStr].drawScramble(scrambleImage, scrambleState.state, 300, 200);
    } else {
        scrambleImage.style.display = "none"
        canvas.style.display = "block"
    }
}

// Hide the scramble from the tool
function hideScramble() {
    scrambleImage.style.display = "none"
    canvas.style.display = "block"
}

// Calls to get a scramble for each puzzle available
function scramble2x2() {
    scrambleStr = "222"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}

function scramble3x3() {
    scrambleStr = "333"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}

function scramble4x4() {
    scrambleStr = "444"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}

function scramble5x5() {
    scrambleStr = "555"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}

function scramble6x6() {
    scrambleStr = "666"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}

function scramble7x7() {
    scrambleStr = "777"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}

function scramblePyraminx() {
    scrambleStr = "pyram"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}

function scrambleSkewb() {
    scrambleStr = "skewb"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}
 
function scrambleMegaminx() {
    scrambleStr = "minx"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}

function scrambleSquare1() {
    scrambleStr = "sq1"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}

function scrambleClock() {
    scrambleStr = "clock"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
}

function scramble3x3BLD() {
    scrambleStr = "333bf"
    scrambleState = scramblers[scrambleStr].getRandomScramble()
    scrambleState.scramble_string+=[" x"," x'"," x2",""][Math.floor(Math.random()*4)];
    scrambleState.scramble_string+=[" z"," z'"," z2",""][Math.floor(Math.random()*4)];
}
    
function scrambleNone() {
    scrambleStr = "Other"
    scrambleState = {scramble_string:""}
}
    
    