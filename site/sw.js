/* Cloak Manual — Offline Service Worker */
'use strict';

var CACHE_NAME = 'cloak-manual-v38';
var ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './privacy.html',
    './disclaimer.html',
    './license.html',
    './assets/img/logo.svg',
    './assets/css/tokens.css',
    './assets/css/base.css',
    './assets/css/layout.css',
    './assets/css/components.css',
    './assets/css/pages.css',
    './assets/js/theme-init.js',
    './assets/js/chapters-loader.js',
    './assets/js/nav.js',
    './assets/js/copy.js',
    './assets/js/search.js',
    './assets/js/ui.js',
    './assets/data/chapter-01.js',
    './assets/data/chapter-02.js',
    './assets/data/chapter-03.js',
    './assets/data/chapter-04.js',
    './assets/data/chapter-05.js',
    './assets/data/chapter-06.js',
    './assets/data/chapter-07.js',
    './assets/data/chapter-08.js'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return Promise.all(
                ASSETS.map(function (url) {
                    return fetch(new Request(url, { cache: 'reload' })).then(function (response) {
                        if (response && response.status === 200) {
                            return cache.put(url, response);
                        }
                    }).catch(function () {});
                })
            );
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.map(function (key) {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') {
        return;
    }
    var accept = event.request.headers.get('accept') || '';
    var isHtml = event.request.mode === 'navigate' || accept.indexOf('text/html') !== -1;

    event.respondWith(
        fetch(event.request).then(function (networkResponse) {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                var copy = networkResponse.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, copy);
                });
            }
            return networkResponse;
        }).catch(function () {
            return caches.match(event.request).then(function (cached) {
                if (cached) {
                    return cached;
                }
                if (isHtml) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
