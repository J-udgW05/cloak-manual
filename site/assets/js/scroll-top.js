/* Scroll-to-top button controller */
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
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
