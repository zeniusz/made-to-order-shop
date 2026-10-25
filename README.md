# Custom Made Studio

A learning project: using AI to build a realistic, working product page instead of a mock-up.

The idea was to test how far an AI-assisted build can go with a made-to-measure suit configurator, and what it takes to make the result feel like a real shop rather than a drawing.

![The studio with the jacket in navy](docs/screenshots/2-navy.png)

| Picker | Sand cloth | Review | Phone |
|---|---|---|---|
| ![](docs/screenshots/1-picker.png) | ![](docs/screenshots/3-wedding.png) | ![](docs/screenshots/5-review.png) | ![](docs/screenshots/6-phone.png) |

| Find my size: high confidence | Find my size: low confidence, store fallback |
|---|---|
| ![](docs/screenshots/4-find-my-size.png) | ![](docs/screenshots/7-low-confidence.png) |

| Describe what you need | Style choices that tell you what changed |
|---|---|
| ![](docs/screenshots/8-describe-it.png) | ![](docs/screenshots/9-style-note.png) |

## What I wanted to learn

- **Real imagery, not illustration.** Can a single free photograph be recoloured in the browser so that changing the cloth looks like a different jacket, with folds, shadows and lapel intact?
- **How colour changes the look.** What happens to a whole outfit when the cloth, shirt, tie and pocket square change together, and can the page suggest colours that go with each other?
- **Guided choices instead of long lists.** Start from an occasion, a colour or a photo, rather than scrolling hundreds of fabrics.
- **A size step that explains itself.** Three short screens: tell us about you, get one suggested size with a High / Medium / Low confidence label and a plain reason, and fall back to a store measurement when confidence is low. People who know their size can skip to a grid.
- **Hand-off to a person.** A short code that fills a store-advisor screen with the look, the size and a "check first" list.
- **Working with AI on a real build.** Planning, researching, building, testing in a browser, fixing what looks wrong, and publishing.

## What it does

- Recolours a real jacket photo live. Shirt, tie and pocket square recolour too.
- First-visit picker by occasion (Interview, Office, Wedding, Evening, Travel).
- Match any colour, hex code or uploaded photo to the closest cloths using perceptual colour distance (CIELAB ΔE). Filter by season.
- **Plain-language cloth notes.** Names like "S120's" or "Wrinkle-Free 4-Ply" are explained next to the cloth, so nobody needs to know the jargon.
- Style presets (Havana, Milano) that say exactly what they changed, and rules that grey out combinations that do not go together, with the reason.
- **Find my size**: suggested size, High / Medium / Low confidence with a plain reason, store fallback (book appointment or walk-in), expert size grid with Regular / Short / Long.
- Extras in matched colours, price shown line by line in euros.
- Store code and a store-advisor screen.
- **Remembers you, on this device only.** Resume where you left off, a Size Passport for your saved size, and a link that reopens the exact design.

## AI features

- **Describe what you need.** Type one sentence, for example "navy suit for a summer wedding, 183 cm, 80 kg, slim fit". The page picks the occasion, season, colour, texture and budget, fills in your height, weight and fit preference, ranks the cloths and says why the top one was chosen. This runs in the browser with a small rule-based reader. Nothing is sent anywhere.
- **Optional: let Claude read it.** Open "Use Claude to read it" and paste your own Anthropic API key. The sentence is then read by Claude (`claude-haiku-5-5`) instead of the built-in reader, with the built-in reader as a fallback if the call fails. The key stays in that tab and is never stored. This path is written to the API's documented format but has not been tested against a live key, so treat it as experimental.
- **Explain, don't just list.** Every suggestion comes with a reason: why this cloth, why this size, and how sure the page is.

Shareable views: `?occ=wed` (int, off, wed, eve, trv), `?tab=4` (step 0–4), `?intro=0` (skip the first-visit picker), `?brief=...` (run the describe-it box with that sentence).

## Run it

A static site with no build step and no dependencies.

```bash
python -m http.server 8770
```

Then open http://localhost:8770. Use a local server, not `file://`: the recolouring reads pixels from a canvas, which browsers block for files opened directly.

## How the recolouring works

`js/recolor.js` loads four images made from the source photo:

| File | Purpose |
|---|---|
| `suit-base.jpg` | the photo, cropped |
| `suit-plain.jpg` | luminance with the pinstripes and tie pattern blurred out inside their masks |
| `suit-mask.png` | soft masks: red = jacket, green = tie, blue = pocket square |
| `suit-mask-shirt.png` | soft mask for the shirt |

For each jacket pixel the brightness relative to the jacket's average drives the chosen colour, multiplied by a real wool texture (or a tweed photo for herringbone). A linear-then-soft tone curve keeps dark colours true and stops light ones from clipping. Tie, square and shirt are blended on top of the recoloured jacket.

## Project structure

```
index.html
css/style.css
js/data.js        catalogue and options
js/recolor.js     photo recolouring engine
js/app.js         configurator logic and UI
js/assistant.js   describe-it reader (local) and optional Claude call
assets/img/       photos, masks and textures
docs/             screenshots and learning notes
tools/            script that builds the masks from the source photo
```

## Data and disclaimer

This is an independent experiment and not an official product of any brand. Cloth names were taken from a public online configurator for realism. Prices in euros, style options, extras, appointment times and the size suggestion are illustrative and not real fit advice.

## Credits and licences

- Suit on mannequin: photo by Paul Goyette, [CC BY-SA 2.0](https://commons.wikimedia.org/wiki/File:Grey_and_navy_suit_on_mannequin.jpg). The cropped image, masks and recoloured output are adaptations and are shared under CC BY-SA 2.0.
- Wool herringbone texture: Rico Cilliers and colormass via Poly Haven, CC0.
- "Tweed 1": public domain.

All images via Wikimedia Commons. `tools/make_masks.py` regenerates the masks from the original photo. The code is MIT licensed (see `LICENSE`).
