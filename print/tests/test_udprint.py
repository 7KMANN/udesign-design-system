"""The print kit: tokens resolve to the system's values, the logo is the official one, the chrome draws.

Run: python3 -m unittest discover -s print/tests   (needs PyMuPDF)
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
PRINT = os.path.dirname(HERE)
ROOT = os.path.dirname(PRINT)
sys.path.insert(0, PRINT)

import pymupdf as fitz  # noqa: E402

from udprint import Kit, Tokens, hex_rgb  # noqa: E402


def base_hex(dotted):
    """A colour from tokens/udesign.tokens.json, following references, the way the CSS build does."""
    with open(os.path.join(ROOT, 'tokens', 'udesign.tokens.json'), encoding='utf-8') as f:
        tree = json.load(f)
    node = tree
    for part in dotted.split('.'):
        node = node[part]
    value = node['$value']
    if isinstance(value, str):
        return base_hex(value.strip('{}'))
    return value['hex'].lower()


class TokenTests(unittest.TestCase):
    def setUp(self):
        self.t = Tokens()

    def test_print_colours_are_the_presentation_roles(self):
        expected = {'paper': 'color.white', 'ink': 'role.foreground', 'muted': 'role.muted-foreground',
                    'hairline': 'role.border', 'field': 'role.secondary', 'card': 'role.accent',
                    'accent': 'role.primary', 'lockup-tile': 'color.accent.base'}
        for name, base in expected.items():
            self.assertEqual(self.t.color(name), base_hex(base), name)

    def test_values_the_mockup_prints_today_are_unchanged(self):
        today = {'ink': '#1b1b1b', 'muted': '#706759', 'hairline': '#e4ded0', 'field': '#f4f1ea',
                 'field-deep': '#e4ded0', 'card': '#f3ead9', 'accent': '#c79f6b'}
        self.assertEqual({k: self.t.color(k) for k in today}, today)

    def test_every_text_role_is_complete_and_has_its_font_file(self):
        for role in self.t.roles():
            r = self.t.role(role)
            self.assertGreater(r['size'], 0, role)
            self.assertRegex(r['color'], r'^#[0-9a-f]{6}$', role)
            font = self.t.resolve('font.file.%d' % r['weight'])
            self.assertTrue(os.path.isfile(os.path.join(PRINT, 'udprint', 'fonts', font)), font)

    def test_a_base_reference_resolves_in_the_base_tree(self):
        # print color.ink -> role.foreground -> base color.ink: not a loop
        self.assertEqual(self.t.color('ink'), '#1b1b1b')

    def test_a_real_loop_is_reported(self):
        t = Tokens(print_tree={'a': {'$value': '{b}'}, 'b': {'$value': '{a}'}}, base_tree={})
        with self.assertRaises(ValueError):
            t.resolve('a')

    def test_page_formats(self):
        p = self.t.page('letter-landscape')
        self.assertEqual((p['width'], p['height']), (792, 612))
        self.assertEqual(set(self.t.formats()), {'letter-landscape', 'letter-portrait'})
        with self.assertRaises(KeyError):
            self.t.page('a4')

    def test_print_tokens_stay_out_of_the_css_build(self):
        # build.mjs feeds tokens/**/*.json to Style Dictionary: print's color.ink there would loop with the base one
        self.assertFalse(os.path.exists(os.path.join(ROOT, 'tokens', 'print.tokens.json')))


class LogoTests(unittest.TestCase):
    def test_print_logo_carries_the_registry_logo_paths(self):
        with open(os.path.join(ROOT, 'registry', 'new-york', 'ui', 'lockup.tsx'), encoding='utf-8') as f:
            tsx = f.read()
        with open(os.path.join(PRINT, 'udprint', 'assets', 'lockup.svg'), encoding='utf-8') as f:
            svg = f.read()
        names = re.findall(r'<path d="([^"]+)" />', tsx)
        self.assertTrue(names)
        for d in names:
            self.assertIn(d, svg)
        for transform in re.findall(r'transform="([^"]+)"', tsx):
            self.assertIn(transform, svg)
        self.assertIn('viewBox="0 0 850.39 218.49"', svg)

    def test_lockup_draws_the_tile_bars_and_name_in_their_token_colours(self):
        kit = Kit()
        doc = fitz.open()
        page, b = kit.new_page(doc)
        w = kit.lockup(page, b.x0, b.y0, height=20)
        self.assertAlmostEqual(w, 20 * 850.39 / 218.49, places=1)
        fills = {tuple(round(c, 3) for c in d['fill']) for d in page.get_drawings() if d.get('fill')}
        for name in ('lockup-tile', 'lockup-bars', 'lockup-name'):
            self.assertIn(tuple(round(c, 3) for c in hex_rgb(kit.t.color(name))), fills, name)
        self.assertEqual(page.get_text().strip(), '')     # drawn, never typed (D-62)


class ChromeTests(unittest.TestCase):
    def setUp(self):
        self.kit = Kit()
        self.doc = fitz.open()

    def test_header_footer_and_page_numbers(self):
        for _ in range(2):
            page, b = self.kit.new_page(self.doc)
            top = self.kit.header(page, 'Parea', lead='Hoodies', meta=('Maquette, version 3', '24 novembre 2026'))
            self.assertGreater(top, b.y0 + 56)
            self.kit.footer(page, 'Représentation visuelle.', ['udesignproductions.com', '819 481-1022'])
        self.kit.page_numbers(self.doc, 'Page %d de %d')
        text = self.doc[1].get_text()
        for s in ('Parea', 'Hoodies', 'Maquette, version 3', '24 novembre 2026', 'Représentation visuelle.',
                  'udesignproductions.com', '819 481-1022', 'Page 2 de 2'):
            self.assertIn(s, text)

    def test_a_single_page_gets_no_page_number(self):
        self.kit.new_page(self.doc)
        self.kit.page_numbers(self.doc, 'Page %d de %d')
        self.assertNotIn('Page', self.doc[0].get_text())

    def test_the_box_comes_from_the_page_size(self):
        page, box = self.kit.new_page(self.doc, 'letter-portrait')
        self.assertEqual(self.kit.box(self.doc[0]), box)
        self.assertEqual(box, (36, 36, 576, 762))
        odd = self.doc.new_page(width=300, height=300)
        with self.assertRaises(ValueError):
            self.kit.box(odd)

    def test_badge_draws_its_method_icon(self):
        page, b = self.kit.new_page(self.doc)
        self.kit.badge(page, (b.x0, b.y0, b.x0 + 28, b.y0 + 28), icon='embroidery')
        ink = tuple(round(c, 3) for c in hex_rgb(self.kit.t.color('ink')))
        drawn = [d for d in page.get_drawings() if tuple(round(c, 3) for c in (d.get('fill') or d.get('color') or ())) == ink]
        self.assertTrue(drawn)

    def test_a_zero_radius_draws_a_square_rectangle(self):
        page, b = self.kit.new_page(self.doc)
        self.kit.rrect(page, (b.x0, b.y0, b.x0 + 20, b.y0 + 20), 0, fill='card')
        items = page.get_drawings()[0]['items']
        self.assertEqual([i[0] for i in items], ['re'])

    def test_text_uses_the_role_size_and_colour(self):
        page, b = self.kit.new_page(self.doc)
        self.kit.text(page, b.x0, b.y0 + 20, 'Décoration', 'label')
        span = page.get_text('dict')['blocks'][0]['lines'][0]['spans'][0]
        self.assertAlmostEqual(span['size'], 7.5, places=1)
        self.assertEqual('#%06x' % span['color'], self.kit.t.color('muted'))

    def test_fit_shrinks_then_cuts(self):
        s, size = self.kit.fit('Broderie', 'strong', 1000, 8)
        self.assertEqual((s, size), ('Broderie', 10))
        s, size = self.kit.fit('Impression DTF sur la manche gauche', 'strong', 80, 8)
        self.assertEqual(size, 8)
        self.assertTrue(s.endswith('…'))
        self.assertLessEqual(self.kit.width(s, 'strong', size), 80)

    def test_wrap_keeps_whole_words_and_marks_what_is_left_out(self):
        lines = self.kit.wrap('Les couleurs peuvent varier à l’écran selon votre affichage', 'body', 90, 2)
        self.assertEqual(len(lines), 2)
        self.assertTrue(lines[-1].endswith('…'))
        for ln in lines:
            self.assertLessEqual(self.kit.width(ln, 'body'), 90)
        self.assertEqual(self.kit.wrap('Deux mots', 'body', 500, 2), ['Deux mots'])
        long = self.kit.wrap('Anticonstitutionnellement', 'body', 40, 2)
        self.assertTrue(long[0].endswith('…'))
        self.assertLessEqual(self.kit.width(long[0], 'body'), 40)


class VendoredTests(unittest.TestCase):
    def test_the_built_copy_matches_its_sources(self):
        built = os.path.join(ROOT, 'dist', 'print', 'udprint')
        if not os.path.isdir(built):
            self.skipTest('run npm run build first')
        src = os.path.join(PRINT, 'udprint')
        pairs = [(os.path.join(built, 'print.tokens.json'), os.path.join(PRINT, 'print.tokens.json')),
                 (os.path.join(built, 'udesign.tokens.json'), os.path.join(ROOT, 'tokens', 'udesign.tokens.json'))]
        for d, _, files in os.walk(src):
            if '__pycache__' in d:
                continue
            for name in files:
                if not name.endswith('.pyc'):
                    p = os.path.join(d, name)
                    pairs.append((os.path.join(built, os.path.relpath(p, src)), p))
        for b_path, s_path in pairs:
            with open(b_path, 'rb') as fb, open(s_path, 'rb') as fs:
                self.assertEqual(fb.read(), fs.read(), os.path.relpath(b_path, ROOT))

    def test_a_copy_with_its_token_files_reads_only_its_own_folder(self):
        tmp = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, tmp)
        dst = os.path.join(tmp, 'udprint')
        shutil.copytree(os.path.join(PRINT, 'udprint'), dst, ignore=shutil.ignore_patterns('__pycache__'))
        shutil.copy(os.path.join(PRINT, 'print.tokens.json'), dst)
        shutil.copy(os.path.join(ROOT, 'tokens', 'udesign.tokens.json'), dst)
        code = ('import sys; sys.path.insert(0, %r); import udprint, udprint.tokens as t; '
                'assert t._path("print.tokens.json").startswith(%r); print(udprint.Tokens().color("accent"))'
                % (tmp, dst))
        out = subprocess.run([sys.executable, '-c', code], capture_output=True, text=True, cwd=tmp)
        self.assertEqual(out.returncode, 0, out.stderr)
        self.assertEqual(out.stdout.strip(), '#c79f6b')


if __name__ == '__main__':
    unittest.main()
