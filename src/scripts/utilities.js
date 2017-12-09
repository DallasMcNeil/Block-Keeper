// utilities.js
// General global functions for convenience
// Block Keeper
// Created by Dallas McNeil

// Disable a specific element so it cannot be interacted with
function disableElement(elem) {
    $(elem).addClass("disabled");
    $(elem).prop("disabled",true);
}

// Enable a specific element to be interacted with
function enableElement(elem) {
    $(elem).removeClass("disabled");
    $(elem).prop("disabled",false);
}

// Disable all major elements, with exception
function disableAllElements(exception = "") {
    var elements = $("#content").children();
    for (e in elements) {
        if (elements[e].id !== exception && elements[e].id !== undefined) {
            disableElement("#"+elements[e].id);
        }
    }
}

// Enable all major elements
function enableAllElements() {
    var elements = $("#content").children();
    for (e in elements) {
        enableElement("#"+elements[e].id);
    }
}