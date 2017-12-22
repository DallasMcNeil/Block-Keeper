// style.js
// Creates CSS to color the UI
// Block Keeper
// Created by Dallas McNeil

const style = function() {
    
    var less = require("less");
    var fs = require("fs");
    var path = require("path");
    
    // Store style sheet
    var styleSheet = "";
    
    // Load style sheet from file
    fs.readFile(path.join(__dirname, "styles", "base.less"), "utf8", function(error, data) {
        if (error) {
            throw error;
        } else {
            var lines = data.split("\n");
            lines.splice(0,1);
            styleSheet = lines.join("\n");
        }
    })

    // Use Less to generate style sheet with theme colors to color UI
    function setStyle(colors) {
        less.render("@background:" + colors[0] + ";@timer:" + colors[1] + ";@scramble:" + colors[2] + ";@base:" + colors[3] + ";@border:" + colors[4] + ";@text:" + colors[5] + ";@scrambleSize:" + preferences.scrambleSize + "vh;" + styleSheet, function(error, output) {
            if (error) {
                throw error;
            } else {
                document.getElementById("theme").innerHTML = output.css;
            }
        })
    }
    
    return {
        setStyle:setStyle
    }
}()