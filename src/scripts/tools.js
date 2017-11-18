// tools.js
// Provides tools, graphs and drawn scrambles
// Block Keeper
// Created by Dallas McNeil


var toolSelect = document.getElementById("toolSelect")
var tools = document.getElementById("tools")
var canvases = []
var toolTypes = []
var toolOptions = []

var mainColour = themeColours[0][5]
var secondColour = themeColours[0][4]

var colours = ["#F20","#5F0","#0060FF"]

function deleteTool(index) {
    tools.removeChild(canvases[index].parentNode)
    toolSelect.options.add(toolOptions[index])
    canvases.splice(index,1)
    toolTypes.splice(index,1)
    toolOptions.splice(index,1)
    $("#toolSelect").html($("#toolSelect option").sort(function (a, b) {
        if (a.text == b.text) {
            return 0
        } else if (a.text < b.text) {
            return -1
        } else {
            return 1
        }
    }))
}

function addTool() {
    var tool = document.createElement("div"); 
    toolTypes.push(toolSelect.value)
    tool.className = "tool"
    var toolClose = document.createElement("button"); 
    toolClose.className = "cross closeTool"
    toolClose.title = "Remove Tool"
    toolClose.onclick = function() {
        for (var i=0;i<tools.children.length;i++) {
            if (tools.children[i] === tool) {
                deleteTool(i)
                break
            }
        }
    }
    tool.appendChild(toolClose)
    
    var toolCanvas
    if (toolSelect.value == "scramble") {
        var toolCanvas = document.createElement("div")
    } else if (toolSelect.value == "metronome") {
        var toolCanvas = document.createElement("div");
        var startStopButton = document.createElement("button")
        startStopButton.onclick = startStopMetronome
        startStopButton.id = "metronomeStartStopButton"
        startStopButton.innerHTML = "Start"
        var BPMSlider = document.createElement("input")
        BPMSlider.type = "range"
        BPMSlider.min = "20"
        BPMSlider.max = "240"
        BPMSlider.value = preferences.metronomeBPM+""
        BPMSlider.id = "metronomeBPMSlider"
        var BPMLabel = document.createElement("p")
        BPMLabel.id = "metronomeBPMLabel"
        BPMLabel.innerHTML = preferences.metronomeBPM+"<span style='font-size:15px'>BPM</span>"
        BPMSlider.oninput = function () {
            BPMLabel.innerHTML = BPMSlider.value+"<span style='font-size:15px'>BPM</span>"
        }
        BPMSlider.onchange = function () {
            preferences.metronomeBPM = BPMSlider.value
            savePreferences()
        }
        toolCanvas.appendChild(startStopButton)
        toolCanvas.appendChild(BPMLabel)
        toolCanvas.appendChild(BPMSlider)
    } else {
        var toolCanvas = document.createElement("canvas")
        toolCanvas.width = 300*2
        toolCanvas.height = 200*2
        toolCanvas.style.width = "300px"
        toolCanvas.style.height = "200px"
        toolCanvas.getContext("2d").scale(2,2)
    }
    
    tool.appendChild(toolCanvas)
    canvases.push(toolCanvas)
    tools.appendChild(tool)
    var option = 0;
    for (var i=0;i<toolSelect.options.length;i++) {
        if (toolSelect.options[i].value == toolSelect.value) {
            option = i
        }
    }
    toolOptions.push(toolSelect.options[option])
    toolSelect.remove(option)
    updateTool()
}

// Update Tools based on new session data or scramble
function updateTool() {
    if (preferencesInterface.theme.value == "custom") {
        mainColour = readTheme()[5]
        secondColour = readTheme()[4]
    } else {
        mainColour = themeColours[preferencesInterface.theme.value][5]
        secondColour = themeColours[preferencesInterface.theme.value][4]
    }
    
    for (var i=0;i<canvases.length;i++) {
        if (toolTypes[i] == "sessionTrend") {
            var ctx = canvases[i].getContext("2d")
            sessionTrend(ctx)
        } else if (toolTypes[i] == "eventTrend") {
            var ctx = canvases[i].getContext("2d")
            eventTrend(ctx)
        } else if (toolTypes[i] == "distribution") {
            var ctx = canvases[i].getContext("2d")
            distribution(ctx)
        } else if (toolTypes[i] == "scramble") {
            drawScramble(canvases[i])
        } else if (toolTypes[i] == "eventStats") {
            var ctx = canvases[i].getContext("2d")
            eventStats(ctx)
        }
    }
}

function setupTools(list) {
    for (var i=0;i<list.length;i++) {
        toolSelect.value = list[i]
        addTool()
    }
} 

var metronomeID
var metronomePlaying = false
var clickSound = new Audio("sounds/click.wav")

function startStopMetronome() {
    if (metronomePlaying) {
        metronomePlaying = false
        clearInterval(metronomeID)
        $("#metronomeStartStopButton")[0].innerHTML = "Start"
    } else {
        metronomePlaying = true
        metronomeID = setInterval(function() {
            clickSound.play()
        },60000/$("#metronomeBPMSlider")[0].value)
        $("#metronomeStartStopButton")[0].innerHTML = "Stop"
    }
}

// Shortcut to get current session times
function sessionTimes() {
    return puzzles[currentPuzzle].sessions[currentSession].records
}

// Get range, including min max and segments, for times
function rangeForTimes(times) {
    var raw = times.sort(function(a,b) {return a-b})
    var min = raw[0]
    var max = raw[raw.length-1]
    var range = max-min

    var divide = 0
    
    if (range <= 1) {
        divide = 0.125
    } else if (range <= 2) {
        divide = 0.25
    } else if (range <= 4) {
        divide = 0.5
    } else if (range <= 8) {
        divide = 1
    } else if (range <= 16) {
        divide = 2
    } else if (range <= 40) {
        divide = 5
    } else if (range <= 80) {
        divide = 10
    } else if (range <= 120) {
        divide = 15
    } else if (range <= 160) {
        divide = 20
    } else if (range <= 240) {
        divide = 30
    } else {
        divide = 60
    }
    var fmin = Math.floor(min/divide)*divide
    var fmax = Math.ceil(max/divide)*divide
    var segments = (fmax-fmin)/divide
    return {range:fmax-fmin,divide:divide,segments:segments,max:fmax,min:fmin}
}

// Extract times from records, taking into account results of records
function extractTimes(records) {
    var times = []
    for (var i=0;i<records.length;i++) {
        if (records[i].result == "OK") {
            times.push(records[i].time)
        } else if (records[i].result == "+2") {
            times.push(records[i].time+2)
        } else if (records[i].result == "DNF") {
            times.push(-1)    
        }
    }
    return times
}

function eventStats(ctx) {
    ctx.clearRect(0,0,300,200)
    ctx.strokeStyle = secondColour
    ctx.fillStyle = mainColour
    ctx.lineWidth = 1
    ctx.font = "20px workSansBold";
    ctx.textAlign = "right";
     
    ctx.fillText("Time:",80,60) 
    ctx.fillText("Mo3:",80,90) 
    ctx.fillText("Ao5:",80,120) 
    ctx.fillText("Ao12:",80,150) 
    ctx.fillText("Mean:",80,180) 
    
    ctx.textAlign = "left";
    ctx.fillText("Current",100,30)
    ctx.fillText("Best",200,30)
    ctx.font = "20px workSans";

    var stime = -2
    var smo3 = -2
    var sao5 = -2
    var sao12 = -2
    var smean = -2
      
    var ctime = -2
    var cmo3 = -2
    var cao5 = -2
    var cao12 = -2
    var cmean = -2 
    
    for (var s=0;s<puzzles[currentPuzzle].sessions.length;s++) {
        var time = -2
        var mo3 = -2
        var ao5 = -2
        var ao12 = -2
        var mean = meanTimes(extractTimes(puzzles[currentPuzzle].sessions[s].records).filter(function (t){return t!=-1}))
        if (mean==-1) {
            mean = -2
        }
        
        var rtime = -2
        var rmo3 = -2
        var rao5 = -2
        var rao12 = -2
        
        for (var r=0;r<puzzles[currentPuzzle].sessions[s].records.length;r++) {
            rtime = extractTimes([puzzles[currentPuzzle].sessions[s].records[r]])[0]
            if ((rtime<time||time==-2||time==-1)&&rtime!=-2&&rtime!=-1) {
                time = rtime
            }

            if (r>1) {
                rmo3 = meanTimes(extractTimes(puzzles[currentPuzzle].sessions[s].records.slice(r-2,r+1)))
                if ((rmo3 < mo3||mo3==-2||mo3==-1)&&(rmo3!=-2&&rmo3!=-1)) {
                    mo3 = rmo3
                 }
            }
            if (r>3) {
                rao5 = averageTimes(extractTimes(puzzles[currentPuzzle].sessions[s].records.slice(r-4,r+1)))
                if ((rao5 < ao5||ao5==-2||ao5==-1)&&(rao5!=-2&&rao5!=-1)) {
                    ao5 = rao5
                }
            }
            if (r>10) {
                rao12 = averageTimes(extractTimes(puzzles[currentPuzzle].sessions[s].records.slice(r-11,r+1)))
                if ((rao12 < ao12||ao12==-2||ao12==-1)&&(rao12!=-2&&rao12!=-1)) {
                    ao12 = rao12
                }
            }
        }
        if (s == currentSession) {
            ctime = rtime
            cmo3 = rmo3
            cao5 = rao5
            cao12 = rao12
            cmean = mean
        }
        
        if ((time<stime||stime==-2||stime==-1)&&time!=-2) {
            stime = time
        }
        if ((mo3<smo3||smo3==-2||stime==-1)&&mo3!=-2) {
            smo3 = mo3
        }
        if ((ao5<sao5||sao5==-2||stime==-1)&&ao5!=-2) {
            sao5 = ao5
        }
        if ((ao12<sao12||sao12==-2||stime==-1)&&ao12!=-2) {
            sao12 = ao12
        }
        if ((mean<smean||smean==-2)&&(mean!=-2)) {
            smean = mean
        }
    }
    
    if (stime==ctime) {
        ctx.fillStyle = "#00FF00"
    } else {
        ctx.fillStyle = mainColour
    }
    if (ctime==-2) {
        ctx.fillStyle = mainColour
        ctx.fillText("-",100,60) 
    } else if (ctime==-1) {
        ctx.fillStyle = mainColour
        ctx.fillText("DNF",100,60) 
    } else {
        ctx.fillText(formatTime(ctime),100,60) 
    }
    if (stime==-2) {
        ctx.fillStyle = mainColour
        ctx.fillText("-",200,60) 
    } else if (stime==-1) {
        ctx.fillStyle = mainColour
        ctx.fillText("DNF",200,60) 
    } else {
        ctx.fillText(formatTime(stime),200,60) 
    }
    
    if (Math.abs(smo3-cmo3)<0.001) {
        ctx.fillStyle = "#00FF00"
    } else {
        ctx.fillStyle = mainColour
    }
    if (cmo3==-2) {
        ctx.fillStyle = mainColour
        ctx.fillText("-",100,90) 
    } else if (cmo3==-1) {
        ctx.fillStyle = mainColour
        ctx.fillText("DNF",100,90) 
    } else {
        ctx.fillText(formatTime(cmo3),100,90) 
    }
    if (smo3==-2) {
        ctx.fillStyle = mainColour
        ctx.fillText("-",200,90) 
    } else if (smo3==-1) {
        ctx.fillStyle = mainColour
        ctx.fillText("DNF",200,90) 
    } else {
        ctx.fillText(formatTime(smo3),200,90) 
    }
    
    if (Math.abs(sao5-cao5)<0.001) {
        ctx.fillStyle = "#00FF00"
    } else {
        ctx.fillStyle = mainColour
    }
    if (cao5==-2) {
        ctx.fillStyle = mainColour
        ctx.fillText("-",100,120) 
    } else if (cao5==-1) {
        ctx.fillStyle = mainColour
        ctx.fillText("DNF",100,120) 
    } else {
        ctx.fillText(formatTime(cao5),100,120) 
    }
    if (sao5==-2) {
        ctx.fillStyle = mainColour
        ctx.fillText("-",200,120) 
    } else if (sao5==-1) {
        ctx.fillStyle = mainColour
        ctx.fillText("DNF",200,120) 
    } else {
        ctx.fillText(formatTime(sao5),200,120) 
    }
    
    if (Math.abs(sao12-cao12)<0.001) {
        ctx.fillStyle = "#00FF00"
    } else {
        ctx.fillStyle = mainColour
    }
    if (cao12==-2) {
        ctx.fillStyle = mainColour
        ctx.fillText("-",100,150) 
    } else if (cao12==-1) {
        ctx.fillStyle = mainColour
        ctx.fillText("DNF",100,150) 
    } else {
        ctx.fillText(formatTime(cao12),100,150) 
    }
    if (sao12==-2) {
        ctx.fillStyle = mainColour
        ctx.fillText("-",200,150) 
    } else if (sao12==-1) {
        ctx.fillStyle = mainColour
        ctx.fillText("DNF",200,150) 
    } else {
        ctx.fillText(formatTime(sao12),200,150) 
    }
    
    if (Math.abs(smean-cmean)<0.001) {
        ctx.fillStyle = "#00FF00"
    } else {
        ctx.fillStyle = mainColour
    }
    if (cmean==-2) {
        ctx.fillStyle = mainColour
        ctx.fillText("-",100,180) 
    } else {
        ctx.fillText(formatTime(cmean),100,180) 
    }
    if (smean==-2) {
        ctx.fillStyle = mainColour
        ctx.fillText("-",200,180) 
    } else if (smean==-1) {
        ctx.fillStyle = mainColour
        ctx.fillText("DNF",200,180) 
    } else {
        ctx.fillText(formatTime(smean),200,180) 
    }
  
}

// Draw a trendline of current session
function sessionTrend(ctx) {
    ctx.clearRect(0,0,300,200)
    
    var times = sessionTimes()
    var dis = rangeForTimes(rawTimes(times))
    
    ctx.strokeStyle = secondColour
    ctx.fillStyle = mainColour
    ctx.lineWidth = 1
    ctx.font = "12px workSans";
    ctx.textAlign = "center";
    
    for (var i = 0;i<dis.segments+1;i++) {
        ctx.beginPath()
        ctx.moveTo(50,i*(160/dis.segments)+10)
        ctx.lineTo(290,i*(160/dis.segments)+10)
        ctx.stroke()
        ctx.fillText(formatTime((dis.max-(dis.divide*i))),25,i*(160/dis.segments)+14)   
    }
    
    ctx.strokeStyle = mainColour
    ctx.lineWidth = 2
    ctx.beginPath()
    for (var i = 0;i<times.length;i++) {
        if (times[i].result == "OK" || times[i].result == "+2") {
            var x = 50+(i*(240/(times.length-1)))
            var y = 170-(((times[i].time-dis.min)/dis.range)*160)
            if (i==0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }
    }
    ctx.stroke()
    
    // This code block shows up 3 times in a row, it would be a good candidate as a function
    ctx.beginPath()
    ctx.strokeStyle = colours[0]
    for (var i = 2;i<times.length;i++) {
        var mean = meanTimes(extractTimes(times.slice(i-2,i+1)))
        if (mean != -1) {
            var x = 50+(i*(240/(times.length-1)))
            var y = 170-(((mean-dis.min)/dis.range)*160)
            if (i==2) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }
    }
    ctx.stroke()
    
    ctx.beginPath()
    ctx.strokeStyle = colours[1]
    for (var i = 4;i<times.length;i++) {
        var mean = averageTimes(extractTimes(times.slice(i-4,i+1)))
        if (mean != -1) {
            var x = 50+(i*(240/(times.length-1)))
            var y = 170-(((mean-dis.min)/dis.range)*160)
            if (i==4) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }
    }
    ctx.stroke()
    
    ctx.beginPath()
    ctx.strokeStyle = colours[2]
    for (var i = 11;i<times.length;i++) {
        var mean = averageTimes(extractTimes(times.slice(i-11,i+1)))
        if (mean != -1) {
            var x = 50+(i*(240/(times.length-1)))
            var y = 170-(((mean-dis.min)/dis.range)*160)
            if (i==11) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }
    }
    ctx.stroke()
    
    ctx.fillStyle = mainColour
    ctx.fillText("Time",100,190) 
    ctx.fillStyle = colours[0]
    ctx.fillText("Mo3",150,190) 
    ctx.fillStyle = colours[1]
    ctx.fillText("Ao5",200,190) 
    ctx.fillStyle = colours[2]
    ctx.fillText("Ao12",250,190)  
    
    if (times.length == 0) {
        ctx.font = "20px workSans";
        ctx.fillStyle = mainColour
        ctx.fillText("No Data",175,90)  
    }
    
    ctx.strokeStyle = mainColour
    ctx.lineWidth = 2
    
    ctx.beginPath()
    ctx.moveTo(50,10)
    ctx.lineTo(50,170)
    ctx.lineTo(290,170)
    ctx.stroke()
}

// Draw trendline for current event
function eventTrend(ctx) {
    
    ctx.clearRect(0,0,300,200)
    
    var sessions = puzzles[currentPuzzle].sessions
    var means = []
    var bests = []
    var bestAo5 = []
    for (var i = 0;i<sessions.length;i++) {    
        var b = extractTimes(sessions[i].records).filter(function(t) {return t!=-1})
        b = b.sort(function(a,b){return a-b})
        bests.push(b[0])
    
        var len = b.length;
        var total = 0;
        for (var j = 0;j<b.length;j++) {
            total+=b[j]
        }
        means.push(total/b.length)
        var ao5s = []
        
        for (var x = 0;x<sessions[i].records.length-4;x++) {    
            ao5s.push(averageTimes(extractTimes(sessions[i].records.slice(x,x+5))))
        }
        
        if (ao5s.length==0){
            bestAo5.push(-1)
        } else {
            bestAo5.push(ao5s.sort(function(a,b){return a-b})[0])
        }
    }
    
    var dis = rangeForTimes(means.concat(bests).filter(function(n){return !isNaN(n)&&n}))
    
    ctx.strokeStyle = secondColour
    ctx.fillStyle = mainColour
    ctx.lineWidth = 1
    ctx.font = "12px workSans";
    ctx.textAlign = "center";
    
    for (var i = 0;i<dis.segments+1;i++) {
        ctx.beginPath()
        ctx.moveTo(50,i*(160/dis.segments)+10)
        ctx.lineTo(290,i*(160/dis.segments)+10)
        ctx.stroke()
        ctx.fillText(formatTime((dis.max-(dis.divide*i))),25,i*(160/dis.segments)+14)   
    }
    
    ctx.strokeStyle = colours[0]
    ctx.lineWidth = 2
    
    ctx.beginPath()
    for (var i = 0;i<means.length;i++) {
        
        if (means[i]!=-1) {
            if (i==0) {
                ctx.moveTo(50+(i*(240/(means.length-1))),(170-(((means[i]-dis.min)/dis.range)*160)))
            } else {
                ctx.lineTo(50+(i*(240/(means.length-1))),(170-(((means[i]-dis.min)/dis.range)*160)))
            }
        }
    }
    ctx.stroke()
    
    ctx.beginPath()
    ctx.strokeStyle = colours[1]
    for (var i = 0;i<bestAo5.length;i++) {
        if (bestAo5[i]!=-1) {
            if (i==0) {
                ctx.moveTo(50+(i*(240/(bestAo5.length-1))),(170-(((bestAo5[i]-dis.min)/dis.range)*160)))
            } else {
                ctx.lineTo(50+(i*(240/(bestAo5.length-1))),(170-(((bestAo5[i]-dis.min)/dis.range)*160)))
            }
        }
    }
    ctx.stroke()
    
    ctx.beginPath()
    ctx.strokeStyle = colours[2]

    for (var i = 0;i<bests.length;i++) {
        if (bests[i] != -1) {
            if (i==0) {
                ctx.moveTo(50+(i*(240/(bests.length-1))),(170-(((bests[i]-dis.min)/dis.range)*160)))
            } else {
                ctx.lineTo(50+(i*(240/(bests.length-1))),(170-(((bests[i]-dis.min)/dis.range)*160)))
            }
        }
    }
    ctx.stroke()
    
    ctx.fillStyle = colours[0]
    ctx.fillText("Mean Time",100,190) 
    ctx.fillStyle = colours[1]
    ctx.fillText("Best Ao5",175,190) 
    ctx.fillStyle = colours[2]
    ctx.fillText("Best Time",250,190) 

    if (means.filter(Boolean).length == 0) {
        ctx.font = "20px workSans";
        ctx.fillStyle = mainColour
        ctx.fillText("No Data",175,90) 
    }
    
    ctx.strokeStyle = mainColour
    ctx.lineWidth = 2
    
    ctx.beginPath()
    ctx.moveTo(50,10)
    ctx.lineTo(50,170)
    ctx.lineTo(290,170)
    ctx.stroke()
}

// Draw distribution of current session
function distribution(ctx) {
    ctx.clearRect(0,0,300,200)

    var times = sessionTimes()
    var dis = rangeForTimes(rawTimes(times))
    var totals = []
    
    for (var s = 0;s<dis.segments;s++) {
        totals.push(0)
    }
    
    ctx.strokeStyle = secondColour
    ctx.fillStyle = mainColour 
    ctx.lineWidth = 1
    for (var s = 0;s<dis.segments;s++) {
        var leftBound = (dis.divide*s) + dis.min
        var rightBound = (dis.divide*(s+1)) + dis.min
        for (var i = 0;i<times.length;i++) {
            if (leftBound <= times[i].time && times[i].time < rightBound) {
                totals[s]++
            }
        }
    }
    ctx.strokeStyle = mainColour 
    ctx.lineWidth = 2
    ctx.font = "12px workSans";
    ctx.textAlign = "center";
    
    var max = Math.max.apply(null, totals);
    var width = (270/dis.segments) 
    
    for (var i = 0;i<dis.segments+1;i++) {
        
        if (i!=dis.segments) {
            var height = 120*(totals[i]/max)

            ctx.fillStyle = secondColour
            ctx.fillRect(15+(i*width),140-(height),width,height)
            ctx.strokeRect(15+(i*width),140-(height),width,height)
            ctx.textAlign = "center";
                      
            ctx.fillStyle = mainColour 
            ctx.font = "18px workSans"
            ctx.fillText(totals[i],(i+0.5)*(270/dis.segments)+15,130) 
            
        }
        ctx.fillStyle = mainColour 
        ctx.beginPath()
        ctx.stroke()
        ctx.font = "12px workSans"
        ctx.textAlign = "right";
        ctx.beginPath()
        ctx.moveTo((i)*(270/dis.segments)+15,140)
        ctx.lineTo((i)*(270/dis.segments)+15,145)
        ctx.stroke()
    
        
        ctx.save();
        ctx.translate((i)*(270/dis.segments)+19,150)
        
        ctx.rotate(Math.PI*1.5);
        
        ctx.fillText(formatTime((dis.min+(dis.divide*i))),0,0)
        ctx.restore()
    }
    
    if (times.length == 0) {
        ctx.font = "20px workSans";
        ctx.fillStyle = mainColour
        ctx.fillText("No Data",150,80) 
    }
    
    ctx.strokeStyle = mainColour 
    ctx.lineWidth = 2
    
    ctx.beginPath()
    ctx.moveTo(15,140)
    ctx.lineTo(285,140)
    ctx.stroke()
    
}
