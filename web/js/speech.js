// Reads English out loud with the browser's built-in voice (Web Speech API).
// The player cannot read yet, so every instruction, hint and praise is spoken.
//
// Letter sounds are written in brackets: "[a], [a], apple!". The voice would read a lone
// letter by its name ("ay"), so a bracketed letter plays the sound file web/audio/a.m4a
// (/æ/ as in apple) instead. On screen the brackets disappear – see display().

const PREFERRED = [/Google UK English Female/, /Samantha/, /Serena/, /Martha/, /Kate/, /Daniel/, /Google US English/];
const SOUND = /\[([a-z])\]/g;

// "[a], [a], apple!" -> "a, a, apple!"
export const display = (text) => String(text ?? "").replace(SOUND, "$1");

class Speech {
  constructor() {
    this.muted = false;
    this.voice = null;
    this.run = 0; // bumped on every say()/stop() so an older queue stops playing
    this.audio = new Map(); // letter -> HTMLAudioElement
    this.playing = null;
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

  sound(letter) {
    if (!this.audio.has(letter)) {
      const a = new Audio(`audio/${letter}.m4a`);
      a.preload = "auto";
      this.audio.set(letter, a);
    }
    return this.audio.get(letter);
  }

  // Must run inside a tap/click once: iPad and iPhone only allow sound files started by the user.
  unlock(letters = "abcd") {
    for (const letter of letters) {
      const a = this.sound(letter);
      a.muted = true;
      a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = false; }, () => { a.muted = false; });
    }
  }

  // Speaks one text or a list of texts one after another. Stops whatever was being said.
  say(texts) {
    this.stop();
    if (this.muted) return;
    const parts = [];
    for (const text of [texts].flat().filter(Boolean)) {
      let last = 0;
      for (const m of text.matchAll(SOUND)) {
        parts.push({ text: text.slice(last, m.index) }, { letter: m[1] });
        last = m.index + m[0].length;
      }
      parts.push({ text: text.slice(last) });
    }
    const run = this.run;
    // Chrome sometimes drops an utterance spoken right after cancel(), so wait a moment.
    setTimeout(() => this.play(parts.filter((p) => p.letter || /[\p{L}\p{N}]/u.test(p.text)), run), 80);
  }

  async play(parts, run) {
    for (const part of parts) {
      if (run !== this.run) return;
      try {
        await (part.letter ? this.playSound(part.letter) : this.speak(part.text));
      } catch {
        // A missing voice or sound file must not stop the game.
      }
    }
  }

  speak(text) {
    if (!this.synth) return Promise.resolve();
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      // Keep a reference: Chrome may garbage-collect a playing utterance and never send onend.
      this.utterance = u;
      u.lang = this.voice?.lang ?? "en-GB";
      if (this.voice) u.voice = this.voice;
      u.rate = 0.8; // slower for a 5-year-old
      u.pitch = 1.1;
      let watch;
      const done = () => {
        clearInterval(watch);
        resolve();
      };
      u.onend = u.onerror = done;
      // Safety net: if onend never comes (a dropped utterance), go on once the voice is silent.
      const started = performance.now();
      watch = setInterval(() => {
        const silent = !this.synth.speaking && !this.synth.pending;
        if (silent && performance.now() - started > 600) done();
      }, 250);
      this.synth.speak(u);
    });
  }

  playSound(letter) {
    const a = this.sound(letter);
    this.playing = a;
    a.currentTime = 0;
    return new Promise((resolve) => {
      a.onerror = () => resolve();
      a.onpause = () => this.playing !== a && resolve(); // stopped by stop()
      a.onended = () => setTimeout(resolve, 250); // a short break, like a comma
      a.play().catch(resolve);
    });
  }

  stop() {
    this.run += 1;
    this.synth?.cancel();
    this.playing?.pause();
    this.playing = null;
  }
}

export const speech = new Speech();
