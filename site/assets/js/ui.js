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

    var BRAND = {
        ru: 'Плащ анонимности: Руководство',
        en: 'Cloak Manual'
    };

    var PAGE_TITLES = {
        index: { ru: 'Плащ анонимности: Руководство', en: 'Cloak Manual' },
        privacy: { ru: 'Политика конфиденциальности', en: 'Privacy Policy' },
        disclaimer: { ru: 'Отказ от ответственности', en: 'Legal Disclaimer' },
        license: { ru: 'Лицензия открытого контента', en: 'Open Content License' }
    };

    var langDropdown = document.getElementById('lang-dropdown');
    var langBtn = document.getElementById('lang-toggle');
    var segBtns = document.querySelectorAll('.lang-seg-btn[data-lang-opt]');

    function getPageKey() {
        var path = (window.location.pathname || '').toLowerCase();
        if (path.indexOf('privacy.html') !== -1) return 'privacy';
        if (path.indexOf('disclaimer.html') !== -1) return 'disclaimer';
        if (path.indexOf('license.html') !== -1) return 'license';
        return 'index';
    }

    function getLang() {
        return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'ru';
    }

    function closeDropdown() {
        if (langDropdown) {
            langDropdown.classList.remove('is-open');
        }
        if (langBtn) {
            langBtn.setAttribute('aria-expanded', 'false');
        }
    }

    function applyLang(lang) {
        var brand = BRAND[lang] || BRAND.ru;
        var pageKey = getPageKey();
        var titleEntry = PAGE_TITLES[pageKey] || PAGE_TITLES.index;

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

        document.title = titleEntry[lang] || titleEntry.ru;

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

    applyLang(getLang());

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
                if (opt === 'ru' || opt === 'en') {
                    applyLang(opt);
                }
                closeDropdown();
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

/* Offline PWA Service Worker registration */
(function () {
    'use strict';
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.protocol === 'http:')) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('./sw.js').catch(function () {});
        });
    }
})();
