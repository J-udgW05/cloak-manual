<h1><img src="site/assets/img/logo.svg" width="34" height="34" align="absmiddle" alt="Cloak Manual"> Cloak Manual</h1>

Практическое руководство по цифровой приватности, анонимности, защите ОС и операционной безопасности (OPSEC).

[English](README.md) | **Русский**

[![Deploy GitHub Pages](https://github.com/J-udgW05/cloak-manual/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/J-udgW05/cloak-manual/actions/workflows/deploy-pages.yml)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-334155.svg)](site/license.html)
[![Privacy: Zero Logs](https://img.shields.io/badge/Privacy-Zero_Logs-166534.svg)](site/privacy.html)
[![CSP: Strict](https://img.shields.io/badge/CSP-default--src_'none'-0284c7.svg)](site/_headers)
[![PWA: Offline Ready](https://img.shields.io/badge/PWA-Offline_Ready-475569.svg)](site/sw.js)

**Сайт:** [https://j-udgw05.github.io/cloak-manual/](https://j-udgw05.github.io/cloak-manual/)

---

## Обзор

Справочник включает **153 раздела** в 8 главах и работает офлайн. Доступен на **русском** ([`/`](https://j-udgw05.github.io/cloak-manual/)) и **английском** ([`/en/`](https://j-udgw05.github.io/cloak-manual/en/)) языках.

1. **Введение и базовые концепции (`01-06`):** основы приватности, механика доксинга, моделирование угроз и базовые меры защиты.
2. **Цифровой след и OSINT (`07-16`):** разведка по открытым источникам, удаление данных у дата-брокеров, гигиена аккаунтов, правовые механизмы (GDPR и локальные законы), ИИ-профилирование и носимая электроника.
3. **Идентификаторы и трекинг (`17-30`):** утечки IP/DNS, аппаратные идентификаторы, беспроводной трекинг, корреляционные атаки, фингерпринтинг браузера, микроархитектура CPU (Intel ME / AMD PSP), телеметрия ОС, метаданные, стилометрия и биометрия.
4. **Атаки, уязвимости и угрозы (`31-45`):** фишинг, вредоносное ПО и эксплойты, вредоносные USB-устройства, атаки Evil Maid и Cold Boot, компрометация цепочки поставок, атаки по сторонним каналам, криминалистика устройств и аудиты no-logs VPN.
5. **Модели угроз и анонимная маршрутизация (`46-57`):** архитектура Zero Trust, выбор маршрута, одноразовые SIM-карты и публичные точки доступа, Tor Browser, Tails, Whonix, правдоподобное отрицание и защита BIOS/UEFI.
6. **ОС, виртуализация и криптография (`58-78`):** основы шифрования, скрытые тома VeraCrypt, LUKS, KeePassXC, аппаратные 2FA-токены, связки Tor + VPN, I2P, мосты (`obfs4` / `WebTunnel`) и харденинг Qubes OS / Linux / Windows.
7. **Разделённые личности и коммуникации (`79-106`):** изоляция личностей, CAPTCHA и антибот-проверки, приватные платежи (Monero / наличные), сравнение мессенджеров (SimpleX Chat, Signal, Briar, Session), очистка метаданных, надёжное удаление данных и OPSEC при пересечении границ.
8. **OPSEC, юрисдикции и прикладная защита (`107-153`):** операционная дисциплина, PGP/GnuPG и постквантовая криптография (ML-KEM / `age`), канареечные ловушки, защита домашней сети, мобильный харденинг (GrapheneOS), анализ региональных правовых рисков, timelock-шифрование (`tlock`), стеганография и локальный ИИ.

---

## Безопасность и архитектура приватности

Статическое веб-приложение без бэкенда, сторонних CDN и исходящих сетевых запросов:

- **Ноль телеметрии и без cookies:** нет аналитики, трекинг-пикселей, внешних шрифтов и сторонних скриптов. В `localStorage` сохраняются только ключи `bp_theme` и `bp_lang` для выбранной темы и языка интерфейса.
- **Строгий Content Security Policy (CSP):**
  ```http
  default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none';
  ```
  Директива `connect-src 'none'` блокирует любые исходящие `fetch`, `XHR` и `WebSocket`-запросы на уровне браузера, а `script-src 'self'` запрещает встроенные (inline) скрипты.
- **100% работа без JavaScript:** все 153 раздела и якорные ссылки оглавления встроены непосредственно в `site/index.html` (RU) и `site/en/index.html` (EN). Сайт работает даже при отключённом JavaScript (например, в режиме *Safest* в Tor Browser).
- **Изоляция внешних ссылок:** все 4 200+ внешних ссылок используют `target="_blank" rel="noopener noreferrer nofollow"` вместе с заголовком `Referrer-Policy: no-referrer`.
- **Заголовки безопасности ([`site/_headers`](site/_headers)):** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` и строгий `Permissions-Policy`.
- **Офлайн PWA ([`site/sw.js`](site/sw.js)):** Service Worker кэширует все RU и EN HTML-страницы, CSS и JS-модули для работы офлайн.

---

## Структура репозитория

```text
cloak-manual/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml       # Автодеплой GitHub Pages из ./site
├── site/
│   ├── index.html                 # Русская версия (153 раздела встроены, 100% No-JS)
│   ├── privacy.html               # Политика конфиденциальности Zero Logs (RU)
│   ├── disclaimer.html            # Отказ от ответственности (RU)
│   ├── license.html               # Детали лицензий CC BY-NC-SA 4.0 и MIT (RU)
│   ├── en/
│   │   ├── index.html             # Английская версия (153 раздела встроены, 100% No-JS)
│   │   ├── privacy.html           # Политика конфиденциальности Zero Logs (EN)
│   │   ├── disclaimer.html        # Отказ от ответственности (EN)
│   │   └── license.html           # Детали лицензий CC BY-NC-SA 4.0 и MIT (EN)
│   ├── manifest.json              # Манифест PWA-приложения
│   ├── sw.js                      # Офлайн Service Worker
│   ├── _headers                   # HTTP-заголовки безопасности (Cloudflare Pages / Netlify)
│   └── assets/
│       ├── css/                   # Модульные дизайн-токены и таблицы стилей
│       ├── img/                   # Векторный логотип (SVG)
│       └── js/                    # Клиентские модули навигации, поиска, копирования, языка и темы
├── .gitignore
├── README.md
└── README_RU.md
```

---

## Локальный запуск

Откройте `site/index.html` напрямую в браузере или поднимите локальный сервер из каталога `site/`:

```bash
python -m http.server 8080 --directory site
```

Затем откройте `http://localhost:8080/`.

---

## Лицензия

- Текстовое содержимое справочника распространяется по лицензии **[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)** ([подробнее](site/license.html)).
- Клиентские скрипты, таблицы стилей и код навигации распространяются по **лицензии MIT**.
- Только для образовательных и оборонительных целей. Подробнее: [Отказ от ответственности](site/disclaimer.html).
