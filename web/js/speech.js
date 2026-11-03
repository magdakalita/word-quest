// Reads English out loud with the browser's built-in voice (Web Speech API) – no audio files needed.
// The player cannot read yet, so every instruction, hint and praise is spoken.

const PREFERRED = [/Google UK English Female/, /Samantha/, /Serena/, /Martha/, /Kate/, /Daniel/, /Google US English/];

class Speech {
  constructor() {
    this.muted = false;
    this.voice = null;
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!this.synth) return;
    this.pickVoice();
    this.synth.addEventListener?.("voiceschanged", () => this.pickVoice());
  }

  pickVoice() {
    const voices = this.synth.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
    const lang = (v, code) => v.lang.replace("_", "-").toLowerCase() === code;
    this.voice =
      PREFERRED.map((re) => voices.find((v) => re.test(v.name))).find(Boolean) ??
      voices.find((v) => lang(v, "en-gb")) ??
      voices.find((v) => lang(v, "en-us")) ??
      voices[0] ??
      null;
  }

  // Speaks one text or a list of texts one after another. Stops whatever was being said.
  say(texts) {
    if (!this.synth) return;
    this.synth.cancel();
    if (this.muted) return;
    for (const text of [texts].flat().filter(Boolean)) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = this.voice?.lang ?? "en-GB";
      if (this.voice) u.voice = this.voice;
      u.rate = 0.8; // slower for a 5-year-old
      u.pitch = 1.1;
      this.synth.speak(u);
    }
  }

  stop() {
    this.synth?.cancel();
  }
}

export const speech = new Speech();
