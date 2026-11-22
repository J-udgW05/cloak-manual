/* Code block and section permalink copy controller */
(function () {
    'use strict';

    var isEn = (document.documentElement.getAttribute('lang') || '').toLowerCase() === 'en';
    var LBL_COPY = isEn ? 'Copy' : 'Копировать';
    var LBL_COPIED = isEn ? 'Copied' : 'Скопировано';
    var LBL_LINK = isEn ? 'Link' : 'Ссылка';

    var COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    var CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    function codeText(block) {
        var text = '';
        for (var i = 0; i < block.childNodes.length; i++) {
            var node = block.childNodes[i];
            if (node.nodeType === 3) {
                text += node.nodeValue;
            } else if (node.nodeType === 1 && !node.classList.contains('code-copy')) {
                text += node.textContent;
            }
        }
        return text.trim();
    }

    function legacyCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { }
        document.body.removeChild(ta);
    }

    function flash(btn) {
        btn.innerHTML = CHECK_ICON;
        btn.classList.add('ok');
        btn.setAttribute('aria-label', LBL_COPIED);
        btn.setAttribute('title', LBL_COPIED);
        setTimeout(function () {
            btn.innerHTML = COPY_ICON;
            btn.classList.remove('ok');
            btn.setAttribute('aria-label', LBL_COPY);
            btn.setAttribute('title', LBL_COPY);
        }, 1500);
    }

    function init() {
        document.querySelectorAll('.code-block').forEach(function (block) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'code-copy';
            btn.setAttribute('aria-label', LBL_COPY);
            btn.setAttribute('title', LBL_COPY);
            btn.innerHTML = COPY_ICON;
            block.appendChild(btn);
        });

        document.addEventListener('click', function (e) {
            var codeBtn = e.target.closest && e.target.closest('.code-copy');
            if (codeBtn) {
                var text = codeText(codeBtn.parentNode);
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text).catch(function () { legacyCopy(text); });
                } else {
                    legacyCopy(text);
                }
                flash(codeBtn);
                return;
            }

            var linkBtn = e.target.closest && e.target.closest('.card-link-copy');
            if (linkBtn) {
                var card = linkBtn.closest('section.card');
                if (!card || !card.id) return;
                var url = window.location.href.split('#')[0] + '#' + card.id;
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(url).catch(function () { legacyCopy(url); });
                } else {
                    legacyCopy(url);
                }
                var span = linkBtn.querySelector('span');
                var oldText = span ? span.textContent : LBL_LINK;
                linkBtn.classList.add('copied');
                if (span) { span.textContent = LBL_COPIED; }
                setTimeout(function () {
                    linkBtn.classList.remove('copied');
                    if (span) { span.textContent = oldText; }
                }, 1500);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
