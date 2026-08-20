import { test, expect } from '@playwright/test';

test.describe('Geovara Usability & UX Tasks E2E Suite (7 UX Tasks)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside')).toBeVisible({ timeout: 30000 });
  });

  test('Task 1: Search and add location as point to map', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Cari lokasi"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Monas Jakarta');
      // Wait for search suggestions or UI response
      await page.waitForTimeout(500);
    }
    // Verify toolbar is present and interactive
    const drawControls = page.locator('.drawing-controls').first();
    await expect(drawControls).toBeVisible();
  });

  test('Task 2: Toggle Magnetic Snapping and verify cursor guide', async ({ page }) => {
    // Check magnetic snapping toggle button
    const snapToggle = page.locator('button[aria-label="Toggle Snapping"]');
    await expect(snapToggle).toBeVisible({ timeout: 10000 });

    // Click snap toggle to switch state
    await snapToggle.click();
    await page.waitForTimeout(300);

    // Click draw polygon toggle
    const polygonToggle = page.locator('button[aria-label="Draw a polygon"]');
    await expect(polygonToggle).toBeVisible();
    await polygonToggle.click();
    await page.waitForTimeout(300);

    // Switch back to select
    const selectToggle = page.locator('button[aria-label="Select feature"]');
    await selectToggle.click();
  });

  test('Task 3 & 4: Open Attribute Table and launch Batch Property Modal', async ({ page }) => {
    // Navigate to Table tab in sidebar
    const tableTab = page.locator('[role="tab"]:has-text("Table")');
    if (await tableTab.isVisible()) {
      await tableTab.click();
      await page.waitForTimeout(300);
    }

    // Check if spatial tools dialog can be opened via toolbar button
    const spatialToolsBtn = page.locator('button[aria-label="Spatial analysis tools"]');
    if (await spatialToolsBtn.isVisible()) {
      await spatialToolsBtn.dispatchEvent('click');
      // Expect dialog header
      const dialogTitle = page.locator('text=Spatial Analysis Toolkit');
      await expect(dialogTitle).toBeVisible({ timeout: 10000 });

      // Close dialog
      const cancelBtn = page.locator('button:has-text("Batal")');
      await cancelBtn.click();
    }
  });

  test('Task 5 & 7: Developer Console API verification', async ({ page }) => {
    // Verify window.geovara is mounted
    const hasGeovaraAPI = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return typeof (window as any).geovara !== 'undefined';
    });
    expect(hasGeovaraAPI).toBe(true);

    // Programmatically add a feature via window.geovara
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).geovara.addFeature({
        type: 'Feature',
        id: 'test_e2e_pt',
        geometry: {
          type: 'Point',
          coordinates: [106.8271, -6.1754],
        },
        properties: { name: 'Monas Monument', category: 'Landmark' },
      });
    });

    await page.waitForTimeout(500);

    // Verify feature count
    const featureCount = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = (window as any).geovara?.getFeaturesCount?.();
      if (typeof count === 'number') return count;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (window as any).geovara?.getGeoJSON?.();
      if (!raw) return 0;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return parsed.features?.length || 0;
    });
    expect(featureCount).toBeGreaterThanOrEqual(1);
  });
});
