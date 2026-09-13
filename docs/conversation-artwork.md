# Conversation artwork

Every dialogue node for Linh, Bảo, Cô Hạnh, Trâm, Đức, Khoa and Mai has its own cinematic still. Each resident also has separate images for the two epilogues. The seven established portraits remain the opening shots. The library contains 71 dialogue images and 14 ending images: 85 distinct assets, including 78 new generated scenes.

| Character | Dialogue shots | Ending shots | Setting |
| --- | ---: | ---: | --- |
| Linh | 14 | 2 | John Street, Cabramatta nail salon |
| Bảo | 14 | 2 | Upstairs home near Freedom Plaza, Cabramatta |
| Cô Hạnh | 14 | 2 | Arthur Street, Cabramatta home kitchen |
| Trâm | 7 | 2 | Hughes Street, Cabramatta upstairs rental |
| Đức | 8 | 2 | Ground-floor brick flat in Canley Vale |
| Khoa | 7 | 2 | Lansvale home veranda |
| Mai | 7 | 2 | Railway Parade, Cabramatta rental |

These are fictional people and imagined settings. The stills illustrate the conversations; they do not depict actual workers, homes or businesses. The artwork stays in the story's rainy night even while the interface shows live AEST (UTC+10).

## Generation and files

All new scenes were generated with the built-in `image_gen` tool, using the corresponding `public/images/*-v2.webp` portrait as the identity and location reference. Each prompt specifies a different action or camera angle tied to the dialogue, with consistent clothing, lighting and local surroundings. The prompts preserve Hạnh's wrapped right forearm. Memories remain in the present conversation setting. Faces and important props sit toward the right, leaving space for interface text.

- [Final prompts and destinations](../scripts/conversation-art-plan.json) record the exact prompt, reference image and output path for every new scene.
- [Generated source manifest](../scripts/conversation-art-sources.json) records the original generated PNG filename for each final WebP, plus the final correction prompt and reference for Hạnh's closing shot.
- The game assets are in `public/images/conversations/<resident>/<node>.webp`; epilogues use `ending-kept.webp` and `ending-missed.webp`.
- [Scene mapping](../src/data/conversationArtwork.ts) explicitly connects dialogue node IDs and endings to their assets.

Original generated PNGs remain in the generator's output directory. WebP conversion uses `sharp`, a 1600px width, quality 80 and effort 6. To prepare assets from the recorded originals:

```sh
node scripts/prepare-conversation-images.mjs /path/to/generated_images/session
```

The converter preserves existing outputs and never removes originals. During generation, `scripts/collect-conversation-art.mjs` merges completed scene records from the ignored `.tools/conversation-completed/` directory into the source manifest.

## Playback and verification

The next dialogue image is decoded before a short crossfade. Only immediately available branches are prefetched. A late response from an earlier scene cannot replace the current scene; failed requests fall back to the character's opening portrait without blocking choices. Reduced-motion preferences disable the animation. Reflection, private-note and debrief steps retain the last spoken shot, and the epilogue changes to the matching ending image. The newer story-selection flow, trust feedback and debrief screens from the shared repository are preserved.

Asset tests check every node and both endings, real image dimensions and file sizes, unique image hashes, and immediate-branch preloading. Browser tests play all seven conversations, check that rendered images follow the dialogue and endings, and simulate slow and unavailable images. The interface was also inspected at desktop and mobile widths.

Validation: production build, 34 unit tests and 12 browser tests pass.

## Remaining visual refinements

The shared repository revised Linh's stage directions during artwork generation. Every node has a distinct finished image, but three poses could align more closely with the newer directions: `hours` currently shows a towel rather than counting cash; `visa` shows a phone in her hand rather than in her pocket; `kept` shows handwritten notes rather than saving screenshots on the phone. Attempts to generate those extra adjustments hit the image service's usage limit. The existing images are retained, and the newer dialogue is preserved.
