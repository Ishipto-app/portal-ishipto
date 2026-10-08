import { Routes } from '@angular/router';

// Import các Component mà chúng ta đã tạo
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  // 1. Chuyển hướng mặc định: Nếu URL rỗng (người dùng vừa vào web), đẩy họ sang trang login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // 2. Định nghĩa các đường dẫn cụ thể
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  
  // 3. Đường dẫn vào hệ thống quản lý chính
  { path: 'dashboard', component: DashboardComponent },

  // 4. Bắt lỗi (Wildcard Route): Nếu người dùng gõ URL bậy bạ, đẩy họ về lại login
  { path: '**', redirectTo: '/login' }
];