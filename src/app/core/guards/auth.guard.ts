import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase.config';
import { AuthService } from '../services/auth.service';

/**
 * Functional Route Guard: AuthGuard
 * Bảo vệ các tuyến đường yêu cầu xác thực (như /dashboard).
 * Kiểm tra trạng thái đăng nhập Firebase qua onAuthStateChanged.
 * Nếu chưa đăng nhập, điều hướng về /login.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Nếu AuthService đã lưu trữ currentUser, cho phép truy cập ngay
  if (authService.currentUser()) {
    return true;
  }

  // Chờ Firebase Auth giải quyết trạng thái đăng nhập phiên làm việc ban đầu
  const user = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        unsubscribe();
        resolve(currentUser);
      },
      () => {
        unsubscribe();
        resolve(null);
      }
    );
  });

  if (user) {
    // Cập nhật lại signal trong AuthService nếu chưa có
    authService.currentUser.set(user);
    return true;
  }

  // Chưa đăng nhập: Lưu URL dự kiến và điều hướng về trang đăng nhập
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
