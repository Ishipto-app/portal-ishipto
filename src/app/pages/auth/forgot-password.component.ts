import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <div style="height: 100vh; display: flex; justify-content: center; align-items: center;">
      <mat-card style="padding: 30px; text-align: center;">
        <h2>Xin lại Mật khẩu (Đang phát triển)</h2>
        <button mat-stroked-button color="primary" (click)="goBack()">Quay lại Đăng nhập</button>
      </mat-card>
    </div>
  `
})
export class ForgotPasswordComponent {
  constructor(private router: Router) {}
  goBack() { this.router.navigate(['/login']); }
}