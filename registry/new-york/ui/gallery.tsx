"use client"

import * as React from "react"
import Swiper from "swiper"
import { A11y, Navigation, Pagination } from "swiper/modules"

import {
  GALLERY_MESSAGES,
  galleryLanguage,
  galleryOptions,
  gallerySpeed,
  keepThumbInView,
  routeGalleryKeys,
  showWhole,
  watchTone,
  type GalleryMessages,
  type GalleryPhoto,
} from "@/components/ui/gallery-core"
import { cn } from "@/lib/utils"

export type { GalleryMessages, GalleryPhoto, GalleryTone } from "@/components/ui/gallery-core"

export interface GalleryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The photos, in order. A new set, such as another colour's, is a new gallery that opens on start. */
  photos: GalleryPhoto[]
  /** The photo it opens on, and the one it moves to when this changes. */
  start?: number
  /** The slide's width, for the browser's pick among each photo's srcSet: an img sizes attribute. */
  sizes?: string
  /** The opening photo is the page's main image: load it at once and fetch it first. Without it, every photo waits until it is near. */
  priority?: boolean
  /** Screen-reader words. By default the document's language: English when <html lang> starts with "en", else French. */
  messages?: GalleryMessages
  /** Called with the index of the photo shown once it moves: a swipe, a key, an arrow, a thumbnail or another start. Not for the photo it opens on. */
  onShow?: (index: number) => void
}

// React 18 knows the attribute only in lower case, React 19 only in camel case.
const fetchPriority = React.version.startsWith("18.") ? "fetchpriority" : "fetchPriority"
const useLayoutEffectOnClient = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect
// A covered photo says so on its slide and its thumbnail, which the skin fills; the default writes nothing.
const fitOf = (photo: GalleryPhoto) => (photo.fit === "cover" ? "cover" : undefined)
const focusOf = (photo: GalleryPhoto): React.CSSProperties | undefined => (photo.focus ? { objectPosition: photo.focus } : undefined)

/**
 * A product's photos to swipe, with thumbnails named by their view (DESIGN.md "Showing photos").
 * Swiper 14.3.0 does the swipe, the drag, the arrows, the dots and the screen-reader words; the
 * skin is ud-gallery in dist/tokens.css, the same as the plain-JS dist/ud-gallery.js. Import
 * Swiper's own stylesheet once beside the tokens: @import "swiper/css/bundle".
 */
const Gallery = React.forwardRef<HTMLDivElement, GalleryProps>(({ photos, ...props }, ref) => (
  // A new set of photos is a new gallery: Swiper starts over on it, as udGallery.setPhotos does.
  <GallerySet key={photos.map((p) => p.src).join("\n")} ref={ref} photos={photos} {...props} />
))
Gallery.displayName = "Gallery"

const GallerySet = React.forwardRef<HTMLDivElement, GalleryProps>(
  ({ className, messages, onShow, photos, priority = false, sizes = "100vw", start = 0, ...props }, ref) => {
    const root = React.useRef<HTMLDivElement | null>(null)
    const main = React.useRef<HTMLDivElement>(null)
    const row = React.useRef<HTMLDivElement>(null)
    const swiper = React.useRef<Swiper | null>(null)
    const smooth = React.useRef(false)
    const opening = Math.min(Math.max(start, 0), Math.max(photos.length - 1, 0))
    const [shown, setShown] = React.useState(opening)
    const onShowLatest = React.useRef(onShow)
    onShowLatest.current = onShow

    // Before the first paint: the photo it opens on is the first one seen, and nothing moves.
    useLayoutEffectOnClient(() => {
      const el = main.current
      if (!el || !root.current) return
      const speed = gallerySpeed(el.ownerDocument)
      smooth.current = Boolean(speed)
      const words = GALLERY_MESSAGES[galleryLanguage(el.ownerDocument)]
      const made = new Swiper(el, {
        modules: [Navigation, Pagination, A11y],
        ...galleryOptions(el, { messages: messages ?? words, speed, start: opening }),
        on: {
          slideChange: (s) => {
            setShown(s.activeIndex)
            // Swiper reports the photo it opens on while it starts: that is not a move.
            if (s.initialized) onShowLatest.current?.(s.activeIndex)
          },
        },
      })
      swiper.current = made
      const unroute = routeGalleryKeys(root.current, made)
      const untone = watchTone(el, made)
      const unwhole = showWhole(root.current, el, made, { whole: messages?.whole ?? words.whole, close: messages?.close ?? words.close })
      return () => {
        unroute()
        untone()
        unwhole()
        made.destroy(true, true)
        swiper.current = null
      }
      // One Swiper per set of photos: a new set is a new key, so a new gallery.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Another start within the same set: go there, as udGallery.show does.
    React.useEffect(() => {
      if (swiper.current && swiper.current.activeIndex !== opening) swiper.current.slideTo(opening)
    }, [opening])

    React.useEffect(() => keepThumbInView(row.current, shown, smooth.current), [shown])

    const setRoot = React.useCallback(
      (el: HTMLDivElement | null) => {
        root.current = el
        if (typeof ref === "function") ref(el)
        else if (ref) ref.current = el
      },
      [ref],
    )

    // Swiper adds its classes, its styles, the dots and the arrows' icons to what React draws here,
    // and React never draws those parts again: only the thumbnails' state changes.
    return (
      <div ref={setRoot} data-slot="gallery" className={cn("ud-gallery", className)} {...props}>
        <div ref={main} className="swiper ud-gallery-main">
          <div className="swiper-wrapper">
            {photos.map((photo, i) => (
              <div key={i} className="swiper-slide" data-fit={fitOf(photo)}>
                <img
                  src={photo.src}
                  srcSet={photo.srcSet}
                  sizes={photo.srcSet ? sizes : undefined}
                  alt={photo.alt}
                  draggable={false}
                  // Every photo waits until it is near, the opening one too: a page of cards would fetch
                  // each card's at once. The page's main image (priority) loads at once, fetched first.
                  loading={i === opening && priority ? undefined : "lazy"}
                  decoding="async"
                  {...(i === opening && priority ? { [fetchPriority]: "high" } : {})}
                  style={focusOf(photo)}
                />
              </div>
            ))}
          </div>
          <div className="swiper-pagination" />
          <button type="button" className="swiper-button-prev" />
          <button type="button" className="swiper-button-next" />
        </div>
        {photos.length > 1 ? (
          <div ref={row} className="ud-gallery-thumbs">
            {photos.map((photo, i) => (
              <button key={i} type="button" className="ud-gallery-thumb" data-fit={fitOf(photo)} aria-label={photo.label ?? `Photo ${i + 1}`} aria-pressed={i === shown} onClick={() => swiper.current?.slideTo(i)}>
                <img src={photo.thumb ?? photo.src} alt="" loading="lazy" decoding="async" style={focusOf(photo)} />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    )
  },
)
GallerySet.displayName = "GallerySet"

export { Gallery }
