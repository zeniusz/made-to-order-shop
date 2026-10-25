/* Catalogue and options.
   Cloth names and USD prices were read from the live US Custom Made configurator (Oct 2026).
   Colours, wear notes, euro prices and every other option are illustrative. */
window.CM = {
  usdToEur: 0.92,

  cloths: [
    { id: 'n110', season: 'all',  name: "Navy Pure S110's Wool",               c: '#1d2a44', weave: 'plain',   usd: 873,  wear: 'Everyday wool. Hard-wearing.',              occ: ['int', 'off', 'trv'] },
    { id: 'dbtro', season: 'summer', name: 'Dark Blue Pure Tropical Wool',        c: '#18233a', weave: 'plain',   usd: 673,  wear: 'Light, open weave. For summer and travel.',  occ: ['trv', 'wed', 'res', 'cas', 'int'] },
    { id: 'nher', season: 'all',  name: "Navy Herringbone Pure S120's Wool",   c: '#212d47', weave: 'herring', usd: 923,  wear: 'Subtle zig-zag texture.',                    occ: ['off', 'int', 'cas'] },
    { id: 'mgfl', season: 'winter',  name: "Mid Grey Pure S120's Wool Flannel",   c: '#6f737a', weave: 'flannel', usd: 923,  wear: 'Soft, brushed, warm. Autumn and winter.',   occ: ['off', 'int'] },
    { id: 'b110', season: 'all',  name: "Black Pure S110's Wool",              c: '#121316', weave: 'plain',   usd: 873,  wear: 'Evening and formal.',                        occ: ['eve', 'sig'] },
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
    { id: 'dgwc', season: 'winter',  name: 'Dark Green Wool Cashmere',            c: '#2e4a3b', weave: 'plain',   usd: 1023, wear: 'Soft cashmere blend in green.',             occ: ['eve', 'sig'] }
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
    { rx: /S\d{3}'?s/i, term: "Super numbers (S110's, S150's...)", text: 'Show how fine the wool fibre is. Higher is softer and lighter, but wears less hard. S110\u2019s is a solid everyday cloth; S150\u2019s and above suit occasions.' },
    { rx: /Tropical/i, term: 'Tropical', text: 'A light, open weave that lets air through. Good for summer and travel.' },
    { rx: /Wrinkle-Free/i, term: 'Wrinkle-Free 4-Ply', text: 'Each yarn is twisted from four strands, which helps the cloth spring back from creasing. Built for travel.' },
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
    { id: 'vest',   name: 'Waistcoat, same cloth',  price: 129, image: 'waistcoat-navy.jpg', detail: 'Five-button waistcoat' },
    { id: 'trs2',   name: 'Second trousers',        price: 199, image: 'trousers-navy.jpg', detail: 'Matching tailored trousers' },
    { id: 'shoes',  name: 'Leather shoes',          price: 249, colours: true, image: 'oxford-black.jpg', detail: 'Polished leather Oxfords', variants: { '#9a6a3c': 'variants/shoes-tan.jpg', '#4a2c1d': 'variants/shoes-brown.jpg', '#121212': 'variants/shoes-black.jpg' } }
  ],

  colourNames: {
    '#f3f3ef': 'White', '#c9dcef': 'Sky blue', '#dfe2e6': 'Pale grey', '#f2e6e4': 'Pale pink',
    '#6b1d2b': 'Burgundy', '#1f2d4d': 'Navy', '#24473a': 'Forest', '#b88a1e': 'Mustard', '#34373d': 'Charcoal', '#9a4a2a': 'Rust', '#7e93b5': 'Steel blue',
    '#f6f6f3': 'White linen', '#121212': 'Black', '#4a2c1d': 'Dark brown', '#9a6a3c': 'Tan', '#9b8262': 'Taupe', '#42536b': 'Blue-grey'
  }
};
