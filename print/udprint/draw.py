"""Page primitives for UDesign print documents (PyMuPDF).

A document composes these for its chrome and type: the header with the official logo, text in named roles,
the field, card, badge, method icon and tag, the footer and the page numbers. Its own content (garments,
artwork, stitches) is drawn by the document itself, on top.
"""
import os
from collections import namedtuple

import pymupdf as fitz

from .tokens import HERE, Tokens

Box = namedtuple('Box', 'x0 y0 x1 y1')
_FONT_DIR = os.path.join(HERE, 'fonts')
_ASSET_DIR = os.path.join(HERE, 'assets')
_K = 0.5523                     # Bezier handle length for a quarter circle

# Header and footer layout, in points. Part of the approved page, so named here rather than repeated.
TITLE_BASELINE = 56             # below the top margin
LEAD_GAP = 18                   # title baseline to lead baseline
AFTER_TITLE = 13                # title baseline to content, no lead
AFTER_LEAD = 12                 # lead baseline to content
ITEM_GAP = 18                   # between header meta items, and between footer contact items
FOOTER_RULE = 13                # hairline above the footer baseline
FOOTER_CLEAR = 12               # content stops this far above the hairline
PAGE_NUMBER_ROOM = 58           # kept free at the right of the footer for "Page 10 de 12"
TAG_HEIGHT = 16


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


class Kit:
    def __init__(self, tokens=None):
        self.t = tokens or Tokens()
        self._fonts = {}
        self._logos = {}

    # ------------------------------------------------------------------ colour and type
    def rgb(self, color):
        """A print colour by name ('ink', 'muted', 'card') or a hex string, as PyMuPDF's 0-1 tuple."""
        return hex_rgb(color if color.startswith('#') else self.t.color(color))

    @staticmethod
    def _font_key(weight):
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
        w = self.width(s, role, size)
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
        """(text, size): the role's size, or smaller down to floor, at which s fits maxw; cut only if it still
        does not fit at floor."""
        size = self.style(role)['size']
        w = self.width(s, role)
        if w > maxw:
            size = max(floor, size * maxw / w * 0.99)
        return self.ellipsize(s, role, maxw, size), size

    def wrap(self, s, role, maxw, max_lines, size=None):
        """Lines of s, each within maxw. A word too long for a line is cut; when words remain after the last
        allowed line, it ends with an ellipsis."""
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
            cur = self.ellipsize(wd, role, maxw, size)
        if cur:
            lines.append(cur)
        return lines

    # ------------------------------------------------------------------ pages
    def new_page(self, doc, fmt='letter-landscape'):
        """A blank page of a print format, its fonts loaded. Returns (page, box): box is the area inside
        the margins."""
        p = self.t.page(fmt)
        page = doc.new_page(width=p['width'], height=p['height'])
        self.use_fonts(page)
        return page, self.box(page)

    def use_fonts(self, page):
        """Load the kit's fonts on a page the document made itself, before drawing text on it with the kit."""
        for weight in (500, 600, 700, 900):
            page.insert_font(fontname=self._font_key(weight),
                             fontfile=os.path.join(_FONT_DIR, self.t.resolve('font.file.%d' % weight)))

    def box(self, page):
        """The area inside the margins of the print format this page's size belongs to."""
        w, h = page.rect.width, page.rect.height
        for fmt in self.t.formats():
            p = self.t.page(fmt)
            if abs(p['width'] - w) < 0.5 and abs(p['height'] - h) < 0.5:
                return Box(p['margin-left'], p['margin-top'], w - p['margin-right'], h - p['margin-bottom'])
        raise ValueError('a %g x %g pt page is not a print format (%s)' % (w, h, ', '.join(self.t.formats())))

    def content_bottom(self, page):
        """The lowest y content may reach: above the footer's hairline."""
        return self.box(page).y1 - FOOTER_RULE - FOOTER_CLEAR

    def finish(self, doc, path, title):
        """Metadata, fonts cut down to the characters used, then save."""
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
    def _row(self, page, right, baseline, items, roles):
        """Items laid out leftward from `right`, ITEM_GAP apart; roles[0] for the last item, roles[1] for the
        others. Returns the x where the row starts."""
        x = right
        for i, item in enumerate(reversed(items)):
            x -= self.text(page, x, baseline, item, roles[0] if i == 0 else roles[1], align='right') + ITEM_GAP
        return x + ITEM_GAP

    def header(self, page, title, lead=None, meta=()):
        """Logo at top left; meta at top right, centred on the logo (the last item, a date, muted); then the
        title and its lead line. Returns the y where content can start."""
        b = self.box(page)
        h = self.t.number('lockup.height')
        self.lockup(page, b.x0, b.y0)
        self._row(page, b.x1, b.y0 + h / 2 + 3, list(meta), ('body-muted', 'meta'))
        ty = b.y0 + TITLE_BASELINE
        self.text(page, b.x0, ty, title, 'title')
        if lead:
            self.text(page, b.x0, ty + LEAD_GAP, lead, 'lead')
            return ty + LEAD_GAP + AFTER_LEAD
        return ty + AFTER_TITLE

    def footer(self, page, note, contact=(), numbered=True):
        """Hairline, the note at left (what the page is: a visual, approximate sizes), the public contact items
        at right, leaving room for the page number unless numbered=False (a one-page document)."""
        b = self.box(page)
        self.rule(page, b.x0, b.x1, b.y1 - FOOTER_RULE)
        right = b.x1 - PAGE_NUMBER_ROOM if numbered else b.x1
        start = self._row(page, right, b.y1, list(contact), ('fine', 'fine'))
        self.text(page, b.x0, b.y1, self.ellipsize(note, 'fine', start - b.x0 - ITEM_GAP), 'fine')

    def page_numbers(self, doc, pattern):
        """'Page %d de %d' at the bottom right of every page of a document with more than one page."""
        n = len(doc)
        if n < 2:
            return
        for i, page in enumerate(doc):
            b = self.box(page)
            self.text(page, b.x1, b.y1, pattern % (i + 1, n), 'fine-strong', align='right')

    # ------------------------------------------------------------------ surfaces
    def rrect(self, page, rect, radius, fill=None, stroke=None, width=0.6):
        rect = fitz.Rect(rect)
        rel = min(0.5, radius / max(1.0, min(rect.width, rect.height))) if radius > 0 else None
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

    def badge(self, page, rect, icon=None):
        """The accent square on a card, the same shape as the logo's tile, with a method icon in it."""
        self.rrect(page, rect, self.t.number('radius.card'), fill='accent')
        if icon:
            r = fitz.Rect(rect)
            inset = r.width * 0.16
            self.method_icon(page, icon, (r.x0 + inset, r.y0 + inset, r.x1 - inset, r.y1 - inset))

    def tag(self, page, x, baseline, label, maxw=None):
        """An option tag ("Option A"): accent pill, the word in the tag role. Returns its width."""
        pad = self.t.number('space.inset')
        s, size = self.fit(label, 'tag', maxw - 2 * pad, 7) if maxw else (label, None)
        w = self.width(s, 'tag', size) + 2 * pad
        top = baseline - TAG_HEIGHT * 0.72
        self.rrect(page, (x, top, x + w, top + TAG_HEIGHT), self.t.number('radius.tag'), fill='accent')
        self.text(page, x + pad, baseline - 0.3, s, 'tag', size=size)
        return w

    def swatch(self, page, x, y, size, fill, edge=None):
        """A colour chip: fill and edge are hex (a product colour and its seam colour)."""
        self.rrect(page, (x, y, x + size, y + size), self.t.number('radius.swatch'), fill=fill, stroke=edge or 'hairline')

    def method_icon(self, page, key, rect, color='ink'):
        """The decoration method's glyph in a square: spool (embroidery), ink drop (print), peeling film (dtf),
        stitched shield (patch), a dot for anything else."""
        x, y, x1, _ = rect
        k = (x1 - x) / 24.0
        col = self.rgb(color)
        P = lambda a, b: fitz.Point(x + a * k, y + b * k)  # noqa: E731
        sh = page.new_shape()
        w = 1.7 * k
        if key == 'embroidery':
            sh.draw_rect(fitz.Rect(P(4.5, 2.5), P(17.5, 5.5)), radius=0.35)
            sh.draw_rect(fitz.Rect(P(4.5, 18.5), P(17.5, 21.5)), radius=0.35)
            sh.finish(color=None, fill=col)
            sh.draw_rect(fitz.Rect(P(6.5, 5.5), P(15.5, 18.5)))
            sh.finish(color=col, width=w * 0.9)
            for yy in (8.6, 12, 15.4):
                sh.draw_line(P(6.5, yy), P(15.5, yy - 1.4))
            sh.finish(color=col, width=w * 0.75, lineCap=1)
            sh.draw_bezier(P(15.5, 9), P(20.5, 10), P(21, 15), P(20.5, 21))
            sh.finish(color=col, width=w * 0.8, lineCap=1)
        elif key == 'print':
            sh.draw_bezier(P(12, 3), P(12, 3), P(5, 11.5), P(5, 15))
            sh.draw_bezier(P(5, 15), P(5, 19), P(8.2, 21.5), P(12, 21.5))
            sh.draw_bezier(P(12, 21.5), P(15.8, 21.5), P(19, 19), P(19, 15))
            sh.draw_bezier(P(19, 15), P(19, 11.5), P(12, 3), P(12, 3))
            sh.finish(color=None, fill=col, closePath=True)
        elif key == 'dtf':
            sh.draw_polyline([P(4, 4), P(20, 4), P(20, 13), P(13, 20), P(4, 20), P(4, 4)])
            sh.finish(color=col, width=w, closePath=True, lineJoin=1)
            sh.draw_polyline([P(20, 13), P(13, 13), P(13, 20)])
            sh.finish(color=col, width=w, lineJoin=1)
            sh.draw_oval(fitz.Rect(P(7.5, 7.5), P(12, 12)))
            sh.finish(color=None, fill=col)
        elif key == 'patch':
            def shield(i):
                return [P(4 + i, 4 + i), P(20 - i, 4 + i), P(20 - i, 12), P(12, 21 - i * 1.3), P(4 + i, 12),
                        P(4 + i, 4 + i)]
            sh.draw_polyline(shield(0))
            sh.finish(color=col, width=w, closePath=True, lineJoin=1)
            sh.draw_polyline(shield(3))
            sh.finish(color=col, width=w * 0.7, closePath=True, lineJoin=1,
                      dashes='[%.2f %.2f] 0' % (1.5 * k, 1.2 * k))
        else:
            sh.draw_circle(P(12, 12), 4.5 * k)
            sh.finish(color=None, fill=col)
        sh.commit()

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
