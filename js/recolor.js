/* Recolours the real jacket photo in the browser.
   Inputs: the photo, a de-striped luminance copy, and masks (R jacket, G tie, B pocket square; separate shirt mask).
   The jacket keeps the photo's own folds and shadows; only colour and weave change. */
window.Recolor = (function () {
  var R = { ready: false };
  var SRC = {
    base: 'assets/img/suit-base.jpg?v=19',
    plain: 'assets/img/suit-plain.jpg?v=19',
    mask: 'assets/img/suit-mask.png?v=19',
    shirt: 'assets/img/suit-mask-shirt.png?v=19',
    wool: 'assets/img/wool-texture.jpg',
    tweed: 'assets/img/tweed-gray.jpg'
  };

  function load(src) {
    return new Promise(function (res, rej) {
      var i = new Image();
      i.onload = function () { res(i); };
      i.onerror = rej;
      i.src = src;
    });
  }
  function pixels(img, w, h) {
    var c = document.createElement('canvas');
    c.width = w || img.naturalWidth; c.height = h || img.naturalHeight;
    var x = c.getContext('2d');
    x.drawImage(img, 0, 0, c.width, c.height);
    return x.getImageData(0, 0, c.width, c.height);
  }
  function hexRgb(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }

  /* lookup tables: ratio^gamma and a soft shoulder tone curve */
  var POW = new Float32Array(1024), POW9 = new Float32Array(1024), TONE = new Float32Array(1024);
  for (var i = 0; i < 1024; i++) {
    var r = 0.2 + i / 1023 * 2.4;
    POW[i] = Math.pow(r, 0.8);
    POW9[i] = Math.pow(r, 0.9);
    var v = i / 1023 * 3;
    /* linear in the darks so the chosen colour stays true, soft roll-off in the highlights */
    TONE[i] = 255 * (v < 0.8 ? v : 0.8 + 0.2 * (1 - Math.exp(-(v - 0.8) / 0.2)));
  }
  function pw(t, r) { var k = ((r - 0.2) / 2.4 * 1023) | 0; return t[k < 0 ? 0 : k > 1023 ? 1023 : k]; }
  function tone(v) { var k = (v / 3 * 1023) | 0; return TONE[k < 0 ? 0 : k > 1023 ? 1023 : k]; }

  function collect(maskData, ch, thr) {
    var d = maskData.data, n = d.length >> 2, out = [];
    for (var k = 0; k < n; k++) if (d[(k << 2) + ch] > thr) out.push(k);
    return Uint32Array.from(out);
  }
  function meanLum(idx, data, maskData, ch) {
    var s = 0, ws = 0;
    for (var n = 0; n < idx.length; n++) {
      var i = idx[n] << 2, a = maskData.data[i + ch] / 255;
      s += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * a; ws += a;
    }
    return s / Math.max(ws, 1);
  }

  function init(canvas) {
    R.canvas = canvas; R.ctx = canvas.getContext('2d');
    return Promise.all([load(SRC.base), load(SRC.plain), load(SRC.mask), load(SRC.shirt), load(SRC.wool), load(SRC.tweed)]).then(function (im) {
      var w = im[0].naturalWidth, h = im[0].naturalHeight;
      canvas.width = w; canvas.height = h; R.w = w; R.h = h;
      R.base = pixels(im[0]);
      R.plain = pixels(im[1], w, h).data;
      R.mask = pixels(im[2], w, h);
      R.shirtMask = pixels(im[3], w, h);
      R.wool = pixels(im[4]);
      R.tweed = pixels(im[5]);
      R.out = new ImageData(new Uint8ClampedArray(R.base.data), w, h);

      R.j = collect(R.mask, 0, 4); R.t = collect(R.mask, 1, 4); R.s = collect(R.mask, 2, 4); R.sh = collect(R.shirtMask, 0, 4);
      var b = R.base.data, p = R.plain, js = 0, jo = 0, wsum = 0;
      R.lumO = new Float32Array(R.j.length);
      for (var n = 0; n < R.j.length; n++) {
        var k = R.j[n], i = k << 2, a = R.mask.data[i] / 255, lo = 0.299 * b[i] + 0.587 * b[i + 1] + 0.114 * b[i + 2];
        R.lumO[n] = lo; js += p[i] * a; jo += lo * a; wsum += a;
      }
      /* most of the jacket is lit, so anchor the chosen colour a little above the average */
      R.meanPlain = js / wsum * 1.2; R.meanOrig = jo / wsum * 1.2;
      var ts = 0, tw = 0;
      for (var q = 0; q < R.t.length; q++) { var ti = R.t[q] << 2, ta = R.mask.data[ti + 1] / 255; ts += p[ti] * ta; tw += ta; }
      R.meanTie = ts / Math.max(tw, 1) * 1.1;
      R.meanSq = meanLum(R.s, b, R.mask, 2);
      R.meanShirt = meanLum(R.sh, b, R.shirtMask, 0);
      R.woolMean = avg(R.wool); R.tweedMean = avg(R.tweed);
      R.texCache = {};
      R.ready = true;
    });
  }
  function avg(img) { var d = img.data, s = 0, n = d.length >> 2; for (var i = 0; i < d.length; i += 4) s += d[i]; return s / n; }

  /* per-pixel weave factor for the jacket, cached per weave */
  function texture(weave) {
    if (R.texCache[weave]) return R.texCache[weave];
    var f = new Float32Array(R.j.length), w = R.w;
    var W = R.wool, ww = W.width, wh = W.height, TW = R.tweed, tw = TW.width, th = TW.height;
    var TILE = 150, TT = 300;
    for (var n = 0; n < R.j.length; n++) {
      var k = R.j[n], x = k % w, y = (k / w) | 0;
      var u = ((x % TILE) / TILE * ww) | 0, v = ((y % TILE) / TILE * wh) | 0;
      var wf = W.data[(v * ww + u) << 2] / R.woolMean;
      var val;
      if (weave === 'herring') {
        var tx = x % TT, ty = y % TT, fx = ((x / TT) | 0) % 2, fy = ((y / TT) | 0) % 2;
        var uu = ((fx ? TT - 1 - tx : tx) / TT * tw) | 0, vv = ((fy ? TT - 1 - ty : ty) / TT * th) | 0;
        val = 1 + (TW.data[(vv * tw + uu) << 2] / R.tweedMean - 1) * 0.7;
      } else if (weave === 'flannel') {
        val = 1 + (wf - 1) * 0.45;
      } else if (weave === 'check') {
        val = wf * ((x % 46 < 2 || y % 46 < 2) ? 1.25 : 1);
      } else {
        val = wf;
      }
      f[n] = val;
    }
    return (R.texCache[weave] = f);
  }

  function paintRegion(idx, maskD, ch, mean, hex, out, base, flat) {
    var t = hexRgb(hex);
    for (var n = 0; n < idx.length; n++) {
      var i = idx[n] << 2, a = maskD[i + ch] / 255;
      var l = flat ? flat[i] : 0.299 * base[i] + 0.587 * base[i + 1] + 0.114 * base[i + 2];
      var s = Math.max(pw(POW9, l / mean), 0.45);
      /* blend over what is already painted (the recoloured jacket), not the original photo */
      out[i] = out[i] * (1 - a) + tone(t[0] * s) * a;
      out[i + 1] = out[i + 1] * (1 - a) + tone(t[1] * s) * a;
      out[i + 2] = out[i + 2] * (1 - a) + tone(t[2] * s) * a;
    }
  }

  /* look = { cloth:'#hex', weave:'plain|herring|flannel|check|stripe', shirt, tie, square } */
  function render(look) {
    if (!R.ready) return;
    var out = R.out.data, base = R.base.data, m = R.mask.data;
    out.set(base);
    var t = hexRgb(look.cloth), tex = texture(look.weave), stripe = look.weave === 'stripe';
    for (var n = 0; n < R.j.length; n++) {
      var k = R.j[n], i = k << 2, a = m[i] / 255;
      var ratio = stripe ? R.lumO[n] / R.meanOrig : R.plain[i] / R.meanPlain;
      var s = pw(POW, ratio) * tex[n];
      out[i] = base[i] * (1 - a) + tone(t[0] * s) * a;
      out[i + 1] = base[i + 1] * (1 - a) + tone(t[1] * s) * a;
      out[i + 2] = base[i + 2] * (1 - a) + tone(t[2] * s) * a;
    }
    paintRegion(R.t, m, 1, R.meanTie, look.tie, out, base, R.plain); /* tie pattern flattened to a solid silk */
    paintRegion(R.s, m, 2, R.meanSq, look.square, out, base);
    paintRegion(R.sh, R.shirtMask.data, 0, R.meanShirt, look.shirt, out, base);
    R.ctx.putImageData(R.out, 0, 0);
  }

  /* render a look and return a small JPEG of it (for pickers and cards) */
  function snapshot(look, width) {
    if (!R.ready) return '';
    render(look);
    var c = document.createElement('canvas');
    c.width = width; c.height = Math.round(width * R.h / R.w);
    c.getContext('2d').drawImage(R.canvas, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  }

  return { init: init, render: render, snapshot: snapshot, state: R };
})();
