// tools.js
// Provides tools, graphs and drawn scrambles
// Block Keeper
// Created by Dallas McNeil

var tools = function() {
    var toolSelect = document.getElementById("toolSelect");
    var tools = document.getElementById("tools");
    // Canvases, or elements to draw/place elemnts in
    var canvases = [];
    // The type of each tool in the list
    var toolTypes = [];
    // Tool options that have been removed
    var toolOptions = [];

    var mainColor = globals.themeColors[0][5];
    var secondColor = globals.themeColors[0][4];
    var colors = globals.toolColors;
    
    // Remove a tool from the list at index
    function deleteTool(index) {
        tools.removeChild(canvases[index].parentNode);
        toolSelect.options.add(toolOptions[index]);
        canvases.splice(index, 1);
        toolTypes.splice(index, 1);
        toolOptions.splice(index, 1);
        // Sort list of tools to add
        $("#toolSelect").html($("#toolSelect option").sort(function (a, b) {
            if (a.text === b.text) {
                return 0;
            } else if (a.text < b.text) {
                return -1;
            } else {
                return 1;
            }
        }))
    }
    
    // Add a tool to the bottom of the list based on tool select
    function addTool() {
        var tool = document.createElement("div"); 
        toolTypes.push(toolSelect.value);
        tool.className = "tool";
        var toolClose = document.createElement("button"); 
        toolClose.className = "cross closeTool";
        toolClose.title = "Remove Tool";
        toolClose.onclick = function() {
            for (var i=0;i<tools.children.length;i++) {
                if (tools.children[i] === tool) {
                    deleteTool(i);
                    break;
                }
            }
        }
        tool.appendChild(toolClose);

        var toolCanvas;
        if (toolSelect.value == "scramble") {
            var toolCanvas = document.createElement("div");
        } else if (toolSelect.value == "metronome") {
            var toolCanvas = document.createElement("div");
            var startStopButton = document.createElement("button");
            startStopButton.onclick = startStopMetronome;
            startStopButton.id = "metronomeStartStopButton";
            startStopButton.innerHTML = "Start";
            var BPMSlider = document.createElement("input");
            BPMSlider.type = "range";
            BPMSlider.min = "20";
            BPMSlider.max = "240";
            BPMSlider.value = preferences.metronomeBPM + "";
            BPMSlider.id = "metronomeBPMSlider";
            var BPMLabel = document.createElement("p");
            BPMLabel.id = "metronomeBPMLabel";
            BPMLabel.innerHTML = preferences.metronomeBPM + "<span style='font-size:15px'>BPM</span>";
            BPMSlider.oninput = function () {
                BPMLabel.innerHTML = BPMSlider.value + "<span style='font-size:15px'>BPM</span>";
            }
            BPMSlider.onchange = function () {
                preferences.metronomeBPM = BPMSlider.value;
                savePreferences();
            }
            toolCanvas.appendChild(startStopButton);
            toolCanvas.appendChild(BPMLabel);
            toolCanvas.appendChild(BPMSlider);
        } else {
            var toolCanvas = document.createElement("canvas");
            toolCanvas.width = 300 * 2;
            toolCanvas.height = 200 * 2;
            toolCanvas.style.width = "300px";
            toolCanvas.style.height = "200px";
            toolCanvas.getContext("2d").scale(2, 2);
        }

        tool.appendChild(toolCanvas);
        canvases.push(toolCanvas);
        tools.appendChild(tool);
        var option = 0;
        for (var i = 0; i < toolSelect.options.length; i++) {
            if (toolSelect.options[i].value === toolSelect.value) {
                option = i;
            }
        }
        toolOptions.push(toolSelect.options[option]);
        toolSelect.remove(option);
        updateTools();
    }

    // Update Tools based on new session data or scramble
    function updateTools() {
        if (preferencesInterface.theme.value === "custom") {
            mainColor = prefs.readTheme()[5];
            secondColor = prefs.readTheme()[4];
        } else {
            mainColor = globals.themeColors[preferencesInterface.theme.value][5];
            secondColor = globals.themeColors[preferencesInterface.theme.value][4];
        }

        for (var i = 0; i < canvases.length; i++) {
            if (toolTypes[i] === "sessionTrend") {
                var ctx = canvases[i].getContext("2d");
                sessionTrend(ctx);
            } else if (toolTypes[i] === "eventTrend") {
                var ctx = canvases[i].getContext("2d");
                eventTrend(ctx);
            } else if (toolTypes[i] === "distribution") {
                var ctx = canvases[i].getContext("2d");
                distribution(ctx);
            } else if (toolTypes[i] === "scramble") {
                scramble.drawScramble(canvases[i]);
            } else if (toolTypes[i] === "eventStats") {
                var ctx = canvases[i].getContext("2d");
                eventStats(ctx);
            } else if (toolTypes[i] === "crossSolver") {
                var ctx = canvases[i].getContext("2d");
                crossSolver(ctx);
            } else if (toolTypes[i] === "crossSolver") {
                var ctx = canvases[i].getContext("2d");
                EOLineSolver(ctx);
            } else if (toolTypes[i] === "EOLineSolver") {
                var ctx = canvases[i].getContext("2d");
                EOLineSolver(ctx);
            } else if (toolTypes[i] === "firstBlockSolver") {
                var ctx = canvases[i].getContext("2d");
                firstBlockSolver(ctx);
            }
        }
    }

    // Setup tool based on list of tool types
    function setupTools(list) {
        for (var i = 0; i < list.length; i++) {
            toolSelect.value = list[i]
            addTool()
        }
    } 

    var metronomeID;
    var metronomePlaying = false;
    var clickSound = new Audio("sounds/click.wav");

    function startStopMetronome() {
        if (metronomePlaying) {
            metronomePlaying = false;
            clearInterval(metronomeID);
            $("#metronomeStartStopButton")[0].innerHTML = "Start";
        } else {
            metronomePlaying = true;
            metronomeID = setInterval(function() {
                clickSound.play();
            }, 60000 / $("#metronomeBPMSlider")[0].value);
            $("#metronomeStartStopButton")[0].innerHTML = "Stop";
        }
    }

    // Get range, including min max and segments, for times when graphing
    function rangeForTimes(times) {
        var min = times.min();
        var max = times.max();
        var range = max - min;
        var divide = 1;

        if (range <= 1) {
            divide = 0.125;
        } else if (range <= 2) {
            divide = 0.25;
        } else if (range <= 4) {
            divide = 0.5;
        } else if (range <= 8) {
            divide = 1;
        } else if (range <= 16) {
            divide = 2;
        } else if (range <= 40) {
            divide = 5;
        } else if (range <= 80) {
            divide = 10;
        } else if (range <= 120) {
            divide = 15;
        } else if (range <= 160) {
            divide = 20;
        } else if (range <= 240) {
            divide = 30;
        } else {
            divide = 60;
        }
        var fmin = Math.floor(min / divide) * divide;
        var fmax = Math.ceil(max / divide) * divide;
        var segments = (fmax - fmin) / divide;
        return {range:fmax - fmin, divide:divide, segments:segments, max:fmax, min:fmin}
    }

    function eventStats(ctx) {
        var width = 300;
        var height = 200;
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = secondColor;
        ctx.fillStyle = mainColor;
        ctx.lineWidth = 1;
        ctx.font = "20px workSansBold";
        ctx.textAlign = "right";

        
        ctx.fillText("Time:", width * 0.25, height * 0.3);
        ctx.fillText("Mo3:", width * 0.25, height * 0.45); 
        ctx.fillText("Ao5:", width * 0.25, height * 0.6); 
        ctx.fillText("Ao12:", width * 0.25, height * 0.75); 
        ctx.fillText("Mean:", width * 0.25, height * 0.9);

        ctx.textAlign = "left";
        ctx.fillText("Current", width / 3, 30);
        ctx.fillText("Best", (2 * width) / 3, 30);
        ctx.font = "20px workSans"; 

        // No results, -2
        // Best times
        var stime = -2;
        var smo3 = -2;
        var sao5 = -2;
        var sao12 = -2;
        var smean = -2;

        // Current results
        var ctime = -2;
        var cmo3 = -2;
        var cao5 = -2;
        var cao12 = -2;
        var cmean = -2;

        for (var s = 0; s < events.getCurrentEvent().sessions.length; s++) {
            var times = extractTimes(events.getCurrentEvent().sessions[s].records);
            var time = -2;
            var mo3 = -2;
            var ao5 = -2;
            var ao12 = -2;
            var mean = meanTimes(removeDNFs(times));
            if (mean === -1) {
                mean = -2;
            }

            var rtime = -2;
            var rmo3 = -2;
            var rao5 = -2;
            var rao12 = -2;

            for (var r = 0; r < times.length; r++) {
                rtime = times[r];
                if ((rtime < time || time === -2 || time === -1) && rtime != -2 && rtime != -1) {
                    time = rtime;
                }

                if (r > 1) {
                    rmo3 = meanTimes(times.slice(r - 2, r + 1));
                    if ((rmo3 < mo3 || mo3 === -2 || mo3 === -1) && (rmo3 != -2 && rmo3 != -1)) {
                        mo3 = rmo3;
                     }
                }
                if (r > 3) {
                    rao5 = averageTimes(times.slice(r-4,r+1));
                    if ((rao5 < ao5 || ao5 === -2 || ao5 === -1) && (rao5 != -2 && rao5 != -1)) {
                        ao5 = rao5;
                    }
                }
                if (r > 10) {
                    rao12 = averageTimes(times.slice(r-11,r+1));
                    if ((rao12 < ao12 || ao12 === -2 || ao12 === -1) && (rao12 != -2 && rao12 != -1)) {
                        ao12 = rao12;
                    }
                }
            }
            if (s == events.currentSession()) {
                ctime = rtime;
                cmo3 = rmo3;
                cao5 = rao5;
                cao12 = rao12;
                cmean = mean;
            }

            if ((time < stime || stime === -2 || stime === -1) && time != -2) {
                stime = time;
            }
            if ((mo3 < smo3 || smo3 === -2 || stime == -1) && mo3 != -2) {
                smo3 = mo3;
            }
            if ((ao5 < sao5 || sao5 === -2 || stime === -1) && ao5 != -2) {
                sao5 = ao5;
            }
            if ((ao12 < sao12 || sao12 === -2 || stime === -1) && ao12 != -2) {
                sao12 = ao12;
            }
            if ((mean < smean || smean === -2) && (mean != -2)) {
                smean = mean;
            }
        }
        
        function drawTime(c,s,x,x2,y) {
            if (Math.abs(c - s) < 0.001) {
                ctx.fillStyle = "#00FF00";
            } else {
                ctx.fillStyle = mainColor;
            }
            if (c === -2) {
                ctx.fillStyle = mainColor;
                ctx.fillText("-", x, y);
            } else if (c === -1) {
                ctx.fillStyle = mainColor;
                ctx.fillText("DNF", x, y);
            } else {
                ctx.fillText(formatTime(c), x, y); 
            }
            
            if (s === -2) {
                ctx.fillStyle = mainColor;
                ctx.fillText("-", x2, y);
            } else if (s === -1) {
                ctx.fillStyle = mainColor;
                ctx.fillText("DNF", x2, y); 
            } else {
                ctx.fillText(formatTime(s), x2, y);
            }
        }

        drawTime(ctime, stime, width / 3, (2 * width) / 3, height * 0.3);
        drawTime(cmo3, smo3, width / 3, (2 * width) / 3, height * 0.45);
        drawTime(cao5, sao5, width / 3, (2 * width) / 3, height * 0.6);
        drawTime(cao12, sao12, width / 3, (2 * width) / 3, height * 0.75);
        drawTime(cmean, smean, width / 3, (2 * width) / 3, height * 0.9);
    }
    
    function drawTrendline(ctx, dis, times, len, a, color, width, height) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        for (var i = (a - 1); i < len; i++) {
            var t = -1;
            if (a === 1) {
                t = times[i];
            } else if (a < 5) {
                t = meanTimes(times.slice(i - (a - 1), i + 1));
            } else {
                t = averageTimes(times.slice(i - (a - 1), i + 1))
            }
            if (t != -1) {
                var x = (width / 6) + (i * ((width * 0.8) / (len- 1)));
                var y = (height * 0.85) - (((t - dis.min) / dis.range) * (height * 0.8));
                if (i == 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.stroke();
    }
    
    // Draw a trendline of current session
    function sessionTrend(ctx) {
        var width = 300;
        var height = 200;
        ctx.clearRect(0, 0, width, height);

        var times = extractTimes(events.getCurrentSession().records);
        
        if (removeDNFs(times).length < 2) {
            ctx.font = "20px workSans";
            ctx.fillStyle = mainColor
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("No Data", width / 2, height / 2);
            return;
        }
        var dis = rangeForTimes(removeDNFs(times));

        ctx.strokeStyle = secondColor;
        ctx.fillStyle = mainColor;
        ctx.lineWidth = 1;
        ctx.font = "12px workSans";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var graphHeight = height * 0.8;
        var margin = width * (1/30);
        for (var i = 0; i < dis.segments + 1; i++) {
            ctx.beginPath();
            ctx.moveTo(width / 6, i * (graphHeight / dis.segments) + margin);
            ctx.lineTo(width - margin, i * (graphHeight / dis.segments) + margin);
            ctx.stroke();
            ctx.fillText(formatTime((dis.max - (dis.divide * i))), width / 12, i * (graphHeight / dis.segments) + margin);   
        }
        ctx.lineWidth = 2;
        
        drawTrendline(ctx, dis, times, times.length, 1, mainColor, width, height);
        drawTrendline(ctx, dis, times, times.length, 3, colors[0], width, height);
        drawTrendline(ctx, dis, times, times.length, 5, colors[1], width, height);
        drawTrendline(ctx, dis, times, times.length, 12, colors[2], width, height);

        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = mainColor;
        ctx.fillText("Time", width / 3, height * 0.95); 
        ctx.fillStyle = colors[0];
        ctx.fillText("Mo3", width / 2, height * 0.95);
        ctx.fillStyle = colors[1];
        ctx.fillText("Ao5", width * (2 / 3), height * 0.95); 
        ctx.fillStyle = colors[2];
        ctx.fillText("Ao12", width * (5 / 6), height * 0.95);    

        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 6, margin);
        ctx.lineTo(width / 6, height * 0.85);
        ctx.lineTo(width - margin, height * 0.85);
        ctx.stroke();
    }

    // Draw trendline for current event
    function eventTrend(ctx) {
        var width = 300;
        var height = 200;
        ctx.clearRect(0, 0, width, height);

        var sessions = events.getCurrentEvent().sessions;
        if (events.getCurrentSession().records.length === 0) {
            ctx.font = "20px workSans";
            ctx.fillStyle = mainColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("No Data",width / 2, height / 2);
            return;
        }
        var means = [];
        var bests = [];
        var bestAo5 = [];
        for (var i = 0; i < sessions.length; i++) {   
            if (sessions[i].records.length === 0) {
                continue;
            }
            var times = removeDNFs(extractTimes(sessions[i].records));
            bests.push(times.min());
            if (bests[i] === undefined) {
                bests[i] = -1;
            }
            means.push(meanTimes(times));
            var ao5s = []
            for (var x = 0;x < sessions[i].records.length - 4; x++) {    
                ao5s.push(averageTimes(times.slice(x,x+5)));
            }
            if (ao5s.length === 0) {
                bestAo5.push(-1);
            } else {
                bestAo5.push(ao5s.min());
            }
        }
        var dis = rangeForTimes(removeDNFs(means.concat(bests.concat(bestAo5))));

        if (sessions.length < 2) {
            ctx.font = "20px workSans";
            ctx.fillStyle = mainColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("No Data", width / 2, height / 2);
            return;
        }
        ctx.strokeStyle = secondColor;
        ctx.fillStyle = mainColor;
        ctx.lineWidth = 1;
        ctx.font = "12px workSans";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        var graphHeight = height * 0.8;
        var margin = width * (1/30);
        for (var i = 0; i < dis.segments + 1; i++) {
            ctx.beginPath();
            ctx.moveTo(width / 6, i * (graphHeight / dis.segments) + margin);
            ctx.lineTo(width - margin, i * (graphHeight / dis.segments) + margin);
            ctx.stroke();
            ctx.fillText(formatTime((dis.max - (dis.divide * i))), width / 12, i * (graphHeight / dis.segments) + margin);   
        }
        
        ctx.lineWidth = 2;
        drawTrendline(ctx, dis, means, bests.length, 1, colors[0], width, height);
        drawTrendline(ctx, dis, bestAo5, bests.length, 1, colors[1], width, height);
        drawTrendline(ctx, dis, bests, bests.length, 1, colors[2], width, height);
        
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = colors[0];
        ctx.fillText("Mean Time", 100, 190);
        ctx.fillStyle = colors[1];
        ctx.fillText("Best Ao5", 175, 190);
        ctx.fillStyle = colors[2]
        ctx.fillText("Best Time", 250, 190); 

        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 6, margin);
        ctx.lineTo(width / 6, height * 0.85);
        ctx.lineTo(width - margin, height * 0.85);
        ctx.stroke();
    }

    // Draw distribution of current session
    function distribution(ctx) {
        var width = 300;
        var height = 200;
        ctx.clearRect(0, 0, width, height);

        var times = removeDNFs(extractTimes(events.getCurrentSession().records));
        if (times.length == 0) {
            ctx.font = "20px workSans";
            ctx.fillStyle = mainColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("No Data",width / 2, height / 2);
            return;
        }
        var dis = rangeForTimes(times);
        var totals = [];
        for (var s = 0; s < dis.segments ; s++) {
            totals.push(0);
            var leftBound = (dis.divide * s) + dis.min;
            var rightBound = (dis.divide * (s + 1)) + dis.min;
            for (var i = 0; i < times.length; i++) {
                if (leftBound <= times[i] && times[i] < rightBound) {
                    totals[s]++;
                }
            }
        }
        
        ctx.strokeStyle = secondColor;
        ctx.fillStyle = mainColor;
        ctx.strokeStyle = mainColor 
        ctx.lineWidth = 2;
        ctx.font = "12px workSans";
        ctx.textAlign = "center";

        var max = totals.max();
        var disWidth = ((width * 0.9) / dis.segments); 
        var baseline = height * 0.7;
        var margin = width * 0.05;
        for (var i = 0; i < dis.segments + 1; i++) {
            if (i !== dis.segments) {
                var disHeight = (height * 0.6) * (totals[i] / max);
                ctx.fillStyle = secondColor;
                ctx.fillRect(margin + (i * disWidth), baseline - disHeight, disWidth, disHeight);
                ctx.strokeRect(margin + (i * disWidth), baseline - disHeight, disWidth, disHeight);
                ctx.textAlign = "center";
                ctx.fillStyle = mainColor;
                ctx.font = "18px workSans";
                ctx.fillText(totals[i], ((i + 0.5) * disWidth) + margin, height * 0.65);
            }
            ctx.fillStyle = mainColor;
            ctx.beginPath();
            ctx.stroke();
            ctx.font = "12px workSans";
            ctx.textAlign = "right";
            ctx.beginPath();
            ctx.moveTo((i * disWidth) + margin, baseline);
            ctx.lineTo((i * disWidth) + margin, height * 0.725);
            ctx.stroke();
            
            ctx.save();
            ctx.translate((i * disWidth) + (margin*1.25), height * 0.75);

            ctx.rotate(Math.PI*1.5);

            ctx.fillText(formatTime((dis.min + (dis.divide * i))), 0, 0);
            ctx.restore();
        }

        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(15,140);
        ctx.lineTo(285,140);
        ctx.stroke();
    }

    // Shows first stage solutions for 3x3x3 scrambles
    var crossSolverID = 0;
    function crossSolver(ctx) {
        var width = 300;
        var height = 200;
        clearTimeout(crossSolverID);
        ctx.clearRect(0, 0, width, height);
        if (scramble.scrambleType() === "333") {
            ctx.strokeStyle = secondColor;
            ctx.fillStyle = mainColor;
            ctx.lineWidth = 1;
            ctx.font = "20px workSans";
            ctx.textAlign = "center";
            var UColors = [globals.cubeColors[4], mainColor,globals.cubeColors[1], globals.cubeColors[0], globals.cubeColors[3], globals.cubeColors[2]];
            var FColors = [globals.cubeColors[3], globals.cubeColors[3], globals.cubeColors[3], globals.cubeColors[3], globals.cubeColors[0], globals.cubeColors[0]];
            var DColors = [mainColor, globals.cubeColors[4], globals.cubeColors[0], globals.cubeColors[1], globals.cubeColors[2], globals.cubeColors[3]];
            
            crossSolverID = setTimeout(function() {    
                for (var i = 0; i < 6; i++) {
                    var str = "(UF):";
                    var x = width * 0.2;
                    ctx.textAlign = "right";
                    for (var s = str.length - 1; s >= 0; s--) {
                        var ch = str.charAt(s);
                        if (s === 1) {
                            ctx.fillStyle = UColors[i];
                        } else if (s === 2) {
                            ctx.fillStyle = FColors[i];
                        } else {
                            ctx.fillStyle = mainColor;
                        }
                        ctx.fillText(ch, x, height * ((30 * (1 + i)) / 200));
                        x -= ctx.measureText(ch).width;
                    }
                    ctx.textAlign = "left";
                    ctx.fillStyle = DColors[i];
                    ctx.fillText(scramble.solveCross(scramble.currentScramble(), i), width * (7 / 30), height * ((30 * (1 + i)) / 200));
                }
            }, 0)
        }
    }

    var EOLineSolverID = 0;
    function EOLineSolver(ctx) {
        var width = 300;
        var height = 200;
        clearTimeout(EOLineSolverID);
        ctx.clearRect(0, 0, width, height);
        if (scramble.scrambleType() === "333") {
            ctx.strokeStyle = secondColor;
            ctx.fillStyle = mainColor;
            ctx.lineWidth = 1;
            ctx.font = "20px workSans";
            ctx.textAlign = "center";
            var UColors = [globals.cubeColors[4], mainColor,globals.cubeColors[1], globals.cubeColors[0], globals.cubeColors[3], globals.cubeColors[2]];
            var FColors = [globals.cubeColors[3], globals.cubeColors[3], globals.cubeColors[3], globals.cubeColors[3], globals.cubeColors[0], globals.cubeColors[0]];
            var DColors = [mainColor, globals.cubeColors[4], globals.cubeColors[0], globals.cubeColors[1], globals.cubeColors[2], globals.cubeColors[3]];
            
            EOLineSolverID = setTimeout(function() {    
                for (var i = 0; i < 6; i++) {
                    var str = "(UF):";
                    var x = width * 0.2;
                    ctx.textAlign = "right";
                    for (var s = str.length - 1; s >= 0; s--) {
                        var ch = str.charAt(s);
                        if (s === 1) {
                            ctx.fillStyle = UColors[i];
                        } else if (s === 2) {
                            ctx.fillStyle = FColors[i];
                        } else {
                            ctx.fillStyle = mainColor;
                        }
                        ctx.fillText(ch, x, height * ((30 * (1 + i)) / 200));
                        x -= ctx.measureText(ch).width;
                    }
                    ctx.textAlign = "left";
                    ctx.fillStyle = DColors[i];
                    ctx.fillText(scramble.solveEOLine(scramble.currentScramble(), i), width * (7 / 30), height * ((30 * (1 + i)) / 200));
                }
            }, 0);
        }
    }

    var firstBlockSolverID = 0;
    function firstBlockSolver(ctx) {
        var width = 300;
        var height = 200;
        clearTimeout(firstBlockSolverID);
        ctx.clearRect(0, 0, width, height);
        if (scramble.scrambleType() === "333") {
            ctx.strokeStyle = secondColor;
            ctx.fillStyle = mainColor;
            ctx.lineWidth = 1;
            ctx.font = "20px workSans";
            ctx.textAlign = "center";
            var UColors = [globals.cubeColors[4], mainColor,globals.cubeColors[1], globals.cubeColors[0], globals.cubeColors[3], globals.cubeColors[2]];
            var FColors = [globals.cubeColors[3], globals.cubeColors[3], globals.cubeColors[3], globals.cubeColors[3], globals.cubeColors[0], globals.cubeColors[0]];
            var DColors = [mainColor, globals.cubeColors[4], globals.cubeColors[0], globals.cubeColors[1], globals.cubeColors[2], globals.cubeColors[3]];
            
            firstBlockSolverID = setTimeout(function() {    
                for (var i = 0; i < 6; i++) {
                    var str = "(UF):";
                    var x = width * 0.2;
                    ctx.textAlign = "right";
                    for (var s = str.length - 1; s >= 0; s--) {
                        var ch = str.charAt(s);
                        if (s === 1) {
                            ctx.fillStyle = UColors[i];
                        } else if (s === 2) {
                            ctx.fillStyle = FColors[i];
                        } else {
                            ctx.fillStyle = mainColor;
                        }
                        ctx.fillText(ch, x, height * ((30 * (1 + i)) / 200));
                        x -= ctx.measureText(ch).width;
                    }
                    ctx.textAlign = "left";
                    ctx.fillStyle = DColors[i];
                    ctx.fillText(scramble.solveFirstBlock(scramble.currentScramble(), i), width * (7 / 30), height * ((30 * (1 + i)) / 200));
                }
            }, 0)
        }
    }
    
    function returnToolTypes() {
        return toolTypes;
    }

    return {
        deleteTool:deleteTool,
        addTool:addTool,
        updateTools:updateTools,
        setupTools:setupTools,
        toolTypes:returnToolTypes
    }
}()
