/* Catalogue and options.
   Cloth names and USD prices were read from the live US Custom Made configurator (Oct 2026).
   Colours, wear notes, euro prices and every other option are illustrative. */
window.CM = {
  usdToEur: 0.92,

  cloths: [
    { id: 'n110', season: 'all',  name: "Navy Pure S110's Wool",               c: '#1d2a44', weave: 'plain',   usd: 873,  wear: 'Everyday wool. Hard-wearing.',              occ: ['int', 'off', 'trv'], lib: 'navy_super110_wool' },
    { id: 'dbtro', season: 'summer', name: 'Dark Blue Pure Tropical Wool',        c: '#18233a', weave: 'plain',   usd: 673,  wear: 'Light, open weave. For summer and travel.',  occ: ['trv', 'wed', 'res', 'cas', 'int'], lib: 'dark_blue_tropical_wool' },
    { id: 'nher', season: 'all',  name: "Navy Herringbone Pure S120's Wool",   c: '#212d47', weave: 'herring', usd: 923,  wear: 'Subtle zig-zag texture.',                    occ: ['off', 'int', 'cas'] },
    { id: 'mgfl', season: 'winter',  name: "Mid Grey Pure S120's Wool Flannel",   c: '#6f737a', weave: 'flannel', usd: 923,  wear: 'Soft, brushed, warm. Autumn and winter.',   occ: ['off', 'int'] },
    { id: 'b110', season: 'all',  name: "Black Pure S110's Wool",              c: '#121316', weave: 'plain',   usd: 873,  wear: 'Evening and formal.',                        occ: ['eve', 'sig'], lib: 'black_super110_wool' },
    { id: 'dgfl', season: 'winter',  name: "Dark Green Pure S120's Wool Flannel", c: '#2c4538', weave: 'flannel', usd: 923,  wear: 'Brushed flannel in deep green.',            occ: ['eve', 'wed', 'sig'] },
    { id: 'burfl', season: 'winter', name: 'Burgundy Circular Wool Flannel',      c: '#5a2030', weave: 'flannel', usd: 923,  wear: 'Deep wine flannel. A statement.',           occ: ['eve', 'sig'] },
    { id: 'sand', season: 'summer',  name: 'Sand Pure Wool',                      c: '#b9a68a', weave: 'plain',   usd: 923,  wear: 'Light colour for summer weddings.',         occ: ['wed', 'res', 'cas'] },
    { id: 'lgwc', season: 'all',  name: 'Light Grey Wool Cashmere',            c: '#aeb1b5', weave: 'plain',   usd: 1023, wear: 'Cashmere blend. Very soft.',                occ: ['wed', 'off', 'int'] },
    { id: 'mb110', season: 'all', name: "Mid Blue Pure S110's Wool",           c: '#3f6ea8', weave: 'plain',   usd: 873,  wear: 'Brighter blue for daytime.',                occ: ['wed', 'off', 'int'] },
    { id: 'mbchk', season: 'all', name: "Mid Blue Check Pure S110's Wool",     c: '#46658e', weave: 'check',   usd: 873,  wear: 'Quiet check. Relaxed.',                     occ: ['off', 'int'] },
    { id: 'dgstr', season: 'all', name: 'Dark Grey Stripe Pure Wool',          c: '#3a3d43', weave: 'stripe',  usd: 1123, wear: 'Classic pinstripe for the office.',         occ: ['off', 'int', 'cas'] },
    { id: 'n150', season: 'all',  name: "Navy Pure S150's Wool",               c: '#1b2a4a', weave: 'plain',   usd: 1323, wear: 'Very fine and light. Best for occasions.',  occ: ['wed', 'eve'] },
    { id: 'db180', season: 'all', name: "Dark Blue Pure S180's Wool",          c: '#172544', weave: 'plain',   usd: 1523, wear: 'Finest wool in the range.',                 occ: ['eve', 'wed', 'sig'] },
    { id: 'nwf', season: 'all',   name: 'Navy Pure Wrinkle-Free 4-Ply Wool',   c: '#1e2b46', weave: 'plain',   usd: 1023, wear: 'Resists creasing. Built for travel.',       occ: ['trv', 'off', 'int'] },
    { id: 'dgwc', season: 'winter',  name: 'Dark Green Wool Cashmere',            c: '#2e4a3b', weave: 'plain',   usd: 1023, wear: 'Soft cashmere blend in green.',             occ: ['eve', 'sig'] },
    { id: 'mid_blue_windowpane', season: 'all', name: "Mid Blue Windowpane Wool", c: '#486b8c', weave: 'check', pat: "Windowpane check", usd: 960, wear: "Woven wool.", occ: ['off', 'int', 'wed'], lib: 'mid_blue_windowpane' },
    { id: 'charcoal_flannel', season: 'winter', name: "Charcoal Brushed Flannel", c: '#464747', weave: 'flannel', pat: "Flannel", usd: 837, wear: "Soft brushed surface. Warm.", occ: ['off', 'int', 'eve'], lib: 'charcoal_flannel' },
    { id: 'grey_glen_plaid', season: 'all', name: "Grey Glen Plaid Wool", c: '#999691', weave: 'check', pat: "Glen plaid", usd: 902, wear: "Woven wool.", occ: ['off', 'int', 'wed'], lib: 'grey_glen_plaid' },
    { id: 'navy_chalk_pinstripe', season: 'all', name: "Navy Chalk Pinstripe Wool", c: '#243045', weave: 'stripe', pat: "Pinstripe", usd: 937, wear: "Woven wool.", occ: ['off', 'int', 'eve'], lib: 'navy_chalk_pinstripe' },
    { id: 'brown_herringbone_tweed', season: 'winter', name: "Brown Herringbone Tweed", c: '#776251', weave: 'herring', pat: "Herringbone", usd: 1053, wear: "A zig-zag weave. Adds depth.", occ: ['cas', 'off', 'int'], lib: 'brown_herringbone_tweed' },
    { id: 'forest_green_hopsack', season: 'all', name: "Forest Green Hopsack", c: '#35463b', weave: 'textured', pat: "Hopsack", usd: 837, wear: "Open basket weave. Breathes well.", occ: ['wed', 'cas'], lib: 'forest_green_hopsack' },
    { id: 'burgundy_wool_twill', season: 'all', name: "Burgundy Wool Twill", c: '#622c3a', weave: 'plain', pat: "Fine twill", usd: 861, wear: "Smooth everyday wool.", occ: ['wed', 'eve'], lib: 'burgundy_wool_twill' },
    { id: 'ivory_irregular_linen', season: 'summer', name: "Ivory Irish Linen", c: '#daccb1', weave: 'plain', pat: "Linen", usd: 796, wear: "Airy and relaxed. Creases by design.", occ: ['wed', 'res'], lib: 'ivory_irregular_linen' },
    { id: 'sand_linen_blend', season: 'summer', name: "Sand Linen Blend", c: '#b6a082', weave: 'plain', pat: "Linen", usd: 902, wear: "Airy and relaxed. Creases by design.", occ: ['wed', 'res'], lib: 'sand_linen_blend' },
    { id: 'rust_linen', season: 'summer', name: "Rust Washed Linen", c: '#aa704e', weave: 'plain', pat: "Linen", usd: 736, wear: "Airy and relaxed. Creases by design.", occ: ['cas', 'res'], lib: 'rust_linen' },
    { id: 'sage_tropical_wool', season: 'summer', name: "Sage Green Tropical Wool", c: '#899987', weave: 'plain', pat: "Tropical weave", usd: 766, wear: "Open weave for warm weather.", occ: ['wed', 'res'], lib: 'sage_tropical_wool' },
    { id: 'midnight_blue_velvet', season: 'winter', name: "Midnight Blue Cotton Velvet", c: '#172545', weave: 'textured', pat: "Velvet", usd: 1147, wear: "Rich pile with a soft sheen.", occ: ['eve'], lib: 'midnight_blue_velvet' },
    { id: 'cream_wool_silk', season: 'all', name: "Cream Wool Silk Blend", c: '#d1c2a7', weave: 'textured', pat: "Birdseye", usd: 902, wear: "Tiny dotted pattern. Quiet from afar.", occ: ['wed', 'cas'], lib: 'cream_wool_silk' },
    { id: 'chocolate_brown_flannel', season: 'winter', name: "Chocolate Brown Flannel", c: '#53443c', weave: 'flannel', pat: "Flannel", usd: 837, wear: "Soft brushed surface. Warm.", occ: ['off', 'int', 'cas'], lib: 'chocolate_brown_flannel' },
    { id: 'charcoal_birdseye', season: 'all', name: "Charcoal Birdseye Wool", c: '#555a5b', weave: 'textured', pat: "Birdseye", usd: 861, wear: "Tiny dotted pattern. Quiet from afar.", occ: ['off', 'int', 'eve'], lib: 'charcoal_birdseye' },
    { id: 'sky_blue_seersucker', season: 'summer', name: "Sky Blue Seersucker", c: '#a5bfd2', weave: 'textured', pat: "Seersucker", usd: 684, wear: "Puckered cotton that stays cool.", occ: ['res', 'cas'], lib: 'sky_blue_seersucker' },
    { id: 'navy_mini_houndstooth', season: 'all', name: "Navy Mini Houndstooth", c: '#354254', weave: 'check', pat: "Houndstooth", usd: 937, wear: "Small broken check.", occ: ['off', 'int', 'wed'], lib: 'navy_mini_houndstooth' },
    { id: 'tobacco_prince_of_wales', season: 'winter', name: "Tobacco Prince of Wales Check", c: '#86705a', weave: 'check', pat: "Prince check", usd: 913, wear: "Woven wool.", occ: ['off', 'int', 'wed'], lib: 'tobacco_prince_of_wales' },
    { id: 'indigo_nailhead', season: 'all', name: "Indigo Nailhead Wool", c: '#304867', weave: 'check', pat: "Nailhead", usd: 861, wear: "Tiny dots in a regular grid.", occ: ['off', 'int', 'eve'], lib: 'indigo_nailhead' },
    { id: 'stone_boucle', season: 'winter', name: "Stone Boucl\u00e9 Weave", c: '#d2c4ab', weave: 'textured', pat: "Boucle", usd: 966, wear: "Looped yarn with a soft, nubby surface.", occ: ['cas', 'wed'], lib: 'stone_boucle' },
    { id: 'olive_fine_corduroy', season: 'winter', name: "Olive Needlecord", c: '#5c6749', weave: 'textured', pat: "Corduroy", usd: 669, wear: "Ribbed cotton. Relaxed and warm.", occ: ['cas'], lib: 'olive_fine_corduroy' },
    { id: 'copper_wide_wale_corduroy', season: 'winter', name: "Copper Wide-Wale Corduroy", c: '#945a36', weave: 'textured', pat: "Corduroy wide", usd: 601, wear: "Woven wool.", occ: ['cas'], lib: 'copper_wide_wale_corduroy' },
    { id: 'ocean_blue_sharkskin', season: 'all', name: "Ocean Blue Sharkskin", c: '#54788f', weave: 'textured', pat: "Sharkskin", usd: 861, wear: "Fine two-tone weave with a subtle sheen.", occ: ['off', 'int', 'wed'], lib: 'ocean_blue_sharkskin' },
    { id: 'plum_dinner_velvet', season: 'winter', name: "Plum Evening Velvet", c: '#543148', weave: 'textured', pat: "Velvet", usd: 1147, wear: "Rich pile with a soft sheen.", occ: ['eve'], lib: 'plum_dinner_velvet' },
    { id: 'camel_cashmere_wool', season: 'winter', name: "Camel Cashmere Wool", c: '#b29471', weave: 'plain', pat: "Cashmere", usd: 1351, wear: "Very soft. Warm without weight.", occ: ['off', 'int', 'cas'], lib: 'camel_cashmere_wool' },
    { id: 'steel_blue_microcheck', season: 'all', name: "Steel Blue Microcheck", c: '#5d7183', weave: 'check', pat: "Microcheck", usd: 837, wear: "Woven wool.", occ: ['off', 'int', 'wed'], lib: 'steel_blue_microcheck' },
    { id: 'tan_rust_overcheck', season: 'winter', name: "Tan Rust Overcheck", c: '#ad997e', weave: 'check', pat: "Overcheck", usd: 861, wear: "Woven wool.", occ: ['cas', 'off', 'int'], lib: 'tan_rust_overcheck' },
    { id: 'moss_basketweave', season: 'all', name: "Moss Basketweave", c: '#64745e', weave: 'textured', pat: "Basketweave", usd: 884, wear: "Chunky woven texture.", occ: ['cas', 'wed'], lib: 'moss_basketweave' },
    { id: 'midnight_mohair', season: 'all', name: "Midnight Mohair Blend", c: '#1c2d3a', weave: 'plain', pat: "Mohair", usd: 1036, wear: "Crisp, lustrous and light.", occ: ['eve', 'off', 'int'], lib: 'midnight_mohair' },
    { id: 'forest_blackwatch_tartan', season: 'winter', name: "Forest Blackwatch Tartan", c: '#304941', weave: 'check', pat: "Tartan", usd: 931, wear: "A traditional check in deep colours.", occ: ['sig', 'wed'], lib: 'forest_blackwatch_tartan' }
  ],

  /* Designs: full-outfit photos per occasion, with a jacket-only view and a shoe photo where the library has one.
     Cloth names and compositions for library cloths are illustrative. */
  designs: [
    { id: 'wedding-linen', c: '#d1c4b2', occ: 'wed', name: "Ivory linen", desc: "Light linen for a summer ceremony", image: 'library/suits/wedding-linen.jpg', jacket: 'library/jackets/wedding-linen.jpg', shoes: 'dark_brown_tassel_loafers' },
    { id: 'cream-linen', c: '#c7bbac', occ: 'wed', name: "Cream linen", desc: "A softer cream, relaxed and airy", image: 'library/suits/cream-linen.jpg', cloth: 'ivory_irregular_linen', jacket: 'library/jackets/cream-linen.jpg', shoes: 'tobacco_suede_penny_loafers' },
    { id: 'modern-grey-check', c: '#74706d', occ: 'off', name: "Grey check", desc: "A tailored checked suit for work", image: 'library/suits/modern-grey-check.jpg', jacket: 'library/jackets/modern-grey-check.jpg', shoes: 'brown_double_monk_straps' },
    { id: 'brown-glen-plaid', c: '#5a4736', occ: 'off', name: "Brown glen plaid", desc: "Warm plaid with a fine overcheck", image: 'library/suits/brown-glen-plaid.jpg', cloth: 'tobacco_prince_of_wales', jacket: 'library/jackets/brown-glen-plaid.jpg', shoes: 'cognac_plain_toe_oxfords' },
    { id: 'charcoal-pinstripe', c: '#2d2d2e', occ: 'off', name: "Charcoal pinstripe", desc: "A three-piece with a waistcoat", image: 'library/suits/charcoal-pinstripe.jpg', cloth: 'dgstr', jacket: 'library/jackets/charcoal-pinstripe.jpg', shoes: 'black_cap_toe_oxfords' },
    { id: 'smart-casual-blue', c: '#35445b', occ: 'cas', name: "Blue blazer", desc: "Blazer and cream trousers, no tie", image: 'library/suits/smart-casual-blue.jpg', jacket: 'library/jackets/smart-casual-blue.jpg', shoes: 'tobacco_suede_penny_loafers' },
    { id: 'summer-resort-taupe', c: '#7d6d56', occ: 'res', name: "Sand linen", desc: "Light and easy for warm weather", image: 'library/suits/summer-resort-taupe.jpg', jacket: 'library/jackets/summer-resort-taupe.jpg', shoes: 'sand_suede_chukka_boots' },
    { id: 'rust-linen', c: '#6e3e20', occ: 'res', name: "Rust linen", desc: "A warm, washed linen colour", image: 'library/suits/rust-linen.jpg', cloth: 'rust_linen', jacket: 'library/jackets/rust-linen.jpg', shoes: 'dark_brown_chelsea_boots' },
    { id: 'black-tie', c: '#1f1e1f', occ: 'eve', name: "Black tie", desc: "Tuxedo with a peak lapel", image: 'library/suits/black-tie.jpg', jacket: 'library/jackets/black-tie.jpg', shoes: 'black_cap_toe_oxfords' },
    { id: 'business-navy', c: '#222431', occ: 'int', name: "Navy business", desc: "A polished navy wool suit", image: 'library/suits/business-navy.jpg', jacket: 'library/jackets/business-navy.jpg', shoes: 'black_cap_toe_oxfords',
      /* photos of this suit in another cloth, with another tie, other shoes or without shoes; the first match wins
         (tie needs the tie added in Extras; shoe needs that shoe chosen; noShoes needs "No shoes" chosen) */
      variants: [
        { cloth: 'dbtro', tie: '#6b1d2b', shoe: 'cognac_plain_toe_oxfords', image: 'library/suits/business-navy--dbtro--tie-burgundy--shoe-cognac.jpg' },
        { cloth: 'dbtro', tie: '#6b1d2b', image: 'library/suits/business-navy--dbtro--tie-burgundy.jpg' },
        { cloth: 'dbtro', image: 'library/suits/business-navy--dbtro.jpg' },
        { cloth: 'n110', tie: '#6b1d2b', image: 'library/suits/business-navy--tie-burgundy.jpg' },
        { cloth: 'dbtro', tie: '#6b1d2b', noShoes: true, image: 'library/suits/business-navy--dbtro--tie-burgundy--no-shoes.jpg' },
        { cloth: 'dbtro', noShoes: true, image: 'library/suits/business-navy--dbtro--no-shoes.jpg' },
        { cloth: 'n110', tie: '#6b1d2b', noShoes: true, image: 'library/suits/business-navy--tie-burgundy--no-shoes.jpg' },
        { cloth: 'n110', noShoes: true, image: 'library/suits/business-navy--no-shoes.jpg' }
      ] },
    { id: 'travel-blue-grey', c: '#353b4a', occ: 'trv', name: "Blue-grey casual", desc: "Soft tailoring with sneakers", image: 'library/suits/travel-blue-grey.jpg', jacket: 'library/jackets/travel-blue-grey.jpg', shoes: 'white_minimal_leather_sneakers' },
    { id: 'statement-forest', c: '#2c3027', occ: 'sig', name: "Forest double-breasted", desc: "A textured green double-breasted suit", image: 'library/suits/statement-forest.jpg', jacket: 'library/jackets/statement-forest.jpg', shoes: 'brown_double_monk_straps' },
    { id: 'burgundy-modern', c: '#36131a', occ: 'sig', name: "Burgundy", desc: "A deep wine suit with a dark polo", image: 'library/suits/burgundy-modern.jpg', cloth: 'burgundy_wool_twill', jacket: 'library/jackets/burgundy-modern.jpg', shoes: 'black_wingtip_brogues' }
  ],

  shoeStyles: [
    { id: 'black_cap_toe_oxfords', name: "Black Cap-Toe Oxfords", color: "black", type: "oxford", material: "calf leather", price: 250, image: 'library/shoes/black_cap_toe_oxfords.jpg' },
    { id: 'cognac_plain_toe_oxfords', name: "Cognac Plain-Toe Oxfords", color: "cognac", type: "oxford", material: "calf leather", price: 240, image: 'library/shoes/cognac_plain_toe_oxfords.jpg' },
    { id: 'black_wingtip_brogues', name: "Black Wingtip Brogues", color: "black", type: "brogue", material: "calf leather", price: 270, image: 'library/shoes/black_wingtip_brogues.jpg' },
    { id: 'brown_double_monk_straps', name: "Brown Double Monk Straps", color: "brown", type: "monk strap", material: "calf leather", price: 265, image: 'library/shoes/brown_double_monk_straps.jpg' },
    { id: 'dark_brown_tassel_loafers', name: "Dark Brown Tassel Loafers", color: "dark brown", type: "tassel loafer", material: "calf leather", price: 230, image: 'library/shoes/dark_brown_tassel_loafers.jpg' },
    { id: 'black_penny_loafers', name: "Black Penny Loafers", color: "black", type: "penny loafer", material: "calf leather", price: 220, image: 'library/shoes/black_penny_loafers.jpg' },
    { id: 'tobacco_suede_penny_loafers', name: "Tobacco Suede Penny Loafers", color: "tobacco", type: "suede loafer", material: "suede", price: 210, image: 'library/shoes/tobacco_suede_penny_loafers.jpg' },
    { id: 'dark_brown_chelsea_boots', name: "Dark Brown Chelsea Boots", color: "dark brown", type: "chelsea boot", material: "calf leather", price: 290, image: 'library/shoes/dark_brown_chelsea_boots.jpg' },
    { id: 'sand_suede_chukka_boots', name: "Sand Suede Chukka Boots", color: "sand", type: "chukka boot", material: "suede", price: 255, image: 'library/shoes/sand_suede_chukka_boots.jpg' },
    { id: 'white_minimal_leather_sneakers', name: "White Minimal Leather Sneakers", color: "white", type: "sneaker", material: "leather", price: 180, image: 'library/shoes/white_minimal_leather_sneakers.jpg' }
  ],

  occasions: [
    { id: 'wed', label: 'Wedding', c: '#b9a68a', image: 'wedding-linen.jpg', desc: 'A refined look for the ceremony or guests', mood: 'Celebratory & refined' },
    { id: 'off', label: 'Business', c: '#6f737a', image: 'modern-grey-check.jpg', desc: 'A tailored checked suit for work', mood: 'Confident & versatile' },
    { id: 'cas', label: 'Smart casual', c: '#3f6ea8', image: 'smart-casual-blue.jpg', desc: 'A blue blazer and relaxed tailored trousers', mood: 'Relaxed but considered' },
    { id: 'res', label: 'Summer & resort', c: '#9b8262', image: 'summer-resort-taupe.jpg', desc: 'Lightweight tailoring for warm-weather plans', mood: 'Warm-weather ease' },
    { id: 'eve', label: 'Formal evening', c: '#121316', image: 'black-tie.jpg', desc: 'A black-tie tuxedo for special evenings', mood: 'Elegant & occasion-ready' },
    { id: 'int', label: 'Interview', c: '#1d2a44', image: 'business-navy.jpg', desc: 'A polished navy wool suit', mood: 'Sharp & professional' },
    { id: 'trv', label: 'Travel & weekend', c: '#42536b', image: 'travel-blue-grey.jpg', desc: 'Soft tailoring with sneakers', mood: 'Comfortable & put-together' },
    { id: 'sig', label: 'Statement tailoring', c: '#2c4538', image: 'statement-forest.jpg', desc: 'A textured green double-breasted suit', mood: 'Individual & confident' }
  ],

  quickColours: ['#1d2a44', '#121316', '#3a3d43', '#6f737a', '#aeb1b5', '#b9a68a', '#2c4538', '#5a2030', '#3f6ea8'],

  /* plain-language explanations of cloth-name jargon, matched against the cloth name */
  glossary: [
    { rx: /S\d{3}['\u2019]?s?\b/i, term: "Super numbers (S110's, S150's...)", text: 'Show how fine the wool fibre is. Higher is softer and lighter, but wears less hard. S110\u2019s is a solid everyday cloth; S150\u2019s and above suit occasions.' },
    { rx: /Tropical/i, term: 'Tropical', text: 'A light, open weave that lets air through. Good for summer and travel.' },
    { rx: /Wrinkle-Free/i, term: 'Wrinkle-Free 4-Ply', text: 'Each yarn is twisted from four strands, which helps the cloth spring back from creasing. Built for travel.' },
    { rx: /Velvet/i, term: 'Velvet', text: 'A short, dense pile with a rich sheen. Best for evenings and winter.' },
    { rx: /Corduroy|Needlecord/i, term: 'Corduroy', text: 'Ribbed cotton with a soft, warm feel. A relaxed choice for autumn and winter.' },
    { rx: /Seersucker/i, term: 'Seersucker', text: 'A puckered cotton that sits away from the skin and stays cool in the heat.' },
    { rx: /Tweed/i, term: 'Tweed', text: 'A hard-wearing woollen cloth with a rustic texture. Made for colder days.' },
    { rx: /Linen/i, term: 'Linen', text: 'Airy and cool. It creases easily, which is part of its character.' },
    { rx: /Houndstooth/i, term: 'Houndstooth', text: 'A small broken check. Adds pattern without being loud.' },
    { rx: /Tartan|Blackwatch/i, term: 'Tartan', text: 'A traditional woven check in deep colours. A statement piece.' },
    { rx: /Windowpane/i, term: 'Windowpane', text: 'Thin lines forming large squares, like panes of a window.' },
    { rx: /Glen|Prince of Wales/i, term: 'Glen plaid', text: 'A classic check of small and large patterns. Smart, with a British feel.' },
    { rx: /Birdseye|Nailhead/i, term: 'Birdseye and nailhead', text: 'Tiny dots in the weave. Quiet from a distance, rich up close.' },
    { rx: /Bouclé|Boucle/i, term: 'Bouclé', text: 'Looped yarn that gives a soft, nubby surface.' },
    { rx: /Hopsack|Basketweave/i, term: 'Hopsack and basketweave', text: 'An open weave that breathes well. Casual and textured.' },
    { rx: /Sharkskin/i, term: 'Sharkskin', text: 'A fine two-tone weave with a subtle sheen.' },
    { rx: /Flannel/i, term: 'Flannel', text: 'A soft, slightly brushed surface that feels warm. Best for autumn and winter.' },
    { rx: /Herringbone/i, term: 'Herringbone', text: 'A zig-zag weave pattern. Adds texture without being loud.' },
    { rx: /Cashmere/i, term: 'Cashmere blend', text: 'Wool with cashmere added for a softer, smoother feel.' },
    { rx: /Mohair/i, term: 'Mohair', text: 'A lustrous fibre that stays crisp and resists creasing.' },
    { rx: /Silk/i, term: 'Silk blend', text: 'A subtle sheen and a very light, smooth hand.' },
    { rx: /Stripe/i, term: 'Stripe', text: 'Fine lines in the cloth. Reads sharper and more formal.' },
    { rx: /Check/i, term: 'Check', text: 'A woven grid pattern. Reads more relaxed.' }
  ],

  presets: [
    { id: 'havana', name: 'Havana', image: 'smart-casual-blue.jpg', desc: 'Soft shoulder, notch lapel and jetted pockets.', who: 'Relaxed Italian tailoring. Easy to dress up or down.', set: { shoulder: 'natural', lapel: 'notch', pockets: 'jetted', closure: 'sb2', canvas: 'half' } },
    { id: 'milano', name: 'Milano', image: 'modern-grey-check.jpg', desc: 'Structured shoulder and classic flap pockets.', who: 'More shape through the shoulder. A sharper outline.', set: { shoulder: 'structured', lapel: 'notch', pockets: 'flap', closure: 'sb2', canvas: 'half' } },
    { id: 'coastal', name: 'Coastal', image: 'summer-resort-taupe.jpg', desc: 'Natural shoulder, patch pockets and a relaxed one-button front.', who: 'Light, informal tailoring for summer and weekends.', set: { shoulder: 'natural', lapel: 'notch', pockets: 'patch', closure: 'sb1', canvas: 'half' } },
    { id: 'evening', name: 'Formal evening', image: 'black-tie.jpg', desc: 'Structured shoulder, peak lapel and a clean one-button front.', who: 'A sharper line for weddings, ceremonies and evening events.', set: { shoulder: 'structured', lapel: 'peak', pockets: 'jetted', closure: 'sb1', canvas: 'full' } }
  ],

  style: [
    { key: 'shoulder', label: 'Shoulder', opts: [['natural', 'Natural'], ['structured', 'Structured']] },
    { key: 'lapel',    label: 'Lapel',    opts: [['notch', 'Notch'], ['peak', 'Peak']] },
    { key: 'closure',  label: 'Buttons',  opts: [['sb2', 'Two'], ['sb1', 'One'], ['db', 'Double-breasted']] },
    { key: 'pockets',  label: 'Pockets',  opts: [['flap', 'Flap'], ['jetted', 'Jetted'], ['patch', 'Patch']] },
    { key: 'canvas',   label: 'Canvas',   opts: [['half', 'Half'], ['full', 'Full', 150]] },
    { key: 'button',   label: 'Button',   opts: [['horn', 'Dark horn'], ['black', 'Matte black'], ['mop', 'Mother-of-pearl', 25]] }
  ],

  linings: [['#1f2d4d', 'Navy'], ['#6b1d2b', 'Burgundy'], ['#24473a', 'Bottle green'], ['#b9bcc0', 'Silver'], ['#b88a1e', 'Gold'], ['#121212', 'Black']],

  builds: ['Slim', 'Regular', 'Athletic', 'Broad'],
  sizes: [44, 46, 48, 50, 52, 54, 56, 58],
  pantsSizes: [38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58],

  adjustments: [
    { key: 'sleeve', label: 'Sleeve' },
    { key: 'jlen',   label: 'Jacket length' },
    { key: 'waist',  label: 'Waist' },
    { key: 'tlen',   label: 'Trouser length' },
    { key: 'rise',   label: 'Trouser rise' }
  ],

  extras: [
    { id: 'shirt',  name: 'Shirt',                  price: 89,  photo: true, image: 'shirt-white.jpg', detail: 'Cotton poplin', variants: { '#f3f3ef': 'variants/shirt-white.jpg', '#c9dcef': 'variants/shirt-sky-blue.jpg', '#f2e6e4': 'variants/shirt-pale-pink.jpg', '#dfe2e6': 'variants/shirt-pale-grey.jpg' } },
    { id: 'tie',    name: 'Silk tie',               price: 59,  photo: true, image: 'tie-burgundy.jpg', detail: 'Textured silk twill', variants: { '#6b1d2b': 'variants/tie-burgundy.jpg', '#7e93b5': 'variants/tie-steel-blue.jpg', '#24473a': 'variants/tie-forest-green.jpg', '#1f2d4d': 'variants/tie-navy.jpg', '#34373d': 'variants/tie-charcoal.jpg', '#b88a1e': 'variants/tie-mustard.jpg', '#9a4a2a': 'variants/tie-rust.jpg' } },
    { id: 'square', name: 'Pocket square',          price: 25,  photo: true, image: 'pocket-square-ivory.jpg', detail: 'Linen pocket square', variants: { '#f6f6f3': 'variants/pocket-square-ivory.jpg', '#6b1d2b': 'variants/pocket-square-burgundy.jpg', '#c9dcef': 'variants/pocket-square-sky-blue.jpg' } },
    { id: 'vest',   name: 'Waistcoat, same cloth',  price: 179, image: 'waistcoat-navy.jpg', detail: 'Five-button waistcoat' },
    { id: 'trs2',   name: 'Second trousers',        price: 249, image: 'trousers-navy.jpg', detail: 'Matching tailored trousers' },
    { id: 'shoes',  name: 'Leather shoes',          price: 249, colours: true, image: 'oxford-black.jpg', detail: 'Polished leather Oxfords', variants: { '#9a6a3c': 'variants/shoes-tan.jpg', '#4a2c1d': 'variants/shoes-brown.jpg', '#121212': 'variants/shoes-black.jpg' } }
  ],

  colourNames: {
    '#f3f3ef': 'White', '#c9dcef': 'Sky blue', '#dfe2e6': 'Pale grey', '#f2e6e4': 'Pale pink',
    '#6b1d2b': 'Burgundy', '#1f2d4d': 'Navy', '#24473a': 'Forest', '#b88a1e': 'Mustard', '#34373d': 'Charcoal', '#9a4a2a': 'Rust', '#7e93b5': 'Steel blue',
    '#f6f6f3': 'White linen', '#121212': 'Black', '#4a2c1d': 'Dark brown', '#9a6a3c': 'Tan', '#9b8262': 'Taupe', '#42536b': 'Blue-grey'
  }
};
