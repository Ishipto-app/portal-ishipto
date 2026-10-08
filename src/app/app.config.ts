import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

// Import danh sách các tuyến đường (routes) của ứng dụng
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Kích hoạt định tuyến (Routing) cho các trang Login, Dashboard...
    provideRouter(routes), 
    
    // 2. Kích hoạt HttpClient để gọi API từ Backend Node.js
    provideHttpClient()
    
    // Lưu ý: Chúng ta đã loại bỏ hoàn toàn provideAnimations() và provideAnimationsAsync()
    // theo đúng chuẩn mới của Angular để tránh lỗi deprecated.
  ]
};