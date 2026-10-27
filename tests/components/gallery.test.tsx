import * as React from "react"
import axe from "axe-core"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Gallery, type GalleryPhoto } from "@/components/ui/gallery"
import { GALLERY_MESSAGES, galleryOptions, routeGalleryKeys } from "@/components/ui/gallery-core"

// jsdom lays nothing out, so Swiper measures 0 and never slides here: what a gallery shows and how
// the keys reach it are measured in Chromium (tests/e2e/components.spec.ts). This holds the markup,
// the options and the key routing every build shares.
const photos = (product: string, views: string[]): GalleryPhoto[] =>
  views.map((view, i) => ({
    src: `/p${i}-640.webp`,
    srcSet: `/p${i}-160.webp 160w, /p${i}-640.webp 640w, /p${i}-1200.webp 1200w`,
    thumb: `/p${i}-160.webp`,
    alt: `${view}, ${product}`,
    label: view,
  }))

describe("Gallery", () => {
  it("gives every slide its copies, the slide's width and its own alt, and names each thumbnail by its view", () => {
    const { container } = render(<Gallery photos={photos("Heavy Tee, White", ["Front", "Back", "Photo 1"])} sizes="(min-width: 1024px) 31rem, 100vw" start={1} priority />)
    const slides = [...container.querySelectorAll<HTMLImageElement>(".swiper-slide img")]
    expect(slides.map((img) => img.alt)).toEqual(["Front, Heavy Tee, White", "Back, Heavy Tee, White", "Photo 1, Heavy Tee, White"])
    for (const img of slides) {
      expect(img.getAttribute("srcset")?.split(", ").map((c) => c.split(" ")[1])).toEqual(["160w", "640w", "1200w"])
      expect(img.getAttribute("sizes")).toBe("(min-width: 1024px) 31rem, 100vw")
      expect(img.getAttribute("draggable")).toBe("false")
    }
    // The photo it opens on loads first; the rest wait until they are near.
    expect(slides.map((img) => img.getAttribute("loading"))).toEqual(["lazy", null, "lazy"])
    expect(slides[1].getAttribute("fetchpriority")).toBe("high")
    const thumbs = [...container.querySelectorAll<HTMLButtonElement>(".ud-gallery-thumb")]
    expect(thumbs.map((t) => t.getAttribute("aria-label"))).toEqual(["Front", "Back", "Photo 1"])
    expect(thumbs.map((t) => t.getAttribute("aria-pressed"))).toEqual(["false", "true", "false"])
    expect(thumbs[0].querySelector("img")).toHaveAttribute("src", "/p0-160.webp")
  })

  it("wears the one skin the plain-JS build wears, and Swiper's markup", () => {
    const { container } = render(<Gallery data-testid="g" className="mt-4" photos={photos("Cap", ["Front", "Side"])} />)
    const root = screen.getByTestId("g")
    expect(root).toHaveClass("ud-gallery", "mt-4")
    expect(root).toHaveAttribute("data-slot", "gallery")
    expect(container.querySelector(".ud-gallery > .swiper.ud-gallery-main > .swiper-wrapper > .swiper-slide")).not.toBeNull()
    expect(container.querySelectorAll(".ud-gallery-main > .swiper-pagination, .ud-gallery-main > .swiper-button-prev, .ud-gallery-main > .swiper-button-next")).toHaveLength(3)
    expect(container.querySelectorAll(".ud-gallery > .ud-gallery-thumbs > .ud-gallery-thumb")).toHaveLength(2)
  })

  it("shows no thumbnails for one photo, and names them Photo N when no view is given", () => {
    const { container, rerender } = render(<Gallery photos={[{ src: "/a.webp", alt: "Cap" }]} />)
    expect(container.querySelector(".ud-gallery-thumbs")).toBeNull()
    rerender(<Gallery photos={[{ src: "/a.webp", alt: "Cap" }, { src: "/b.webp", alt: "Cap" }]} />)
    expect([...container.querySelectorAll(".ud-gallery-thumb")].map((t) => t.getAttribute("aria-label"))).toEqual(["Photo 1", "Photo 2"])
    expect(container.querySelector(".ud-gallery-thumb img")).toHaveAttribute("src", "/a.webp")
  })

  it("starts over on a new set of photos, as another colour", () => {
    const { container, rerender } = render(<Gallery photos={photos("Tee, White", ["Front", "Back"])} start={1} />)
    const before = container.querySelector(".ud-gallery-main")
    rerender(<Gallery photos={photos("Tee, White", ["Front", "Back"]).map((p) => ({ ...p, src: p.src.replace("/p", "/black-p") }))} start={0} />)
    expect(container.querySelector(".ud-gallery-main")).not.toBe(before)
    expect(container.querySelector(".ud-gallery-thumb[aria-pressed='true']")).toHaveAttribute("aria-label", "Front")
  })

  it("names its arrows in the document's language once Swiper starts, and passes axe", async () => {
    document.documentElement.lang = "fr-CA"
    const { container } = render(<main><Gallery photos={photos("Tee", ["Devant", "Dos"])} /></main>)
    expect(container.querySelector(".swiper-button-next")).toHaveAttribute("aria-label", "Photo suivante")
    expect(container.querySelector(".swiper-button-prev")).toHaveAttribute("aria-label", "Photo précédente")
    expect((await axe.run(container)).violations).toEqual([])
    document.documentElement.lang = "en"
  })

  it("takes its words from messages when given", () => {
    const { container } = render(<Gallery photos={photos("Tee", ["Front", "Back"])} messages={{ ...GALLERY_MESSAGES.en, next: "Next view" }} />)
    expect(container.querySelector(".swiper-button-next")).toHaveAttribute("aria-label", "Next view")
  })
})

// D-55: Swiper's keyboard moved every gallery on screen and took Page Up and Page Down; the shared
// options turn it off, and the router moves only the gallery in focus or under the pointer.
describe("the gallery's keys", () => {
  it("turns Swiper's own keyboard off in every build", () => {
    const main = document.createElement("div")
    expect(galleryOptions(main, { messages: GALLERY_MESSAGES.fr, start: 0 }).keyboard).toEqual({ enabled: false })
  })

  it("moves the gallery in focus, else the one under the pointer, and leaves Page Down and typing alone", () => {
    render(
      <main>
        <input aria-label="Nom" />
        <Gallery data-testid="a" photos={photos("Tee", ["Front", "Back"])} />
        <Gallery data-testid="b" photos={photos("Cap", ["Front", "Side"])} />
      </main>,
    )
    const moved: string[] = []
    for (const id of ["a", "b"]) {
      const swiper = (screen.getByTestId(id).querySelector(".swiper") as HTMLElement & { swiper: { slideNext: () => void; slidePrev: () => void } }).swiper
      swiper.slideNext = () => moved.push(`${id} next`)
      swiper.slidePrev = () => moved.push(`${id} prev`)
    }
    const key = (key: string) => fireEvent.keyDown(document.activeElement ?? document.body, { key })

    key("ArrowRight")
    expect(moved, "nothing focused, no pointer: no gallery moves").toEqual([])
    fireEvent.pointerEnter(screen.getByTestId("b"))
    key("ArrowRight")
    expect(moved).toEqual(["b next"])
    act(() => (screen.getByTestId("a").querySelector(".ud-gallery-thumb") as HTMLElement).focus())
    key("ArrowLeft")
    expect(moved, "the focus wins over the pointer").toEqual(["b next", "a prev"])
    key("PageDown")
    key("PageUp")
    expect(moved, "Page Up and Page Down stay the page's").toEqual(["b next", "a prev"])
    act(() => screen.getByRole("textbox", { name: "Nom" }).focus())
    key("ArrowRight")
    expect(moved, "a field keeps its arrows").toEqual(["b next", "a prev"])
    fireEvent.pointerLeave(screen.getByTestId("b"))
    act(() => (document.activeElement as HTMLElement).blur())
    key("ArrowRight")
    expect(moved).toEqual(["b next", "a prev"])
  })

  it("never sees an arrow another widget handled", () => {
    render(
      <main>
        <div role="radiogroup" aria-label="Taille" onKeyDown={(e) => e.preventDefault()}>
          <button type="button" role="radio" aria-checked="true">M</button>
        </div>
        <Gallery data-testid="a" photos={photos("Tee", ["Front", "Back"])} />
      </main>,
    )
    let moved = 0
    const swiper = (screen.getByTestId("a").querySelector(".swiper") as HTMLElement & { swiper: { slideNext: () => void } }).swiper
    swiper.slideNext = () => (moved += 1)
    fireEvent.pointerEnter(screen.getByTestId("a"))
    act(() => screen.getByRole("radio", { name: "M" }).focus())
    fireEvent.keyDown(screen.getByRole("radio", { name: "M" }), { key: "ArrowRight" })
    expect(moved).toBe(0)
  })

  // Review M10: an unmounted gallery the pointer last rested on must not keep the keys from the others.
  it("leaves the keys to the others once a gallery unmounts", () => {
    const b = <Gallery key="b" data-testid="b" photos={photos("Cap", ["Front", "Side"])} />
    const { rerender } = render(
      <main>
        <Gallery key="a" data-testid="a" photos={photos("Tee", ["Front", "Back"])} />
        {b}
      </main>,
    )
    const moved: string[] = []
    const swiper = (screen.getByTestId("b").querySelector(".swiper") as HTMLElement & { swiper: { slideNext: () => void } }).swiper
    swiper.slideNext = () => moved.push("b next")
    fireEvent.pointerEnter(screen.getByTestId("a"))
    rerender(<main>{b}</main>)
    fireEvent.pointerEnter(screen.getByTestId("b"))
    fireEvent.keyDown(document.body, { key: "ArrowRight" })
    expect(moved).toEqual(["b next"])
  })

  // Review M2: undoing a route twice must not drop the listener another gallery now shares.
  it("undoes a route once, however often it is called", () => {
    const [a, b] = [document.createElement("div"), document.createElement("div")]
    document.body.append(a, b)
    const moved: string[] = []
    const fake = (id: string) => ({ destroyed: false, rtlTranslate: false, slideNext: () => moved.push(`${id} next`), slidePrev: () => moved.push(`${id} prev`) }) as unknown as Parameters<typeof routeGalleryKeys>[1]
    const undoA = routeGalleryKeys(a, fake("a"))
    undoA()
    const undoB = routeGalleryKeys(b, fake("b"))
    undoA()
    fireEvent.pointerEnter(b)
    fireEvent.keyDown(document.body, { key: "ArrowRight" })
    expect(moved).toEqual(["b next"])
    undoB()
    a.remove()
    b.remove()
  })
})

// Review M8: Swiper reports the photo a gallery opens on while it starts; that is not a move.
describe("onShow", () => {
  it("is called for a move, not for the photo the gallery opens on, under StrictMode too", () => {
    const shown: number[] = []
    const { container } = render(
      <React.StrictMode>
        <Gallery photos={photos("Tee", ["Front", "Back", "Side"])} start={2} onShow={(i) => shown.push(i)} />
      </React.StrictMode>,
    )
    expect(shown, "opening on the third photo").toEqual([])
    act(() => (container.querySelector(".ud-gallery-thumb") as HTMLElement).click())
    expect(shown).toEqual([0])
  })
})
