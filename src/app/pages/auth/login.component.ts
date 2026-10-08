import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Các module của Angular Material cần thiết cho form đăng nhập
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field'; // Đã bổ sung Module này
import { FormsModule } from '@angular/forms'; // Bổ sung để hỗ trợ nhập liệu

@Component({
  selector: 'app-login',
  standalone: true,
  // Đừng quên khai báo các Module vào mảng imports ở đây
  imports: [
    CommonModule, 
    MatCardModule, 
    MatInputModule, 
    MatButtonModule, 
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-title>Đăng nhập SEL System</mat-card-title>
        
        <mat-card-content>
          <!-- Trường nhập Email -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" placeholder="Nhập email của bạn">
          </mat-form-field>
          
          <!-- Trường nhập Mật khẩu -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mật khẩu</mat-label>
            <input matInput type="password" placeholder="Nhập mật khẩu">
          </mat-form-field>
          
          <div class="auth-links">
            <a (click)="goToForgot()">Quên mật khẩu?</a>
          </div>

          <button mat-raised-button color="primary" class="full-width" (click)="login()">Đăng Nhập</button>
          
          <div class="register-hint">
            <span>Chưa có tài khoản? <a (click)="goToRegister()">Đăng ký ngay</a></span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { 
      height: 100vh; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      background-color: #f0f2f5; 
    }
    .auth-card { 
      width: 400px; 
      padding: 20px; 
    }
    .full-width { 
      width: 100%; 
      margin-top: 10px; 
    }
    .auth-links { 
      display: flex; 
      justify-content: flex-end; 
      margin-bottom: 20px; 
      font-size: 14px; 
      cursor: pointer; 
      color: #1976d2;
    }
    .register-hint {
      margin-top: 15px; 
      text-align: center;
      font-size: 14px;
    }
    .register-hint a {
      color: #1976d2;
      cursor: pointer;
      font-weight: bold;
    }
  `]
})
export class LoginComponent {
  constructor(private router: Router) {}

  login() {
    // Điều hướng sang trang Dashboard khi bấm Đăng Nhập
    this.router.navigate(['/dashboard']);
  }

  goToForgot() { 
    this.router.navigate(['/forgot-password']); 
  }
  
  goToRegister() { 
    this.router.navigate(['/register']); 
  }
}