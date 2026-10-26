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
    update() {} destroy() { this.destroyed = true }
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
