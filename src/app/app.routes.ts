import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    title: 'Đăng nhập - Hệ thống Quản trị',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    title: 'Đăng ký tài khoản - Hệ thống Quản trị',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    title: 'Khôi phục mật khẩu - Hệ thống Quản trị',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        m => m.ForgotPasswordComponent
      )
  },
  {
    path: 'dashboard',
    title: 'Bảng điều khiển - Hệ thống Quản trị',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'overview',
    title: 'Tổng quan Vận tải & Booking - Hệ thống Quản trị',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/overview/overview.component').then(m => m.OverviewComponent)
  },
  {
    path: 'booking',
    title: 'Quản lý Booking - Hệ thống Quản trị',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/booking/booking-list/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'booking/new',
    title: 'Tạo mới Booking - Hệ thống Quản trị',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/booking/booking-form/booking-form.component').then(m => m.BookingFormComponent)
  },
  {
    path: 'booking/edit/:id',
    title: 'Chỉnh sửa Booking - Hệ thống Quản trị',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/booking/booking-form/booking-form.component').then(m => m.BookingFormComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
