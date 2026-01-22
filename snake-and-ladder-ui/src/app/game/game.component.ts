import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BoardComponent } from '../board/board.component';
import { DiceComponent } from '../dice/dice.component';
import { GameService } from '../services/game.service';
import { GameState } from '../types';
import { StartScreenComponent } from '../start-screen/start-screen.component';


@Component({
  selector: 'app-game',
  imports: [NgIf, NgFor, BoardComponent, DiceComponent, StartScreenComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  state!: GameState;

  constructor(private game: GameService) {}

  ngOnInit(): void {
    this.state = this.game.loadOrCreate();
  }

  get currentPlayer() {
    return this.state.players[this.state.currentTurnIndex];
  }

  async roll() {
    this.state = await this.game.rollDice(this.state);
  }

  restart() {
    this.state = this.game.reset();
  }

  get winner() {
    if (!this.state.winnerPlayerId) return null;
    return this.state.players.find(p => p.id === this.state.winnerPlayerId) ?? null;
  }

  getMovePlayerName(playerId: number) {
    return this.state.players.find(p => p.id === playerId)?.name ?? 'Player';
  }
  startGame(ev: { names: string[] }) {
    this.state = this.game.startNew(ev.names);
  }

}
