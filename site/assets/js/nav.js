/* Navigation engine: active section tracking, mobile drawer, and anchor scrolling */
(function () {
    'use strict';

    // DOM controls
    var openBtn = document.getElementById('mobile-menu-btn');
    var closeBtn = document.getElementById('close-btn');
    var menu = document.getElementById('mobile-menu');
    var overlay = document.getElementById('overlay');
    var sidebarNav = document.querySelector('.sidebar-nav');
    var mobileNav = document.querySelector('.mobile-menu-nav');
    var currentTrackerText = document.getElementById('sidebar-current-text');

    // Index desktop and mobile TOC links
    var desktopLinksById = {};
    var mobileLinksById = {};
    var titlesById = {};
    var sections = [];
    var seenIds = {};

    var desktopLinks = sidebarNav ? Array.prototype.slice.call(sidebarNav.querySelectorAll('.nav-link')) : [];
    desktopLinks.forEach(function (a) {
        var href = a.getAttribute('href') || '';
        if (href.charAt(0) !== '#') return;
        var id = href.slice(1);
        if (!id) return;

        desktopLinksById[id] = a;
        if (!titlesById[id]) titlesById[id] = a.textContent.trim();

        if (!seenIds[id]) {
            seenIds[id] = true;
            var secEl = document.getElementById(id);
            if (secEl) sections.push(secEl);
        }
    });

    var mobileLinks = mobileNav ? Array.prototype.slice.call(mobileNav.querySelectorAll('.nav-link')) : [];
    mobileLinks.forEach(function (a) {
        var href = a.getAttribute('href') || '';
        if (href.charAt(0) !== '#') return;
        var id = href.slice(1);
        if (!id) return;

        mobileLinksById[id] = a;
        if (!titlesById[id]) titlesById[id] = a.textContent.trim();

        if (!seenIds[id]) {
            seenIds[id] = true;
            var secEl = document.getElementById(id);
            if (secEl) sections.push(secEl);
        }
    });

    var allNavLinks = desktopLinks.concat(mobileLinks);
    if (!sections.length) return;

    // Привязка глав к разделам
    var chapterHeaders = Array.prototype.slice.call(
        document.querySelectorAll('.sidebar-nav .nav-chapter-header, .mobile-menu-nav .nav-chapter-header')
    );

    function findChapterHeader(linkEl) {
        var prev = linkEl.previousElementSibling;
        while (prev) {
            if (prev.classList && prev.classList.contains('nav-chapter-header')) {
                return prev;
            }
            prev = prev.previousElementSibling;
        }
        return null;
    }

    var chapterHeadersById = {};
    for (var sid in seenIds) {
        chapterHeadersById[sid] = [];
        var dEl = desktopLinksById[sid];
        var mEl = mobileLinksById[sid];
        if (dEl) {
            var chD = findChapterHeader(dEl);
            if (chD && chapterHeadersById[sid].indexOf(chD) === -1) chapterHeadersById[sid].push(chD);
        }
        if (mEl) {
            var chM = findChapterHeader(mEl);
            if (chM && chapterHeadersById[sid].indexOf(chM) === -1) chapterHeadersById[sid].push(chM);
        }
    }

    // Состояние навигации
    var currentActiveId = null;
    var isNavJumping = false;
    var jumpTimer = null;
    var isUserScrollingNav = false;
    var userScrollTimer = null;

    // Отслеживание активной РУЧНОЙ прокрутки оглавления пользователем
    // Yield auto-scroll for 2.5s after manual user interaction
    function registerManualNavScroll(navEl) {
        if (!navEl) return;
        function onManualScroll() {
            isUserScrollingNav = true;
            clearTimeout(userScrollTimer);
            userScrollTimer = setTimeout(function () {
                isUserScrollingNav = false;
                if (currentActiveId && !isNavJumping) {
                    revealActive(currentActiveId, false);
                }
            }, 2500);
        }
        navEl.addEventListener('wheel', onManualScroll, { passive: true });
        navEl.addEventListener('touchmove', onManualScroll, { passive: true });
    }

    registerManualNavScroll(sidebarNav);
    registerManualNavScroll(mobileNav);

    // Умный центрирующий автоскролл
    function revealInNav(targetNav, linkEl, force) {
        if (!targetNav || !linkEl) return;
        if (targetNav.scrollHeight <= targetNav.clientHeight + 4) return;

        // Точное инвариантное вычисление вертикальной позиции внутри целевого контейнера
        var navRect = targetNav.getBoundingClientRect();
        var linkRect = linkEl.getBoundingClientRect();
        var exactTop = linkRect.top - navRect.top + targetNav.scrollTop;
        var linkHeight = linkEl.offsetHeight || 32;

        var navScrollTop = targetNav.scrollTop;
        var navClientHeight = targetNav.clientHeight;

        // Зона комфорта: центральные 50% высоты панели (25% сверху и снизу)
        var comfortTop = navScrollTop + (navClientHeight * 0.25);
        var comfortBottom = navScrollTop + navClientHeight - (navClientHeight * 0.25) - linkHeight;

        // Center active link when forced or out of view
        if (force || exactTop < comfortTop || exactTop > comfortBottom) {
            var targetCenter = exactTop - (navClientHeight / 2) + (linkHeight / 2);
            var maxScroll = targetNav.scrollHeight - navClientHeight;
            var clamped = Math.max(0, Math.min(maxScroll, targetCenter));

            var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var behavior = (prefersReduced || force === 'instant') ? 'auto' : 'smooth';

            targetNav.scrollTo({
                top: clamped,
                behavior: behavior
            });
        }
    }

    function revealActive(id, force) {
        if (!id) return;
        // 1. Сайдбар (десктоп) - используем строго desktopLinksById[id]
        var dLink = desktopLinksById[id];
        if (dLink && sidebarNav && (!isUserScrollingNav || force)) {
            revealInNav(sidebarNav, dLink, force);
        }
        // 2. Мобильное меню (если открыто) - используем строго mobileLinksById[id]
        var mLink = mobileLinksById[id];
        if (mLink && mobileNav && menu && menu.classList.contains('open') && (!isUserScrollingNav || force)) {
            revealInNav(mobileNav, mLink, force);
        }
    }

    // Jump to active section in sidebar when clicking the reading tracker
    var trackerEl = document.getElementById('sidebar-current-tracker');
    if (trackerEl) {
        function triggerLocateActive(e) {
            if (e && e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
            if (e && e.type === 'keydown') {
                e.preventDefault();
            }
            var targetId = currentActiveId;
            if (!targetId || !desktopLinksById[targetId]) {
                if (window.location.hash && desktopLinksById[window.location.hash.slice(1)]) {
                    targetId = window.location.hash.slice(1);
                } else if (sections.length > 0) {
                    targetId = sections[0].id;
                }
            }
            if (targetId && desktopLinksById[targetId]) {
                isUserScrollingNav = false;
                clearTimeout(userScrollTimer);
                var dLink = desktopLinksById[targetId];
                revealInNav(sidebarNav, dLink, true);
                dLink.classList.remove('pulse-highlight');
                void dLink.offsetWidth; // trigger reflow
                dLink.classList.add('pulse-highlight');
                setTimeout(function () {
                    dLink.classList.remove('pulse-highlight');
                }, 1300);
            }
        }
        trackerEl.addEventListener('click', triggerLocateActive);
        trackerEl.addEventListener('keydown', triggerLocateActive);
    }

    // Установка активного раздела в интерфейсе
    function setActive(id, scrollInNav, forceReveal) {
        if (!id || (id === currentActiveId && !forceReveal)) return;
        currentActiveId = id;

        // 1. Подсветка ссылок в оглавлении
        for (var i = 0; i < allNavLinks.length; i++) {
            var isCurrent = (allNavLinks[i].getAttribute('href') === '#' + id);
            allNavLinks[i].classList.toggle('active', isCurrent);
            if (isCurrent) {
                allNavLinks[i].setAttribute('aria-current', 'true');
            } else {
                allNavLinks[i].removeAttribute('aria-current');
            }
        }

        // 2. Подсветка родительских глав
        var activeChs = chapterHeadersById[id] || [];
        for (var c = 0; c < chapterHeaders.length; c++) {
            chapterHeaders[c].classList.toggle('active', activeChs.indexOf(chapterHeaders[c]) !== -1);
        }

        // 3. Обновление компактного индикатора в шапке панели
        if (currentTrackerText) {
            currentTrackerText.textContent = titlesById[id] || id;
        }

        // 4. Прокрутка оглавления
        if (scrollInNav) {
            revealActive(id, !!forceReveal);
        }
    }

    // Точный расчет целевой позиции якорного перехода
    function getPageScrollTop() {
        return Math.max(
            window.pageYOffset || 0,
            window.scrollY || 0,
            (document.scrollingElement && document.scrollingElement.scrollTop) || 0,
            (document.documentElement && document.documentElement.scrollTop) || 0,
            (document.body && document.body.scrollTop) || 0
        );
    }

    function getTargetScrollTop(targetEl) {
        var headerOffset = 72;
        var rect = targetEl.getBoundingClientRect();
        var currentScroll = getPageScrollTop();
        return Math.max(0, rect.top + currentScroll - headerOffset);
    }

    // Плавное бесшовное перемещение к якорной цели
    function navigateToSection(id, updateHistory, smooth) {
        if (!id) return;
        var targetEl = document.getElementById(id);
        if (!targetEl) return;

        // Блокируем скроллспай на время перехода во избежание мерцания промежуточных разделов
        isNavJumping = true;
        clearTimeout(jumpTimer);

        // Мгновенная подсветка целевого элемента для отзывчивости интерфейса
        setActive(id, true, true);

        var topPos = getTargetScrollTop(targetEl);
        var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var behavior = (smooth && !prefersReduced) ? 'smooth' : 'auto';

        window.scrollTo({
            top: topPos,
            behavior: behavior
        });
        if (document.body && document.body.scrollTop > 0) {
            try { document.body.scrollTo({ top: topPos, behavior: behavior }); } catch (e) { document.body.scrollTop = topPos; }
        }
        if (window.syncToTop) window.syncToTop();

        if (updateHistory) {
            try {
                history.pushState(null, '', '#' + id);
            } catch (e) {
                location.hash = id;
            }
        }

        jumpTimer = setTimeout(function () {
            isNavJumping = false;
            if (window.syncToTop) window.syncToTop();
            // Финальная синхронизация после окончания движения
            var finalId = calculateActiveSectionId();
            if (finalId) {
                setActive(finalId, false);
            }
        }, behavior === 'smooth' ? 480 : 50);
    }

    // Адаптивный детерминированный расчет активного раздела
    function calculateActiveSectionId() {
        var doc = document.documentElement;
        var scrollTop = getPageScrollTop();
        var winHeight = window.innerHeight;
        var docHeight = doc.scrollHeight;

        // Краевой случай 1: Самый верх страницы
        if (scrollTop <= 45) {
            return sections[0].id;
        }

        // Краевой случай 2: Самый низ страницы (последний пункт #end)
        if ((winHeight + scrollTop) >= (docHeight - 160)) {
            return sections[sections.length - 1].id;
        }

        // Если последняя секция уже заняла значительную часть экрана
        var lastTop = sections[sections.length - 1].getBoundingClientRect().top;
        if (lastTop <= winHeight * 0.70) {
            return sections[sections.length - 1].id;
        }

        // Адаптивная линия считывания (Reading Focus Line) - 28% высоты вьюпорта
        var focusLine = Math.max(90, Math.round(winHeight * 0.28));

        var low = 0;
        var high = sections.length - 1;
        var foundIndex = 0;

        while (low <= high) {
            var mid = (low + high) >> 1;
            var top = sections[mid].getBoundingClientRect().top;
            if (top <= focusLine) {
                foundIndex = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return sections[foundIndex].id;
    }

    // Mobile drawer open/close
    function openMenu() {
        if (!menu || !overlay) return;
        menu.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
        var toTopBtn = document.getElementById('page-up-btn') || document.getElementById('to-top');
        if (toTopBtn) {
            toTopBtn.classList.add('page-up-btn--hidden');
            toTopBtn.classList.add('to-top--hidden');
        }
        if (closeBtn) closeBtn.focus();

        if (currentActiveId) {
            revealActive(currentActiveId, true);
        }
    }

    function closeMenu() {
        if (!menu || !overlay) return;
        menu.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        if (openBtn) {
            openBtn.setAttribute('aria-expanded', 'false');
            openBtn.focus();
        }
        if (window.syncToTop) window.syncToTop();
    }

    if (openBtn) openBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu && menu.classList.contains('open')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024 && menu && menu.classList.contains('open')) {
            closeMenu();
        }
    });

    // Delegated anchor navigation handler
    document.addEventListener('click', function (e) {
        var anchor = e.target.closest ? e.target.closest('a[href*="#"]') : null;
        if (!anchor) return;

        var href = anchor.getAttribute('href') || '';
        var hashIndex = href.indexOf('#');
        if (hashIndex === -1) return;

        var targetId = href.slice(hashIndex + 1);
        if (!targetId) return;

        var targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        // Close mobile drawer if open
        if (menu && menu.classList.contains('open')) {
            closeMenu();
        }

        e.preventDefault();
        navigateToSection(targetId, true, true);
    });

    // Browser history hashchange handler
    window.addEventListener('hashchange', function () {
        var hash = (location.hash || '').slice(1);
        if (hash && document.getElementById(hash)) {
            navigateToSection(hash, false, true);
        }
    });

    // RequestAnimationFrame-throttled scroll listener
    var scrollTicking = false;
    function onScroll() {
        if (window.syncToTop) window.syncToTop();

        if (isNavJumping) return;

        if (!scrollTicking) {
            scrollTicking = true;
            window.requestAnimationFrame(function () {
                scrollTicking = false;
                if (!isNavJumping) {
                    var activeId = calculateActiveSectionId();
                    setActive(activeId, true, false);
                }
            });
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('orientationchange', onScroll);

    // Initial position setup on load
    function initInitialPosition() {
        var initialHash = (location.hash || '').slice(1);
        if (initialHash && document.getElementById(initialHash)) {
            navigateToSection(initialHash, false, false);
        } else {
            var activeId = calculateActiveSectionId();
            setActive(activeId, true, true);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInitialPosition);
    } else {
        setTimeout(initInitialPosition, 50);
    }
}());
