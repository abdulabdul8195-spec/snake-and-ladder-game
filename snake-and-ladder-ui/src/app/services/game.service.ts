import { Injectable } from '@angular/core';
import { GameState, Move } from '../types';
import { StorageService } from './storage.service';
import { SoundService} from './sounds.service';

const SNAKES_LADDERS: Record<number, number> = {
  // Ladders
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,

  // Snakes
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 36,
  93: 73,
  95: 75,
  99: 78,
};

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(
    private storage: StorageService,
    private sound: SoundService
  ) {}

  createNewGame(names: string[] = ['Abdul', 'Opponent']): GameState {
    const colors = ['#00f5ff', '#ff3df2', '#33ff88', '#ffaa33'];

    const state: GameState = {
      started: true,
      players: names.map((n, i) => ({
        id: i + 1,
        name: n,
        position: 0,
        color: colors[i % colors.length],
      })),
      currentTurnIndex: 0,
      diceValue: null,
      isRolling: false,
      winnerPlayerId: null,
      moves: [],
    };

    this.storage.save(state);
    return state;
  }

  loadOrCreate(): GameState {
    const saved = this.storage.load();
    if (saved) return saved;

    return {
      started: false,
      players: [],
      currentTurnIndex: 0,
      diceValue: null,
      isRolling: false,
      winnerPlayerId: null,
      moves: [],
    };
  }

  startNew(names: string[]): GameState {
    this.storage.clear();
    return this.createNewGame(names);
  }

  reset(): GameState {
    this.storage.clear();
    return this.createNewGame();
  }

  async rollDice(state: GameState): Promise<GameState> {
    if (state.isRolling) return state;
    if (state.winnerPlayerId) return state;

    const cloned = this.clone(state);
    cloned.isRolling = true;
    this.storage.save(cloned);

    // ✅ dice sound once at start
    this.sound.playDice();

    // Dice rolling animation frames
    for (let i = 0; i < 10; i++) {
      await this.sleep(60);
      cloned.diceValue = 1 + Math.floor(Math.random() * 6);
      this.storage.save(cloned);
    }

    // Final dice value
    const dice = 1 + Math.floor(Math.random() * 6);
    cloned.diceValue = dice;

    // Current player
    const player = cloned.players[cloned.currentTurnIndex];
    const from = player.position;

    // 1) calculate step target (exact 100 rule)
    let stepTarget = from + dice;
    if (stepTarget > 100) {
      stepTarget = from; // no movement
    }

    // 2) step-by-step movement animation + move sound
    for (let pos = from + 1; pos <= stepTarget; pos++) {
      await this.sleep(140);
      player.position = pos;

      // ✅ move step sound
      this.sound.playMove();

      this.storage.save(cloned);
    }

    // 3) snake / ladder jump animation + sound
    let finalPos = player.position;
    let event: Move['event'] = 'NORMAL';

    if (SNAKES_LADDERS[finalPos]) {
      const jumpTo = SNAKES_LADDERS[finalPos];
      event = jumpTo > finalPos ? 'LADDER' : 'SNAKE';

      // ✅ snake/ladder sound
      if (event === 'SNAKE') this.sound.playSnake();
      else this.sound.playLadder();

      await this.sleep(250);
      player.position = jumpTo;

      finalPos = jumpTo;
      this.storage.save(cloned);
    }

    // Move history
    const move: Move = {
      playerId: player.id,
      dice,
      from,
      to: finalPos,
      event,
    };

    cloned.moves = [move, ...cloned.moves].slice(0, 8);

    // Winner check
    if (finalPos === 100) {
      cloned.winnerPlayerId = player.id;

      // ✅ win sound
      this.sound.playWin();
    } else {
      cloned.currentTurnIndex =
        (cloned.currentTurnIndex + 1) % cloned.players.length;
    }

    cloned.isRolling = false;
    this.storage.save(cloned);

    return cloned;
  }

  // Helpers
  private clone(state: GameState): GameState {
    return JSON.parse(JSON.stringify(state)) as GameState;
  }

  private sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  isSnakeOrLadderStart(cell: number): 'SNAKE' | 'LADDER' | null {
    if (!SNAKES_LADDERS[cell]) return null;
    return SNAKES_LADDERS[cell] > cell ? 'LADDER' : 'SNAKE';
  }

  getJump(cell: number): number | null {
    return SNAKES_LADDERS[cell] ?? null;
  }
}
