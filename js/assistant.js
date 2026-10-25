/* The stylist's reader.
   Turns one line of plain text into choices: occasion, colour, season, budget, size details and style details.
   It runs in the browser and sends nothing anywhere. Whole words only, so "tailored" is never read as "red". */
window.Brief = (function () {
  /* order matters: specific words first */
  var COLOURS = [
    [/\b(light|pale) gr[ae]y\b|\bsilver\b/, '#aeb1b5', 'light grey'],
    [/\bcharcoal\b|\bdark gr[ae]y\b|\banthracite\b/, '#3a3d43', 'charcoal'],
    [/\bblue.?gr[ae]y\b|\bslate\b/, '#42536b', 'blue-grey'],
    [/\bmidnight\b|\bink\b/, '#18233a', 'midnight'],
    [/\bnavy\b|\bdark blue\b|\bindigo\b/, '#1d2a44', 'navy'],
    [/\b(light|sky|powder|pale) blue\b/, '#7e9fc4', 'light blue'],
    [/\bblue\b|\bcobalt\b|\broyal\b/, '#3f6ea8', 'blue'],
    [/\bblack\b/, '#121316', 'black'],
    [/\bgr[ae]y\b/, '#6f737a', 'grey'],
    [/\bolive\b/, '#4d5238', 'olive'],
    [/\bforest\b|\bbottle green\b|\bgreen\b|\bemerald\b/, '#2c4538', 'green'],
    [/\bburgundy\b|\bwine\b|\bmaroon\b|\boxblood\b|\bclaret\b/, '#5a2030', 'burgundy'],
    [/\btaupe\b|\bmushroom\b/, '#9b8262', 'taupe'],
    [/\bcamel\b|\btan\b/, '#b08a5b', 'camel'],
    [/\bsand\b|\bbeige\b|\bstone\b|\boatmeal\b|\bcream\b|\bivory\b|\becru\b|\boff.?white\b/, '#b9a68a', 'sand'],
    [/\bbrown\b|\bchocolate\b|\bmocha\b/, '#5e4540', 'brown']
  ];
  var OCC = [
    ['eve', /\bblack.?tie\b|\btuxedo\b|\btux\b|\bgala\b|\bformal (evening|dinner|event)\b|\bevening\b|\bcocktail\b|\bprom\b|\bparty\b|\bformal\b/],
    ['wed', /\bwedding\b|\bgroom\b|\bbest man\b|\bceremony\b|\bmarriage\b|\breception\b/],
    ['res', /\bresort\b|\bbeach\b|\bholiday\b|\bvacation\b|\bdestination\b|\bhoneymoon\b|\bcruise\b|\bwarm weather\b|\bhot weather\b|\blinen\b|\briviera\b/],
    ['sig', /\bstatement\b|\bdouble.?breasted\b|\bbold\b|\bstand.?out\b|\bdistinctive\b|\bfashion.?forward\b/],
    ['cas', /\bsmart.?casual\b|\bcasual\b|\bdate night\b|\bbrunch\b|\bno tie\b|\bwithout a tie\b|\bblazer\b/],
    ['int', /\binterview\b|\bfirst job\b|\bgraduate\b|\binternship\b/],
    ['trv', /\btravel\b|\btrip\b|\bflight\b|\bcommut\w*\b|\bairport\b|\bweekend\b|\bwrinkle.?(free|resistant)\b/],
    ['off', /\boffice\b|\bwork\b|\bworking\b|\bbusiness\b|\bmeeting\b|\bcorporate\b|\bprofessional\b|\bdaily\b|\beveryday\b|\bday to day\b/]
  ];
  var WEAVES = [
    ['flannel', /\bflannel\b/], ['herring', /\bherringbone\b/], ['check', /\bcheck(ed)?\b|\bwindowpane\b/], ['stripe', /\bpinstripe\w*\b|\bstripe\w*\b/],
    ['tropical', /\btropical\b|\blightweight\b|\bbreathable\b/], ['cashmere', /\bcashmere\b|\bsoft\b/], ['wrinkle', /\bwrinkle.?(free|resistant)\b|\bcrease\b/]
  ];
  var STYLE = [
    ['lapel', 'peak', /\bpeak(ed)?\b/], ['lapel', 'notch', /\bnotch(ed)?\b/],
    ['closure', 'db', /\bdouble.?breasted\b|\bdb\b/], ['closure', 'sb1', /\b(one|1).?button\b/], ['closure', 'sb2', /\b(two|2).?button\b/],
    ['pockets', 'patch', /\bpatch pockets?\b/], ['pockets', 'jetted', /\bjetted\b|\bbesom\b/], ['pockets', 'flap', /\bflap pockets?\b/],
    ['canvas', 'full', /\bfull.?canvas\b/], ['canvas', 'half', /\bhalf.?canvas\b/],
    ['shoulder', 'natural', /\b(natural|soft|unstructured) shoulders?\b/], ['shoulder', 'structured', /\b(structured|padded|strong) shoulders?\b/]
  ];
  var STYLE_LABEL = { peak: 'Peak lapel', notch: 'Notch lapel', db: 'Double-breasted', sb1: 'One button', sb2: 'Two buttons', patch: 'Patch pockets', jetted: 'Jetted pockets', flap: 'Flap pockets', full: 'Full canvas', half: 'Half canvas', natural: 'Natural shoulder', structured: 'Structured shoulder' };

  /* phones type curly quotes; treat them as plain ones */
  function normalise(text) { return String(text || '').replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim(); }

  function parse(text) {
    var t = ' ' + normalise(text).toLowerCase().replace(/[,;]/g, ' ') + ' ';
    var out = { occ: null, season: null, colour: null, colourName: null, shade: null, h: null, w: null, usual: null, pref: null, budget: null, weaves: [], style: {}, via: 'local' };
    var i, m;
    for (i = 0; i < OCC.length; i++) if (OCC[i][1].test(t)) { out.occ = OCC[i][0]; break; }
    if (/\b(summer|spring|hot|warm|beach|sunny|heat|tropical)\b/.test(t)) out.season = 'summer';
    else if (/\b(winter|autumn|fall|cold|snow|chilly)\b/.test(t)) out.season = 'winter';
    for (i = 0; i < COLOURS.length; i++) if (COLOURS[i][0].test(t)) { out.colour = COLOURS[i][1]; out.colourName = COLOURS[i][2]; break; }
    if (/\b(dark|darker|deep|deeper|midnight)\b/.test(t)) out.shade = 'dark';
    else if (/\b(light|lighter|pale|paler|bright|brighter)\b/.test(t)) out.shade = 'light';
    if ((m = t.match(/(\d{3})\s?cm/))) out.h = +m[1];
    else if ((m = t.match(/\b(\d)[.,](\d{2})\s?m\b/))) out.h = Math.round(+(m[1] + '.' + m[2]) * 100);
    else if ((m = t.match(/\b(\d)\s?(?:ft|feet|foot|')\s?(\d{1,2})/))) out.h = Math.round(+m[1] * 30.48 + +m[2] * 2.54);
    if ((m = t.match(/(\d{2,3})\s?kg/))) out.w = +m[1];
    else if ((m = t.match(/(\d{2,3})\s?(?:lb|lbs|pounds)\b/))) out.w = Math.round(+m[1] * 0.4536);
    if ((m = t.match(/\b(?:size|usual|wear a|wear)\s+(4[4-9]|5[0-8])\b/))) out.usual = +m[1];
    if (/\b(slim|tailored|close fit|fitted|skinny)\b/.test(t)) out.pref = 'Slim';
    else if (/\b(relaxed|loose|roomy|comfortable|baggy)\b/.test(t)) out.pref = 'Relaxed';
    else if (/\b(regular fit|classic fit)\b/.test(t)) out.pref = 'Regular';
    if ((m = t.match(/\b(?:under|below|max|up to|less than|budget(?: of)?|around)\s*€?\s*(\d{3,4})\b/)) || (m = t.match(/€\s*(\d{3,4})\b/))) out.budget = +m[1];
    for (i = 0; i < WEAVES.length; i++) if (WEAVES[i][1].test(t)) out.weaves.push(WEAVES[i][0]);
    STYLE.forEach(function (s) { if (!out.style[s[0]] && s[2].test(t)) out.style[s[0]] = s[1]; });
    return out;
  }

  /* what was understood, as short readable bits */
  function summary(r, D) {
    var bits = [];
    if (r.occ) bits.push(D.occasions.filter(function (o) { return o.id === r.occ; })[0].label);
    if (r.season) bits.push(r.season === 'summer' ? 'Summer' : 'Winter');
    if (r.colourName) bits.push((r.shade ? r.shade[0].toUpperCase() + r.shade.slice(1) + ' ' : '') + r.colourName);
    else if (r.shade) bits.push(r.shade === 'dark' ? 'Darker' : 'Lighter');
    r.weaves.forEach(function (w) { bits.push(w[0].toUpperCase() + w.slice(1)); });
    Object.keys(r.style).forEach(function (k) { bits.push(STYLE_LABEL[r.style[k]]); });
    if (r.h) bits.push(r.h + ' cm');
    if (r.w) bits.push(r.w + ' kg');
    if (r.usual) bits.push('Size ' + r.usual);
    if (r.pref) bits.push(r.pref + ' fit');
    if (r.budget) bits.push('Up to €' + r.budget);
    return bits;
  }

  function isQuestion(text) {
    var t = normalise(text).toLowerCase();
    return /\?\s*$/.test(t) || /^(what|why|how|when|which|where|can|could|do|does|is|are|should|will|tell me|explain)\b/.test(t);
  }

  /* questions about how things work: answered from facts the page already shows */
  var KB = [
    { rx: /\bcanvas\b/, text: 'Canvas is the layer inside the jacket that gives it shape. Half canvas is lighter and moves more naturally. Full canvas has a richer drape and a more sculpted line.' },
    { rx: /\blapels?\b|\bnotch\b|\bpeak\b/, text: 'A notch lapel is the everyday classic. A peak lapel points upward and looks more formal. Peak lapels need a structured shoulder.' },
    { rx: /\bshoulders?\b/, text: 'A natural shoulder is soft and follows your own line. A structured shoulder has more padding and a sharper outline.' },
    { rx: /\bpockets?\b|\bjetted\b|\bflap\b|\bpatch\b/, text: 'Jetted pockets are slim and sleek, flap pockets are the classic business look, patch pockets are the most relaxed.' },
    { rx: /\bhavana\b/, text: 'Havana has a soft shoulder, notch lapel and jetted pockets. Relaxed Italian tailoring, easy to dress up or down.' },
    { rx: /\bmilano\b/, text: 'Milano has a structured shoulder and classic flap pockets. More shape through the shoulder and a sharper outline.' },
    { rx: /\balter(ation)?s?\b|\bhem(ming)?\b|\badjust(ment)?s?\b/, text: 'After your suit arrives, in-store tailors make the final adjustments. That usually takes 30 minutes to 3 days.' },
    { rx: /\bdeliver\w*\b|\bhow long\b|\bwhen will\b|\bship\w*\b|\bpick.?up\b|\bready\b/, text: 'Your suit is ready in about 2 to 3 weeks. Delivery is free, or you can pick it up in store.' },
    { rx: /\breturn\w*\b|\brefund\w*\b|\bnot right\b|\bsend back\b/, text: 'You can return it within 30 days of delivery, as long as it is unworn and unaltered.' },
    { rx: /\bpassport\b/, text: 'The Size Passport keeps your saved size so you do not start from zero next time. Here it is saved on this device only.' },
    { rx: /\bmeasure\b|\btape\b|\bchest\b|\bwaist\b/, text: 'Measure your chest around the fullest part, under your arms. Your jacket size is about half of that in cm. The Fit step has a short guide.' }
  ];
  function kb(text) {
    if (!isQuestion(text)) return null;
    var t = normalise(text).toLowerCase();
    for (var i = 0; i < KB.length; i++) if (KB[i].rx.test(t)) return KB[i].text;
    return null;
  }

  return { parse: parse, summary: summary, isQuestion: isQuestion, kb: kb, normalise: normalise, STYLE_LABEL: STYLE_LABEL };
})();
