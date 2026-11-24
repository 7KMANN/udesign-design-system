#!/usr/bin/env python3
"""The print kit's reference sheet: its tokens and primitives, drawn by the kit itself.

    python3 print/reference.py OUT.pdf [--png DIR]

The showcase page "Print (proposed)" shows this sheet; it is what the owner approves.
"""
import argparse
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import pymupdf as fitz  # noqa: E402

from udprint import Kit  # noqa: E402

COLOURS = [
    ('paper', 'The page'), ('ink', 'Text'), ('muted', 'Secondary text'), ('hairline', 'Rules, chip edges'),
    ('field', 'Under a product'), ('field-deep', 'Under a white product'), ('card', 'A decision card'),
    ('accent', 'Tile, badge, tag'),
]
TYPE = [
    ('title', 'Pro-Métal'), ('heading', 'Gildan 18500'), ('lead', 'Programmes informatiques'),
    ('strong', 'Broderie'), ('body', 'Noir, coutures gris foncé'), ('body-muted', 'Poitrine gauche'),
    ('meta', 'Maquette, version 3'), ('tag', 'Option A'), ('label', 'Décoration'), ('caption', 'Taille M'),
    ('fine', 'Représentation visuelle.'), ('fine-strong', 'Page 1 de 4'),
]
# Product colours come from the shop's colour chart, not from tokens: two examples, fill and seam.
PRODUCTS = [('Noir', '#1b1b1b', '#3a3a3a'), ('Blanc', '#ffffff', '#d6cdb9')]


def build(out, png_dir=None):
    kit = Kit()
    doc = fitz.open()
    page, b = kit.new_page(doc, 'letter-landscape')
    top = kit.header(page, 'Print kit', lead='Proposed print scenario for client PDFs (ECH-396). Colours, text '
                     'roles, radii and the logo on this sheet come from print/print.tokens.json.',
                     meta=('Proposal', '24 November 2026'))
    gap = kit.t.number('space.gap')
    inset = kit.t.number('space.inset')
    col = (b.x1 - b.x0 - 2 * gap) / 3
    xs = [b.x0 + i * (col + gap) for i in range(3)]
    y0 = top + 18

    # column 1: logo, then colour
    x = xs[0]
    kit.text(page, x, y0, 'Logo', 'heading')
    y = y0 + 16
    h = kit.t.number('lockup.height')
    w = kit.lockup(page, x, y)
    kit.text(page, x + w + 10, y + h / 2 + 3, 'In the header, %g pt tall' % h, 'caption')
    y += h + 14
    kit.lockup(page, x, y, height=40)
    mark_x = x + col - 40
    kit.lockup(page, mark_x, y, height=40, variant='mark')
    kit.text(page, mark_x + 20, y + 52, 'Mark alone', 'caption', align='center')
    y += 70
    kit.text(page, x, y, 'Drawn from the official file (D-62), never typed.', 'caption')
    y += 30
    kit.text(page, x, y, 'Colour', 'heading')
    y += 16
    for name, use in COLOURS:
        kit.swatch(page, x, y - 2, 18, kit.t.color(name))
        kit.text(page, x + 26, y + 6, name, 'meta')
        kit.text(page, x + 26, y + 16, use, 'caption')
        kit.text(page, x + col, y + 6, kit.t.color(name).upper(), 'caption', align='right')
        y += 27

    # column 2: text roles
    x = xs[1]
    kit.text(page, x, y0, 'Text roles', 'heading')
    kit.text(page, x + col, y0, 'size in pt / weight', 'caption', align='right')
    y = y0 + 16
    for role, sample in TYPE:
        r = kit.style(role)
        base = y + r['size'] * 0.85
        kit.text(page, x, base, kit.ellipsize(sample, role, col - 74), role)
        kit.text(page, x + col, base, '%s  %g / %d' % (role, r['size'], r['weight']), 'caption', align='right')
        y += max(18.0, r['size'] * 1.25 + 9)

    # column 3: surfaces
    x = xs[2]
    kit.text(page, x, y0, 'Surfaces', 'heading')
    y = y0 + 16
    half = (col - inset) / 2
    kit.field(page, (x, y, x + half, y + 56))
    kit.text(page, x + 10, y + 48, 'field', 'caption')
    kit.field(page, (x + half + inset, y, x + col, y + 56), deep=True)
    kit.text(page, x + half + inset + 10, y + 48, 'field-deep', 'caption')
    y += 70
    kit.card(page, (x, y, x + col, y + 44))
    kit.badge(page, (x + inset, y + inset, x + inset + 28, y + inset + 28), icon='embroidery')
    kit.text(page, x + 46, y + 20, 'Broderie', 'strong')
    kit.text(page, x + 46, y + 33, 'Poitrine gauche', 'body-muted')
    y += 58
    tag_x = [x, x + kit.tag(page, x, y + 11.5, 'Option A') + inset]
    kit.tag(page, tag_x[1], y + 11.5, 'Option B')
    y += 30
    for tx, (name, fill, seam) in zip(tag_x, PRODUCTS):
        kit.swatch(page, tx, y, 10, fill, seam)
        kit.text(page, tx + 16, y + 8.5, name, 'body')
    y += 24
    for line in kit.wrap('Product and thread colours come from the shop\'s colour chart, not from tokens.',
                         'caption', col, 2):
        kit.text(page, x, y, line, 'caption')
        y += 11
    kit.text(page, x, y, 'Radii: field %g, card %g, tag %g, chip %g pt.' % tuple(
        kit.t.number('radius.' + k) for k in ('field', 'card', 'tag', 'swatch')), 'caption')
    y += 26
    kit.text(page, x, y, 'Departures from the presentation profile', 'label')
    for line in ('White paper instead of the cream background.', 'Montserrat for all text, no Geist.',
                 'Light only: a printed page has one theme.', 'Sizes in points on a fixed page, no breakpoints.'):
        y += 13
        kit.text(page, x, y, kit.ellipsize(line, 'body', col), 'body')

    kit.footer(page, 'Reference sheet. Print at 100% to check sizes.', ['udesignproductions.com', '819 481-1022'])
    kit.finish(doc, out, 'UDesign print kit')
    pngs = []
    if png_dir:
        os.makedirs(png_dir, exist_ok=True)
        for i, pg in enumerate(fitz.open(out)):
            p = os.path.join(png_dir, 'print-reference-p%d.png' % (i + 1))
            pg.get_pixmap(dpi=144).save(p)
            pngs.append(p)
    return pngs


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('out')
    ap.add_argument('--png')
    a = ap.parse_args()
    print('\n'.join([a.out] + build(a.out, a.png)))
