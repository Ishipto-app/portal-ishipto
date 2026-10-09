import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Angular Signals quản lý trạng thái phản ứng (Reactive States)
  readonly isLoading = this.authService.isLoading;
  readonly currentUser = this.authService.currentUser;
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal<boolean>(false);

  // Signals cho quy tắc xác thực tài khoản Google chưa đăng ký
  readonly showUnregisteredModal = signal<boolean>(false);
  readonly unregisteredGoogleEmail = signal<string>('');
  readonly unregisteredGoogleName = signal<string>('');

  // Form đăng nhập Reactive Forms
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(prev => !prev);
  }

  /**
   * Đăng nhập bằng Email/Mật khẩu qua Firebase Modular SDK v10+
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email, password);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Đăng nhập không thành công.');
    }
  }

  /**
   * Đăng nhập bằng Google kèm kiểm tra quy tắc tài khoản đã đăng ký
   */
  async onGoogleLogin(): Promise<void> {
    this.errorMessage.set(null);

    try {
      const { userCredential, isNewUser } = await this.authService.loginWithGoogle();

      // KIỂM TRA QUY TẮC: Nếu tài khoản Google là người dùng mới chưa đăng ký trong hệ thống
      if (isNewUser) {
        const pendingEmail = userCredential.user.email || '';
        const pendingName = userCredential.user.displayName || '';

        // 1. Chặn đăng nhập: XÓA NGAY LẬP TỨC tài khoản tạm khỏi Firebase Auth
        // Đảm bảo tuyệt đối không lưu lại bản ghi người dùng chưa đăng ký vào cơ sở dữ liệu Firebase
        await this.authService.deleteUnregisteredUser(userCredential.user);

        // 2. Kích hoạt Signal hiển thị cảnh báo và hộp thoại xác nhận chuyển hướng
        this.unregisteredGoogleEmail.set(pendingEmail);
        this.unregisteredGoogleName.set(pendingName);
        this.showUnregisteredModal.set(true);
        return;
      }

      // Tài khoản đã đăng ký trước đó: Cho phép chuyển hướng tới Dashboard
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Đăng nhập bằng Google thất bại.');
    }
  }

  /**
   * Người dùng xác nhận chuyển hướng sang trang đăng ký
   */
  confirmRedirectToRegister(): void {
    const email = this.unregisteredGoogleEmail();
    this.showUnregisteredModal.set(false);
    
    // Tự động điều hướng đến trang đăng ký kèm tham số email đã lấy từ Google
    this.router.navigate(['/register'], {
      queryParams: email ? { email } : {}
    });
  }

  /**
   * Người dùng hủy bỏ việc chuyển hướng
   */
  cancelRedirectToRegister(): void {
    this.showUnregisteredModal.set(false);
    this.errorMessage.set(
      `Đăng nhập bị từ chối: Tài khoản Google (${this.unregisteredGoogleEmail()}) chưa được đăng ký trong hệ thống.`
    );
  }
}
