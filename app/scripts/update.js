// update.js
// Presents release notes
// Block Keeper
// Created by Dallas McNeil

var update = function(){

    $("#dialogUpdate").dialog({
        autoOpen:false,
        modal:true,
        show:"fade",
        hide:"fade",
        position: {
            my:"center",
            at:"center",
            of:"#background"
        },
        width:"520",
        height:"480" 
    }).on('keydown',function(evt) {
        if (evt.keyCode === $.ui.keyCode.ESCAPE || evt.keyCode === 13) {
            closeUpdate();
        }  
        evt.stopPropagation();
    });

    require('electron').ipcRenderer.on('update', function(event, message) { 
        showNotes();
    });

    function showNotes() {
        var releaseURL = "https://api.github.com/repos/DallasMcNeil/Block-Keeper/releases/latest?v="+Date.now();
        $.get(releaseURL, function(data, err) {
            function show() {
                if (globals.menuOpen || timer.timerState() != "normal") {
                    // Try showing in 10 seconds
                    console.log("Couldn't present update, try again in 10 seconds");
                    setTimeout(show, 10000);
                } else {
                    $("#dialogUpdate").dialog("open");
                    $("#updateHeading").text(data.name);
                    $("#updateInfo").html("A new update is being downloaded and will be installed automatically.<br><br>Release notes");
                    $("#updateNotes").text(data.body);
                    disableAllElements("");
                    globals.menuOpen = true;
                }
            }
            if (data) {
                show();
            } else {
                console.log(err);
            }
        });
    }

    function closeUpdate() {
        $("#dialogUpdate").dialog("close");
        enableAllElements();
        globals.menuOpen = false;
    }

    return {
        showNotes:showNotes,
        closeUpdate:closeUpdate
    };
}();