import os, re, io, base64, json, sys
from PIL import Image
ROOT = sys.argv[1]; OUT = sys.argv[2]
def maxw(rel):
    if '/library/suits/' in rel or '/catalog/' in rel: return 640
    if '/library/jackets/' in rel: return 480
    if '/library/shoes/' in rel: return 360
    if '/library/swatches/' in rel or '/textures/swatches/' in rel: return 260
    if '/library/textures/' in rel: return 640
    if '/textures/macro/' in rel: return 400
    return 360
assets = {}
for dp, dn, fn in os.walk(os.path.join(ROOT, 'assets', 'img')):
    for f in fn:
        if not f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')): continue
        p = os.path.join(dp, f); rel = os.path.relpath(p, ROOT).replace(os.sep, '/')
        im = Image.open(p); w = maxw(rel)
        if im.mode in ('RGBA', 'LA', 'P') and rel.lower().endswith('.png'):
            keep_png = True
        else:
            keep_png = False
        if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        if keep_png: im.save(buf, 'PNG', optimize=True); mime = 'image/png'
        else: im.convert('RGB').save(buf, 'JPEG', quality=72, optimize=True); mime = 'image/jpeg'
        assets[rel] = 'data:%s;base64,%s' % (mime, base64.b64encode(buf.getvalue()).decode())
def read(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
html = read('index.html')
css = read('css/style.css')
def fixcss(m):
    path = m.group(2)
    key = 'assets/img/' + path.split('assets/img/')[-1] if 'assets/img/' in path else None
    return 'url(%s)' % (('"' + assets[key] + '"') if key in assets else m.group(0))
css = re.sub(r"url\((['\"]?)([^)'\"]*)\1\)", lambda m: ('url("%s")' % assets['assets/img/' + m.group(2).split('assets/img/')[-1]]) if 'assets/img/' in m.group(2) and ('assets/img/' + m.group(2).split('assets/img/')[-1]) in assets else m.group(0), css)
shim = """(function(){var A=%s;var RX=/assets\/img\/[^'")\s<>]+/g;
function fix(s){return typeof s==='string'&&s.indexOf('assets/img/')>-1?s.replace(RX,function(m){return A[m]||m;}):s;}
var sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'||n==='style'||n==='srcset')v=fix(String(v));return sa.call(this,n,v);};
var d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(Element.prototype,'innerHTML',{get:d.get,set:function(v){d.set.call(this,fix(String(v)));},configurable:true});
var di=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{get:di.get,set:function(v){di.set.call(this,fix(String(v)));},configurable:true});
var cs=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,'cssText');Object.defineProperty(CSSStyleDeclaration.prototype,'cssText',{get:cs.get,set:function(v){cs.set.call(this,fix(String(v)));},configurable:true});
var sp=CSSStyleDeclaration.prototype.setProperty;CSSStyleDeclaration.prototype.setProperty=function(n,v,p){return sp.call(this,n,fix(String(v)),p);};
var bi=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,'backgroundImage');if(bi)Object.defineProperty(CSSStyleDeclaration.prototype,'backgroundImage',{get:bi.get,set:function(v){bi.set.call(this,fix(String(v)));},configurable:true});
new MutationObserver(function(ms){ms.forEach(function(m){var t=m.target;if(m.type==='attributes'){var v=t.getAttribute(m.attributeName);var f=fix(v);if(f!==v)sa.call(t,m.attributeName,f);}else{m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;[n].concat([].slice.call(n.querySelectorAll('[style],img'))).forEach(function(e){['src','style'].forEach(function(a){var v=e.getAttribute&&e.getAttribute(a);if(v){var f=fix(v);if(f!==v)sa.call(e,a,f);}});});});}});}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','style']});
})();""" % json.dumps(assets, separators=(',', ':'))
scripts = ''.join('<script>\n' + read('js/' + n) .replace('</script>', '<\/script>') + '\n</script>\n' for n in ['data.js', 'config.js', 'assistant.js', 'stylist.js', 'app.js'])
html = re.sub(r'<link rel="stylesheet" href="css/style.css[^"]*">', lambda m: '<style>\n' + css + '\n</style>', html)
html = re.sub(r'(<script src="js/[^"]+"></script>\s*)+', lambda m: scripts, html, count=1)
html = html.replace('<head>', '<head>\n<script>' + shim.replace('</script>', '<\/script>') + '</script>', 1)
open(OUT, 'w', encoding='utf-8').write(html)
print(len(assets), 'images,', round(os.path.getsize(OUT) / 1e6, 1), 'MB')
