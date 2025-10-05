import { scanCSSText } from '../src/cssScanner';

describe('cssScanner', () => {
  it('detects aspect-ratio property and @container and :has in CSS text', async () => {
    const css = `
    .card { aspect-ratio: 16/9; }
    @container (min-width: 40ch) { .card { color: red; } }
    .list:has(.item) { color: blue; }
    `;

    const detected = await scanCSSText(css, 'css');
    const ids = detected.map(d => d.id).sort();
    expect(ids).toEqual(expect.arrayContaining(['css-aspect-ratio', 'css-container-queries', 'css-has']));
  });
});
