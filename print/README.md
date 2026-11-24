# Print kit (proposed, ECH-396)

The print scenario for client PDFs: mockups, font comparisons, box labels. One Python package, `udprint`,
draws their chrome (header with the official logo, text roles, field, card, badge and method icon, tag,
footer, page numbers) from `print/print.tokens.json`, which resolves against `tokens/udesign.tokens.json`.
The print tokens stay out of `tokens/` because the CSS build reads every file there.

Status: a proposal shown in the showcase ("Print (proposed)"). Nothing here is released, and no product
adopts it, until the owner approves it there and it is recorded as a decision in `docs/v2/DECISIONS.md`.

- Reference sheet: `python3 print/reference.py OUT.pdf --png DIR`. The showcase shows the copy in
  `showcase/public/print/`; regenerate it after any change to the kit or its tokens.
- Tests: `python3 -m unittest discover -s print/tests` (needs PyMuPDF).
- Requires PyMuPDF only. Montserrat ships in `udprint/fonts` under the SIL Open Font License.
- A release copies `udprint/` and both token files to `dist/print/udprint/`. A skill vendors that folder at
  the release tag, so it reads its own copies and works where it is installed alone.
