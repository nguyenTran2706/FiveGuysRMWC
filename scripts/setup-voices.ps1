$ErrorActionPreference = 'Stop'
$VoiceProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $VoiceProjectRoot
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) { throw 'Install uv first; this script does not modify your global Python installation.' }
if (-not (Test-Path -LiteralPath '.tools/voice-env/Scripts/python.exe')) { uv venv .tools/voice-env --python 3.11 }
if (-not (Test-Path -LiteralPath '.tools/voice-qwen/Scripts/python.exe')) { uv venv .tools/voice-qwen --python 3.11 }
foreach ($VoicePython in @('.tools/voice-env/Scripts/python.exe', '.tools/voice-qwen/Scripts/python.exe')) {
  uv pip install --python $VoicePython torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu128
  if ($LASTEXITCODE -ne 0) { throw 'CUDA runtime installation failed.' }
}
uv pip install --python .tools/voice-env/Scripts/python.exe vieneu==3.8.1 transformers==4.57.6 accelerate==1.15.0 imageio-ffmpeg==0.6.0 soundfile==0.14.0 faster-whisper==1.2.1
if ($LASTEXITCODE -ne 0) { throw 'VieNeu installation failed.' }
uv pip install --python .tools/voice-qwen/Scripts/python.exe qwen-tts==0.1.1 imageio-ffmpeg==0.6.0 soundfile==0.14.0
if ($LASTEXITCODE -ne 0) { throw 'Qwen installation failed.' }
$env:PYTHONUTF8 = '1'
.tools/voice-env/Scripts/python.exe scripts/download-voice-models.py
if ($LASTEXITCODE -ne 0) { throw 'Model download failed.' }
Write-Output 'Local voice models installed. No voice-generation service or API key is used.'
