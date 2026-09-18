"""Offline character-voice production. No hosted speech service or real-person cloning.

Run with .tools/voice-env/Scripts/python.exe (VieNeu) or voice-qwen/Scripts/python.exe.
Models must be downloaded first; all inference then uses local paths only.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault("HF_HOME", str(ROOT / ".tools/huggingface"))
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
os.environ.setdefault("PYTHONUTF8", "1")

import numpy as np
import soundfile as sf
import imageio_ffmpeg

CAST = json.loads((ROOT / "scripts/voice-cast.json").read_text(encoding="utf-8"))
WORK = ROOT / ".tools/voice-production"
WORK.mkdir(parents=True, exist_ok=True)
REFERENCES = ROOT / "scripts/voice-references"


def digest(value):
    return hashlib.sha256(value if isinstance(value, bytes) else value.encode("utf-8")).hexdigest()


def spoken_text(text, language):
    # Keep all narrative and spoken content, but realise explicit pause directions
    # as pauses instead of saying "a pause" robotically. Captions remain unchanged.
    text = text.replace("Một nhịp lặng.", "\n\n").replace("A pause.", "\n\n")
    text = text.replace("…", "...").replace("—", ", ")
    text = re.sub(r"[“”\"]", "", text)
    if language == "en":
        substitutions = {"ABN": "A B N", "RMWC": "R M W C", "$800": "eight hundred dollars", "500 visa": "five hundred visa"}
    else:
        substitutions = {"ABN": "ây bi en", "RMWC": "R M W C", "screenshot": "ảnh chụp màn hình", "PDF": "pi đi ép"}
    for original, replacement in substitutions.items():
        text = text.replace(original, replacement)
    return re.sub(r"[ \t]+", " ", text).strip()


def performance(cue, actor):
    negative = any(item.get("trust", 0) < 0 for item in cue["incoming"])
    evidence = any(item.get("recordEvidence") for item in cue["incoming"])
    pace = actor["pace"]
    mood = "conversational"
    if cue["category"] == "epilogue":
        mood, pace = "reflective narration", pace * .97
    elif cue["category"] == "artifact":
        mood, pace = "clear document narration", pace * .98
    elif negative or cue["cue"] == "closed":
        mood, pace = "guarded, contained", pace * .975
    elif evidence:
        mood = "cautious relief"
    return {"mood": mood, "tempo": round(pace, 4), "temperature": .78 if negative else .80}


def clean_samples(audio, sr):
    audio = np.asarray(audio, dtype=np.float32).reshape(-1)
    if not len(audio) or not np.isfinite(audio).all():
        raise ValueError("Empty or non-finite generation")
    # Trim only edge silence; preserve internal breaths and meaningful pauses.
    audible = np.flatnonzero(np.abs(audio) > .002)
    if not len(audible):
        raise ValueError("Silent generation")
    audio = audio[max(0, audible[0] - int(.09 * sr)): min(len(audio), audible[-1] + int(.18 * sr))]
    fade = min(int(.008 * sr), len(audio) // 4)
    audio[:fade] *= np.linspace(0, 1, fade)
    audio[-fade:] *= np.linspace(1, 0, fade)
    if not 1 < len(audio) / sr < 175:
        raise ValueError(f"Unexpected duration {len(audio) / sr:.1f}s")
    return audio


def export_clip(cue, audio, sr, actor, model_key, seed, text, profile):
    audio = clean_samples(audio, sr)
    master = WORK / "masters" / cue["pack"] / cue["character"] / (cue["cue"] + ".wav")
    master.parent.mkdir(parents=True, exist_ok=True)
    sf.write(master, audio, sr, subtype="PCM_24")
    target = ROOT / "public" / cue["src"].lstrip("/")
    target.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    # Small, pitch-preserving delivery adjustment; never used to fake an accent.
    filters = f"atempo={profile['tempo']},loudnorm=I=-18:TP=-1.5:LRA=9,apad=pad_dur=0.10"
    subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(master), "-af", filters, "-ac", "1", "-ar", "48000", "-codec:a", "libmp3lame", "-b:a", "160k", "-metadata", "comment=Locally AI-generated fictional character dialogue", str(target)], check=True)
    decoded = subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(target), "-f", "f32le", "-ac", "1", "-ar", "16000", "pipe:1"], check=True, capture_output=True).stdout
    samples = np.frombuffer(decoded, dtype=np.float32)
    duration = len(samples) / 16000
    peak = float(np.max(np.abs(samples)))
    rms = float(np.sqrt(np.mean(samples ** 2)))
    if not 1 < duration < 180 or rms < .003 or peak >= 1:
        raise ValueError(f"Encoded audio fails technical check: {duration=}, {peak=}, {rms=}")
    model = CAST["models"][model_key]
    review = {
        "textSha256": cue["textSha256"], "audioSha256": digest(target.read_bytes()),
        "accent": cue["pack"], "humanPerformed": False, "approved": False,
        "production": "local-synthetic", "technicalValidated": True,
        "listeningApproval": "pending", "accentVerification": "pending-native-listener",
        "model": model["repo"], "modelRevision": model["revision"],
        "voice": actor["viVoice"] if model_key == "vieneu" else f"designed-{cue['character']}",
        "seed": seed, "spokenText": text, "performance": profile,
        "durationSeconds": round(duration, 3), "sampleRate": 48000,
        "peak": round(peak, 6), "rms": round(rms, 6),
    }
    review_path = ROOT / cue["reviewFile"]
    review_path.parent.mkdir(parents=True, exist_ok=True)
    review_path.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"SAVED {cue['pack']}/{cue['character']}/{cue['cue']}: {duration:.1f}s, {target.stat().st_size} bytes", flush=True)


def done(cue):
    target = ROOT / "public" / cue["src"].lstrip("/")
    review_path = ROOT / cue["reviewFile"]
    if not target.exists() or not review_path.exists():
        return False
    review = json.loads(review_path.read_text(encoding="utf-8"))
    return review.get("textSha256") == cue["textSha256"] and review.get("audioSha256") == digest(target.read_bytes()) and review.get("technicalValidated") is True


def design_references(args):
    import torch
    from qwen_tts import Qwen3TTSModel
    torch.set_num_threads(6)
    model = Qwen3TTSModel.from_pretrained(str(ROOT / CAST["models"]["design"]["path"]), device_map=args.device, dtype=torch.bfloat16, attn_implementation="sdpa")
    for character, actor in CAST["characters"].items():
        if actor["enEngine"] != "qwen" or (args.character and character != args.character):
            continue
        target = REFERENCES / f"{character}-en.wav"
        if target.exists() and not args.force:
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        torch.manual_seed(actor["seed"])
        print(f"DESIGNING {character}: {actor['design']}", flush=True)
        wavs, sr = model.generate_voice_design(text=actor["referenceText"], language="English", instruct=actor["design"], max_new_tokens=750, temperature=.8, top_p=.95, repetition_penalty=1.05)
        sf.write(target, clean_samples(wavs[0], sr), sr, subtype="PCM_24")
        print(f"REFERENCE {target} ({len(wavs[0])/sr:.1f}s)", flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("engine", choices=["vieneu", "design", "qwen"])
    parser.add_argument("--character")
    parser.add_argument("--language", choices=["vi", "en"])
    parser.add_argument("--cue")
    parser.add_argument("--samples", action="store_true", help="Opening scene only for each selected character/language")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--device", default="cuda:0")
    parser.add_argument("--take", type=int, default=0, help="Deterministic alternate take for targeted pickups")
    parser.add_argument("--chunk-chars", type=int, default=200, help="VieNeu text chunk size")
    args = parser.parse_args()
    if args.engine == "design":
        design_references(args)
        return
    import torch
    torch.set_num_threads(6)
    manifest = json.loads((ROOT / "docs/recording-scripts/manifest.json").read_text(encoding="utf-8"))
    cues = [cue for cue in manifest["cues"] if (not args.character or cue["character"] == args.character) and (not args.language or cue["language"] == args.language) and (not args.cue or cue["cue"] == args.cue) and (not args.samples or cue["cue"] == "hello") and (("vieneu" if cue["language"] == "vi" else CAST["characters"][cue["character"]]["enEngine"]) == args.engine)]
    cues = [cue for cue in cues if args.force or not done(cue)]
    print(f"GENERATING {len(cues)} clips with {args.engine} on {args.device}; generated speech, not human recordings.", flush=True)
    if not cues:
        return
    if args.engine == "vieneu":
        from vieneu import Vieneu
        model = Vieneu(backbone_repo=str(ROOT / CAST["models"]["vieneu"]["path"]), moss_tokenizer=str(ROOT / CAST["models"]["moss"]["path"]), device=args.device, backend="pytorch", max_batch_size=4)
    else:
        from qwen_tts import Qwen3TTSModel
        model = Qwen3TTSModel.from_pretrained(str(ROOT / CAST["models"]["english"]["path"]), device_map=args.device, dtype=torch.bfloat16, attn_implementation="sdpa")
    prompts = {}
    failures = []
    for index, cue in enumerate(cues):
        actor = CAST["characters"][cue["character"]]
        text = spoken_text(cue["text"], cue["language"])
        profile = performance(cue, actor)
        profile["textChunkChars"] = args.chunk_chars if args.engine == "vieneu" else None
        profile["device"] = args.device
        if args.engine == "qwen":
            profile["temperature"] = .8
        seed = actor["seed"] + int(digest(cue["cue"] + cue["language"])[:6], 16) + args.take * 100003
        torch.manual_seed(seed)
        np.random.seed(seed)
        started = time.monotonic()
        print(f"[{index+1}/{len(cues)}] {cue['character']} {cue['language']} {cue['cue']}", flush=True)
        try:
            if args.engine == "vieneu":
                audio = model.infer(text, voice=actor["viVoice"], temperature=profile["temperature"], max_chars=args.chunk_chars, batch_size=4, apply_watermark=True)
                sr = model.sample_rate
            else:
                if cue["character"] not in prompts:
                    reference = REFERENCES / f"{cue['character']}-en.wav"
                    prompts[cue["character"]] = model.create_voice_clone_prompt(ref_audio=str(reference), ref_text=actor["referenceText"], x_vector_only_mode=False)
                wavs, sr = model.generate_voice_clone(text=text, language="English", voice_clone_prompt=prompts[cue["character"]], max_new_tokens=1800, temperature=profile["temperature"], top_p=.95, repetition_penalty=1.05)
                audio = wavs[0]
            export_clip(cue, audio, sr, actor, "vieneu" if args.engine == "vieneu" else "english", seed, text, profile)
            print(f"ELAPSED {time.monotonic()-started:.1f}s", flush=True)
        except Exception as error:
            import traceback
            traceback.print_exc()
            failures.append(f"{cue['character']}/{cue['language']}/{cue['cue']}: {error}")
    if failures:
        raise SystemExit("Failed clips:\n" + "\n".join(failures))


if __name__ == "__main__":
    main()
