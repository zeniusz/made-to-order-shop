# Custom Made Studio

A made-to-measure suit configurator concept. Pick an occasion, match cloth to any colour or photo, get a size with a confidence label, and hand the look to a store advisor.

A learning project built with AI. Plain HTML, CSS and JavaScript. No framework, no build step.

![Custom Made Studio: choosing an occasion](docs/preview/01-occasions-v2.jpg)

## Screenshots

| Jacket only | Fabric sample |
|---|---|
| ![Jacket only](docs/preview/13-jacket-only-v2.jpg) | ![Fabric sample](docs/preview/02-fabric-sample-v2.jpg) |

| Style | Find my size |
|---|---|
| ![Style](docs/preview/03-style-v2.jpg) | ![Find my size](docs/preview/04-find-my-size-v2.jpg) |

| Size and pants size | Extras |
|---|---|
| ![Size and pants size](docs/preview/05-size-and-pants-v2.jpg) | ![Extras](docs/preview/06-extras-prices.jpg) |

| Review | Style me |
|---|---|
| ![Review](docs/preview/07-review-v2.jpg) | ![Style me](docs/preview/12-style-me-photo-v2.png) |

| Advisor mode | On a phone |
|---|---|
| ![Advisor mode](docs/preview/09-advisor-v4.jpg) | <img src="docs/preview/10-phone-v2.jpg" alt="On a phone" width="240"> |

## What it does

The same page has two views, switched at the top right. The customer builds the suit. The style advisor uses the result to run the fitting.

### For the customer

- **Eight occasions and 13 designs.** Pick an occasion, then a design for it, each with a full-outfit photo. A jacket-only view, a fabric sample and a detail view show it closer.
- **Style me**, inside the Cloth step. It starts collapsed. Open it, type a line or add an inspiration photo and get three ranked looks, chosen from all 13 designs and 46 cloths. Tap a colour found in the photo to re-rank around it. Pick a look to apply it, or refine with Darker, Lighter, Cheaper, More relaxed or More formal. Questions get a short answer. It runs in the browser with no setup.
- **The suit photo follows the fabric.** Choose any of the 46 fabrics and the suit photo changes to that fabric. Every fabric has its own photo of the same classic suit.
- **Colour and photo matching.** Any colour, hex code or uploaded photo is matched to the closest cloths.
- **Style presets** that say what they change. Combinations that cannot be made are disabled with the reason.
- **Find my size.** A suggested jacket size and pants size, with a High, Medium or Low confidence label and the reason. A low result offers a store fitting. A size grid is there for people who know theirs.
- **Extras** in matching colours, each with its own photo, ten shoe styles with their own prices, or no shoes, and a monogram preview. Prices are itemised in euros.
- **Remembers you on this device:** resume, a saved Size Passport with jacket and pants sizes, a link that reopens the design, and a calendar file for the fitting.

### For the style advisor

- **A calm, compact workspace** (tablet first): customer name, appointment and fitting code at the top; open a fitting or start a walk-in from a small toolbar, with follow-ups in an expandable list. The stylist assistant stays in view beside the fitting on wide screens and folds under the look summary on a tablet. Contact details are collapsed until needed.
- **Look and brief:** the full suit photo, fabric, design, total and delivery estimate, the customer's request and inspiration photo, and "Edit look together".
- **Fabric:** the chosen cloth sits in one line with "Compare another fabric". It opens by itself when the assistant recommends an alternative, with both fabrics side by side, their totals, the difference and one "Use this fabric" button. Sizes, alterations and notes are kept.
- **Sizing and alterations:** what the customer gave, the suggested starting size with its reason, only the things that need attention under "Check first", final jacket and trouser sizes shown compactly with a Change button, a reason for change only when a final size differs from the suggestion, alterations as requested against agreed in cm, and workroom notes under them.
- **Appointment outcome:** status, next step and follow-up date. "Save progress" works without a final size; "Complete fitting" asks for one. The saved message just shows the fitting code. Print sheet is in the bar; Export log is under More.
- **Stylist assistant:** three shortcuts (Prepare fitting, Find alternatives, Explain cloth) and a question box. When it suggests another fabric it shows the name, new total and difference with a Compare fabrics button. It answers on the device without any cloud service; an optional hosted AI can be connected (see below).
- **Measure what works:** each saved fitting records suggested against final size, exported as CSV with a version tag for the sizing rules.

| Advisor workspace on a tablet | Start a walk-in |
|---|---|
| <img src="docs/preview/19-advisor-tablet.jpg" alt="Tablet" width="300"> | ![Walk-in](docs/preview/15-advisor-walkin-v2.jpg) |

| Stylist assistant and a cheaper fabric | Compare fabrics |
|---|---|
| ![Stylist assistant](docs/preview/14-advisor-assistant-v2.jpg) | ![Fabric comparison](docs/preview/16-advisor-fabric-compare.jpg) |

![Sizing and alterations](docs/preview/18-advisor-sizing.jpg)

## Run it

```bash
python -m http.server 8770
```

Open http://localhost:8770. Use a local server rather than opening the file directly.

Useful links: `?mode=advisor`, `?tab=2` (steps 0 to 4), `?occ=wed`, `?design=brown-glen-plaid`, `?cloth=rust_linen`, `?view=jacket`, `?brief=summer wedding`, `?stylist=open`, `?intro=0`.

## One-file version

`python tools/build_standalone.py . Custom-Made-Studio-standalone.html` writes a single HTML file with the styles, scripts and all images inside (about 4 MB). It opens straight from a file and can be sent by email. Images are shrunk for size.

## Files

```
index.html            the page
css/style.css         styles
js/data.js            cloths, occasions and extras
js/app.js             the configurator
js/assistant.js       reads the line you type
js/stylist.js         palette sampling and look ranking
js/config.js          optional address of a hosted AI proxy
worker/               optional proxy that keeps an AI key off the page
tests/stylist-test.html  96 checks, open it on the local server
assets/img/           photos and textures
docs/preview/         screenshots
catalog-gallery.html  browse every image
```

## Optional: a hosted Claude

Style me works without it. To let Claude read the photo, deploy `worker/claude-vision-proxy.js` (a small Cloudflare Worker that holds the key as a secret) and put its address in `CUSTOM_STYLIST_AI_ENDPOINT` in `js/config.js`. Visitors never see a key. Answers are checked against the real catalogue, and if the service is down the page falls back to private matching. Not tested with a live key. The worker also contains image generation, which the page does not use.

## Image library

`assets/img/library` holds the concept images: 33 fabric swatches, 33 fabric textures, 13 suits, 13 jacket-only views and 10 standalone shoe styles from the supplied pack, plus 41 photos of the classic suit in each fabric (`cloths`). The fabric photos were made with an image generator from the classic navy suit photo and each fabric's swatch, three at a time on one sheet, then cut apart, so they are illustrations and the weave detail is approximate. Textures are synthetic. The shoe photos are crops from one generated board. Cloth names, compositions and all prices are fictional demo values, not retail prices.

## Notes

An independent concept, not an official product of any brand. Photos were generated for this prototype. Prices, appointment times, availability and size suggestions are illustrative, not real fit advice. The code is MIT licensed.
