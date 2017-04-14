
"use strict";
if (typeof scramblers === "undefined") {
  var scramblers = {};
  scramblers.lib = {
    // https://github.com/lgarron/randomInt.js
    randomInt: function(){function n(){var n="WARNING: randomInt is falling back to Math.random for random number generation.";console.warn?console.warn(n):console.log(n),e=!0}function o(n){if("number"!=typeof n||0>n||Math.floor(n)!==n)throw new Error("randomInt.below() not called with a positive integer value.");if(n>9007199254740992)throw new Error("Called randomInt.below() with max == "+n+", which is larger than Javascript can handle with integer precision.")}function r(n){o(n);var e=a(),i=Math.floor(t/n)*n;return i>e?e%n:r(n)}var a,t=9007199254740992,e=!1,i=window.crypto||window.msCrypto||window.cryptoUint32;if(i)a=function(){var n=2097152,o=new Uint32Array(2);return i.getRandomValues(o),o[0]*n+(o[1]>>21)};else{var l="ERROR: randomInt could not find a suitable crypto.getRandomValues() function.";console.error?console.error(l):console.log(l),a=function(){if(e)return Math.floor(Math.random()*t);throw new Error("randomInt cannot get random values.")}}return{below:r,enableInsecureMathRandomFallback:n}}()
  }
}

scramblers["clock"] = (function() {
  /*
  function prt(p){
    if(p<10) document.write(" ");
    document.write(p+" ");
  }
  function prtrndpin(){
    prtpin(Math.floor(Math.random()*2));
  }
  function prtpin(p){
    document.write(p===0?"U":"d");
  }
  */
  
  function getRandomScramble(){
    var posit = new Array (0,0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,0);
    var p = "dU";
    var pegs = [0, 0, 0, 0];
    var seq = new Array();
    var i,j;
    var moves = new Array();
    moves[0]=new Array(1,1,1,1,1,1,0,0,0,  -1,0,-1,0,0,0,0,0,0);
    moves[1]=new Array(0,1,1,0,1,1,0,1,1,  -1,0,0,0,0,0,-1,0,0);
    moves[2]=new Array(0,0,0,1,1,1,1,1,1,  0,0,0,0,0,0,-1,0,-1);
    moves[3]=new Array(1,1,0,1,1,0,1,1,0,  0,0,-1,0,0,0,0,0,-1);
  
    moves[4]=new Array(0,0,0,0,0,0,1,0,1,  0,0,0,-1,-1,-1,-1,-1,-1);
    moves[5]=new Array(1,0,0,0,0,0,1,0,0,  0,-1,-1,0,-1,-1,0,-1,-1);
    moves[6]=new Array(1,0,1,0,0,0,0,0,0,  -1,-1,-1,-1,-1,-1,0,0,0);
    moves[7]=new Array(0,0,1,0,0,0,0,0,1,  -1,-1,0,-1,-1,0,-1,-1,0);
  
    moves[ 8]=new Array(0,1,1,1,1,1,1,1,1,  -1,0,0,0,0,0,-1,0,-1);
    moves[ 9]=new Array(1,1,0,1,1,1,1,1,1,  0,0,-1,0,0,0,-1,0,-1);
    moves[10]=new Array(1,1,1,1,1,1,1,1,0,  -1,0,-1,0,0,0,0,0,-1);
    moves[11]=new Array(1,1,1,1,1,1,0,1,1,  -1,0,-1,0,0,0,-1,0,0);
  
    moves[12]=new Array(1,1,1,1,1,1,1,1,1,  -1,0,-1,0,0,0,-1,0,-1);
    moves[13]=new Array(1,0,1,0,0,0,1,0,1,  -1,-1,-1,-1,-1,-1,-1,-1,-1);
  
    for( i=0; i<14; i++){
      seq[i] = scramblers.lib.randomInt.below(12)-5;
    }
  
    for( i=0; i<4; i++){
      pegs[i] = scramblers.lib.randomInt.below(2);
    }
  
    for( i=0; i<14; i++){
      for( j=0; j<18; j++){
        posit[j]+=seq[i]*moves[i][j];
      }
    }
    for( j=0; j<18; j++){
      posit[j]%=12;
      while( posit[j]<=0 ) posit[j]+=12;
    }
  
  	var scramble = "";

  	function turns(top, bot, tUL, tUR, tDL, tDR) {
		var topWithChanges = top.replace(/\<\./g, "<span class='peg_changed'>").replace(/\<\_/g, "<span class='peg_same___'>").replace(/\>/g, "</span>");
		var botWithChanges = bot.replace(/\<\./g, "<span class='peg_changed'>").replace(/\<\_/g, "<span class='peg_same___'>").replace(/\>/g, "</span>");

  		scramble += "<div class='clock_outer'><div class='clock_inner'>";
  			scramble += tUL + " <span class='clock_pegs'>" + topWithChanges + "</span>&nbsp;" + tUR + "<br>";
  			scramble += tDL + " <span class='clock_pegs'>" + botWithChanges + "</span>&nbsp;" + tDR;
  		scramble += "</div></div>";
  	}

  	function turn_name(turn, amount) {
  		var suffix;
  		if (amount === 0) {
  			return "&nbsp;&nbsp;&nbsp;";
  		}
  		else if (amount === 1) {
  			suffix = "</span>&nbsp;&nbsp;";
  		}
  		else if (amount === -1) {
  			suffix = "'</span>&nbsp;&nbsp;";
  		}
  		else if (amount >= 0) {
  			suffix = "" + amount + "</span>&nbsp;";
  		}
  		else {
  			suffix = "" + (-amount) + "'</span>";
  		}
  		return "<span class='clock_turn'>" + turn + suffix;
  	}

/*
    turns("<_U><_U>", "<_d><_d>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[0]) , "&nbsp;&nbsp;&nbsp;", turn_name("d", seq[4]));
    turns("<.d><_U>", "<_d><.U>", turn_name("d", seq[5]), turn_name("U", seq[1]) , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_d><.d>", "<.U><_U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("d", seq[6]) , "&nbsp;&nbsp;&nbsp;", turn_name("U", seq[2]));
    turns("<.U><_d>", "<_U><.d>", turn_name("U", seq[3]), turn_name("d", seq[7]) , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<.d><.U>", "<_U><.U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[8]) , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<.U><.d>", "<_U><_U>", turn_name("U", seq[9]), "&nbsp;&nbsp;&nbsp;"   , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_U><.U>", "<_U><.d>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[10]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_U><_U>", "<.d><.U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[11]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_U><_U>", "<.U><_U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[12]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<.d><.d>", "<.d><.d>", "&nbsp;&nbsp;&nbsp;"  , turn_name("d", seq[13]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  )
    */

    turns("<_U><_U>", "<_d><_d>", ""  , turn_name("U", seq[0]) , "", turn_name("d", seq[4]) );
    turns("<.d><_U>", "<_d><.U>", ""  , turn_name("U", seq[1]) , "", turn_name("d", seq[5]) );
    turns("<_d><.d>", "<.U><_U>", ""  , turn_name("U", seq[2]) , "", turn_name("d", seq[6]) );
    turns("<.U><_d>", "<_U><.d>", ""  , turn_name("U", seq[3]) , "", turn_name("d", seq[7]) );
    turns("<.d><.U>", "<_U><.U>", ""  , turn_name("U", seq[8]) , "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<.U><.d>", "<_U><_U>", ""  , turn_name("U", seq[9]) , "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<_U><.U>", "<_U><.d>", ""  , turn_name("U", seq[10]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<_U><_U>", "<.d><.U>", ""  , turn_name("U", seq[11]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<_U><_U>", "<.U><_U>", ""  , turn_name("U", seq[12]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<.d><.d>", "<.d><_d>", ""  , turn_name("d", seq[13]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns(p[pegs[0]] + p[pegs[1]], p[pegs[2]] + p[pegs[3]], ""  , ""   , "", "");

    var scrambleString = "";

    var turnToString = function(turn, amount) {
      var suffix;
      if (amount === 0) {
        return "";
      }
      else if (amount === 1) {
        suffix = "";
      }
      else if (amount === -1) {
        suffix = "'";
      }
      else if (amount >= 0) {
        suffix = "" + amount + "";
      }
      else {
        suffix = "" + (-amount) + "'";
      }
      return " " + turn + suffix;
    }
    
    var addToScrambleString = function(pegs, UAmount, dAmount) {
      scrambleString += "[" + pegs + "]" + turnToString("U", UAmount) + turnToString("d", dAmount) +" ";
    }

    addToScrambleString("UU/dd", seq[0], seq[4]);
    addToScrambleString("dU/dU", seq[1], seq[5]);
    addToScrambleString("dd/UU", seq[2], seq[6]);
    addToScrambleString("Ud/Ud", seq[3], seq[7]);
    addToScrambleString("dU/UU", seq[8], 0);
    addToScrambleString("Ud/UU", seq[9], 0);
    addToScrambleString("UU/Ud", seq[10], 0);
    addToScrambleString("UU/dU", seq[11], 0);
    addToScrambleString("UU/UU", seq[12], 0);
    addToScrambleString("dd/dd", 0, seq[13]);
    addToScrambleString(p[pegs[0]] + p[pegs[1]] + "/" + p[pegs[2]] + p[pegs[3]], 0, 0);

    /*
    for( i=0; i<9; i++){
      prt(posit[i]);
      if( (i%3)===2 ) scramble += "\n";
    }
    scramble += "Back:\n";
    for( i=0; i<9; i++){
      prt(posit[i+9]);
      if( (i%3)===2 ) scramble += "\n";
    }
    */

    return {
      state: {dials: posit, pegs: pegs},
      scramble_string: scrambleString
    };
  }

  var initializeFull = function(continuation, _) {
    
    if (continuation) {
      setTimeout(continuation, 0);
    }
  };

  var scalePoint = function(w, h, ptIn) {
    
    var defaultWidth = 220;
    var defaultHeight = 110;

    var scale = Math.min(w/defaultWidth, h/defaultHeight);

    var x = Math.floor(ptIn[0]*scale + (w - (defaultWidth * scale))/2) + 0.5;
    var y = Math.floor(ptIn[1]*scale + (h - (defaultHeight * scale))/2) + 0.5;

    return [x, y, scale];
  }

  function drawPolygon(r, w, h, fillColor, rrx, arry) {

    var pathString = "";
    for (var i = 0; i < arrx.length; i++) {
      var scaledPoint = scalePoint(w, h, [arrx[i], arry[i]]);
      pathString += ((i===0) ? "M" : "L") + scaledPoint[0] + "," + scaledPoint[1];
    }
    pathString += "z";

    return r.path(pathString).attr({fill: fillColor, stroke: "none"});
  }

  var drawCircle = function(r, w, h, cx, cy, rad, fillColor, stroke, stroke_width) {
    var scaledPoint = scalePoint(w, h, [cx, cy]);

    return r.circle(scaledPoint[0], scaledPoint[1], scaledPoint[2]*rad).attr({fill: fillColor, stroke: stroke, "stroke-width": stroke_width});
  }

  Math.TAU = Math.PI * 2;
  var arrx, arry;

  function drawClockFace(r, w, h, cx, cy, face_fill, hour) {

    var cxScaled = scalePoint(w, h, [cx, cy])[0];
    var cyScaled = scalePoint(w, h, [cx, cy])[1];

    drawCircle(r, w, h, cx, cy, 13, face_fill, "none", 0);
    drawCircle(r, w, h, cx, cy, 4, "#F00", "none", 0);

  	var c = Math.cos(hour/12*Math.TAU);
  	var s = Math.sin(hour/12*Math.TAU);

  	arrx = [cx , cx + 4	, cx - 4];
  	arry = [cy - 12, cy - 1, cy - 1];
  	
  	var hand = drawPolygon(r, w, h, "#F00", arrx, arry);

  	hand.rotate(30*hour, cxScaled, cyScaled);


    drawCircle(r, w, h, cx, cy, 2, "#FF0", "none", 0);

  	arrx = [cx, cx + 2, cx - 2];
  	arry = [cy - 8 , cy - 0.5, cy - 0.5];
  	
  	var handInner = drawPolygon(r, w, h, "#FF0", arrx, arry);

  	handInner.rotate(30*hour, cxScaled, cyScaled);

  }

  function drawPeg(r, w, h, cx, cy, pegValue) {

  	var pegRadius = 6;
  	var color;
  	if (pegValue === 1) {
  		color = "#FF0";
  	}
  	else {
  		color = "#440";
  	}

    drawCircle(r, w, h, cx, cy, pegRadius, color, "#000", "1px");
  }

  var drawScramble = function(parentElement, state, w, h) {

  	var clock_radius = 52;

  	var face_dist = 30;
  	var face_background_dist = 29;

  	var face_radius = 15;
  	var face_background_radius = 18;

    var r = Raphael(parentElement, w, h);

    var drawSideBackground = function(cx, cy, fill, stroke, stroke_width) {

      drawCircle(r, w, h, cx, cy, clock_radius, fill, stroke, stroke_width);

  		for (var x = cx - face_background_dist; x <= cx + face_background_dist; x += face_background_dist) {
  			for (var y = cy - face_background_dist; y <= cy + face_background_dist; y += face_background_dist) {
          drawCircle(r, w, h, x, y, face_background_radius, fill, stroke, stroke_width);
  			}
  		}
    }

    var cx = 55;
    var cy = 55;

    drawSideBackground(cx, cy, "none", "#000", "3px");
    drawSideBackground(cx, cy, "#36F", "none");

    var i = 0;
  	for (var y = cy - face_dist; y <= cy + face_dist; y += face_dist) {
  		for (var x = cx - face_dist; x <= cx + face_dist; x += face_dist) {
  			drawClockFace(r, w, h, x, y, "#8AF", state.dials[i]);
  			//console.log(state.dials[i]);
  			i++;
  		}
  	}
  	
  	drawPeg(r, w, h, cx - face_dist/2, cy - face_dist/2, state.pegs[0]);
  	drawPeg(r, w, h, cx + face_dist/2, cy - face_dist/2, state.pegs[1]);
  	drawPeg(r, w, h, cx - face_dist/2, cy + face_dist/2, state.pegs[2]);
  	drawPeg(r, w, h, cx + face_dist/2, cy + face_dist/2, state.pegs[3]);
  	


      var cx = 165;
      var cy = 55;

      drawSideBackground(cx, cy, "#none", "#000", 3);
      drawSideBackground(cx, cy, "#8AF", "none");

      var i = 9;
  	for (y = cy - face_dist; y <= cy + face_dist; y += face_dist) {
  		for (x = cx - face_dist; x <= cx + face_dist; x += face_dist) {
  			drawClockFace(r, w, h, x, y, "#36F",  state.dials[i]);
  			//console.log(state.dials[i]);
  			i++;
  		}
  	}
  	
  	drawPeg(r, w, h, cx + face_dist/2, cy - face_dist/2, 1-state.pegs[0]);
  	drawPeg(r, w, h, cx - face_dist/2, cy - face_dist/2, 1-state.pegs[1]);
  	drawPeg(r, w, h, cx + face_dist/2, cy + face_dist/2, 1-state.pegs[2]);
  	drawPeg(r, w, h, cx - face_dist/2, cy + face_dist/2, 1-state.pegs[3]);

  };

  return {
    /* mark2 interface */
    version: "July 05, 2015",
    initialize: initializeFull,
    setRandomSource: function() {console.log("setRandomSource is deprecated. It has no effect anymore.")},
    getRandomScramble: getRandomScramble,
    drawScramble: drawScramble,

    /* Other methods */
  };
})();
