"""Download pinned public weights; this does not send story text to a service."""
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.environ["HF_HOME"] = str(ROOT / ".tools/huggingface")
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
from huggingface_hub import snapshot_download

cast = json.loads((ROOT / "scripts/voice-cast.json").read_text(encoding="utf-8"))
for key, model in cast["models"].items():
    options = {"allow_patterns": ["update/*", "config.json", "speaker_encoder.onnx", "denoiser.onnx", "README.md"]} if key == "vieneu" else {}
    print(snapshot_download(model["repo"], revision=model["revision"], local_dir=ROOT / model["path"], **options))
print(snapshot_download("Systran/faster-whisper-small", allow_patterns=["model.bin", "config.json", "tokenizer.json", "vocabulary.txt", "preprocessor_config.json"], local_dir=ROOT / ".tools/voice-models/whisper-small"))
