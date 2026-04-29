interface RoomAIOptions {
  silenceThreshold?: number;
  volumeThreshold?: number;
  silenceCooldown?: number;
  loudCooldown?: number;
  onAISpeak?: (text: string) => void;
  audioFilePath?: string;
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
  private audioFilePath: string | undefined;
  private audioPlayed: boolean;
  private audio: HTMLAudioElement | null;

  constructor(roomId: string, options: RoomAIOptions = {}) {
    this._roomId = roomId;
    this.lastSpeechTimestamp = Date.now();
    this.volumeHistory = [];
    this.silenceThreshold = options.silenceThreshold ?? 12000;
    this.volumeThreshold = options.volumeThreshold ?? 0.7;
    this.silenceCooldown = 0; // Start at 0 so it can trigger after threshold
    this.loudCooldown = 0;
    this.onAISpeak = options.onAISpeak;
    this.speechSynth = null;
    this.audioFilePath = options.audioFilePath;
    this.audioPlayed = false;
    this.audio = null;

    this.checkInterval = setInterval(() => this.checkTriggers(), 1000);
  }

  get roomId(): string {
    return this._roomId;
  }

  onUserSpeak(): void {
    this.lastSpeechTimestamp = Date.now();
  }

  resetAudioState(): void {
    this.audioPlayed = false;
  }

  private playAudioFile(): void {
    if (this.audioFilePath && !this.audioPlayed) {
      try {
        console.log('🎵 Playing robot convo sound:', this.audioFilePath);
        this.audio = new Audio(this.audioFilePath);
        this.audio.addEventListener('ended', () => {
          console.log('🎵 Audio finished playing');
          this.audioPlayed = true;
          if (this.onAISpeak) {
            this.onAISpeak('[robot convo sound]');
          }
        });
        this.audio.play().catch((err) => {
          console.error('🎵 Audio play error:', err);
          this.audio = null;
        });
      } catch (err) {
        console.error('🎵 Audio error:', err);
      }
    }
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
      if (this.silenceCooldown < 0) this.silenceCooldown = 0;
    }
    if (this.loudCooldown > 0) {
      this.loudCooldown -= 1000;
      if (this.loudCooldown < 0) this.loudCooldown = 0;
    }

    const silenceMs = now - this.lastSpeechTimestamp;
    if (silenceMs > this.silenceThreshold && this.silenceCooldown <= 0) {
      console.log('🤖 12 seconds of silence detected! cooldown:', this.silenceCooldown, 'audioPlayed:', this.audioPlayed);
      if (this.audioFilePath && !this.audioPlayed) {
        console.log('🤖 Playing audio file...');
        this.playAudioFile();
        this.silenceCooldown = 30 * 60 * 1000;
        console.log('🤖 Cooldown set to 30 minutes');
      } else if (!this.audioFilePath) {
        const response = silenceResponses[Math.floor(Math.random() * silenceResponses.length)];
        this.speak(response);
        this.silenceCooldown = 30 * 60 * 1000;
      }
      return;
    }

    if (this.volumeHistory.length >= 10) {
      const avgVolume = this.volumeHistory.slice(-10).reduce((a, b) => a + b, 0) / 10;
      if (avgVolume > this.volumeThreshold && this.loudCooldown <= 0) {
        const response = loudResponses[Math.floor(Math.random() * loudResponses.length)];
        this.speak(response);
        this.loudCooldown = 5 * 60 * 1000; // 5 minutes for loud
        return;
      }
    }
  }

  speak(text: string): void {
    if (this.speechSynth) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;  // Slower = more conversational
    utterance.pitch = 1.0;
    utterance.volume = 0.85;

    // Try to find natural-sounding voices
    const voices = window.speechSynthesis.getVoices();
    
    // Preferred voices (most natural-sounding)
    const preferredVoices = [
      'Google US English',
      'Microsoft Zira',
      'Microsoft David',
      'Samantha',
      'Alex',
      'Daniel',
      'English United Kingdom',
    ];
    
    let selectedVoice = null;
    for (const name of preferredVoices) {
      selectedVoice = voices.find(v => v.name.includes(name));
      if (selectedVoice) break;
    }
    
    // Fallback to any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
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