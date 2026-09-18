# Locally generated character voices

## Find and play the actual files

Open `/audio/voice-preview.html` through the local Vite server. The page lists every character and language, displays the caption and intended accent, plays one recording at a time, and offers an MP3 download. It is also linked from the story's audio settings. The live inventory is `public/audio/dialogue/catalog.json`; it reports the actual available count, not an aspirational total.

The MP3 files are under `public/audio/dialogue/<accent>/<character>/<cue>.mp3`. Examples:

```text
public/audio/dialogue/vi-south/linh/hello.mp3
public/audio/dialogue/en-vietnamese/linh/hello.mp3
public/audio/dialogue/en-australian/bao/hello.mp3
public/audio/dialogue/en-american/tram/hello.mp3
```

The generated package contains all 170 clips: 85 Vietnamese and 85 English, covering all 71 story nodes and both endings for all seven characters. The final MP3s total about 40.8 MB and 33 minutes 49 seconds. These are **AI-generated**, not human performances. File availability and technical validation are separate from accent, pronunciation and naturalness approval. The library and review metadata explicitly retain that distinction.

## Fixed casting and performance

| Character | Vietnamese preset / intended region | English source / intended accent | Delivery |
|---|---|---|---|
| Linh | Thục Đoan / Southern | Same VieNeu preset / Vietnamese-English | Warm, observant, tired; space around money and her mother |
| Bảo | Adam / Southern | Original Qwen-designed voice / Australian | Younger, relaxed humour; clearer pauses around tax letters |
| Cô Hạnh | Ngọc Trân / Central | Same VieNeu preset / Vietnamese-English | Unhurried hospitality, mature practical strength |
| Trâm | Mỹ Duyên / Southern | Original Qwen-designed voice / General American | Quiet, alert, clear boundaries; no theatrical fear |
| Đức | Xuân Vĩnh / Northern | Same VieNeu preset / Vietnamese-English | Measured mid-low register, reflective; warmth around the bicycle |
| Khoa | Quang Sơn / Central | Original Qwen-designed voice / Australian | Lower and steadier than Bảo, dry humour and dignity |
| Mai | Ngọc Huyền / Northern | Original Qwen-designed voice / General American | Private, composed, lower and more settled than Trâm |

Vietnamese regional labels come from the model publisher's preset metadata. A specific city variety (for example Da Nang or Hanoi) is **not** certified. Australian and American voices are prompted designs whose actual accent must be assessed by listeners. There is no random accent selection or pitch-shifting one voice into seven characters. No real-person recording was downloaded for cloning: Qwen references are original synthetic voices; VieNeu uses its distributed presets.

`scripts/voice-cast.json` records every preset, design prompt, reference text, character seed, baseline tempo and pinned model revision. A designed English reference is reused for all of that character's lines, rather than redesigning their voice at each turn. The Vietnamese model's deprecated style argument is deliberately not used: its delivery follows the chosen preset.

Each scene has a production profile. Guarded responses become slightly more measured; artifact passages favour clarity; endings favour reflective pacing. Fine tempo adjustments use a pitch-preserving filter, not pitch changes or a purported accent transformation. Explicit “A pause” / “Một nhịp lặng” directions become pauses. Some acronyms and numbers are supplied as pronunciation spellings; captions stay unchanged. The exact spoken input and processing settings are saved per clip for inspection. No personal visitor text is generated or recorded.

## Generation and finishing

VieNeu-TTS v3 Turbo produces the Vietnamese clips and the three Vietnamese-accented English roles at 48 kHz. Qwen3-TTS VoiceDesign creates the remaining English reference voices; Qwen3-TTS Base reuses those references for their dialogue. Models are downloaded once from the publishers' public repositories. Inference uses local paths with Hugging Face/Transformers offline mode enabled. There is no hosted speech-generation endpoint or API key.

Original 24-bit WAV renders are retained under `.tools/voice-production/masters/`; model caches, Python environments and intermediates are ignored by Git. The four selected synthetic English voice references are preserved in `scripts/voice-references/` with the project, so future pickups can reuse the same identity without redesigning it. The application needs only the final MP3s, not Python or a GPU. Final files are mono 48 kHz MP3 at 160 kbps, with conservative edge trimming, short boundary fades and a loudness target of -18 LUFS / -1.5 dBTP. Do not treat this target as a measured guarantee for every short clip: decoded peak, RMS and duration are recorded individually.

The generator checks decoding, finite samples, non-silence, peak and duration before marking a clip technically validated. All 170 current files have matching technical checks and local Whisper transcription comparisons. Linh's English `hours` and Đức's Vietnamese `closed` were regenerated after the first comparison flagged possible wording problems. No current comparison falls below the smoke-check threshold; this does **not** mean every word is correct. The comparison normalises English numeric typography (for example "$800" versus "eight hundred dollars"). Transcription makes mistakes, particularly on regional Vietnamese, names and code-switching. It is a smoke test, not a substitute for listening or a proof that every word was pronounced correctly.

Review JSON in `recording-reviews/<accent>/<character>/<cue>.json` stores caption/audio SHA-256, model/revision, voice, seed, exact spoken text, performance settings, measured duration/levels and transcription results when available. Synthetic entries always retain `humanPerformed: false`. They are playable after technical validation, but `approved: false` and `listeningApproval: pending` remain until a person actually reviews them. Do not stamp an approval on files just to make a check pass.

## Reproduce or regenerate

Windows with Python 3.11 via `uv`, an NVIDIA GPU supporting CUDA 12.8, and enough disk space for several GB of model/runtime downloads:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-voices.ps1
npm.cmd run audio:prepare
$env:PYTHONUTF8 = '1'
.tools/voice-env/Scripts/python.exe scripts/generate-voices.py vieneu
.tools/voice-qwen/Scripts/python.exe scripts/generate-voices.py design
.tools/voice-qwen/Scripts/python.exe scripts/generate-voices.py qwen
.tools/voice-env/Scripts/python.exe scripts/verify-voices.py
npm.cmd run audio:prepare
npm.cmd run audio:check -- --require-complete
npm.cmd run build
```

Run GPU stages sequentially. No other applications are stopped to free GPU memory. `--character linh --language vi --cue hello --force --take 1` renders an alternate take of one specific line; without `--force`, current matching audio is retained. `--samples` produces opening lines only. `--chunk-chars 120` can shorten VieNeu text segments for a targeted pickup. Keep a copy of selected renders before a deliberate pickup. Regeneration invalidates the old audio hash and old listening approval. `--device cpu` is available but slower.

`npm run audio:check -- --require-complete` checks availability and metadata consistency. `npm run audio:check -- --require-listening-reviewed` is the separate listening-approval gate and should fail until listening is actually complete.

## Listening pass still required

Check each character's opening, a guarded reply, an artifact and both endings in the voice library, then check the remaining lines. Review pronunciation and complete meaning against the captions, voice consistency between branches, regional authenticity, overly rushed or unnatural rhythm, unwanted sounds, and intelligibility over rain. Pay special attention to names, amounts, visa numbers, ABN/super terminology and English spoken by Vietnamese presets. Human listeners should decide whether any clip needs a pickup; automated file checks cannot make that decision.

The [human-recording guide](audio-production.md) remains available if a later release replaces synthetic clips with actors. [Source credits and model licences](../public/audio/dialogue/CREDITS.md) describe the current generation sources.
