/* UDesign photo gallery for pages without React, built to dist/ud-gallery.js (npm run build).
   The same gallery as the registry's React Gallery: its behaviour is registry/new-york/ui/gallery-core.ts,
   its skin is ud-gallery in dist/tokens.css. It keeps UDesign Pages' ud-gallery.js markup and API, so a
   page swaps the file and keeps its code. Swiper 14.3.0's bundle loads first, as window.Swiper:

   <link rel="stylesheet" href="swiper-bundle.min.css"> <link rel="stylesheet" href="tokens.css">
   <script src="swiper-bundle.min.js" defer></script> <script src="ud-gallery.js" defer></script>

   Markup (udGallery.markup writes it, and scrapers/shared/ud_gallery.py in UDesign Pages the same):

   <div class="ud-gallery" data-ud-gallery data-ud-gallery-start="0">
     <div class="swiper ud-gallery-main">
       <div class="swiper-wrapper">
         <div class="swiper-slide"><img src="a.jpg" alt="..." draggable="false"></div>
       </div>
       <div class="swiper-pagination"></div>
       <button type="button" class="swiper-button-prev"></button>
       <button type="button" class="swiper-button-next"></button>
     </div>
     <div class="ud-gallery-thumbs">
       <button type="button" class="ud-gallery-thumb" aria-label="Photo 1" aria-pressed="true"><img src="a.jpg" alt=""></button>
     </div>
   </div>

   udGallery(el)                 mount (galleries in the page at load are mounted automatically)
   udGallery.markup(srcs, alt, start, labels, sizes)  the markup above as a string, for galleries built at runtime
                                 (srcs: paths, or {src, srcset, thumb} for resized copies, sizes then being the slide
                                 width; alt: one caption or one per photo; labels: thumbnail names, "Photo N" by default)
   el.udGallery.show(src, srcset, thumb)  go to the slide showing src, or put src (with its srcset and thumbnail,
                                 when it has them) on the first slide (colour swatch)
   el.udGallery.setPhotos(srcs, start, alt, labels)  replace every photo (a colour or view set that changes);
                                 alt defaults to the current first photo's caption
   el.udGallery.destroy()        before removing the element (a closing modal)

   The arrow keys move the gallery that has the focus, else the one under the pointer, never every gallery
   on screen; Page Up and Page Down scroll the page. */
import type Swiper from "swiper"
import { GALLERY_MESSAGES, galleryLanguage, galleryOptions, gallerySpeed, keepThumbInView, routeGalleryKeys } from "../registry/new-york/ui/gallery-core"

type Photo = string | { src: string; srcset?: string; thumb?: string }
type Alt = string | string[]

interface Mounted {
  swiper: Swiper
  show(src: string, srcset?: string, thumb?: string): void
  setPhotos(srcs: Photo[], start?: number, alt?: Alt, labels?: string[]): void
  destroy(): void
}

interface GalleryElement extends HTMLElement {
  udGallery?: Mounted
}

declare global {
  interface Window {
    Swiper: typeof Swiper
    udGallery: ((el: HTMLElement) => Mounted) & { markup: typeof markup }
  }
}

function esc(s: unknown): string {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
function pic(p: Photo) {
  return typeof p === "string" ? { src: p } : p
}
function slidesHtml(srcs: Photo[], alt: Alt, start: number, sizes?: string | null): string {
  return srcs
    .map((p, i) => {
      const photo = pic(p)
      return (
        '<div class="swiper-slide"><img src="' + esc(photo.src) + '"' +
        (photo.srcset ? ' srcset="' + esc(photo.srcset) + '" sizes="' + esc(sizes || "100vw") + '"' : "") +
        ' alt="' + esc(Array.isArray(alt) ? alt[i] : alt) + '" draggable="false"' +
        (i === start ? "" : ' loading="lazy"') + "></div>"
      )
    })
    .join("")
}
function thumbsHtml(srcs: Photo[], start: number, labels?: string[]): string {
  return srcs.length < 2
    ? ""
    : srcs
        .map((p, i) => {
          const photo = pic(p)
          return (
            '<button type="button" class="ud-gallery-thumb" aria-label="' + esc(labels ? labels[i] : "Photo " + (i + 1)) +
            '" aria-pressed="' + (i === start) + '"><img src="' + esc(photo.thumb || photo.src) + '" alt="" loading="lazy"></button>'
          )
        })
        .join("")
}
function markup(srcs: Photo[], alt?: Alt, start?: number, labels?: string[], sizes?: string): string {
  const at = start || 0
  const row = thumbsHtml(srcs, at, labels)
  return (
    '<div class="ud-gallery" data-ud-gallery data-ud-gallery-start="' + at + '">' +
    '<div class="swiper ud-gallery-main"><div class="swiper-wrapper">' + slidesHtml(srcs, alt || "", at, sizes) + "</div>" +
    '<div class="swiper-pagination"></div>' +
    '<button type="button" class="swiper-button-prev"></button><button type="button" class="swiper-button-next"></button></div>' +
    (row ? '<div class="ud-gallery-thumbs">' + row + "</div>" : "") + "</div>"
  )
}

function mount(el: GalleryElement): Mounted {
  if (el.udGallery) return el.udGallery
  const main = el.querySelector<HTMLElement>(".ud-gallery-main")!
  const doc = el.ownerDocument
  const speed = gallerySpeed(doc)
  let swiper: Swiper | undefined
  let row: HTMLElement | null = null
  let thumbs: HTMLElement[] = []

  function bindThumbs() {
    row = el.querySelector<HTMLElement>(".ud-gallery-thumbs")
    thumbs = row ? Array.prototype.slice.call(row.querySelectorAll(".ud-gallery-thumb")) : []
    thumbs.forEach((b, i) => {
      b.addEventListener("click", () => swiper!.slideTo(i))
    })
  }
  function sync() {
    if (!swiper) return // Swiper fires slideChange while it starts on a slide other than the first
    const active = swiper.activeIndex
    thumbs.forEach((b, i) => b.setAttribute("aria-pressed", String(i === active)))
    keepThumbInView(row, active, Boolean(speed))
  }

  bindThumbs()
  swiper = new window.Swiper(main, {
    ...galleryOptions(main, { messages: GALLERY_MESSAGES[galleryLanguage(doc)], speed, start: parseInt(el.getAttribute("data-ud-gallery-start") || "0", 10) }),
    on: { slideChange: () => sync() },
  })
  const unroute = routeGalleryKeys(el, swiper)
  sync()

  const mounted: Mounted = {
    swiper,
    show(src, srcset, thumb) {
      const url = new URL(src, location.href).href
      const imgs = swiper!.slides.map((s) => s.querySelector("img"))
      let at = imgs.findIndex((img) => img !== null && img.src === url)
      if (at < 0) {
        at = 0
        imgs[0]!.srcset = srcset || "" // a srcset left from the replaced photo would keep showing that photo
        imgs[0]!.src = url
        if (thumbs[0]) thumbs[0].querySelector("img")!.src = thumb || url
      }
      swiper!.slideTo(at)
    },
    setPhotos(srcs, start, alt, labels) {
      const at = start || 0
      const first = swiper!.slides[0] && swiper!.slides[0].querySelector("img")
      swiper!.wrapperEl.innerHTML = slidesHtml(srcs, alt === undefined ? (first ? first.alt : "") : alt, at, first && first.getAttribute("sizes"))
      const html = thumbsHtml(srcs, at, labels)
      if (row) row.remove()
      if (html) el.insertAdjacentHTML("beforeend", '<div class="ud-gallery-thumbs">' + html + "</div>")
      swiper!.update()
      swiper!.slideTo(at, 0)
      bindThumbs()
      sync()
    },
    destroy() {
      unroute()
      swiper!.destroy(true, true)
      delete el.udGallery
    },
  }
  el.udGallery = mounted
  return mounted
}

window.udGallery = Object.assign(mount, { markup })
// One gallery that fails to mount must not stop the others; without Swiper the first photo still shows.
document.querySelectorAll<HTMLElement>("[data-ud-gallery]").forEach((el) => {
  try {
    mount(el)
  } catch (e) {
    console.error("ud-gallery: could not mount", el, e)
  }
})
