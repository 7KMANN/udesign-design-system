// Proposed print scenario (ECH-396), shown here for the owner's approval before anything is recorded or
// released. The pages are drawn by the Python kit in print/udprint: `python3 print/reference.py` writes
// the reference sheet; the header comparison is the Parea mockup built with today's header and with the kit's.
// A printed page has one theme and one size, so the theme and viewport controls do not change it.

const DEPARTURES = [
  ['White paper', 'The page is white, not the cream background: cream costs ink and shifts from printer to printer.'],
  ['One face', 'Montserrat for all text, in four weights. Geist stays on screens.'],
  ['Light only', 'A printed page has one theme.'],
  ['Points, not breakpoints', 'Sizes are points on a fixed Letter page.'],
] as const;

export function Print() {
  return (
    <div className="preview-page">
      <header className="preview-heading">
        <div>
          <p className="preview-kicker">Proposed scenario</p>
          <h1>Print</h1>
        </div>
        <p>
          Client PDFs: mockups, font comparisons, labels. Once approved and released, each PDF skill draws its header,
          footer, type and cards with one kit, from print/print.tokens.json, so they all print the same logo, colours
          and type. Today each skill draws its own.
        </p>
      </header>

      <section className="preview-section" aria-labelledby="print-sheet-heading">
        <div className="section-heading">
          <div>
            <p className="section-index">Reference</p>
            <h2 id="print-sheet-heading">Logo, colours, text roles and surfaces</h2>
          </div>
          <p>
            Drawn by the kit itself. <a href="print/print-reference.pdf">Open the PDF</a> and print it at 100% to
            check sizes.
          </p>
        </div>
        <img className="print-sheet" src="print/print-reference-p1.png" alt="The print kit reference sheet" />
      </section>

      <section className="preview-section" aria-labelledby="print-header-heading">
        <div className="section-heading">
          <div>
            <p className="section-index">Visible change</p>
            <h2 id="print-header-heading">The official logo in the header</h2>
          </div>
          <p>
            Today the mockup types UDesign beside the tile. The kit draws the official logo (D-62) at 20 pt, which keeps
            the name the same size.
          </p>
        </div>
        <img className="print-sheet" src="print/header-before-after.png" alt="Mockup header today, then with the kit" />
      </section>

      <section className="preview-section" aria-labelledby="print-departures-heading">
        <div className="section-heading">
          <div>
            <p className="section-index">Departures</p>
            <h2 id="print-departures-heading">From the presentation profile</h2>
          </div>
        </div>
        <dl className="print-departures">
          {DEPARTURES.map(([term, detail]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
