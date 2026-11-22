(function () {
    if (window.top !== window.self) {
        try { window.top.location = window.self.location; } catch (e) { }
    }
    try {
        var theme = localStorage.getItem('bp_theme');
        if (!theme) {
            theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
        }
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        var metaTheme = document.getElementById('theme-color-meta');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'light' ? '#f6f8fb' : '#0d1017');
        }

        var lang = localStorage.getItem('bp_lang');
        if (lang !== 'en' && lang !== 'ru') {
            lang = 'ru';
        }
        document.documentElement.setAttribute('data-lang', lang);
        document.documentElement.setAttribute('lang', lang);
    } catch (e) { }
})();
