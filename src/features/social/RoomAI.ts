interface RoomAIOptions {
  silenceThreshold?: number;
  volumeThreshold?: number;
  silenceCooldown?: number;
  loudCooldown?: number;
  onAISpeak?: (text: string) => void;
}

const silenceResponses = [
  "This might be the quietest room I've ever heard...",
  "So nobody's talking huh?",
  "I thought my audio broke for a second",
  "Cricket sounds...",
  "Someone say something... anyone?",
  "This silence is loud",
  "Am I in the wrong room?",
];

const loudResponses = [
  "Alright alright, quiet down",
  "This room is getting loud",
  "I can hear you in another dimension",
  "Y'all need to use your inside voices",
  "My ears! Too loud!",
  "Calm down, it's not that serious",
];

export class RoomAI {
  private _roomId: string;
  private lastSpeechTimestamp: number;
  private volumeHistory: number[];
  private silenceCooldown: number;
  private loudCooldown: number;
  private silenceThreshold: number;
  private volumeThreshold: number;
  private checkInterval: ReturnType<typeof setInterval> | null;
  private onAISpeak: ((text: string) => void) | undefined;
  private speechSynth: SpeechSynthesisUtterance | null;

  constructor(roomId: string, options: RoomAIOptions = {}) {
    this._roomId = roomId;
    this.lastSpeechTimestamp = Date.now();
    this.volumeHistory = [];
    this.silenceThreshold = options.silenceThreshold ?? 12000;
    this.volumeThreshold = options.volumeThreshold ?? 0.7;
    this.silenceCooldown = options.silenceCooldown ?? 20000;
    this.loudCooldown = options.loudCooldown ?? 15000;
    this.onAISpeak = options.onAISpeak;
    this.speechSynth = null;

    this.checkInterval = setInterval(() => this.checkTriggers(), 1000);
  }

  get roomId(): string {
    return this._roomId;
  }

  onUserSpeak(): void {
    this.lastSpeechTimestamp = Date.now();
  }

  onVolumeUpdate(level: number): void {
    this.volumeHistory.push(level);
    if (this.volumeHistory.length > 50) {
      this.volumeHistory.shift();
    }
  }

  private checkTriggers(): void {
    const now = Date.now();

    if (this.silenceCooldown > 0) {
      this.silenceCooldown -= 1000;
    }
    if (this.loudCooldown > 0) {
      this.loudCooldown -= 1000;
    }

    const silenceMs = now - this.lastSpeechTimestamp;
    if (silenceMs > this.silenceThreshold && this.silenceCooldown <= 0) {
      const response = silenceResponses[Math.floor(Math.random() * silenceResponses.length)];
      this.speak(response);
      this.silenceCooldown = 20000;
      return;
    }

    if (this.volumeHistory.length >= 10) {
      const avgVolume = this.volumeHistory.slice(-10).reduce((a, b) => a + b, 0) / 10;
      if (avgVolume > this.volumeThreshold && this.loudCooldown <= 0) {
        const response = loudResponses[Math.floor(Math.random() * loudResponses.length)];
        this.speak(response);
        this.loudCooldown = 15000;
        return;
      }
    }
  }

  speak(text: string): void {
    if (this.speechSynth) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    this.speechSynth = utterance;

    if (this.onAISpeak) {
      this.onAISpeak(text);
    }

    window.speechSynthesis.speak(utterance);
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.speechSynth) {
      window.speechSynthesis.cancel();
      this.speechSynth = null;
    }
  }
}