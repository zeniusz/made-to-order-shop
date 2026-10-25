/* The stylist.
   1. Built-in (default): a small rule-based reader that runs in the browser. Nothing is sent anywhere.
   2. Hosted Claude (optional): if js/config.js sets CM_AI_ENDPOINT to a deployed proxy (see worker/claude-proxy.js),
      each message goes there first and Claude answers. If the endpoint is empty or fails, the built-in reader answers.
   No key is ever typed into or stored by this page. */
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

  function parse(text) {
    var t = ' ' + String(text || '').toLowerCase().replace(/[,;]/g, ' ') + ' ';
    var out = { occ: null, season: null, colour: null, colourName: null, h: null, w: null, usual: null, pref: null, budget: null, weaves: [], via: 'local' };
    var i, m;
    for (i = 0; i < OCC.length; i++) if (OCC[i][1].test(t)) { out.occ = OCC[i][0]; break; }
    if (/summer|hot|warm|beach|italy|spain|greece|tropic|sunny|heat/.test(t)) out.season = 'summer';
    else if (/winter|cold|autumn|fall\b|snow|chilly/.test(t)) out.season = 'winter';
    for (i = 0; i < COLOURS.length; i++) if (t.indexOf(COLOURS[i][0]) > -1) { out.colour = COLOURS[i][1]; out.colourName = COLOURS[i][0]; break; }
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

  /* short readable list of what was understood */
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

  /* questions about how things work: answered from facts the page already shows */
  var KB = [
    { rx: /half canvas|full canvas|canvas/, text: 'Canvas is the layer inside the jacket that gives it shape. Half canvas is lighter and moves more naturally. Full canvas has a richer drape and a more sculpted line.' },
    { rx: /notch|peak lapel|lapel/, text: 'A notch lapel is the everyday classic. A peak lapel points upward and looks more formal. Peak lapels need a structured shoulder.' },
    { rx: /natural shoulder|structured shoulder|shoulder/, text: 'A natural shoulder is soft and follows your own line. A structured shoulder has more padding and a sharper outline.' },
    { rx: /pocket|jetted|flap|patch/, text: 'Jetted pockets are slim and sleek, flap pockets are the classic business look, patch pockets are the most relaxed.' },
    { rx: /havana/, text: 'Havana has natural shoulders, a notch lapel and jetted pockets. Softer and closer, easy to wear.' },
    { rx: /milano/, text: 'Milano has structured shoulders, a wide notch lapel and large flap pockets. More shape through the shoulder, a sharper outline.' },
    { rx: /alter|tailor|adjust/, text: 'After your suit arrives, in-store tailors make the final adjustments. That usually takes 30 minutes to 3 days.' },
    { rx: /deliver|how long|when will|ship|pick.?up/, text: 'Your suit is ready in about 2 to 3 weeks. Delivery is free, or you can pick it up in store.' },
    { rx: /return|refund|not right|send back/, text: 'You can return it within 30 days of delivery, as long as it is unworn and unaltered.' },
    { rx: /passport/, text: 'The Size Passport keeps your saved size so you do not start from zero next time. Here it is saved on this device only.' },
    { rx: /measure|tape|chest|waist/, text: 'Measure your chest around the fullest part, under your arms. Your jacket size is about half of that in cm. The Fit step has a short guide.' }
  ];
  function kb(text) {
    var t = String(text || '').toLowerCase();
    if (!/(what|why|how|mean|explain|difference|is|are|does|tell)/.test(t)) return null;
    for (var i = 0; i < KB.length; i++) if (KB[i].rx.test(t)) return KB[i].text;
    return null;
  }

  /* optional hosted Claude (see worker/claude-proxy.js). Resolves to { reply, r } or null */
  function remote(message, context) {
    var url = window.CM_AI_ENDPOINT;
    if (!url) return Promise.resolve(null);
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 9000);
    return fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: String(message).slice(0, 400), context: context || {} }), signal: ctl ? ctl.signal : undefined })
      .then(function (res) { if (!res.ok) throw new Error('bad status'); return res.json(); })
      .then(function (o) {
        clearTimeout(timer);
        var b = o.brief || {}, okHex = /^#[0-9a-f]{6}$/i.test(b.colour_hex || '');
        return {
          reply: typeof o.reply === 'string' ? o.reply.slice(0, 600) : '',
          r: {
            occ: ['int', 'off', 'wed', 'eve', 'trv'].indexOf(b.occasion) > -1 ? b.occasion : null,
            season: b.season === 'summer' || b.season === 'winter' ? b.season : null,
            colour: okHex ? b.colour_hex.toLowerCase() : null, colourName: b.colour_name || null,
            h: b.height_cm >= 140 && b.height_cm <= 220 ? Math.round(b.height_cm) : null,
            w: b.weight_kg >= 40 && b.weight_kg <= 160 ? Math.round(b.weight_kg) : null,
            usual: b.usual_size >= 44 && b.usual_size <= 58 ? Math.round(b.usual_size / 2) * 2 : null,
            pref: ['Slim', 'Regular', 'Relaxed'].indexOf(b.fit) > -1 ? b.fit : null,
            budget: b.budget_eur > 300 ? +b.budget_eur : null,
            weaves: Array.isArray(b.keywords) ? b.keywords.filter(function (k) { return typeof k === 'string'; }) : [],
            via: 'claude'
          }
        };
      })
      .catch(function () { clearTimeout(timer); return null; });
  }

  return { parse: parse, summary: summary, kb: kb, remote: remote };
})();
