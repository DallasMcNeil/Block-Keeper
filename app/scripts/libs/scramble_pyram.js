/* Base script written by Jaap Scherphuis, jaapsch a t yahoo d o t com */
/* Javascript written by Syoji Takamatsu, , red_dragon a t honki d o t net */
/* Random-State modification by Lucas Garron (lucasg a t gmx d o t de / garron.us) in collaboration with Michael Gottlieb (mzrg.com)*/
/* Optimal modification by Michael Gottlieb (qqwref a t gmail d o t com) from Jaap's code */
/* Modified by Dallas McNeil for Block Keeper*/
/* Version 1.0*/
"use strict";
if (typeof scramblers == "undefined") {
  var scramblers = {};
  scramblers.lib = {
    // https://github.com/lgarron/randomInt.js
    randomInt: function(){function n(){var n="WARNING: randomInt is falling back to Math.random for random number generation.";console.warn?console.warn(n):console.log(n),e=!0}function o(n){if("number"!=typeof n||0>n||Math.floor(n)!==n)throw new Error("randomInt.below() not called with a positive integer value.");if(n>9007199254740992)throw new Error("Called randomInt.below() with max == "+n+", which is larger than Javascript can handle with integer precision.")}function r(n){o(n);var e=a(),i=Math.floor(t/n)*n;return i>e?e%n:r(n)}var a,t=9007199254740992,e=!1,i=window.crypto||window.msCrypto||window.cryptoUint32;if(i)a=function(){var n=2097152,o=new Uint32Array(2);return i.getRandomValues(o),o[0]*n+(o[1]>>21)};else{var l="ERROR: randomInt could not find a suitable crypto.getRandomValues() function.";console.error?console.error(l):console.log(l),a=function(){if(e)return Math.floor(Math.random()*t);throw new Error("randomInt cannot get random values.")}}return{below:r,enableInsecureMathRandomFallback:n}}()
  }
}

scramblers["pyram"] = (function() {

  var numcub = 1;

  var colorString = "xgryb";  //In dlburf order. May use any colours in colorList below

   
  // list of available colours
  var colorList = [
   'g', "green.jpg",  "green",
   'r', "red.jpg",    "red",
   'y', "yellow.jpg", "yellow",
   'b', "blue.jpg",   "blue",
   'w', "white.jpg",  "white",
   'o', "orange.jpg","orange",   // 'orange' is not an official html colour name
   'p', "purple.jpg", "purple",
   '0', "gray.jpg",   "grey"      // used for unrecognised letters, or when zero used.
  ];
  // layout
  var layout =
   [1,2,1,2,1,0,2,0,1,2,1,2,1,
    0,1,2,1,0,2,1,2,0,1,2,1,0,
    0,0,1,0,2,1,2,1,2,0,1,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,1,2,1,2,1,0,0,0,0,
    0,0,0,0,0,1,2,1,0,0,0,0,0,
    0,0,0,0,0,0,1,0,0,0,0,0,0];
   
  var seq   = []; // move sequences
  var colmap = []; // color map
  var colors = []; //stores colours used
  var scramblestring = [];
   
  function parse() {

    /*
   var s = "";
   var urlquery = location.href.split("?")
   if(urlquery.length > 1) {
    var urlterms = urlquery[1].split("&")
    for( var i = 0; i < urlterms.length; i++) {
     var urllr = urlterms[i].split("=");
     if(urllr[0] == "num") {
      if(urllr[1] - 0 >= 1 ) 
       numcub = urllr[1] - 0;
     } 
     else if(urllr[0] == "col") {
      if(urllr[1].length==4) 
       colorString = urllr[1];
     }
    }
   }
   */

   // expand colour string into 6 actual html color names
   for(var k = 0; k < 6; k++){
    colors[k+1] = colorList.length - 3; // gray
    for( var i = 0; i < colorList.length; i += 3) {
     if( colorString.charAt(k) == colorList[i]) {
      colors[k+1] = i; // not use index 0
      break;
     }
    }
   }
  }
  parse();
   
  function init_colors(n){
   colmap[n] =
    [1,1,1,1,1,0,2,0,3,3,3,3,3,
     0,1,1,1,0,2,2,2,0,3,3,3,0,
     0,0,1,0,2,2,2,2,2,0,3,0,0,
     0,0,0,0,0,0,0,0,0,0,0,0,0,
     0,0,0,0,4,4,4,4,4,0,0,0,0,
     0,0,0,0,0,4,4,4,0,0,0,0,0,
     0,0,0,0,0,0,4,0,0,0,0,0,0];
  }
   
  function scramble()
  {
   var i, j, n, ls, t;
   
   for( n = 0; n < numcub; n++){
    initbrd();
    dosolve();
   
    scramblestring[n]="";
    init_colors(n);
    for (i=0;i<sol.length;i++) {
     scramblestring[n] += ["U","L","R","B"][sol[i]&7] + ["","'"][(sol[i]&8)/8] + " ";
     picmove([3,0,1,2][sol[i]&7],1+(sol[i]&8)/8,n);
    }
    var tips=["l","r","b","u"];
    for (i=0;i<4;i++) {
     var j = scramblers.lib.randomInt.below(3);
     if (j < 2) {
      scramblestring[n] += tips[i] + ["","'"][j] + " ";
      picmove(4+i,1+j,n);
     }
    }
   }
  }
   
  var posit = [];
  var mode;
  var edt;
  var perm=[];   // pruning table for edge permutation
  var twst=[];   // pruning table for edge orientation+twist
  var permmv=[]; // transition table for edge permutation
  var twstmv=[]; // transition table for edge orientation+twist
  var sol=[];
  var pcperm = [];
  var pcori  = [];
  var soltimer;
   
  function initbrd(){
      if( mode==4 ) clearTimeout(soltimer);
      posit = [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3];
      mode=0;
      sol.length=0;
  }
   
  function solved(){
      for (var i=1;i<9; i++){
          if( posit[i   ]!=posit[0 ] ) return(false);
          if( posit[i+9 ]!=posit[9 ] ) return(false);
          if( posit[i+18]!=posit[18] ) return(false);
          if( posit[i+27]!=posit[27] ) return(false);
      }
      return(true);
  }
   
  var edges = [2,11, 1,20, 4,31, 10,19, 13,29, 22,28];
   
  var movelist=[];
  movelist[0 ]=[0, 18,9,   6, 24,15,  1, 19,11,  2, 20,10];  //U
  movelist[1 ]=[23,3, 30,  26,7, 34,  22,1, 31,  20,4, 28];  //L
  movelist[2 ]=[5, 14,32,  8, 17,35,  4, 11,29,  2, 13,31];  //R
  movelist[3 ]=[12,21,27,  16,25,33,  13,19,28,  10,22,29];  //B
   
  function domove(m){
      for(var i=0;i<movelist[m].length; i+=3){
          var c=posit[movelist[m][i]];
          posit[movelist[m][i  ]]=posit[movelist[m][i+2]];
          posit[movelist[m][i+2]]=posit[movelist[m][i+1]];
          posit[movelist[m][i+1]]=c;
      }
  }
   
  function dosolve(){
      var a,b,c,l,t=0,q=0;
      // Get a random permutation and orientation.
      var parity = 0;
      pcperm = [0,1,2,3,4,5];
      for (var i=0;i<4;i++) {
       var other = i + scramblers.lib.randomInt.below(6-i);
       var temp = pcperm[i];
       pcperm[i] = pcperm[other];
       pcperm[other] = temp;
       if (i != other) parity++;
      }
      if (parity%2 == 1) {
       var temp = pcperm[4];
       pcperm[4] = pcperm[5];
       pcperm[5] = temp;
      }
      parity=0;
      pcori = [];
      for (var i=0;i<5;i++) {
       pcori[i] = scramblers.lib.randomInt.below(2);
       parity += pcori[i];
      }
      pcori[5] = parity % 2;
      for (var i=6;i<10;i++) {
       pcori[i] = scramblers.lib.randomInt.below(3);
      }
   
      for(a=0;a<6;a++){
          b=0;
          for(c=0;c<6;c++){
              if(pcperm[c]==a)break;
              if(pcperm[c]>a)b++;
          }
          q=q*(6-a)+b;
      }
      //corner orientation
      for(a=9;a>=6;a--){
          t=t*3+pcori[a];
      }
      //edge orientation
      for(a=4;a>=0;a--){
          t=t*2+pcori[a];
      }
   
      // solve it
      if(q!=0 || t!=0){
          for(l=7;l<12;l++){  //allow solutions from 7 through 11 moves
              if(search(q,t,l,-1)) break;
          }
      }
  }
   
  function search(q,t,l,lm){
      //searches for solution, from position q|t, in l moves exactly. last move was lm, current depth=d
      if(l==0){
          if(q==0 && t==0){
              return(true);
          }
      }else{
          if(perm[q]>l || twst[t]>l) return(false);
          var p,s,a,m;
          for(m=0;m<4;m++){
              if(m!=lm){
                  p=q; s=t;
                  for(a=0;a<2;a++){
                      p=permmv[p][m];
                      s=twstmv[s][m];
                      sol[sol.length]=m+8*a;
                      if(search(p,s,l-1,m)) return(true);
                      sol.length--;
                  }
              }
          }
      }
      return(false);
  }
   
   
  function calcperm(){
      var c,p,q,l,m,n;
      //calculate solving arrays
      //first permutation
      // initialise arrays
      for(p=0;p<720;p++){
          perm[p]=-1;
          permmv[p]=[];
          for(m=0;m<4;m++){
              permmv[p][m]=getprmmv(p,m);
          }
      }
      //fill it
      perm[0]=0;
      for(l=0;l<=6;l++){
          n=0;
          for(p=0;p<720;p++){
              if(perm[p]==l){
                  for(m=0;m<4;m++){
                      q=p;
                      for(c=0;c<2;c++){
                          q=permmv[q][m];
                          if(perm[q]==-1) { perm[q]=l+1; n++; }
                      }
                  }
              }
          }
      }
      //then twist
      // initialise arrays
      for(p=0;p<2592;p++){
          twst[p]=-1;
          twstmv[p]=[];
          for(m=0;m<4;m++){
              twstmv[p][m]=gettwsmv(p,m);
          }
      }
      //fill it
      twst[0]=0;
      for(l=0;l<=5;l++){
          n=0;
          for(p=0;p<2592;p++){
              if(twst[p]==l){
                  for(m=0;m<4;m++){
                      q=p;
                      for(c=0;c<2;c++){
                          q=twstmv[q][m];
                          if(twst[q]==-1) { twst[q]=l+1; n++; }
                      }
                  }
              }
          }
      }
  }
   
  function getprmmv(p,m){
      //given position p<720 and move m<4, return new position number
   
      //convert number into array
      var a,b,c;
      var ps=[];
      var q=p;
      for(a=1;a<=6;a++){
          c=Math.floor(q/a);
          b=q-a*c;
          q=c;
          for(c=a-1;c>=b;c--) ps[c+1]=ps[c];
          ps[b]=6-a;
      }
      //perform move on array
      if(m==0){
          //U
          cycle3(ps, 0, 3, 1);
      }else if(m==1){
          //L
          cycle3(ps, 1, 5, 2);
      }else if(m==2){
          //R
          cycle3(ps, 0, 2, 4);
      }else if(m==3){
          //B
          cycle3(ps, 3, 4, 5);
      }
      //convert array back to number
      q=0;
      for(a=0;a<6;a++){
          b=0;
          for(c=0;c<6;c++){
              if(ps[c]==a)break;
              if(ps[c]>a)b++;
          }
          q=q*(6-a)+b;
      }
      return(q)
  }
  function gettwsmv(p,m){
      //given position p<2592 and move m<4, return new position number
   
      //convert number into array;
      var a,b,c,d=0;
      var ps=[];
      var q=p;
   
      //first edge orientation
      for(a=0;a<=4;a++){
          ps[a]=q&1;
          q>>=1;
          d^=ps[a];
      }
      ps[5]=d;
   
      //next corner orientation
      for(a=6;a<=9;a++){
          c=Math.floor(q/3);
          b=q-3*c;
          q=c;
          ps[a]=b;
      }
   
      //perform move on array
      if(m==0){
          //U
          ps[6]++; if(ps[6]==3) ps[6]=0;
          cycle3(ps, 0, 3, 1);
          ps[1]^=1;ps[3]^=1;
      }else if(m==1){
          //L
          ps[7]++; if(ps[7]==3) ps[7]=0;
          cycle3(ps, 1, 5, 2);
          ps[2]^=1; ps[5]^=1;
      }else if(m==2){
          //R
          ps[8]++; if(ps[8]==3) ps[8]=0;
          cycle3(ps, 0, 2, 4);
          ps[0]^=1; ps[2]^=1;
      }else if(m==3){
          //B
          ps[9]++; if(ps[9]==3) ps[9]=0;
          cycle3(ps, 3, 4, 5);
          ps[3]^=1; ps[4]^=1;
      }
      //convert array back to number
      q=0;
      //corner orientation
      for(a=9;a>=6;a--){
          q=q*3+ps[a];
      }
      //corner orientation
      for(a=4;a>=0;a--){
          q=q*2+ps[a];
      }
      return(q);
  }
   
  function picmove(type, direction, n){
   switch(type) {
    case 0: // L
     rotate3(n, 14,58,18, direction);
     rotate3(n, 15,57,31, direction);
     rotate3(n, 16,70,32, direction);
     rotate3(n, 30,28,56, direction);
     break;
    case 1: // R
     rotate3(n, 32,72,22, direction);
     rotate3(n, 33,59,23, direction);
     rotate3(n, 20,58,24, direction);
     rotate3(n, 34,60,36, direction);
     break;
    case 2: // B
     rotate3(n, 14,10,72, direction);
     rotate3(n,  1,11,71, direction);
     rotate3(n,  2,24,70, direction);
     rotate3(n,  0,12,84, direction);
     break;
    case 3: // U
     rotate3(n,  2,18,22, direction);
     rotate3(n,  3,19, 9, direction);
     rotate3(n, 16,20,10, direction);
     rotate3(n,  4, 6, 8, direction);
     break;
    case 4: // l
     rotate3(n, 30,28,56, direction);
     break;
    case 5: // r
     rotate3(n, 34,60,36, direction);
     break;
    case 6: // b
     rotate3(n,  0,12,84, direction);
     break;
    case 7: // u
     rotate3(n,  4, 6, 8, direction);
     break;
   }
  }
   
  function rotate3(n, v1, v2, v3, clockwise)
  {
   if(clockwise == 2) {
    cycle3(colmap[n], v3, v2, v1);
   } else {
    cycle3(colmap[n], v1, v2, v3);
   }
  }
   
  function cycle3(arr, i1, i2, i3) {
   var c = arr[i1];
   arr[i1] = arr[i2];
   arr[i2] = arr[i3];
   arr[i3] = c;
  }
   
  function draw_triangle(pat, color, val)
  {
     var s = "";
     if(pat == 1) {
        s += "<table border=0 cellpadding=0 cellspacing=0>";
        s += "<tr>";
        for(var c=1; c<=12; c++){
           s += "<td width=1 height=2><img src='scrbg/" +colorList[colors[color] + 1] +  "' height='2px' width='1px'></td>";
        }
        s += "</tr>";
   
        for(var i = 1; i <= 5; i++) {
           s += "<tr>";
           s += "<td colspan=" + i + " width=" + i + " height=2 bgcolor=silver></td>";
           s += "<td colspan=" + (12 - i * 2) + " width=" + (12 - i * 2) + " height=2><img src='scrbg/" +colorList[colors[color] + 1] +  "' height='2px' width='"+(12 - i * 2)+"px'></td>";
           s += "<td colspan=" + i + " width=" + i + " height=2 bgcolor=silver></td>";
           s += "</tr>";
        }
   
        s += "</table>";
     }
     else if(pat == 2) {
        s += "<table border=0 cellpadding=0 cellspacing=0>";
        for(var i = 5; i >= 1; i--) {
           s += "<tr>";
           s += "<td colspan=" + i + " width=" + i + " height=2 bgcolor=silver></td>";
           s += "<td colspan=" + (12 - i * 2) + " width=" + (12 - i * 2) + " height=2><img src='scrbg/" +colorList[colors[color] + 1] +  "' height='2px' width='"+(12 - i * 2)+"px'></td>";
           s += "<td colspan=" + i + " width=" + i + " height=2 bgcolor=silver></td>";
           s += "</tr>";
        }
   
        s += "<tr>";
        for(var c=1; c<=12; c++){
           s += "<td width=1 height=2><img src='scrbg/" +colorList[colors[color] + 1] +  "' height='2px' width='1px'></td>";
        }
        s += "</tr>";
        s += "</table>";
     }
     else {
        s += "&nbsp;";
     }
     return s;
  }
   
  function imagetable(n)
  {
  	var x,y;
  	var s = "<table border=0 cellpadding=0 cellspacing=0>";
   
  	for(var y = 0; y < 7; y++) {
  		s += "<tr>";
  		for(var x = 0; x < 13; x++) {
  			s += "<td>";
  			s += draw_triangle(layout[y * 13 + x], colmap[n][y * 13 + x], "");
  			s += "</td>";
  		}
  		s += "</tr>";
  	}
  	s += "</table>";
  	return s;
  }

  /* Methods added by Lucas. */

  var getRandomScramble = function() {
    initializeFull();
    scramble();

    return {
      state: colmap,
      scramble_string: scramblestring[0]
    };
  };

  var initialized = false;

  var initializeFull = function(continuation, _) {

    if (initialized) {
      return;
    }
    initialized = true;

    parse();
    calcperm();

    if (continuation) {
      setTimeout(continuation, 0);
    }
  };



  var border = 15;
  var width = 18;
  //URFLBD
  var drawingCenters = [
    [border + width/2*1, border + width/2*1],
    [border + width/2*5, border + width/2*3],
    [border + width/2*3, border + width/2*3],
    [border + width/2*1, border + width/2*3],
    [border + width/2*7, border + width/2*3],
    [border + width/2*3, border + width/2*5],
  ];


  // Modified by Dallas McNeil for Block Keeper, using custom colors
  function colorGet(col){
    if (col==="r") return globals.cubeColors[3];
    if (col==="o") return globals.cubeColors[1];
    if (col==="b") return globals.cubeColors[4];
    if (col==="g") return globals.cubeColors[0];
    if (col==="y") return globals.cubeColors[2];
    if (col==="w") return globals.cubeColors[5];
    if (col==="x") return globals.cubeColors[6];
  }

  var scalePoint = function(w, h, ptIn) {

    var defaultWidth = border*2+width*9;
    var defaultHeight = border*2+width*5.3;
    

    var scale = Math.min(w/defaultWidth, h/defaultHeight);

    var x = Math.floor(ptIn[0]*scale + (w - (defaultWidth * scale))/2) + 0.5;
    var y = Math.floor(ptIn[1]*scale + (h - (defaultHeight * scale))/2) + 0.5;

    return [x, y];
  }

  function drawTriangle(r, canvasWidth, canvasHeight, cx, cy, w, h, direction, fillColor) {

    var dM = 1; // Direction Multiplier
    if (direction == 2) {
      dM = -1;
    }

    var arrx = [cx, cx - w, cx + w];
    var arry = [cy + h * dM, cy - h * dM, cy - h * dM];

    var pathString = "";
    for (var i = 0; i < arrx.length; i++) {
      var scaledPoint = scalePoint(canvasWidth, canvasHeight, [arrx[i], arry[i]]);
      pathString += ((i===0) ? "M" : "L") + scaledPoint[0] + "," + scaledPoint[1];
    }
    pathString += "z";
      
    r.path(pathString).attr({fill: colorGet(fillColor), stroke: "#000"})
  }

  var drawScramble = function(parentElement, state, w, h) {

    var r = Raphael(parentElement, w, h);

    for(var y = 0; y < 7; y++) {
      for(var x = 0; x < 13; x++) {
        var col = state[0][y * 13 + x];
        if (col != 0) {
          var xx = border + width + x*width/2*2/Math.sqrt(3);
          var yy = border + y * width;
          if (y > 3) {
            yy -= width/2;
          }
          drawTriangle(r, w, h, xx, yy, width/2*2/Math.sqrt(3), width/2, layout[y * 13 + x], colorString[col]);
        }
      }
    }

  }

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
