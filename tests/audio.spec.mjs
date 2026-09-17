import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function enterLinh(page) {
  await page.locator('.title-start').click();
  await page.locator('.resident-linh').click();
  await expect(page.locator('.dialogue-text')).toBeVisible();
}

async function instrument(page) {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    window.__audioTest = { contexts: [], sources: [], gains: [] };
    window.AudioContext = class extends Native {
      constructor(...args) { super(...args); window.__audioTest.contexts.push(this); }
      createGain() { const gain = super.createGain(); window.__audioTest.gains.push(gain); return gain; }
      createBufferSource() {
        const source = super.createBufferSource();
        const entry = { source, started: false, stopped: false };
        window.__audioTest.sources.push(entry);
        const start = source.start.bind(source);
        const stop = source.stop.bind(source);
        source.start = (...args) => { entry.started = true; return start(...args); };
        source.stop = (...args) => { entry.stopped = true; return stop(...args); };
        source.addEventListener('ended', () => { entry.stopped = true; });
        return source;
      }
    };
    if (window.speechSynthesis) window.speechSynthesis.speak = () => { throw new Error('Synthetic speech must not run'); };
  });
}

async function installTransportFixtures(page) {
  // In-memory test registry only. Real rain verifies MP3 transport/decoding;
  // these are deliberately NOT human voices or production-ready recordings.
  await page.evaluate(async () => {
    const { residents } = await import('/src/data/stories.ts');
    const { recordings, recordingKey } = await import('/src/data/dialogueAudio.ts');
    const linh = residents.find(resident => resident.id === 'linh');
    for (const node of [...Object.values(linh.nodes), ...['kept', 'missed'].map(ending => ({ id: `ending-${ending}`, text: linh.epilogue[ending] }))]) {
      for (const language of ['vi', 'en']) recordings[recordingKey('linh', node.id, language)] = {
        src: '/audio/ambience/rain-calm.mp3', text: node.text[language], sha256: 'transport-test-only',
      };
    }
  });
}
const liveVoiceCount = page => page.evaluate(() => window.__audioTest.sources.filter(item => item.started && !item.stopped && !item.source.loop).length);

test('the voice library lists all real recordings, filters both languages, and plays an MP3', async ({ page }) => {
  await page.goto('/audio/voice-preview.html');
  await expect(page.locator('#summary')).toContainText('170/170 clips available');
  await expect(page.locator('article')).toHaveCount(170);
  await page.locator('#character').selectOption('khoa');
  await page.locator('#language').selectOption('en');
  await expect(page.locator('article')).toHaveCount(9);
  await expect(page.locator('article').first()).toContainText('Australian');
  const first = page.locator('audio').first();
  await first.evaluate(audio => audio.play());
  await expect.poll(() => first.evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
  await page.locator('#stop').click();
  await expect(first).toHaveJSProperty('paused', true);
  await page.locator('#language').selectOption('vi');
  await expect(page.locator('article').first()).toContainText('Central');
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/voice-library-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/voice-library-mobile.png' });
});

for (const character of ['linh', 'bao', 'hanh', 'tram', 'duc', 'khoa', 'mai']) {
  test(`${character}: real Vietnamese and English character MP3s automatically play`, async ({ page }) => {
    await instrument(page);
    const requests = [];
    const errors = [];
    page.on('request', request => { if (request.url().includes('/audio/dialogue/')) requests.push(request.url()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.locator('.title-start').click();
    await page.locator(`.resident-${character}`).click();
    await expect.poll(() => liveVoiceCount(page)).toBe(1);
    expect(requests.some(url => new RegExp(`/vi-[^/]+/${character}/hello\\.mp3`).test(url))).toBe(true);
    await expect(page.locator('.audio-error')).toHaveCount(0);
    await page.getByRole('button', { name: 'Switch to English' }).click();
    await expect.poll(() => liveVoiceCount(page)).toBe(1);
    await expect.poll(() => page.evaluate(() => window.__audioTest.sources.filter(item => item.started && !item.source.loop).length)).toBe(2);
    expect(requests.some(url => new RegExp(`/en-[^/]+/${character}/hello\\.mp3`).test(url))).toBe(true);
    const duration = await page.evaluate(() => window.__audioTest.sources.findLast(item => item.started && !item.source.loop).source.buffer.duration);
    expect(duration).toBeGreaterThan(1);
    expect(duration).toBeLessThan(180);
    await expect(page.locator('.audio-error')).toHaveCount(0);
    await page.locator('.game-topbar > button').click();
    await expect.poll(() => liveVoiceCount(page)).toBe(0);
    expect(errors).toEqual([]);
  });
}

test('missing recordings are honest; settings fit mobile and do not use browser TTS', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await instrument(page);
  await page.goto('/');
  await page.evaluate(async () => { const { recordings } = await import('/src/data/dialogueAudio.ts'); for (const key of Object.keys(recordings)) delete recordings[key]; });
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await enterLinh(page);
  await expect(page.locator('.audio-error')).toContainText('no voice recording yet');
  await expect(page.locator('.choice-button')).toHaveCount(3);
  await page.getByRole('button', { name: 'Experience settings', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Auto-play dialogue' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('switch', { name: 'Auto-play dialogue' }).click();
  await page.getByRole('slider', { name: /Voice volume/ }).fill('0');
  await expect(page.locator('output[for="voice-volume"]')).toHaveText('0%');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/audio-settings-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator('.audio-error')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('automatic MP3 playback follows choice/next/language; pause and navigation stop it', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await instrument(page);
  await page.goto('/');
  await installTransportFixtures(page);
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await enterLinh(page);
  await expect.poll(() => liveVoiceCount(page)).toBe(1);
  await page.locator('.choice-button').first().click();
  await expect.poll(() => liveVoiceCount(page)).toBe(0);
  await expect(page.locator('.dialogue-text')).toContainText('flights for Mum');
  await expect.poll(() => liveVoiceCount(page)).toBe(1);
  await page.locator('.continue-button').click();
  await expect(page.locator('.dialogue-text')).toContainText('counts the money');
  await expect.poll(() => liveVoiceCount(page)).toBe(1);
  const beforeLanguage = await page.evaluate(() => window.__audioTest.sources.length);
  await page.getByRole('button', { name: 'Chuyển sang tiếng Việt' }).click();
  await expect(page.locator('.dialogue-text')).toContainText('đếm tiền');
  await expect.poll(() => liveVoiceCount(page)).toBe(1);
  expect(await page.evaluate(() => window.__audioTest.sources.length)).toBeGreaterThan(beforeLanguage);
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect.poll(() => liveVoiceCount(page)).toBe(0);
  await page.getByRole('button', { name: 'Continue the story', exact: true }).click();
  await expect.poll(() => liveVoiceCount(page)).toBe(1);
  await page.locator('.speaker-line button').click();
  await expect.poll(() => liveVoiceCount(page)).toBe(0);
  await page.locator('.speaker-line button').click();
  await expect.poll(() => liveVoiceCount(page)).toBe(1);
  await page.locator('.game-topbar > button').click();
  await expect.poll(() => liveVoiceCount(page)).toBe(0);
  expect(errors).toEqual([]);
});

test('all real rain assets decode, layers loop, pause stops them, and choice reaction stays paused', async ({ page }) => {
  await instrument(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await enterLinh(page);
  await page.locator('.player-controls button').first().click();
  await expect.poll(() => page.evaluate(() => window.__audioTest.sources.filter(item => item.started && item.source.loop && !item.stopped).length), { timeout: 20000 }).toBe(3);
  const buffers = await page.evaluate(() => window.__audioTest.sources.filter(item => item.source.loop).map(item => ({ duration: item.source.buffer.duration, channels: item.source.buffer.numberOfChannels })));
  expect(buffers.every(buffer => buffer.duration > 20 && buffer.duration < 180 && buffer.channels === 2)).toBe(true);
  await page.locator('.choice-button').last().click();
  const oldLine = await page.locator('.dialogue-text').innerText();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__audioTest.sources.filter(item => item.started && !item.stopped).length)).toBe(0);
  // A real-time delay verifies that the old 1.8-second timeout cannot advance behind the modal.
  await page.waitForTimeout(2100);
  await expect(page.locator('.dialogue-text')).toHaveText(oldLine);
  await page.getByRole('button', { name: 'Continue the story', exact: true }).click();
  await expect(page.locator('.dialogue-text')).toContainText('While there are customers');
  await expect.poll(() => page.evaluate(() => window.__audioTest.sources.filter(item => item.started && item.source.loop && !item.stopped).length)).toBe(3);
  await page.locator('.player-controls button').first().click();
  await expect.poll(() => page.evaluate(() => window.__audioTest.sources.filter(item => item.started && item.source.loop && !item.stopped).length)).toBe(0);
});

test('failed voice fetch is retryable and does not block story choices', async ({ page }) => {
  await instrument(page);
  await page.goto('/');
  await installTransportFixtures(page);
  await page.route('**/audio/ambience/rain-calm.mp3', route => route.fulfill({ status: 503, body: 'unavailable' }));
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await enterLinh(page);
  await expect(page.locator('.audio-error')).toContainText('could not load');
  await expect(page.locator('.choice-button')).toHaveCount(3);
  await page.unroute('**/audio/ambience/rain-calm.mp3');
  await page.locator('.speaker-line button').click();
  await expect.poll(() => liveVoiceCount(page)).toBe(1);
});

test('endings auto-play but private reflection does not; manual mode and hidden tabs stop correctly', async ({ page }) => {
  await instrument(page);
  await page.goto('/');
  await installTransportFixtures(page);
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await enterLinh(page);
  await page.locator('.choice-button').last().click();
  await expect(page.locator('.dialogue-text')).toContainText('While there are customers');
  await page.locator('.choice-button').last().click();
  await expect(page.locator('.dialogue-text')).toContainText('I still have to close up');
  await page.locator('.continue-button').click();
  await expect(page.locator('.debrief-panel')).toBeVisible();
  await expect.poll(() => liveVoiceCount(page)).toBe(0);
  await page.locator('.debrief-actions button').click();
  await expect(page.locator('.epilogue-text')).toContainText('Fictional ending: The chat roster is overwritten');
  await expect.poll(() => liveVoiceCount(page)).toBe(1);
  await page.getByRole('button', { name: 'Experience settings', exact: true }).click();
  await page.getByRole('switch', { name: 'Auto-play dialogue' }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect.poll(() => liveVoiceCount(page)).toBe(0);
  await page.locator('.speaker-line button').click();
  await expect.poll(() => liveVoiceCount(page)).toBe(1);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => liveVoiceCount(page)).toBe(0);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.getByRole('button', { name: 'Continue the story', exact: true }).click();
  await expect.poll(() => liveVoiceCount(page)).toBe(0);
});
