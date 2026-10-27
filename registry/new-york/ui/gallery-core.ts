// The gallery's behaviour, shared by the React Gallery (gallery.tsx) and the plain-JS build
// (dist/ud-gallery.js) so the two cannot drift: Swiper's options, the screen-reader words, the
// motion, the thumbnail that follows the photo, and which gallery the arrow keys move. No React
// and no Swiper code here: each build brings its own Swiper 14.3.0.
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
}

/** The screen-reader words. Swiper fills {{index}} and {{slidesLength}}. */
export interface GalleryMessages {
  prev: string
  next: string
  first: string
  last: string
  slide: string
  role: string
}

export const GALLERY_MESSAGES: Record<"fr" | "en", GalleryMessages> = {
  fr: { prev: "Photo précédente", next: "Photo suivante", first: "Première photo", last: "Dernière photo", slide: "Photo {{index}} sur {{slidesLength}}", role: "photo" },
  en: { prev: "Previous photo", next: "Next photo", first: "First photo", last: "Last photo", slide: "Photo {{index}} of {{slidesLength}}", role: "photo" },
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
