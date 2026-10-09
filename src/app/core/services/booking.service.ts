import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  totalBookings = 0
  private http = inject(HttpClient);

  // Endpoint Backend Express đọc từ Firebase Firestore
  //private readonly apiUrl = 'https://synthesis-boxer-jarring.vngrok-free.dev/sel/firebase/all';
  private readonly apiUrl = 'https://ishipto-node10.appspot.com/sel/firebase/all';
  // Angular 21 Signals quản lý dữ liệu và trạng thái tải
  readonly bookings = signal<Booking[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Header đặc thù cho ngrok free tier để bỏ qua trang HTML cảnh báo
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json'
    });
  }

  /**
   * Gọi GET lấy toàn bộ danh sách Booking từ Backend
   */
  getAllBookings(): Observable<Booking[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<Booking[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap((data) => {
        this.bookings.set(data);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        const errorMsg = err?.message || 'Không thể kết nối đến máy chủ ngrok.';
        this.error.set(errorMsg);
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Lấy chi tiết một booking theo ID từ Signal bộ nhớ
   */
  getBookingById(id: string): Booking | undefined {
    return this.bookings().find(b => b.id === id);
  }

  /**
   * Tạo mới Booking (Cập nhật tức thời Signal)
   */
  createBooking(newBooking: Booking): Observable<Booking> {
    this.bookings.update(current => [newBooking, ...current]);
    return of(newBooking);
  }

  /**
   * Cập nhật thông tin Booking
   */
  updateBooking(id: string, updatedData: Partial<Booking>): Observable<Booking> {
    let result: Booking | null = null;
    this.bookings.update(current => 
      current.map(b => {
        if (b.id === id) {
          result = { ...b, ...updatedData };
          return result;
        }
        return b;
      })
    );
    return of(result!);
  }

  /**
   * Xóa một Booking khỏi danh sách
   */
  deleteBooking(id: string): Observable<boolean> {
    this.bookings.update(current => current.filter(b => b.id !== id));
    return of(true);
  }
}
