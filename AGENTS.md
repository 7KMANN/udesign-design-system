# UDesign design system

1. Every input: a visible change within 100ms, before any network call returns.
2. Every interactive element has a pressed state.
3. An async control shows its own pending: `<Button pending>`.
4. Motion: `--motion-*` roles, never raw values.
5. One accent-filled control per screen. None on a repeated row, card, or item.
6. Presented to someone: `presentation` in `PageCanvas`. Operated by someone: `operations` in `AppShell`.

Build to these. Audit against them. The sections below make each one exact.

## The rules, exactly

**1. Feedback floor.** There is no opt-out. The full feedback model
(four layers, response-time budget) is owned by `udesign-docs`, linked below.

**2. Press.** A CSS `:active` treatment using `--interactive-pressed` or `--motion-press-scale`,
on an element a keyboard can reach, with a `:focus-visible` ring (never `:focus`). A clickable row,
card, or list item is `Pressable`, never a `div` with `onClick`. A `TableRow` has no press state.

**3. Pending.** `Button`'s `pending` prop disables it, sets `aria-busy`, and keeps its width. The
control that was clicked is the one that shows the wait.

**4. Motion.** Select a duration by intent: `instant`, `fast`, `standard`, `emphasis`, `slow`.
`slow` (350ms) is the interaction ceiling. Never `duration-200`, never a literal `cubic-bezier`.
Shipped values: [`docs/motion-contract.md`](docs/motion-contract.md).

**5. Accent.** "Accent-filled" means `Button` with `variant="default"`, which is also what a
`Button` with no variant renders. Count them per screen.
- A modal or side panel gets its own one.
- A control repeated per card or list item is `secondary`; in a dense toolbar or table row it is
  `ghost`. However important it feels in isolation.
- `presentation` may spend one accent-filled control per viewport.
- In `operations` the accent never appears in chrome, navigation, or any repeated block. It marks
  the one action that commits work.
- Density is a separate axis. A dense, busy `operations` screen is correct, and it still spends one
  accent.
- Call it **the accent** in code, class names, and copy. Never by a colour name.

**6. Profile.** Ask one question: is this screen presented to someone, or operated by someone?
- `presentation`: marketing, proposals, client portals, presentation-led screens.
- `operations`: production, scheduling, accounting, administration, internal operational tools.
- One profile per document, set once on the root (`<html data-design="operations">`), never
  nested, never switched at runtime. Only a review or documentation surface that exists to show
  both profiles may switch.
- Build the page in its shell: a `presentation` screen in `PageCanvas` (sections, centered column),
  an `operations` screen in `AppShell` (sidebar, toolbar, panes). Both are in `core`.
- Static HTML: link `dist/tokens.css` and compose from its component classes, `ud-` plus the
  component's name with a variant appended (`ud-app-shell`, `ud-pressable`, `ud-btn-secondary`).
  The list and usage notes open the component block in that file.
- Mark every figure: `TableCell numeric`, or `--font-numeric` with `--font-numeric-variant`.
  Title and heading sizes come from `--text-*`.
- A screen that is genuinely both: ask the owner. Do not mix.
- `brand` and `functional` still resolve as aliases of `presentation` and `operations` for one
  release. Write the new names.

## Auditing ("fix drifted stuff")

Start with the checker, from the consumer's root: `npx udesign-check <paths>` where this package is
installed, `npx --yes github:7KMANN/udesign-design-system#<tag> <paths>` where it is not. Each line
it prints is a finding. It is the floor of the audit: the bans it does not cover are listed in
[`docs/checker-rules.md`](docs/checker-rules.md), and you audit those by reading.

Every finding names its rule: a number from `DESIGN.md` "Banned design patterns", or one of the six
rules above, plus the file and line. A pattern no written rule covers is not a finding.
`dist/tokens.css` is the truth for token names and values; a document that disagrees with it is the
drift, not the code.

## Read next

1. [`DESIGN.md`](DESIGN.md): "Emphasis and hierarchy", "Interaction states", "Motion",
   "Components", "Banned design patterns". The rest is reference.
2. Any change to an interactive element (a button, form, link, row, tab, dialog, filter, upload, or
   navigation item) loads the `interface-responsiveness` skill first, every time. One button
   counts. Source: [`skills/interface-responsiveness/SKILL.md`](https://github.com/7KMANN/udesign-docs/blob/v0.9.0/skills/interface-responsiveness/SKILL.md).

## Owned by `udesign-docs`, not here

Version-independent canon. Link at a tag; the latest is listed by `git -C udesign-docs tag`.

- The feedback model: [`standards/design/udesign-contract.md`](https://github.com/7KMANN/udesign-docs/blob/v0.9.0/standards/design/udesign-contract.md), section "Feedback".
- Voice in interface copy and the visual tone: [`business/udesign-ground-truth.md`](https://github.com/7KMANN/udesign-docs/blob/v0.9.0/business/udesign-ground-truth.md), §5. Interface copy follows it verbatim.

## Changing this repository

- `npm test` stays green. `npm run validate` runs the full pipeline before a release.
- After editing anything under `registry/new-york/ui/`, run `npm run build:registry`; the registry
  test fails on stale `public/r/` output. Never hand-edit `dist/` or `public/r/`.
- A script that fails on formatting rather than logic: [`docs/TOOLING-PITFALLS.md`](docs/TOOLING-PITFALLS.md).
