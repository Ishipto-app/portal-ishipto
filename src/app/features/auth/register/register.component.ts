import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Custom Validator kiểm tra mật khẩu và xác nhận mật khẩu khớp nhau
 */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: []
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly isLoading = this.authService.isLoading;
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);

  registerForm: FormGroup = this.fb.group(
    {
      email: [this.route.snapshot.queryParams['email'] || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      agreeTerms: [true, [Validators.requiredTrue]]
    },
    { validators: passwordMatchValidator }
  );

  get emailControl() {
    return this.registerForm.get('email');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword');
  }

  get agreeTermsControl() {
    return this.registerForm.get('agreeTerms');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(prev => !prev);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(prev => !prev);
  }

  /**
   * Xử lý Đăng ký tài khoản
   */
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const { email, password } = this.registerForm.value;

    try {
      await this.authService.register(email, password);
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Đăng ký không thành công.');
    }
  }

  /**
   * Đăng ký tài khoản mới bằng Google (lưu thông tin vào Firebase)
   */
  async onGoogleRegister(): Promise<void> {
    this.errorMessage.set(null);
    try {
      await this.authService.registerWithGoogle();
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Đăng ký bằng Google thất bại.');
    }
  }

  /**
   * Alias phương thức đăng ký qua Google
   */
  async onGoogleLogin(): Promise<void> {
    return this.onGoogleRegister();
  }
}
