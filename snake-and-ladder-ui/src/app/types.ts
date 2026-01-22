export type EventType = 'SNAKE' | 'LADDER' | 'NORMAL';

export interface Player {
  id: number;
  name: string;
  position: number;
  color: string;   // css color
}

export interface Move {
  playerId: number;
  dice: number;
  from: number;
  to: number;
  event: EventType;
}

export interface GameState {
  players: Player[];
  started: boolean;
  currentTurnIndex: number;
  diceValue: number | null;
  isRolling: boolean;
  winnerPlayerId: number | null;
  moves: Move[];
}
