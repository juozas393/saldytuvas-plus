# Lidl.lt Sekcijų Discovery Rezultatai
> Data: 2026-02-12

## 1. VISI RASTI LEIDINIAI (scraperis rado)

Scraperis rado **13 akcijinių sekcijų** (`/a...` URL pattern) ir **44 katalogo sekcijas** (`/s...` URL pattern).

### Akcijinės sekcijos (/a... URLs) — 13 vnt.

| # | Sekcija | URL |
|---|---------|-----|
| 1 | Baltasis vynas | https://www.lidl.lt/c/baltasis-vynas/a10019966 |
| 2 | Raudonasis vynas | https://www.lidl.lt/c/raudonasis-vynas/a10020001 |
| 3 | Rožinis vynas | https://www.lidl.lt/c/rozinis-vynas/a10020002 |
| 4 | Putojantis vynas | https://www.lidl.lt/c/putojantis-vynas/a10020003 |
| 5 | Degtinė | https://www.lidl.lt/c/degtine/a10025224 |
| 6 | Likeriai | https://www.lidl.lt/c/likeriai/a10025225 |
| 7 | Brendis ir viskis | https://www.lidl.lt/c/brendis-ir-viskis/a10025226 |
| 8 | Kiti gerimai | https://www.lidl.lt/c/kiti-gerimai/a10026526 |
| 9 | Ne maisto prekių pasiūlymai | https://www.lidl.lt/c/ne-maisto-prekiu-pasiulymai/a10088793 |
| 10 | Super savaitgalis | https://www.lidl.lt/c/super-savaitgalis/a10025645 |
| 11 | Svarbiausios šios savaitės akcijos | https://www.lidl.lt/c/visos-sios-savaites-akcijos/a10023711 |
| 12 | Deluxe | https://www.lidl.lt/c/deluxe/a10019584 |
| 13 | Azijos stiliaus produktai | https://www.lidl.lt/c/azijos-stiliaus-produktai/a10019570 |

### Katalogo sekcijos (/s... URLs) — 44 vnt. (visos praleistos)

Tai nuolatinės kategorijos be produktų tinklelio — scraperis jų neskaito.
Pvz.: maistas gėrimai ir buities prekės, virtuvė ir buitis, kainų leidiniai, ir t.t.

---

## 2. KEYWORD WHITELIST ATRANKA (fallback kai AI neveikia)

### ✅ ATRINKTOS (scrapinamos) — 5 sekcijos

| # | Sekcija | Atpažintas raktažodis |
|---|---------|----------------------|
| 1 | Svarbiausios šios savaitės akcijos | `akcij` |
| 2 | Super savaitgalis | `super` + `savait` |
| 3 | Deluxe | `deluxe` |
| 4 | Azijos stiliaus produktai | `azij` |
| 5 | Kiti gerimai | `kiti gerimai` |

### ⛔ PRALEISTOS (nescrapinamos) — 8 sekcijos

| # | Sekcija | Priežastis |
|---|---------|-----------|
| 1 | Baltasis vynas | Nuolatinė katalogo kategorija |
| 2 | Raudonasis vynas | Nuolatinė katalogo kategorija |
| 3 | Rožinis vynas | Nuolatinė katalogo kategorija |
| 4 | Putojantis vynas | Nuolatinė katalogo kategorija |
| 5 | Degtinė | Nuolatinė katalogo kategorija |
| 6 | Likeriai | Nuolatinė katalogo kategorija |
| 7 | Brendis ir viskis | Nuolatinė katalogo kategorija |
| 8 | Ne maisto prekių pasiūlymai | Ne maistas |

---

## 3. AI (GEMINI) ATRANKA

**Šiuo metu neveikia** — Gemini API kvota išnaudota (429 Too Many Requests).

Kai kvota atsinaujins, AI automatiškai perims klasifikaciją ir galės geriau atpažinti:
- Šventines akcijas (pvz. Valentino diena)
- Temines savaites (pvz. Itališka savaitė)
- Kitas mišrias sekcijas

AI sprendžia: `yes` (scrapinti), `maybe` (scrapinti dėl viso pikto), `no` (praleisti).
