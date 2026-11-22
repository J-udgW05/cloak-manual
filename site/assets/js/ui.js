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

/* Language switcher (brand & title localization; full EN content planned) */
(function () {
    'use strict';

    var BRAND = {
        ru: 'Плащ анонимности: Руководство',
        en: 'Cloak Manual'
    };

    var langBtn = document.getElementById('lang-toggle');
    var baseTitle = document.title;
    var titlePrefix = baseTitle.indexOf(' // ') !== -1 ? baseTitle.split(' // ')[0] : '';

    function getLang() {
        return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'ru';
    }

    function applyLang(lang) {
        var brand = BRAND[lang] || BRAND.ru;
        document.documentElement.setAttribute('data-lang', lang);
        document.documentElement.setAttribute('lang', lang);
        try {
            localStorage.setItem('bp_lang', lang);
        } catch (e) {}

        document.querySelectorAll('[data-i18n-brand]').forEach(function (el) {
            el.textContent = brand;
        });

        document.querySelectorAll('.footer-copy').forEach(function (el) {
            el.textContent = '© 2026 ' + brand + '. Свободное распространение под CC BY-NC-SA 4.0.';
        });

        document.title = titlePrefix ? (titlePrefix + ' // ' + brand) : brand;

        if (langBtn) {
            langBtn.textContent = lang.toUpperCase();
            var label = lang === 'ru' ? 'Переключить язык на английский (EN)' : 'Switch language to Russian (RU)';
            langBtn.setAttribute('aria-label', label);
            langBtn.setAttribute('title', label);
        }
    }

    applyLang(getLang());

    if (langBtn) {
        langBtn.addEventListener('click', function () {
            applyLang(getLang() === 'ru' ? 'en' : 'ru');
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

/* Offline PWA Service Worker registration */
(function () {
    'use strict';
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.protocol === 'http:')) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('./sw.js').catch(function () {});
        });
    }
})();
