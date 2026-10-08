import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Cần thiết để transform dữ liệu

export interface Booking {
  id: string;
  bookingNo: string;
  customer: string;
  portOfLoading: string;
  portOfDischarge: string;
  date: string;
}

export interface Shipment {
  id: string;
  shipmentNo: string;
  bookingRef: string;
  customer: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  //private apiUrl = 'http://localhost:8080/sel/firebase/all';
  private apiUrl = 'https://ishipto-node10.appspot.com/sel/firebase/all';

  public showBookingFrame$ = new BehaviorSubject<boolean>(true);
  public showShipmentFrame$ = new BehaviorSubject<boolean>(true);

  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  public bookings$ = this.bookingsSubject.asObservable();

  private shipmentsSubject = new BehaviorSubject<Shipment[]>([]);
  public shipments$ = this.shipmentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchBookings() {
    this.http.get<any[]>(this.apiUrl).pipe(
      map(rawArray => {
        // Biến đổi cấu trúc phức tạp từ Firebase thành Interface Booking đơn giản
        return rawArray.map(item => ({
          id: item.id || Math.random().toString(),
          // Trích xuất số Booking từ book.code hoặc bookConfirm.book_number
          bookingNo: item.book?.code || item.bookConfirm?.book_number || 'N/A',
          // Lấy tên khách hàng viết tắt hoặc tên đầy đủ
          customer: item.book?.customer?.short_name || item.book?.customer?.full_name || 'Khách lẻ',
          // Lấy cảng đi
          portOfLoading: item.book?.pol?.name || item.voyage?.load_port_name || 'N/A',
          // Lấy cảng đến
          portOfDischarge: item.book?.pod?.name || item.voyage?.discharge_port_name || 'N/A',
          date: item.book?.from_date || ''
        }));
      })
    ).subscribe({
      next: (mappedData) => {
        // Đổ dữ liệu đã xử lý vào Khung Trên
        this.bookingsSubject.next(mappedData);
      },
      error: (err) => {
        console.error('Không thể kết nối Backend API. Vui lòng kiểm tra lại server nodejs.');
      }
    });
    
    // Tạm lấy 15 ví dụ cho Shipment hiển thị ở Khung Dưới
    this.shipmentsSubject.next(this.getMockShipments(15));
  }

  moveToShipment(booking: Booking) {
    const currentBookings = this.bookingsSubject.value;
    this.bookingsSubject.next(currentBookings.filter(b => b.id !== booking.id));

    const currentShipments = this.shipmentsSubject.value;
    const newShipment: Shipment = {
      id: Math.random().toString(36).substring(2, 9),
      shipmentNo: 'SHP-' + booking.bookingNo.substring(0, 8), // Rút gọn mã Shipment
      bookingRef: booking.bookingNo,
      customer: booking.customer,
      status: 'In Transit'
    };
    this.shipmentsSubject.next([newShipment, ...currentShipments]);
  }

  toggleBookingFrame() {
    this.showBookingFrame$.next(!this.showBookingFrame$.value);
  }

  toggleShipmentFrame() {
    this.showShipmentFrame$.next(!this.showShipmentFrame$.value);
  }

  private getMockShipments(count: number): Shipment[] {
    const shipments: Shipment[] = [];
    for (let i = 1; i <= count; i++) {
      shipments.push({
        id: `s${i}`,
        shipmentNo: `SHP-OLD-${1000 + i}`,
        bookingRef: `BK0${900 + i}`,
        customer: i % 2 === 0 ? 'NIPPON_HN' : 'LOGWIN_HCM',
        status: 'Delivered'
      });
    }
    return shipments;
  }
}