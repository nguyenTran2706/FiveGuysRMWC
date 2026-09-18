"""Local transcription smoke check. Detects probable omissions; not accent approval."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import unicodedata
from difflib import SequenceMatcher

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

def number_words(number):
    small = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
    tens = "zero ten twenty thirty forty fifty sixty seventy eighty ninety".split()
    if number < 20:
        return small[number]
    if number < 100:
        return tens[number // 10] + (" " + small[number % 10] if number % 10 else "")
    if number < 1000:
        return small[number // 100] + " hundred" + (" " + number_words(number % 100) if number % 100 else "")
    return str(number)


def tokens(text, language):
    if language == "en":
        # ASR may write "$800"/"6" where the speech input says
        # "eight hundred dollars"/"six". Compare their words, not typography.
        text = re.sub(r"\$(\d+)\b", lambda match: number_words(int(match[1])) + " dollars", text)
        text = re.sub(r"\b\d+\b", lambda match: number_words(int(match[0])), text)
    text = unicodedata.normalize("NFKD", text.lower().replace("đ", "d"))
    text = "".join(char for char in text if not unicodedata.combining(char))
    return re.findall(r"[a-z0-9]+", text)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--samples", action="store_true")
    parser.add_argument("--language", choices=["vi", "en"])
    parser.add_argument("--character")
    parser.add_argument("--cue")
    parser.add_argument("--no-vad", action="store_true", help="Recheck possible omissions without voice-activity filtering")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    from faster_whisper import WhisperModel
    model = WhisperModel(str(ROOT / ".tools/voice-models/whisper-small"), device="cpu", compute_type="int8", cpu_threads=4, num_workers=1, local_files_only=True)
    manifest = json.loads((ROOT / "docs/recording-scripts/manifest.json").read_text(encoding="utf-8"))
    results = []
    for cue in manifest["cues"]:
        if (args.samples and cue["cue"] != "hello") or (args.language and cue["language"] != args.language) or (args.character and cue["character"] != args.character) or (args.cue and cue["cue"] != args.cue):
            continue
        path = ROOT / "public" / cue["src"].lstrip("/")
        review = ROOT / cue["reviewFile"]
        if not path.exists() or not review.exists():
            continue
        metadata = json.loads(review.read_text(encoding="utf-8"))
        audio_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        if not args.force and metadata.get("transcriptionCheck", {}).get("audioSha256") == audio_hash:
            results.append(metadata["transcriptionCheck"])
            continue
        segments, info = model.transcribe(str(path), language=cue["language"], beam_size=3, vad_filter=not args.no_vad, condition_on_previous_text=False, word_timestamps=False)
        transcript = " ".join(segment.text.strip() for segment in segments)
        expected = tokens(metadata.get("spokenText", cue["text"]), cue["language"])
        actual = tokens(transcript, cue["language"])
        matcher = SequenceMatcher(None, expected, actual, autojunk=False)
        matched = sum(block.size for block in matcher.get_matching_blocks())
        coverage = matched / max(1, len(expected))
        precision = matched / max(1, len(actual))
        result = {"audioSha256": audio_hash, "model": "Systran/faster-whisper-small", "transcript": transcript, "expectedWordCoverage": round(coverage, 3), "matchedWordPrecision": round(precision, 3), "flag": coverage < .65 or precision < .65, "note": "Automated transcription comparison only; not human listening or accent approval."}
        metadata["transcriptionCheck"] = result
        review.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
        results.append(result)
        print(f"{'FLAG' if result['flag'] else 'CHECK'} {cue['character']}/{cue['language']}/{cue['cue']} coverage={coverage:.2f} precision={precision:.2f}: {transcript}", flush=True)
    print(f"Transcription checks: {len(results)}, flagged: {sum(result['flag'] for result in results)}", flush=True)

if __name__ == "__main__":
    main()
