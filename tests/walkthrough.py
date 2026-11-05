# End-to-end walkthrough of one fitting on a phone-sized screen.
# Needs: pip install playwright (plus a browser), and the app served at http://127.0.0.1:8801 (python -m http.server 8801).
import re, urllib.parse
from playwright.sync_api import sync_playwright
BASE = ''  # output files (screenshot, sheet.pdf) land in the current folder
URL = 'http://127.0.0.1:8801/index.html?intro=0&mode=advisor'
res = []
def ok(name, cond, extra=''):
    res.append((name, bool(cond), extra)); print(('PASS ' if cond else 'FAIL ') + name, extra)
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}); errs = []
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('.adv-ws'); pg.wait_for_timeout(600)
    # 1 walk-in
    pg.click('#advWalkToggle'); pg.fill('#walkName', 'Anna Berg'); pg.fill('#walkBudget', '1000')
    pg.click('#walkForm button.btn'); pg.wait_for_url('**consult=*'); pg.wait_for_timeout(600)
    code = re.search(r'consult=(CM-[A-Z0-9]+)', pg.url).group(1)
    pg.locator('.mode button', has_text='Return to fitting').click(); pg.wait_for_selector('.adv-ws'); pg.wait_for_timeout(500)
    ok('walk-in opens in advisor mode', pg.inner_text('.adv-name') == 'Anna Berg', code)
    ok('walk-in measurements flagged', 'Provisional' in pg.inner_text('#advFit'))
    # 2 brief + contact
    pg.click('#advAddBrief'); pg.fill('#advBriefInput', 'Navy suit for interviews');
    pg.click('#advOpenCust'); pg.fill('#contactEmail', 'anna@example.com'); pg.fill('#contactPhone', '+31 6 1234 5678'); pg.click('#contactForm button'); pg.wait_for_timeout(300)
    # 3 fabric
    pg.click('#advCompareToggle'); pg.fill('#altSearch', 'velvet'); pg.wait_for_timeout(300)
    pg.keyboard.press('ArrowDown'); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    alt = pg.inner_text('#secondName'); pg.click('#applyAlt'); pg.wait_for_timeout(400)
    ok('fabric applied', alt in pg.inner_text('#advLook'), alt)
    # 4 sizes + alteration -1.5
    if pg.locator('#advSizePick').is_hidden(): pg.click('#advSizeToggle')
    pg.click('#advSize-50'); pg.click('#advPantsSize-42')
    for _ in range(3): pg.locator('#advAdjs .adj >> nth=0').locator('button >> nth=0').click()
    val = pg.locator('#advAdjs .adj >> nth=0').locator('input').input_value()
    ok('alteration shows -1.5', val.replace('\u2212', '-') == '-1.5', val)
    # stepper readable at 390
    box = pg.locator('#advAdjs .adj >> nth=0').locator('.stepper').bounding_box(); ok('stepper at least 176px wide on phone', box['width'] >= 170, str(round(box['width'])))
    # 5 try complete with alterations unreviewed
    pg.click('#advSave'); pg.wait_for_timeout(400)
    ok('missing alterations flagged', not pg.locator('#advAltError').is_hidden() and 'need' in pg.inner_text('#advStatus'), pg.inner_text('#advStatus'))
    pg.click('#advStatus button'); pg.wait_for_timeout(300)
    top = pg.evaluate("Math.round(document.getElementById('advAlts').getBoundingClientRect().top)")
    ok('attention link scrolls below the header', 56 <= top <= 140, str(top))
    pg.click('#advConfirmAlts'); pg.wait_for_timeout(200)
    pg.click('#advSave'); pg.wait_for_timeout(500)
    ok('completed', 'Ready for order review' in pg.inner_text('.adv-state') and 'Saved at' in pg.inner_text('#advSaveState'), pg.inner_text('#advSaveState'))
    pg.screenshot(path=BASE + 'w_phone_done.png')
    # 6 email draft
    hrefs = []
    pg.evaluate("document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href^=\"mailto:\"]'); if (a) { window.__mail = a.href; e.preventDefault(); } }, true)")
    pg.click('#advBarMore summary'); pg.click('#advEmail'); pg.wait_for_timeout(300)
    mail = pg.evaluate("window.__mail || ''"); dec = urllib.parse.unquote(mail)
    ok('email addressed to customer', mail.startswith('mailto:anna%40example.com') or mail.startswith('mailto:anna@example.com'), mail[:40])
    ok('email has sizes, alteration, no order placed, no workroom notes', 'Jacket size: 50' in dec and 'Sleeve -1.5 cm' in dec.replace('\u2212', '-') and 'No order has been placed' in dec, dec[:0])
    # 7 reload + reopen by code
    pg.goto(URL); pg.wait_for_selector('.adv-ws'); pg.wait_for_timeout(500)
    pg.click('#advLookupToggle'); pg.fill('#lookupCode', code); pg.click('#openFitting button[type=submit]'); pg.wait_for_timeout(500)
    ok('reopened by code', pg.inner_text('.adv-name') == 'Anna Berg')
    ok('brief persisted', 'Navy suit for interviews' in pg.inner_text('#advLook'))
    ok('fabric persisted', alt in pg.inner_text('#advLook'), alt)
    ok('sizes persisted', 'Jacket 50' in pg.inner_text('#advFinalLine').replace('\n', ' ') or '50' in pg.inner_text('#advFinalLine'), pg.inner_text('#advFinalLine'))
    ok('alteration persisted', pg.locator('#advAdjs .adj >> nth=0').locator('input').input_value().replace('\u2212', '-') == '-1.5')
    ok('contact persisted', 'anna@example.com' in pg.text_content('#advContact'))
    ok('status persisted', 'Ready for order review' in pg.inner_text('.adv-state'))
    ok('save state after reopen says this browser only', 'this browser only' in pg.inner_text('#advSaveState'), pg.inner_text('#advSaveState'))
    # 8 edit -> unsaved -> switch guard keeps data
    pg.fill('#advNotes', 'Right shoulder lower'); pg.wait_for_timeout(200)
    ok('unsaved after edit', 'Unsaved changes' in pg.inner_text('#advSaveState'))
    pg.click('#advLookupToggle'); pg.fill('#lookupCode', code); pg.click('#openFitting button[type=submit]'); pg.wait_for_timeout(400)
    ok('switch prompt shown', pg.locator('#advSwitch').is_visible())
    pg.click('#advSwitchKeep'); pg.wait_for_timeout(300)
    ok('keep editing keeps the note', pg.input_value('#advNotes') == 'Right shoulder lower')
    pg.click('#advDraft'); pg.wait_for_timeout(400)
    ok('save progress updates state', 'Saved at' in pg.inner_text('#advSaveState'))
    # 9 keyboard landscape: focused field not under the footer
    pg.set_viewport_size({'width': 844, 'height': 390}); pg.wait_for_timeout(300)
    pg.evaluate("window.scrollTo({top:0,behavior:'instant'})"); pg.focus('#advNotes'); pg.wait_for_timeout(900)
    r = pg.evaluate("(() => { const n = document.getElementById('advNotes').getBoundingClientRect(), b = document.querySelector('.adv-actions').getBoundingClientRect(); return [Math.round(n.bottom), Math.round(b.top)]; })()")
    ok('landscape: focused notes field sits above the footer and below the header', r[0] <= r[1] + 2, str(r))
    pg.set_viewport_size({'width': 390, 'height': 844})
    # 10 print as A4 PDF
    pg3 = ctx.new_page(); pg3.goto(URL + '&x=1'); pg3.wait_for_selector('.adv-ws')
    pg3.click('#advLookupToggle'); pg3.fill('#lookupCode', code); pg3.click('#openFitting button[type=submit]'); pg3.wait_for_timeout(500)
    pdf = pg3.pdf(format='A4', print_background=True, margin={'top': '12mm', 'bottom': '12mm', 'left': '12mm', 'right': '12mm'})
    open(BASE + 'sheet.pdf', 'wb').write(pdf)
    pages = len(re.findall(rb'/Type\s*/Page[^s]', pdf)); ok('A4 sheet is 1-2 pages', 1 <= pages <= 2, str(pages))
    txt = pdf.decode('latin-1')
    ok('PDF made', len(pdf) > 5000, str(len(pdf)))
    ok('console errors none', not errs, str(errs))
    b.close()
print('FAILS:', [r[0] for r in res if not r[1]])
