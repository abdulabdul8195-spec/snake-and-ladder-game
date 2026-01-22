import { Component, Input  } from '@angular/core';

@Component({
  selector: 'app-dice',
  imports: [],
  templateUrl: './dice.component.html',
  styleUrl: './dice.component.css'
})
export class DiceComponent {
  @Input() value: number | null = null;
  @Input() rolling = false;

  get dots(): number[] {
    const v = this.value ?? 1;
    return Array.from({ length: v }, (_, i) => i);
  }
}
