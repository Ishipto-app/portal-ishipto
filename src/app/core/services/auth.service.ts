import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  deleteUser,
  onAuthStateChanged,
  UserCredential,
  getAdditionalUserInfo
} from 'firebase/auth';
import { auth } from '../config/firebase.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  // Angular Signal quản lý trạng thái người dùng hiện tại
  readonly currentUser = signal<User | null>(null);

  // Signal quản lý trạng thái đang tải (Loading indicator)
  readonly isLoading = signal<boolean>(false);

  // Signal thông báo trạng thái kiểm tra phiên đăng nhập ban đầu
  readonly isAuthInitialized = signal<boolean>(false);

  // Computed Signal kiểm tra trạng thái đăng nhập
  readonly isAuthenticated = computed(() => !!this.currentUser());

  // Provider cho xác thực Google
  private googleProvider = new GoogleAuthProvider();

  constructor() {
    this.initAuthStateListener();
  }

  /**
   * Lắng nghe thay đổi trạng thái xác thực từ Firebase (Session Listener)
   */
  private initAuthStateListener(): void {
    onAuthStateChanged(auth, (user: User | null) => {
      this.currentUser.set(user);
      this.isAuthInitialized.set(true);
      this.isLoading.set(false);
    });
  }

  /**
   * Đăng nhập bằng Email & Mật khẩu
   * @param email Địa chỉ email
   * @param password Mật khẩu
   */
  async login(email: string, password: string): Promise<UserCredential> {
    this.isLoading.set(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      this.currentUser.set(userCredential.user);
      return userCredential;
    } catch (error: any) {
      throw this.normalizeFirebaseError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Đăng ký tài khoản mới bằng Email & Mật khẩu
   * @param email Địa chỉ email
   * @param password Mật khẩu
   */
  async register(email: string, password: string): Promise<UserCredential> {
    this.isLoading.set(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      this.currentUser.set(userCredential.user);
      return userCredential;
    } catch (error: any) {
      throw this.normalizeFirebaseError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Đăng nhập bằng Google và kiểm tra trạng thái người dùng mới / chưa đăng ký
   * @returns object chứa userCredential và cờ isNewUser
   */
  async loginWithGoogle(): Promise<{ userCredential: UserCredential; isNewUser: boolean }> {
    this.isLoading.set(true);
    try {
      this.googleProvider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, this.googleProvider);
      
      // Kiểm tra xem đây có phải tài khoản lần đầu đăng nhập (chưa đăng ký trước đó)
      const additionalInfo = getAdditionalUserInfo(userCredential);
      const isNewUser = !!additionalInfo?.isNewUser;

      if (!isNewUser) {
        this.currentUser.set(userCredential.user);
      }

      return { userCredential, isNewUser };
    } catch (error: any) {
      throw this.normalizeFirebaseError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Đăng ký tài khoản mới bằng Google (dùng tại trang /register)
   * Cho phép ghi nhận tài khoản chính thức vào Firebase
   */
  async registerWithGoogle(): Promise<UserCredential> {
    this.isLoading.set(true);
    try {
      this.googleProvider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, this.googleProvider);
      this.currentUser.set(userCredential.user);
      return userCredential;
    } catch (error: any) {
      throw this.normalizeFirebaseError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Xóa tài khoản người dùng vừa tạm sinh ra khỏi Firebase Auth khi phát hiện chưa đăng ký,
   * ngăn chặn tuyệt đối việc Firebase tự động lưu lại tài khoản chưa qua đăng ký.
   */
  async deleteUnregisteredUser(user: User): Promise<void> {
    try {
      await deleteUser(user);
      this.currentUser.set(null);
    } catch (error) {
      console.warn('Silent delete unregistered user error, fallback to signout:', error);
      await this.logoutSilently();
    }
  }

  /**
   * Đăng xuất âm thầm không điều hướng (dùng khi hủy phiên người dùng chưa đăng ký)
   */
  async logoutSilently(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser.set(null);
    } catch (error) {
      console.warn('Silent signout error:', error);
    }
  }

  /**
   * Gửi email khôi phục mật khẩu (Password Reset)
   * @param email Địa chỉ email cần nhận link đặt lại mật khẩu
   */
  async forgotPassword(email: string): Promise<void> {
    this.isLoading.set(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: any) {
      throw this.normalizeFirebaseError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Đăng xuất tài khoản và điều hướng về trang /login
   */
  async logout(): Promise<void> {
    this.isLoading.set(true);
    try {
      await signOut(auth);
      this.currentUser.set(null);
      await this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Chuyển đổi mã lỗi Firebase sang thông điệp tiếng Việt thân thiện
   */
  private normalizeFirebaseError(error: any): Error {
    const code = error?.code || '';
    let message = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        message = 'Email hoặc mật khẩu không chính xác.';
        break;
      case 'auth/email-already-in-use':
        message = 'Email này đã được sử dụng bởi một tài khoản khác.';
        break;
      case 'auth/weak-password':
        message = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu tối thiểu 6 ký tự.';
        break;
      case 'auth/invalid-email':
        message = 'Địa chỉ email không đúng định dạng.';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Cửa sổ đăng nhập Google đã bị đóng.';
        break;
      case 'auth/too-many-requests':
        message = 'Quá nhiều lần thử thất bại. Vui lòng chờ vài phút và thử lại.';
        break;
      default:
        message = error?.message || message;
    }

    return new Error(message);
  }
}
