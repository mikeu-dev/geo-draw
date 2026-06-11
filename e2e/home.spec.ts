import { test, expect } from '@playwright/test';

test.describe('Geovara E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman utama dan tunggu hingga DOM ter-parse.
    // Menggunakan 'domcontentloaded' mencegah tes menggantung jika CDN Cesium lambat dimuat.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should load the page and show Geovara branding', async ({ page }) => {
    // Memastikan judul halaman adalah Geovara
    await expect(page).toHaveTitle(/Geovara/i);

    // Tunggu hingga aplikasi ter-hidrasi di client side (h1 branding muncul)
    const brandHeader = page.locator('h1:has-text("Geovara")');
    await expect(brandHeader).toBeVisible({ timeout: 15000 });

    // Memastikan deskripsi subheader ada
    const brandSub = page.locator('text=Professional geospatial analysis toolkit');
    await expect(brandSub).toBeVisible();
  });

  test('should load the sidebar with working tabs', async ({ page }) => {
    // Tunggu hingga tablist muncul setelah hidrasi client
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible({ timeout: 15000 });

    // Mengambil elemen tab
    const jsonTab = page.locator('[role="tab"]:has-text("JSON")');
    const featuresTab = page.locator('[role="tab"]:has-text("Features")');
    const layersTab = page.locator('[role="tab"]:has-text("Layers")');
    const helpTab = page.locator('[role="tab"]:has-text("Help")');

    await expect(jsonTab).toBeVisible();
    await expect(featuresTab).toBeVisible();
    await expect(layersTab).toBeVisible();
    await expect(helpTab).toBeVisible();

    // Klik tab "Help" dan pastikan konten bantuan ter-load
    await helpTab.click();
    const helpHeading = page.locator('h3:has-text("Getting Started")');
    await expect(helpHeading).toBeVisible();

    // Kembalikan ke tab "JSON"
    await jsonTab.click();
    
    // Pastikan container editor Monaco termuat
    const monacoEditor = page.locator('.monaco-editor');
    await expect(monacoEditor).toBeVisible();
  });

  test('should load OpenLayers map elements', async ({ page }) => {
    // Memastikan viewport OpenLayers ter-render setelah hidrasi peta selesai
    const olViewport = page.locator('.ol-viewport');
    await expect(olViewport).toBeVisible({ timeout: 20000 });

    // Memastikan canvas peta ada
    const mapCanvas = page.locator('.ol-viewport canvas');
    await expect(mapCanvas).toBeVisible();
  });
});
