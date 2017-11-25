// style.js
// Creates CSS to color the UI
// Block Keeper
// Created by Dallas McNeil

var less = require("less")

// Define inbuilt theme colors
var themeColours = [
    ["#181818",
     "#F0F0F0",
     "#B0B0B0",
     "#303030",
     "#606060",
     "#E0E0E0"],
    ["#F8F8F8",
    "#000000",
    "#404040",
    "#FFFFFF",
    "#B0B0B0",
    "#101010"],
    ["#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#202020",
    "#505050",
    "#FFFFFF"],
    ["#000030",
    "#F0F0FF",
    "#C0C0FF",
    "#202060",
    "#0000C0",
    "#FFFFFF"],
    ["#002000",
    "#F0F0F0",
    "#C0E0C0",
    "#204020",
    "#00A000",
    "#FFFFFF"],
    ["#200000",
    "#FFF0F0",
    "#E0C0C0",
    "#602020",
    "#C00000",
    "#FFFFFF"],
    ["#FFF0FF",
    "#000000",
    "#600060",
    "#FFD0FF",
    "#FF60FF",
    "#000000"],
    ["#FFFFF0",
    "#000000",
    "#606000",
    "#FFFFD0",
    "#E0E050",
    "#000000"],
    ["#F0FFFF",
    "#000000",
    "#006060",
    "#D0FFFF",
    "#50E0E0",
    "#000000"],
    ["#000000",
    "#44FF00",
    "#44FF00",
    "#000000",
    "#44FF00",
    "#FFFFFF"],
    ["#000000",
    "#FF00DD",
    "#FF00DD",
    "#000000",
    "#FF00DD",
    "#FFFFFF"],
    ["#000000",
    "#FFFF00",
    "#FFFF00",
    "#000000",
    "#FFFF00",
    "#FFFFFF"],
    ["#000000",
    "#00D0FF",
    "#00D0FF",
    "#000000",
    "#00D0FF",
    "#FFFFFF"],
]

// Use Less to generate css with theme colors to color UI
function setStyle(colours) {
less.render('@background:'+colours[0]+';@timer:'+colours[1]+';@scramble:'+colours[2]+';@base:'+colours[3]+';@border:'+colours[4]+';@text:'+colours[5]+`;@scrambleSize:`+preferences.scrambleSize+`vh;
@darken: 40%;

p {
    color:@text;
}

::-webkit-scrollbar-track {
    background: @base;
}

::-webkit-scrollbar-thumb {
    background: @border;
}

body {
    background-color:@background;
}

#windowBar {
    background-color: @background; 
}

.indicator {
    background-color:@background;
}

#background, #centreBackground {
    background-color:@background;
}

#timer,#announcement {
    color:@timer;
}

#scramble {
    color:@scramble;
    background-color:fade(@scramble,10%);
}

#scramble:hover {
    background-color:fade(@scramble,20%);
}

button, #tool, input, button.disabled, button.disabled:hover, button.disabled:active, input[type="text"],textarea,td,#dialogPreferences, #dialogPreview, #dialogShowInfo, #dialogCSTimer, #dialogAddTime,#dialogRecord,#dialogScramble,input[type="checkbox"],#tool,#sessionStats,#previewVideo,#sessionRecords, tr:first-child td, .tool {
    color:@text;
    background-color: @base;
    border-color: @border;
}

#sessionRecordsContainer {
    border-color: @border;
    background-color: @base;
}

button:hover, select:hover,input[type="checkbox"]:hover {
    border-color:darken(@border,@darken,relative);
}

button:active {
    background-color: darken(@base,@darken,relative);
    border-color: darken(@border,@darken,relative);
    color:darken(@text,@darken,relative);
}

.cross {
    background-image: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='26' height='26' viewBox='0 0 24 24'><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='6,6 18,18'></polyline><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='18,6 6,18'></polyline></svg>"); 
    background-color: @base;
}

#sessionButton {
    background-image: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0' y='0' width='24' height='24' viewBox='0 0 24 24'><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='4,12 6,12'></polyline><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='4,6 6,6'></polyline><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='4,18 6,18'></polyline><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='8,12 20,12'></polyline><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='8,6 20,6'></polyline><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='8,18 20,18'></polyline></svg>");
    background-color: @base;
}

#preferencesButton {
    background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='26' height='26' viewBox='0 0 24 24'><circle cx='12' cy='12' r='5' stroke='@{text}' stroke-width='3' fill='none'></circle><polyline stroke-width='3.5' cap='square' fill='none' stroke='@{text}' points='12,3 12,6'></polyline><polyline stroke-width='3.5' cap='square' fill='none' stroke='@{text}' points='12,21 12,18'></polyline><polyline stroke-width='3.5' cap='square' fill='none' stroke='@{text}' points='3,12 6,12'></polyline><polyline stroke-width='3.5' cap='square' fill='none' stroke='@{text}' points='21,12 18,12'></polyline><polyline stroke-width='3.5' cap='square' fill='none' stroke='@{text}' points='18.2,5.8 16,8'></polyline><polyline stroke-width='3.5' cap='square' fill='none' stroke='@{text}' points='5.8,18.2 8,16'></polyline><polyline stroke-width='3.5' cap='square' fill='none' stroke='@{text}' points='5.8,5.8 8,8'></polyline><polyline stroke-width='3.5' cap='square' fill='none' stroke='@{text}' points='18.2,18.2 16,16'></polyline></svg>");   
    background-color: @base;
}

#previewButton {
    background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='26' height='26' viewBox='0 0 24 24'><polyline stroke-width='0' cap='square' fill='@{text}' stroke='@{text}' points='4,7 4,17 16,17 16,14 20,16 20,8 16,10 16,7'></polyline></svg>");    
    background-color: @base;
}

.cross:active, #sessionButton:active, #previewButton:active, #preferencesButton:active {
    background-color: darken(@base,@darken,relative);
}


select {
    border-color:@border;
    color:@text;
    background-image: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='26' height='26' viewBox='0 0 24 24'><path fill='@{text}' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>"); 
    
    background-color: @base;
    background-position: 100% 50%;
    background-repeat: no-repeat;
}

#addToolButton {
    border-color:@border;
    background-image: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='26' height='26' viewBox='0 0 24 24'><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='12,6 12,18'></polyline><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='6,12 20,12'></polyline></svg>"); 
    background-color: @base;
}

select:hover {
    border-color: darken(@border,@darken,relative);
}

#sessionSolvesTable, #sessionDetails ,#sessionRecords {
    border-color:@border;
}

#sessionRecords td:nth-child(2):hover {
    background: darken(@base,@darken,relative);
    color: darken(@text,@darken,relative);
}    

.selectable:hover, .selectable p:hover {
    background: darken(@base,@darken,relative);
}

#sessionRecords tr:first-child td {
    background:@base;
}

#sessionRecords tr:first-child td:hover {
    background:@base;
}

.ui-dialog .ui-dialog-titlebar {
    color:@text;
}

#recordScramble {
    color:@text;
}

input[type="checkbox"]:checked {
    background-image: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0' y='0' width='24' height='24' viewBox='0 0 24 24'><polyline stroke-width='2' cap='square' fill='none' stroke='@{text}' points='4,11 10,17 20,7'></polyline></svg>");
    background-position: 45% 50%;
}

input[type="checkbox"]:active {
    border-color:darken(@border,@darken,relative);
    background-color: darken(@base,@darken,relative);
}

.ui-tabs-active button {
    border-color: solid 2px @border;
}

:not(.ui-tabs-active).tab button {
    border-bottom-color: solid 2px @base;
}

#tabs-1,#tabs-2,#tabs-3,#tabs-4 {
    border-bottom: solid 2px @border;
    border-top: solid 2px @border;
}

.tab button {
    border-bottom: 0px;
    transition: 0s;
}

:not(.ui-tabs-active).tab button {
    border-color:@border;
    padding-bottom:0px;
}

button, select, input,textarea, #tool, #sessionRecords,#sessionStats,#sessionDetails,#sessionRecordsContainer {
     -webkit-box-shadow: 0px 5px 5px 0px rgba(0,0,0,0.4);
}

.tab a button, #addTimeButton,#sessionRecords {
    -webkit-box-shadow: 0px 0px 0px 0px rgba(0,0,0,0);
}

.loading {
    background-color: @base;
    background: url('data:image/svg+xml;utf8,<svg width="24px" height="24px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid"><rect x="0" y="0" width="24" height="24" fill="@{base}"></rect><circle cx="12" cy="12" r="8" stroke-dasharray="30 10" stroke="@{text}" fill="none" stroke-width="2"><animateTransform attributeName="transform" type="rotate" values="0 12 12;180 12 12;360 12 12;" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="0s"></animateTransform></circle></svg>');
    background-position: 45% 50%;
}

#messageShowInfo {
    border-top-color: @border;
}

#metronomeBPMSlider {
    background-color: @border;
}

#metronomeBPMSlider::-webkit-slider-thumb {
    background-color: @text;
}

#metronomeBPMLabel {
    color: @text;
}

`, function (e, output) {
        if (e == null) {
            document.getElementById("theme").innerHTML = output.css
        }
    });
}