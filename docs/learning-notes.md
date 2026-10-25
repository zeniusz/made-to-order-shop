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

## Ideas for next

- A second and third photo (full length, back view) so more of the suit changes.
- Real size data from fittings to replace the simple height and weight estimate.
- Saving a look and reopening it by code.
- Comparing two cloths side by side on the same jacket.
- Measuring whether the size step helps people finish: time on step, use of the grid, store bookings.
