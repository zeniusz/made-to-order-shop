/* Stylist engine: ranks whole looks (photo + cloth + accessory colours) from a brief and an optional inspiration photo.
   Adapted from the standalone AI Stylist package. No DOM here; app.js shows the results.
   Local mode runs in the browser. If window.CUSTOM_STYLIST_AI_ENDPOINT is set, a protected proxy can rank the same catalogue with Claude. */
window.StyleEngine = (function () {
  var LOOKS = {
    wed: { title: 'Wedding linen', colour: '#b9a68a', season: 'summer', summary: 'Light, refined tailoring for a ceremony or a wedding guest.', tags: ['wedding', 'summer', 'linen', 'celebration', 'guest', 'groom'] },
    off: { title: 'Modern grey check', colour: '#6f737a', season: 'all', summary: 'A confident checked suit for work, meetings and polished everyday wear.', tags: ['business', 'office', 'work', 'meeting', 'check'] },
    cas: { title: 'Soft blue smart casual', colour: '#3f6ea8', season: 'all', summary: 'Relaxed tailoring with an open-collar knit and lighter trousers.', tags: ['casual', 'smart casual', 'date', 'brunch', 'no tie', 'weekend'] },
    res: { title: 'Taupe summer resort', colour: '#9b8262', season: 'summer', summary: 'Breathable-looking neutral tailoring for warm days and destination events.', tags: ['summer', 'resort', 'holiday', 'beach', 'linen', 'destination'] },
    eve: { title: 'Black tie evening', colour: '#121316', season: 'all', summary: 'A clean tuxedo silhouette for black-tie events and formal evenings.', tags: ['formal', 'black tie', 'gala', 'evening', 'tuxedo', 'prom'] },
    int: { title: 'Navy interview suit', colour: '#1d2a44', season: 'all', summary: 'An understated navy suit with a crisp shirt for interviews and first impressions.', tags: ['interview', 'job', 'graduate', 'business', 'professional'] },
    trv: { title: 'Blue-grey travel suit', colour: '#42536b', season: 'all', summary: 'Soft, versatile tailoring that works with a knit and clean sneakers.', tags: ['travel', 'weekend', 'commute', 'flight', 'comfort', 'wrinkle'] },
    sig: { title: 'Forest statement suit', colour: '#2c4538', season: 'all', summary: 'A rich green double-breasted look for someone who wants more character.', tags: ['statement', 'bold', 'green', 'double breasted', 'party', 'individual'] }
  };
  var CLOTH_TAGS = {
    n110: ['business', 'interview', 'travel', 'formal'], dbtro: ['summer', 'travel', 'wedding', 'resort'], nher: ['business', 'smart casual', 'wedding'],
    mgfl: ['business', 'interview', 'winter'], b110: ['formal', 'evening', 'black tie'], dgfl: ['statement', 'winter', 'evening'], burfl: ['statement', 'evening', 'winter'],
    sand: ['wedding', 'summer', 'resort', 'smart casual'], lgwc: ['wedding', 'business', 'interview'], mb110: ['smart casual', 'wedding', 'business'], mbchk: ['business', 'smart casual'],
    dgstr: ['business', 'interview', 'formal'], n150: ['wedding', 'formal', 'evening'], db180: ['formal', 'wedding', 'statement'], nwf: ['travel', 'business', 'commute'], dgwc: ['statement', 'formal', 'winter']
  };
  /* accessory colours per look (colours that have photos in the catalogue) */
  var ACCESSORIES = {
    eve: { shirt: '#f3f3ef', tie: '#6b1d2b', square: '#f6f6f3', shoes: '#121212' },
    wed: { shirt: '#f3f3ef', tie: '#6b1d2b', square: '#f6f6f3', shoes: '#4a2c1d' },
    res: { shirt: '#f3f3ef', tie: '#7e93b5', square: '#f6f6f3', shoes: '#4a2c1d' },
    cas: { shirt: '#c9dcef', tie: '#1f2d4d', square: '#f6f6f3', shoes: '#4a2c1d' },
    trv: { shirt: '#c9dcef', tie: '#1f2d4d', square: '#f6f6f3', shoes: '#4a2c1d' },
    off: { shirt: '#f3f3ef', tie: '#6b1d2b', square: '#f6f6f3', shoes: '#121212' },
    int: { shirt: '#f3f3ef', tie: '#6b1d2b', square: '#f6f6f3', shoes: '#121212' },
    sig: { shirt: '#f3f3ef', tie: '#6b1d2b', square: '#f6f6f3', shoes: '#4a2c1d' }
  };

  var SHADES = {
    dark: { wed: '#1d2a44', res: '#42536b', cas: '#1d2a44', off: '#3a3d43', int: '#18233a', trv: '#1d2a44', eve: '#121316', sig: '#2c4538' },
    light: { wed: '#b9a68a', res: '#b9a68a', cas: '#7e9fc4', off: '#aeb1b5', int: '#6f737a', trv: '#aeb1b5', eve: '#6f737a', sig: '#6f737a' }
  };
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function hexOf(a) { return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  /* weighted RGB distance, tuned for dark and neutral tailoring shades */
  function dist(a, b) {
    var x = rgb(a), y = rgb(b), rm = (x[0] + y[0]) / 2, dr = x[0] - y[0], dg = x[1] - y[1], db = x[2] - y[2];
    return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
  }
  function luminance(h) {
    var v = rgb(h).map(function (n) { n /= 255; return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  var NAMES = [['Navy', '#1d2a44'], ['Midnight blue', '#18233a'], ['Black', '#121316'], ['Charcoal', '#3a3d43'], ['Grey', '#6f737a'], ['Light grey', '#aeb1b5'], ['Sand', '#b9a68a'], ['Taupe', '#9b8262'], ['Blue', '#3f6ea8'], ['Blue-grey', '#42536b'], ['Forest green', '#2c4538'], ['Burgundy', '#5a2030'], ['Cream', '#e8ddc8']];
  function closestName(h) { return NAMES.slice().sort(function (a, b) { return dist(h, a[1]) - dist(h, b[1]); })[0][0]; }
  function title(s) { return String(s || '').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); }); }

  /* ---- photo ---- */
  function checkFile(file) {
    if (!file) return 'Choose an image first.';
    if (!/^image\/(jpeg|png|webp|avif)$/i.test(file.type || '')) return 'Choose a JPG, PNG, WebP or AVIF image.';
    if (file.size > 10 * 1024 * 1024) return 'That image is larger than 10 MB. Choose a smaller file.';
    return '';
  }
  /* dominant cloth colour and a small palette from the central garment area, ignoring studio white and deep shadow */
  function palette(img) {
    var c = document.createElement('canvas'), size = 72;
    c.width = c.height = size;
    var x = c.getContext('2d', { willReadFrequently: true });
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, side = Math.min(iw, ih) * 0.68, cy = ih > iw * 1.2 ? ih * 0.34 : ih * 0.5;
    x.drawImage(img, (iw - side) / 2, Math.max(0, Math.min(ih - side, cy - side / 2)), side, side, 0, 0, size, size);
    var d = x.getImageData(0, 0, size, size).data, bins = {}, fb = [0, 0, 0], n = 0, i;
    for (i = 0; i < d.length; i += 4) {
      var r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255, sat = mx ? (mx - mn) / mx : 0;
      fb[0] += r; fb[1] += g; fb[2] += b; n++;
      if ((sat < 0.13 && lum > 0.63) || lum > 0.97 || lum < 0.035) continue;
      var px = (i / 4) % size - size / 2, k = [r, g, b].map(function (v) { return Math.min(15, Math.round(v / 17)); }).join(','), w = (1 + sat * 2.2 + (lum < 0.55 ? 0.25 : 0)) * Math.exp(-(px * px) / (2 * size * size * 0.025));
      var e = bins[k] || (bins[k] = { w: 0, r: 0, g: 0, b: 0 });
      e.w += w; e.r += r * w; e.g += g * w; e.b += b * w;
    }
    var list = Object.keys(bins).map(function (k) { return bins[k]; }).sort(function (a, b) { return b.w - a.w; });
    var dominant = list.length ? hexOf([list[0].r / list[0].w, list[0].g / list[0].w, list[0].b / list[0].w]) : hexOf(fb.map(function (v) { return v / Math.max(1, n); }));
    var pal = [];
    list.forEach(function (e2) { var h = hexOf([e2.r / e2.w, e2.g / e2.w, e2.b / e2.w]); if (pal.length < 4 && pal.every(function (p) { return dist(p, h) > 42; })) pal.push(h); });
    if (!pal.length) pal.push(dominant);
    return { dominant: dominant, palette: pal };
  }
  /* a smaller copy for the optional AI call */
  function compress(img) {
    return new Promise(function (resolve, reject) {
      try {
        var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, sc = Math.min(1, 1280 / Math.max(iw, ih));
        var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(iw * sc)); c.height = Math.max(1, Math.round(ih * sc));
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        var url = c.toDataURL('image/jpeg', 0.82); resolve({ mimeType: 'image/jpeg', data: url.slice(url.indexOf(',') + 1) });
      } catch (e) { reject(e); }
    });
  }

  /* ---- ranking ---- */
  function bestCloth(target, ctx, used, cloths, price) {
    var t = String(ctx.message || '').toLowerCase();
    var texture = /texture|herringbone|check|pattern|flannel|stripe|woven/.test(t), linen = /linen|summer|breathable|warm weather|resort/.test(t) || ctx.season === 'summer', travel = /travel|commute|wrinkle/.test(t);
    var pool = ctx.budget ? cloths.filter(function (c) { return price(c) <= ctx.budget; }) : cloths;
    if (!pool.length) pool = cloths;
    var occ = LOOKS[ctx.occasion];
    return pool.map(function (c) {
      var s = dist(target, c.c);
      if (ctx.season && ctx.season !== 'any' && c.season !== 'all' && c.season !== ctx.season) s += 30;
      if (texture && c.weave !== 'plain') s -= 24;
      if (!texture && c.weave !== 'plain') s += 4;
      if (linen && c.season === 'summer') s -= 12;
      if (travel && c.id === 'nwf') s -= 18;
      if (occ && (CLOTH_TAGS[c.id] || []).some(function (tag) { return occ.tags.indexOf(tag) > -1; })) s -= 7;
      if (used.indexOf(c.id) > -1) s += 35;
      return { c: c, s: s };
    }).sort(function (a, b) { return a.s - b.s; })[0].c;
  }
  /* ctx: { occasion, occasionExplicit, season, budget, colour, colourName, sampled, message, darker, lighter, relaxed } */
  function recommend(ctx, cloths, price) {
    var t = String(ctx.message || '').toLowerCase(), target = ctx.colour || '#1d2a44', ids = Object.keys(LOOKS);
    var casual = ctx.relaxed || /casual|relaxed|less formal|no tie/.test(t);
    var scored = ids.map(function (id) {
      var look = LOOKS[id], s = ctx.colourExplicit ? Math.min(dist(target, look.colour) * 0.24, ctx.occasionExplicit ? 20 : 60) : 0;
      if (id === ctx.occasion) s -= ctx.occasionExplicit ? 30 : 10;
      if (look.tags.some(function (tag) { return t.indexOf(tag) > -1; })) s -= 6;
      if (ctx.season && ctx.season !== 'any' && look.season !== 'all' && look.season !== ctx.season) s += 10;
      if (ctx.darker && luminance(look.colour) > 0.18) s += 17;
      if (ctx.lighter && luminance(look.colour) < 0.26) s += 17;
      if (casual && (id === 'cas' || id === 'res' || id === 'trv')) s -= 9;
      return { id: id, s: s };
    }).sort(function (a, b) { return a.s - b.s; });
    var out = [];
    scored.slice(0, 3).forEach(function (e) {
      var look = LOOKS[e.id], base = e.id === ctx.occasion && ctx.colour ? target : look.colour;
      var cloth = bestCloth(base, ctx, out.map(function (r) { return r.cloth_id; }), cloths, price), why = [];
      why.push(e.id === ctx.occasion ? 'made for ' + look.title.toLowerCase().replace(/ (suit|linen|evening|check)$/, '') : 'a strong alternative');
      if (ctx.sampled) why.push('echoes the colour in your photo');
      else if (ctx.colourName) why.push('keeps your ' + ctx.colourName.toLowerCase() + ' direction');
      if (ctx.season === 'summer' || look.season === 'summer') why.push('works for warmer weather');
      if (casual) why.push('more relaxed');
      out.push({ look_id: e.id, cloth_id: cloth.id, reason: title(why.slice(0, 2).join(' · ')), score: e.s });
    });
    return out;
  }
  function describe(ctx, recs, cloths, price, hasPhoto, money) {
    var look = LOOKS[recs[0].look_id], cloth = cloths.filter(function (c) { return c.id === recs[0].cloth_id; })[0];
    var s = hasPhoto && ctx.sampled ? 'From your photo I took ' + closestName(ctx.sampled).toLowerCase() + ' as the main colour. ' : '';
    s += 'I would start with ' + look.title.toLowerCase() + ' in ' + cloth.name + ', ' + money(price(cloth)) + '.';
    if (ctx.budget) s += ' Everything is within ' + money(ctx.budget) + '.';
    return s;
  }

  /* ---- optional protected AI (Claude vision through a proxy; the key never reaches the page) ---- */
  function safeRemote(payload, cloths) {
    if (!payload || typeof payload !== 'object') return null;
    var seen = {}, recs = [];
    (Array.isArray(payload.recommendations) ? payload.recommendations : []).forEach(function (r) {
      if (!r || !LOOKS[r.look_id] || seen[r.look_id] || !cloths.some(function (c) { return c.id === r.fabric_id; }) || recs.length >= 3) return;
      seen[r.look_id] = 1;
      recs.push({ look_id: r.look_id, cloth_id: r.fabric_id, reason: typeof r.reason === 'string' ? r.reason.slice(0, 220) : 'Suggested from your brief.' });
    });
    return recs.length ? { reply: typeof payload.reply === 'string' ? payload.reply.slice(0, 1600) : '', recommendations: recs } : null;
  }
  function callAI(message, context, image, history, cloths) {
    var endpoint = String(window.CUSTOM_STYLIST_AI_ENDPOINT || '').trim();
    if (!endpoint) return Promise.resolve(null);
    var ctl = new AbortController(), timer = setTimeout(function () { ctl.abort(); }, 25000);
    return fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: String(message || '').slice(0, 1000), context: context, history: history || [], image: image || null }), signal: ctl.signal })
      .then(function (r) { if (!r.ok) throw new Error('status ' + r.status); return r.json(); })
      .then(function (j) { clearTimeout(timer); return safeRemote(j, cloths); })
      .catch(function () { clearTimeout(timer); return null; });
  }
  function catalogForAI() {
    return { looks: Object.keys(LOOKS).map(function (id) { var l = LOOKS[id]; return { id: id, title: l.title, colour: l.colour, summary: l.summary, tags: l.tags }; }) };
  }

  return { SHADES: SHADES, LOOKS: LOOKS, ACCESSORIES: ACCESSORIES, CLOTH_TAGS: CLOTH_TAGS, dist: dist, closestName: closestName, checkFile: checkFile, palette: palette, compress: compress, recommend: recommend, describe: describe, callAI: callAI, catalogForAI: catalogForAI, luminance: luminance };
})();
