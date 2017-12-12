// globals.js
// Defines global constants
// Block Keeper
// Created by Dallas McNeil

const globals = function() {

    // Color scheme for scramble images
    var colorScheme = [
        "#F00", 
        "#F80",
        "#02F",
        "#0F0",
        "#FF0",
        "#FFF",
        "#000"
    ];

    // Color scheme for megaminx scramble images
    var minxColors = [
        "#FFF",
        "#F00",
        "#080",
        "#A0D",
        "#BB0",
        "#02A",
        "#FF6",
        "#0AF",
        "#F80",
        "#0F0",
        "#F6F",
        "#AAA"
    ];
    
    // Default theme colors
    var themeColors = [[
        "#181818",
        "#F0F0F0",
        "#B0B0B0",
        "#303030",
        "#606060",
        "#E0E0E0"
        ],[
        "#F8F8F8",
        "#000000",
        "#404040",
        "#FFFFFF",
        "#B0B0B0",
        "#101010"
        ],[
        "#000000",
        "#FFFFFF",
        "#FFFFFF",
        "#202020",
        "#505050",
        "#FFFFFF"
        ],[
        "#000030",
        "#F0F0FF",
        "#C0C0FF",
        "#202060",
        "#0000C0",
        "#FFFFFF"
        ],[
        "#002000",
        "#F0F0F0",
        "#C0E0C0",
        "#204020",
        "#00A000",
        "#FFFFFF"
        ],[
        "#200000",
        "#FFF0F0",
        "#E0C0C0",
        "#602020",
        "#C00000",
        "#FFFFFF"
        ],[
        "#FFF0FF",
        "#000000",
        "#600060",
        "#FFD0FF",
        "#FF60FF",
        "#000000"
        ],[
        "#FFFFF0",
        "#000000",
        "#606000",
        "#FFFFD0",
        "#E0E050",
        "#000000"
        ],[
        "#F0FFFF",
        "#000000",
        "#006060",
        "#D0FFFF",
        "#50E0E0",
        "#000000"
        ],[
        "#000000",
        "#44FF00",
        "#44FF00",
        "#000000",
        "#44FF00",
        "#FFFFFF"
        ],[
        "#000000",
        "#FF00DD",
        "#FF00DD",
        "#000000",
        "#FF00DD",
        "#FFFFFF"
        ],[
        "#000000",
        "#FFFF00",
        "#FFFF00",
        "#000000",
        "#FFFF00",
        "#FFFFFF"
        ],[
        "#000000",
        "#00D0FF",
        "#00D0FF",
        "#000000",
        "#00D0FF",
        "#FFFFFF"
    ]];
    
    var toolColors = ["#F20","#5F0","#0060FF"];
    
    return {
        cubeColors:colorScheme,
        minxColors:minxColors,
        themeColors:themeColors,
        toolColors:toolColors,
        menuOpen:false
    }
}()