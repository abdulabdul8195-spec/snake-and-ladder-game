import { Injectable } from '@angular/core';
import { GameState, Move } from '../types';
import { StorageService } from './storage.service';

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
  constructor(private storage: StorageService) {}

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

    // start rolling animation values
    const cloned = this.clone(state);
    cloned.isRolling = true;
    this.storage.save(cloned);

    // fake rolling animation (10 frames)
    for (let i = 0; i < 10; i++) {
      await this.sleep(60);
      cloned.diceValue = 1 + Math.floor(Math.random() * 6);
      this.storage.save(cloned);
    }

    // final dice
    const dice = 1 + Math.floor(Math.random() * 6);
    cloned.diceValue = dice;

    // move current player
    const player = cloned.players[cloned.currentTurnIndex];
    const from = player.position;

    let to = from + dice;
    if (to > 100) {
      // rule: must land exactly on 100 (so no movement)
      to = from;
    }

    let event: Move['event'] = 'NORMAL';

    if (SNAKES_LADDERS[to]) {
      const jumpTo = SNAKES_LADDERS[to];
      event = jumpTo > to ? 'LADDER' : 'SNAKE';
      to = jumpTo;
    }

// step-by-step movement
    const stepTarget = from + dice > 100 ? from : from + dice;

    for (let pos = from + 1; pos <= stepTarget; pos++) {
      await this.sleep(140);
      player.position = pos;
      // save while moving so UI animates
      this.storage.save(cloned);
    }

    const move: Move = {
      playerId: player.id,
      dice,
      from,
      to,
      event,
    };

    // push history (keep last 8)
    cloned.moves = [move, ...cloned.moves].slice(0, 8);

    // winner
    if (to === 100) {
      cloned.winnerPlayerId = player.id;
    } else {
      // change turn
      cloned.currentTurnIndex = (cloned.currentTurnIndex + 1) % cloned.players.length;
    }

    cloned.isRolling = false;
    this.storage.save(cloned);
    return cloned;
  }

  // Helper
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
