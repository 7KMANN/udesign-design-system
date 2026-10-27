/* UDesign photo gallery for pages without React, built to dist/ud-gallery.js (npm run build).
The same gallery as the registry's React Gallery: its behaviour is registry/new-york/ui/gallery-core.ts,
its skin is ud-gallery in dist/tokens.css. It keeps UDesign Pages' ud-gallery.js markup and API, so a
page swaps the file and keeps its code. Swiper 14.3.0's bundle loads first, as window.Swiper:

<link rel="stylesheet" href="swiper-bundle.min.css"> <link rel="stylesheet" href="tokens.css">
<script src="swiper-bundle.min.js" defer><\/script> <script src="ud-gallery.js" defer><\/script>

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
/* Built from js/ud-gallery.ts and registry/new-york/ui/gallery-core.ts by npm run build. Do not edit. */
(function() {
	//#region registry/new-york/ui/gallery-core.ts
	var GALLERY_MESSAGES = {
		fr: {
			prev: "Photo précédente",
			next: "Photo suivante",
			first: "Première photo",
			last: "Dernière photo",
			slide: "Photo {{index}} sur {{slidesLength}}",
			role: "photo"
		},
		en: {
			prev: "Previous photo",
			next: "Next photo",
			first: "First photo",
			last: "Last photo",
			slide: "Photo {{index}} of {{slidesLength}}",
			role: "photo"
		}
	};
	/** The document's language for the gallery's words: English when <html lang> starts with "en", French otherwise. */
	function galleryLanguage(doc) {
		return /^en/i.test(doc.documentElement.lang) ? "en" : "fr";
	}
	/** The standard motion duration, in ms. The tokens make it 0 under reduced motion, so the photo then moves at once. */
	function gallerySpeed(doc) {
		const value = getComputedStyle(doc.documentElement).getPropertyValue("--motion-duration-standard").trim();
		return value ? parseFloat(value) * (/ms$/.test(value) ? 1 : 1e3) : void 0;
	}
	/** Swiper's options for the gallery whose main element (the .swiper) is `main`. */
	function galleryOptions(main, { messages, speed, start }) {
		return {
			speed,
			initialSlide: start,
			grabCursor: true,
			watchOverflow: true,
			keyboard: { enabled: false },
			navigation: {
				prevEl: main.querySelector(".swiper-button-prev"),
				nextEl: main.querySelector(".swiper-button-next")
			},
			pagination: {
				el: main.querySelector(".swiper-pagination"),
				dynamicBullets: true,
				dynamicMainBullets: 1
			},
			a11y: {
				prevSlideMessage: messages.prev,
				nextSlideMessage: messages.next,
				firstSlideMessage: messages.first,
				lastSlideMessage: messages.last,
				slideLabelMessage: messages.slide,
				itemRoleDescriptionMessage: messages.role
			}
		};
	}
	/** Keeps the thumbnail of the photo shown in view, scrolling its row only, never the page. */
	function keepThumbInView(row, index, smooth) {
		const thumb = row === null || row === void 0 ? void 0 : row.children[index];
		if (!row || !thumb || row.scrollWidth <= row.clientWidth) return;
		row.scrollTo({
			left: thumb.offsetLeft - (row.clientWidth - thumb.offsetWidth) / 2,
			behavior: smooth ? "smooth" : "auto"
		});
	}
	var routes = /* @__PURE__ */ new Map();
	function typing(el) {
		var _node$nodeName;
		const node = el;
		return Boolean(node && (node.isContentEditable || /^(input|textarea|select)$/i.test((_node$nodeName = node.nodeName) !== null && _node$nodeName !== void 0 ? _node$nodeName : "")));
	}
	function route(event) {
		var _routes$get, _galleries$find;
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
		if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
		const path = event.composedPath();
		if (typing(path[0])) return;
		const galleries = [...(_routes$get = routes.get(event.currentTarget)) !== null && _routes$get !== void 0 ? _routes$get : []];
		const target = (_galleries$find = galleries.find((g) => path.includes(g.root))) !== null && _galleries$find !== void 0 ? _galleries$find : galleries.find((g) => g.pointer);
		if (!target || target.swiper.destroyed) return;
		event.preventDefault();
		if (event.key === "ArrowRight" !== Boolean(target.swiper.rtlTranslate)) target.swiper.slideNext();
		else target.swiper.slidePrev();
	}
	/**
	* Lets the arrow keys move this gallery while the focus is in it or the pointer is over it, and
	* no other: one listener per document, whatever the number of galleries. Page Up and Page Down
	* stay the page's. A key another widget handled (a choice group stops its own) never arrives.
	* Returns the function that undoes it.
	*/
	function routeGalleryKeys(root, swiper) {
		const doc = root.ownerDocument;
		const entry = {
			root,
			swiper,
			pointer: false
		};
		const enter = () => {
			entry.pointer = true;
		};
		const leave = () => {
			entry.pointer = false;
		};
		root.addEventListener("pointerenter", enter);
		root.addEventListener("pointerleave", leave);
		let galleries = routes.get(doc);
		if (!galleries) {
			galleries = /* @__PURE__ */ new Set();
			routes.set(doc, galleries);
			doc.addEventListener("keydown", route);
		}
		galleries.add(entry);
		let done = false;
		return () => {
			if (done) return;
			done = true;
			root.removeEventListener("pointerenter", enter);
			root.removeEventListener("pointerleave", leave);
			galleries.delete(entry);
			if (galleries.size === 0) {
				routes.delete(doc);
				doc.removeEventListener("keydown", route);
			}
		};
	}
	//#endregion
	//#region js/ud-gallery.ts
	function esc(s) {
		return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	function pic(p) {
		return typeof p === "string" ? { src: p } : p;
	}
	function slidesHtml(srcs, alt, start, sizes) {
		return srcs.map((p, i) => {
			const photo = pic(p);
			return "<div class=\"swiper-slide\"><img src=\"" + esc(photo.src) + "\"" + (photo.srcset ? " srcset=\"" + esc(photo.srcset) + "\" sizes=\"" + esc(sizes || "100vw") + "\"" : "") + " alt=\"" + esc(Array.isArray(alt) ? alt[i] : alt) + "\" draggable=\"false\"" + (i === start ? "" : " loading=\"lazy\"") + "></div>";
		}).join("");
	}
	function thumbsHtml(srcs, start, labels) {
		return srcs.length < 2 ? "" : srcs.map((p, i) => {
			const photo = pic(p);
			return "<button type=\"button\" class=\"ud-gallery-thumb\" aria-label=\"" + esc(labels ? labels[i] : "Photo " + (i + 1)) + "\" aria-pressed=\"" + (i === start) + "\"><img src=\"" + esc(photo.thumb || photo.src) + "\" alt=\"\" loading=\"lazy\"></button>";
		}).join("");
	}
	function markup(srcs, alt, start, labels, sizes) {
		const at = start || 0;
		const row = thumbsHtml(srcs, at, labels);
		return "<div class=\"ud-gallery\" data-ud-gallery data-ud-gallery-start=\"" + at + "\"><div class=\"swiper ud-gallery-main\"><div class=\"swiper-wrapper\">" + slidesHtml(srcs, alt || "", at, sizes) + "</div><div class=\"swiper-pagination\"></div><button type=\"button\" class=\"swiper-button-prev\"></button><button type=\"button\" class=\"swiper-button-next\"></button></div>" + (row ? "<div class=\"ud-gallery-thumbs\">" + row + "</div>" : "") + "</div>";
	}
	function mount(el) {
		if (el.udGallery) return el.udGallery;
		const main = el.querySelector(".ud-gallery-main");
		const doc = el.ownerDocument;
		const speed = gallerySpeed(doc);
		let swiper;
		let row = null;
		let thumbs = [];
		function bindThumbs() {
			row = el.querySelector(".ud-gallery-thumbs");
			thumbs = row ? Array.prototype.slice.call(row.querySelectorAll(".ud-gallery-thumb")) : [];
			thumbs.forEach((b, i) => {
				b.addEventListener("click", () => swiper.slideTo(i));
			});
		}
		function sync() {
			if (!swiper) return;
			const active = swiper.activeIndex;
			thumbs.forEach((b, i) => b.setAttribute("aria-pressed", String(i === active)));
			keepThumbInView(row, active, Boolean(speed));
		}
		bindThumbs();
		swiper = new window.Swiper(main, {
			...galleryOptions(main, {
				messages: GALLERY_MESSAGES[galleryLanguage(doc)],
				speed,
				start: parseInt(el.getAttribute("data-ud-gallery-start") || "0", 10)
			}),
			on: { slideChange: () => sync() }
		});
		const unroute = routeGalleryKeys(el, swiper);
		let gone = false;
		sync();
		const mounted = {
			swiper,
			show(src, srcset, thumb) {
				const url = new URL(src, location.href).href;
				const imgs = swiper.slides.map((s) => s.querySelector("img"));
				let at = imgs.findIndex((img) => img !== null && img.src === url);
				if (at < 0) {
					at = 0;
					imgs[0].srcset = srcset || "";
					imgs[0].src = url;
					if (thumbs[0]) thumbs[0].querySelector("img").src = thumb || url;
				}
				swiper.slideTo(at);
			},
			setPhotos(srcs, start, alt, labels) {
				const at = start || 0;
				const first = swiper.slides[0] && swiper.slides[0].querySelector("img");
				swiper.wrapperEl.innerHTML = slidesHtml(srcs, alt === void 0 ? first ? first.alt : "" : alt, at, first && first.getAttribute("sizes"));
				const html = thumbsHtml(srcs, at, labels);
				if (row) row.remove();
				if (html) el.insertAdjacentHTML("beforeend", "<div class=\"ud-gallery-thumbs\">" + html + "</div>");
				swiper.update();
				swiper.slideTo(at, 0);
				bindThumbs();
				sync();
			},
			destroy() {
				if (gone) return;
				gone = true;
				unroute();
				swiper.destroy(true, true);
				if (el.udGallery === mounted) delete el.udGallery;
			}
		};
		el.udGallery = mounted;
		return mounted;
	}
	window.udGallery = Object.assign(mount, { markup });
	document.querySelectorAll("[data-ud-gallery]").forEach((el) => {
		try {
			mount(el);
		} catch (e) {
			console.error("ud-gallery: could not mount", el, e);
		}
	});
	//#endregion
})();
