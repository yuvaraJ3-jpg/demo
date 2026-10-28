# Malnad Water Purifier – static website

Five pages (HTML5 + CSS3 + a small vanilla `script.js`). No framework, build tool, database or server code.

## Files
| File | Purpose |
|---|---|
| `index.html`, `products.html`, `services.html`, `about.html`, `contact.html` | Pages |
| `styles.css` | Shared styles. Brand colours are in `:root` at the top. |
| `script.js` | Language switch, phone menu, contact links, form checks. **Business phone / WhatsApp / email / map link are in `BUSINESS` at the top.** |
| `translations.json` | All visible text in English (`en`) and Kannada (`kn`). |
| `assets/images/README.txt` | Photo file names to add. |

## Test locally (important)
The pages load `translations.json` with `fetch()`. Many browsers block this when you open a file with `file://`.
The site then shows English only. Use a local web server instead:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## Owner checklist before going live
1. `script.js` → `BUSINESS`: phone, phoneDisplay, whatsapp, email, mapsUrl. Until these are set, the buttons open the Contact page.
2. `translations.json` → in **both** `en` and `kn`: `value_address`, `value_hours`, `value_area`, `topbar_text`, `story_p2` (years of experience), and every `[Your Town]` / `[District]` text, including the `meta_title_*` and `meta_desc_*` keys.
3. Add photos (see `assets/images/README.txt`) and the logo.
4. `products.html`: confirm or remove each sample card. Add brands, models, specifications or prices only after the owner confirms them.
5. `services.html`: delete any service the shop does not offer (the article, its link chip and its form option).
6. Reviews (`index.html`): add only real reviews, with permission.
7. Forms: by default they open WhatsApp with the details. To use a Google Form, paste its `<iframe>` where the `PASTE GOOGLE FORM EMBED CODE HERE` comments are. To use another form service, add its URL as the form `action` and `method="post"`.
8. Optional local SEO: fill in and uncomment the JSON-LD block in `index.html`.

Search the HTML for `INSERT`, `ADD`, `UPDATE` and `PASTE` to find every place to customise.

## Deploy
Upload the whole folder to any static host (for example Netlify, GitHub Pages, Cloudflare Pages or normal cPanel hosting). All paths are relative.
