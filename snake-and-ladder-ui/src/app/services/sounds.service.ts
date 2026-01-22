import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  enabled = true;

  private dice = new Audio('/assets/sounds/dice.mp3');
  private move = new Audio('/assets/sounds/move.mp3');
  private snake = new Audio('/assets/sounds/snake.mp3');
  private ladder = new Audio('/assets/sounds/ladder.mp3');
  private win = new Audio('/assets/sounds/win.mp3');

  constructor() {
    // optional: reduce volume
    this.dice.volume = 0.9;
    this.move.volume = 0.35;
    this.snake.volume = 0.8;
    this.ladder.volume = 0.8;
    this.win.volume = 0.9;
  }

  setEnabled(v: boolean) {
    this.enabled = v;
  }

  private play(audio: HTMLAudioElement) {
    if (!this.enabled) return;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {
      // ignore browser autoplay restrictions
    }
  }

  playDice() { this.play(this.dice); }
  playMove() { this.play(this.move); }
  playSnake() { this.play(this.snake); }
  playLadder() { this.play(this.ladder); }
  playWin() { this.play(this.win); }
}
