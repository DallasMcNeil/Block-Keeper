/*

scramble_222.js

2x2x2 Solver / Scramble Generator in Javascript.

Code taken from the official WCA scrambler.
Ported by Lucas Garron, November 23, 2011.

Modified by Dallas McNeil for Block Keeper
 */

"use strict";
if (typeof scramblers === "undefined") {
  var scramblers = {};
  scramblers.lib = {
    // https://github.com/lgarron/randomInt.js
    randomInt: function(){function n(){var n="WARNING: randomInt is falling back to Math.random for random number generation.";console.warn?console.warn(n):console.log(n),e=!0}function o(n){if("number"!=typeof n||0>n||Math.floor(n)!==n)throw new Error("randomInt.below() not called with a positive integer value.");if(n>9007199254740992)throw new Error("Called randomInt.below() with max == "+n+", which is larger than Javascript can handle with integer precision.")}function r(n){o(n);var e=a(),i=Math.floor(t/n)*n;return i>e?e%n:r(n)}var a,t=9007199254740992,e=!1,i=window.crypto||window.msCrypto||window.cryptoUint32;if(i)a=function(){var n=2097152,o=new Uint32Array(2);return i.getRandomValues(o),o[0]*n+(o[1]>>21)};else{var l="ERROR: randomInt could not find a suitable crypto.getRandomValues() function.";console.error?console.error(l):console.log(l),a=function(){if(e)return Math.floor(Math.random()*t);throw new Error("randomInt cannot get random values.")}}return{below:r,enableInsecureMathRandomFallback:n}}()
  }
}

scramblers["222"] = (function() {

  var posit = new Array ();
  function initbrd(){
    posit = new Array (
                  1,1,1,1,
                  2,2,2,2,
                  5,5,5,5,
                  4,4,4,4,
                  3,3,3,3,
                  0,0,0,0);
  }
  initbrd();
  var seq = new Array();
  function solved(){
      for (var i=0;i<24; i+=4){
          c=posit[i];
          for(var j=1;j<4;j++)
              if(posit[i+j]!=c) return(false);
      }
      return(true);
  }

  // ----[ This function is replaced by mix2() ]------
  /*
  function mix(){
      initbrd();
      for(var i=0;i<500;i++){
          var f=Math.floor(scramblers.lib.randomInt.below(3)+3) + 16*Math.floor(randomSource.random()*3);
          domove(f);
      }
  }
  */

  // Alternative mixing function, based on generating a random-state (by Conrad Rider)
  function mix2(){
    // Fixed cubie
    var fixed = 6;
    // Generate random permutation
    var perm_src = [0, 1, 2, 3, 4, 5, 6, 7];
    var perm_sel = Array(); 
    for(var i = 0; i < 7; i++){
      var ch = scramblers.lib.randomInt.below(7 - i);
      ch = perm_src[ch] === fixed ? (ch + 1) % (8 - i) : ch;
      perm_sel[i >= fixed ? i + 1 : i] = perm_src[ch];
      perm_src[ch] = perm_src[7 - i];
    }
    perm_sel[fixed] = fixed;
    // Generate random orientation
    var total = 0;
    var ori_sel = Array();
    var i = fixed === 0 ? 1 : 0;
    for(; i < 7; i = i === fixed - 1 ? i + 2 : i + 1){
      ori_sel[i] = scramblers.lib.randomInt.below(3);
      total += ori_sel[i];
    }
    if(i <= 7) ori_sel[i] = (3 - (total % 3)) % 3;
    ori_sel[fixed] = 0;

    // Convert to face format
    // Mapping from permutation/orientation to facelet
    var D = 1, L = 2, B = 5, U = 4, R = 3, F = 0;
    // D 0 1 2 3  L 4 5 6 7  B 8 9 10 11  U 12 13 14 15  R 16 17 18 19  F 20 21 22 23
    // Map from permutation/orientation to face
    var fmap = [[ U,  R,  F],[ U,  B,  R],[ U,  L,  B],[ U,  F,  L],[ D,  F,  R],[D,  R,  B],[ D,  B,  L],[ D,  L,  F]];
    // Map from permutation/orientation to facelet identifier
    var pos  = [[15, 16, 21],[13,  9, 17],[12,  5,  8],[14, 20,  4],[ 3, 23, 18],[1, 19, 11],[ 0, 10,  7],[ 2,  6, 22]];
    // Convert cubie representation into facelet representaion
    for(var i = 0; i < 8; i++){
      for(var j = 0; j < 3; j++)
        posit[pos[i][(ori_sel[i] + j) % 3]] = fmap[perm_sel[i]][j];
    }
  }
  // ----- [End of alternative mixing function]--------------

  var piece=new Array(15,16,16,21,21,15,  13,9,9,17,17,13,  14,20,20,4,4,14,  12,5,5,8,8,12,
                          3,23,23,18,18,3,   1,19,19,11,11,1,  2,6,6,22,22,2,    0,10,10,7,7,0);
  var adj=new Array();
  adj[0]=new Array();
  adj[1]=new Array();
  adj[2]=new Array();
  adj[3]=new Array();
  adj[4]=new Array();
  adj[5]=new Array();
  var opp=new Array();
  var auto;
  var tot;
  function calcadj(){
      //count all adjacent pairs (clockwise around corners)
      var a,b;
      for(a=0;a<6;a++)for(b=0;b<6;b++) adj[a][b]=0;
      for(a=0;a<48;a+=2){
          if(posit[piece[a]]<=5 && posit[piece[a+1]]<=5 )
              adj[posit[piece[a]]][posit[piece[a+1]]]++;
      }
  }
  function calctot(){
      //count how many of each colour
      tot=new Array(0,0,0,0,0,0,0);
      for(var e=0;e<24;e++) tot[posit[e]]++;
  }
  var mov2fc=new Array()
  mov2fc[0]=new Array(0, 2, 3, 1, 23,19,10,6 ,22,18,11,7 ); //D
  mov2fc[1]=new Array(4, 6, 7, 5, 12,20,2, 10,14,22,0, 8 ); //L
  mov2fc[2]=new Array(8, 10,11,9, 12,7, 1, 17,13,5, 0, 19); //B
  mov2fc[3]=new Array(12,13,15,14,8, 17,21,4, 9, 16,20,5 ); //U
  mov2fc[4]=new Array(16,17,19,18,15,9, 1, 23,13,11,3, 21); //R
  mov2fc[5]=new Array(20,21,23,22,14,16,3, 6, 15,18,2, 4 ); //F
  function domove(y){
      var q=1+(y>>4);
      var f=y&15;
      while(q){
          for(var i=0;i<mov2fc[f].length;i+=4){
              var c=posit[mov2fc[f][i]];
              posit[mov2fc[f][i]]=posit[mov2fc[f][i+3]];
              posit[mov2fc[f][i+3]]=posit[mov2fc[f][i+2]];
              posit[mov2fc[f][i+2]]=posit[mov2fc[f][i+1]];
              posit[mov2fc[f][i+1]]=c;
          }
          q--;
      }
  }
  var sol=new Array();
  function solve(){
      calcadj();
      var opp=new Array();
      for(a=0;a<6;a++){
          for(b=0;b<6;b++){
              if(a!=b && adj[a][b]+adj[b][a]===0) { opp[a]=b; opp[b]=a; }
          }
      }
      //Each piece is determined by which of each pair of opposite colours it uses.
      var ps=new Array();
      var tws=new Array();
      var a=0;
      for(var d=0; d<7; d++){
          var p=0;
          for(b=a;b<a+6;b+=2){
              if(posit[piece[b]]===posit[piece[42]]) p+=4;
              if(posit[piece[b]]===posit[piece[44]]) p+=1;
              if(posit[piece[b]]===posit[piece[46]]) p+=2;
          }
          ps[d]=p;
          if(posit[piece[a]]===posit[piece[42]] || posit[piece[a]]===opp[posit[piece[42]]]) tws[d]=0;
          else if(posit[piece[a+2]]===posit[piece[42]] || posit[piece[a+2]]===opp[posit[piece[42]]]) tws[d]=1;
          else tws[d]=2;
          a+=6;
      }
      //convert position to numbers
      var q=0;
      for(var a=0;a<7;a++){
          var b=0;
          for(var c=0;c<7;c++){
              if(ps[c]===a)break;
              if(ps[c]>a)b++;
          }
          q=q*(7-a)+b;
      }
      var t=0;
      for(var a=5;a>=0;a--){
          t=t*3+tws[a]-3*Math.floor(tws[a]/3);
      }
      if(q!=0 || t!=0){
          sol.length=0;
          for(var l=seqlen;l<100;l++){
              if(search(0,q,t,l,-1)) break;
          }
          t="";
          for(q=0;q<sol.length;q++){
              t = "URF".charAt(sol[q]/10)+"\'2 ".charAt(sol[q]%10) + " " + t;
          }
          return t;
      }
  }
  function search(d,q,t,l,lm){
      //searches for solution, from position q|t, in l moves exactly. last move was lm, current depth=d
      if(l===0){
          if(q===0 && t===0){
              return(true);
          }
      }else{
          if(perm[q]>l || twst[t]>l) return(false);
          var p,s,a,m;
          for(m=0;m<3;m++){
              if(m!=lm){
                  p=q; s=t;
                  for(a=0;a<3;a++){
                      p=permmv[p][m];
                      s=twstmv[s][m];
                      sol[d]=10*m+a;
                      if(search(d+1,p,s,l-1,m)) return(true);
                  }
              }
          }
      }
      return(false);
  }
  var perm=new Array();
  var twst=new Array();
  var permmv=new Array()
  var twstmv=new Array();
  function calcperm(){
      //calculate solving arrays
      //first permutation
   
      for(var p=0;p<5040;p++){
          perm[p]=-1;
          permmv[p]=new Array();
          for(var m=0;m<3;m++){
              permmv[p][m]=getprmmv(p,m);
          }
      }
   
      perm[0]=0;
      for(var l=0;l<=6;l++){
          var n=0;
          for(var p=0;p<5040;p++){
              if(perm[p]===l){
                  for(var m=0;m<3;m++){
                      var q=p;
                      for(var c=0;c<3;c++){
                          var q=permmv[q][m];
                          if(perm[q]===-1) { perm[q]=l+1; n++; }
                      }
                  }
              }
          }
      }
   
      //then twist
      for(var p=0;p<729;p++){
          twst[p]=-1;
          twstmv[p]=new Array();
          for(var m=0;m<3;m++){
              twstmv[p][m]=gettwsmv(p,m);
          }
      }
   
      twst[0]=0;
      for(var l=0;l<=5;l++){
          var n=0;
          for(var p=0;p<729;p++){
              if(twst[p]===l){
                  for(var m=0;m<3;m++){
                      var q=p;
                      for(var c=0;c<3;c++){
                          var q=twstmv[q][m];
                          if(twst[q]===-1) { twst[q]=l+1; n++; }
                      }
                  }
              }
          }
      }
      //remove wait sign
  }
  function getprmmv(p,m){
      //given position p<5040 and move m<3, return new position number
      var a,b,c,q;
      //convert number into array;
      var ps=new Array()
      q=p;
      for(a=1;a<=7;a++){
          b=q%a;
          q=(q-b)/a;
          for(c=a-1;c>=b;c--) ps[c+1]=ps[c];
          ps[b]=7-a;
      }
      //perform move on array
      if(m===0){
          //U
          c=ps[0];ps[0]=ps[1];ps[1]=ps[3];ps[3]=ps[2];ps[2]=c;
      }else if(m===1){
          //R
          c=ps[0];ps[0]=ps[4];ps[4]=ps[5];ps[5]=ps[1];ps[1]=c;
      }else if(m===2){
          //F
          c=ps[0];ps[0]=ps[2];ps[2]=ps[6];ps[6]=ps[4];ps[4]=c;
      }
      //convert array back to number
      q=0;
      for(a=0;a<7;a++){
          b=0;
          for(c=0;c<7;c++){
              if(ps[c]===a)break;
              if(ps[c]>a)b++;
          }
          q=q*(7-a)+b;
      }
      return(q)
  }
  function gettwsmv(p,m){
      //given orientation p<729 and move m<3, return new orientation number
      var a,b,c,d,q;
      //convert number into array;
      var ps=new Array()
      q=p;
      d=0;
      for(a=0;a<=5;a++){
          c=Math.floor(q/3);
          b=q-3*c;
          q=c;
          ps[a]=b;
          d-=b;if(d<0)d+=3;
      }
      ps[6]=d;
      //perform move on array
      if(m===0){
          //U
          c=ps[0];ps[0]=ps[1];ps[1]=ps[3];ps[3]=ps[2];ps[2]=c;
      }else if(m===1){
          //R
          c=ps[0];ps[0]=ps[4];ps[4]=ps[5];ps[5]=ps[1];ps[1]=c;
          ps[0]+=2; ps[1]++; ps[5]+=2; ps[4]++;
      }else if(m===2){
          //F
          c=ps[0];ps[0]=ps[2];ps[2]=ps[6];ps[6]=ps[4];ps[4]=c;
          ps[2]+=2; ps[0]++; ps[4]+=2; ps[6]++;
      }
      //convert array back to number
      q=0;
      for(a=5;a>=0;a--){
          q=q*3+(ps[a]%3);
      }
      return(q);
  }

  // Default settings
  var size=2;
  var seqlen=0;
  var numcub=5;
  var mult=false;
  var cubeorient=false;
  var colorString = "yobwrg";  //In dlburf order. May use any colours in colorList below
   
  // list of available colours
  var colorList=new Array(
         'y', "yellow.jpg", "yellow",
         'b', "blue.jpg",   "blue",
         'r', "red.jpg",    "red",
         'w', "white.jpg",  "white",
         'g', "green.jpg",  "green",
         'o', "orange.jpg", "orange",
         'p', "purple.jpg", "purple",
         '0', "grey.jpg",   "grey"      // used for unrecognised letters, or when zero used.
  );

  var colors=new Array(); //stores colours used
  var seq=new Array();  // move sequences
  var posit = new Array();  // facelet array
  var flat2posit; //lookup table for drawing cube
  var colorPerm = new Array(); //dlburf face colour permutation for each cube orientation
  colorPerm[0] = new Array(5,0,1,4,3,2);

  // get all the form settings from the url parameters
  function parse() {

    /*
    var s="";
    var urlquery=location.href.split("?")
    if(urlquery.length>1){
      var urlterms=urlquery[1].split("&")
      for( var i=0; i<urlterms.length; i++){
        var urllr=urlterms[i].split("=");
        if(urllr[0]==="len") {
          if(urllr[1]-0 >= 1 ) seqlen=urllr[1]-0;
        } else if(urllr[0]==="num"){
          if(urllr[1]-0 >= 1 ) numcub=urllr[1]-0;
        } else if(urllr[0]==="col") {
          if(urllr[1].length===6) colorString = urllr[1];
        }
      }
    }
    */
   
    // expand colour string into 6 actual html color names
    for(var k=0; k<6; k++){
      colors[k]=colorList.length-3; // gray
      for( var i=0; i<colorList.length; i+=3 ){
        if( colorString.charAt(k)===colorList[i] ){
          colors[k]=i;
          break;
        }
      }
    }
  }
   
  // append set of moves along an axis to current sequence in order
  function appendmoves( sq, axsl, tl, la ){
    for( var sl=0; sl<tl; sl++){  // for each move type
      if( axsl[sl] ){       // if it occurs
        var q=axsl[sl]-1;
   
        // get semi-axis of this move
        var sa = la;
        var m = sl;
        if(sl+sl+1>=tl){ // if on rear half of this axis
          sa+=3; // get semi-axis (i.e. face of the move)
          m=tl-1-m; // slice number counting from that face
          q=2-q; // opposite direction when looking at that face
        }
        // store move
        sq[sq.length]=(m*6+sa)*4+q;
      }
    }
  }

  var initialized = false;
   
  // generate sequence of scambles
  function initialize(){

    if (!initialized) {
      var i, j;
      // build lookup table
      flat2posit=new Array(12*size*size);
      for(i=0; i<flat2posit.length; i++) flat2posit[i]=-1;
      for(i=0; i<size; i++){
        for(j=0; j<size; j++){
          flat2posit[4*size*(3*size-i-1)+  size+j  ]=        i *size+j; //D
          flat2posit[4*size*(  size+i  )+  size-j-1]=(  size+i)*size+j; //L
          flat2posit[4*size*(  size+i  )+4*size-j-1]=(2*size+i)*size+j; //B
          flat2posit[4*size*(       i  )+  size+j  ]=(3*size+i)*size+j; //U
          flat2posit[4*size*(  size+i  )+2*size+j  ]=(4*size+i)*size+j; //R
          flat2posit[4*size*(  size+i  )+  size+j  ]=(5*size+i)*size+j; //F
        }
      }
    }
   
  /*
         19                32
     16           48           35
         31   60      51   44
     28     80    63    67     47
                83  64
            92          79
                95  76
   
                   0
               12     3
                  15
  */
  }

  var cubeSize = 2;

  var border = 2;
  var width = 20;
  var gap = 4;

  // Modified by Dallas McNeil for Block Keeper, using custom colors
  function colorGet(col){
    if (col==="r") return globals.cubeColors[0];
    if (col==="o") return globals.cubeColors[1];
    if (col==="b") return globals.cubeColors[2];
    if (col==="g") return globals.cubeColors[3];
    if (col==="y") return globals.cubeColors[4];
    if (col==="w") return globals.cubeColors[5];
    if (col==="x") return globals.cubeColors[6];
  }

  var scalePoint = function(w, h, ptIn) {
    
    var defaultWidth = border*2+width*4*cubeSize+gap*3;
    var defaultHeight = border*2+width*3*cubeSize+gap*2;

    var scale = Math.min(w/defaultWidth, h/defaultHeight);

    var x = Math.floor(ptIn[0]*scale + (w - (defaultWidth * scale))/2) + 0.5;
    var y = Math.floor(ptIn[1]*scale + (h - (defaultHeight * scale))/2) + 0.5;

    return [x, y];
  }

  function drawSquare(r, canvasWidth, canvasHeight, cx, cy, w, fillColor) {

    var arrx = [cx - w, cx - w, cx + w, cx + w];
    var arry = [cy - w, cy + w, cy + w, cy - w];

    var pathString = "";
    for (var i = 0; i < arrx.length; i++) {
      var scaledPoint = scalePoint(canvasWidth, canvasHeight, [arrx[i], arry[i]]);
      pathString += ((i===0) ? "M" : "L") + scaledPoint[0] + "," + scaledPoint[1];
    }
    pathString += "z";
      
    r.path(pathString).attr({fill: colorGet(fillColor), stroke: "#000"})
  }

  var drawScramble = function(parentElement, state, w, h) {

    initializeDrawing();

    var colorString = "wrgoby"; // UFRLBD

    var r = Raphael(parentElement, w, h);

    var s="",i,f,d=0,q;
    var ori = 0;
    d=0;
    s="<table border=0 cellpadding=0 cellspacing=0>";
    for(i=0;i<3*size;i++){
      s+="<tr>";
      for(f=0;f<4*size;f++){
        if(flat2posit[d]<0){
          s+="<td><\/td>";
        }else{
          var c = colorPerm[ori][state[flat2posit[d]]];
          var col = colorList[colors[c]+0];
          drawSquare(r, w, h, border + width /2 + f*width + gap*Math.floor(f/2), border + width /2 + i*width + gap*Math.floor(i/2), width/2, col);
          //s+="<td style='background-color:"+colorList[colors[c]+2]+"'><img src='scrbg/"+colorList[colors[c]+1]+"' width=10 border=1 height=10><\/td>";
        }
        d++;
      }
      s+="<\/tr>";
    }
    s+="<\/table>";
    return(s);
  }
   
  function doslice(f,d,q){
    //do move of face f, layer d, q quarter turns
    var f1,f2,f3,f4;
    var s2=size*size;
    var c,i,j,k;
    if(f>5)f-=6;
    // cycle the side facelets
    for(k=0; k<q; k++){
      for(i=0; i<size; i++){
        if(f===0){
          f1=6*s2-size*d-size+i;
          f2=2*s2-size*d-1-i;
          f3=3*s2-size*d-1-i;
          f4=5*s2-size*d-size+i;
        }else if(f===1){
          f1=3*s2+d+size*i;
          f2=3*s2+d-size*(i+1);
          f3=  s2+d-size*(i+1);
          f4=5*s2+d+size*i;
        }else if(f===2){
          f1=3*s2+d*size+i;
          f2=4*s2+size-1-d+size*i;
          f3=  d*size+size-1-i;
          f4=2*s2-1-d-size*i;
        }else if(f===3){
          f1=4*s2+d*size+size-1-i;
          f2=2*s2+d*size+i;
          f3=  s2+d*size+i;
          f4=5*s2+d*size+size-1-i;
        }else if(f===4){
          f1=6*s2-1-d-size*i;
          f2=size-1-d+size*i;
          f3=2*s2+size-1-d+size*i;
          f4=4*s2-1-d-size*i;
        }else if(f===5){
          f1=4*s2-size-d*size+i;
          f2=2*s2-size+d-size*i;
          f3=s2-1-d*size-i;
          f4=4*s2+d+size*i;
        }
        c=posit[f1];
        posit[f1]=posit[f2];
        posit[f2]=posit[f3];
        posit[f3]=posit[f4];
        posit[f4]=c;
      }
   
      /* turn face */
      if(d===0){
        for(i=0; i+i<size; i++){
          for(j=0; j+j<size-1; j++){
            f1=f*s2+         i+         j*size;
            f3=f*s2+(size-1-i)+(size-1-j)*size;
            if(f<3){
              f2=f*s2+(size-1-j)+         i*size;
              f4=f*s2+         j+(size-1-i)*size;
            }else{
              f4=f*s2+(size-1-j)+         i*size;
              f2=f*s2+         j+(size-1-i)*size;
            }
            c=posit[f1];
            posit[f1]=posit[f2];
            posit[f2]=posit[f3];
            posit[f3]=posit[f4];
            posit[f4]=c;
          }
        }
      }
    }
  };

  /*
   * Some helper functions.
   */

  var getRandomScramble = function() {
    initializeFull();

    mix2();
    var solution = solve();

    return {
      state: posit,
      scramble_string: solution
    };
  };

  var drawingInitialized = false;

  var initializeDrawing = function(continuation) {

    if (!drawingInitialized) {

      calcperm();
      parse();
      initialize();

      drawingInitialized = true;
    }

    if (continuation) {
      setTimeout(continuation, 0);
    }
  };

  var initializeFull = function(continuation, _) {
  
    initializeDrawing();

    if (continuation) {
      setTimeout(continuation, 0);
    }
  };


  /* mark2 interface */
  return {
    version: "July 05, 2015",
    initialize: initializeFull,
    setRandomSource: function() {console.log("setRandomSource is deprecated. Iat hs no effect anymore.")},
    getRandomScramble: getRandomScramble,
    drawScramble: drawScramble,

    /* Other methods */
  };

})();
