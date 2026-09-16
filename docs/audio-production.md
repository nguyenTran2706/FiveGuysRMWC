# Human voices and responsive rain — production handoff

## What is ready, and what is not

The application uses locally hosted recordings, not browser speech synthesis or a voice-generation service. The complete [performer packets](recording-scripts/README.md) contain every existing character scene and both endings in both languages. Until actors record and review those files, the app displays a missing-recording notice and continues normally. Scripts and engineering cannot manufacture authentic human voices.

The rain assets are real field recordings, bundled locally. They are not recordings of Cabramatta itself. Source descriptions, credits and hashes are in [audio credits](../public/audio/ambience/CREDITS.md). Technical decoding and automated mixing tests do not replace listening approval on headphones and a phone speaker.

## Casting — fixed, never random

| Character | Vietnamese | English | Individual delivery |
|---|---|---|---|
| Linh | Southern | Vietnamese-English | Warm, observant, tired; money and her mother create pauses |
| Bảo | Southern | Australian | Conversational humour, then less hurried around tax letters |
| Hạnh | Central (Da Nang) | Vietnamese-English | Unhurried hospitality, practical strength |
| Trâm | Southern | General American | Quiet and alert; clear boundaries and interest in photography |
| Đức | Northern (Hanoi) | Vietnamese-English | Measured, thoughtful, warmth returns with the bicycle bell |
| Khoa | Central (Da Nang) | Australian | Grounded, dry humour; dignity when recalling accent criticism |
| Mai | Northern (Hanoi) | General American | Private and focused; firmer when setting limits |

These regional reference choices are editable casting proposals, not assumptions about birthplace or migration history. Central Vietnamese is not one uniform accent; this package selects Da Nang as the reference rather than asking an actor to mix Huế, Nghệ An and Da Nang. Southern performers should use their own consistent Southern variety. No pitch-shifting one recording to simulate different characters. No switching accents between branches. No new accent selector.

Cast seven distinct character identities. A suitably fluent bilingual performer can cover both languages for one character; otherwise pair two performers and agree on age, vocal register, pacing and warmth. A Vietnamese-English performer should use their natural English, not intentionally broken grammar or exaggerated consonants. English accent assignment must not erase Vietnamese names or turn a character into a stereotype. Casting and pronunciation require fluent human review, which the code cannot verify.

## Session preparation

1. Generate current packets with `npm run audio:prepare`. Assign one actor/language packet; read the introduction and every incoming branch before recording. Record both endings even if a normal playthrough reaches only one.
2. Have the performer approve use of their performance in this project. Agree on credit, scope, payment if any, and pickup availability separately. Do not upload contracts, phone numbers or personal identifiers into public assets or the cue manifest.
3. Discuss sensitive material before the session. Trâm and Mai have story content warnings. Permit breaks and retakes. Do not request distressed improvisations, threatening manager impressions, or disclosure of personal experiences.
4. Record a reference line from the beginning, a guarded branch and a hopeful branch. Approve the accent, intelligibility, character and room sound before recording the whole packet. Save the same reference for pickups.
5. Make a shared pronunciation sheet for Linh, Bảo, Hạnh, Trâm, Đức, Khoa, Mai, Cabramatta, John Street, RMWC, ABN, super, payslip, visa numbers, amounts and times. Verify names with a fluent Vietnamese speaker. Agree on natural acronym/number readings in each language; do not infer pronunciation from English phonetic spellings.

## Recording without generation services

- Use a local recorder or phone in a quiet, softly furnished room. Keep the same device, room and microphone distance throughout a character's session. Disable notifications; avoid fans, music, traffic and other people's voices. Do not record near a real rain source: rain is mixed separately.
- If the recorder supports it, keep an uncompressed mono WAV master at 48 kHz / 24 bit. A good clean phone recording is preferable to a technically ideal file with poor performance. Avoid clipping; aim for comfortable headroom (roughly -12 to -6 dBFS peaks during capture). Record 10 seconds of room tone for editing, not as an app asset.
- Speak naturally to a nearby person. Normal breaths and small hesitations are welcome. Do not over-enunciate every syllable, slow every line uniformly, add artificial vibrato, or force sadness. Keep expressions and dialect authentic.
- Record two full takes per cue. Keep a short quiet lead and tail; remove the spoken slate/cue name from the final export. Never print breaths or timing instructions into spoken text. The actual caption's narration is spoken; packet headings and instructions are not.
- The existing story mixes narration with quotations. One actor reads the whole scene in one clip, softly distinguishing narration from character speech. Artifact passages and endings use the same voice in a neutral storytelling register. For caption phrases such as “A pause,” read the phrase naturally and leave a modest beat. Changing that narrative convention requires an agreed caption/script revision, not silently omitting content from the recording.
- Use the provided VI and EN text independently. Some existing English captions are shorter than Vietnamese. This package preserves them; it does not invent translations or add unshown dialogue. Report wording issues before recording so the source and captions can change together.

## Edit and export

Keep original takes and lossless selected masters outside the web bundle. Trim handling noise, mistakes and excessive dead air; use very short boundary fades to prevent clicks. Avoid aggressive denoising, heavy compression, time stretching, reverberation and voice filters. Match perceived dialogue loudness across the cast; an initial production target is about -18 LUFS integrated, with true peaks no higher than -1 dBTP. These are project targets, not a claim of a required standard. Listen again after encoding.

Export one mono MP3 per cue, preferably 128–160 kbps, named exactly as the packet specifies:

```text
public/audio/dialogue/vi-south/linh/hello.mp3
public/audio/dialogue/en-vietnamese/linh/hello.mp3
public/audio/dialogue/en-vietnamese/linh/ending-kept.mp3
```

Keep each encoded clip below 12 MB and 180 seconds (normal dialogue should be much shorter). Do not concatenate a complete story into one MP3: choices need independent files. There are 170 recordings at the current script revision, not 170 recordings per accent. Recording a whole language in three accents is not the agreed design.

## Listening review and import

For every final MP3, a reviewer checks the complete caption, correct character/accent, natural performance, pronunciation, clipping, noise and intelligibility. Listen to transitions from each incoming branch, not only the script in order. Mark selected takes in the packet or an external production tracker.

Create the corresponding review JSON at the path shown in the manifest. Example: `recording-reviews/vi-south/linh/hello.json`:

```json
{
  "textSha256": "COPY THE CAPTION HASH FROM THE PACKET",
  "audioSha256": "SHA256 OF THE FINAL MP3",
  "accent": "vi-south",
  "humanPerformed": true,
  "approved": true
}
```

On Windows obtain the final audio hash with:

```powershell
(Get-FileHash -Algorithm SHA256 -LiteralPath public/audio/dialogue/vi-south/linh/hello.mp3).Hash.ToLowerInvariant()
```

Only set the approval fields after listening. They are declarations by the production team, not automatic evidence of accent or authenticity. Review JSON lives outside `public/`; no actor name or contact detail is needed.

Run `npm run audio:prepare`, then `npm run audio:check` and `npm run build`. The generator registers approved clips with a content-hash cache key; files without reviews, altered audio or outdated caption hashes are excluded and reported. Exact caption matching also prevents stale recordings during development. Never manually stamp a changed script's hash onto an old recording without re-reviewing or re-recording. Use `npm run audio:check -- --require-complete` as the release gate for a fully voiced build. It intentionally fails while recordings are missing. Normal `audio:check` permits the transparent, text-only production phase.

## Playback behaviour

- Auto-play dialogue defaults on. Entering a resident, choosing a branch, pressing Continue/Space, changing language, and entering an ending request the matching recording. Finishing audio never advances the story: the reader controls the pace.
- Advancing stops the previous voice immediately. A pending download cannot start later over a newer scene. Immediate possible next lines are preloaded, at most three; the app does not fetch the entire cast at entry.
- Listen replays from the beginning; while loading/playing it becomes Stop. Pausing, opening a modal, navigating away, hiding the tab and quick exit stop dialogue. Returning to an active scene restarts its line when auto-play is enabled. Pausing during the choice reaction suspends that transition; resuming allows its full 1.8-second reaction again.
- Rain starts only when enabled. Pause, reset, hidden tabs and leaving the supported story/landing pages stop it. After hiding the tab, the visitor must turn rain back on. No audio is persisted across reloads, and nothing reads private intake/reflection text aloud.
- Separate voice and rain volumes support zero/mute. Auto-play can be disabled while retaining manual Listen. Disabling adaptive rain keeps a constant moderate texture. This is independent of reduced visual motion.
- Unsupported/blocked playback and failed downloads produce a readable status with a retry action; missing human clips stay silent with captions. Browser gestures unlock playback; the app does not bypass browser autoplay rules or substitute speech synthesis.

## Weather direction

Tension is a separate 0–1 value per resident, starting at 0.4. A fictional negative-trust choice adds 0.22 per negative trust point; a supportive choice subtracts 0.12 per positive point; safely retaining evidence subtracts a further 0.08. Values clamp at 0 and 1. Merely not collecting evidence, leaving politely, skipping personal questions or withholding private information must never trigger a storm.

Two real rain recordings blend through a five-second continuous gain change. Above 0.6 tension, a third real rain/thunder recording slowly becomes audible; its gain is capped at 0.1 and its high frequencies are softened with a 900 Hz low-pass filter. This is a distant background layer, not a timed thunder jump-scare at a “wrong” answer. The storm track contains its own rain, not isolated thunder. All layers have blended loop boundaries. Reflection, debrief and endings settle toward tension 0.12, regardless of the visitor's personal answers. Rain ducks to 32% of the selected rain level during voice playback, with a 0.18-second descent and 0.9-second recovery.

## Acceptance checklist

- [ ] Fluent regional/accent reviewers approve every human character, in both languages.
- [ ] All 170 cue recordings pass `audio:check -- --require-complete`; no silent placeholders or generated voices are marked ready.
- [ ] Every branch and both endings play the matching current caption; narration is complete and choices remain unvoiced.
- [ ] Next, repeated clicks, language switch, Stop/Listen, auto-play off, pause/resume, settings, hidden tabs, navigation and quick exit never overlap or revive old voice.
- [ ] Voice/rain volumes work independently at zero, mid and maximum settings; rain returns after a recording ends or errors.
- [ ] Supportive choices calm the rain; negative choices intensify it gradually; no personal answer affects tension.
- [ ] Headphone and phone-speaker listening: loops are unobtrusive, rain sounds believable, dialogue is clear, and distant thunder remains gentle.
- [ ] Verify target desktop and mobile browsers, slow network and blocked audio. The included automated browser checks cover Edge; other target devices still require listening and compatibility review.
