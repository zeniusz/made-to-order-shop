/* "Describe what you need": turns one sentence into configurator choices.
   Local mode: a small rule-based parser. Runs in the browser, nothing is sent anywhere.
   Claude mode (optional): the visitor pastes their own Anthropic API key, kept only in this tab's session storage. */
window.Brief = (function () {
  var COLOURS = [
    ['light grey', '#aeb1b5'], ['light gray', '#aeb1b5'], ['charcoal', '#3a3d43'], ['dark grey', '#3a3d43'], ['dark gray', '#3a3d43'],
    ['navy', '#1d2a44'], ['dark blue', '#18233a'], ['midnight', '#0f1626'], ['light blue', '#7e9fc4'], ['blue', '#3f6ea8'],
    ['black', '#121316'], ['grey', '#6f737a'], ['gray', '#6f737a'],
    ['forest', '#2c4538'], ['green', '#2c4538'], ['burgundy', '#5a2030'], ['wine', '#5a2030'], ['red', '#5a2030'],
    ['sand', '#b9a68a'], ['beige', '#b9a68a'], ['stone', '#b9a68a'], ['tan', '#b9a68a'], ['camel', '#b08a5b'], ['brown', '#5e4540']
  ];
  var OCC = [
    ['wed', /wedding|ceremony|groom|best man|reception|guest/],
    ['int', /interview|first job|graduat|internship/],
    ['eve', /evening|black tie|gala|party|dinner|cocktail|formal|prom/],
    ['trv', /travel|trip|flight|commut|holiday|business trip/],
    ['off', /office|work|business|daily|everyday|meeting|day to day/]
  ];
  var WEAVES = [
    ['flannel', /flannel/], ['herring', /herringbone/], ['check', /check|windowpane/], ['stripe', /pinstripe|stripe/],
    ['tropical', /tropical|lightweight|breathable/], ['cashmere', /cashmere|soft/], ['wrinkle', /wrinkle|crease|travel/]
  ];

  function num(x) { return x == null ? null : +x; }

  function parse(text) {
    var t = ' ' + String(text || '').toLowerCase().replace(/[,;]/g, ' ') + ' ';
    var out = { occ: null, season: null, colour: null, colourName: null, h: null, w: null, usual: null, pref: null, budget: null, weaves: [], via: 'local' };
    var i, m;

    for (i = 0; i < OCC.length; i++) if (OCC[i][1].test(t)) { out.occ = OCC[i][0]; break; }
    if (/summer|hot|warm|beach|italy|spain|greece|tropic|sunny|heat/.test(t)) out.season = 'summer';
    else if (/winter|cold|autumn|fall\b|snow|chilly/.test(t)) out.season = 'winter';

    for (i = 0; i < COLOURS.length; i++) {
      if (t.indexOf(COLOURS[i][0]) > -1) { out.colour = COLOURS[i][1]; out.colourName = COLOURS[i][0]; break; }
    }

    if ((m = t.match(/(\d{3})\s?cm/))) out.h = +m[1];
    else if ((m = t.match(/\b(\d)[.,](\d{2})\s?m\b/))) out.h = Math.round(+(m[1] + '.' + m[2]) * 100);
    else if ((m = t.match(/\b(\d)\s?(?:ft|feet|foot|')\s?(\d{1,2})/))) out.h = Math.round(+m[1] * 30.48 + +m[2] * 2.54);
    if ((m = t.match(/(\d{2,3})\s?kg/))) out.w = +m[1];
    else if ((m = t.match(/(\d{2,3})\s?(?:lb|lbs|pounds)/))) out.w = Math.round(+m[1] * 0.4536);
    if ((m = t.match(/(?:size|usual|wear a|wear)\s+(4[4-9]|5[0-8])\b/))) out.usual = +m[1];

    if (/slim|tailored|close fit|fitted|skinny/.test(t)) out.pref = 'Slim';
    else if (/relaxed|loose|roomy|comfortable|baggy/.test(t)) out.pref = 'Relaxed';
    else if (/regular fit|classic/.test(t)) out.pref = 'Regular';

    if ((m = t.match(/(?:under|below|max|up to|less than|budget(?: of)?|around)\s*€?\s*(\d{3,4})/)) || (m = t.match(/€\s*(\d{3,4})/))) out.budget = +m[1];
    for (i = 0; i < WEAVES.length; i++) if (WEAVES[i][1].test(t)) out.weaves.push(WEAVES[i][0]);
    return out;
  }

  /* what was understood, as short readable chips */
  function summary(r, D) {
    var bits = [];
    if (r.occ) bits.push(D.occasions.filter(function (o) { return o.id === r.occ; })[0].label);
    if (r.season) bits.push(r.season === 'summer' ? 'Summer' : 'Winter');
    if (r.colourName) bits.push(r.colourName[0].toUpperCase() + r.colourName.slice(1));
    r.weaves.forEach(function (w) { bits.push(w[0].toUpperCase() + w.slice(1)); });
    if (r.h) bits.push(r.h + ' cm');
    if (r.w) bits.push(r.w + ' kg');
    if (r.usual) bits.push('Size ' + r.usual);
    if (r.pref) bits.push(r.pref + ' fit');
    if (r.budget) bits.push('Up to €' + r.budget);
    return bits;
  }

  /* Optional: ask Claude to read the sentence. Returns the same shape as parse(). */
  var SYSTEM = 'You help a customer configure a made-to-measure suit. Read their message and reply with ONLY a JSON object, no prose, with these keys: ' +
    '"occasion" (one of "int","off","wed","eve","trv" or null; int=interview, off=office, wed=wedding, eve=evening or formal, trv=travel), ' +
    '"season" ("summer","winter" or null), "colour_hex" (a #rrggbb suit cloth colour that fits, or null), "colour_name" (short English name or null), ' +
    '"height_cm" (number or null), "weight_kg" (number or null), "usual_size" (EU jacket size 44-58 or null), ' +
    '"fit" ("Slim","Regular","Relaxed" or null), "budget_eur" (number or null), "keywords" (array from "flannel","herring","check","stripe","tropical","cashmere","wrinkle"). ' +
    'Use null when the customer did not say. Never invent measurements.';

  function askClaude(text, key) {
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 400, system: SYSTEM, messages: [{ role: 'user', content: text }] })
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status === 401 ? 'That key was not accepted.' : 'Claude could not be reached (' + res.status + ').');
      return res.json();
    }).then(function (data) {
      var raw = (data.content && data.content[0] && data.content[0].text) || '';
      var j = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
      var o = JSON.parse(j);
      var okHex = /^#[0-9a-f]{6}$/i.test(o.colour_hex || '');
      return {
        occ: ['int', 'off', 'wed', 'eve', 'trv'].indexOf(o.occasion) > -1 ? o.occasion : null,
        season: o.season === 'summer' || o.season === 'winter' ? o.season : null,
        colour: okHex ? o.colour_hex.toLowerCase() : null, colourName: o.colour_name || null,
        h: o.height_cm >= 140 && o.height_cm <= 220 ? Math.round(o.height_cm) : null,
        w: o.weight_kg >= 40 && o.weight_kg <= 160 ? Math.round(o.weight_kg) : null,
        usual: o.usual_size >= 44 && o.usual_size <= 58 ? Math.round(o.usual_size / 2) * 2 : null,
        pref: ['Slim', 'Regular', 'Relaxed'].indexOf(o.fit) > -1 ? o.fit : null,
        budget: num(o.budget_eur) > 300 ? num(o.budget_eur) : null,
        weaves: Array.isArray(o.keywords) ? o.keywords.filter(function (k) { return typeof k === 'string'; }) : [],
        via: 'claude'
      };
    });
  }

  return { parse: parse, summary: summary, askClaude: askClaude };
})();
