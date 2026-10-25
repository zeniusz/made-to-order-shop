# Learning notes

What this project was meant to teach, and what it did.

## Goal

Find out how far an AI-assisted build can go toward a believable product page, and what it takes to get there. The test case was a made-to-measure suit configurator.

## What worked

- **A real photo beats any illustration.** The first version drew the suit in vector shapes and looked fake. Recolouring a real photograph with masks made the same page look like a shop.
- **Masks do the hard work.** Separate soft masks for jacket, tie, pocket square and shirt let each piece change colour on its own. Most of the time went into getting mask edges clean.
- **Blend over the result, not the original.** Painting the tie and pocket square over the already recoloured jacket removed the dark halos that appeared on light cloths.
- **Tone curve matters.** A curve that is linear in the darks and soft in the highlights keeps navy looking navy and stops sand from blowing out.
- **Explain the choice.** Showing one suggested size, a High / Medium / Low confidence label and a plain reason is easier to trust than a grid of numbers.
- **Test on a phone-width view and with real screenshots.** Several problems only showed up when looking at the rendered page.

## What was hard

- Tie and shirt masks on a soft-focus photo: pattern, shadow and edge blur all fight the colour rules.
- Light colours expose every mask error that dark colours hide.
- Free photographs of suits with clean licences are rare; one photo had to carry the whole page.
- Keeping prices and facts honest: anything not read from a real source is labelled illustrative.

## Added after reviewing real use of a live configurator

Notes from walking through a real configurator turned into changes:

- **Jargon in cloth names** became a short explainer under the selected cloth, plus a season filter.
- **Silent changes** (switching a style quietly changed another default) became a one-line note saying what changed.
- **A bare size grid** became a guided size step with a confidence label and a store fallback.
- **Returning visitors** got resume, a saved size and a link that reopens the design.
- **"AI"** was added where it removes typing and guessing: a chat that picks cloth from a sentence, explains terms and answers how-it-works questions. A first version asked visitors to paste their own API key, which was a bad experience, so it was replaced by a built-in stylist that needs nothing, plus an optional hosted proxy that keeps the key off the page.
- **Fit help for the unsure:** a chest measurement and a short measuring guide give a better size than height and weight alone, and a calendar file helps people keep the fitting.

## Ideas for next

- A second and third photo (full length, back view) so more of the suit changes.
- Real size data from fittings to replace the simple height and weight estimate.
- Comparing two cloths side by side on the same jacket.
- Measuring whether the size step helps people finish: time on step, use of the grid, store bookings.
