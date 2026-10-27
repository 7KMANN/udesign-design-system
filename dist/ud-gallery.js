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

A photo with a background of its own fills the square: data-fit="cover" on its slide and on its thumbnail,
and what it keeps when cropped, if not its centre, as both images' object-position (style="object-position: 50% 20%").
Over such a photo the dots turn white or ink by what lies under them (data-tone on .ud-gallery-main), and a
quiet button in the square's corner (.ud-gallery-whole, made at mount) shows it whole, as it is, in a modal
<dialog class="ud-gallery-view">.

udGallery(el)                 mount (galleries in the page at load are mounted automatically)
udGallery.markup(srcs, alt, start, labels, sizes)  the markup above as a string, for galleries built at runtime
(srcs: paths, or {src, srcset, thumb, fit, focus} for resized copies, sizes then being
the slide width, and for a photo that fills the square: fit "cover" writes data-fit="cover"
on its slide and its thumbnail, focus the object-position of both images; alt: one caption
or one per photo; labels: thumbnail names, "Photo N" by default)
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
			role: "photo",
			whole: "Voir la photo entière",
			close: "Fermer"
		},
		en: {
			prev: "Previous photo",
			next: "Next photo",
			first: "First photo",
			last: "Last photo",
			slide: "Photo {{index}} of {{slidesLength}}",
			role: "photo",
			whole: "See the whole photo",
			close: "Close"
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
	var CROSSOVER = .179;
	var READ_WIDTH = 240;
	var linear = (channel) => {
		const c = channel / 255;
		return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
	};
	var POSITION = {
		left: "0%",
		top: "0%",
		center: "50%",
		right: "100%",
		bottom: "100%"
	};
	function offset(value, room) {
		var _POSITION$value;
		const v = value === void 0 ? "50%" : (_POSITION$value = POSITION[value]) !== null && _POSITION$value !== void 0 ? _POSITION$value : value;
		return v.endsWith("%") ? room * parseFloat(v) / 100 : parseFloat(v) || 0;
	}
	/**
	* The tone of the photo under a box, such as the dots', given in the img element's own pixels: what most of
	* the box shows decides, so a few bright pixels never turn the dots white on a dark photo. Null where the
	* photo draws less than half of the box (the dots then sit on the card, in the slide's margin, or on a
	* cut-out's transparent part), and where the photo cannot be read: not loaded yet, or from another origin
	* without CORS.
	*/
	function toneUnder(img, box) {
		if (!img.complete || !img.naturalWidth || !img.naturalHeight || !img.clientWidth || !img.clientHeight || box.width < 1 || box.height < 1) return null;
		const style = getComputedStyle(img);
		const scale = (style.objectFit === "cover" ? Math.max : Math.min)(img.clientWidth / img.naturalWidth, img.clientHeight / img.naturalHeight);
		const [positionX, positionY] = style.objectPosition.split(/\s+/);
		const drawnLeft = offset(positionX, img.clientWidth - img.naturalWidth * scale);
		const drawnTop = offset(positionY, img.clientHeight - img.naturalHeight * scale);
		const left = Math.max(0, (box.left - drawnLeft) / scale);
		const top = Math.max(0, (box.top - drawnTop) / scale);
		const right = Math.min(img.naturalWidth, (box.left + box.width - drawnLeft) / scale);
		const bottom = Math.min(img.naturalHeight, (box.top + box.height - drawnTop) / scale);
		if (right <= left || bottom <= top || (right - left) * (bottom - top) * scale * scale < box.width * box.height / 2) return null;
		const canvas = img.ownerDocument.createElement("canvas");
		canvas.width = READ_WIDTH;
		canvas.height = Math.max(1, Math.round(READ_WIDTH * img.naturalHeight / img.naturalWidth));
		const k = READ_WIDTH / img.naturalWidth;
		const x = Math.min(Math.floor(left * k), canvas.width - 1);
		const y = Math.min(Math.floor(top * k), canvas.height - 1);
		let data;
		try {
			const context = canvas.getContext("2d", { willReadFrequently: true });
			if (!context) return null;
			context.drawImage(img, 0, 0, canvas.width, canvas.height);
			data = context.getImageData(x, y, Math.max(1, Math.ceil(right * k) - x), Math.max(1, Math.ceil(bottom * k) - y)).data;
		} catch {
			return null;
		}
		let seen = 0;
		let dark = 0;
		for (let i = 0; i < data.length; i += 4) {
			if (data[i + 3] < 128) continue;
			seen++;
			if (.2126 * linear(data[i]) + .7152 * linear(data[i + 1]) + .0722 * linear(data[i + 2]) < CROSSOVER) dark++;
		}
		if (seen < data.length / 4 / 2) return null;
		return dark > seen / 2 ? "dark" : "light";
	}
	function dotsOver(main, slide, img, dots) {
		const m = main.getBoundingClientRect();
		const s = slide.getBoundingClientRect();
		const i = img.getBoundingClientRect();
		const d = dots.getBoundingClientRect();
		return {
			left: d.left - m.left - main.clientLeft - (i.left - s.left),
			top: d.top - m.top - main.clientTop - (i.top - s.top),
			width: d.width,
			height: d.height
		};
	}
	/**
	* Keeps the dots readable over a covered photo: data-tone on the main element says what lies under them in
	* the photo shown, "dark" or "light", and the skin turns them white or ink; no data-tone while they sit on
	* the card. A photo is read once it has loaded, and again when it loads another copy (a wider pick of its
	* srcset, another colour's photo in its place). Returns the function that undoes it.
	*/
	function watchTone(main, swiper) {
		const dots = main.querySelector(".swiper-pagination");
		const tones = /* @__PURE__ */ new WeakMap();
		const show = () => {
			const slide = swiper.destroyed ? void 0 : swiper.slides[swiper.activeIndex];
			const img = slide === null || slide === void 0 ? void 0 : slide.querySelector("img");
			if (dots && slide && img && img.complete && img.naturalWidth && !tones.has(img)) tones.set(img, toneUnder(img, dotsOver(main, slide, img, dots)));
			const tone = img ? tones.get(img) : null;
			if (tone) main.setAttribute("data-tone", tone);
			else main.removeAttribute("data-tone");
		};
		const loaded = (event) => {
			const img = event.target;
			if (img.nodeName !== "IMG") return;
			tones.delete(img);
			show();
		};
		main.addEventListener("load", loaded, true);
		swiper.on("slideChange", show);
		show();
		return () => {
			main.removeEventListener("load", loaded, true);
			swiper.off("slideChange", show);
			main.removeAttribute("data-tone");
		};
	}
	var ICON = (paths) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
	var WHOLE_ICON = ICON("<polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" x2=\"14\" y1=\"3\" y2=\"10\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>");
	var CLOSE_ICON = ICON("<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>");
	function widest(srcset) {
		var _copies$0$, _copies$;
		const copies = (srcset !== null && srcset !== void 0 ? srcset : "").split(",").map((c) => c.trim().split(/\s+/)).filter(([url]) => url);
		copies.sort((a, b) => {
			var _b$, _a$;
			return parseFloat((_b$ = b[1]) !== null && _b$ !== void 0 ? _b$ : "0") - parseFloat((_a$ = a[1]) !== null && _a$ !== void 0 ? _a$ : "0");
		});
		return (_copies$0$ = (_copies$ = copies[0]) === null || _copies$ === void 0 ? void 0 : _copies$[0]) !== null && _copies$0$ !== void 0 ? _copies$0$ : null;
	}
	/**
	* Lets a covered photo be seen whole, since the square crops it: a quiet button in the square's corner,
	* shown while the photo shown is covered, opens it as it is, the whole photo as large as the screen
	* allows, over the backdrop, nothing around it but a button to close. It opens at once on the copy the
	* slide already shows, and takes the widest copy of its srcset once that has loaded. A modal <dialog>:
	* Escape, a click anywhere and the close button close it, the focus comes back to the button, and the
	* arrow keys move no gallery while it is open. Returns the function that undoes it.
	*/
	function showWhole(root, main, swiper, words) {
		const doc = root.ownerDocument;
		const button = doc.createElement("button");
		button.type = "button";
		button.className = "ud-gallery-whole";
		button.setAttribute("aria-label", words.whole);
		button.innerHTML = WHOLE_ICON;
		main.append(button);
		let view = null;
		let upgrade = null;
		const sync = () => {
			const slide = swiper.destroyed ? void 0 : swiper.slides[swiper.activeIndex];
			button.hidden = (slide === null || slide === void 0 ? void 0 : slide.getAttribute("data-fit")) !== "cover";
		};
		const open = () => {
			var _swiper$slides$swiper;
			const shown = (_swiper$slides$swiper = swiper.slides[swiper.activeIndex]) === null || _swiper$slides$swiper === void 0 ? void 0 : _swiper$slides$swiper.querySelector("img");
			if (!shown) return;
			if (!view) {
				view = doc.createElement("dialog");
				view.className = "ud-gallery-view";
				const photo = doc.createElement("img");
				photo.alt = "";
				photo.draggable = false;
				const close = doc.createElement("button");
				close.type = "button";
				close.className = "ud-gallery-view-close";
				close.setAttribute("aria-label", words.close);
				close.innerHTML = CLOSE_ICON;
				view.append(photo, close);
				view.addEventListener("click", () => view.close());
				root.append(view);
			}
			const img = view.querySelector("img");
			const now = shown.currentSrc || shown.src;
			img.src = now;
			img.alt = shown.alt;
			view.setAttribute("aria-label", shown.alt);
			view.showModal();
			const best = widest(shown.getAttribute("srcset"));
			if (best && new URL(best, doc.baseURI).href !== now) {
				const next = upgrade = new Image();
				next.onload = () => {
					if (upgrade === next && img.src === now) img.src = next.src;
				};
				next.src = best;
			}
		};
		button.addEventListener("click", open);
		swiper.on("slideChange update", sync);
		sync();
		return () => {
			swiper.off("slideChange update", sync);
			upgrade = null;
			view === null || view === void 0 || view.close();
			view === null || view === void 0 || view.remove();
			button.remove();
		};
	}
	var routes = /* @__PURE__ */ new Map();
	function typing(el) {
		var _node$nodeName;
		const node = el;
		return Boolean(node && (node.isContentEditable || /^(input|textarea|select)$/i.test((_node$nodeName = node.nodeName) !== null && _node$nodeName !== void 0 ? _node$nodeName : "")));
	}
	function setAside(root) {
		return root.closest("[inert], [aria-hidden=\"true\"]") !== null;
	}
	function dialogOf(path) {
		return path.find((node) => {
			var _el$getAttribute;
			const el = node;
			if (typeof el.getAttribute !== "function") return false;
			return el.nodeName === "DIALOG" || el.getAttribute("aria-modal") === "true" || /^(?:alert)?dialog$/.test((_el$getAttribute = el.getAttribute("role")) !== null && _el$getAttribute !== void 0 ? _el$getAttribute : "");
		});
	}
	function route(event) {
		var _routes$get, _galleries$find;
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
		if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
		const path = event.composedPath();
		if (typing(path[0])) return;
		const dialog = dialogOf(path);
		const galleries = [...(_routes$get = routes.get(event.currentTarget)) !== null && _routes$get !== void 0 ? _routes$get : []].filter((g) => !setAside(g.root) && (!dialog || dialog.contains(g.root)));
		const target = (_galleries$find = galleries.find((g) => path.includes(g.root))) !== null && _galleries$find !== void 0 ? _galleries$find : galleries.find((g) => g.pointer);
		if (!target || target.swiper.destroyed) return;
		event.preventDefault();
		if (event.key === "ArrowRight" !== Boolean(target.swiper.rtlTranslate)) target.swiper.slideNext();
		else target.swiper.slidePrev();
	}
	/**
	* Lets the arrow keys move this gallery while the focus is in it or the pointer is over it, and
	* no other: one listener per document, whatever the number of galleries. Never while it sits behind
	* a modal: in an inert or aria-hidden subtree, or outside the dialog that holds the focus. Page Up
	* and Page Down stay the page's. A key another widget handled (a choice group stops its own) never
	* arrives. Returns the function that undoes it.
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
	function fitAttr(p) {
		return typeof p !== "string" && p.fit === "cover" ? " data-fit=\"cover\"" : "";
	}
	function focusAttr(p) {
		return typeof p !== "string" && p.focus ? " style=\"object-position: " + esc(p.focus) + "\"" : "";
	}
	function slidesHtml(srcs, alt, start, sizes) {
		return srcs.map((p, i) => {
			const photo = pic(p);
			return "<div class=\"swiper-slide\"" + fitAttr(p) + "><img src=\"" + esc(photo.src) + "\"" + (photo.srcset ? " srcset=\"" + esc(photo.srcset) + "\" sizes=\"" + esc(sizes || "100vw") + "\"" : "") + " alt=\"" + esc(Array.isArray(alt) ? alt[i] : alt) + "\" draggable=\"false\"" + focusAttr(p) + (i === start ? "" : " loading=\"lazy\"") + "></div>";
		}).join("");
	}
	function thumbsHtml(srcs, start, labels) {
		return srcs.length < 2 ? "" : srcs.map((p, i) => {
			const photo = pic(p);
			return "<button type=\"button\" class=\"ud-gallery-thumb\"" + fitAttr(p) + " aria-label=\"" + esc(labels ? labels[i] : "Photo " + (i + 1)) + "\" aria-pressed=\"" + (i === start) + "\"><img src=\"" + esc(photo.thumb || photo.src) + "\" alt=\"\"" + focusAttr(p) + " loading=\"lazy\"></button>";
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
		const words = GALLERY_MESSAGES[galleryLanguage(doc)];
		swiper = new window.Swiper(main, {
			...galleryOptions(main, {
				messages: words,
				speed,
				start: parseInt(el.getAttribute("data-ud-gallery-start") || "0", 10)
			}),
			on: { slideChange: () => sync() }
		});
		const unroute = routeGalleryKeys(el, swiper);
		const untone = watchTone(main, swiper);
		const unwhole = showWhole(el, main, swiper, words);
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
				untone();
				unwhole();
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
