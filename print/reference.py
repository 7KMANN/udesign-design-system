#!/usr/bin/env python3
"""The print kit's reference sheet: every token and primitive, drawn by the kit itself.

    python3 print/reference.py OUT.pdf [--png DIR]

The showcase page "Print" shows this sheet; it is what the owner approves.
"""
import argparse
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import pymupdf as fitz  # noqa: E402

from udprint import Kit  # noqa: E402

COLOURS = [
    ('paper', 'The page'), ('ink', 'Text'), ('muted', 'Secondary text'), ('hairline', 'Rules, tile edges'),
    ('field', 'Under a product'), ('field-deep', 'Under a white product'), ('card', 'A decision card'),
    ('accent', 'Tile, badge, tag'),
]
TYPE = [
    ('title', 'Pro-Métal'), ('heading', 'Gildan 18500'), ('lead', 'Programmes informatiques'),
    ('strong', 'Broderie'), ('body', 'Noir, coutures gris foncé'), ('body-muted', 'Poitrine gauche, env. 3,5 po'),
    ('meta', 'Maquette, version 3'), ('tag', 'Option A'), ('label', 'Décoration'), ('caption', 'Taille M'),
    ('fine', 'Représentation visuelle.'), ('fine-strong', 'Page 1 de 4'),
]


def section(kit, page, x, y, title):
    kit.text(page, x, y, title, 'heading')
    return y + 16


def build(out, png_dir=None):
    kit = Kit()
    doc = fitz.open()
    page, b = kit.new_page(doc, 'letter-landscape')
    top = kit.header(page, 'Print kit', lead='Proposed print scenario for client PDFs (ECH-396). Every colour, '
                     'size and shape on this sheet comes from tokens/print.tokens.json.',
                     meta=('Proposal', '24 November 2026'))
    gap = kit.t.number('space.gap')
    col = (b.x1 - b.x0 - 2 * gap) / 3
    xs = [b.x0 + i * (col + gap) for i in range(3)]
    y0 = top + 18

    # column 1: logo, then colour
    y = section(kit, page, xs[0], y0, 'Logo')
    w = kit.lockup(page, xs[0], y + 4)
    kit.text(page, xs[0] + w + 10, y + 17, 'Header size, %g pt tall' % kit.t.number('lockup.height'), 'caption')
    kit.lockup(page, xs[0], y + 34, height=40)
    kit.lockup(page, xs[0] + col - 40, y + 34, height=40, variant='mark')
    y += 88
    kit.text(page, xs[0], y, 'Drawn from the official file (D-62), never typed.', 'caption')
    y = section(kit, page, xs[0], y + 28, 'Colour')
    for name, use in COLOURS:
        kit.swatch(page, xs[0], y - 2, 18, kit.t.color(name))
        kit.text(page, xs[0] + 26, y + 6, name, 'strong', size=8.5)
        kit.text(page, xs[0] + 26, y + 16, use, 'caption')
        kit.text(page, xs[0] + col, y + 6, kit.t.color(name).upper(), 'caption', align='right')
        y += 27

    # column 2: type roles
    y = section(kit, page, xs[1], y0, 'Text roles')
    for role, sample in TYPE:
        r = kit.style(role)
        lh = max(18.0, r['size'] * 1.25 + 9)
        kit.text(page, xs[1], y + r['size'] * 0.85, kit.ellipsize(sample, role, col - 74), role)
        spec = '%s  %g / %d' % (role, r['size'], r['weight'])
        kit.text(page, xs[1] + col, y + r['size'] * 0.85, spec, 'caption', align='right')
        y += lh

    # column 3: surfaces
    x = xs[2]
    y = section(kit, page, x, y0, 'Surfaces')
    half = (col - 8) / 2
    kit.field(page, (x, y, x + half, y + 56))
    kit.text(page, x + 10, y + 48, 'field', 'caption')
    kit.field(page, (x + half + 8, y, x + col, y + 56), deep=True)
    kit.text(page, x + half + 18, y + 48, 'field-deep', 'caption')
    y += 70
    kit.card(page, (x, y, x + col, y + 44))
    kit.badge(page, (x + 8, y + 8, x + 36, y + 36))
    kit.text(page, x + 46, y + 20, 'Broderie', 'strong')
    kit.text(page, x + 46, y + 33, 'Poitrine gauche', 'body-muted')
    y += 58
    tw = kit.tag(page, x, y + 11.5, 'Option A')
    kit.tag(page, x + tw + 8, y + 11.5, 'Option B')
    y += 30
    kit.swatch(page, x, y, 10, '#1b1b1b', '#3a3a3a')
    kit.text(page, x + 16, y + 8.5, 'Noir', 'body')
    kit.swatch(page, x + 70, y, 10, '#f4f2ee', '#d6cdb9')
    kit.text(page, x + 86, y + 8.5, 'Blanc', 'body')
    y += 26
    for line in kit.wrap('Product and thread colours come from the shop\'s colour chart, not from tokens.',
                         'caption', col, 2):
        kit.text(page, x, y, line, 'caption')
        y += 11
    y += 14
    kit.text(page, x, y, 'Departures from the presentation profile', 'label')
    for line in ('White paper instead of the cream background.', 'Montserrat for all text, no Geist.',
                 'Light only: a printed page has one theme.', 'Sizes in points on a fixed page, no breakpoints.'):
        y += 13
        kit.text(page, x, y, kit.ellipsize(line, 'body', col), 'body')

    kit.footer(page, 'Reference sheet. Print at 100 % to check sizes.', 'udesignproductions.com     819 481-1022')
    kit.page_numbers(doc, 'Page %d of %d')
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
