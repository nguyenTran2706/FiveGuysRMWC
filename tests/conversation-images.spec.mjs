import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/data/stories.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
const { residents } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));

async function expectShot(page, src) {
  await expect(page.locator('.conversation-backdrop')).toHaveAttribute('data-requested-scene', src);
  await expect(page.locator('.game-image-current')).toHaveAttribute('src', src);
  await expect(page.locator('.game-image-current')).toHaveJSProperty('naturalWidth', 1600);
}

test('all seven NPC conversations change shots with dialogue and reach their own endings', async ({ page }) => {
  test.setTimeout(180000);
  const missing = [];
  page.on('response', response => { if (response.url().includes('/images/conversations/') && !response.ok()) missing.push(response.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.title-discover').click();
  // These two residents need an earlier knock and time to speak with somebody else.
  for (const id of ['duc', 'mai']) {
    await page.locator('.resident-' + id).click();
    await page.getByRole('button', { name: 'Back to the street' }).click();
  }
  for (const resident of residents) {
    await page.locator('.resident-' + resident.id).click();
    if (resident.warning) await page.locator('.modal-actions button').first().click();
    let current = resident.start;
    let kept = false;
    for (let step = 0; step < 25; step++) {
      const node = resident.nodes[current];
      const src = current === resident.start ? resident.image : '/images/conversations/' + resident.id + '/' + current + '.webp';
      await expectShot(page, src);
      await expect(page.locator('.dialogue-text')).toHaveText(node.text.en);
      if (node.choices?.length) {
        const choice = node.choices[0];
        kept ||= !!choice.recordEvidence;
        current = choice.next;
        await page.locator('.choice-button').first().click();
      } else {
        await page.locator('.continue-button').click();
        if (node.next === 'reflection') break;
        current = node.next;
      }
      if (step === 24) throw new Error('Conversation never finished: ' + resident.id);
    }
    await page.getByRole('button', { name: 'I would rather not say' }).click();
    if (resident.id === 'linh') await page.getByRole('button', { name: 'I would rather not say' }).click();
    await page.getByRole('button', { name: 'Hear the ending' }).click();
    await expectShot(page, '/images/conversations/' + resident.id + '/ending-' + (kept ? 'kept' : 'missed') + '.webp');
    await page.getByRole('button', { name: 'Visit another window' }).click();
  }
  expect(missing).toEqual([]);
});

test('a slow previous shot cannot replace a newer conversation image', async ({ page }) => {
  let release;
  const delayed = new Promise(resolve => { release = resolve; });
  await page.route('**/images/conversations/linh/mother.webp', async route => { await delayed; await route.continue(); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.title-start').click();
  await page.locator('.resident-linh').click();
  await page.locator('.choice-button').first().click();
  await expect(page.locator('.dialogue-text')).toHaveText(residents[0].nodes.mother.text.en);
  await page.locator('.continue-button').click();
  await expectShot(page, '/images/conversations/linh/hours.webp');
  const loaded = page.waitForResponse('**/images/conversations/linh/mother.webp');
  release();
  await (await loaded).finished();
  await page.evaluate(async () => {
    const lateImage = new Image();
    lateImage.src = '/images/conversations/linh/mother.webp';
    await lateImage.decode();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await expectShot(page, '/images/conversations/linh/hours.webp');
});

test('unavailable artwork falls back without blocking choices or the next shot', async ({ page }) => {
  await page.route('**/images/conversations/linh/mother.webp', route => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.locator('.title-start').click();
  await page.locator('.resident-linh').click();
  await page.locator('.choice-button').first().click();
  await expect(page.locator('.dialogue-text')).toHaveText(residents[0].nodes.mother.text.en);
  await expect(page.locator('.game-image-current')).toHaveAttribute('src', '/images/linh-v2.webp');
  await page.locator('.continue-button').click();
  await expectShot(page, '/images/conversations/linh/hours.webp');
});
