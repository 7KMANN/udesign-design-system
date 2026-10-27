// The gallery's behaviour, shared by the React Gallery (gallery.tsx) and the plain-JS build
// (dist/ud-gallery.js) so the two cannot drift: Swiper's options, the screen-reader words, the
// motion, the thumbnail that follows the photo, which gallery the arrow keys move, and the dots'
// tone over the photo. No React and no Swiper code here: each build brings its own Swiper 14.3.0.
import type Swiper from "swiper"
import type { SwiperOptions } from "swiper/types"

export interface GalleryPhoto {
  /** The copy the browser loads when it cannot choose, such as the 640px one. */
  src: string
  /** Every copy with its width, such as "a-160.webp 160w, a-640.webp 640w, a-1200.webp 1200w": the browser picks one for the slide's sizes. */
  srcSet?: string
  /** The small copy the thumbnail shows, such as the 160px one. Defaults to src. */
  thumb?: string
  /** What this photo shows, for a screen reader: "Front, Heavy Tee, White". */
  alt: string
  /** The thumbnail's name, the view it shows: "Front", "Back". Defaults to "Photo N". */
  label?: string
  /**
   * How the photo meets the square. "contain" (the default) shows all of it inside the slide's margin, on
   * the card: a cut-out such as a mockup. "cover" fills the square edge to edge and crops what passes it: a
   * photo with a background of its own, which would otherwise sit in the card as a box. Its thumbnail too.
   */
  fit?: "contain" | "cover"
  /** What a covered photo keeps when it is cropped, as a CSS object-position: "50% 20%" keeps the top. Defaults to the centre. */
  focus?: string
}

/** The screen-reader words. Swiper fills {{index}} and {{slidesLength}}. */
export interface GalleryMessages {
  prev: string
  next: string
  first: string
  last: string
  slide: string
  role: string
  /** The name of the button that shows a covered photo whole. Defaults to the document language's. */
  whole?: string
  /** The name of the button that closes it. Defaults to the document language's. */
  close?: string
}

export const GALLERY_MESSAGES: Record<"fr" | "en", Required<GalleryMessages>> = {
  fr: { prev: "Photo précédente", next: "Photo suivante", first: "Première photo", last: "Dernière photo", slide: "Photo {{index}} sur {{slidesLength}}", role: "photo", whole: "Voir la photo entière", close: "Fermer" },
  en: { prev: "Previous photo", next: "Next photo", first: "First photo", last: "Last photo", slide: "Photo {{index}} of {{slidesLength}}", role: "photo", whole: "See the whole photo", close: "Close" },
}

/** The document's language for the gallery's words: English when <html lang> starts with "en", French otherwise. */
export function galleryLanguage(doc: Document): "fr" | "en" {
  return /^en/i.test(doc.documentElement.lang) ? "en" : "fr"
}

/** The standard motion duration, in ms. The tokens make it 0 under reduced motion, so the photo then moves at once. */
export function gallerySpeed(doc: Document): number | undefined {
  const value = getComputedStyle(doc.documentElement).getPropertyValue("--motion-duration-standard").trim()
  return value ? parseFloat(value) * (/ms$/.test(value) ? 1 : 1000) : undefined
}

/** Swiper's options for the gallery whose main element (the .swiper) is `main`. */
export function galleryOptions(main: HTMLElement, { messages, speed, start }: { messages: GalleryMessages; speed?: number; start: number }): SwiperOptions {
  return {
    speed,
    initialSlide: start,
    grabCursor: true,
    watchOverflow: true,
    // Swiper's own keyboard listens on the document, so one key moved every gallery on screen, and it
    // took Page Up and Page Down from the page. The keys are routed instead: routeGalleryKeys.
    keyboard: { enabled: false },
    navigation: { prevEl: main.querySelector<HTMLElement>(".swiper-button-prev"), nextEl: main.querySelector<HTMLElement>(".swiper-button-next") },
    // A few dots that slide along, never one per photo across the image. They report; they are not pressed.
    pagination: { el: main.querySelector<HTMLElement>(".swiper-pagination"), dynamicBullets: true, dynamicMainBullets: 1 },
    a11y: {
      prevSlideMessage: messages.prev,
      nextSlideMessage: messages.next,
      firstSlideMessage: messages.first,
      lastSlideMessage: messages.last,
      slideLabelMessage: messages.slide,
      itemRoleDescriptionMessage: messages.role,
    },
  }
}

/** Keeps the thumbnail of the photo shown in view, scrolling its row only, never the page. */
export function keepThumbInView(row: HTMLElement | null, index: number, smooth: boolean): void {
  const thumb = row?.children[index] as HTMLElement | undefined
  if (!row || !thumb || row.scrollWidth <= row.clientWidth) return
  row.scrollTo({ left: thumb.offsetLeft - (row.clientWidth - thumb.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" })
}

/** What lies under the dots: "dark" where white dots read better, "light" where ink ones do. */
export type GalleryTone = "light" | "dark"

// The relative luminance at which white and black have the same contrast (WCAG 2): below it, white reads better.
const CROSSOVER = 0.179
// The whole photo is drawn this wide and the box read in that drawing, as a part of the photo: drawImage takes
// the copy's own pixels, while a copy picked from a srcset reports a natural size corrected for its density.
const READ_WIDTH = 240

const linear = (channel: number) => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const POSITION: Record<string, string> = { left: "0%", top: "0%", center: "50%", right: "100%", bottom: "100%" }

// One value of object-position as getComputedStyle gives it ("50%", "12px"), in a room of `room` pixels.
function offset(value: string | undefined, room: number): number {
  const v = value === undefined ? "50%" : POSITION[value] ?? value
  return v.endsWith("%") ? (room * parseFloat(v)) / 100 : parseFloat(v) || 0
}

/**
 * The tone of the photo under a box, such as the dots', given in the img element's own pixels: what most of
 * the box shows decides, so a few bright pixels never turn the dots white on a dark photo. Null where the
 * photo draws less than half of the box (the dots then sit on the card, in the slide's margin, or on a
 * cut-out's transparent part), and where the photo cannot be read: not loaded yet, or from another origin
 * without CORS.
 */
export function toneUnder(img: HTMLImageElement, box: { left: number; top: number; width: number; height: number }): GalleryTone | null {
  if (!img.complete || !img.naturalWidth || !img.naturalHeight || !img.clientWidth || !img.clientHeight || box.width < 1 || box.height < 1) return null
  const style = getComputedStyle(img)
  const scale = (style.objectFit === "cover" ? Math.max : Math.min)(img.clientWidth / img.naturalWidth, img.clientHeight / img.naturalHeight)
  const [positionX, positionY] = style.objectPosition.split(/\s+/)
  const drawnLeft = offset(positionX, img.clientWidth - img.naturalWidth * scale)
  const drawnTop = offset(positionY, img.clientHeight - img.naturalHeight * scale)
  // The box in the photo's own pixels, cut to the photo.
  const left = Math.max(0, (box.left - drawnLeft) / scale)
  const top = Math.max(0, (box.top - drawnTop) / scale)
  const right = Math.min(img.naturalWidth, (box.left + box.width - drawnLeft) / scale)
  const bottom = Math.min(img.naturalHeight, (box.top + box.height - drawnTop) / scale)
  if (right <= left || bottom <= top || (right - left) * (bottom - top) * scale * scale < (box.width * box.height) / 2) return null
  const canvas = img.ownerDocument.createElement("canvas")
  canvas.width = READ_WIDTH
  canvas.height = Math.max(1, Math.round((READ_WIDTH * img.naturalHeight) / img.naturalWidth))
  const k = READ_WIDTH / img.naturalWidth
  const x = Math.min(Math.floor(left * k), canvas.width - 1)
  const y = Math.min(Math.floor(top * k), canvas.height - 1)
  let data: Uint8ClampedArray
  try {
    const context = canvas.getContext("2d", { willReadFrequently: true })
    if (!context) return null
    context.drawImage(img, 0, 0, canvas.width, canvas.height)
    data = context.getImageData(x, y, Math.max(1, Math.ceil(right * k) - x), Math.max(1, Math.ceil(bottom * k) - y)).data
  } catch {
    return null // another origin's photo without CORS: the canvas keeps its pixels
  }
  let seen = 0
  let dark = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue // a cut-out's transparent part, where the card shows
    seen++
    if (0.2126 * linear(data[i]) + 0.7152 * linear(data[i + 1]) + 0.0722 * linear(data[i + 2]) < CROSSOVER) dark++
  }
  if (seen < data.length / 4 / 2) return null
  return dark > seen / 2 ? "dark" : "light"
}

// The dots' box in the img element's pixels once its slide rests in the main box, wherever the slide is now: a
// photo is read the moment it is chosen, while it still moves in.
function dotsOver(main: HTMLElement, slide: HTMLElement, img: HTMLImageElement, dots: HTMLElement) {
  const m = main.getBoundingClientRect()
  const s = slide.getBoundingClientRect()
  const i = img.getBoundingClientRect()
  const d = dots.getBoundingClientRect()
  return { left: d.left - m.left - main.clientLeft - (i.left - s.left), top: d.top - m.top - main.clientTop - (i.top - s.top), width: d.width, height: d.height }
}

/**
 * Keeps the dots readable over a covered photo: data-tone on the main element says what lies under them in
 * the photo shown, "dark" or "light", and the skin turns them white or ink; no data-tone while they sit on
 * the card. A photo is read once it has loaded, and again when it loads another copy (a wider pick of its
 * srcset, another colour's photo in its place). Returns the function that undoes it.
 */
export function watchTone(main: HTMLElement, swiper: Swiper): () => void {
  const dots = main.querySelector<HTMLElement>(".swiper-pagination")
  const tones = new WeakMap<HTMLImageElement, GalleryTone | null>()
  const show = () => {
    const slide = swiper.destroyed ? undefined : swiper.slides[swiper.activeIndex]
    const img = slide?.querySelector("img")
    if (dots && slide && img && img.complete && img.naturalWidth && !tones.has(img)) tones.set(img, toneUnder(img, dotsOver(main, slide, img, dots)))
    const tone = img ? tones.get(img) : null
    if (tone) main.setAttribute("data-tone", tone)
    else main.removeAttribute("data-tone")
  }
  // load does not bubble: it is caught on its way down.
  const loaded = (event: Event) => {
    const img = event.target as HTMLImageElement
    if (img.nodeName !== "IMG") return
    tones.delete(img)
    show()
  }
  main.addEventListener("load", loaded, true)
  swiper.on("slideChange", show)
  show()
  return () => {
    main.removeEventListener("load", loaded, true)
    swiper.off("slideChange", show)
    main.removeAttribute("data-tone")
  }
}

// Lucide's maximize-2 and x, drawn in the text colour.
const ICON = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`
const WHOLE_ICON = ICON('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>')
const CLOSE_ICON = ICON('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')

// The widest copy a srcset lists ("a-160.webp 160w, a-1200.webp 1200w"), or none.
function widest(srcset: string | null): string | null {
  const copies = (srcset ?? "").split(",").map((c) => c.trim().split(/\s+/)).filter(([url]) => url)
  copies.sort((a, b) => parseFloat(b[1] ?? "0") - parseFloat(a[1] ?? "0"))
  return copies[0]?.[0] ?? null
}

/**
 * Lets a covered photo be seen whole, since the square crops it: a quiet button in the square's corner,
 * shown while the photo shown is covered, opens it as it is, the whole photo as large as the screen
 * allows, over the backdrop, nothing around it but a button to close. It opens at once on the copy the
 * slide already shows, and takes the widest copy of its srcset once that has loaded. A modal <dialog>:
 * Escape, a click anywhere and the close button close it, the focus comes back to the button, and the
 * arrow keys move no gallery while it is open. Returns the function that undoes it.
 */
export function showWhole(root: HTMLElement, main: HTMLElement, swiper: Swiper, words: { whole: string; close: string }): () => void {
  const doc = root.ownerDocument
  // Pressed, hovered and focused by its class in dist/tokens.css (ud-gallery-whole).
  const button = doc.createElement("button")
  button.type = "button"
  button.className = "ud-gallery-whole"
  button.setAttribute("aria-label", words.whole)
  button.innerHTML = WHOLE_ICON
  main.append(button)
  let view: HTMLDialogElement | null = null
  let upgrade: HTMLImageElement | null = null

  const sync = () => {
    const slide = swiper.destroyed ? undefined : swiper.slides[swiper.activeIndex]
    button.hidden = slide?.getAttribute("data-fit") !== "cover"
  }
  const open = () => {
    const shown = swiper.slides[swiper.activeIndex]?.querySelector("img")
    if (!shown) return
    if (!view) {
      view = doc.createElement("dialog")
      view.className = "ud-gallery-view"
      const photo = doc.createElement("img")
      photo.alt = ""
      photo.draggable = false
      // Pressed, hovered and focused by its class in dist/tokens.css (ud-gallery-view-close).
      const close = doc.createElement("button")
      close.type = "button"
      close.className = "ud-gallery-view-close"
      close.setAttribute("aria-label", words.close)
      close.innerHTML = CLOSE_ICON
      view.append(photo, close)
      view.addEventListener("click", () => view!.close())
      // Outside the swiper, so a press in it never drags the photos behind.
      root.append(view)
    }
    const img = view.querySelector("img")!
    const now = shown.currentSrc || shown.src
    img.src = now
    img.alt = shown.alt
    view.setAttribute("aria-label", shown.alt)
    view.showModal()
    const best = widest(shown.getAttribute("srcset"))
    if (best && new URL(best, doc.baseURI).href !== now) {
      const next = (upgrade = new Image())
      next.onload = () => {
        if (upgrade === next && img.src === now) img.src = next.src
      }
      next.src = best
    }
  }

  button.addEventListener("click", open)
  // Another photo shown, or other photos in the slides (setPhotos in the plain-JS build).
  swiper.on("slideChange update", sync)
  sync()
  return () => {
    swiper.off("slideChange update", sync)
    upgrade = null
    view?.close()
    view?.remove()
    button.remove()
  }
}

interface Routed {
  root: HTMLElement
  swiper: Swiper
  pointer: boolean
}

const routes = new Map<Document, Set<Routed>>()

// A key a field or another widget handles is not the gallery's.
function typing(el: EventTarget | undefined): boolean {
  const node = el as HTMLElement | undefined
  return Boolean(node && (node.isContentEditable || /^(input|textarea|select)$/i.test(node.nodeName ?? "")))
}

// A gallery the page has set aside: in an inert or aria-hidden subtree, as a modal hides its siblings.
function setAside(root: HTMLElement): boolean {
  return root.closest('[inert], [aria-hidden="true"]') !== null
}

// The dialog that holds the focus, if any: an aria-modal element, a role of dialog or alertdialog,
// or a <dialog>. Radix marks its modals by role alone, and its aria-hidden never reaches a gallery:
// it leaves every subtree that holds a live region in view, and Swiper's A11y puts one in each.
function dialogOf(path: EventTarget[]): Element | undefined {
  return path.find((node): node is Element => {
    const el = node as Element
    if (typeof el.getAttribute !== "function") return false
    return el.nodeName === "DIALOG" || el.getAttribute("aria-modal") === "true" || /^(?:alert)?dialog$/.test(el.getAttribute("role") ?? "")
  })
}

function route(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
  // Where the key went, through any shadow root: the document sees only the host as its focus.
  const path = event.composedPath()
  if (typing(path[0])) return
  // A modal can open before the browser tells a gallery that the pointer left it. Never a gallery
  // set aside, nor one outside the dialog that holds the focus, whatever its pointer last said.
  const dialog = dialogOf(path)
  const galleries = [...(routes.get(event.currentTarget as Document) ?? [])].filter((g) => !setAside(g.root) && (!dialog || dialog.contains(g.root)))
  // The gallery that has the focus, else the one under the pointer; never every gallery on screen.
  const target = galleries.find((g) => path.includes(g.root)) ?? galleries.find((g) => g.pointer)
  if (!target || target.swiper.destroyed) return
  event.preventDefault()
  const forward = (event.key === "ArrowRight") !== Boolean(target.swiper.rtlTranslate)
  if (forward) target.swiper.slideNext()
  else target.swiper.slidePrev()
}

/**
 * Lets the arrow keys move this gallery while the focus is in it or the pointer is over it, and
 * no other: one listener per document, whatever the number of galleries. Never while it sits behind
 * a modal: in an inert or aria-hidden subtree, or outside the dialog that holds the focus. Page Up
 * and Page Down stay the page's. A key another widget handled (a choice group stops its own) never
 * arrives. Returns the function that undoes it.
 */
export function routeGalleryKeys(root: HTMLElement, swiper: Swiper): () => void {
  const doc = root.ownerDocument
  const entry: Routed = { root, swiper, pointer: false }
  const enter = () => {
    entry.pointer = true
  }
  const leave = () => {
    entry.pointer = false
  }
  root.addEventListener("pointerenter", enter)
  root.addEventListener("pointerleave", leave)
  let galleries = routes.get(doc)
  if (!galleries) {
    galleries = new Set()
    routes.set(doc, galleries)
    doc.addEventListener("keydown", route)
  }
  galleries.add(entry)
  let done = false
  return () => {
    // Once only: a second call would find the document's current set gone and drop its listener.
    if (done) return
    done = true
    root.removeEventListener("pointerenter", enter)
    root.removeEventListener("pointerleave", leave)
    galleries.delete(entry)
    if (galleries.size === 0) {
      routes.delete(doc)
      doc.removeEventListener("keydown", route)
    }
  }
}
