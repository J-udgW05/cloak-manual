/* Theme switcher */
(function () {
    'use strict';
    var toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('bp_theme', theme);
        } catch (e) {}
        var metaTheme = document.getElementById('theme-color-meta');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'light' ? '#f6f8fb' : '#0d1017');
        }
    }

    toggleBtn.addEventListener('click', function () {
        var current = getTheme();
        var next = current === 'light' ? 'dark' : 'light';
        setTheme(next);
    });
})();

/* Language switcher (Globe + Chevron #L07 with Segmented Switch RU | EN popover) */
(function () {
    'use strict';

    var langDropdown = document.getElementById('lang-dropdown');
    var langBtn = document.getElementById('lang-toggle');
    var segBtns = document.querySelectorAll('.lang-seg-btn[data-lang-opt]');

    function isEnPage() {
        return /(?:^|\/)en(?:\/|$)/i.test(window.location.pathname || '');
    }

    function getPageFile() {
        var path = (window.location.pathname || '').toLowerCase();
        if (path.indexOf('privacy.html') !== -1) return 'privacy.html';
        if (path.indexOf('disclaimer.html') !== -1) return 'disclaimer.html';
        if (path.indexOf('license.html') !== -1) return 'license.html';
        return 'index.html';
    }

    function getLang() {
        return isEnPage() ? 'en' : 'ru';
    }

    function closeDropdown() {
        if (langDropdown) {
            langDropdown.classList.remove('is-open');
        }
        if (langBtn) {
            langBtn.setAttribute('aria-expanded', 'false');
        }
    }

    function syncLangUI(lang) {
        document.documentElement.setAttribute('data-lang', lang);
        document.documentElement.setAttribute('lang', lang);

        segBtns.forEach(function (btn) {
            var opt = btn.getAttribute('data-lang-opt');
            if (opt === lang) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        if (langBtn) {
            var label = lang === 'ru' ? 'Язык: RU (выбрать язык)' : 'Language: EN (select language)';
            langBtn.setAttribute('aria-label', label);
            langBtn.setAttribute('title', label);
        }
    }

    var currentLang = getLang();
    syncLangUI(currentLang);

    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = langDropdown.classList.toggle('is-open');
            langBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        segBtns.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var opt = btn.getAttribute('data-lang-opt');
                if (opt !== 'ru' && opt !== 'en') {
                    closeDropdown();
                    return;
                }
                if (opt === currentLang) {
                    closeDropdown();
                    return;
                }
                try {
                    localStorage.setItem('bp_lang', opt);
                } catch (err) {}
                var pageFile = getPageFile();
                var hash = window.location.hash || '';
                closeDropdown();
                window.location.href = (opt === 'en' ? './en/' : '../') + pageFile + hash;
            });
        });

        document.addEventListener('click', function (e) {
            if (!langDropdown.contains(e.target)) {
                closeDropdown();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeDropdown();
            }
        });
    }
})();

/* External link-button enhancement: Unified Split Pill + Accent Arrow */
(function () {
    'use strict';

    var ARROW_SVG = '<svg class="ext-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>';

    function enhanceLinkButtons() {
        document.querySelectorAll('a.tag').forEach(function (link) {
            if (!link.querySelector('.ext-arrow')) {
                link.insertAdjacentHTML('beforeend', ARROW_SVG);
            }
            var next = link.nextElementSibling;
            if (next && next.classList.contains('archive-pill') && (!link.parentElement || !link.parentElement.classList.contains('link-pair'))) {
                var pair = document.createElement('span');
                pair.className = 'link-pair';
                link.parentNode.insertBefore(pair, link);
                pair.appendChild(link);
                pair.appendChild(next);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceLinkButtons);
    } else {
        enhanceLinkButtons();
    }
})();

/* Scroll-to-top button controller (embedded in ui.js to avoid extension filter false positives on scroll-top.js) */
(function () {
    'use strict';

    var SHOW_AT = 180;

    function getScrollY() {
        var y = Math.max(
            window.scrollY || 0,
            window.pageYOffset || 0,
            (document.scrollingElement && document.scrollingElement.scrollTop) || 0,
            (document.documentElement && document.documentElement.scrollTop) || 0,
            (document.body && document.body.scrollTop) || 0
        );
        var layout = document.querySelector('.layout') || document.body;
        if (layout && layout.getBoundingClientRect) {
            var rectTop = -layout.getBoundingClientRect().top;
            if (rectTop > y) y = rectTop;
        }
        return y;
    }

    function scrollAllToTop() {
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
        var targets = [document.scrollingElement, document.documentElement, document.body];
        targets.forEach(function (el) {
            if (el && el.scrollTop > 0) {
                try {
                    if (el.scrollTo) {
                        el.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        el.scrollTop = 0;
                    }
                } catch (e) {
                    el.scrollTop = 0;
                }
            }
        });
    }

    function initPageUp() {
        var btn = document.getElementById('page-up-btn') || document.getElementById('to-top');
        if (!btn) return;
        var menu = document.getElementById('mobile-menu');

        function sync() {
            var menuOpen = !!(menu && menu.classList.contains('open'));
            var show = !menuOpen && getScrollY() > SHOW_AT;
            if (show) {
                btn.classList.remove('page-up-btn--hidden');
                btn.classList.remove('to-top--hidden');
                btn.removeAttribute('aria-hidden');
            } else {
                btn.classList.add('page-up-btn--hidden');
                btn.classList.add('to-top--hidden');
                btn.setAttribute('aria-hidden', 'true');
            }
        }

        window.syncToTop = sync;

        btn.addEventListener('click', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            scrollAllToTop();
            sync();
        });

        var ticking = false;
        function onScroll() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(function () {
                    ticking = false;
                    sync();
                });
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('scroll', onScroll, { capture: true, passive: true });
        if (document.body) {
            document.body.addEventListener('scroll', onScroll, { passive: true });
        }
        window.addEventListener('wheel', onScroll, { passive: true });
        window.addEventListener('touchmove', onScroll, { passive: true });
        window.addEventListener('keyup', onScroll, { passive: true });
        window.addEventListener('resize', sync);
        window.addEventListener('orientationchange', sync);
        window.addEventListener('load', sync);
        window.addEventListener('pageshow', sync);
        window.addEventListener('hashchange', function () { setTimeout(sync, 60); });

        if (menu && menu.querySelectorAll) {
            menu.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', sync);
            });
        }

        sync();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageUp);
    } else {
        initPageUp();
    }
})();

/* Offline PWA Service Worker registration */
(function () {
    'use strict';
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.protocol === 'http:')) {
        var isEnPage = /(?:^|\/)en(?:\/|$)/i.test(window.location.pathname || '');
        var swPath = isEnPage ? '../sw.js' : './sw.js';
        window.addEventListener('load', function () {
            navigator.serviceWorker.register(swPath, { updateViaCache: 'none' }).then(function (reg) {
                try { reg.update(); } catch (e) {}
            }).catch(function () {});
        });
    }
})();
