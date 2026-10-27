import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"

// dist/ud-gallery.js, the plain-JS gallery (D-54): built from js/ud-gallery.ts and the registry's
// gallery-core.ts, and a drop-in for UDesign Pages' ud-gallery.js, whose markup and API it keeps.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const built = fs.readFileSync(path.join(root, "dist/ud-gallery.js"), "utf8")

test("dist/ud-gallery.js is the build of its sources", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ud-gallery-"))
  try {
    execFileSync(process.execPath, ["scripts/build-gallery.mjs", dir], { cwd: root, stdio: "pipe" })
    assert.equal(fs.readFileSync(path.join(dir, "ud-gallery.js"), "utf8"), built, "dist/ud-gallery.js is stale; run npm run build")
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

// A page that loads Swiper's bundle, then the gallery. The fake Swiper records what it was given.
function page(body, { lang = "fr-CA", script = built } = {}) {
  const dom = new JSDOM(`<!doctype html><html lang="${lang}"><body>${body}</body></html>`, { runScripts: "outside-only", url: "https://example.test/" })
  const { window } = dom
  window.made = []
  window.eval(`window.Swiper = class {
    constructor(el, options) { this.el = el; this.options = options; this.slides = [...el.querySelectorAll('.swiper-slide')]; this.wrapperEl = el.querySelector('.swiper-wrapper'); this.activeIndex = options.initialSlide; this.moves = []; window.made.push(this) }
    slideNext() { this.moves.push('next') } slidePrev() { this.moves.push('prev') } slideTo(i) { this.activeIndex = i; this.options.on.slideChange() }
    update() {} destroy() { this.destroyed = true } on() {} off() {}
  }`)
  window.eval(script)
  return window
}

const markupOf = (window, ...args) => window.udGallery.markup(...args)

test("writes UDesign Pages' markup: copies, an alt per photo, thumbnails named by their view", () => {
  const window = page("")
  const html = markupOf(window, ["a.jpg", "b.jpg"], ["Front", "Back"], 1, ["Front view", "Back view"])
  assert.ok(html.includes('alt="Front"') && html.includes('alt="Back"'))
  assert.ok(html.includes('aria-label="Front view" aria-pressed="false"') && html.includes('aria-label="Back view" aria-pressed="true"'))
  const one = markupOf(window, ["a.jpg"], "Tee")
  assert.ok(!one.includes("ud-gallery-thumb") && one.includes("swiper-button-next"), "one photo: no thumbnails, Swiper hides the arrows")
  const pics = [{ src: "a-640.webp", srcset: "a-160.webp 160w, a-640.webp 640w, a-1200.webp 1200w", thumb: "a-160.webp" }, "b.jpg"]
  const two = markupOf(window, pics, "Tee", 0, undefined, "50vw")
  assert.ok(two.includes('srcset="a-160.webp 160w, a-640.webp 640w, a-1200.webp 1200w" sizes="50vw" alt="Tee" draggable="false">'))
  assert.ok(two.includes('<img src="a-160.webp" alt="" loading="lazy">'), "the thumbnail is the small copy")
  assert.ok(two.includes('<img src="b.jpg" alt="Tee" draggable="false" loading="lazy">'))
  assert.ok(markupOf(window, ['a"b.jpg'], "<x>").includes('src="a&quot;b.jpg" alt="&lt;x&gt;"'))
})

test("marks a covered photo and its focus on its slide and its thumbnail, and writes nothing for the default", () => {
  const window = page("")
  const html = markupOf(window, [{ src: "a.jpg", fit: "cover", focus: "50% 20%" }, { src: "b.jpg", fit: "contain" }, "c.jpg"], "Tee", 0)
  assert.ok(html.includes('<div class="swiper-slide" data-fit="cover"><img src="a.jpg" alt="Tee" draggable="false" style="object-position: 50% 20%"></div>'))
  assert.ok(html.includes('<button type="button" class="ud-gallery-thumb" data-fit="cover" aria-label="Photo 1" aria-pressed="true"><img src="a.jpg" alt="" style="object-position: 50% 20%" loading="lazy"></button>'))
  assert.ok(html.includes('<div class="swiper-slide"><img src="b.jpg" alt="Tee" draggable="false" loading="lazy"></div>'), "contain, the default, is UDesign Pages' markup")
  assert.equal(html.match(/data-fit/g).length, 2)
  assert.ok(markupOf(window, [{ src: "a.jpg", fit: "cover", focus: '0" onload="x' }], "Tee").includes('style="object-position: 0&quot; onload=&quot;x"'))
})

test("adds the whole-photo button at mount, shown on a covered photo, named in the document's words", () => {
  const markup = (start) => page("").udGallery.markup([{ src: "a.jpg", fit: "cover" }, "b.jpg"], "Tee", start)
  const window = page(`<div id="covered">${markup(0)}</div><div id="whole">${markup(1)}</div>`)
  const button = (id) => window.document.querySelector(`#${id} .ud-gallery-main > .ud-gallery-whole`)
  assert.equal(button("covered").getAttribute("aria-label"), "Voir la photo entière")
  assert.equal(button("covered").hidden, false)
  assert.equal(button("whole").hidden, true, "a contained photo is whole already")
  assert.ok(!markup(0).includes("ud-gallery-whole"), "the markup stays UDesign Pages': the button is made at mount")
})

test("mounts every gallery in the page with Swiper's keyboard off and the document's words", () => {
  const html = '<div class="g">' + page("").udGallery.markup(["a.jpg", "b.jpg", "c.jpg"], "Tee", 2, ["Devant", "Dos", "Photo 1"]) + "</div>"
  const window = page(html + html)
  assert.equal(window.made.length, 2)
  const [first] = window.made
  assert.equal(first.options.keyboard.enabled, false, "Swiper's own keyboard moves every gallery on screen")
  assert.equal(first.options.initialSlide, 2)
  assert.equal(first.options.a11y.nextSlideMessage, "Photo suivante")
  assert.equal(page(html, { lang: "en" }).made[0].options.a11y.nextSlideMessage, "Next photo")
})

test("moves the gallery in focus, else the one under the pointer, and leaves Page Down and typing alone", () => {
  const html = (id) => `<div id="${id}">` + page("").udGallery.markup(["a.jpg", "b.jpg"], "Tee", 0) + "</div>"
  const window = page(html("one") + html("two") + '<input aria-label="Nom">')
  const [one, two] = window.made
  const key = (target, key) => target.dispatchEvent(new window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }))
  const moves = () => [one.moves.join(","), two.moves.join(",")]

  key(window.document.body, "ArrowRight")
  assert.deepEqual(moves(), ["", ""], "no focus, no pointer")
  window.document.querySelector("#two .ud-gallery").dispatchEvent(new window.Event("pointerenter"))
  key(window.document.body, "ArrowRight")
  assert.deepEqual(moves(), ["", "next"])
  const thumb = window.document.querySelector("#one .ud-gallery-thumb")
  thumb.focus()
  key(thumb, "ArrowLeft")
  assert.deepEqual(moves(), ["prev", "next"], "the focus wins over the pointer")
  key(thumb, "PageDown")
  key(thumb, "PageUp")
  assert.deepEqual(moves(), ["prev", "next"], "Page Up and Page Down stay the page's")
  const field = window.document.querySelector("input")
  field.focus()
  key(field, "ArrowRight")
  assert.deepEqual(moves(), ["prev", "next"], "a field keeps its arrows")
})

// Review M1: the document sees a shadow root's host as the focus, not the field inside it.
test("leaves its arrows to a field inside a shadow root, the pointer resting on a gallery", () => {
  const window = page(page("").udGallery.markup(["a.jpg", "b.jpg"], "Tee", 0) + '<div id="host"></div>')
  const shadow = window.document.getElementById("host").attachShadow({ mode: "open" })
  shadow.innerHTML = '<input aria-label="Nom" value="Tee">'
  const field = shadow.querySelector("input")
  window.document.querySelector(".ud-gallery").dispatchEvent(new window.Event("pointerenter"))
  field.focus()
  const event = new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, composed: true, cancelable: true })
  field.dispatchEvent(event)
  assert.equal(window.made[0].moves.join(","), "", "the gallery stays")
  assert.equal(event.defaultPrevented, false, "the caret moves")
})

// A modal can open before the browser tells the page that the pointer left the gallery under it.
// The router never moves a gallery set aside (aria-hidden or inert), nor one outside the dialog that
// holds the focus: a role of dialog (Radix), aria-modal, or a <dialog>. No pointer event is sent here.
test("never moves a gallery behind a modal, though the pointer last rested on it", () => {
  const html = (id) => `<div id="${id}">` + page("").udGallery.markup(["a.jpg", "b.jpg"], "Tee", 0) + "</div>"
  for (const [open, close] of [['<div role="dialog">', "</div>"], ['<div aria-modal="true">', "</div>"], ["<dialog open>", "</dialog>"]]) {
    const window = page(html("one") + `${open}${html("two")}<button>Fermer</button>${close}`)
    const doc = window.document
    const [one, two] = window.made
    const outside = doc.getElementById("one")
    const button = doc.querySelector("button:not(.ud-gallery-thumb):not(.ud-gallery-whole):not([class^='swiper'])")
    const key = (target) => target.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true, composed: true }))
    outside.querySelector(".ud-gallery").dispatchEvent(new window.Event("pointerenter"))
    outside.setAttribute("aria-hidden", "true")
    key(doc.body)
    outside.removeAttribute("aria-hidden")
    outside.setAttribute("inert", "")
    key(doc.body)
    outside.removeAttribute("inert")
    button.focus()
    key(button)
    assert.equal(one.moves.join(","), "", `${open}: a gallery set aside, or outside the dialog with the focus, stays`)
    const thumb = doc.querySelector("#two .ud-gallery-thumb")
    thumb.focus()
    key(thumb)
    assert.equal(two.moves.join(","), "next", `${open}: the dialog's own gallery keeps its keys`)
    thumb.blur()
    key(doc.body)
    assert.equal(one.moves.join(","), "next", `${open}: the focus out of the dialog, the pointer's gallery moves again`)
  }
})

// Review M10: a gallery that is gone, the pointer last over it, must not keep the keys from the others.
test("a destroyed gallery leaves the keys to the others", () => {
  const html = (id) => `<div id="${id}">` + page("").udGallery.markup(["a.jpg", "b.jpg"], "Tee", 0) + "</div>"
  const window = page(html("one") + html("two"))
  const [, two] = window.made
  const [first, second] = [...window.document.querySelectorAll(".ud-gallery")]
  first.dispatchEvent(new window.Event("pointerenter"))
  first.udGallery.destroy()
  first.remove() // a node taken out of the page hears no pointerleave
  second.dispatchEvent(new window.Event("pointerenter"))
  window.document.body.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }))
  assert.equal(two.moves.join(","), "next")
})

// Review M2: UDesign Pages' destroy tolerated a second call; a stale handle must not undo what replaced it.
test("destroy is safe to call twice, even after another gallery mounts", () => {
  const html = (id) => `<div id="${id}">` + page("").udGallery.markup(["a.jpg", "b.jpg"], "Tee", 0) + "</div>"
  const window = page(html("one"))
  const el = window.document.querySelector("#one .ud-gallery")
  const stale = el.udGallery
  stale.destroy()
  window.document.body.insertAdjacentHTML("beforeend", html("two"))
  const other = window.document.querySelector("#two .ud-gallery")
  window.udGallery(other)
  const again = window.udGallery(el)
  stale.destroy()
  assert.equal(el.udGallery, again, "the gallery mounted again keeps its handle")
  assert.notEqual(again.swiper.destroyed, true)
  other.dispatchEvent(new window.Event("pointerenter"))
  window.document.body.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }))
  assert.equal(window.made[1].moves.join(","), "next", "the keys still reach the other gallery")
})

test("keeps the thumbnails in step and its API: show, setPhotos, destroy", () => {
  const window = page(page("").udGallery.markup(["https://example.test/a.jpg", "https://example.test/b.jpg"], "Tee", 0, ["Devant", "Dos"]))
  const el = window.document.querySelector(".ud-gallery")
  const pressed = () => [...el.querySelectorAll(".ud-gallery-thumb")].map((t) => t.getAttribute("aria-pressed"))
  assert.deepEqual(pressed(), ["true", "false"])
  el.udGallery.show("https://example.test/b.jpg")
  assert.deepEqual(pressed(), ["false", "true"])
  el.udGallery.setPhotos(["c.jpg", "d.jpg", "e.jpg"], 1, "Cap", ["Devant", "Côté", "Dos"])
  assert.deepEqual([...el.querySelectorAll(".ud-gallery-thumb")].map((t) => t.getAttribute("aria-label")), ["Devant", "Côté", "Dos"])
  assert.deepEqual(pressed(), ["false", "true", "false"])
  el.udGallery.destroy()
  assert.equal(el.udGallery, undefined)
  assert.equal(window.made[0].destroyed, true)
})

// The real UDesign Pages, when UDESIGNPAGES_DIR names it: its markup() and this one write the same bytes.
const PAGES = process.env.UDESIGNPAGES_DIR
test("writes the same markup as UDesign Pages' ud-gallery.js", { skip: !PAGES && "UDESIGNPAGES_DIR is not set" }, () => {
  const theirs = page("", { script: fs.readFileSync(path.join(PAGES, "public/shared/gallery/ud-gallery.js"), "utf8") })
  const ours = page("")
  const cases = [
    [["a.jpg", "b.jpg"], ["Front", "Back"], 1, ["Front view", "Back view"]],
    [["a.jpg"], "Tee"],
    [[{ src: "a-640.webp", srcset: "a-640.webp 640w, a-1200.webp 1200w", thumb: "a-160.webp" }, "b.jpg"], "Tee", 0, undefined, "50vw"],
    [["x.jpg", "y.jpg", "z.jpg"], "Cap", 2],
  ]
  for (const args of cases) assert.equal(markupOf(ours, ...args), markupOf(theirs, ...args))
})
