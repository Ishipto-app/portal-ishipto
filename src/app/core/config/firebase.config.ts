import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { environment } from '../../../environments/environment';

/**
 * Khởi tạo Firebase App theo Modular SDK v10+
 * Đảm bảo singleton instance không bị khởi tạo lại nhiều lần
 */
const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();

/**
 * Khởi tạo Firebase Authentication Service
 */
export const auth: Auth = getAuth(app);

// Cấu hình duy trì phiên đăng nhập cục bộ trên trình duyệt (Local Persistence)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Firebase persistence warning:', error);
});

export default app;
