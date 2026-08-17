import { test, expect } from '@playwright/test';

test.describe('Geovara E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman utama dan tunggu hidrasi client penuh
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForSelector('.ol-viewport', { timeout: 30000 });
    await expect(page.locator('aside')).toBeVisible({ timeout: 30000 });
  });

  test('should load the page and show Geovara branding', async ({ page }) => {
    // Memastikan judul halaman adalah Geovara
    await expect(page).toHaveTitle(/Geovara/i);

    // Memastikan h1 branding terpasang di DOM
    const brandHeader = page.locator('h1:has-text("Geovara")').first();
    await expect(brandHeader).toBeAttached({ timeout: 15000 });

    // Memastikan sidebar branding terlihat
    const brandSidebar = page.locator('text=Geovara').first();
    await expect(brandSidebar).toBeVisible({ timeout: 15000 });
  });

  test('should load the sidebar with working tabs', async ({ page }) => {
    // Tunggu hingga tablist muncul setelah hidrasi client
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible({ timeout: 20000 });

    // Mengambil elemen tab
    const jsonTab = page.locator('[role="tab"]:has-text("JSON")');
    const featuresTab = page.locator('[role="tab"]:has-text("Features")');
    const layersTab = page.locator('[role="tab"]:has-text("Layers")');
    const helpTab = page.locator('[role="tab"]:has-text("Help")');

    await expect(jsonTab).toBeVisible({ timeout: 10000 });
    await expect(featuresTab).toBeVisible({ timeout: 10000 });
    await expect(layersTab).toBeVisible({ timeout: 10000 });
    await expect(helpTab).toBeVisible({ timeout: 10000 });

    // Klik tab "Help" dan pastikan konten bantuan ter-load
    await helpTab.click();
    const helpHeading = page.locator('h3:has-text("Getting Started")');
    await expect(helpHeading).toBeVisible({ timeout: 10000 });

    // Kembalikan ke tab "JSON"
    await jsonTab.click();

    // Pastikan container editor Monaco termuat
    const monacoEditor = page.locator('.monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 30000 });
  });

  test('should load OpenLayers map elements', async ({ page }) => {
    // Memastikan viewport OpenLayers ter-render setelah hidrasi peta selesai
    const olViewport = page.locator('.ol-viewport');
    await expect(olViewport).toBeVisible({ timeout: 30000 });

    // Memastikan canvas peta ada
    const mapCanvas = page.locator('.ol-viewport canvas');
    await expect(mapCanvas).toBeVisible({ timeout: 15000 });
  });

  test('should support horizontal drag resizing and conditional toggle button', async ({ page }) => {
    const aside = page.locator('aside');
    await expect(aside).toBeVisible({ timeout: 20000 });

    const resizeHandle = page.locator('div[aria-label="Resize sidebar width"]');
    await expect(resizeHandle).toBeVisible({ timeout: 20000 });

    // Ensure toggle button is NOT visible when sidebar is open
    const toggleBtnHidden = page.locator('button[aria-label="Buka sidebar"]');
    await expect(toggleBtnHidden).toHaveCount(0);

    // Get initial width of sidebar
    const initialBox = await aside.boundingBox();
    expect(initialBox).not.toBeNull();
    expect(initialBox!.width).toBeGreaterThanOrEqual(300);

    // Drag resize to the right
    const handleBox = await resizeHandle.boundingBox();
    expect(handleBox).not.toBeNull();

    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 80, handleBox!.y + 100, { steps: 5 });
    await page.mouse.up();

    // Verify width expanded
    const expandedBox = await aside.boundingBox();
    expect(expandedBox!.width).toBeGreaterThan(initialBox!.width - 10);

    // Drag to the left past collapse threshold to close
    const updatedHandleBox = await resizeHandle.boundingBox();
    await page.mouse.move(updatedHandleBox!.x + updatedHandleBox!.width / 2, updatedHandleBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(50, updatedHandleBox!.y + 100, { steps: 8 });
    await page.mouse.up();

    // Now sidebar is collapsed, toggle button MUST appear
    const toggleBtn = page.locator('button[aria-label="Buka sidebar"]');
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });

    // Clicking toggle button restores the sidebar
    await toggleBtn.click();
    await expect(aside).toBeVisible({ timeout: 10000 });
    await expect(resizeHandle).toBeVisible({ timeout: 10000 });
  });

  test('should open basemap switcher with mini previews and switch basemap style', async ({ page }) => {
    const basemapBtn = page.locator('button[aria-label="Basemap & Opacity"]');
    await expect(basemapBtn).toBeVisible({ timeout: 10000 });
    await basemapBtn.click();

    // Verify popover header and description
    await expect(page.locator('text=Gaya Peta (Basemap)')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Tersinkronisasi ke 2D & 3D Globe')).toBeVisible({ timeout: 5000 });

    // Verify 4 mini preview cards are rendered using role button
    const osmCard = page.getByRole('button', { name: /OpenStreetMap/ });
    const satelliteCard = page.getByRole('button', { name: /Satelit Esri/ });
    const topoCard = page.getByRole('button', { name: /Topografi/ });
    const darkCard = page.getByRole('button', { name: /Dark Matter/ });

    await expect(osmCard).toBeVisible();
    await expect(satelliteCard).toBeVisible();
    await expect(topoCard).toBeVisible();
    await expect(darkCard).toBeVisible();

    // Select Satelit Esri card and verify active selection
    await satelliteCard.click();
    await expect(satelliteCard).toHaveClass(/border-primary/);

    // Select Dark Matter card and verify active selection
    await darkCard.click();
    await expect(darkCard).toHaveClass(/border-primary/);
  });
});

