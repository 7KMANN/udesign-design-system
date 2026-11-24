"""Page primitives for UDesign print documents (PyMuPDF).

A document composes these and nothing else for its chrome and type: the header with the official logo,
text in named roles, the field, card, badge and tag, the footer and the page numbers. Its own content
(garments, artwork, stitches) is drawn by the document itself, on top.
"""
import os
from collections import namedtuple

import pymupdf as fitz

from .tokens import HERE, Tokens

Box = namedtuple('Box', 'x0 y0 x1 y1')
_FONT_DIR = os.path.join(HERE, 'fonts')
_ASSET_DIR = os.path.join(HERE, 'assets')
_K = 0.5523                                   # Bezier handle for a quarter circle


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


class Kit:
    def __init__(self, tokens=None):
        self.t = tokens or Tokens()
        self._fonts = {}
        self._logos = {}
        self._boxes = {}

    # ------------------------------------------------------------------ colour and type
    def rgb(self, color):
        """A print colour by name ('ink', 'muted', 'card') or a hex string, as PyMuPDF's 0-1 tuple."""
        return hex_rgb(color if color.startswith('#') else self.t.color(color))

    def _font_key(self, weight):
        return 'ud%d' % int(weight)

    def font(self, weight):
        weight = int(weight)
        if weight not in self._fonts:
            self._fonts[weight] = fitz.Font(fontfile=os.path.join(_FONT_DIR, self.t.resolve('font.file.%d' % weight)))
        return self._fonts[weight]

    def style(self, role, size=None):
        r = self.t.role(role)
        if size is not None:
            r['size'] = size
        return r

    def width(self, s, role, size=None):
        r = self.style(role, size)
        return self.font(r['weight']).text_length(s, fontsize=r['size'])

    def text(self, page, x, y, s, role='body', color=None, align='left', size=None):
        """Draw s with its baseline at y. Returns its width."""
        r = self.style(role, size)
        w = self.font(r['weight']).text_length(s, fontsize=r['size'])
        if align == 'right':
            x -= w
        elif align == 'center':
            x -= w / 2
        page.insert_text((x, y), s, fontname=self._font_key(r['weight']), fontsize=r['size'],
                         color=self.rgb(color or r['color']))
        return w

    def ellipsize(self, s, role, maxw, size=None):
        """s shortened with an ellipsis until it fits maxw."""
        if self.width(s, role, size) <= maxw:
            return s
        while s and self.width(s + '…', role, size) > maxw:
            s = s[:-1]
        return s.rstrip(' ,') + '…'

    def fit(self, s, role, maxw, floor):
        """(text, size): the role's size, or smaller down to floor, at which s fits maxw; then cut if it still
        does not. Use it where the words must stay whole as long as possible."""
        size = self.style(role)['size']
        w = self.width(s, role)
        if w > maxw:
            size = max(floor, size * maxw / w * 0.99)
        return self.ellipsize(s, role, maxw, size), size

    def wrap(self, s, role, maxw, max_lines, size=None):
        """Lines of s that fit maxw; the last allowed line ends with an ellipsis when words remain."""
        words, lines, cur = s.split(), [], ''
        for i, wd in enumerate(words):
            t = (cur + ' ' + wd).strip()
            if self.width(t, role, size) <= maxw:
                cur = t
                continue
            if cur:
                lines.append(cur)
            if len(lines) == max_lines:
                lines[-1] = self.ellipsize(' '.join([lines[-1]] + words[i:]), role, maxw, size)
                return lines
            cur = wd
        if cur:
            lines.append(cur)
        return lines

    # ------------------------------------------------------------------ pages
    def new_page(self, doc, fmt='letter-landscape'):
        """A blank page of a print format, its fonts loaded. Returns (page, box): box is the area inside
        the margins."""
        p = self.t.page(fmt)
        page = doc.new_page(width=p['width'], height=p['height'])
        for weight in (500, 600, 700, 900):
            page.insert_font(fontname=self._font_key(weight),
                             fontfile=os.path.join(_FONT_DIR, self.t.resolve('font.file.%d' % weight)))
        box = Box(p['margin-left'], p['margin-top'], p['width'] - p['margin-right'], p['height'] - p['margin-bottom'])
        self._boxes[(id(doc), page.number)] = box
        return page, box

    def box(self, page):
        return self._boxes[(id(page.parent), page.number)]

    def finish(self, doc, path, title):
        """Metadata, fonts subset to the characters used, then save."""
        doc.set_metadata({'title': title, 'author': 'UDesign Productions', 'creator': 'UDesign',
                          'producer': 'UDesign'})
        doc.subset_fonts()
        doc.save(path, garbage=4, deflate=True)

    # ------------------------------------------------------------------ logo
    def _logo(self, variant, name_color):
        key = (variant, name_color)
        if key not in self._logos:
            with open(os.path.join(_ASSET_DIR, 'lockup.svg' if variant == 'full' else 'mark.svg'), encoding='utf-8') as f:
                svg = f.read()
            svg = (svg.replace('{tile}', self.t.color('lockup-tile')).replace('{bars}', self.t.color('lockup-bars'))
                   .replace('{name}', name_color))
            src = fitz.open(stream=svg.encode('utf-8'), filetype='svg')
            self._logos[key] = fitz.open('pdf', src.convert_to_pdf())
        return self._logos[key]

    def lockup(self, page, x, y, height=None, variant='full', name_color=None):
        """The official logo, its top left at (x, y), `height` points tall (the header size by default).
        variant 'mark' is the tile alone. The name takes the surface's text colour: ink on paper.
        Returns its width."""
        h = height or self.t.number('lockup.height')
        logo = self._logo(variant, self.t.color('lockup-name') if name_color is None else name_color)
        r = logo[0].rect
        w = h * r.width / r.height
        page.show_pdf_page(fitz.Rect(x, y, x + w, y + h), logo, 0)
        return w

    # ------------------------------------------------------------------ chrome
    def header(self, page, title, lead=None, meta=()):
        """Logo at top left; meta at top right (the last item, a date, in the muted colour); then the title and
        its lead line. Returns the y where content can start."""
        b = self.box(page)
        self.lockup(page, b.x0, b.y0)
        x = b.x1
        base = b.y0 + self.t.number('lockup.height') / 2 + 3      # meta centred on the logo
        for i, item in enumerate(reversed(meta)):
            x -= self.text(page, x, base, item, 'body-muted' if i == 0 else 'meta', align='right') + 18
        ty = b.y0 + 56
        self.text(page, b.x0, ty, title, 'title')
        if lead:
            self.text(page, b.x0, ty + 18, lead, 'lead')
            return ty + 30
        return ty + 13

    def footer(self, page, note, contact):
        """Hairline, the note at left (what the page is not: approximate sizes, screen colours), the public
        contact at right, leaving room for the page number."""
        b = self.box(page)
        self.rule(page, b.x0, b.x1, b.y1 - 13)
        self.text(page, b.x0, b.y1, self.ellipsize(note, 'fine', b.x1 - b.x0 - 240), 'fine')
        self.text(page, b.x1 - 58, b.y1, contact, 'fine', align='right')

    def page_numbers(self, doc, pattern):
        """'Page %d de %d' at the bottom right of every page."""
        n = len(doc)
        for i, page in enumerate(doc):
            b = self.box(page)
            self.text(page, b.x1, b.y1, pattern % (i + 1, n), 'fine-strong', align='right')

    def content_bottom(self, page):
        """The lowest y content may reach: above the footer's hairline, with a gap."""
        return self.box(page).y1 - 13 - 12

    # ------------------------------------------------------------------ surfaces
    def rrect(self, page, rect, radius, fill=None, stroke=None, width=0.6):
        rect = fitz.Rect(rect)
        rel = min(0.5, radius / max(1.0, min(rect.width, rect.height)))
        page.draw_rect(rect, color=self.rgb(stroke) if stroke else None, fill=self.rgb(fill) if fill else None,
                       width=width if stroke else 0, radius=rel)

    def rule(self, page, x0, x1, y):
        page.draw_line((x0, y), (x1, y), color=self.rgb('hairline'), width=0.5)

    def field(self, page, rect, deep=False):
        """The warm field a product sits on; deep=True under a white or cream product."""
        self.rrect(page, rect, self.t.number('radius.field'), fill='field-deep' if deep else 'field')

    def card(self, page, rect):
        """A card that names one decision (a decoration, an option)."""
        self.rrect(page, rect, self.t.number('radius.card'), fill='card')

    def badge(self, page, rect):
        """The accent square that holds an icon on a card: the same shape as the logo's tile."""
        self.rrect(page, rect, self.t.number('radius.card'), fill='accent')

    def tag(self, page, x, baseline, label, maxw=None):
        """An option tag ("Option A"): accent pill, the word in the tag role. Returns its width."""
        s, size = self.fit(label, 'tag', maxw - 16, 7) if maxw else (label, None)
        w = self.width(s, 'tag', size) + 16
        self.rrect(page, (x, baseline - 11.5, x + w, baseline + 4.5), self.t.number('radius.tag'), fill='accent')
        self.text(page, x + 8, baseline - 0.3, s, 'tag', size=size)
        return w

    def swatch(self, page, x, y, size, fill, edge=None):
        """A colour chip: fill and edge are hex (a product colour and its seam colour)."""
        self.rrect(page, (x, y, x + size, y + size), self.t.number('radius.swatch'), fill=fill, stroke=edge or 'hairline')

    def round_corners(self, page, rect, radius=None, out=1.5):
        """Paint the paper colour outside a rounded outline, so a square picture placed in rect reads as a
        rounded field, with no edge pixel showing past it."""
        r = radius or self.t.number('radius.field')
        x0, y0, x1, y1 = rect
        c = _K * r
        paper = self.rgb('paper')
        sh = page.new_shape()
        for px, py, sx, sy in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
            o = fitz.Point(px - sx * out, py - sy * out)
            a, b = fitz.Point(px, py + sy * r), fitz.Point(px + sx * r, py)
            sh.draw_polyline([o, fitz.Point(o.x, a.y), a])
            sh.draw_bezier(a, fitz.Point(px, py + sy * (r - c)), fitz.Point(px + sx * (r - c), py), b)
            sh.draw_polyline([b, fitz.Point(b.x, o.y), o])
            sh.finish(color=None, fill=paper, closePath=True)
        for band in ((x0 - out, y0 - out, x1 + out, y0), (x0 - out, y1, x1 + out, y1 + out),
                     (x0 - out, y0, x0, y1), (x1, y0, x1 + out, y1)):
            sh.draw_rect(fitz.Rect(band))
        sh.finish(color=None, fill=paper)
        sh.commit()
