<h1><img src="site/assets/img/logo.svg" width="34" height="34" align="absmiddle" alt="Cloak Manual"> Cloak Manual</h1>

Practical handbook on digital privacy, anonymity, OS hardening, and operational security (OPSEC).

[![Deploy GitHub Pages](https://github.com/J-udgW05/cloak-manual/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/J-udgW05/cloak-manual/actions/workflows/deploy-pages.yml)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-334155.svg)](site/license.html)
[![Privacy: Zero Logs](https://img.shields.io/badge/Privacy-Zero_Logs-166534.svg)](site/privacy.html)
[![CSP: Strict](https://img.shields.io/badge/CSP-default--src_'none'-0284c7.svg)](site/_headers)
[![PWA: Offline Ready](https://img.shields.io/badge/PWA-Offline_Ready-475569.svg)](site/sw.js)

**Live Site:** [https://j-udgw05.github.io/cloak-manual/](https://j-udgw05.github.io/cloak-manual/)

---

## Overview

Cloak Manual is a structured, offline-capable reference covering **153 sections** across 8 chapters. Content is currently published in Russian, with English localization planned.

1. **Introduction & Core Concepts (`01–06`)** — privacy fundamentals, doxing mechanics, threat modeling, and baseline mitigation.
2. **Digital Footprint & OSINT (`07–16`)** — open-source intelligence, data broker removal, account hygiene, legal remedies (GDPR, local statutes), AI profiling, and wearables.
3. **Identifiers & Tracking (`17–30`)** — IP/DNS leaks, hardware identifiers, wireless tracking, correlation attacks, browser fingerprinting, CPU microarchitecture (Intel ME / AMD PSP), OS telemetry, metadata, stylometry, and biometrics.
4. **Attacks, Vulnerabilities & Threats (`31–45`)** — phishing, malware/exploits, malicious USBs, Evil Maid and Cold Boot attacks, supply-chain interdiction, side-channel attacks, device forensics, and VPN no-logs audits.
5. **Threat Models & Anonymity Routing (`46–57`)** — Zero Trust architecture, route selection, burner SIMs and public access points, Tor Browser, Tails, Whonix, plausible deniability, and BIOS/UEFI hardening.
6. **OS, Virtualization & Cryptography (`58–78`)** — encryption fundamentals, VeraCrypt hidden volumes, LUKS, KeePassXC, hardware 2FA tokens, Tor + VPN topologies, I2P, bridges (`obfs4` / `WebTunnel`), and Qubes OS / Linux / Windows hardening.
7. **Compartmentalized Identities & Communications (`79–106`)** — identity isolation, CAPTCHA/anti-bot friction, private payments (Monero / cash), messenger comparison (SimpleX Chat, Signal, Briar, Session), metadata scrubbing, secure erasure, and border crossing OPSEC.
8. **OPSEC, Jurisdictions & Applied Defense (`107–153`)** — operational discipline, PGP/GnuPG and post-quantum cryptography (ML-KEM / `age`), canary traps, home network hardening, mobile hardening (GrapheneOS), regional legal risk analysis, timelock encryption (`tlock`), steganography, and local AI.

---

## Security & Privacy Architecture

The web application is a self-contained static client with no backend, no third-party CDNs, and no external network requests:

- **Zero Telemetry & No Cookies:** no analytics, tracking pixels, external fonts, or third-party scripts. Only `localStorage` key `bp_theme` is stored locally to persist the selected color theme.
- **Strict Content Security Policy (CSP):**
  ```http
  default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none';
  ```
  `connect-src 'none'` blocks all outbound `fetch`, `XHR`, and `WebSocket` requests at the browser level.
- **External Link Isolation:** all 4190+ external links enforce `target="_blank" rel="noopener noreferrer nofollow"` alongside `Referrer-Policy: no-referrer`.
- **Security Headers ([`site/_headers`](site/_headers)):** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and restrictive `Permissions-Policy`.
- **Offline PWA ([`site/sw.js`](site/sw.js)):** Service Worker (`cloak-manual-v25`) caches all CSS, JS, and chapter modules for full offline operation.

---

## Repository Structure

```text
cloak-manual/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml       # Automated GitHub Pages deployment from ./site
├── site/
│   ├── index.html                 # Main handbook shell and navigation
│   ├── privacy.html               # Zero-logs privacy policy
│   ├── disclaimer.html            # Defense-only legal disclaimer
│   ├── license.html               # CC BY-NC-SA 4.0 & MIT licensing details
│   ├── manifest.json              # PWA Web App Manifest
│   ├── sw.js                      # Offline Service Worker (cloak-manual-v38)
│   ├── _headers                   # Security HTTP headers (Cloudflare Pages / Netlify)
│   └── assets/
│       ├── css/                   # Modular design tokens and stylesheets
│       ├── js/                    # Client navigation, search, copy, and theme modules
│       └── data/                  # Modular chapter content (chapter-01.js .. chapter-08.js)
├── .gitignore
└── README.md
```

---

## Local Usage

Open `site/index.html` directly in a browser or serve `site/` locally:

```bash
python -m http.server 8080 --directory site
```

Then open `http://localhost:8080/`.

---

## License

- Handbook content is licensed under **[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)** ([details](site/license.html)).
- Client scripts, stylesheets, and navigation code are licensed under the **MIT License**.
