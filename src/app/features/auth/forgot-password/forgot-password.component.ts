import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: []
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  readonly isLoading = this.authService.isLoading;
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get emailControl() {
    return this.forgotForm.get('email');
  }

  /**
   * Xử lý gửi email khôi phục mật khẩu
   */
  async onSubmit(): Promise<void> {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    const { email } = this.forgotForm.value;

    try {
      await this.authService.forgotPassword(email);
      this.successMessage.set(
        `Liên kết đặt lại mật khẩu đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam).`
      );
      this.forgotForm.reset();
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại.');
    }
  }
}
