import { test, expect } from '@playwright/test';

test.describe('Geovara Usability & Evaluation Lab (Bab 24 & 25 E2E Suite)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 30000 });
    await expect(page.locator('.ol-viewport')).toBeVisible({ timeout: 30000 });
  });

  test('Should open Usability Lab modal and inspect experiment options', async ({ page }) => {
    // Locate Usability Lab trigger button
    const labBtn = page.locator('button[aria-label="Usability & Evaluation Lab"]');
    await expect(labBtn).toBeVisible({ timeout: 10000 });
    await labBtn.click();

    // Verify modal header
    const modalTitle = page.locator('text=Geovara Usability & Evaluation Lab (Bab 24 & 25)');
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    // Verify participant ID field
    const participantInput = page.locator('#participantId');
    await expect(participantInput).toHaveValue('GIS_USER_01');

    // Change experiment to Experiment A
    const expSelect = page.locator('select');
    await expSelect.selectOption('EXPERIMENT_A');
    await expect(expSelect).toHaveValue('EXPERIMENT_A');

    // Verify condition buttons for Experiment A
    await expect(page.locator('button:has-text("A: Pure Black")')).toBeVisible();
    await expect(page.locator('button:has-text("B: Dark Gradient")')).toBeVisible();
    await expect(page.locator('button:has-text("C: Dark Gradient + Stars")')).toBeVisible();
  });

  test('Should execute full Experiment C workflow: Setup -> Tasks -> SUS Survey -> Analytics', async ({ page }) => {
    // 1. Open Lab Dialog
    const labBtn = page.locator('button[aria-label="Usability & Evaluation Lab"]');
    await labBtn.click();

    // Select Experiment C
    const expSelect = page.locator('select');
    await expSelect.selectOption('EXPERIMENT_C');

    // Choose 3D Globe condition
    const globeConditionBtn = page.locator('button:has-text("Mode 3D Globe")');
    await globeConditionBtn.click();

    // Start session
    const startBtn = page.locator('button:has-text("Mulai Sesi Eksperimen")');
    await startBtn.click();

    // 2. Task Runner Step
    await expect(page.locator('text=Tugas 1 dari')).toBeVisible({ timeout: 5000 });

    // Load test spatial features to map
    const loadDataBtn = page.locator('button:has-text("Muat Data Spasial Uji")');
    await loadDataBtn.click();

    // Start Task Timer
    const startTimerBtn = page.locator('button:has-text("Mulai Timer Tugas")');
    await startTimerBtn.click();
    await page.waitForTimeout(300);

    // Record miss-click error
    const recordErrorBtn = page.locator('button:has-text("+ Catat Miss-Click")');
    await recordErrorBtn.click();

    // Complete Task 1
    const completeTaskBtn = page.locator('button:has-text("Selesai & Tugas Berikutnya")');
    await completeTaskBtn.click();

    // Complete remaining tasks (Task 2, Task 3, Task 4)
    for (let i = 2; i <= 4; i++) {
      await page.waitForTimeout(100);
      const timerBtn = page.locator('button:has-text("Mulai Timer Tugas")');
      if (await timerBtn.isVisible()) {
        await timerBtn.click();
        await page.waitForTimeout(200);
      }
      const nextBtn = page.locator('button:has-text("Selesai &")');
      await nextBtn.click();
    }

    // 3. Survey Step (SUS & NASA-TLX)
    await expect(page.locator('text=1. System Usability Scale (SUS)')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=2. NASA-TLX Workload Assessment')).toBeVisible();

    // Submit Survey
    const submitSurveyBtn = page.locator('button:has-text("Hitung & Simpan Hasil Evaluasi")');
    await submitSurveyBtn.click();

    // 4. Results & Analytics Step
    await expect(page.locator('span:has-text("System Usability Scale (SUS)")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('span:has-text("NASA-TLX Workload Index")')).toBeVisible();
    await expect(page.locator('span:has-text("Task Performance Summary")')).toBeVisible();

    // Verify Export Dataset buttons
    const exportCsvBtn = page.locator('button:has-text("Ekspor Dataset (.CSV)")');
    await expect(exportCsvBtn).toBeVisible();

    const exportJsonBtn = page.locator('button:has-text("Ekspor JSON")');
    await expect(exportJsonBtn).toBeVisible();
  });
});
