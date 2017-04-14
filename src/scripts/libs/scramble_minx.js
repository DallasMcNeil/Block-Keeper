/*

Program by Clément Gallet, based on earlier work by Jaap Scherphuis. Idea by Stefan Pochmann.

Modified by Dallas McNeil for Block Keeper

## Notation:
D means all layers below the U face together in one move.
R means all layers right from the L face together in one move.
++ means 2/5 move clockwise (144 degrees), -- means 2/5 move counterclockwise (-144 degrees).
U is the regular move of the U face, according to standard cube notation.
<br>
 */
"use strict";
if (typeof scramblers === "undefined") {
  var scramblers = {};
  scramblers.lib = {
    // https://github.com/lgarron/randomInt.js
    randomInt: function(){function n(){var n="WARNING: randomInt is falling back to Math.random for random number generation.";console.warn?console.warn(n):console.log(n),e=!0}function o(n){if("number"!=typeof n||0>n||Math.floor(n)!==n)throw new Error("randomInt.below() not called with a positive integer value.");if(n>9007199254740992)throw new Error("Called randomInt.below() with max == "+n+", which is larger than Javascript can handle with integer precision.")}function r(n){o(n);var e=a(),i=Math.floor(t/n)*n;return i>e?e%n:r(n)}var a,t=9007199254740992,e=!1,i=window.crypto||window.msCrypto||window.cryptoUint32;if(i)a=function(){var n=2097152,o=new Uint32Array(2);return i.getRandomValues(o),o[0]*n+(o[1]>>21)};else{var l="ERROR: randomInt could not find a suitable crypto.getRandomValues() function.";console.error?console.error(l):console.log(l),a=function(){if(e)return Math.floor(Math.random()*t);throw new Error("randomInt cannot get random values.")}}return{below:r,enableInsecureMathRandomFallback:n}}()
  }
}

scramblers["minx"] = (function() {
 
  var linelen=10;
  var linenbr=7;
  
  function parse() {
  	/*
  	var urlquery=location.href.split("?")
  	if(urlquery.length>1){
  		var urlterms=urlquery[1].split("&")
  		for( var i=0; i<urlterms.length; i++){
  			var urllr=urlterms[i].split("=");
  			if(urllr[0]==="ll") {
  				if(urllr[1]-0 >= 1 ) linelen=urllr[1]-0;
  			} else if(urllr[0]==="ln"){
  				if(urllr[1]-0 >= 1 ) linenbr=urllr[1]-0;
  			} else if(urllr[0]==="num"){
  				if(urllr[1]-0 >= 1 ) numcub=urllr[1]-0;
  			}
  		}
  	}
  	*/
  }


  var permU = [4, 0, 1, 2, 3, 9, 5, 6, 7, 8, 10, 11, 12, 13, 58, 59, 16, 17, 18, 63, 20, 21, 22, 23, 24, 14, 15, 27, 28, 29, 19, 31, 32, 33, 34, 35, 25, 26, 38, 39, 40, 30, 42, 43, 44, 45, 46, 36, 37, 49, 50, 51, 41, 53, 54, 55, 56, 57, 47, 48, 60, 61, 62, 52, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131];
  var permUi = [1, 2, 3, 4, 0, 6, 7, 8, 9, 5, 10, 11, 12, 13, 25, 26, 16, 17, 18, 30, 20, 21, 22, 23, 24, 36, 37, 27, 28, 29, 41, 31, 32, 33, 34, 35, 47, 48, 38, 39, 40, 52, 42, 43, 44, 45, 46, 58, 59, 49, 50, 51, 63, 53, 54, 55, 56, 57, 14, 15, 60, 61, 62, 19, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131];
  var permD2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 33, 34, 35, 14, 15, 38, 39, 40, 19, 42, 43, 44, 45, 46, 25, 26, 49, 50, 51, 30, 53, 54, 55, 56, 57, 36, 37, 60, 61, 62, 41, 64, 65, 11, 12, 13, 47, 48, 16, 17, 18, 52, 20, 21, 22, 23, 24, 58, 59, 27, 28, 29, 63, 31, 32, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 124, 125, 121, 122, 123, 129, 130, 126, 127, 128, 131];
  var permD2i = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 44, 45, 46, 14, 15, 49, 50, 51, 19, 53, 54, 55, 56, 57, 25, 26, 60, 61, 62, 30, 64, 65, 11, 12, 13, 36, 37, 16, 17, 18, 41, 20, 21, 22, 23, 24, 47, 48, 27, 28, 29, 52, 31, 32, 33, 34, 35, 58, 59, 38, 39, 40, 63, 42, 43, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 123, 124, 125, 121, 122, 128, 129, 130, 126, 127, 131];
  var permR2 = [81, 77, 78, 3, 4, 86, 82, 83, 8, 85, 87, 122, 123, 124, 125, 121, 127, 128, 129, 130, 126, 131, 89, 90, 24, 25, 88, 94, 95, 29, 97, 93, 98, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 26, 22, 23, 48, 30, 31, 27, 28, 53, 32, 69, 70, 66, 67, 68, 74, 75, 71, 72, 73, 76, 101, 102, 103, 99, 100, 106, 107, 108, 104, 105, 109, 46, 47, 79, 80, 45, 51, 52, 84, 49, 50, 54, 0, 1, 2, 91, 92, 5, 6, 7, 96, 9, 10, 15, 11, 12, 13, 14, 20, 16, 17, 18, 19, 21, 113, 114, 110, 111, 112, 118, 119, 115, 116, 117, 120, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65];
  var permR2i = [88, 89, 90, 3, 4, 93, 94, 95, 8, 97, 98, 100, 101, 102, 103, 99, 105, 106, 107, 108, 104, 109, 46, 47, 24, 25, 45, 51, 52, 29, 49, 50, 54, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 81, 77, 78, 48, 85, 86, 82, 83, 53, 87, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 57, 58, 59, 55, 56, 62, 63, 64, 60, 61, 65, 1, 2, 79, 80, 0, 6, 7, 84, 9, 5, 10, 26, 22, 23, 91, 92, 31, 27, 28, 96, 30, 32, 69, 70, 66, 67, 68, 74, 75, 71, 72, 73, 76, 112, 113, 114, 110, 111, 117, 118, 119, 115, 116, 120, 15, 11, 12, 13, 14, 20, 16, 17, 18, 19, 21];

   function applyMove(state, movePerm) {
   	 var stateNew = [];
  	 for (var i = 0; i < 11*12; i++) {
  		stateNew[i] = state[movePerm[i]];
  	 }
  	 return stateNew;
   }
  
  function getRandomScramble(){

	var i;
	var seq =new Array();
	for(i=0; i<linenbr*linelen; i++){
		seq[i]=scramblers.lib.randomInt.below(2);
	}

  	var s="",i,j;

  	var state = [];
  	for (i = 0; i < 12; i++) {
  		for (j = 0; j < 11; j++) {
  			state[i*11+j] = i;
  		}
  	}

  	for(j=0; j<linenbr; j++){
  		for(i=0; i<linelen; i++){
  			if (i%2)
  			{
  				if (seq[j*linelen + i]) {
	  				s+="D++ ";
	  				state = applyMove(state, permD2);
	  			}
  				else {
	  				s+="D-- ";
	  				state = applyMove(state, permD2i);
	  			}
  			}
  			else
  			{
  				if (seq[j*linelen + i]) {
	  				s+="R++ ";
	  				state = applyMove(state, permR2);
	  			}
  				else {
	  				s+="R-- ";
	  				state = applyMove(state, permR2i);
  				}
  			}
  		}
  		if (seq[(j+1)*linelen - 1]) {
	  		s+="U";
	  		state = applyMove(state, permU);
	  	}
  		else {
	  		s+="U'";
			state = applyMove(state, permUi);
	  	}
  		if (j < linenbr-1) {
  			s += "<br>";
  		}
  	}

    return {
      state: state,
      scramble_string: s
    };
  }
  
  var initializeFull = function(continuation, _) {
    
    if (continuation) {
      setTimeout(continuation, 0);
    }
  };


  /*
   * Drawing code.
   * Messy, but it works.
   */
  var edgeFrac = (1+Math.sqrt(5))/4;
  var centerFrac = 0.5;

  Math.TAU = Math.PI * 2;

  var s18 = function(i) {return Math.sin(Math.TAU*i/20);};
  var c18 = function(i) {return Math.cos(Math.TAU*i/20);};

  /*var colors = [
  	"#FFF",
  	"#008",
  	"#080",
  	"#0FF",
  	"#822",
  	"#8AF",

  	"#F00",
  	"#00F",
  	"#F0F",
  	"#0F0",
  	"#F80",
  	"#FF0",

  ];*/
  var colors = minxColors

	function drawPolygon(r, fillColor, arrx, arry) {

	  var pathString = "";
	  for (var i = 0; i < arrx.length; i++) {
	    pathString += ((i===0) ? "M" : "L") + arrx[i] + "," + arry[i];
	  }
	  pathString += "z";

	  return r.path(pathString).attr({fill: fillColor, stroke: "#000"});
	}

  var drawScramble = function(parentElement, state, w, h) {



    var defaultWidth = 350;
    var defaultHeight = 180;

    var scale = Math.min(w/defaultWidth, h/defaultHeight);

    var dx = (w - (defaultWidth * scale))/2;
    var dy = (h - (defaultHeight * scale))/2;


    // Change this if the SVG element is too large.
    
    var majorR = 36*scale;
    var minorR = majorR * edgeFrac

    var pentR = minorR*2;

    var cx1 = 92*scale + dx;
    var cy1 = 80*scale + dy;

    var cx2 = cx1 + c18(1)*3*pentR;
    var cy2 = cy1 + s18(1)*1*pentR;

    var trans = [
      [0, cx1, cy1, 0, 0],
      [36, cx1, cy1, 1, 1],
      [36+72*1, cx1, cy1, 1, 5],
      [36+72*2, cx1, cy1, 1, 9],
      [36+72*3, cx1, cy1, 1, 13],
      [36+72*4, cx1, cy1, 1, 17],
      [0, cx2, cy2, 1, 7],
      [-72*1, cx2, cy2, 1, 3],
      [-72*2, cx2, cy2, 1, 19],
      [-72*3, cx2, cy2, 1, 15],
      [-72*4, cx2, cy2, 1, 11],
      [36+72*2, cx2, cy2, 0, 0]
    ];

    var r = Raphael(parentElement, w, h);

    //console.log(state);

    var index = 0;

    for (var side = 0; side < 12; side++) {

	    for (var i = 0; i < 5; i++) {

	    	var dx = majorR*(1-centerFrac)/2/Math.tan(Math.TAU/10);
	    	var arrx = [0, dx, 0, -dx];
	    	var arry = [-majorR,- majorR*(1+centerFrac)/2, -majorR*centerFrac, -majorR*(1+centerFrac)/2]

	    	var p = drawPolygon(r, colors[state[index++]], arrx, arry);
	    	//var p = r.circle(0, - circR, circRadius);
	    	//p.attr({fill: colors[state[index++]], stroke: "#000"});
	    	p.translate(trans[side][1] + trans[side][3]*c18(trans[side][4])*pentR, trans[side][2] + trans[side][3]*s18(trans[side][4])*pentR);
			p.rotate(72*i + trans[side][0], 0, 0);
	    }

	    for (var i = 0; i < 5; i++) {

	    	var sx = Math.tan(Math.TAU/10);
	    	var arrx = [c18(-1)*majorR - dx, dx, 0, s18(4)*centerFrac*majorR];
	    	var arry = [s18(-1)*majorR - majorR + majorR*(1+centerFrac)/2,- majorR*(1+centerFrac)/2, -majorR*centerFrac, -c18(4)*centerFrac*majorR]

	    	var p = drawPolygon(r, colors[state[index++]], arrx, arry);
	    	p.translate(trans[side][1] + trans[side][3]*c18(trans[side][4])*pentR, trans[side][2] + trans[side][3]*s18(trans[side][4])*pentR);
	    	p.rotate(72*i + trans[side][0], 0, 0);
	    }

	    var arrx = [s18(0)*centerFrac*majorR, s18(4)*centerFrac*majorR, s18(8)*centerFrac*majorR, s18(12)*centerFrac*majorR, s18(16)*centerFrac*majorR];
	    var arry = [-c18(0)*centerFrac*majorR, -c18(4)*centerFrac*majorR, -c18(8)*centerFrac*majorR, -c18(12)*centerFrac*majorR, -c18(16)*centerFrac*majorR];

	    var p = drawPolygon(r, colors[state[index++]], arrx, arry);
	    p.translate(trans[side][1] + trans[side][3]*c18(trans[side][4])*pentR, trans[side][2] + trans[side][3]*s18(trans[side][4])*pentR);
	    p.rotate(trans[side][0], 0, 0);
	}

	//console.log(index);

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
