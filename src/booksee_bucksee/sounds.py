"""Makes the letter sounds (phonics) in web/audio/ with the macOS voice – macOS only.

Browser voices read letters by name ("A" = /eɪ/), but children learn the sound (/æ/ as in apple).
A voice cannot say a lone sound, so each sound is cut out of a word the voice says well:
/æ/ is the start of "apple" (up to the p), /b/, /k/, /d/ are the start of "buh", "kuh", "duh"
with the vowel cut short. A recording of your own voice can replace any file (same name).
"""

import array
import subprocess
import tempfile
import wave
from pathlib import Path

# letter -> (word to say, how to cut it)
SOUNDS = {
    "a": ("apple", "vowel"),
    "b": ("buh", "consonant"),
    "c": ("kuh", "consonant"),
    "d": ("duh", "consonant"),
}

VOICE = "Samantha"
RATE = 110  # words per minute – slow, so the sound is long enough to hear
SR = 22050
FRAME = SR // 100  # 10 ms


def _say(word: str, wav: Path) -> array.array:
    aiff = wav.with_suffix(".aiff")
    subprocess.run(["say", "-v", VOICE, "-r", str(RATE), "-o", str(aiff), word], check=True)
    subprocess.run(["afconvert", "-f", "WAVE", "-d", f"LEI16@{SR}", "-c", "1", str(aiff), str(wav)], check=True)
    with wave.open(str(wav)) as w:
        return array.array("h", w.readframes(w.getnframes()))


def _cut(x: array.array, mode: str) -> array.array:
    rms = [(sum(v * v for v in x[i:i + FRAME]) / FRAME) ** 0.5 for i in range(0, len(x) - FRAME, FRAME)]
    top = max(rms)
    start = next(i for i, e in enumerate(rms) if e > 0.05 * top)
    if mode == "vowel":
        # until the lips close for the next consonant
        end = next(i for i in range(start + 3, len(rms)) if rms[i] < 0.15 * top)
    else:
        # the consonant and only a short "uh" after it
        loud = next(i for i, e in enumerate(rms) if e > 0.4 * top)
        end = loud + 12
    return x[start * FRAME:end * FRAME]


def _shape(x: array.array) -> array.array:
    fade_in, fade_out = SR // 100, SR * 4 // 100
    peak = max(abs(v) for v in x) or 1
    gain = 0.9 * 32767 / peak
    out = array.array("h")
    for i, v in enumerate(x):
        f = min(1.0, i / fade_in, (len(x) - i) / fade_out)
        out.append(int(v * gain * f))
    return out + array.array("h", [0] * (SR // 50))


def make_sounds(out_dir: Path, letters: list[str] | None = None) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    made = []
    with tempfile.TemporaryDirectory() as tmp:
        for letter in letters or SOUNDS:
            word, mode = SOUNDS[letter]
            wav = Path(tmp) / f"{letter}.wav"
            clip = _shape(_cut(_say(word, wav), mode))
            with wave.open(str(wav), "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(SR)
                w.writeframes(clip.tobytes())
            target = out_dir / f"{letter}.m4a"
            subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", str(wav), str(target)], check=True)
            made.append(target)
    return made
