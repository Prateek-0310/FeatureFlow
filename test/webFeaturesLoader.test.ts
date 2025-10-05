import { initializeWebFeatures, getCSSFeature } from '../src/webFeaturesLoader';

describe('webFeaturesLoader', () => {
  it('initializes and maps css-aspect-ratio', async () => {
    await initializeWebFeatures();
    const feature = getCSSFeature('aspect-ratio');
    expect(feature).toBeDefined();
    expect(feature!.name).toMatch(/aspect-ratio/i);
  });
});
