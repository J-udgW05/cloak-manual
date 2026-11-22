/* Scroll-to-top button controller */
(function () {
    'use strict';

    var SHOW_AT = 180;

    function getScrollY() {
        return window.scrollY || window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop) || 0;
    }

    function init() {
        var btn = document.getElementById('to-top');
        if (!btn) return;
        var menu = document.getElementById('mobile-menu');

        function sync() {
            var menuOpen = !!(menu && menu.classList.contains('open'));
            var show = !menuOpen && getScrollY() > SHOW_AT;
            if (show) {
                btn.classList.remove('to-top--hidden');
                btn.removeAttribute('aria-hidden');
            } else {
                btn.classList.add('to-top--hidden');
                btn.setAttribute('aria-hidden', 'true');
            }
        }

        window.syncToTop = sync;

        btn.addEventListener('click', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        document.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', sync);
        window.addEventListener('orientationchange', sync);
        window.addEventListener('load', sync);
        window.addEventListener('pageshow', sync);

        if (menu && menu.querySelectorAll) {
            menu.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', sync);
            });
        }

        sync();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
