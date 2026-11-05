
(function () {
  var D = window.CM;
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* ---------- colour maths ---------- */
  function rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function lab(c) {
    var l = c.map(function (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    var x = (l[0] * 0.4124 + l[1] * 0.3576 + l[2] * 0.1805) / 0.95047, y = l[0] * 0.2126 + l[1] * 0.7152 + l[2] * 0.0722, z = (l[0] * 0.0193 + l[1] * 0.1192 + l[2] * 0.9505) / 1.08883;
    var f = function (t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; };
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  }
  function dE(a, b) { var p = lab(rgb(a)), q = lab(rgb(b)); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); }
  function hue(h) {
    var c = rgb(h).map(function (v) { return v / 255; }), mx = Math.max.apply(0, c), mn = Math.min.apply(0, c), d = mx - mn;
    if (!d) return 0;
    var hh = mx === c[0] ? ((c[1] - c[2]) / d) % 6 : mx === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4;
    return (hh * 60 + 360) % 360;
  }
  function toHex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }

  /* ---------- state ---------- */
  var st = {
    tab: 0, seen: { 0: true }, view: 'full', occ: 'wed', design: null, shoe: null, target: '#b9a68a', cloth: 'sand', all: false,
    style: { shoulder: 'natural', lapel: 'notch', closure: 'sb2', pockets: 'flap', canvas: 'half', button: 'horn' },
    lining: '#1f2d4d', mono: '',
    h: 180, w: 78, pref: 'Regular', usual: 50, notSure: false, size: null, group: 'regular', level: null, sug: null, fitMode: 'a', mode: 'client', finalSize: null, notes: '', book: false, walk: false, adj: { sleeve: 0, jlen: 0, waist: 0, tlen: 0, rise: 0 },
    self: null, pants: null, finalPants: null, why: [], city: 'Amsterdam', slot: null,
    on: {}, col: {}, name: '', email: '', phone: '', cpref: 'Email', code: null, season: null, budget: null, boost: [], change: '', chest: null, chat: []
  };
  var initialFitting = JSON.stringify(st);
  var byId = function (id) { return D.cloths.filter(function (c) { return c.id === id; })[0]; };
  var cloth = function () { return byId(st.cloth); };
  /* euro price for a made-to-measure suit: three anchor cloths (entry, standard, finest), interpolated between them */
  var EUR_PTS = [[673, 795], [823, 945], [1523, 1795]];
  var eur = function (usd) {
    var p = EUR_PTS, a = usd <= p[1][0] ? p[0] : p[1], b = usd <= p[1][0] ? p[1] : p[2];
    return Math.round((a[1] + (usd - a[0]) * (b[1] - a[1]) / (b[0] - a[0])) / 5) * 5;
  };
  var money = function (n) { return '€' + n.toLocaleString('nl-NL'); };
  var cname = function (h) { return D.colourNames[h] || h.toUpperCase(); };

  /* ---------- swatches: real wool photo, tinted ---------- */
  function swatch(c, size) {
    /* Every real catalog cloth has its own texture/color-mapped photographic swatch.
       No complete outfit photograph is recoloured. */
    var id = c && c.id ? c.id : 'n110';
    if (c && c.lib) return 'background-color:' + c.c + ';background-image:url(assets/img/library/' + (size > 300 ? 'textures' : 'swatches') + '/' + c.lib + '.jpg);background-position:center;background-size:cover;background-repeat:no-repeat';
    return 'background-color:' + (c.c || '#1d2a44') + ';background-image:url(assets/img/textures/swatches/' + id + '.jpg);background-position:center;background-size:cover;background-repeat:no-repeat';
  }
  function itemSwatch(kind, hex) {
    if (kind === 'vest' || kind === 'trs2') return swatch(cloth(), 120);
    var texture = kind === 'tie' ? 'assets/img/textures/macro/plain-macro.jpg' :
                  kind === 'square' || kind === 'shirt' ? 'assets/img/textures/macro/linen-macro.jpg' :
                  kind === 'shoes' ? 'assets/img/textures/macro/flannel-macro.jpg' : 'assets/img/textures/macro/plain-macro.jpg';
    return 'background-color:' + (hex || '#999') + ';background-image:url(' + texture + ');background-blend-mode:soft-light;background-position:center;background-size:cover';
  }

  /* ---------- outfit matching: classic pairings by cloth family ---------- */
  function recs() {
    var sc = cloth().c, sh = hue(sc), lb = lab(rgb(sc)), sl = lb[0], chroma = Math.hypot(lb[1], lb[2]);
    var ties;
    if (chroma < 12 || (sh >= 190 && sh <= 260)) ties = ['#6b1d2b', '#7e93b5', '#24473a'];
    else if (sh >= 80 && sh < 190) ties = ['#1f2d4d', '#6b1d2b', '#b88a1e'];
    else if (sh >= 20 && sh < 80) ties = ['#1f2d4d', '#24473a', '#9a4a2a'];
    else ties = ['#1f2d4d', '#34373d', '#7e93b5'];
    return {
      shirt: sl > 60 ? ['#f3f3ef', '#c9dcef', '#f2e6e4'] : ['#f3f3ef', '#c9dcef', '#dfe2e6'],
      tie: ties,
      square: ['#f6f6f3', '#6b1d2b', '#c9dcef'],
      shoes: sl > 55 ? ['#9a6a3c', '#4a2c1d', '#121212'] : sl > 32 ? ['#4a2c1d', '#121212', '#9a6a3c'] : ['#121212', '#4a2c1d', '#9a6a3c']
    };
  }
  function resetOutfit() { st.shoe = (curDesign() && curDesign().shoes) || null; var r = recs(); ['shirt', 'tie', 'square', 'shoes'].forEach(function (k) { st.col[k] = r[k][0]; }); }

  var KEY_TEST = {
    flannel: function (c) { return c.weave === 'flannel'; }, herring: function (c) { return c.weave === 'herring'; },
    check: function (c) { return c.weave === 'check'; }, stripe: function (c) { return c.weave === 'stripe'; },
    tropical: function (c) { return /Tropical/i.test(c.name); }, cashmere: function (c) { return /Cashmere/i.test(c.name); },
    wrinkle: function (c) { return /Wrinkle/i.test(c.name); }
  };
  function ranked(target, occ) {
    target = target || st.target; occ = occ || st.occ;
    var rows = D.cloths.map(function (c) {
      var d = dE(target, c.c), boost = 0;
      (st.boost || []).forEach(function (k) { if (KEY_TEST[k] && KEY_TEST[k](c)) boost += 6; });
      return { c: c, d: d, pct: Math.max(0, Math.round(100 - d * 1.6)), occ: c.occ.indexOf(occ) > -1, boost: boost };
    });
    var kept = rows.filter(function (r) {
      if (st.season && r.c.season !== 'all' && r.c.season !== st.season) return false;
      if (st.budget && eur(r.c.usd) > st.budget) return false;
      return true;
    });
    if (kept.length) rows = kept;
    return rows.sort(function (a, b) { return (a.d - (a.occ ? 4 : 0) - a.boost) - (b.d - (b.occ ? 4 : 0) - b.boost); });
  }

  /* ---------- style rules (combinations the workroom won't make) ---------- */
  function blocked(key, val) {
    var s = st.style;
    if (key === 'lapel' && val === 'peak' && s.shoulder === 'natural') return 'Peak lapels need a structured shoulder.';
    if (key === 'lapel' && val === 'peak' && s.pockets === 'patch') return 'Peak lapels don’t go with patch pockets.';
    if (key === 'shoulder' && val === 'natural' && s.lapel === 'peak') return 'Peak lapels need a structured shoulder.';
    if (key === 'pockets' && val === 'patch' && s.lapel === 'peak') return 'Peak lapels don’t go with patch pockets.';
    return '';
  }

  /* ---------- fit: Find my size ---------- */
  var PREFS = ['Slim', 'Regular', 'Relaxed'];
  var cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
  function groupFor(h) { return h < 168 ? 'short' : h > 186 ? 'long' : 'regular'; }
  /* Regular numbers 40-58, Long 90-114 (about double), Short 22-29 (about half), as on the live size grid */
  function sizeLabel(reg, g) {
    if (g === 'long') return String(Math.max(90, Math.min(114, reg * 2)));
    if (g === 'short') return String(Math.max(22, Math.min(29, Math.round(reg / 2))));
    return String(reg);
  }
  function sizeText() { return st.size ? sizeLabel(st.size, st.group) + ' ' + cap(st.group) : ''; }
  /* pants: waist estimated from the chest measurement if given, else from height and weight; EU size = half the waist in cm */
  function pantsSuggest() {
    var bmi = st.w / Math.pow(st.h / 100, 2), waist = st.chest ? st.chest - 8 : 2.35 * bmi + 28;
    return Math.max(38, Math.min(58, Math.round(waist / 4) * 2));
  }
  function pantsSize() { return st.pants || pantsSuggest(); }
  var evenSize = function (v) { return Math.max(44, Math.min(58, Math.round(v / 2) * 2)); };
  function bodyRaw() { return 7.2 + 0.286 * st.w + 0.114 * st.h + ({ Slim: -1, Regular: 0, Relaxed: 1 }[st.pref] || 0); }
  function nearBoundary() { return Math.abs(st.h - 168) <= 2 || Math.abs(st.h - 186) <= 2; }

  /* One suggested size, a High / Medium / Low label and a plain reason */
  function suggest() {
    var g = groupFor(st.h), reasons = [], size, level, shift = st.pref === 'Relaxed' ? 2 : 0;
    if (st.notSure && st.chest) {
      size = evenSize(st.chest / 2 + shift); level = 'High';
      reasons.push('your chest measurement (' + st.chest + ' cm)', 'your height (' + st.h + ' cm)');
    } else if (st.usual && !st.notSure) {
      size = evenSize(st.usual + shift); level = 'High';
      reasons.push('your height (' + st.h + ' cm)', 'your usual size ' + st.usual);
    } else {
      var raw = bodyRaw(), bmi = st.w / Math.pow(st.h / 100, 2);
      size = evenSize(raw); level = 'Medium';
      reasons.push('your height (' + st.h + ' cm) and weight (' + st.w + ' kg)');
      if (Math.abs(raw - size) > 0.7) { level = 'Low'; reasons.push('you fall between two sizes'); }
      if (bmi < 18.5 || bmi > 31) { level = 'Low'; reasons.push('your build is outside the usual range'); }
    }
    if (nearBoundary()) {
      level = level === 'High' ? 'Medium' : 'Low';
      reasons.push('you are close to the ' + (Math.abs(st.h - 168) <= 2 ? '168' : '186') + ' cm length line');
    }
    var text = level === 'Low'
      ? 'We are not sure: ' + reasons.join(', and ') + '.'
      : 'Based on ' + reasons.join(' and ') + ', and a ' + st.pref.toLowerCase() + ' fit.';
    return { size: size, group: g, level: level, text: text };
  }
  var LEVEL_BASE = { High: 75, Medium: 55, Low: 30 };
  function adjCount() { var n = 0; for (var k in st.adj) if (st.adj[k]) n++; return n; }
  function confidence() {
    if (!st.size) return 0;
    var s = LEVEL_BASE[st.level || 'Medium'];
    if (adjCount()) s += 10;
    if (st.self) s += 5;
    if (st.slot) s += 25; else if (st.walk) s += 15;
    return Math.min(100, s);
  }
  var confLabel = function (n) { return n >= 75 ? 'High' : n >= 50 ? 'Medium' : 'Low'; };
  var SLOT_DATE = {}, SLOT_BOOKED = {}, SLOT_WHO = {};
  var SAMPLE_NAMES = ['J. de Vries', 'M. Bakker', 'S. Jansen', 'L. Visser', 'R. Smit', 'N. Dekker'];
  var SLOTS = (function () {
    var out = [], d = new Date(), days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var times = [['10:30', '16:00'], ['12:00', '17:30'], ['11:00', '14:30']];
    for (var i = 1, n = 0; n < 3; i++) {
      var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      if (x.getDay() === 0) continue;
      times[n].forEach(function (t) { var lab = days[x.getDay()] + ' ' + x.getDate() + ' ' + mon[x.getMonth()] + ', ' + t, hm = t.split(':'); out.push(lab); var hsh = 0; for (var q = 0; q < lab.length; q++) hsh = (hsh * 31 + lab.charCodeAt(q)) % 997; if (hsh % 3 === 0) { SLOT_BOOKED[lab] = true; SLOT_WHO[lab] = SAMPLE_NAMES[hsh % SAMPLE_NAMES.length]; } SLOT_DATE[lab] = new Date(x.getFullYear(), x.getMonth(), x.getDate(), +hm[0], +hm[1]); });
      n++;
    }
    return out;
  })();

  /* ---------- price ---------- */
  function lines() {
    var c = cloth(), out = [['Suit, ' + c.name, eur(c.usd)]];
    if (st.style.canvas === 'full') out.push(['Full canvas', 150]);
    if (st.style.button === 'mop') out.push(['Mother-of-pearl buttons', 25]);
    if (st.mono.trim()) out.push(['Monogram ' + st.mono.toUpperCase(), 15]);
    D.extras.forEach(function (x) { if (st.on[x.id]) out.push([x.id === 'shoes' ? shoeSel().name : x.name + (st.col[x.id] ? ', ' + cname(st.col[x.id]).toLowerCase() : ''), extraPrice(x)]); });
    return out;
  }
  function total() { return lines().reduce(function (s, l) { return s + l[1]; }, 0); }
  function look() { var c = cloth(); return { cloth: c.c, weave: c.weave, shirt: st.col.shirt, tie: st.col.tie, square: st.col.square }; }

  /* ---------- builders ---------- */
  function chip(label, pressed, onclick, why) {
    var b = el('button', 'chip'); b.type = 'button'; b.innerHTML = label; b.setAttribute('aria-pressed', String(!!pressed));
    if (why) { b.disabled = true; b.title = why; }
    b.onclick = onclick; return b;
  }
  function dot(hex, pressed, label, onclick, small) {
    var b = el('button', 'dot' + (small ? ' sm' : '')); b.type = 'button'; b.style.background = hex;
    b.setAttribute('aria-pressed', String(!!pressed)); b.setAttribute('aria-label', label); b.title = label;
    b.onclick = function (e) { e.stopPropagation(); onclick(); }; return b;
  }
  function fill(id, nodes) { var p = $(id); p.innerHTML = ''; nodes.forEach(function (n) { p.appendChild(n); }); }

  /* ---------- cloth ---------- */
  function renderCloth() {
    fill('occ', D.occasions.map(function (o) {
      var b = el('button', 'look-card'); b.type = 'button';
      b.setAttribute('aria-pressed', String(st.occ === o.id));
      b.setAttribute('aria-label', o.label + ': ' + o.desc);
      b.innerHTML = '<span class="look-photo"><img loading="lazy" src="assets/img/catalog/' + o.image + '" alt="" /></span>' +
        '<span class="look-copy"><b>' + o.label + '</b><span>' + o.desc + '</span></span>';
      b.onclick = function () { applyOccasion(o.id); };
      return b;
    }));
    renderDesigns();
    fill('dots', D.quickColours.map(function (q) { return dot(q, st.target === q, 'Colour ' + q, function () { setTarget(q); }); }));
    $('cp').value = st.target;
    if (document.activeElement !== $('hex')) $('hex').value = st.target.toUpperCase();
    var r = ranked(), list = st.all ? r : r.slice(0, 4);
    $('matchHead').textContent = st.all ? 'All cloths' : 'Best matches';
    $('more').textContent = st.all ? 'Show fewer' : 'See all ' + r.length;
    fill('cloths', list.map(function (x, i) {
      var b = el('button', 'card'); b.type = 'button'; b.setAttribute('aria-pressed', String(x.c.id === st.cloth));
      b.innerHTML = '<span class="img"><span class="sw" style="' + swatch(x.c, 130) + '"></span>' +
        (i === 0 && !st.all ? '<span class="badge">Best match</span>' : '') + '<span class="pct">' + x.pct + '%</span></span>' +
        '<span class="nm">' + x.c.name + '</span><span class="sub">' + x.c.wear + '</span><span class="pc">' + money(eur(x.c.usd)) + '</span>';
      b.onclick = function () { st.cloth = x.c.id; st.view = 'full'; resetOutfit(); update(); };
      return b;
    }));
  }
  function occDesigns() { return D.designs.filter(function (d) { return d.occ === st.occ; }); }
  function curDesign() {
    var l = occDesigns();
    return l.filter(function (d) { return d.id === st.design; })[0] || l[0] || null;
  }
  function designColour(d) { var c = d.cloth && byId(d.cloth); return c ? c.c : (D.occasions.filter(function (o) { return o.id === d.occ; })[0] || {}).c || '#808080'; }
  function bestDesign(occId, hex) {
    var l = D.designs.filter(function (d) { return d.occ === occId; }), best = null, bd = 1e9;
    l.forEach(function (d) { var x = StyleEngine.dist(hex, designColour(d)); if (x < bd) { bd = x; best = d; } });
    return best;
  }
  /* a photo of this design in the chosen cloth (and tie, when one is added), if the library has one */
  function designVariant(d) {
    return (d.variants || []).filter(function (v) { return v.cloth === st.cloth && (!v.tie || (st.on.tie && st.col.tie === v.tie)) && (!v.shoe || (st.on.shoes && shoeSel().id === v.shoe)) && !!v.noShoes === !!st.noShoes; })[0] || null;
  }
  /* when the chosen cloth is not the design's own colour, show the classic suit photographed in that cloth (if the library has one) */
  function clothPhoto(d) {
    var c = cloth(), p = D.clothPhotos && D.clothPhotos[c.id];
    if (!p || !d || d.cloth === c.id || StyleEngine.dist(c.c, d.c) < 55) return null;
    return p;
  }
  function lookImage() { var d = curDesign(); if (!d) return 'assets/img/catalog/' + activeLook().image; var v = designVariant(d); return 'assets/img/' + (v ? v.image : (clothPhoto(d) || d.image)); }
  function renderDesigns() {
    var l = occDesigns(), cur = curDesign();
    $('designsBox').hidden = l.length < 2;
    $('designsHead').textContent = l.length > 1 ? 'Designs for ' + activeLook().label.toLowerCase() : 'Designs';
    fill('designs', l.length < 2 ? [] : l.map(function (d) {
      var b = el('button', 'design'); b.type = 'button'; b.setAttribute('aria-pressed', String(cur && cur.id === d.id));
      b.setAttribute('aria-label', d.name + '. ' + d.desc);
      b.innerHTML = '<img loading="lazy" src="assets/img/' + d.image + '" alt=""><b>' + d.name + '</b>';
      b.onclick = function () { pickDesign(d); };
      return b;
    }));
  }
  function pickDesign(d) {
    st.design = d.id; st.view = 'full';
    if (d.cloth && byId(d.cloth)) { st.cloth = d.cloth; st.target = byId(d.cloth).c; clearLook(); }
    else { var o = activeLook(); st.target = o.c; clearLook(); st.cloth = ranked()[0].c.id; }
    resetOutfit(); update();
  }
  function applyOccasion(id) {
    var o = D.occasions.filter(function (x) { return x.id === id; })[0];
    st.occ = id; st.design = null; st.target = o.c; st.view = 'full'; clearLook();
    st.cloth = ranked()[0].c.id; resetOutfit(); update();
  }
  function setTarget(hex) { st.target = hex.toLowerCase(); clearLook(); st.cloth = ranked()[0].c.id; resetOutfit(); update(); }

  /* ---------- style ---------- */
  function renderStyle() {
    var reasons = [];
    fill('presets', D.presets.map(function (p) {
      var on = Object.keys(p.set).every(function (k) { return st.style[k] === p.set[k]; });
      var b = el('button', 'preset'); b.type = 'button'; b.setAttribute('aria-pressed', String(on));
      b.innerHTML = '<span class="preset-photo"><img src="assets/img/catalog/' + p.image + '" alt="' + p.name + ' style reference" loading="lazy"><i>Style reference</i></span><span class="preset-copy"><b>' + p.name + '</b><span>' + p.desc + '</span><em>' + p.who + '</em></span>';
      b.onclick = function () {
        var ch = [];
        for (var k in p.set) if (st.style[k] !== p.set[k]) { var g = D.style.filter(function (x) { return x.key === k; })[0]; ch.push(g.label.toLowerCase() + ' to ' + g.opts.filter(function (o) { return o[0] === p.set[k]; })[0][1].toLowerCase()); }
        for (var k2 in p.set) st.style[k2] = p.set[k2];
        st.change = ch.length ? p.name + ' changed: ' + ch.join(', ') + '.' : '';
        update();
      };
      return b;
    }));
    fill('styleFields', D.style.map(function (f, n) {
      var wrap = el('div', 'field' + (n === 0 ? ' first' : ''));
      wrap.appendChild(el('span', 'flabel', f.label));
      var row = el('div', 'chips');
      f.opts.forEach(function (o) {
        var why = blocked(f.key, o[0]);
        if (why && reasons.indexOf(why) < 0) reasons.push(why);
        row.appendChild(chip(o[1] + (o[2] ? ' <span class="tag">+€' + o[2] + '</span>' : ''), st.style[f.key] === o[0], function () { st.style[f.key] = o[0]; st.change = ''; update(); }, why));
      });
      wrap.appendChild(row);
      return wrap;
    }));
    $('ruleNote').textContent = reasons.join(' ');
    fill('lining', D.linings.map(function (l) { return dot(l[0], st.lining === l[0], l[1] + ' lining', function () { st.lining = l[0]; update(); }); }));
  }

  /* ---------- fit ---------- */
  function renderFit() {
    var m = st.fitMode;
    $('fitA').hidden = m !== 'a'; $('fitB').hidden = m !== 'b'; $('fitC').hidden = m !== 'c'; $('fitD').hidden = m !== 'd';

    /* A: tell us about you */
    var usual = [46, 48, 50, 52, 54, 56].map(function (x) { return chip(String(x), !st.notSure && st.usual === x, function () { st.usual = x; st.notSure = false; update(); }); });
    usual.push(chip('Not sure', st.notSure, function () { st.notSure = true; update(); }));
    fill('usual', usual);
    $('wRow').hidden = !st.notSure;
    $('chestRow').hidden = !st.notSure;
    if (document.activeElement !== $('chest')) $('chest').value = st.chest || '';
    fill('pref', PREFS.map(function (p) { return chip(p, st.pref === p, function () { st.pref = p; update(); }); }));

    /* B: suggestion */
    if (m === 'b' && st.sug) {
      var u = st.sug;
      $('sugSize').innerHTML = sizeLabel(u.size, u.group) + '<small>' + cap(u.group) + '</small>';
      $('sugLevel').textContent = u.level + ' confidence';
      $('sugLevel').className = 'pill ' + u.level.toLowerCase();
      $('sugWhy').textContent = u.text;
      fill('sugAdj', [-2, 2].map(function (d) {
        var n = u.size + d;
        return chip((d < 0 ? 'Smaller: ' : 'Larger: ') + sizeLabel(n, u.group), false, function () { st.sug = { size: n, group: u.group, level: u.level, text: u.text }; update(); });
      }));
      $('fallback').hidden = u.level !== 'Low';
      var use = $('useSize');
      use.textContent = u.level === 'Low' ? 'Use this size anyway' : 'Use size ' + sizeLabel(u.size, u.group) + ' ' + cap(u.group);
      use.className = 'btn full' + (u.level === 'Low' ? ' ghost' : '');
    }

    /* C: grid for people who know their size */
    if (m === 'c') {
      fill('gGroup', ['regular', 'short', 'long'].map(function (g) { return chip(cap(g), st.group === g, function () { st.group = g; update(); }); }));
      fill('gSizes', D.sizes.map(function (x) {
        return chip(sizeLabel(x, st.group), st.size === x, function () { st.size = x; st.level = 'Medium'; st.fitMode = 'd'; update(); });
      }));
    }

    /* D: size chosen */
    if (m === 'd') {
      $('chSize').textContent = sizeText();
      var sc = confidence(), lv = confLabel(sc);
      $('chLevel').textContent = lv;
      $('chPants').textContent = String(pantsSize());
      fill('pantsSizes', D.pantsSizes.map(function (x) { return chip(String(x), pantsSize() === x, function () { st.pants = x; update(); }); }));
      $('pantsNote').textContent = st.pants && st.pants !== pantsSuggest() ? 'Your choice. We suggested ' + pantsSuggest() + '.' : 'Suggested ' + pantsSuggest() + ' from your ' + (st.chest ? 'chest measurement' : 'height and weight') + '. Pick another if you prefer.';
      $('meterI').style.width = sc + '%';
      $('meter').setAttribute('aria-valuenow', sc); $('meter').setAttribute('aria-label', 'Fit confidence ' + lv);
      $('confLabel').textContent = 'Fit confidence: ' + lv;
      $('confTip').textContent = st.slot ? 'Your advisor confirms at the appointment' : st.walk ? 'Bring your code to any store' : 'Book or walk in to raise it';
      $('storeBook').setAttribute('aria-pressed', String(st.book));
      $('storeWalk').setAttribute('aria-pressed', String(st.walk));
      $('bookBox').hidden = !st.book;
      $('cal').hidden = !(st.slot && SLOT_DATE[st.slot]);
      fill('slots', SLOTS.map(function (t) { var b = SLOT_BOOKED[t]; var e = chip(t + (b ? ' · taken' : ''), st.slot === t, function () { st.slot = st.slot === t ? null : t; update(); }, b ? 'This time is already taken' : ''); if (b) e.classList.add('booked'); return e; }));
      if (!$('slotNote')) { var sn = el('p', 'slot-note', 'Sample availability. Crossed-out times are taken.'); sn.id = 'slotNote'; $('slots').parentNode.appendChild(sn); }
    }
  }
  function buildAdjustments(target, agreed, requested) {
    var box = target || $('adjs'); box.innerHTML = '';
    D.adjustments.forEach(function (a) {
      var row = el('div', 'adj');
      row.appendChild(el('span', '', a.label));
      if (requested) { var rq = requested[a.key] || 0; row.appendChild(el('span', 'adj-req', rq ? (rq > 0 ? '+' : '') + rq + ' cm' : '0 cm')); }
      var s = el('div', 'stepper');
      s.innerHTML = '<button type="button" aria-label="Shorter">−</button><label><input type="text" inputmode="decimal" value="0" aria-label="' + a.label + ' in cm"><span>cm</span></label><button type="button" aria-label="Longer">+</button>';
      var inp = s.querySelector('input'), bt = s.querySelectorAll('button');
      var values = agreed || st.adj;
      var cur = values[a.key] || 0; inp.value = cur > 0 ? '+' + cur : String(cur);
      var set = function (v) { v = Math.max(-4, Math.min(4, Math.round(v * 2) / 2)); values[a.key] = v; if (agreed) st.agreed[a.key] = v; inp.value = v > 0 ? '+' + v : String(v); if (!agreed) update(); else if (requested) row.classList.toggle('is-changed', v !== (requested[a.key] || 0)); };
      bt[0].onclick = function () { set(values[a.key] - 0.5); };
      bt[1].onclick = function () { set(values[a.key] + 0.5); };
      inp.onchange = function () { var v = parseFloat(inp.value.replace(',', '.')); set(isNaN(v) ? 0 : v); };
      row.appendChild(s); box.appendChild(row);
      if (requested) row.classList.toggle('is-changed', (values[a.key] || 0) !== (requested[a.key] || 0));
    });
  }

  /* ---------- extras ---------- */
  function shoeSel() {
    var id = st.shoe || (curDesign() && curDesign().shoes) || null;
    return D.shoeStyles.filter(function (s) { return s.id === id; })[0] || D.shoeStyles[0];
  }
  function extraPrice(x) { return x.id === 'shoes' ? shoeSel().price : x.price; }
  function renderExtras() {
    var r = recs();
    fill('extras', D.extras.map(function (x) {
      var on = !!st.on[x.id], card = el('div', 'card extra' + (on ? ' on' : ''));
      var shoeS = x.id === 'shoes' ? shoeSel() : null;
      var selectedImage = x.variants && st.col[x.id] && x.variants[st.col[x.id]] ? x.variants[st.col[x.id]] : x.image;
      var img = el('button', 'img'); img.type = 'button'; img.setAttribute('aria-pressed', String(on)); img.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + x.name);
      img.style.border = '0'; img.style.padding = '0'; img.style.cursor = 'pointer';
      img.innerHTML = '<img class="extra-product-photo" src="' + (shoeS ? 'assets/img/' + shoeS.image : 'assets/img/extras/' + selectedImage) + '" alt="' + x.name + (st.col[x.id] ? ' in ' + cname(st.col[x.id]) : ' product reference') + '" loading="lazy">' + ((x.id === 'vest' || x.id === 'trs2') ? '<span class="cloth-reference-swatch" style="' + swatch(cloth(), 75) + '"></span>' : '') + '<span class="check">' + (on ? '✓' : '+') + '</span>';
      img.onclick = function () { st.on[x.id] = !on; if (x.id === 'shoes' && !on) st.noShoes = false; update(); };
      card.appendChild(img);
      card.appendChild(el('span', 'nm', x.name));
      var detail = shoeS ? shoeS.name + ' · ' + shoeS.material : st.col[x.id] ? cname(st.col[x.id]) + (st.col[x.id] === (r[x.id] || [])[0] ? ' · recommended colour' : '') : (x.detail || 'Pairs with your selected look');
      if (x.id === 'vest' || x.id === 'trs2') detail = (x.detail || 'Style reference') + ' · cut from ' + cloth().name;
      card.appendChild(el('span', 'sub', detail));
      card.appendChild(el('span', 'pc', money(extraPrice(x))));
      if (r[x.id] && x.id !== 'shoes') {
        var o = el('div', 'opts');
        r[x.id].forEach(function (c) { o.appendChild(dot(c, st.col[x.id] === c, x.name + ' in ' + cname(c), function () { st.col[x.id] = c; if (x.id === 'shoes') st.shoe = null; st.on[x.id] = true; update(); }, true)); });
        card.appendChild(o);
      }
      if (x.id === 'shoes') {
        var so = el('div', 'shoe-opts'); so.setAttribute('role', 'group'); so.setAttribute('aria-label', 'Shoe style');
        D.shoeStyles.forEach(function (s) {
          var bt = el('button', 'dot sm shoe-dot'); bt.type = 'button'; bt.title = s.name + ' · ' + money(s.price); bt.setAttribute('aria-label', s.name + ', ' + money(s.price)); bt.setAttribute('aria-pressed', String(!!st.on.shoes && shoeSel().id === s.id));
          bt.innerHTML = '<img loading="lazy" src="assets/img/' + s.image + '" alt="">';
          bt.onclick = function () { st.shoe = s.id; st.on.shoes = true; st.noShoes = false; update(); };
          so.appendChild(bt);
        });
        /* No shoes: the shoes leave the price and, where the library has one, the suit photo switches to a version without shoes */
        var nb = el('button', 'dot sm shoe-dot none'); nb.type = 'button'; nb.title = 'No shoes'; nb.setAttribute('aria-label', 'No shoes');
        nb.setAttribute('aria-pressed', String(!!st.noShoes));
        nb.onclick = function () { st.noShoes = true; st.on.shoes = false; update(); };
        so.appendChild(nb);
        card.appendChild(so);
      }
      return card;
    }));
  }

  /* ---------- stage strip ---------- */
  function renderStrip() {
    var c = cloth(), pieces = [['cloth', 'Cloth', swatch(c, 80), true, 0]];
    [['shirt', 'Shirt'], ['tie', 'Tie'], ['square', 'Square'], ['shoes', 'Shoes']].forEach(function (p) {
      pieces.push([p[0], p[1], itemSwatch(p[0], st.col[p[0]]), !!st.on[p[0]], 3]);
    });
    fill('strip', pieces.map(function (p) {
      var b = el('button', 'piece' + (p[3] ? '' : ' off')); b.type = 'button';
      b.setAttribute('aria-label', p[1] + (p[3] ? '' : ', not added'));
      b.innerHTML = '<span class="sw" style="' + p[2] + '"></span><span class="l">' + p[1] + '</span>';
      b.onclick = function () { showTab(p[4]); };
      return b;
    }));
  }

  /* ---------- review ---------- */
  function styleText() {
    var s = st.style, f = function (k) { var g = D.style.filter(function (x) { return x.key === k; })[0]; return g.opts.filter(function (o) { return o[0] === s[k]; })[0][1]; };
    return f('shoulder') + ' shoulder, ' + f('lapel').toLowerCase() + ' lapel, ' + (s.closure === 'db' ? 'double-breasted' : f('closure').toLowerCase() + ' button' + (s.closure === 'sb2' ? 's' : '')) + ', ' + s.canvas + ' canvas';
  }
  var lastShot = '';
  function renderReview(withShot) {
    var c = cloth();
    if (withShot) { lastShot = lookImage(); }
    var items = [{ img: lastShot ? '<img src="' + lastShot + '" alt="">' : '<span class="sw" style="' + swatch(c, 120) + '"></span>', nm: (st.design && curDesign() && occDesigns().length > 1 ? curDesign().name : activeLook().label) + ' look', sub: c.name + '. ' + styleText(), pc: eur(c.usd) }];
    D.extras.forEach(function (x) {
      if (st.on[x.id]) {
        var itemImage = x.variants && st.col[x.id] && x.variants[st.col[x.id]] ? x.variants[st.col[x.id]] : x.image;
        var shoeR = x.id === 'shoes' ? shoeSel() : null;
        var itemSub = shoeR ? shoeR.name + ' · ' + shoeR.material : st.col[x.id] ? cname(st.col[x.id]) : (x.detail || 'Selected extra');
        if (x.id === 'vest' || x.id === 'trs2') itemSub = (x.detail || 'Style reference') + ' · cut from ' + c.name;
        items.push({ img: '<img class="review-product-photo" src="' + (shoeR ? 'assets/img/' + shoeR.image : 'assets/img/extras/' + itemImage) + '" alt="">', nm: x.name, sub: itemSub, pc: extraPrice(x) });
      }
    });
    if (st.mono.trim()) items.push({ img: '<div class=\"review-monogram\"><span>' + st.mono.toUpperCase() + '</span></div>', nm: 'Embroidered monogram', sub: 'Inside jacket lining · ' + st.mono.toUpperCase(), pc: 15 });
    $('itemCount').textContent = items.length + (items.length === 1 ? ' item' : ' items');
    $('lookGrid').innerHTML = items.map(function (i) {
      return '<div class="card"><span class="img">' + i.img + '</span><span class="nm">' + i.nm + '</span><span class="sub">' + i.sub + '</span><span class="pc">' + money(i.pc) + '</span></div>';
    }).join('');
    $('bill').innerHTML = lines().map(function (l, i) { return '<div><span>' + l[0] + '</span><span class="pr">' + (i ? '+' : '') + money(l[1]) + '</span></div>'; }).join('') +
      '<div class="tot"><span>Total</span><span class="pr">' + money(total()) + '</span></div>';
    $('timeline').innerHTML = [
      ['Fitting', st.slot ? st.slot + ', ' + st.city : st.walk ? 'Visit a store without booking' : 'Book or walk in'],
      ['2–3 weeks', 'Delivered free, or pick up in store'],
      ['Final fitting', 'Tailored in 30 min to 3 days'],
      ['30 days', 'To return if it isn’t right']
    ].map(function (t) { return '<li><b>' + t[0] + '</b> · ' + t[1] + '</li>'; }).join('');
  }

  /* ---------- season, about this cloth, change note ---------- */
  function renderSeason() {
    fill('season', [[null, 'Any season'], ['summer', 'Summer'], ['winter', 'Winter']].map(function (x) {
      return chip(x[1], st.season === x[0], function () { st.season = x[0]; st.cloth = ranked()[0].c.id; st.view = 'full'; resetOutfit(); update(); });
    }));
  }
  function renderAbout() {
    var c = cloth(), terms = D.glossary.filter(function (g) { return g.rx.test(c.name); });
    $('about').innerHTML = '<b>' + c.name + '</b><span>' + c.wear + ' Best in ' + (c.season === 'all' ? 'any season' : c.season) + '.</span>' +
      (terms.length ? '<dl>' + terms.map(function (g) { return '<div><dt>' + g.term + '</dt><dd>' + g.text + '</dd></div>'; }).join('') + '</dl>' : '');
  }
  function renderChange() { $('changeNote').textContent = st.change || ''; }

  /* ---------- Size Passport and resume (this device only) ---------- */
  var KEEP = ['chest', 'occ', 'target', 'cloth', 'season', 'budget', 'boost', 'style', 'lining', 'mono', 'h', 'w', 'pref', 'usual', 'notSure', 'size', 'group', 'level', 'adj', 'book', 'walk', 'slot', 'city', 'on', 'col', 'design', 'shoe', 'noShoes', 'pants'];
  function snap(keys) { var o = {}; keys.forEach(function (k) { o[k] = st[k]; }); return JSON.parse(JSON.stringify(o)); }
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  var PASS = ['chest', 'h', 'w', 'pref', 'usual', 'notSure', 'size', 'group', 'level', 'adj', 'pants'];
  var saveTimer = 0, canSave = false; /* held until we know whether a saved session is waiting */
  function persist() { if (!canSave || st.mode === 'advisor') return; clearTimeout(saveTimer); saveTimer = setTimeout(function () { store('cm-state-v2', snap(KEEP)); }, 400); }
  function renderPassport() {
    var p = load('cm-passport-v2');
    $('ppUse').hidden = !(p && p.size && st.fitMode === 'a');
    if (p && p.size) $('ppText').textContent = 'Your saved sizes: jacket ' + sizeLabel(p.size, p.group) + ' ' + cap(p.group) + (p.pants ? ', pants ' + p.pants : '');
    $('ppSave').checked = !!p;
  }

  /* ---------- advisor mode: the fitting sheet ---------- */
  var FITLOG = 'cm-fitlog-v1';
  var FIT_REV = 'sizing-v2-pants', WHY = ['Shoulders', 'Chest', 'Waist', 'Length', 'Posture', 'Client preference'];
  /* what the advisor saw, in numbers: how often the suggestion held, by confidence level and for pants, and why it changed */
  var fittingPrefix = 'cm-fitting-v1-';
  var fittingKeys = KEEP.concat(['name', 'email', 'phone', 'cpref', 'code', 'self', 'finalSize', 'finalPants', 'why', 'notes', 'agreed', 'brief', 'reference', 'eventDate', 'consultBudget', 'outcome', 'nextStep', 'followDate', 'alternative', 'advWalk']);
  var clientSession = null;
  var deciding = 'Customer deciding', followUp = 'Follow-up needed', orderReview = 'Ready for order review';
  function consultPage(code) {
    var url = new URL(location.href);
    url.search = ''; url.hash = '';
    url.searchParams.set('consult', code);
    location.assign(url.href);
  }
  function fittingRecords() {
    var records = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf(fittingPrefix) === 0) {
          var record = load(key);
          if (record) records.push(record);
        }
      }
    } catch (e) {}
    return records;
  }
  function localDay() {
    var now = new Date();
    return [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
  }
  function openRecord(record) {
    if (!clientSession) clientSession = st;
    st = Object.assign(JSON.parse(initialFitting), record, { mode: 'advisor' });
    advReset();
    renderAdvisor();
  }
  /* transient advisor interface state: kept here so a re-render never loses what the advisor was doing */
  var advUi = { walk: false, follow: false, question: '', search: '', answer: null, status: null };
  function advSig() { return JSON.stringify([st.notes, st.finalSize, st.finalPants, st.why, st.agreed, st.outcome, st.followDate, st.nextStep, st.cloth, st.alternative || '']); }
  function advDirty() { return advUi.base != null && advSig() !== advUi.base; }
  function paintDirty() { var d = $('advDirty'); if (d) d.hidden = !advDirty(); }
  /* switching customers never throws away unsaved work: save and switch, or discard, or keep editing */
  function guardSwitch(go) {
    if (!advDirty()) { go(); return; }
    advUi.pending = go; renderAdvisor();
  }
  function advReset() { advUi.base = null; advUi.pending = null; advUi.walk = false; advUi.follow = false; advUi.question = ''; advUi.search = ''; advUi.answer = null; advUi.status = null; advUi.assist = false; advUi.fabric = false; advUi.sizes = false; }
  function flash(message, kind) {
    var d = new Date(), at = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    advUi.status = { text: message, kind: kind || 'ok', at: at };
    paintStatus();
  }
  function paintStatus() {
    var box = $('advStatus'); if (!box) return;
    var s = advUi.status;
    box.className = 'adv-status-line' + (s ? ' is-' + s.kind : '');
    box.textContent = s ? s.text + (s.kind === 'ok' ? ' · ' + s.at : '') : '';
  }

  function wireStylistAssistant() {
    var current = cloth(), fullPrice = total(), limit = Number(st.consultBudget || st.budget) || null;
    var cloths = ranked(current.c, st.occ).map(function (item) { return item.c; });
    var candidate = cloths.find(function (item) {
      var price = fullPrice + eur(item.usd) - eur(current.usd);
      return item.id !== current.id && price < fullPrice && (!limit || price <= limit) && StyleEngine.dist(item.c, current.c) <= 90; /* same colour family */
    });
    var connected = !!String(window.CUSTOM_STYLIST_AI_ENDPOINT || '').trim();
    var input = $('stylistQuestion');
    input.value = advUi.question;
    input.oninput = function () { advUi.question = this.value; };

    /* one place that draws the assistant's answer: empty, loading, error or a normal answer, with an optional alternative fabric */
    function paint() {
      var a = advUi.answer, box = $('stylistAnswer'), altBox = $('stylistAlt'), reply = $('stylistReply'), send = $('stylistSend');
      if (!box) return;
      var busy = !!a && a.state === 'loading';
      reply.setAttribute('aria-busy', String(busy)); send.disabled = busy;
      box.className = 'adv-answer is-' + (a ? a.state : 'empty');
      box.textContent = a ? a.text : 'Choose a suggestion or ask a question. Answers come from this fitting and the catalogue.';
      var alt = a && a.alt;
      altBox.hidden = !alt;
      if (alt) {
        if (!a.seen) { a.seen = true; advUi.fabric = true; if ($('advFabric')) $('advFabric').open = true; }
        var now = eur(cloth().usd), diff = eur(alt.usd) - now;
        $('stylistAltSwatch').setAttribute('style', swatch(alt, 60));
        $('stylistAltName').textContent = alt.name;
        $('stylistAltTotal').textContent = 'Full look ' + money(total() + diff);
        $('stylistAltDiff').textContent = diff === 0 ? 'Same price' : money(Math.abs(diff)) + (diff > 0 ? ' more' : ' less');
        $('stylistAltDiff').className = diff < 0 ? 'is-less' : '';
      }
    }
    function say(text, alt) { advUi.answer = { state: 'ok', text: text, alt: alt || null }; paint(); }
    /* answers from the fitting and catalogue facts on this device, so it works without any cloud service */
    function localAnswer(q) {
      var t = q.toLowerCase(), sg = suggest(), bits = [];
      var gl = D.glossary.filter(function (g) { return g.rx.test(q); })[0];
      if (/alternativ|option|what else|other (fabric|cloth|look)|similar|instead|show (them|him|her)|which (fabric|cloth)/.test(t)) return alternatives();
      if (/size|fit|fitting|shoulder|sleeve|chest|pants|trouser|loose|measure/.test(t)) {
        bits.push('Suggested jacket ' + sizeLabel(sg.size, sg.group) + ' ' + cap(sg.group) + ' (' + sg.level.toLowerCase() + ' confidence), pants ' + pantsSize() + '. ' + sg.text);
        bits.push(sg.level === 'High' ? 'Start with this size. Check the shoulder seam first, then the closed button, then the sleeve.' : 'Confidence is not high: measure chest and shoulders before the try-on and tick what changed afterwards.');
        return { text: bits.join(' ') };
      }
      if (/budget|price|cheap|afford|expens|cost|save|too much/.test(t)) {
        return candidate ? { text: 'The look is ' + money(fullPrice) + (limit ? ' against a budget of ' + money(limit) : '') + '. A close alternative is ' + candidate.name + ' at ' + money(fullPrice + eur(candidate.usd) - eur(current.usd)) + '. Show both swatches in daylight and let the customer choose.', alt: candidate }
          : { text: 'The look is ' + money(fullPrice) + (limit ? ' against a budget of ' + money(limit) : '') + '. No cheaper close alternative is listed. Ask which part of the price matters most: cloth, extras or canvas.' };
      }
      if (/ask|start|open|begin|first|brief|conversation|say/.test(t)) {
        return { text: (st.brief ? 'Start from their brief: "' + st.brief + '". ' : 'Ask where they will wear the suit and what they want to feel comfortable doing in it. ') + 'Then confirm the budget and the event date, and pull ' + current.name + ' for the try-on.' };
      }
      if (/add|extra|upsell|shirt|tie|shoe|accessor|waistcoat|monogram/.test(t)) {
        var open = D.extras.filter(function (x) { return !st.on[x.id]; }).slice(0, 3).map(function (x) { return x.name.toLowerCase() + ' (' + money(extraPrice(x)) + ')'; });
        return { text: open.length ? 'Not added yet: ' + open.join(', ') + '. Suggest the shirt and tie first, since they are chosen to match this look. Leave the rest until the cloth and size are settled.' : 'Everything listed is already added. Check the colours with the customer.' };
      }
      if (gl) return { text: gl.term + ': ' + gl.text };
      if (/cloth|fabric|wool|linen|flannel|season|wear|summer|winter|warm|cold|crease/.test(t)) {
        return { text: current.name + '. ' + (current.wear || '') + ' ' + (current.season === 'all' ? 'It works all year.' : 'Best in ' + current.season + '.') + ' Ask how often and where they will wear it.' };
      }
      var kb = Brief.kb(q); if (kb) return { text: kb };
      return { text: 'I can help with size and fit, budget and cheaper cloths, what to ask first, what to add, or what a cloth is like. Try one of the suggestions above.' };
    }
    /* three different directions to show next: varied weaves, suit price within the customer's budget, closest to the chosen colour first;
       options the customer already saw in Style me are marked, so the advisor can build on them */
    function alternatives() {
      var seen = sm.shown || [], now = eur(current.usd), picked = [], weaves = {};
      var label = { plain: 'plain weave', herring: 'herringbone', flannel: 'flannel', check: 'check', stripe: 'stripe', textured: 'textured weave' };
      cloths.forEach(function (c) {
        if (picked.length >= 3 || c.id === current.id || weaves[c.weave] || (limit && eur(c.usd) > limit)) return;
        weaves[c.weave] = 1; picked.push(c);
      });
      if (!picked.length) return { text: 'No other fabric is within the recorded budget. Confirm how flexible the budget is first.' };
      var lines = picked.map(function (c, i) {
        var d = eur(c.usd) - now;
        return (i + 1) + '. ' + c.name + ' · ' + (label[c.weave] || c.weave) + ' · suit ' + money(eur(c.usd)) + ' (' + (d === 0 ? 'same price' : (d > 0 ? '+' : '−') + money(Math.abs(d))) + ')' + (seen.indexOf(c.id) > -1 ? ' · shown online' : '');
      });
      return { text: 'Three directions to show next' + (limit ? ', all within ' + money(limit) : '') + ':\n' + lines.join('\n') + '\nAsk what they liked about ' + current.name + ' before pulling swatches.', alt: picked[0] };
    }
    $('stylistPrep').onclick = function () {
      var opening = st.brief ? 'Start with their brief: “' + st.brief + '”. Ask which detail matters most.'
        : 'Ask where they will wear the suit and what they want to feel comfortable doing in it.';
      say(opening + ' Pull ' + current.name + ' for the try-on.' +
        (st.finalSize ? ' Have jacket size ' + st.finalSize + ' ready.' : ' Confirm the starting jacket size in person.') +
        (st.nextStep ? ' Pick up the previous next step: ' + st.nextStep : ''));
    };
    $('stylistFabric').onclick = function () {
      if (!candidate) { say('The shortlisted fabrics contain no lower-priced option within the recorded budget. Confirm how flexible the budget is before comparing another cloth.'); return; }
      var saving = eur(current.usd) - eur(candidate.usd);
      say('Pull ' + candidate.name + ' alongside ' + current.name + '. The complete look would be ' +
        money(fullPrice - saving) + ', saving ' + money(saving) + '. Ask the customer to compare the two swatches in natural light.', candidate);
    };
    $('stylistExplain').onclick = function () {
      var occasion = activeLook().label;
      say('“For ' + occasion.toLowerCase() + ', let’s start with ' + current.name + '. ' +
        (current.wear || '') + ' With the details we’ve selected, the total is ' + money(fullPrice) +
        '. How does this cloth feel to you?”');
    };
    $('stylistCompare').onclick = function () {
      var alt = advUi.answer && advUi.answer.alt; if (!alt) return;
      var select = $('altCloth'); select.value = alt.id; $('altSearch').value = alt.name; advUi.search = alt.name; $('altResults').hidden = true; select.onchange();
      $('advFabric').scrollIntoView({ block: 'center' }); $('applyAlt').focus({ preventScroll: true });
    };
    $('stylistFree').onsubmit = async function (event) {
      event.preventDefault();
      var question = input.value.trim(); advUi.question = input.value;
      if (!question) { advUi.answer = { state: 'empty', text: 'Type a question first, or choose a suggestion above.', alt: null }; paint(); return; }
      if (!connected) { var local = localAnswer(question); say(local.text, local.alt); return; }
      advUi.answer = { state: 'loading', text: 'Preparing a suggestion…', alt: null }; paint();
      var out = null;
      try {
        var result = await StyleEngine.callAI(question, {audience:'store_advisor', task:'Answer the advisor in a few sentences. Ground advice in the supplied fitting and catalogue facts. Never claim stock or delivery availability.',
          occasion:activeLook().label, fabric:current.name, wear:current.wear, total_eur:fullPrice, budget_eur:limit,
          alternative:candidate ? {name:candidate.name,total_eur:fullPrice+eur(candidate.usd)-eur(current.usd)} : null},null,[],D.cloths);
        if (result && result.reply) out = { state: 'ok', text: result.reply, alt: candidate && result.reply.indexOf(candidate.name) > -1 ? candidate : null };
      } catch (e) { out = null; }
      if (!out) { var fallback = localAnswer(question); out = { state: 'error', text: 'Live advice is unavailable, so this guidance comes from this device. ' + fallback.text, alt: fallback.alt || null }; }
      advUi.answer = out; paint();
    };
    paint();
  }

  function renderConsultation() {
    wireStylistAssistant();
    var outcome = $('consultOutcome'), due = $('followDate'), detail = $('nextStep');
    [deciding, followUp, orderReview].forEach(function (label) { outcome.add(new Option(label, label)); });
    outcome.value = st.outcome || deciding;
    detail.value = st.nextStep || ''; due.value = st.followDate || '';
    function syncFields() {
      $('followDateLabel').hidden = outcome.value !== followUp;
      $('nextStepLabel').hidden = outcome.value === orderReview;
    }
    syncFields();
    outcome.onchange = function () { st.outcome = this.value; syncFields(); };
    due.oninput = function () { st.followDate = this.value; };
    detail.oninput = function () { st.nextStep = this.value; };

    /* appointment tools in the toolbar: only one panel open at a time */
    function togglePanel(key, other) {
      var btn = $(key === 'walk' ? 'advWalkToggle' : 'advFollowToggle'), pane = $(key === 'walk' ? 'walkPanel' : 'followPanel');
      var otherBtn = $(other === 'walk' ? 'advWalkToggle' : 'advFollowToggle'), otherPane = $(other === 'walk' ? 'walkPanel' : 'followPanel');
      function paintPanels() {
        btn.setAttribute('aria-expanded', String(advUi[key])); pane.hidden = !advUi[key];
        otherBtn.setAttribute('aria-expanded', String(advUi[other])); otherPane.hidden = !advUi[other];
      }
      btn.onclick = function () { advUi[key] = !advUi[key]; if (advUi[key]) advUi[other] = false; paintPanels(); if (advUi[key]) { var f = pane.querySelector('input,select,button'); if (f) f.focus(); } };
      paintPanels();
    }
    togglePanel('walk', 'follow'); togglePanel('follow', 'walk');

    var queue = $('followQueue'), today = localDay();
    var records = fittingRecords().filter(function (record) { return record.outcome === followUp; });
    records.sort(function (a,b) { return (a.followDate || '9999').localeCompare(b.followDate || '9999'); });
    $('followCount').textContent = 'Follow-ups (' + records.length + ')';
    if (!records.length) queue.textContent = 'No follow-ups saved in this browser.';
    records.forEach(function (record) {
      var date = record.followDate, timing = !date ? 'Unscheduled' : date < today ? 'Overdue · '+date : date === today ? 'Today' : date;
      var button = el('button','adv-follow-item'); button.textContent = timing + ' · ' + (record.name || record.code);
      if (date && date < today) button.classList.add('is-overdue');
      button.type = 'button'; button.onclick = function () { guardSwitch(function () { openRecord(record); }); };
      var row = el('div','adv-follow-row'); row.appendChild(button);
      if (record.nextStep) { var note = el('p','muted'); note.textContent = record.nextStep; row.appendChild(note); }
      queue.appendChild(row);
    });
    var occasions = $('walkOcc');
    D.occasions.forEach(function (item) { occasions.add(new Option(item.label,item.id)); });
    $('walkForm').onsubmit = function (event) {
      event.preventDefault();
      /* read the form first: the unsaved-changes prompt redraws it */
      var entered = { name: $('walkName').value.trim(), occ: occasions.value, date: $('walkDate').value, budget: $('walkBudget').value };
      guardSwitch(function () { startWalkIn(entered); });
    };
    function startWalkIn(entered) {
      var previous = st;
      st = JSON.parse(initialFitting);
      st.walk = true; st.advWalk = true; st.mode = 'advisor'; st.name = entered.name;
      st.occ = entered.occ; st.eventDate = entered.date;
      st.consultBudget = entered.budget; st.outcome = deciding;
      st.target = activeLook().c; st.cloth = ranked()[0].c.id; resetOutfit();
      try { consultPage(writeFitting('draft')); }
      catch (e) { st = previous; $('lookupStatus').textContent = 'Could not start the fitting in this browser.'; }
    }
    $('editConsultLook').onclick = function () {
      try { consultPage(writeFitting('draft')); }
      catch (e) { flash('Could not save this fitting, so the look was not opened.', 'error'); }
    };

    var select = $('altCloth'), search = $('altSearch'), results = $('altResults');
    select.value = st.alternative && st.alternative !== st.cloth ? st.alternative : '';
    if (select.value && byId(select.value) && !advUi.search) advUi.search = byId(select.value).name;
    search.value = advUi.search;
    /* type a keyword (a colour, a weave, a name, "cheaper") and pick from the matches: no long list to scroll */
    function matchCloths(q) {
      q = q.trim().toLowerCase(); if (!q) return [];
      var cur = cloth(), curPrice = eur(cur.usd);
      return D.cloths.filter(function (c) { return c.id !== st.cloth; }).map(function (c) {
        var hay = (c.name + ' ' + (c.pat || '') + ' ' + c.weave + ' ' + c.season + ' ' + StyleEngine.closestName(c.c)).toLowerCase();
        var ok = q.split(/\s+/).every(function (w) {
          if (/^(cheaper|cheap|less|lower)$/.test(w)) return eur(c.usd) < curPrice;
          if (/^(dearer|premium|finer)$/.test(w)) return eur(c.usd) > curPrice;
          return hay.indexOf(w) > -1;
        });
        return ok ? { c: c, d: StyleEngine.dist(cur.c, c.c) } : null;
      }).filter(Boolean).sort(function (m, n) { return m.d - n.d; }).slice(0, 8).map(function (x) { return x.c; });
    }
    function closeResults() { results.hidden = true; search.setAttribute('aria-expanded', 'false'); }
    function showMatches() {
      var list = matchCloths(search.value);
      results.innerHTML = ''; results.hidden = !search.value.trim();
      search.setAttribute('aria-expanded', String(!results.hidden));
      if (!search.value.trim()) return;
      if (!list.length) { results.appendChild(el('p', 'muted', 'No fabric matches. Try a colour, a weave or a name.')); return; }
      var cur = eur(cloth().usd);
      list.forEach(function (c) {
        var b = el('button', 'alt-item'); b.type = 'button'; b.setAttribute('role', 'option');
        var d = eur(c.usd) - cur;
        b.innerHTML = '<i style="' + swatch(c, 60) + '"></i><span><b>' + c.name + '</b><small>' + (d === 0 ? 'Same price' : money(Math.abs(d)) + (d > 0 ? ' more' : ' less')) + '</small></span>';
        b.onclick = function () { select.value = c.id; search.value = c.name; advUi.search = c.name; closeResults(); select.onchange(); };
        results.appendChild(b);
      });
    }
    search.oninput = function () { advUi.search = this.value; showMatches(); };
    search.onkeydown = function (e) {
      var items = [].slice.call(results.querySelectorAll('.alt-item'));
      if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); items[0].focus(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (items[0]) items[0].click(); }
      else if (e.key === 'Escape') { closeResults(); }
    };
    results.onkeydown = function (e) {
      var items = [].slice.call(results.querySelectorAll('.alt-item')), i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0) search.focus(); else items[i - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeResults(); search.focus(); }
    };
    $('altKeywords').innerHTML = '';
    ['cheaper', 'grey', 'navy', 'linen', 'velvet', 'check'].forEach(function (w) { var k = el('button', 'chip', w); k.type = 'button'; k.onclick = function () { search.value = w; advUi.search = w; showMatches(); search.focus(); }; $('altKeywords').appendChild(k); });
    /* selected and alternative side by side, same size, with the price difference between them */
    function compare() {
      var alt = byId(select.value);
      $('clothPair').hidden = !alt;
      if (!alt) return;
      var current = cloth(), price = total(), delta = eur(alt.usd) - eur(current.usd);
      $('firstSwatch').setAttribute('style', swatch(current, 120));
      $('secondSwatch').setAttribute('style', swatch(alt, 120));
      $('firstName').textContent = current.name; $('secondName').textContent = alt.name;
      $('firstPrice').textContent = money(price); $('secondPrice').textContent = money(price + delta);
      $('priceChange').textContent = delta === 0 ? 'Same total price' : money(Math.abs(delta)) + (delta > 0 ? ' more' : ' less') + ' for the full look';
      $('priceChange').className = 'adv-diff' + (delta < 0 ? ' is-less' : delta > 0 ? ' is-more' : '');
    }
    select.onchange = function () { st.alternative = this.value; compare(); paintDirty(); };
    compare();
    if (advUi.search.trim() && document.activeElement && document.activeElement.id === 'altSearch') showMatches();
    $('applyAlt').onclick = function () {
      var alt = byId(select.value); if (!alt) return;
      var from = cloth().name;
      st.alternative = st.cloth; st.cloth = alt.id; st.target = alt.c;
      if (advUi.answer) advUi.answer.alt = null;
      advUi.search = from;
      renderAdvisor();
      flash('Fabric changed to ' + alt.name + '. Sizes, alterations and notes are unchanged.');
    };
  }

  function fittingCode() {
    if (st.code) return st.code;
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', code;
    do {
      code = 'CM-';
      for (var i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    } while (load(fittingPrefix + code));
    return code;
  }
  function writeFitting(finalize) {
    var code = fittingCode(), existing = load(fittingPrefix + code);
    var record = snap(fittingKeys);
    record.code = code; record.outcome = st.outcome || deciding;
    if (existing && finalize === false) {
      ['result', 'finalSize', 'finalPants', 'why', 'notes', 'agreed', 'outcome', 'nextStep', 'followDate', 'alternative'].forEach(function (key) { record[key] = existing[key]; });
    }
    if (finalize === 'draft' && existing && existing.result && record.outcome === orderReview) record.result = existing.result;
    if (finalize === true) {
      var suggestion = suggest();
      record.result = { sug: suggestion.size, final: st.finalSize, group: st.group || suggestion.group,
        level: suggestion.level, pSug: pantsSize(), pFinal: st.finalPants, why: st.why.slice(),
        adjN: D.adjustments.filter(function (item) { return record.agreed[item.key]; }).length,
        rev: FIT_REV, date: new Date().toISOString().slice(0, 10) };
    }
    localStorage.setItem(fittingPrefix + code, JSON.stringify(record));
    st.code = code;
    return code;
  }
  function fittingResults() {
    var results = load(FITLOG) || [];
    fittingRecords().forEach(function (record) { if (record.result) results.push(record.result); });
    return results;
  }
  function fitStats() {
    var log = fittingResults();
    if (!log.length) return 'No fittings logged yet.';
    var hit = log.filter(function (x) { return x.sug === x.final; }).length;
    var lines = [log.length + (log.length === 1 ? ' fitting' : ' fittings') + ' logged. Jacket size matched the suggestion in ' + hit + '.'];
    var pl = log.filter(function (x) { return x.pFinal != null; });
    if (pl.length) lines.push('Pants size matched in ' + pl.filter(function (x) { return x.pSug === x.pFinal; }).length + ' of ' + pl.length + '.');
    var lv = ['High', 'Medium', 'Low'].map(function (k) { var l = log.filter(function (x) { return x.level === k; }); return l.length ? k + ' ' + l.filter(function (x) { return x.sug === x.final; }).length + '/' + l.length : null; }).filter(Boolean);
    if (lv.length) lines.push('By confidence: ' + lv.join(', ') + '.');
    var tally = {}; log.forEach(function (x) { (x.why || []).forEach(function (w) { tally[w] = (tally[w] || 0) + 1; }); });
    var top = Object.keys(tally).sort(function (m, n) { return tally[n] - tally[m]; })[0];
    if (top) lines.push('Most common reason for a change: ' + top.toLowerCase() + ' (' + tally[top] + ').');
    return lines.join('\n');
  }
  function exportFitLog() {
    var log = fittingResults(), rows = [['date', 'version', 'confidence', 'jacket_suggested', 'jacket_final', 'pants_suggested', 'pants_final', 'adjustments', 'reasons']];
    log.forEach(function (x) { rows.push([x.date, x.rev || '', x.level || '', x.sug, x.final, x.pSug == null ? '' : x.pSug, x.pFinal == null ? '' : x.pFinal, x.adjN == null ? '' : x.adjN, (x.why || []).join('; ')]); });
    var csv = rows.map(function (rw) { return rw.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
    var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), lnk = document.createElement('a');
    lnk.href = url; lnk.download = 'fitting-log.csv'; document.body.appendChild(lnk); lnk.click(); document.body.removeChild(lnk); setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }
  function setMode(m) {
    if (m === 'client' && clientSession) { st = clientSession; clientSession = null; }
    st.mode = m; var adv = m === 'advisor';
    document.body.classList.toggle('adv', adv);
    $('advisorView').hidden = !adv;
    $('modeClient').setAttribute('aria-pressed', String(!adv)); $('modeAdvisor').setAttribute('aria-pressed', String(adv));
    if (adv) renderAdvisor(); else { update(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function escapeName(value) { var span = document.createElement('span'); span.textContent = value; return span.innerHTML; }
  function contactHtml() {
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); };
    var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.email), okTel = /^[+0-9][0-9 ()-]{6,}$/.test(st.phone);
    var lines = '';
    if (st.email) lines += '<div><span>Email' + (st.cpref === 'Email' ? ' · preferred' : '') + '</span>' + (okMail ? '<a href="mailto:' + esc(st.email) + '">' + esc(st.email) + '</a>' : esc(st.email)) + '</div>';
    if (st.phone) lines += '<div><span>Phone' + (st.cpref === 'Phone' ? ' · preferred' : '') + '</span>' + (okTel ? '<a href="tel:' + esc(st.phone.replace(/[^+0-9]/g, '')) + '">' + esc(st.phone) + '</a>' : esc(st.phone)) + '</div>';
    return lines ? '<div class="contact-lines">' + lines + '</div>' : '<p class="adv-empty">No contact details yet. The client adds them in Review.</p>';
  }

  /* ---- the advisor workspace: header, look and brief, fabric comparison, sizing, outcome, with the assistant beside it ---- */
  function advRows(rows) {
    return '<dl class="adv-rows">' + rows.filter(Boolean).map(function (r) { return '<div class="adv-row"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>';
  }
  function renderAdvisor() {
    if (!document.body.classList.contains('adv')) return;
    var box = $('advisorView'), c = cloth(), shot = lookImage(), sg = suggest(), g = st.group || sg.group;
    /* keep what the advisor was doing: focus, caret and scroll position */
    var ae = document.activeElement, keep = ae && ae.id && box.contains(ae) ? { id: ae.id, s: ae.selectionStart, e: ae.selectionEnd } : null, scrollY = window.scrollY;
    var ex = D.extras.filter(function (x) { return st.on[x.id]; }).map(function (x) { return x.id === 'shoes' ? x.name + ' (' + shoeSel().name.toLowerCase() + ')' : x.name + (st.col[x.id] ? ' (' + cname(st.col[x.id]).toLowerCase() + ')' : ''); });
    var dflt = JSON.parse(initialFitting), unprov = !!(st.advWalk && st.h === dflt.h && st.w === dflt.w && st.usual === dflt.usual && !st.chest && !st.self);
    var checks = [];
    if (unprov) checks.push('No customer measurements yet. Measure height, weight and chest before choosing a size');
    else if (!st.size) checks.push('Starting size needs confirmation: the customer has not chosen one. Try it on first');
    else if (st.level === 'Low') checks.push('Starting size needs confirmation: low confidence on ' + sizeText() + '. Measure before the try-on');
    else if (st.level === 'Medium') checks.push('Confirm the starting size ' + sizeText() + ' at the try-on (medium confidence)');
    if (st.mono.trim()) checks.push('Embroider initials ' + st.mono.toUpperCase() + ' inside the jacket lining');
    var when = st.slot ? st.slot + ', ' + st.city : st.walk ? 'Walk-in' : 'No appointment yet';
    if (!st.agreed) st.agreed = {};
    var agreed = Object.assign({}, st.adj, st.agreed);
    var differs = (st.finalSize && st.finalSize !== sg.size) || (st.finalPants && st.finalPants !== pantsSize());
    var dz = curDesign(), status = st.outcome || deciding, statusClass = status === orderReview ? 'is-ready' : status === followUp ? 'is-follow' : 'is-open';
    box.innerHTML =
      '<div class="adv-ws">' +
      /* appointment tools, kept apart from the active fitting */
      '<div class="adv-bar adv-noprint">' +
        '<div class="adv-bar-row">' +
          '<form id="openFitting" class="adv-open"><label for="lookupCode">Fitting code</label><input id="lookupCode" type="text" placeholder="CM-XXXXXX" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="16"><button type="submit" class="btn">Open fitting</button></form>' +
          '<div class="adv-bar-tools"><button type="button" class="btn ghost" id="advWalkToggle" aria-expanded="false" aria-controls="walkPanel">Start walk-in</button><button type="button" class="btn ghost" id="advFollowToggle" aria-expanded="false" aria-controls="followPanel"><span id="followCount">Follow-ups</span></button></div>' +
        '</div>' +
        '<p id="lookupStatus" class="adv-bar-note" role="status"></p>' +
        '<section id="walkPanel" class="adv-panel" aria-label="Start a walk-in" hidden><form id="walkForm" class="adv-form-grid"><label for="walkName">Customer name<input id="walkName" type="text" maxlength="80" autocomplete="off"></label><label for="walkOcc">Occasion<select id="walkOcc"></select></label><label for="walkDate">Event date (optional)<input type="date" id="walkDate"></label><label for="walkBudget">Budget in euros (optional)<input type="number" min="1" id="walkBudget" inputmode="numeric"></label><div class="adv-form-actions"><button class="btn">Start consultation</button></div></form></section>' +
        '<section id="followPanel" class="adv-panel" aria-label="Follow-ups" hidden><div id="followQueue"></div></section>' +
      '</div>' +
      '<div id="advSwitch" class="adv-switch adv-noprint" role="alertdialog" aria-labelledby="advSwitchMsg"' + (advUi.pending ? '' : ' hidden') + '><p id="advSwitchMsg">' + escapeName(st.name || 'This fitting') + ' has unsaved changes.</p><div class="adv-switch-actions"><button type="button" class="btn" id="advSwitchSave">Save and switch</button><button type="button" class="btn ghost" id="advSwitchDiscard">Discard changes</button><button type="button" class="adv-quiet" id="advSwitchKeep">Keep editing</button></div></div>' +
      '<dialog id="advPhotoDlg" class="adv-photo-dlg adv-noprint"><img id="advPhotoImg" alt="Customer photo"><form method="dialog"><button class="btn">Close</button></form></dialog>' +
      /* the active fitting */
      '<header class="adv-head"><div class="adv-head-main"><h2 class="adv-name">' + escapeName(st.name || 'Guest') + '</h2>' +
        '<p class="adv-meta"><span>' + escapeName(when) + '</span>' + (st.eventDate ? '<span>Event ' + escapeName(st.eventDate) + '</span>' : '') + '<span class="adv-code">' + (st.code || 'Not saved yet') + '</span></p></div>' +
        '<div class="adv-head-side"><span class="adv-dirty adv-noprint" id="advDirty" hidden>Unsaved changes</span><span class="adv-state ' + statusClass + '">' + status + '</span></div></header>' +
      '<div class="adv-grid">' +
        '<div class="adv-main">' +
          '<section class="adv-card" id="advLook" aria-labelledby="advLookH">' +
            '<div class="adv-card-head"><h3 id="advLookH">Look and brief</h3><button type="button" class="btn ghost adv-noprint" id="editConsultLook">Edit look together</button></div>' +
            '<div class="adv-look">' +
              '<div class="adv-summary"><div class="adv-suit"><img src="' + shot + '" alt="Selected look: ' + escapeName(c.name) + '"></div>' +
                '<div class="adv-summary-body">' +
                  advRows([['Fabric', escapeName(c.name)], ['Occasion', escapeName(activeLook().label)], dz ? ['Design', escapeName(dz.name)] : null, ['Style', escapeName(styleText())], ['Extras', ex.length ? escapeName(ex.join(', ')) : 'None'], st.consultBudget ? ['Budget', money(Number(st.consultBudget))] : null]) +
                  '<div class="adv-total"><div><span class="adv-total-label">Total</span><b class="adv-total-value">' + money(total()) + '</b></div><span class="adv-delivery">Ready in 2–3 weeks</span></div>' +
                '</div></div>' +
              '<div class="adv-brief" id="advBrief"><h4>Customer’s request</h4><p id="advBriefText"></p><img id="advReference" hidden alt="Customer’s inspiration photo"></div>' +
            '</div>' +
          '</section>' +
          '<details class="adv-card adv-noprint" id="advFabric"><summary><span class="adv-fab-sel"><i id="fabSwatch" class="adv-swatch is-small"></i><span class="adv-fab-name"><span class="adv-fab-label">Fabric</span><b>' + escapeName(c.name) + '</b></span></span><span class="adv-fab-act">Compare another fabric</span></summary><div class="adv-detail-body">' +
            '<div class="adv-search-wrap"><label for="altSearch">Find another fabric</label><div class="alt-search"><input id="altSearch" type="search" role="combobox" aria-expanded="false" aria-controls="altResults" aria-autocomplete="list" placeholder="Type a colour, weave or name" autocomplete="off"><div class="alt-results" id="altResults" role="listbox" aria-label="Matching fabrics" hidden></div></div><div class="chips" id="altKeywords" aria-label="Keywords"></div></div>' +
            '<input type="hidden" id="altCloth">' +
            '<div id="clothPair" class="adv-pair" hidden>' +
              '<div class="adv-opt is-current" aria-label="Selected fabric"><span class="adv-opt-tag">Selected</span><i id="firstSwatch" class="adv-swatch"></i><b id="firstName"></b><span class="adv-opt-total" id="firstPrice"></span></div>' +
              '<div class="adv-opt" aria-label="Alternative fabric"><span class="adv-opt-tag">Alternative</span><i id="secondSwatch" class="adv-swatch"></i><b id="secondName"></b><span class="adv-opt-total" id="secondPrice"></span></div>' +
              '<div class="adv-pair-foot"><p id="priceChange" class="adv-diff"></p><button type="button" class="btn" id="applyAlt">Use this fabric</button></div>' +
            '</div>' +
          '</div></details>' +
          '<section class="adv-card" id="advFit" aria-labelledby="advFitH">' +
            '<h3 id="advFitH">Sizing and alterations</h3>' +
            '<div class="adv-two">' +
              '<div><h4>From the customer</h4>' + advRows(unprov ? [['Height and weight', '<span class="muted">Not provided</span>'], ['Usual size', '<span class="muted">Not provided</span>'], ['Fit preference', '<span class="muted">Not provided</span>'], ['Photo for the advisor', 'None']] : [['Height and weight', st.h + ' cm, ' + st.w + ' kg'], ['Usual size', st.notSure ? 'Not sure' + (st.chest ? ', chest ' + st.chest + ' cm' : '') : String(st.usual)], ['Fit preference', escapeName(st.pref)], ['Suggested trouser size', String(pantsSize())], ['Photo for the advisor', st.self ? '<button type="button" class="adv-link" id="advPhoto">View photo</button>' : 'None']]) + '</div>' +
              '<div class="adv-start"><h4>' + (unprov ? 'Provisional starting size' : 'Suggested starting size') + '</h4><p class="adv-start-size"><b>' + sizeLabel(sg.size, sg.group) + ' ' + cap(sg.group) + '</b><span class="pill ' + (unprov ? 'low' : sg.level.toLowerCase()) + '">' + (unprov ? 'Provisional' : sg.level + ' confidence') + '</span></p><p class="adv-start-why">' + (unprov ? 'Based on default measurements, not on the customer. Confirm in person.' : sg.text) + '</p></div>' +
            '</div>' +
            (checks.length ? '<div class="adv-block"><h4>Check first</h4><ul class="adv-list">' + checks.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' : '') +
            '<div class="adv-block adv-final"><div class="adv-final-head"><h4>Final sizes</h4><button type="button" class="btn ghost adv-noprint" id="advSizeToggle" aria-expanded="' + (advUi.sizes ? 'true' : 'false') + '" aria-controls="advSizePick">' + (advUi.sizes ? 'Done' : (st.finalSize || st.finalPants ? 'Change' : 'Choose')) + '</button></div>' +
              '<p class="adv-final-line" id="advFinalLine">' + (st.finalSize ? 'Jacket <b>' + sizeLabel(st.finalSize, g) + '</b>' : 'Jacket <span class="muted">not chosen</span>') + ' · ' + (st.finalPants ? 'Trousers <b>' + st.finalPants + '</b>' : 'Trousers <span class="muted">not chosen</span>') + '</p>' +
              '<div id="advSizePick" class="adv-size-pick"' + (advUi.sizes ? '' : ' hidden') + '>' +
                '<h4 id="finalJacketLbl">Final jacket size</h4><div class="chips" id="advSizes" role="group" aria-labelledby="finalJacketLbl"></div>' +
                '<h4 id="finalTrouserLbl">Final trouser size</h4><div class="chips" id="advPants" role="group" aria-labelledby="finalTrouserLbl"></div>' +
              '</div>' +
              '<p class="cmp" id="advCmp"></p><p class="cmp" id="advPCmp"></p></div>' +
            (differs ? '<div class="adv-block"><h4 id="whyLbl">Reason for change <span class="muted">optional</span></h4><div class="chips" id="advWhy" role="group" aria-labelledby="whyLbl"></div></div>' : '') +
            '<div class="adv-block"><h4>Alterations <span class="muted">in centimetres</span></h4><div class="adv-alt-head" aria-hidden="true"><span>Alteration</span><span>Requested</span><span>Agreed</span></div><div class="adjs" id="advAdjs"></div></div>' +
            '<div class="adv-block"><label for="advNotes" class="adv-label">Workroom notes</label><textarea id="advNotes" placeholder="Shoulders, posture, anything for the workroom"></textarea><div class="adv-print-only" id="advNotesPrint"></div></div>' +
          '</section>' +
          '<section class="adv-card" id="advOutcome" aria-labelledby="advOutcomeH">' +
            '<h3 id="advOutcomeH">Appointment outcome</h3>' +
            '<div class="adv-form-grid"><label for="consultOutcome">Status<select id="consultOutcome"></select></label><label id="followDateLabel" for="followDate">Follow-up date (optional)<input type="date" id="followDate"></label><label id="nextStepLabel" class="adv-wide" for="nextStep">Next step<textarea id="nextStep" maxlength="400"></textarea></label></div>' +
          '</section>' +
          '<div class="adv-utility adv-noprint"><p class="adv-log" id="advLog" aria-live="polite">' + (st.code ? 'Fitting code ' + st.code : '') + '</p></div>' +
        '</div>' +
        '<aside class="adv-side" aria-label="Stylist assistant and contact">' +
          '<details class="adv-card adv-assist adv-noprint" id="advAssist" open><summary>Stylist assistant</summary><div class="adv-assist-body">' +
            '<div class="adv-suggest" id="stylistChips" role="group" aria-label="Suggestions"><button type="button" class="chip" id="stylistPrep">Prepare fitting</button><button type="button" class="chip" id="stylistFabric">Lower-priced fabric</button><button type="button" class="chip" id="stylistExplain">Explain cloth</button></div>' +
            '<form id="stylistFree" class="adv-ask"><label for="stylistQuestion">Ask a question</label><div class="ask-row"><input id="stylistQuestion" type="text" maxlength="700" placeholder="For example: is the size right?" autocomplete="off"><button class="btn" id="stylistSend">Ask</button></div></form>' +
            '<div id="stylistReply" aria-live="polite" aria-busy="false"><p id="stylistAnswer" class="adv-answer is-empty"></p>' +
              '<div id="stylistAlt" class="adv-alt" hidden><i id="stylistAltSwatch" class="adv-swatch is-small"></i><div class="adv-alt-text"><b id="stylistAltName"></b><span id="stylistAltTotal"></span><span id="stylistAltDiff"></span></div><button type="button" class="btn ghost" id="stylistCompare">Compare fabrics</button></div>' +
            '</div>' +
          '</div></details>' +
          '<details class="adv-card adv-contact" id="advContact"><summary>Contact</summary><div class="adv-detail-body">' + contactHtml() + '</div></details>' +
        '</aside>' +
      '</div>' +
      '<div class="adv-actions adv-noprint"><div class="adv-actions-quiet"><button type="button" class="adv-quiet" id="advPrint">Print sheet</button><details class="adv-more"><summary class="adv-quiet">More</summary><div class="adv-more-menu"><button type="button" class="adv-quiet" id="advCsv">Export log</button></div></details></div><p id="advStatus" class="adv-status-line" role="status" aria-live="polite"></p><div class="adv-actions-main"><button type="button" class="btn ghost" id="advDraft">Save progress</button><button type="button" class="btn" id="advSave">Complete fitting</button></div></div>' +
      '</div>';

    fill('advSizes', D.sizes.map(function (x) { var b = chip(sizeLabel(x, g), st.finalSize === x, function () { st.finalSize = st.finalSize === x ? null : x; renderAdvisor(); }); b.id = 'advSize-' + x; return b; }));
    var cmp = $('advCmp');
    if (st.finalSize) { var same = st.finalSize === sg.size; cmp.className = 'cmp ' + (same ? 'ok' : 'diff'); cmp.textContent = same ? 'Matches the suggestion.' : 'Differs from the suggestion (' + sizeLabel(sg.size, g) + ' suggested, ' + sizeLabel(st.finalSize, g) + ' final).'; }
    fill('advPants', D.pantsSizes.map(function (x) { var b = chip(String(x), st.finalPants === x, function () { st.finalPants = st.finalPants === x ? null : x; renderAdvisor(); }); b.id = 'advPantsSize-' + x; return b; }));
    var pcmp = $('advPCmp');
    if (st.finalPants) { var psame = st.finalPants === pantsSize(); pcmp.className = 'cmp ' + (psame ? 'ok' : 'diff'); pcmp.textContent = psame ? 'Matches the suggestion.' : 'Differs from the suggestion (' + pantsSize() + ' suggested, ' + st.finalPants + ' final).'; }
    if ($('advWhy')) fill('advWhy', WHY.map(function (w, i) { var b = chip(w, st.why.indexOf(w) > -1, function () { var k = st.why.indexOf(w); if (k > -1) st.why.splice(k, 1); else st.why.push(w); renderAdvisor(); }); b.id = 'advWhy-' + i; return b; }));
    $('advCsv').onclick = exportFitLog;
    $('fabSwatch').setAttribute('style', swatch(c, 60));
    var fab = $('advFabric'); fab.open = !!advUi.fabric; fab.ontoggle = function () { advUi.fabric = fab.open; };
    $('advSizeToggle').onclick = function () { advUi.sizes = !advUi.sizes; renderAdvisor(); };
    $('advBriefText').textContent = st.brief || (st.reference ? '' : 'No styling request from the customer yet. Ask where they will wear the suit.');
    $('advBriefText').className = st.brief || st.reference ? '' : 'adv-empty';
    if (st.reference) { $('advReference').src = st.reference; $('advReference').hidden = false; }
    $('openFitting').onsubmit = function (event) {
      event.preventDefault();
      var code = $('lookupCode').value.trim().toUpperCase();
      var record = /^CM-[A-Z2-9]{4,6}$/.test(code) && load(fittingPrefix + code);
      if (!record) { $('lookupStatus').textContent = 'No fitting with that code in this browser.'; return; }
      guardSwitch(function () { openRecord(record); $('lookupStatus').textContent = 'Opened ' + code; });
    };
    buildAdjustments($('advAdjs'), agreed, st.adj);
    $('advNotes').value = st.notes || ''; $('advNotesPrint').textContent = st.notes || '';
    $('advNotes').oninput = function () { st.notes = this.value; $('advNotesPrint').textContent = this.value; };
    $('advPrint').onclick = function () { window.print(); };
    renderConsultation();
    /* the assistant stays open beside the fitting on wide screens, and folds away on narrow ones */
    var assist = $('advAssist'), wide = window.matchMedia('(min-width:1024px)');
    if (wide.matches) { assist.open = true; assist.querySelector('summary').onclick = function (e) { e.preventDefault(); }; }
    else { assist.open = !!advUi.assist; assist.ontoggle = function () { advUi.assist = assist.open; }; }
    $('advDraft').onclick = function () {
      if (st.outcome === orderReview && (!st.finalSize || !st.finalPants)) {
        var missing = !st.finalSize ? 'jacket' : 'trouser', msg = 'Ready for order review needs the final ' + missing + ' size. Choose it, or set the status to Customer deciding.';
        $('advLog').textContent = msg; advUi.sizes = true; renderAdvisor(); flash(msg, 'error'); return;
      }
      try {
        var code = writeFitting('draft'); advUi.base = null; renderAdvisor();
        $('advLog').textContent = 'Progress saved · ' + code;
        flash('Progress saved · ' + code);
      } catch (e) { $('advLog').textContent = 'Could not save in this browser.'; flash('Could not save in this browser.', 'error'); }
    };
    $('advSave').onclick = function () {
      if (!st.finalSize) { $('advLog').textContent = 'Choose the final size first.'; advUi.sizes = true; renderAdvisor(); flash('Choose the final jacket size first.', 'error'); return; }
      if (!st.finalPants) { $('advLog').textContent = 'Choose the final trouser size too.'; advUi.sizes = true; renderAdvisor(); flash('Choose the final trouser size too.', 'error'); $('advPants').querySelector('.chip').focus(); return; }
      try {
        st.agreed = Object.assign({}, st.adj, st.agreed);
        st.outcome = orderReview; st.followDate = ''; st.nextStep = '';
        var code = writeFitting(true);
        advUi.base = null; renderAdvisor();
        $('advLog').textContent = 'Saved ' + code + ' in this browser.';
        flash('Fitting completed and saved · ' + code);
      } catch (e) { $('advLog').textContent = 'Could not save on this device. You can print the sheet.'; flash('Could not save on this device. You can print the sheet.', 'error'); }
    };
    if (advUi.base == null) advUi.base = advSig();
    box.oninput = box.onchange = paintDirty;
    if (st.self && $('advPhoto')) { $('advPhotoImg').src = st.self; $('advPhoto').onclick = function () { $('advPhotoDlg').showModal(); }; }
    function leave(save) {
      var go = advUi.pending;
      if (save) { try { writeFitting('draft'); } catch (e) { flash('Could not save in this browser, so nothing was switched.', 'error'); return; } }
      advUi.pending = null; advUi.base = null; if (go) go();
    }
    $('advSwitchSave').onclick = function () { leave(true); };
    $('advSwitchDiscard').onclick = function () { leave(false); };
    $('advSwitchKeep').onclick = function () { advUi.pending = null; renderAdvisor(); };
    paintStatus(); paintDirty();
    if (keep && $(keep.id)) {
      var node = $(keep.id); node.focus({ preventScroll: true });
      try { if (keep.s != null) node.setSelectionRange(keep.s, keep.e); } catch (err) {}
      if (keep.id === 'altSearch' && node.value.trim()) node.dispatchEvent(new Event('input'));
    }
    window.scrollTo({ top: scrollY, behavior: 'instant' });
    if (advUi.pending) { $('advSwitchSave').focus(); $('advSwitch').scrollIntoView({ block: 'nearest' }); }
  }

  /* ---------- stage: original catalog photography, never recoloured ---------- */
  function activeLook() {
    return D.occasions.filter(function (o) { return o.id === st.occ; })[0] || D.occasions[0];
  }
  function paintGallery() {
    var d = curDesign(), view = st.view || 'full', o = activeLook(), image = lookImage();
    /* a cloth/tie variant needs its own jacket photo; without one, Jacket only would show the original cloth, so it is hidden */
    var v = d && designVariant(d), jacket = v ? v.jacket : (d && clothPhoto(d) ? null : d && d.jacket);
    if (view === 'jacket' && !jacket) view = st.view = 'full';
    if (view === 'jacket') image = 'assets/img/' + jacket;
    $('viewJacket').hidden = !jacket;
    $('suitPhoto').setAttribute('data-view', view);
    var hero = $('suitFullImage');
    if (!hero.src || hero.getAttribute('src') !== image) hero.setAttribute('src', image);
    hero.hidden = view === 'live';
    hero.alt = (d ? d.name : o.label) + ' — ' + (d ? d.desc : o.desc);
    $('fabricSampleView').hidden = view !== 'live';
    $('fabricSample').setAttribute('style', swatch(cloth(), 520));
    $('fabricSampleName').textContent = cloth().name;
    $('fabricSampleWeave').textContent = cloth().pat ? cloth().pat + ' · ' + (cloth().season === 'all' ? 'All-season' : cap(cloth().season)) : ({ plain: 'Plain weave', herring: 'Herringbone weave', flannel: 'Brushed flannel', check: 'Checked weave', stripe: 'Striped weave' }[cloth().weave] || 'Woven fabric') + ' · ' + (cloth().season === 'all' ? 'All-season' : cap(cloth().season));
    $('viewFull').setAttribute('aria-pressed', String(view === 'full'));
    $('viewJacket').setAttribute('aria-pressed', String(view === 'jacket'));
    $('viewLive').setAttribute('aria-pressed', String(view === 'live'));
    $('viewDetail').setAttribute('aria-pressed', String(view === 'detail'));
    $('photoCaption').textContent = view === 'live' ? cloth().name + ' · fabric sample' : o.label + (st.design && d && occDesigns().length > 1 ? ' · ' + d.name : '') + ' · ' + cloth().name + (view === 'detail' ? ' · detail' : view === 'jacket' ? ' · jacket only' : '');
    $('zoomBtn').hidden = view === 'live';
    $('zoomBtn').textContent = view === 'detail' ? 'View full-resolution image' : 'Inspect full-size photo';
    $('zoomBtn').setAttribute('aria-pressed', 'false');
  }
  function setGalleryView(view) {
    st.view = view;
    paintGallery();
  }
  function paintStage() {
    if (st.self) $('youCloth').setAttribute('style', swatch(cloth(), 60));
    paintGallery();
  }

  /* ---------- tabs ---------- */
  function showTab(i) {
    st.tab = i; st.seen[i] = true;
    for (var k = 0; k < 5; k++) {
      var t = $('tab-' + k);
      t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1;
      t.classList.toggle('done', !!st.seen[k] && k !== i);
      $('p-' + k).hidden = k !== i;
    }
    $('prev').disabled = i === 0;
    $('next').hidden = i === 4;
    if (i === 4) { renderReview(true); renderAdvisor(); paintStage(); }
    updateCta();
    var p = document.querySelector('.panel').getBoundingClientRect().top;
    if (p < 0) window.scrollTo({ top: window.scrollY + p - 56, behavior: 'smooth' });
  }
  function updateCta() {
    $('cta').textContent = st.tab === 4 ? (st.code ? 'Code ' + st.code : 'Get store code') : 'Review look · ' + money(total());
  }

  function renderMonogram() {
    var value = (st.mono || '').toUpperCase();
    $('monoDisplay').textContent = value || 'AJ';
    $('monogramPreview').classList.toggle('is-placeholder', !value);
    $('monoPreviewTitle').textContent = value ? 'Monogram ' + value + ' is selected' : 'Your initials, embroidered';
    $('monoHint').textContent = value ? 'Inside jacket lining · embroidered initials · +€15' : 'Preview shown on the inside lining. Enter your initials to personalise it.';
  }

  function fixColours() {
    var r = recs();
    D.extras.forEach(function (x) { if (x.variants && st.col[x.id] && !x.variants[st.col[x.id]] && r[x.id]) st.col[x.id] = r[x.id][0]; });
  }
  function update() {
    fixColours();
    renderCloth(); renderSeason(); renderAbout(); renderStyle(); renderChange(); renderFit(); renderPassport(); renderExtras(); renderStrip(); renderMonogram();
    renderReview(st.tab === 4);
    renderAdvisor(); paintStage();
    $('total').textContent = money(total());
    $('eta').textContent = 'Ready in 2–3 weeks';
    var n = 1; D.extras.forEach(function (x) { if (st.on[x.id]) n++; });
    $('bagCount').textContent = n;
    updateCta();
    persist();
  }

  /* ---------- product gallery and stylist ---------- */
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('zoomModal').hidden) closeImageModal(); });
  $('viewFull').onclick = function () { setGalleryView('full'); };
  $('viewJacket').onclick = function () { setGalleryView('jacket'); };
  $('viewLive').onclick = function () { setGalleryView('live'); };
  $('viewDetail').onclick = function () { setGalleryView('detail'); };
  $('suitFullImage').addEventListener('load', function () { paintGallery(); });

  function openImageModal(src, alt, caption) {
    $('zoomModalImg').src = src;
    $('zoomModalImg').alt = alt;
    $('zoomCaption').textContent = caption || alt;
    $('zoomModal').classList.remove('zoomed');
    $('zoomScaleBtn').textContent = 'Zoom in';
    $('zoomScaleBtn').setAttribute('aria-pressed', 'false');
    $('zoomModal').hidden = false;
    $('zoomClose').focus();
  }
  function closeImageModal() {
    $('zoomModal').hidden = true; $('zoomModalImg').src = '';
    $('zoomModal').classList.remove('zoomed');
  }
  $('zoomClose').onclick = closeImageModal;
  $('zoomScaleBtn').onclick = function () {
    var zoomed = !$('zoomModal').classList.contains('zoomed');
    $('zoomModal').classList.toggle('zoomed', zoomed);
    $('zoomScaleBtn').textContent = zoomed ? 'Fit to screen' : 'Zoom in';
    $('zoomScaleBtn').setAttribute('aria-pressed', String(zoomed));
    var img = $('zoomModalImg');
    $('zoomCaption').textContent = zoomed
      ? 'Original image · ' + img.naturalWidth + ' × ' + img.naturalHeight + ' pixels. Scroll to inspect details.'
      : 'High-resolution original image · ' + activeLook().label + '.';
  };
  $('zoomModalImg').onclick = function () { $('zoomScaleBtn').click(); };
  $('zoomModal').addEventListener('click', function (e) { if (e.target === $('zoomModal')) closeImageModal(); });

  /* ---------- uploads ---------- */
  function clearLook() { /* Inspiration matching is handled in the stylist modal. */ }
  function readImage(file, cb) {
    if (!file || file.type.indexOf('image/') !== 0) return;
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () { cb(url, img); };
    img.src = url;
  }
  function wireUpload(btn, input, onImage) {
    btn.onclick = function () { input.click(); };
    input.onchange = function (e) { readImage(e.target.files[0], onImage); };
    ['dragenter', 'dragover'].forEach(function (ev) { btn.addEventListener(ev, function (e) { e.preventDefault(); btn.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { btn.addEventListener(ev, function (e) { e.preventDefault(); btn.classList.remove('over'); }); });
    btn.addEventListener('drop', function (e) { readImage(e.dataTransfer.files[0], onImage); });
  }
  wireUpload($('selfBtn'), $('selfFile'), function (url) {
    st.self = url;
    $('selfThumb').style.backgroundImage = 'url(' + url + ')';
    $('selfT').textContent = 'Photo added';
    $('youImg').src = url; $('you').hidden = false;
    update();
  });

  /* ---------- wiring ---------- */
  for (var k = 0; k < 5; k++) (function (k) { $('tab-' + k).onclick = function () { showTab(k); }; })(k);
  document.querySelector('.tabs').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var n = (st.tab + (e.key === 'ArrowRight' ? 1 : 4)) % 5; showTab(n); $('tab-' + n).focus();
  });
  $('prev').onclick = function () { showTab(Math.max(0, st.tab - 1)); };
  $('next').onclick = function () { showTab(Math.min(4, st.tab + 1)); };
  $('cta').onclick = function () { if (st.tab === 4) save(); else showTab(4); };
  $('bag').onclick = function () { showTab(4); };
  $('more').onclick = function () { st.all = !st.all; update(); };
  $('cp').oninput = function () { setTarget(this.value); };
  $('hex').oninput = function () { var v = this.value.trim(); if (v[0] !== '#') v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) setTarget(v); };
  $('hex').onblur = function () { this.value = st.target.toUpperCase(); };
  $('mono').oninput = function () { st.mono = this.value.replace(/[^a-z]/gi, '').slice(0, 3); this.value = st.mono.toUpperCase(); renderMonogram(); update(); };
  $('cname').oninput = function () { st.name = this.value.trim(); renderAdvisor(); };
  $('cemail').oninput = function () { st.email = this.value.trim(); renderAdvisor(); };
  $('cphone').oninput = function () { st.phone = this.value.trim(); renderAdvisor(); };
  function renderCpref() { fill('cpref', ['Email', 'Phone'].map(function (x) { return chip(x, st.cpref === x, function () { st.cpref = x; renderCpref(); renderAdvisor(); }); })); }
  renderCpref();
  $('city').onchange = function () { st.city = this.value; update(); };
  Array.prototype.forEach.call(document.querySelectorAll('.stepper[data-key]'), function (s) {
    var key = s.dataset.key, inp = $(key), bt = s.querySelectorAll('button');
    var clamp = function (v) { return Math.max(+inp.min, Math.min(+inp.max, v)); };
    bt[0].onclick = function () { st[key] = inp.value = clamp(st[key] - 1); update(); };
    bt[1].onclick = function () { st[key] = inp.value = clamp(st[key] + 1); update(); };
    inp.oninput = function () { var v = parseInt(inp.value, 10); if (v >= +inp.min && v <= +inp.max) { st[key] = v; update(); } };
    inp.onblur = function () { var v = parseInt(inp.value, 10); st[key] = inp.value = clamp(isNaN(v) ? st[key] : v); update(); };
  });

  function save() {
    try {
      var c = writeFitting(false);
      $('code').textContent = c; $('codebox').hidden = false;
    } catch (e) { $('codebox').hidden = false; $('code').textContent = 'Could not save in this browser.'; return; }
    renderReview(true); renderAdvisor(); paintStage(); updateCta();
  }
  $('save').onclick = save;
  $('copy').onclick = function () {
    var b = this, done = function (t) { b.textContent = t; setTimeout(function () { b.textContent = 'Copy'; }, 1600); };
    try { navigator.clipboard.writeText(st.code).then(function () { done('Copied'); }, function () { done('Copy failed'); }); } catch (e) { done('Copy failed'); }
  };


/* ---------- Style me: the stylist, built into the Cloth step ---------- */
  var sm = { file: null, url: null, dominant: null, palette: [], image: null, ready: Promise.resolve(null), recs: [], applied: null, history: [], busy: false };
  var SM_START = [['Summer wedding', 'light linen suit for a summer wedding'], ['First interview', 'dark suit for a first job interview'], ['Weekend travel', 'comfortable wrinkle-resistant suit for travel'], ['Black tie', 'black tuxedo for a formal evening']];
  var SM_REFINE = [['Darker', 'darker'], ['Lighter', 'lighter'], ['Cheaper', 'cheaper'], ['More relaxed', 'more relaxed'], ['More formal', 'more formal']];
  var REFINE_RX = /^(darker|lighter|cheaper|more relaxed|more formal)$/i;
  var clothPrice = function (c) { return eur(c.usd); };
  function smChips(list) { fill('smChips', list.map(function (x) { return chip(x[0], false, function () { smRun(x[1]); }); })); }
  function smSay(text) { $('smReply').textContent = text; }
  function lookOf(id) { return D.occasions.filter(function (o) { return o.id === id; })[0]; }

  /* style details from the text ("peak lapel", "patch pockets"); returns a note when the workroom rules force a change */
  function applyStyleDetails(style) {
    var keys = Object.keys(style || {}), notes = [];
    keys.forEach(function (k) { st.style[k] = style[k]; });
    if (st.style.lapel === 'peak' && st.style.shoulder === 'natural') { st.style.shoulder = 'structured'; notes.push('I switched to a structured shoulder, because peak lapels need one.'); }
    if (st.style.lapel === 'peak' && st.style.pockets === 'patch') { st.style.pockets = 'flap'; notes.push('Peak lapels do not go with patch pockets, so I chose flap pockets.'); }
    if (keys.length) st.change = '';
    return notes;
  }
  /* a nearby cloth that is darker or lighter than the target, for "darker" and "lighter" */
  function shifted(target, dir) {
    var lt = StyleEngine.luminance(target);
    var list = D.cloths.filter(function (c) { return dir < 0 ? StyleEngine.luminance(c.c) < lt - 0.025 : StyleEngine.luminance(c.c) > lt + 0.025; })
      .sort(function (a, b) { return StyleEngine.dist(target, a.c) - StyleEngine.dist(target, b.c); });
    return list.length ? list[0].c : target;
  }

  function smRun(raw) {
    smOpen(true);
    var text = Brief.normalise(raw != null ? raw : $('smText').value), typed = Brief.normalise($('smText').value);
    var refine = REFINE_RX.test(text);
    if (!text && !sm.file) { smSay('Type a line first, or add a photo.'); return; }
    if (sm.busy) return;
    /* a chip refines the last brief (not a question left in the box: "Half canvas or full canvas?" is not an instruction) */
    var brief = typed && !Brief.isQuestion(typed) ? typed : (sm.lastBrief || '');
    var message = refine ? (brief ? brief + '. ' : '') + text : text;
    /* questions are answered, not turned into a look */
    var gl = D.glossary.filter(function (g) { return g.rx.test(message); })[0];
    if (text && !refine && ((Brief.isQuestion(text) && (gl || Brief.kb(text))) || (gl && text.split(' ').length <= 4 && !Brief.parse(text).colour && !Brief.parse(text).occ))) {
      smSay(gl ? gl.term + ': ' + gl.text : Brief.kb(text)); return;
    }
    if (!refine && text) sm.lastBrief = text;
    if (!message) message = 'Use this inspiration photo to suggest a coordinated outfit and matching cloth.';
    var r = Brief.parse(message), cur = cloth();
    if (!refine && !sm.file && !Brief.summary(r, D).length) { smSay('I could not tell what you need. Try an occasion, a colour or a budget, for example “navy suit for a wedding under €900”.'); return; }
    if (r.h) st.h = r.h;
    if (r.w) st.w = r.w;
    if (r.usual) { st.usual = r.usual; st.notSure = false; } else if (r.w) st.notSure = true;
    if (r.pref) st.pref = r.pref;
    if (r.h || r.w || r.usual || r.pref) { st.size = null; st.fitMode = 'a'; }
    $('h').value = st.h; $('w').value = st.w;
    var styleNotes = applyStyleDetails(r.style);
    if (r.season) st.season = r.season; else if (!refine) st.season = null;
    if (!refine) st.budget = r.budget || null; else if (r.budget) st.budget = r.budget;
    var darker = /\b(darker|deeper|more formal)\b/i.test(message) || r.shade === 'dark', lighter = /\b(lighter|brighter|paler)\b/i.test(message) || r.shade === 'light';
    var cheaper = /\b(cheaper|lower price|less expensive|save money|affordable)\b/i.test(message), relaxed = /\b(more relaxed|relaxed|casual|less formal)\b/i.test(message);
    var occ = r.occ || st.occ, explicit = !!r.occ || refine;
    /* a refine chip (Darker, Cheaper, ...) works from the look on screen, not from an earlier inspiration photo */
    var base = r.colour || (refine ? cur.c : null) || (sm.file && sm.dominant) || StyleEngine.LOOKS[occ].colour;
    var target = base, photoColour = !!(sm.file && sm.dominant) && !refine;
    if (!r.colour && (darker || lighter)) {
      if (refine || photoColour) target = shifted(base, darker ? -1 : 1);                 /* relative to what is on screen */
      else target = StyleEngine.SHADES[darker ? 'dark' : 'light'][occ] || base;           /* "dark suit for a wedding" */
    }
    var budget = st.budget || null;
    var cheaperFrom = cheaper && (refine || !budget) ? clothPrice(cur) : null; /* "Cheaper": the reply says how much less, not the internal limit */
    if (cheaperFrom) budget = cheaperFrom - 1;
    var ctx = { occasion: occ, occasionExplicit: explicit, colourExplicit: !!r.colour || photoColour || refine, season: st.season || 'any', budget: budget, colour: target, colourName: r.colourName || StyleEngine.closestName(target), sampled: sm.file && sm.dominant && !r.colour && !refine ? sm.dominant : null, designs: D.designs.map(function (d) { return { id: d.id, occ: d.occ, name: d.name, desc: d.desc, c: d.c }; }), curColour: refine ? cur.c : null, cheaperFrom: cheaperFrom, message: message, darker: darker, lighter: lighter, relaxed: relaxed };
    sm.busy = true; $('smGo').disabled = true; smSay('Styling your look…');
    var local = StyleEngine.recommend(ctx, D.cloths, clothPrice);
    /* "Cheaper" keeps the colour: if the only cheaper cloths are a different colour, keep the look and say so */
    if (cheaperFrom && local[0] && StyleEngine.dist(byId(local[0].cloth_id).c, cur.c) > 90) {
      sm.busy = false; $('smGo').disabled = false;
      smSay('This is already the best price in this colour. For less, try a different colour.');
      return;
    }
    var aiOn = !!String(window.CUSTOM_STYLIST_AI_ENDPOINT || '').trim();
    var aiCtx = { occasion: occ, season: ctx.season, budget_eur: budget, desired_colour_hex: target, sampled_hex: ctx.sampled, user_message: message.slice(0, 1000), catalog: { looks: StyleEngine.catalogForAI().looks, fabrics: D.cloths.map(function (c) { return { id: c.id, name: c.name, hex: c.c, weave: c.weave, season: c.season, price_eur: clothPrice(c), tags: StyleEngine.CLOTH_TAGS[c.id] || [] }; }) } };
    var run = aiOn ? sm.ready.then(function (img) { return StyleEngine.callAI(message, aiCtx, img, sm.history.slice(-8), D.cloths); }) : Promise.resolve(null);
    run.then(function (remote) {
      var recs = remote ? remote.recommendations : local, reply = remote && remote.reply ? remote.reply : StyleEngine.describe(ctx, recs, D.cloths, clothPrice, !!sm.file, money);
      if (aiOn && !remote) reply = 'The AI service could not be reached, so I used private matching on this device. ' + reply;
      if (styleNotes.length) reply += ' ' + styleNotes.join(' ');
      sm.history.push({ role: 'user', text: message.slice(0, 500) }, { role: 'assistant', text: reply.slice(0, 500) });
      var reference = '';
      if (sm.image) {
        var thumbnail = document.createElement('canvas'), scale = Math.min(1, 360 / Math.max(sm.image.width, sm.image.height));
        thumbnail.width = Math.max(1, Math.round(sm.image.width * scale)); thumbnail.height = Math.max(1, Math.round(sm.image.height * scale));
        thumbnail.getContext('2d').drawImage(sm.image, 0, 0, thumbnail.width, thumbnail.height);
        reference = thumbnail.toDataURL('image/jpeg', 0.8);
      }
      sm.brief = text ? (refine ? sm.lastBrief || message : message) : ''; sm.reference = reference; /* the customer's own words, not the chip */
      sm.recs = recs; sm.busy = false; $('smGo').disabled = false;
      sm.shown = (sm.shown || []).concat(recs.map(function (r) { return r.cloth_id; })); /* everything the customer has seen, for the advisor */
      smSay(reply);
      applyRec(recs[0], true);
      smChips(SM_REFINE);
    });
  }

  function recDesign(rec) { return (rec.design_id && D.designs.filter(function (d) { return d.id === rec.design_id; })[0]) || bestDesign(rec.look_id, byId(rec.cloth_id).c); }
  function smCards() {
    var box = $('smResults'); box.hidden = !sm.recs.length; box.innerHTML = '';
    sm.recs.forEach(function (rec, i) {
      var look = lookOf(rec.look_id), meta = StyleEngine.LOOKS[rec.look_id], c = byId(rec.cloth_id), dz = recDesign(rec);
      var on = sm.applied && sm.applied.look_id === rec.look_id && sm.applied.cloth_id === rec.cloth_id && (sm.applied.design_id || '') === (rec.design_id || '');
      var card = el('div', 'sm-card' + (on ? ' on' : ''));
      var img = el('img', 'look'); img.src = dz ? 'assets/img/' + dz.image : 'assets/img/catalog/' + look.image; img.alt = dz ? dz.name : meta.title; img.loading = 'lazy';
      var body = el('div', 'sm-body');
      body.appendChild(el('span', 'tag', i === 0 ? 'BEST MATCH' : 'ALTERNATIVE'));
      body.appendChild(el('h3', '', dz ? dz.name : meta.title));
      var cl = el('div', 'sm-cloth'); var dot = el('i'); dot.style.background = c.c; cl.appendChild(dot); cl.appendChild(document.createTextNode(c.name + ' · ' + money(clothPrice(c)))); body.appendChild(cl);
      body.appendChild(el('span', 'sm-why', rec.reason));
      var btn = el('button', 'sm-use', on ? 'Applied ✓' : 'Use this look'); btn.type = 'button';
      if (!on) btn.onclick = function () { applyRec(rec); };
      body.appendChild(btn);
      card.appendChild(img); card.appendChild(body); box.appendChild(card);
    });
  }
  /* put a recommended look on the stage: occasion photo, cloth and the accessory colours that go with it */
  function applyRec(rec, quiet) {
    if (!rec) return;
    var c = byId(rec.cloth_id); if (!c) return;
    var bd = recDesign(rec);
    st.occ = rec.look_id; st.design = bd ? bd.id : null; st.cloth = c.id; st.target = c.c; st.view = 'full'; st.shoe = bd && bd.shoes || null;
    var acc = StyleEngine.ACCESSORIES[rec.look_id] || {};
    Object.keys(acc).forEach(function (k) { st.col[k] = acc[k]; });
    st.brief = sm.brief || ''; st.reference = sm.reference || '';
    sm.applied = rec; st.saved = false;
    update(); smCards();
    try { window.dispatchEvent(new CustomEvent('customstudio:apply-stylist-look', { detail: { occasionId: rec.look_id, lookId: rec.look_id, fabricId: c.id, fabricName: c.name, colourHex: c.c } })); } catch (e) {}
  }

  /* inspiration photo: colours are read in the browser; a small copy is sent only if a protected AI endpoint is configured */
  /* the colours found in the photo are choices: tap one and the looks are re-ranked around it */
  function smDots() {
    fill('smColours', sm.palette.map(function (h, i) {
      var b = el('button', 'sm-dot'); b.type = 'button'; b.style.background = h; b.title = 'Use this colour'; b.setAttribute('aria-label', 'Use this colour from your photo');
      b.setAttribute('aria-pressed', String(sm.pick ? sm.pick === h : i === 0));
      b.onclick = function () { sm.pick = h; sm.dominant = StyleEngine.liftDark(h); smDots(); smRun($('smText').value.trim() ? $('smText').value : ''); };
      return b;
    }));
  }
  function smSetImage(file) {
    var err = StyleEngine.checkFile(file); if (err) { smSay(err); return; }
    var reader = new FileReader();
    reader.onerror = function () { smSay('The image could not be opened. Try another file.'); };
    reader.onload = function () {
      var img = new Image();
      img.onerror = function () { smSay('The image could not be decoded. Try a JPG or PNG.'); };
      img.onload = function () {
        if (sm.url) URL.revokeObjectURL(sm.url);
        sm.file = file; sm.url = URL.createObjectURL(file); sm.image = img;
        var p = StyleEngine.palette(img); sm.dominant = p.dominant; sm.palette = p.palette;
        $('smThumb').src = sm.url; $('smPhotoRow').hidden = false;
        sm.pick = null; smDots();
        sm.ready = StyleEngine.compress(img).catch(function () { return null; });
        smRun($('smText').value.trim() ? $('smText').value : '');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
  function smClearImage() {
    if (sm.url) URL.revokeObjectURL(sm.url);
    sm.file = null; sm.url = null; sm.image = null; sm.dominant = null; sm.palette = []; sm.ready = Promise.resolve(null);
    $('smFile').value = ''; $('smPhotoRow').hidden = true; $('smThumb').removeAttribute('src');
  }
  $('smPhoto').onclick = function () { $('smFile').click(); };
  $('smFile').onchange = function (e) { smSetImage(e.target.files && e.target.files[0]); };
  $('smRemove').onclick = smClearImage;
  $('smGo').onclick = function () { smRun(); };
  $('smText').onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); smRun(); } };
  ['dragenter', 'dragover'].forEach(function (ev) { $('styleMe').addEventListener(ev, function (e) { e.preventDefault(); }); });
  $('styleMe').addEventListener('drop', function (e) { e.preventDefault(); smSetImage(e.dataTransfer.files && e.dataTransfer.files[0]); });
  function smOpen(on) { $('smBody').hidden = !on; $('smToggle').setAttribute('aria-expanded', String(on)); $('styleMe').classList.toggle('open', on); }
  $('smToggle').onclick = function () { var on = $('smBody').hidden; smOpen(on); if (on) $('smText').focus(); };
  $('smFile').addEventListener('change', function () { smOpen(true); });
  $('goStyleMe').onclick = function () { smOpen(true); showTab(0); setTimeout(function () { $('styleMe').scrollIntoView({ behavior: 'smooth', block: 'start' }); $('smText').focus(); }, 60); };
  smChips(SM_START);


  /* measure yourself */
  var setChest = function (v) {
    if (v == null || isNaN(v)) st.chest = null; else st.chest = Math.max(80, Math.min(140, Math.round(v)));
    $('chest').value = st.chest || ''; update();
  };
  $('chestMinus').onclick = function () { setChest((st.chest || 101) - 1); };
  $('chestPlus').onclick = function () { setChest((st.chest || 99) + 1); };
  $('chest').onchange = function () { var v = parseInt(this.value, 10); setChest(isNaN(v) ? null : v); };
  $('fbMeasure').onclick = function () { st.notSure = true; st.fitMode = 'a'; update(); $('measureHelp').open = true; $('measureHelp').scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  /* fitting to calendar */
  var icsDate = function (d) { var p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + 'T' + p(d.getHours()) + p(d.getMinutes()) + '00'; };
  var icsText = function (t) { return String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); };
  $('cal').onclick = function () {
    var d = SLOT_DATE[st.slot]; if (!d) return;
    var end = new Date(d.getTime() + 20 * 60000);
    var desc = 'Cloth: ' + cloth().name + '\nSize: ' + (st.size ? sizeText() : 'to be confirmed') + (st.mono.trim() ? '\nMonogram: ' + st.mono.toUpperCase() : '') + (st.code ? '\nStore code: ' + st.code : '');
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Custom Made Studio//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + Date.now() + '@custom-made-studio', 'DTSTAMP:' + icsDate(new Date()), 'DTSTART:' + icsDate(d), 'DTEND:' + icsDate(end),
      'SUMMARY:' + icsText('Suit fitting'), 'LOCATION:' + icsText(st.city + ' store'), 'DESCRIPTION:' + icsText(desc),
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Suit fitting', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), a = document.createElement('a');
    a.href = url; a.download = 'suit-fitting.ics'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  };

  /* Open the original, full-resolution catalog photo in the image viewer. */
  $('zoomBtn').onclick = function () {
    var o = activeLook();
    openImageModal($('suitFullImage').src, o.label + ' — full-resolution catalog photograph', o.desc + '. This is the original image used for this look.');
  };

  /* Size Passport */
  $('ppSave').onchange = function () {
    if (this.checked && st.size) store('cm-passport-v2', snap(PASS)); else store('cm-passport-v2', null);
    renderPassport();
  };
  $('ppGo').onclick = function () { var p = load('cm-passport-v2'); if (!p) return; PASS.forEach(function (k) { if (p[k] != null) st[k] = p[k]; }); st.fitMode = 'd'; update(); };

  /* Resume and share */
  function applySaved(o) { KEEP.forEach(function (k) { if (o[k] !== undefined) st[k] = o[k]; }); }
  $('resumeYes').onclick = function () { canSave = true; var o = load('cm-state-v2'); if (o) { applySaved(o); st.fitMode = st.size ? 'd' : 'a'; } $('resumeBar').hidden = true; update(); };
  $('resumeNo').onclick = function () { canSave = true; store('cm-state-v2', null); $('resumeBar').hidden = true; };
  function encodeState() { return btoa(unescape(encodeURIComponent(JSON.stringify(snap(KEEP))))); }
  function decodeState(t) { return JSON.parse(decodeURIComponent(escape(atob(t)))); }
  $('share').onclick = function () {
    var url = location.origin + location.pathname + '?d=' + encodeURIComponent(encodeState());
    $('shareNote').textContent = url;
    try { navigator.clipboard.writeText(url).then(function () { $('shareNote').textContent = 'Link copied. ' + url; }, function () {}); } catch (e) {}
  };


  /* Find my size flow */
  var pick = function (mode) { st.size = st.sug.size; st.group = st.sug.group; st.level = st.sug.level; st.fitMode = 'd'; if (mode === 'book') st.book = true; if (mode === 'walk') st.walk = true; update(); };
  $('fitGo').onclick = function () { st.sug = suggest(); st.fitMode = 'b'; update(); };
  $('fitSkip').onclick = function () { st.group = groupFor(st.h); st.fitMode = 'c'; update(); };
  $('backA').onclick = $('backA2').onclick = $('chChange').onclick = function () { st.fitMode = 'a'; update(); };
  $('toGrid').onclick = function () { st.group = st.sug ? st.sug.group : groupFor(st.h); st.fitMode = 'c'; update(); };
  $('useSize').onclick = function () { pick(); };
  $('fbBook').onclick = function () { pick('book'); };
  $('fbWalk').onclick = function () { pick('walk'); };
  $('storeBook').onclick = function () { st.book = !st.book; if (!st.book) st.slot = null; update(); };
  $('storeWalk').onclick = function () { st.walk = !st.walk; update(); };

  $('modeClient').onclick = function () { setMode('client'); };
  $('modeAdvisor').onclick = function () { setMode('advisor'); };
  buildAdjustments();
  resetOutfit();
  showTab(0);
  update();
  /* shareable views: ?occ=wed&tab=4 */
  var q = new URLSearchParams(location.search);
  var consultCode = q.get('consult');
  var consultation = /^CM-[A-Z2-9]{4,6}$/.test(consultCode || '') && load(fittingPrefix + consultCode);
  var resumable = null;
  if (consultation) {
    Object.assign(st, consultation);
    st.mode = 'client'; st.fitMode = st.size ? 'd' : 'a';
    ['h','w','chest','mono','city'].forEach(function (k) { $(k).value = st[k] == null ? '' : st[k]; });
    $('cname').value = st.name || ''; $('cemail').value = st.email || ''; $('cphone').value = st.phone || '';
    $('code').textContent = st.code; $('codebox').hidden = false;
    buildAdjustments(); renderCpref();
    $('modeAdvisor').textContent = 'Return to fitting';
    $('modeAdvisor').onclick = function () {
      if (st.mode === 'advisor') return;
      try { writeFitting('draft'); setMode('advisor'); }
      catch (e) { alert('Could not save this consultation in this browser.'); }
    };
  } else if (q.get('d')) { try { var sh = decodeState(q.get('d')); applySaved(sh); st.fitMode = sh.size ? 'd' : 'a'; } catch (e) {} }
  else if (!q.get('occ') && !q.get('tab') && !q.get('fit') && !q.get('mode')) { resumable = load('cm-state-v2'); if (resumable) $('resumeBar').hidden = false; }
  if (!resumable && !consultation) canSave = true;
  if (q.get('occ') && D.occasions.some(function (o) { return o.id === q.get('occ'); })) applyOccasion(q.get('occ'));
  if (q.get('design') && D.designs.some(function (d) { return d.id === q.get('design'); })) { var qd = D.designs.filter(function (d) { return d.id === q.get('design'); })[0]; if (!q.get('occ')) applyOccasion(qd.occ); pickDesign(qd); }
  if (q.get('cloth') && byId(q.get('cloth'))) { st.cloth = q.get('cloth'); st.target = byId(q.get('cloth')).c; resetOutfit(); }
  if (q.get('fit') === 'b') { if (q.get('weight')) { st.notSure = true; st.w = +q.get('weight'); } if (q.get('h')) st.h = +q.get('h'); st.sug = suggest(); st.fitMode = 'b'; }
  if (q.get('fit') === 'd') { st.sug = suggest(); st.size = st.sug.size; st.group = st.sug.group; st.level = st.sug.level; st.fitMode = 'd'; }
  if (q.get('tab')) showTab(Math.max(0, Math.min(4, parseInt(q.get('tab'), 10) || 0)));
  update();
  if (q.get('brief')) { $('smText').value = q.get('brief'); smRun(); }
  if (q.get('mode') === 'advisor') setMode('advisor');
  if (q.get('view') === 'sample') setGalleryView('live');
  if (q.get('view') === 'detail') setGalleryView('detail');
  if (q.get('view') === 'jacket') setGalleryView('jacket');
  if (q.get('stylist') === 'open') $('goStyleMe').click();
  if (q.get('measure')) { st.notSure = true; st.chest = 100; st.fitMode = 'a'; update(); $('measureHelp').open = true; }
  paintStage();
  if (st.tab === 4) renderReview(true);
})();

