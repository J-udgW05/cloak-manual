/* Table of contents search with clear button and "/" shortcut */
(function () {
    'use strict';

    var desktopSearch = document.getElementById('toc-search');
    var mobileSearch = document.getElementById('mobile-toc-search');
    var desktopClear = document.getElementById('toc-search-clear');
    var mobileClear = document.getElementById('mobile-toc-search-clear');
    var sidebarEmpty = document.getElementById('sidebar-empty');
    var mobileEmpty = document.getElementById('mobile-empty');

    var searchTimer = null;

    function updateClearButtons(val) {
        var hasVal = !!(val && val.length > 0);
        if (desktopClear) desktopClear.classList.toggle('visible', hasVal);
        if (mobileClear) mobileClear.classList.toggle('visible', hasVal);
    }

    function filterContainer(container, emptyEl, q) {
        if (!container) return;
        var links = container.querySelectorAll('.nav-link');
        var hits = 0;
        links.forEach(function (a) {
            var hit = !q || a.textContent.toLowerCase().indexOf(q) !== -1;
            a.style.display = hit ? '' : 'none';
            if (hit) hits++;
        });

        var headers = container.querySelectorAll('.nav-chapter-header');
        headers.forEach(function (header) {
            if (!q) {
                header.style.display = '';
                return;
            }
            var next = header.nextElementSibling;
            var hasVisible = false;
            while (next && !next.classList.contains('nav-chapter-header')) {
                if (next.classList.contains('nav-link') && next.style.display !== 'none') {
                    hasVisible = true;
                    break;
                }
                next = next.nextElementSibling;
            }
            header.style.display = hasVisible ? '' : 'none';
        });

        if (emptyEl) {
            emptyEl.style.display = (q && hits === 0) ? 'block' : 'none';
        }
    }

    function filter(q) {
        q = (q || '').trim().toLowerCase();
        filterContainer(document.querySelector('.sidebar-nav'), sidebarEmpty, q);
        filterContainer(document.querySelector('.mobile-menu-nav'), mobileEmpty, q);
    }

    function clearAll(focusInput) {
        if (desktopSearch) desktopSearch.value = '';
        if (mobileSearch) mobileSearch.value = '';
        updateClearButtons('');
        filter('');
        if (focusInput && typeof focusInput.focus === 'function') {
            focusInput.focus();
        }
    }

    function syncSearch(e) {
        var val = e.target.value;
        if (desktopSearch && desktopSearch !== e.target) desktopSearch.value = val;
        if (mobileSearch && mobileSearch !== e.target) mobileSearch.value = val;
        updateClearButtons(val);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            filter(val);
        }, 150);
    }

    function init() {
        [desktopSearch, mobileSearch].forEach(function (input) {
            if (!input) return;
            input.addEventListener('input', syncSearch);
            input.addEventListener('search', syncSearch);
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    clearAll(null);
                    input.blur();
                }
            });
        });

        if (desktopClear) {
            desktopClear.addEventListener('click', function () { clearAll(desktopSearch); });
        }
        if (mobileClear) {
            mobileClear.addEventListener('click', function () { clearAll(mobileSearch); });
        }

        // Minimalist "/" shortcut to focus sidebar search
        document.addEventListener('keydown', function (e) {
            if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
            var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) return;
            if (desktopSearch && desktopSearch.offsetParent !== null) {
                e.preventDefault();
                desktopSearch.focus();
                desktopSearch.select();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
