# Lavender Lounge: web menu (concept demo)

A 3D web menu and order-to-table site for **Lavender Lounge**, Ain El Delb, Saida.
Plain HTML/CSS/JS with no build step. The 3D hero uses Three.js, bundled locally in `assets/vendor`.

> **Concept demo.** The site is marked `noindex` and labelled "Concept demo · not the official site", and orders run in demo mode.
> Keep it this way until Lavender Lounge approves the site.

## What's inside

| File | What it does |
|---|---|
| `index.html` | Page structure and all styles |
| `scene.js` | 3D hero: martini glass that pours (tap a drink chip to change the colour), floating lavender, pollen |
| `app.js` | Menu, 3D collection ring, Day → After Dark → Smoke → Sweet mood shift, options sheet, order ticket, search, $/LL toggle |
| `menu-data.js` | The menu (generated, don't hand-edit) |
| `tools/build_data.py` | Builds `menu-data.js` from `tools/live-menu.json` |
| `assets/photos` | The lounge's own photos, as WebP |

## Data

- Source: their live menu at menu.omegasoftware.ca/lavenderlounge. It covers 127 of 128 live items; the generic "Soft Drinks" item became a Soft Drink chooser.
- Prices are in US dollars, exactly as on the live menu. The LL prices use **1$ = 90,000 LL**; change `rate` in `tools/build_data.py`.
- Names cleaned up: Russain→Russian, Botlle→Bottle, Belveder→Belvedere, Maragarita→Margarita, Wiskey→Whisky, Iceatea→Iced Tea, Dopio→Doppio.
- To update prices, export the menu again into `tools/live-menu.json` and run `python tools/build_data.py`.

## Confirm with the lounge

- Shisha "(+3$ Extra)" is modelled as an **extra head** ($3, or $5 for Ajami). Is that right?
- Is "Mexican" a beer?
- Opening hours (not on their menu, so the site doesn't show them).
- Phones: **81 097 858** is shown and used for WhatsApp; **78 946 238** is the second number.

## Going live (after they say yes)

1. `app.js` → set `ORDER_WHATSAPP = '96181097858'` so orders open WhatsApp with the full ticket.
2. `index.html` → remove the `noindex` meta, the "Concept demo" tag and the footer disclaimer.
