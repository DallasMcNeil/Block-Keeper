// record.js
// Manages record menu and provides recording functionality
// Block Keeper
// Created by Dallas McNeil

const record = function() {

    // Initialize dialog to present recorded video
    $("#dialogPreview").dialog({
        autoOpen:false,
        modal:true,
        show:"fade",
        hide:"fade",
        position:{
            my:"center",
            at:"center",
            of:"#background"
        },
        width:484,
        height:510
    }).on('keydown', function(evt) {
        if (evt.keyCode === $.ui.keyCode.ESCAPE) {
            closePreview()
        } else if (evt.keyCode === $.ui.keyCode.SPACE){
            if (document.getElementById("previewVideo").paused) {
                document.getElementById("previewVideo").play();
            } else {
                document.getElementById("previewVideo").pause();
            }
        } else if (evt.keyCode === 13) {
            closePreview();
            evt.preventDefault();
        }         
        evt.stopPropagation();
    });
    
    // Disable button to view it by default
    disableElement("#previewButton")
    
    // If a video has been recorded and is viewable
    var hasVideo = false;
    // If a camera is available to record
    var hasCamera = false;
    // If the camera is recording
    var recording = false;

    // Camera media stream
    var mediaStream = null;
    // Currently recording recorder
    var recorder = null;
    // Finished recording recorder
    var finishedRecorder = null;
    
    // Setup the recorder before recording
    function setupRecorder() {
        if (preferences.recordSolve) {
            if (mediaStream == null && recorder == null) {
                navigator.getUserMedia({video:true, audio:false}, function(stream) {
                    mediaStream = stream;
                    recorder = RecordRTC(mediaStream,{
                        type: 'video',
                        frameInterval: 25,
                        width: 640,
                        height: 480,
                        recorderType: RecordRTC.WhammyRecorder
                    });
                    hasCamera = true;
                }, function(error) {
                    if (error) {
                        hasCamera = false;
                        throw error;
                    }
                });
            }
        } else {
            mediaStream = null;
            recorder = null;
        }
        if (mediaStream == null) {
            hasCamera = false;
        }
    }

    // Start recording through camera
    function startRecorder() {
        if (hasCamera && preferences.recordSolve) {
            recorder.clearRecordedData();
            recorder.initRecorder();
            recorder.startRecording();
            recording = true;
            disableElement("#previewButton");
            $("#previewButton").addClass("loading");
        }
    }

    // Stop recording through camera and make the video viewable
    function stopRecorder() {  
        if (hasCamera && preferences.recordSolve) {
            hasVideo = false;
            finishedRecorder = recorder;
            recorder = RecordRTC(mediaStream,{
                type: 'video',
                frameInterval: 25,
                width: 640,
                height: 480,
                recorderType: RecordRTC.WhammyRecorder
            });
            finishedRecorder.stopRecording(function(vidurl) {
                recording = false;
                hasVideo = true;
                enableElement("#previewButton");
                $("#previewButton").removeClass("loading");
                document.getElementById("previewVideo").src = vidurl;
                if (preferences.autosaveLocation !== "") {
                    autosaveVideo(finishedRecorder.blob);
                }
            })
        }
    }

    // Stop the recorder and discard the video
    function cancelRecorder() {
        if (hasCamera && preferences.recordSolve) {
            finishedRecorder = recorder;
            recorder = RecordRTC(mediaStream,{
                type: 'video',
                frameInterval: 25,
                width: 640,
                height: 480,
                recorderType: RecordRTC.WhammyRecorder
            });
            finishedRecorder.stopRecording(function(vidurl) {
                recording = false;
                if (hasVideo) {
                    enableElement("#previewButton");
                    $("#previewButton").removeClass("loading");
                }
            });
        }
    }

    // Show the dialog which presents the recording
    function openPreview() {
        if ($('#dialogPreview').dialog('isOpen')) {
            closePreview();
        } else { 
            $("#dialogPreview").dialog("open");
            disableAllElements("previewButton");

            globals.menuOpen = true;
            if (timerState == "inspectReady") {
                cancelTimer();
            }
        }
    }

    // Close recording dialog
    function closePreview() {
        $("#dialogPreview").dialog("close");
        enableAllElements();
        globals.menuOpen = false;
    }

    // TODO
    // Save the previewed video to a .webm file
    function saveVideo() {
        finishedRecorder.save(puzzles[currentPuzzle].name+" "+puzzles[currentPuzzle].sessions[currentSession].name);
    }

    // Saves the current video automatically to a set location
    function autosaveVideo(blob) {
        var d = new Date();
        var time = d.getHours()+"-"+d.getMinutes();

        // TODO
        var path = preferences.autosaveLocation+"/"+puzzles[currentPuzzle].name+" "+puzzles[currentPuzzle].sessions[currentSession].name.replace(new RegExp("/","g"),"-")+" "+time+".webm";

        var n = 1;
        while (fs.existsSync(path)) {
            // TODO
            path = preferences.autosaveLocation+"/"+puzzles[currentPuzzle].name+" "+puzzles[currentPuzzle].sessions[currentSession].name.replace(new RegExp("/","g"),"-")+" "+time+" "+n+".webm";
            n++;
        }

        // Write file
        var reader = new FileReader();
        reader.onload = function() {
            var buffer = new Buffer(reader.result);
            fs.writeFile(path, buffer, {}, function(error, res) {
                if (error) {
                    throw error;
                    return;
                }
            })
        }
        reader.readAsArrayBuffer(blob);
    }
    
    function returnHasVideo() {
        return hasVideo;
    }
    
    function returnRecording() {
        return recording;
    }
    
    return {
        setupRecorder:setupRecorder,
        startRecorder:startRecorder,
        stopRecorder:stopRecorder,
        cancelRecorder:cancelRecorder,
        openPreview:openPreview,
        closePreview:closePreview,
        saveVideo:saveVideo,
        hasVideo:returnHasVideo,
        recording:returnRecording
    }
}()
