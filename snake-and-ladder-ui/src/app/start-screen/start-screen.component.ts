import { Component, EventEmitter, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-start-screen',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './start-screen.component.html',
  styleUrl: './start-screen.component.css'
})
export class StartScreenComponent {

  @Output() start = new EventEmitter<{ names: string[] }>();

  playerCount = 2;
  names: string[] = ['Abdul', 'Opponent'];

  setCount(count: number) {
    this.playerCount = count;
    this.names = Array.from({ length: count }, (_, i) => this.names[i] ?? `Player ${i + 1}`);
  }

  startGame() {
    const cleaned = this.names.map((n, i) => (n?.trim() ? n.trim() : `Player ${i + 1}`));
    this.start.emit({ names: cleaned });
  }
}
