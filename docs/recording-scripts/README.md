# Complete human-recording package

7 residents · 85 story cues · 170 recordings across Vietnamese and English.

Ready: **0/170**. Pending clips are intentionally silent in the app, with a readable notice; no text-to-speech fallback.

These are fixed assignments, not three full alternate casts and not random choices. Accent families are shared, but every character keeps an individual performer and delivery. Assignments are casting proposals, not new character biography.

| Character | Vietnamese packet | English packet | Cues per language |
|---|---|---|---|
| Linh | [Vietnamese — Southern (Saigon / Mekong Delta)](linh-vi.md) | [English — natural Vietnamese accent](linh-en.md) | 16 |
| Bảo | [Vietnamese — Southern (Saigon / Mekong Delta)](bao-vi.md) | [English — Australian accent](bao-en.md) | 16 |
| Cô Hạnh | [Vietnamese — Central (Da Nang)](hanh-vi.md) | [English — natural Vietnamese accent](hanh-en.md) | 16 |
| Trâm | [Vietnamese — Southern (Saigon / Mekong Delta)](tram-vi.md) | [English — General American accent](tram-en.md) | 9 |
| Đức | [Vietnamese — Northern (Hanoi)](duc-vi.md) | [English — natural Vietnamese accent](duc-en.md) | 10 |
| Khoa | [Vietnamese — Central (Da Nang)](khoa-vi.md) | [English — Australian accent](khoa-en.md) | 9 |
| Mai | [Vietnamese — Northern (Hanoi)](mai-vi.md) | [English — General American accent](mai-en.md) | 9 |

[Production guide](../audio-production.md) · [Complete cue manifest](manifest.json)

Includes every dialogue node, artifact narration, closed branch and both endings. Excludes menu labels, listener choices, rights chatbot responses, personal reflections and intake answers. Those are not character speech and must not read private visitor text aloud.

Refresh after any caption/casting edit: `npm run audio:prepare`. Verify without writing: `npm run audio:check`. Require every human recording before a voiced release: `npm run audio:check -- --require-complete`.
