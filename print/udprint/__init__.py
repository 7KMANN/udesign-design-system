"""udprint: UDesign print documents (proposed print scenario, ECH-396).

    import pymupdf
    from udprint import Kit

    kit = Kit()
    doc = pymupdf.open()
    page, box = kit.new_page(doc, 'letter-landscape')
    top = kit.header(page, 'Client', lead='Ce que la page montre', meta=('Maquette, version 1', '24 novembre 2026'))
    kit.text(page, box.x0, top + 20, 'Vêtement', 'label')
    kit.footer(page, 'Représentation visuelle.', 'udesignproductions.com     819 481-1022')
    kit.page_numbers(doc, 'Page %d de %d')
    kit.finish(doc, 'out.pdf', 'UDesign Maquette Client')

Colours, text roles, radii, page formats and the font files come from tokens/print.tokens.json; the kit
draws them and holds none of its own. Requires PyMuPDF only.
"""
from .draw import Box, Kit, hex_rgb
from .tokens import Tokens

__all__ = ['Box', 'Kit', 'Tokens', 'hex_rgb']
