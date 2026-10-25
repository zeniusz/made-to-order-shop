# Learning notes

## Goal

Build a made-to-measure suit configurator that feels like a considered retail experience: realistic outfit photography, fabric discovery, clear fit guidance and a stylist that can help without taking over the page.

## What changed after reviewing the visuals

- **A recoloured photograph can imply something that is not real.** Tinting one jacket image across many fabrics produced inconsistent edges and made the suit look artificial. The current version uses independent catalog photographs for each look instead of pretending the same image accurately represents every cloth.
- **Separate the style reference from the actual cloth choice.** The full outfit is a style/occasion reference. Each of the 16 cloths has its own color-mapped, high-resolution textile swatch. The main suit photo is never recoloured, avoiding impossible edges and fake material detail.
- **Let the customer start from how they will wear it.** Wedding, business, smart casual, summer/resort and formal evening lead the occasion catalog, with interview, travel and statement options also available. Four pictured style presets—Havana, Milano, Coastal and Formal evening—offer a second starting point for the tailoring details.
- **Zoom should open the original image.** The product viewer can switch between fit-to-screen and native-resolution inspection, with the source pixels preserved.
- **Keep the stylist helpful, not dominant.** It opens in a compact modal from the Cloth or Fit step. Prompts choose a style and rank cloths; an uploaded inspiration photo is sampled locally for a colour match. Full generative image creation would need a protected image-generation endpoint.

## What remains illustrative

- Prices, appointment times, and availability are example data.
- Size guidance is a prototype heuristic, not professional fit advice.
- Hosted AI is optional. Without a configured endpoint, the stylist uses local rules.
- Catalog photos and textile references were generated for the prototype and are not product photos for a real retailer. Images are bundled locally with a complete `catalog-gallery.html` asset browser.

## Next steps

- Connect a secure image-generation endpoint to create bespoke looks from a reference photo.
- Add front/back/side views for each cut, or real approved garment photography for each fabric.
- Replace sample prices and size assumptions with verified product and fitting data.
- Test the flow with customers on phone and desktop widths.
