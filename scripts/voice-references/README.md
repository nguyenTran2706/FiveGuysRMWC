# Original synthetic English voice references

These four WAVs establish the stable English identities for Bảo, Trâm, Khoa and Mai. They were generated locally using Qwen3-TTS VoiceDesign, not recorded from real people. The design instructions, spoken reference texts, seeds and pinned model revision are in [`../voice-cast.json`](../voice-cast.json). Model provenance is in [`../../public/audio/dialogue/CREDITS.md`](../../public/audio/dialogue/CREDITS.md).

Keep these selected reference files with the project: regenerating the same prompt is not guaranteed to recreate an identical voice on different hardware. `generate-voices.py qwen` reuses these files for every line. `generate-voices.py design` skips existing references unless explicitly passed `--force`.

They are production inputs, not additional story dialogue, and are not shipped in the website's public directory. Their intended accents still require listening review.
