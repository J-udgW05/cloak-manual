/* Synchronous chapter mount before nav.js & DOMContentLoaded */
(function () {
    'use strict';
    var root = document.getElementById('chapters-root');
    if (root && Array.isArray(window.PB_CHAPTERS)) {
        root.innerHTML = window.PB_CHAPTERS.join('\n');
        window.PB_CHAPTERS = null;
    }
}());
