import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('cinematic landing, private draft, language switch and mobile layout', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('.hero h1')).toContainText('GIỜ LÀM');
  await expect(page.locator('.hero-image')).toHaveJSProperty('naturalWidth', 1600);
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/home-vi-desktop.png' });
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('.hero h1')).toContainText('HOURS');
  await page.screenshot({ path: 'artifacts/home-en-desktop.png' });
  await page.locator('.door-story').click();
  await expect(page.locator('.dialogue-text')).toBeVisible();
  const englishLine = await page.locator('.dialogue-text').innerText();
  await page.getByRole('button', { name: 'Chuyển sang tiếng Việt' }).click();
  await expect(page.locator('.dialogue-text')).not.toHaveText(englishLine);
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('.dialogue-text')).toHaveText(englishLine);
  await page.screenshot({ path: 'artifacts/game-desktop.png' });
  await expect(page.locator('.safety-footer')).toContainText('1300 513 107');
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/game-mobile.png', fullPage: true });
  await page.locator('.choice-button').last().scrollIntoViewIfNeeded();
  const choiceBox = await page.locator('.choice-button').last().boundingBox();
  const footerBox = await page.locator('.safety-footer').boundingBox();
  expect(choiceBox.y + choiceBox.height).toBeLessThanOrEqual(footerBox.y + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Know Your Rights — Home' }).click();
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

async function playPatiently(page) {
  for (let step = 0; step < 25; step++) {
    if (await page.locator('.reflection-panel').count()) return;
    if (await page.locator('.choice-button').count()) await page.locator('.choice-button').first().click();
    else if (await page.locator('.continue-button').count()) await page.locator('.continue-button').click();
    else throw new Error('Story has no available action');
  }
  throw new Error('Story did not reach a reflection');
}

test('three stories unlock the turn and evidence choices affect the ending', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.door-story').click();
  await playPatiently(page);
  await expect(page.locator('.reflection-panel h2')).toHaveText('Does any of this feel familiar?');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.locator('#reflection-note').fill('I also keep roster screenshots.');
  await page.getByRole('button', { name: 'Add to my draft' }).click();
  await page.getByRole('button', { name: 'Every time I’m paid' }).click();
  await expect(page.locator('.epilogue-panel')).toBeVisible();
  await page.screenshot({ path: 'artifacts/epilogue-desktop.png' });
  await page.getByRole('button', { name: 'Visit another window' }).click();
  for (const id of ['bao', 'hanh']) {
    await page.locator(`.resident-${id}`).click();
    await playPatiently(page);
    await page.getByRole('button', { name: 'I’d rather not say' }).click();
    await page.getByRole('button', { name: 'Visit another window' }).click();
  }
  await expect(page.locator('.rmwc-card')).toHaveClass(/unlocked/);
  await page.getByRole('button', { name: 'Step inside RMWC' }).click();
  await expect(page.locator('.turn-page h1')).toHaveText('Now, your story.');
  await page.getByRole('button', { name: 'My summary' }).click();
  await expect(page.locator('.summary-heading')).toBeVisible();
  await expect(page.locator('.summary-flags')).toContainText('Pay and deductions');
  await expect(page.locator('textarea[lang="en"]')).toHaveValue('I also keep roster screenshots.');
  await page.locator('.summary-json summary').click();
  const draft = JSON.parse(await page.locator('.summary-json-input').inputValue());
  expect(draft.evidenceHeld.rosters).toBeUndefined();
  expect(draft.evidenceHeld.payslips).toBe(true);
});

test('return visits, sensitive story skip, pause and quick exit', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('nav').getByRole('button', { name: 'The stories' }).click();
  await page.locator('.resident-duc').click();
  await expect(page.getByRole('dialog')).toContainText('Not quite the right moment.');
  await page.getByRole('button', { name: 'Back to the street' }).click();
  await page.locator('.resident-tram').click();
  await expect(page.getByRole('dialog')).toContainText('Before you knock.');
  await page.getByRole('button', { name: 'Skip and return to the street' }).click();
  await expect(page.locator('.resident-tram')).toBeVisible();
  await page.locator('.resident-linh').click();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('The story can wait.');
  await page.getByRole('button', { name: 'Continue the story' }).click();
  await playPatiently(page);
  await page.getByRole('button', { name: 'I’d rather not say' }).click();
  await page.getByRole('button', { name: 'I’d rather not say' }).click();
  await page.getByRole('button', { name: 'Visit another window' }).click();
  await page.locator('.resident-duc').click();
  await expect(page.locator('.game-scene')).toBeVisible();
  await page.route('https://www.bom.gov.au/**', route => route.fulfill({ body: '<html><title>Weather</title><body>Weather</body></html>', contentType: 'text/html' }));
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('https://www.bom.gov.au/');
  await expect(page).toHaveTitle('Weather');
});

test('local guided intake, safe contact, editable review and downloads', async ({ page }) => {
  const outbound = [];
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:5173') && !request.url().startsWith('data:')) outbound.push(request.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.door-help').click();
  await expect(page.locator('.intake-consent-boundary')).toBeVisible();
  await page.locator('.intake-consent-boundary .intake-primary').click();
  await page.locator('.intake-answer-area textarea').fill('I was underpaid and I have no payslip.');
  await page.locator('.intake-form-actions .intake-primary').click();
  await page.locator('.intake-answer-area input').first().fill('Hospitality');
  await page.locator('.intake-answer-area input').nth(1).fill('Kitchen hand');
  await page.locator('.intake-form-actions .intake-primary').click();
  await page.locator('.intake-form-actions .intake-text-button').click();
  await page.locator('.intake-form-actions .intake-text-button').click();
  await page.locator('.intake-answer-area input[type="checkbox"]').nth(1).check();
  await page.locator('.intake-form-actions .intake-primary').click();
  await page.locator('.intake-answer-area select').nth(0).selectOption('sms');
  await page.locator('.intake-answer-area input[type="tel"]').fill('0400000000');
  await page.locator('.intake-answer-area select').nth(2).selectOption('false');
  await page.locator('.intake-review-link').click();
  await expect(page.locator('.summary-safety-alert')).toContainText('Do not leave voicemail');
  await expect(page.locator('.summary-flags')).toContainText('Pay and deductions');
  await page.locator('textarea[lang="en"]').fill('My edited, private account.');
  await page.locator('.summary-json summary').click();
  const file = JSON.parse(await page.locator('.summary-json-input').inputValue());
  expect(file.narrative.en).toBe('My edited, private account.');
  expect(file.contactSafety.safeToLeaveVoicemail).toBe(false);
  expect(file.consent.shareWithRMWC).toBe(false);
  expect(file.evidenceHeld.rosters).toBe(true);
  expect(file.evidenceHeld.payslips).toBeUndefined();
  await page.screenshot({ path: 'artifacts/summary-desktop.png', fullPage: true });
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.summary-download-actions button').first().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^RMWC-.*\.json$/);
  expect(outbound).toEqual([]);
  await page.reload();
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.door-help').click();
  await page.locator('.intake-review-link').click();
  await expect(page.locator('textarea[lang="en"]')).toHaveValue('');
});

test('crisis signals stop questions and no field is required', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.door-help').click();
  await page.locator('.intake-consent-boundary .intake-primary').click();
  await page.locator('.intake-answer-area textarea').fill('My employer took my passport and I am not allowed to leave.');
  await page.locator('.intake-form-actions .intake-primary').click();
  await expect(page.locator('.intake-crisis')).toBeVisible();
  await expect(page.locator('.intake-crisis a[href="tel:000"]')).toBeVisible();
  await expect(page.locator('.intake-answer-area')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.door-help').click();
  await page.locator('.intake-consent-boundary .intake-primary').click();
  for (let step = 0; step < 8; step++) await page.locator('.intake-form-actions .intake-text-button').click();
  await expect(page.locator('.summary-heading')).toBeVisible();
});
