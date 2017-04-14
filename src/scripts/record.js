// record.js
// Manages record menu and provides recording functionality
// Block Keeper
// Created by Dallas McNeil

var RecordRTC = require('recordrtc');
const {win} = require('electron')

var hasVideo = false
var hasCamera = false

var session = {
    audio: true,
    video: true
};

// Initialize dialog to present recorded video
$("#dialogPreview").dialog({
    autoOpen : false,
    modal : true,
    show:"fade",
    hide:"fade",
    position: {
        my:"center",
        at:"center",
        of:"#background"
    },
    width: 484,
    height: 510
}).on('keydown',function(evt) {
    if (evt.keyCode === $.ui.keyCode.ESCAPE) {
        closePreview()
    } else if (evt.keyCode === $.ui.keyCode.SPACE){
        if (document.getElementById("previewVideo").paused) {
            document.getElementById("previewVideo").play()
        } else {
            document.getElementById("previewVideo").pause()
        }
    }         
    evt.stopPropagation();
});

$("#previewButton").addClass("disabled")
$("#previewButton").prop("disabled",true)
var mediaStream = null
var recorder = null

// Setup the recorder before recording
function setupRecorder() {
    if (preferences.recordSolve) {
        if (mediaStream == null&&recorder == null) {
            navigator.getUserMedia(session,function(stream) {
                mediaStream = stream;
                recorder = RecordRTC(mediaStream,{
                    type: 'video',
                    frameInterval: 20,
                    recorderType: RecordRTC.WhammyRecorder
                });
                hasCamera = true
            },function(error) {
                hasCamera = false
            });
        }
    } else {
        mediaStream = null
        recorder = null
    }
    if (mediaStream == null) {
        hasCamera = false
    }
}

// Start recording through camera
function startRecorder() {
    if (hasCamera && preferences.recordSolve) {
        recorder.clearRecordedData()
        recorder.initRecorder()
        recorder.startRecording()
    }
}

// Stop recording camera
function stopRecorder() {
    if (hasCamera && preferences.recordSolve) {
        recorder.stopRecording(function(vidurl) {
            $("#previewButton").removeClass("disabled")
            $("#previewButton").prop("disabled",false)
            hasVideo = true
            document.getElementById("previewVideo").src = vidurl;
        })
    }
}

// Show the dialog which presents the recording
function showPreview() {
    if ($('#dialogPreview').dialog('isOpen')) {
        closePreview()
    } else { 
        $("#dialogPreview").dialog("open")
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
        $("#tool").prop('disabled', true)
        $("#toolSelect").addClass("disabled")
        $("#tool").addClass("disabled")
        
        preferencesOpen = true
        if (timerState == "inspectReady") {
            cancelTimer()
        }
    }
}

// Close recording dialog
function closePreview() {
    $("#dialogPreview").dialog("close")
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
    $("#tool").prop('disabled', false)
    $("#toolSelect").removeClass("disabled")
    $("#tool").removeClass("disabled")
    preferencesOpen = false
}

// Save the preview to a .webm file
function savePreview() {
    recorder.save(puzzles[currentPuzzle].name+" "+puzzles[currentPuzzle].sessions[currentSession].name)
}
