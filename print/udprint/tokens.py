"""Print tokens: tokens/print.tokens.json resolved against tokens/udesign.tokens.json.

In this repository the two files are read from tokens/. A release copies them next to this module
(dist/print/udprint/), so a vendored kit reads its own copies and never reaches outside its folder.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
_REF = re.compile(r'^\{([^{}]+)\}$')


def _path(name):
    for d in (HERE, os.path.join(HERE, '..', '..', 'tokens')):
        p = os.path.join(d, name)
        if os.path.isfile(p):
            return p
    raise FileNotFoundError('%s not found next to udprint or in tokens/' % name)


def _get(tree, dotted):
    node = tree
    for part in dotted.split('.'):
        if not isinstance(node, dict) or part not in node:
            return None
        node = node[part]
    return node


class Tokens:
    """Resolved print tokens. color('ink') -> '#1b1b1b', number('page.letter-landscape.width') -> 792."""

    def __init__(self, print_tree=None, base_tree=None):
        if print_tree is None:
            with open(_path('print.tokens.json'), encoding='utf-8') as f:
                print_tree = json.load(f)
        if base_tree is None:
            with open(_path('udesign.tokens.json'), encoding='utf-8') as f:
                base_tree = json.load(f)
        self.print_tree, self.base_tree = print_tree, base_tree

    def resolve(self, dotted, _seen=(), _base_only=False):
        """Value of a token by its dotted name, print tree first, then the base tree. A reference written in
        the base tree resolves in the base tree only. A color becomes its hex."""
        key = ('base:' if _base_only else '') + dotted        # color.ink here and in the base tree are two tokens
        if key in _seen:
            raise ValueError('token reference loop: %s' % ' -> '.join(_seen + (key,)))
        node = None if _base_only else _get(self.print_tree, dotted)
        in_base = node is None
        if in_base:
            node = _get(self.base_tree, dotted)
        if not isinstance(node, dict) or '$value' not in node:
            raise KeyError('no token %s' % dotted)
        value = node['$value']
        if isinstance(value, str):
            m = _REF.match(value)
            if m:
                return self.resolve(m.group(1), _seen + (key,), in_base)
        if isinstance(value, dict) and 'hex' in value:
            return value['hex'].lower()
        return value

    def color(self, name):
        return self.resolve('color.' + name)

    def number(self, dotted):
        return float(self.resolve(dotted))

    def role(self, name):
        """A text role: {'size': pt, 'weight': 500..900, 'color': hex}."""
        return {k: self.resolve('type.%s.%s' % (name, k)) for k in ('size', 'weight', 'color')}

    def roles(self):
        return [k for k in self.print_tree['type'] if not k.startswith('$')]

    def page(self, fmt):
        keys = ('width', 'height', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left')
        if _get(self.print_tree, 'page.' + fmt) is None:
            raise KeyError('no page format %s' % fmt)
        return {k: self.number('page.%s.%s' % (fmt, k)) for k in keys}
