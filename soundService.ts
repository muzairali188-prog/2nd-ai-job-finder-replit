
/**
 * UI Sound Service
 * Provides standardized audio feedback for user interactions.
 */

const SOUNDS = {
  TAP: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  ACTION: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  ERROR: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  WHOOSH: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
};

class SoundService {
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    // Pre-load sounds
    Object.values(SOUNDS).forEach(url => {
      const audio = new Audio(url);
      audio.load();
      this.audioCache.set(url, audio);
    });
  }

  private play(url: string, volume: number = 0.4) {
    try {
      const audio = this.audioCache.get(url) || new Audio(url);
      // Create a fresh clone for overlapping sounds
      const playInstance = audio.cloneNode() as HTMLAudioElement;
      playInstance.volume = volume;
      playInstance.play().catch(e => console.debug('Audio play blocked until user interaction'));
    } catch (e) {
      console.error('Sound play error:', e);
    }
  }

  playTap() { this.play(SOUNDS.TAP, 0.3); }
  playSuccess() { this.play(SOUNDS.SUCCESS, 0.4); }
  playAction() { this.play(SOUNDS.ACTION, 0.3); }
  playError() { this.play(SOUNDS.ERROR, 0.4); }
  playWhoosh() { this.play(SOUNDS.WHOOSH, 0.2); }
}

export const sounds = new SoundService();
