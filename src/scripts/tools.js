// tools.js
// Provides tools, graphs and drawn scrambles
// Block Keeper
// Created by Dallas McNeil


var toolSelect = document.getElementById("toolSelect")
var tool = document.getElementById("tool")
var canvas = document.getElementById("toolCanvas")
var ctx = canvas.getContext("2d")

var mainColour = themeColours[0][5]
var secondColour = themeColours[0][4]

var colours = ["#F20","#5F0","#0060FF"]

// Update Tools based on new session data or scramble
function updateTool() {
    if (preferencesInterface.theme.value == "custom") {
        mainColour = readTheme()[5]
        secondColour = readTheme()[4]
    } else {
        mainColour = themeColours[preferencesInterface.theme.value][5]
        secondColour = themeColours[preferencesInterface.theme.value][4]
    }
    
    if (toolSelect.value == "none") {
        $("#tool").hide()
        return
    } else {
        $("#tool").show()
    }
    
    if (toolSelect.value == "sessionTrend") {
        sessionTrend()
    } else if (toolSelect.value == "eventTrend") {
        eventTrend()
    } else if (toolSelect.value == "distribution") {
        distribution()
    } else if (toolSelect.value == "scramble") {
        drawScramble()
        return
    }  
    hideScramble()
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
    } else {
        divide = 10
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

// Draw a trendline of current session
function sessionTrend() {
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
function eventTrend() {
    
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
    var dis = rangeForTimes(means.concat(bests))
    
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
        
        if (means[i] != -1) {
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
        if (bestAo5[i] != -1) {
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
function distribution() {
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
