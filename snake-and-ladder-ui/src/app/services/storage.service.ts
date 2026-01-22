import { Injectable } from '@angular/core';
import { GameState } from '../types';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly key = 'snake_ladder_state_v1';

  save(state: GameState) {
    localStorage.setItem(this.key, JSON.stringify(state));
  }

  load(): GameState | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as GameState;
    } catch {
      return null;
    }
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}
