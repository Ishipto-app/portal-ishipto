import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FclDoorToDoorComponent } from './fcl-door-to-door.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FclDoorToDoorComponent],
  template: `
    <main class="w-full min-h-screen bg-slate-950 text-slate-100 font-sans">
      <app-fcl-door-to-door></app-fcl-door-to-door>
    </main>
  `
})
export class AppComponent {
  title = 'FCL Door-to-Door Logistics Customer Portal';
}
