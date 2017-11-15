// record.js
// Manages record menu and provides recording functionality
// Block Keeper
// Created by Dallas McNeil


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
    } else if (evt.keyCode === 13) {
        closePreview()
        evt.preventDefault();
    }         
    evt.stopPropagation();
});

$("#previewButton").addClass("disabled")
$("#previewButton").prop("disabled",true)
var mediaStream = null
var recorder = null
var finishedRecorder = null

// Setup the recorder before recording
function setupRecorder() {
    if (preferences.recordSolve) {
        if (mediaStream == null&&recorder == null) {
            navigator.getUserMedia(session,function(stream) {
                mediaStream = stream;
                recorder = RecordRTC(mediaStream,{
                    type: 'video',
                    frameInterval: 25,
                    width: 640,
                    height: 480,
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
        $("#previewButton").addClass("disabled")
        $("#previewButton").prop("disabled",true)
        $("#previewButton").addClass("loading")
    }
}

var videoLoading = false
// Stop recording camera
function stopRecorder() {  
    if (hasCamera && preferences.recordSolve) {
        videoLoading = true

        finishedRecorder = recorder
        recorder = RecordRTC(mediaStream,{
            type: 'video',
            frameInterval: 25,
            width: 640,
            height: 480,
            recorderType: RecordRTC.WhammyRecorder
        });
        finishedRecorder.stopRecording(function(vidurl) {
            $("#previewButton").removeClass("disabled")
            $("#previewButton").prop("disabled",false)
            $("#previewButton").removeClass("loading")
            hasVideo = true
            videoLoading = false
            document.getElementById("previewVideo").src = vidurl;
            if (preferences.autosaveLocation != "") {
                autosaveVideo(finishedRecorder.blob)
            }
        })
    }
}

function cancelRecorder() {
    if (hasCamera && preferences.recordSolve) {
        videoLoading = true

        finishedRecorder = recorder
        recorder = RecordRTC(mediaStream,{
            type: 'video',
            frameInterval: 25,
            width: 640,
            height: 480,
            recorderType: RecordRTC.WhammyRecorder
        });
        finishedRecorder.stopRecording(function(vidurl) {
            if (hasVideo) {
                $("#previewButton").removeClass("disabled")
                $("#previewButton").prop("disabled",false)
                $("#previewButton").removeClass("loading")
            }
            videoLoading = false
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
        $("#tools").prop('disabled', true)
        $("#toolSelect").addClass("disabled")
        $("#tools").addClass("disabled")
        $("#addToolButton").prop('disabled', true)
        $("#addToolButton").addClass("disabled")
        
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
    $("#tools").prop('disabled', false)
    $("#toolSelect").removeClass("disabled")
    $("#tools").removeClass("disabled")
    $("#addToolButton").prop('disabled', false)
    $("#addToolButton").removeClass("disabled")
        
    preferencesOpen = false
}

// Save the preview to a .webm file
function savePreview() {
    finishedRecorder.save(puzzles[currentPuzzle].name+" "+puzzles[currentPuzzle].sessions[currentSession].name)
}

// Saves the current video automatically to a set location
function autosaveVideo(blob) {
    var d = new Date()
    var time = d.getHours()+"-"+d.getMinutes()
    
    var path = preferences.autosaveLocation+"/"+puzzles[currentPuzzle].name+" "+puzzles[currentPuzzle].sessions[currentSession].name.replace(new RegExp("/","g"),"-")+" "+time+".webm"
    
    var n = 1;
    while (fs.existsSync(path)) {
        path = preferences.autosaveLocation+"/"+puzzles[currentPuzzle].name+" "+puzzles[currentPuzzle].sessions[currentSession].name.replace(new RegExp("/","g"),"-")+" "+time+" "+n+".webm"
        n++
    }
           
    var reader = new FileReader()
    reader.onload = function() {
        var buffer = new Buffer(reader.result)
        fs.writeFile(path, buffer, {}, (err, res) => {
            if(err){
                console.error(err)
                return
            }
        })
    }
    reader.readAsArrayBuffer(blob)
}
