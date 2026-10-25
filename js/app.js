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
    tab: 0, seen: { 0: true }, view: 'full', occ: 'wed', target: '#b9a68a', cloth: 'sand', all: false,
    style: { shoulder: 'natural', lapel: 'notch', closure: 'sb2', pockets: 'flap', canvas: 'half', button: 'horn' },
    lining: '#1f2d4d', mono: '',
    h: 180, w: 78, pref: 'Regular', usual: 50, notSure: false, size: null, group: 'regular', level: null, sug: null, fitMode: 'a', mode: 'client', finalSize: null, notes: '', book: false, walk: false, adj: { sleeve: 0, jlen: 0, waist: 0, tlen: 0, rise: 0 },
    self: null, city: 'Amsterdam', slot: null,
    on: {}, col: {}, name: '', email: '', phone: '', cpref: 'Email', code: null, season: null, budget: null, boost: [], change: '', chest: null, chat: []
  };
  var byId = function (id) { return D.cloths.filter(function (c) { return c.id === id; })[0]; };
  var cloth = function () { return byId(st.cloth); };
  /* euro price: anchored on the three Austrian prices seen live (623, 523, 1,223), interpolated between them */
  var EUR_PTS = [[673, 523], [823, 623], [1523, 1223]];
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
  function resetOutfit() { var r = recs(); ['shirt', 'tie', 'square', 'shoes'].forEach(function (k) { st.col[k] = r[k][0]; }); }

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
    D.extras.forEach(function (x) { if (st.on[x.id]) out.push([x.name + (st.col[x.id] ? ', ' + cname(st.col[x.id]).toLowerCase() : ''), x.price]); });
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
  function applyOccasion(id) {
    var o = D.occasions.filter(function (x) { return x.id === id; })[0];
    st.occ = id; st.target = o.c; st.view = 'full'; clearLook();
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
  function buildAdjustments(target) {
    var box = target || $('adjs'); box.innerHTML = '';
    D.adjustments.forEach(function (a) {
      var row = el('div', 'adj');
      row.appendChild(el('span', '', a.label));
      var s = el('div', 'stepper');
      s.innerHTML = '<button type="button" aria-label="Shorter">−</button><label><input type="text" inputmode="decimal" value="0" aria-label="' + a.label + ' in cm"><span>cm</span></label><button type="button" aria-label="Longer">+</button>';
      var inp = s.querySelector('input'), bt = s.querySelectorAll('button');
      var cur = st.adj[a.key] || 0; inp.value = cur > 0 ? '+' + cur : String(cur);
      var set = function (v) { v = Math.max(-4, Math.min(4, Math.round(v * 2) / 2)); st.adj[a.key] = v; inp.value = v > 0 ? '+' + v : String(v); update(); };
      bt[0].onclick = function () { set(st.adj[a.key] - 0.5); };
      bt[1].onclick = function () { set(st.adj[a.key] + 0.5); };
      inp.onchange = function () { var v = parseFloat(inp.value.replace(',', '.')); set(isNaN(v) ? 0 : v); };
      row.appendChild(s); box.appendChild(row);
    });
  }

  /* ---------- extras ---------- */
  function renderExtras() {
    var r = recs();
    fill('extras', D.extras.map(function (x) {
      var on = !!st.on[x.id], card = el('div', 'card extra' + (on ? ' on' : ''));
      var selectedImage = x.variants && st.col[x.id] && x.variants[st.col[x.id]] ? x.variants[st.col[x.id]] : x.image;
      var img = el('button', 'img'); img.type = 'button'; img.setAttribute('aria-pressed', String(on)); img.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + x.name);
      img.style.border = '0'; img.style.padding = '0'; img.style.cursor = 'pointer';
      img.innerHTML = '<img class="extra-product-photo" src="assets/img/extras/' + selectedImage + '" alt="' + x.name + (st.col[x.id] ? ' in ' + cname(st.col[x.id]) : ' product reference') + '" loading="lazy">' + ((x.id === 'vest' || x.id === 'trs2') ? '<span class="cloth-reference-swatch" style="' + swatch(cloth(), 75) + '"></span>' : '') + '<span class="check">' + (on ? '✓' : '+') + '</span>';
      img.onclick = function () { st.on[x.id] = !on; update(); };
      card.appendChild(img);
      card.appendChild(el('span', 'nm', x.name));
      var detail = st.col[x.id] ? cname(st.col[x.id]) + (st.col[x.id] === (r[x.id] || [])[0] ? ' · recommended colour' : '') : (x.detail || 'Pairs with your selected look');
      if (x.id === 'vest' || x.id === 'trs2') detail = (x.detail || 'Style reference') + ' · cut from ' + cloth().name;
      card.appendChild(el('span', 'sub', detail));
      card.appendChild(el('span', 'pc', money(x.price)));
      if (r[x.id]) {
        var o = el('div', 'opts');
        r[x.id].forEach(function (c) { o.appendChild(dot(c, st.col[x.id] === c, x.name + ' in ' + cname(c), function () { st.col[x.id] = c; st.on[x.id] = true; update(); }, true)); });
        card.appendChild(o);
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
    if (withShot) { lastShot = 'assets/img/catalog/' + activeLook().image; }
    var items = [{ img: lastShot ? '<img src="' + lastShot + '" alt="">' : '<span class="sw" style="' + swatch(c, 120) + '"></span>', nm: activeLook().label + ' look', sub: c.name + '. ' + styleText(), pc: eur(c.usd) }];
    D.extras.forEach(function (x) {
      if (st.on[x.id]) {
        var itemImage = x.variants && st.col[x.id] && x.variants[st.col[x.id]] ? x.variants[st.col[x.id]] : x.image;
        var itemSub = st.col[x.id] ? cname(st.col[x.id]) : (x.detail || 'Selected extra');
        if (x.id === 'vest' || x.id === 'trs2') itemSub = (x.detail || 'Style reference') + ' · cut from ' + c.name;
        items.push({ img: '<img class="review-product-photo" src="assets/img/extras/' + itemImage + '" alt="">', nm: x.name, sub: itemSub, pc: x.price });
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
  var KEEP = ['chest', 'occ', 'target', 'cloth', 'season', 'budget', 'boost', 'style', 'lining', 'mono', 'h', 'w', 'pref', 'usual', 'notSure', 'size', 'group', 'level', 'adj', 'book', 'walk', 'slot', 'city', 'on', 'col'];
  function snap(keys) { var o = {}; keys.forEach(function (k) { o[k] = st[k]; }); return JSON.parse(JSON.stringify(o)); }
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  var PASS = ['chest', 'h', 'w', 'pref', 'usual', 'notSure', 'size', 'group', 'level', 'adj'];
  var saveTimer = 0, canSave = false; /* held until we know whether a saved session is waiting */
  function persist() { if (!canSave) return; clearTimeout(saveTimer); saveTimer = setTimeout(function () { store('cm-state-v2', snap(KEEP)); }, 400); }
  function renderPassport() {
    var p = load('cm-passport-v2');
    $('ppUse').hidden = !(p && p.size && st.fitMode === 'a');
    if (p && p.size) $('ppText').textContent = 'Your saved size: ' + sizeLabel(p.size, p.group) + ' ' + cap(p.group);
    $('ppSave').checked = !!p;
  }

  /* ---------- advisor mode: the fitting sheet ---------- */
  var FITLOG = 'cm-fitlog-v1';
  function fitStats() {
    var log = load(FITLOG) || [], hit = log.filter(function (x) { return x.sug === x.final; }).length;
    return log.length ? log.length + (log.length === 1 ? ' fitting' : ' fittings') + ' logged. The suggested size matched in ' + hit + '.' : 'No fittings logged yet.';
  }
  function setMode(m) {
    st.mode = m; var adv = m === 'advisor';
    document.body.classList.toggle('adv', adv);
    $('advisorView').hidden = !adv;
    $('modeClient').setAttribute('aria-pressed', String(!adv)); $('modeAdvisor').setAttribute('aria-pressed', String(adv));
    if (adv) renderAdvisor();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function scheduleHtml() {
    var day = (st.slot || SLOTS[0]).split(',')[0];
    var rows = SLOTS.filter(function (l) { return l.split(',')[0] === day; }).map(function (l) {
      var t = l.split(',')[1].trim(), mine = st.slot === l, booked = SLOT_BOOKED[l];
      return '<div class="' + (mine ? 'mine' : booked ? 'busy' : 'free') + '"><span class="t">' + t + '</span><span>' + (mine ? (st.name || 'This client') : booked ? SLOT_WHO[l] : 'Open') + '</span><span class="st">' + (mine ? 'This client' : booked ? 'Booked' : 'Free') + '</span></div>';
    }).join('');
    return '<h3>Schedule · ' + day + ' <span class="muted" style="font-weight:400">(sample)</span></h3><div class="sched">' + rows + '</div>';
  }
  function contactHtml() {
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); };
    var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.email), okTel = /^[+0-9][0-9 ()-]{6,}$/.test(st.phone);
    var lines = '';
    if (st.email) lines += '<div><span>Email' + (st.cpref === 'Email' ? ' · preferred' : '') + '</span>' + (okMail ? '<a href="mailto:' + esc(st.email) + '">' + esc(st.email) + '</a>' : esc(st.email)) + '</div>';
    if (st.phone) lines += '<div><span>Phone' + (st.cpref === 'Phone' ? ' · preferred' : '') + '</span>' + (okTel ? '<a href="tel:' + esc(st.phone.replace(/[^+0-9]/g, '')) + '">' + esc(st.phone) + '</a>' : esc(st.phone)) + '</div>';
    return '<h3>Contact</h3>' + (lines ? '<div class="contact-lines">' + lines + '</div>' : '<p class="muted small">No contact details yet. The client adds them in Review.</p>');
  }
  function renderAdvisor() {
    if (!document.body.classList.contains('adv')) return;
    var box = $('advisorView'), c = cloth(), shot = 'assets/img/catalog/' + activeLook().image, sg = suggest(), g = st.group || sg.group;
    var ex = D.extras.filter(function (x) { return st.on[x.id]; }).map(function (x) { return x.name + (st.col[x.id] ? ' (' + cname(st.col[x.id]).toLowerCase() + ')' : ''); });
    var checks = ['Pull ' + c.name + ' from the cloth book'];
    if (!st.size) checks.push('No size chosen yet. Measure and find a starting size by try-on');
    else if (st.level === 'Low') checks.push('Low confidence on ' + sizeText() + '. Measure before the fitting');
    else checks.push('Try on ' + sizeText() + ' (' + (st.level || 'medium').toLowerCase() + ' confidence)');
    D.adjustments.forEach(function (a) { var v = st.adj[a.key]; if (v) checks.push(a.label + ' ' + (v > 0 ? '+' : '') + v + ' cm requested'); });
    if (ex.length) checks.push('Have ready: ' + ex.join(', ').toLowerCase());
    if (st.mono.trim()) checks.push('Embroider initials ' + st.mono.toUpperCase() + ' inside the jacket lining');
    var when = st.slot ? st.slot + ', ' + st.city : st.walk ? 'Walk-in' : 'No appointment yet';
    var kv = function (k, v, wide) { return '<div' + (wide ? ' class="wide"' : '') + '><span>' + k + '</span>' + v + '</div>'; };
    box.innerHTML =
      '<div class="fitsheet">' +
      '<div class="sheet-top"><div><h2>Fitting sheet</h2><p class="muted">' + (st.name || 'Guest') + ' · ' + when + '</p></div><span class="code-pill">' + (st.code || 'Preview') + '</span></div>' +
      '<div class="sheet-look"><div class="look" style="background-image:url(' + shot + ')"></div><div class="kv">' +
        kv('Cloth', c.name, true) + kv('Style', styleText(), true) + kv('Extras', ex.length ? ex.join(', ') : 'None', true) + kv('Total', money(total())) + kv('Ready in', '2–3 weeks') + '</div></div>' +
      '<div>' + contactHtml() + '</div><div>' + scheduleHtml() + '</div>' +
      '<div><h3>Client</h3><div class="kv">' + kv('Height and weight', st.h + ' cm, ' + st.w + ' kg') + kv('Usual size', st.notSure ? 'Not sure' + (st.chest ? ', chest ' + st.chest + ' cm' : '') : String(st.usual)) + kv('Fit preference', st.pref) + kv('Photo', st.self ? 'Provided' : 'None') + '</div></div>' +
      '<div><h3>Size</h3><div class="sug"><b>' + sizeLabel(sg.size, sg.group) + ' ' + cap(sg.group) + '</b><span class="pill ' + sg.level.toLowerCase() + '">' + sg.level + ' confidence</span><p>' + sg.text + '</p></div>' +
        '<h3 style="margin-top:16px">Final size</h3><div class="chips" id="advSizes"></div><p class="cmp" id="advCmp"></p></div>' +
      '<div><h3>Adjustments agreed</h3><div class="adjs" id="advAdjs"></div></div>' +
      '<div><h3>Check first</h3><ul class="adv-list">' + checks.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
      '<div><h3>Notes</h3><textarea id="advNotes" placeholder="Shoulders, posture, anything for the workroom" aria-label="Fitting notes"></textarea></div>' +
      '<div class="sheet-actions adv-noprint"><button type="button" class="btn" id="advSave">Save fitting</button><button type="button" class="btn ghost" id="advPrint">Print sheet</button></div>' +
      '<p class="adv-log adv-noprint" id="advLog" aria-live="polite">' + fitStats() + '</p></div>';
    fill('advSizes', D.sizes.map(function (x) { return chip(sizeLabel(x, g), st.finalSize === x, function () { st.finalSize = st.finalSize === x ? null : x; renderAdvisor(); }); }));
    var cmp = $('advCmp');
    if (st.finalSize) { var same = st.finalSize === sg.size; cmp.className = 'cmp ' + (same ? 'ok' : 'diff'); cmp.textContent = same ? 'Matches the suggestion.' : 'Differs from the suggestion (' + sizeLabel(sg.size, g) + ' suggested, ' + sizeLabel(st.finalSize, g) + ' final).'; }
    buildAdjustments($('advAdjs'));
    $('advNotes').value = st.notes || ''; $('advNotes').oninput = function () { st.notes = this.value; };
    $('advPrint').onclick = function () { window.print(); };
    $('advSave').onclick = function () {
      if (!st.finalSize) { $('advLog').textContent = 'Choose the final size first.'; return; }
      var log = load(FITLOG) || []; log.push({ sug: sg.size, final: st.finalSize, group: g, date: new Date().toISOString().slice(0, 10) }); store(FITLOG, log);
      $('advLog').textContent = 'Saved. ' + fitStats();
    };
  }

  /* ---------- stage: original catalog photography, never recoloured ---------- */
  function activeLook() {
    return D.occasions.filter(function (o) { return o.id === st.occ; })[0] || D.occasions[0];
  }
  function paintGallery() {
    var view = st.view || 'full', o = activeLook(), image = 'assets/img/catalog/' + o.image;
    $('suitPhoto').setAttribute('data-view', view);
    var hero = $('suitFullImage');
    if (!hero.src || hero.getAttribute('src') !== image) hero.setAttribute('src', image);
    hero.hidden = view === 'live';
    hero.alt = o.label + ' — ' + o.desc;
    $('fabricSampleView').hidden = view !== 'live';
    $('fabricSample').setAttribute('style', swatch(cloth(), 520));
    $('fabricSampleName').textContent = cloth().name;
    $('fabricSampleWeave').textContent = ({ plain: 'Plain weave', herring: 'Herringbone weave', flannel: 'Brushed flannel', check: 'Checked weave', stripe: 'Striped weave' }[cloth().weave] || 'Woven fabric') + ' · ' + (cloth().season === 'all' ? 'All-season' : cap(cloth().season));
    $('viewFull').setAttribute('aria-pressed', String(view === 'full'));
    $('viewLive').setAttribute('aria-pressed', String(view === 'live'));
    $('viewDetail').setAttribute('aria-pressed', String(view === 'detail'));
    $('photoCaption').textContent = view === 'live' ? cloth().name + ' · fabric sample' : o.label + ' · ' + cloth().name + (view === 'detail' ? ' · detail' : '');
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
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c = 'CM-';
    for (var i = 0; i < 4; i++) c += a[Math.floor(Math.random() * a.length)];
    st.code = c; $('code').textContent = c; $('codebox').hidden = false;
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
    var message = refine ? (typed ? typed + '. ' : '') + text : text;
    /* questions are answered, not turned into a look */
    var gl = D.glossary.filter(function (g) { return g.rx.test(message); })[0];
    if (text && !refine && ((Brief.isQuestion(text) && (gl || Brief.kb(text))) || (gl && text.split(' ').length <= 4))) {
      smSay(gl ? gl.term + ': ' + gl.text : Brief.kb(text)); return;
    }
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
    var occ = r.occ || st.occ, explicit = !!r.occ;
    var base = r.colour || (sm.file && sm.dominant) || (refine ? cur.c : null) || StyleEngine.LOOKS[occ].colour;
    var target = base, photoColour = !!(sm.file && sm.dominant);
    if (!r.colour && (darker || lighter)) {
      if (refine || photoColour) target = shifted(base, darker ? -1 : 1);                 /* relative to what is on screen */
      else target = StyleEngine.SHADES[darker ? 'dark' : 'light'][occ] || base;           /* "dark suit for a wedding" */
    }
    var budget = st.budget || null;
    if (cheaper && (refine || !budget)) budget = clothPrice(cur) - 1;
    var ctx = { occasion: occ, occasionExplicit: explicit, colourExplicit: !!r.colour || photoColour || refine, season: st.season || 'any', budget: budget, colour: target, colourName: r.colourName || StyleEngine.closestName(target), sampled: sm.file && sm.dominant && !r.colour ? sm.dominant : null, message: message, darker: darker, lighter: lighter, relaxed: relaxed };
    sm.busy = true; $('smGo').disabled = true; smSay('Styling your look…');
    var local = StyleEngine.recommend(ctx, D.cloths, clothPrice);
    var aiOn = !!String(window.CUSTOM_STYLIST_AI_ENDPOINT || '').trim();
    var aiCtx = { occasion: occ, season: ctx.season, budget_eur: budget, desired_colour_hex: target, sampled_hex: ctx.sampled, user_message: message.slice(0, 1000), catalog: { looks: StyleEngine.catalogForAI().looks, fabrics: D.cloths.map(function (c) { return { id: c.id, name: c.name, hex: c.c, weave: c.weave, season: c.season, price_eur: clothPrice(c), tags: StyleEngine.CLOTH_TAGS[c.id] || [] }; }) } };
    var run = aiOn ? sm.ready.then(function (img) { return StyleEngine.callAI(message, aiCtx, img, sm.history.slice(-8), D.cloths); }) : Promise.resolve(null);
    run.then(function (remote) {
      var recs = remote ? remote.recommendations : local, reply = remote && remote.reply ? remote.reply : StyleEngine.describe(ctx, recs, D.cloths, clothPrice, !!sm.file, money);
      if (aiOn && !remote) reply = 'The AI service could not be reached, so I used private matching on this device. ' + reply;
      if (styleNotes.length) reply += ' ' + styleNotes.join(' ');
      sm.history.push({ role: 'user', text: message.slice(0, 500) }, { role: 'assistant', text: reply.slice(0, 500) });
      sm.recs = recs; sm.busy = false; $('smGo').disabled = false;
      smSay(reply);
      applyRec(recs[0], true);
      smChips(SM_REFINE);
    });
  }

  function smCards() {
    var box = $('smResults'); box.hidden = !sm.recs.length; box.innerHTML = '';
    sm.recs.forEach(function (rec, i) {
      var look = lookOf(rec.look_id), meta = StyleEngine.LOOKS[rec.look_id], c = byId(rec.cloth_id);
      var on = sm.applied && sm.applied.look_id === rec.look_id && sm.applied.cloth_id === rec.cloth_id;
      var card = el('div', 'sm-card' + (on ? ' on' : ''));
      var img = el('img', 'look'); img.src = 'assets/img/catalog/' + look.image; img.alt = meta.title; img.loading = 'lazy';
      var body = el('div', 'sm-body');
      body.appendChild(el('span', 'tag', i === 0 ? 'BEST MATCH' : 'ALTERNATIVE'));
      body.appendChild(el('h3', '', meta.title));
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
    st.occ = rec.look_id; st.cloth = c.id; st.target = c.c; st.view = 'full';
    var acc = StyleEngine.ACCESSORIES[rec.look_id] || {};
    Object.keys(acc).forEach(function (k) { st.col[k] = acc[k]; });
    sm.applied = rec; st.saved = false;
    update(); smCards();
    try { window.dispatchEvent(new CustomEvent('customstudio:apply-stylist-look', { detail: { occasionId: rec.look_id, lookId: rec.look_id, fabricId: c.id, fabricName: c.name, colourHex: c.c } })); } catch (e) {}
  }

  /* inspiration photo: colours are read in the browser; a small copy is sent only if a protected AI endpoint is configured */
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
        fill('smColours', p.palette.map(function (h) { var sp = el('span'); sp.style.background = h; sp.title = h; return sp; }));
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
  var resumable = null;
  if (q.get('d')) { try { var sh = decodeState(q.get('d')); applySaved(sh); st.fitMode = sh.size ? 'd' : 'a'; } catch (e) {} }
  else if (!q.get('occ') && !q.get('tab') && !q.get('fit') && !q.get('mode')) { resumable = load('cm-state-v2'); if (resumable) $('resumeBar').hidden = false; }
  if (!resumable) canSave = true;
  if (q.get('occ') && D.occasions.some(function (o) { return o.id === q.get('occ'); })) applyOccasion(q.get('occ'));
  if (q.get('fit') === 'b') { if (q.get('weight')) { st.notSure = true; st.w = +q.get('weight'); } if (q.get('h')) st.h = +q.get('h'); st.sug = suggest(); st.fitMode = 'b'; }
  if (q.get('fit') === 'd') { st.sug = suggest(); st.size = st.sug.size; st.group = st.sug.group; st.level = st.sug.level; st.fitMode = 'd'; }
  if (q.get('tab')) showTab(Math.max(0, Math.min(4, parseInt(q.get('tab'), 10) || 0)));
  update();
  if (q.get('brief')) { $('smText').value = q.get('brief'); smRun(); }
  if (q.get('mode') === 'advisor') setMode('advisor');
  if (q.get('view') === 'sample') setGalleryView('live');
  if (q.get('view') === 'detail') setGalleryView('detail');
  if (q.get('stylist') === 'open') $('goStyleMe').click();
  if (q.get('measure')) { st.notSure = true; st.chest = 100; st.fitMode = 'a'; update(); $('measureHelp').open = true; }
  paintStage();
  if (st.tab === 4) renderReview(true);
})();
