import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Player } from '../types';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-board',
  imports: [NgFor, NgIf],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
  @Input() players: Player[] = [];

  constructor(public gameService: GameService) {}

  get boardCells(): number[] {
    // serpentine board (bottom row 1..10, then 20..11, etc)
    const rows: number[][] = [];
    for (let r = 0; r < 10; r++) {
      const start = r * 10 + 1;
      const row = Array.from({ length: 10 }, (_, i) => start + i);
      if (r % 2 === 1) row.reverse();
      rows.push(row);
    }
    // display 100 at top-left style -> reverse rows
    return rows.reverse().flat();
  }

  playersOn(cell: number) {
    return this.players.filter(p => p.position === cell);
  }
}
