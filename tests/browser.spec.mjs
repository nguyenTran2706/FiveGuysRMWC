import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('cinematic landing, private draft, language switch and mobile layout', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('.title-screen h1')).toContainText('GIỜ LÀM');
  await expect(page.locator('.title-screen-art')).toHaveJSProperty('naturalWidth', 1600);
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/home-vi-desktop.png' });
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('.title-screen h1')).toContainText('HOURS');
  await page.screenshot({ path: 'artifacts/home-en-desktop.png' });
  await startOrContinue(page);
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
  // Centre the last choice above the fixed safety footer, including its new tooltip row.
  await page.locator('.choice-button').last().evaluate(button => button.scrollIntoView({ block: 'center' }));
  const choiceBox = await page.locator('.choice-button').last().boundingBox();
  const footerBox = await page.locator('.safety-footer').boundingBox();
  expect(choiceBox.y + choiceBox.height).toBeLessThanOrEqual(footerBox.y + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: /Know Your Rights.*Home/ }).click();
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

async function startOrContinue(page) {
  await page.locator('.title-start').click();
  await expect(page.locator('.street-page, .game-scene')).toBeVisible();
  if (await page.locator('.street-page').count()) await page.locator('.resident-linh').click();
}

async function playPatiently(page) {
  for (let step = 0; step < 25; step++) {
    if (await page.locator('.reflection-panel').count()) return;
    if (await page.locator('.choice-button').count()) {
      const previousLine = await page.locator('.dialogue-text').innerText();
      await page.locator('.choice-button').first().click();
      await expect(page.locator('.dialogue-text')).not.toHaveText(previousLine);
    }
    else if (await page.locator('.continue-button').count()) await page.locator('.continue-button').click();
    else throw new Error('Story has no available action');
  }
  throw new Error('Story did not reach a reflection');
}

test('Continue restores an unfinished reflection and its private note', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await startOrContinue(page);
  await playPatiently(page);
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.locator('#reflection-note').fill('My unfinished reflection.');
  await page.getByRole('button', { name: /Know Your Rights.*Home/ }).click();
  await startOrContinue(page);
  await expect(page.locator('#reflection-note')).toHaveValue('My unfinished reflection.');
});

test('the live clock remains AEST during Sydney summer and switches locale', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-15T12:42:00Z') });
  await page.clock.pauseAt(new Date('2026-01-15T12:42:01Z'));
  await page.goto('/');
  const clock = page.locator('.title-screen .aest-clock');
  await expect(clock).toHaveText('22:42:01 AEST');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(clock).toHaveText('10:42:01 PM AEST');
  await page.clock.runFor(2000);
  await expect(clock).toHaveText('10:42:03 PM AEST');
  expect((await clock.innerText()).match(/AEST/g)).toHaveLength(1);
  await page.clock.resume();
  await expect(clock).not.toHaveText('10:42:03 PM AEST');
  await expect(clock).toHaveText(/^10:42:\d{2} PM AEST$/);
});

test('title settings, continue and about preserve the current conversation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('.title-start')).toHaveText('New game');
  await page.locator('.title-settings').click();
  const dialog = page.getByRole('dialog');
  const subtitles = dialog.getByRole('switch', { name: 'Show both languages' });
  await expect(subtitles).not.toBeChecked();
  await subtitles.click();
  await expect(subtitles).toBeChecked();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator('.title-settings')).toBeFocused();
  await startOrContinue(page);
  await expect(page.locator('.secondary-dialogue')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('.secondary-dialogue')).not.toBeEmpty();
  const openingLine = await page.locator('.dialogue-text').innerText();
  await page.locator('.choice-button').first().click();
  await expect(page.locator('.dialogue-text')).not.toHaveText(openingLine);
  const continuedLine = await page.locator('.dialogue-text').innerText();
  await page.getByRole('button', { name: /Know Your Rights.*Home/ }).click();
  await expect(page.locator('.title-start')).toHaveText('Continue');
  await page.locator('.title-screen-menu').getByRole('button', { name: 'About' }).click();
  await expect(page.locator('.about-section h1')).toHaveText('It often begins with listening.');
  await page.getByRole('button', { name: /Know Your Rights.*Home/ }).click();
  await page.locator('.title-settings').click();
  await expect(subtitles).toBeChecked();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await startOrContinue(page);
  await expect(page.locator('.dialogue-text')).toHaveText(continuedLine);
  await expect(page.locator('.secondary-dialogue')).toBeVisible();
});

test('all seven neighbours have their own loaded portrait and local setting', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.title-discover').click();
  const localSettings = {
    linh: 'John Street · Cabramatta',
    bao: 'Freedom Plaza · Cabramatta',
    hanh: 'Arthur Street · Cabramatta',
    tram: 'Hughes Street · Cabramatta',
    duc: 'Ground-floor brick flat · Canley Vale',
    khoa: 'Lemon-tree veranda · Lansvale',
    mai: 'Railway Parade · Cabramatta',
  };
  await expect(page.locator('.resident-card')).toHaveCount(7);
  const portraitSources = [];
  for (const [id, location] of Object.entries(localSettings)) {
    const card = page.locator(`.resident-${id}`);
    const portrait = card.locator('img');
    await portrait.scrollIntoViewIfNeeded();
    await expect(portrait).toHaveJSProperty('naturalWidth', 1600);
    await expect(portrait).toHaveAttribute('src', `/images/${id}-v2.webp`);
    await expect(card.locator('.resident-number')).toContainText(location);
    await expect(card.locator('.resident-intro')).not.toBeEmpty();
    portraitSources.push(await portrait.getAttribute('src'));
  }
  expect(new Set(portraitSources).size).toBe(7);
});

test('three stories unlock the turn and evidence choices affect the ending', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await startOrContinue(page);
  await playPatiently(page);
  await expect(page.locator('.reflection-panel h2')).toHaveText('Does any of this feel familiar?');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.locator('#reflection-note').fill('I also keep roster screenshots.');
  await page.getByRole('button', { name: 'Add to my draft' }).click();
  await page.getByRole('button', { name: 'Every time I am paid' }).click();
  await page.getByRole('button', { name: 'Hear the ending' }).click();
  await expect(page.locator('.epilogue-panel')).toBeVisible();
  await page.screenshot({ path: 'artifacts/epilogue-desktop.png' });
  await page.getByRole('button', { name: 'Visit another window' }).click();
  for (const id of ['bao', 'hanh']) {
    await page.locator(`.resident-${id}`).click();
    await playPatiently(page);
    await page.getByRole('button', { name: 'I would rather not say' }).click();
    await page.getByRole('button', { name: 'Hear the ending' }).click();
    await page.getByRole('button', { name: 'Visit another window' }).click();
  }
  await expect(page.locator('.rmwc-card')).toHaveClass(/unlocked/);
  await page.getByRole('button', { name: 'Enter RMWC' }).click();
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
  await page.locator('.title-discover').click();
  await page.locator('.resident-duc').click();
  await expect(page.getByRole('dialog')).toContainText('This is not the right moment.');
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
  await page.getByRole('button', { name: 'I would rather not say' }).click();
  await page.getByRole('button', { name: 'I would rather not say' }).click();
  await page.getByRole('button', { name: 'Hear the ending' }).click();
  await page.getByRole('button', { name: 'Visit another window' }).click();
  await page.locator('.resident-duc').click();
  await expect(page.locator('.game-scene')).toBeVisible();
  await page.route('https://migrants.org.au/**', route => route.fulfill({ body: '<html><title>RMWC</title><body>RMWC</body></html>', contentType: 'text/html' }));
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('https://migrants.org.au/');
  await expect(page).toHaveTitle('RMWC');
});

for (const language of ['vi', 'en']) {
  test(`Quick exit button opens RMWC and explains its destination in ${language}`, async ({ page }) => {
    await page.route('https://migrants.org.au/**', route => route.fulfill({ body: '<html><title>RMWC</title><body>RMWC</body></html>', contentType: 'text/html' }));
    await page.goto('/');
    if (language === 'en') await page.getByRole('button', { name: 'Switch to English' }).click();
    await expect(page.locator('.quick-exit')).toHaveAttribute('title', language === 'en' ? 'Quick exit to the RMWC website. Press Escape.' : 'Thoát nhanh sang trang web RMWC. Nhấn phím Esc.');
    await page.locator('.safety-footer > button').click();
    await expect(page.getByRole('dialog')).toContainText(language === 'en' ? 'Quick exit replaces this page with the RMWC website.' : 'Chức năng thoát nhanh thay thế trang này bằng trang web RMWC.');
    await page.locator('.quick-exit').click();
    await expect(page).toHaveURL('https://migrants.org.au/');
    await expect(page).toHaveTitle('RMWC');
  });
}

test('local guided intake, safe contact, editable review and downloads', async ({ page, baseURL }) => {
  const outbound = [];
  page.on('request', request => { if (!request.url().startsWith(baseURL) && !request.url().startsWith('data:')) outbound.push(request.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.title-help').click();
  await expect(page.locator('.intake-consent-boundary')).toBeVisible();
  await page.locator('.intake-consent-boundary .intake-primary').click();
  await page.locator('.intake-answer-area textarea').fill('I was underpaid and I have no payslip.');
  await page.locator('.intake-answer-area input').first().fill('Hospitality');
  await page.locator('.intake-answer-area input').nth(1).fill('Kitchen hand');
  await page.locator('.intake-form-actions .intake-primary').click();
  await page.locator('.intake-form-actions .intake-text-button').click();
  await page.locator('.intake-evidence-grid input[type="checkbox"]').nth(1).check();
  const contact = page.locator('.intake-block').nth(1);
  await contact.locator('select').nth(0).selectOption('sms');
  await contact.locator('input[type="tel"]').fill('0400000000');
  await contact.locator('select').nth(2).selectOption('false');
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
  await page.locator('.title-help').click();
  await page.locator('.intake-review-link').click();
  await expect(page.locator('textarea[lang="en"]')).toHaveValue('');
});

test('crisis signals stop questions and no field is required', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.title-help').click();
  await page.locator('.intake-consent-boundary .intake-primary').click();
  await page.locator('.intake-answer-area textarea').fill('My employer took my passport and I am not allowed to leave.');
  await page.locator('.intake-form-actions .intake-primary').click();
  await expect(page.locator('.intake-crisis')).toBeVisible();
  await expect(page.locator('.intake-crisis a[href="tel:000"]')).toBeVisible();
  await expect(page.locator('.intake-answer-area')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.title-help').click();
  await page.locator('.intake-consent-boundary .intake-primary').click();
  for (let step = 0; step < 3; step++) await page.locator('.intake-form-actions .intake-text-button').click();
  await expect(page.locator('.summary-heading')).toBeVisible();
});
