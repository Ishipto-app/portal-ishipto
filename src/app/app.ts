import { Component } from '@angular/core';
// Cần import RouterModule để sử dụng được thẻ router-outlet
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  // Thẻ <router-outlet> chính là nơi các màn hình (Login, Dashboard...) sẽ được hiển thị
  template: `
    <main class="app-main-container">
      <router-outlet></router-outlet> 
    </main>
  `,
  styles: [`
    /* Reset CSS cơ bản để ứng dụng phủ kín màn hình */
    :host {
      display: block;
      min-height: 100vh;
      width: 100vw;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
  `]
})
export class AppComponent {
  title = 'sel-system';
}