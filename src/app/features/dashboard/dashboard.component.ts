import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'In Transit' | 'Delivered' | 'Pending';
  statusLabel: string;
  date: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private router = inject(Router);

  // Lấy currentUser từ AuthService qua Signal
  readonly currentUser = this.authService.currentUser;
  readonly isLoading = this.authService.isLoading;
  readonly totalBookingsCount = this.bookingService.totalBookings;

  // Signal quản lý trạng thái hiển thị sidebar trên mobile
  readonly isSidebarOpen = signal<boolean>(false);

  // Tab đang chọn trong Dashboard
  readonly currentTab = signal<'overview' | 'shipments' | 'analytics' | 'settings'>('overview');

  // Computed: Thông tin hiển thị của user
  readonly userEmail = computed(() => this.currentUser()?.email || 'Người dùng');
  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    return user?.displayName || user?.email?.split('@')[0] || 'Quản trị viên';
  });
  readonly userPhotoUrl = computed(() => {
    return this.currentUser()?.photoURL || null;
  });
  readonly userInitial = computed(() => {
    const name = this.userDisplayName();
    return name.charAt(0).toUpperCase();
  });

  // Số liệu tóm tắt cho giao diện Modern Minimalist
  readonly metrics: MetricCard[] = [
    {
      title: 'Tổng số vận đơn',
      value: '1,428',
      change: '+12.5%',
      isPositive: true,
      icon: 'truck'
    },
    {
      title: 'Đang vận chuyển',
      value: '382',
      change: '+4.2%',
      isPositive: true,
      icon: 'navigation'
    },
    {
      title: 'Giao hàng thành công',
      value: '1,012',
      change: '+98.4%',
      isPositive: true,
      icon: 'check-circle'
    },
    {
      title: 'Đơn chờ xử lý',
      value: '34',
      change: '-2.1%',
      isPositive: false,
      icon: 'clock'
    }
  ];

  // Danh sách vận đơn mô phỏng
  readonly recentShipments: Shipment[] = [
    {
      id: 'SH-8941',
      trackingNumber: 'IST-VN-984210',
      origin: 'Hà Nội (Kho Nội Bài)',
      destination: 'Đà Nẵng (Kho Hòa Cầm)',
      status: 'In Transit',
      statusLabel: 'Đang giao hàng',
      date: 'Hôm nay, 14:30'
    },
    {
      id: 'SH-8940',
      trackingNumber: 'IST-VN-984209',
      origin: 'TP. Hồ Chí Minh (Kho Cát Lái)',
      destination: 'Hải Phòng (Kho Đình Vũ)',
      status: 'Delivered',
      statusLabel: 'Đã hoàn thành',
      date: 'Hôm nay, 11:15'
    },
    {
      id: 'SH-8939',
      trackingNumber: 'IST-VN-984208',
      origin: 'Bình Dương (Kho VSIP 1)',
      destination: 'Cần Thơ (Kho Trà Nóc)',
      status: 'In Transit',
      statusLabel: 'Đang giao hàng',
      date: 'Hôm qua, 18:20'
    },
    {
      id: 'SH-8938',
      trackingNumber: 'IST-VN-984207',
      origin: 'Bắc Ninh (Kho Quế Võ)',
      destination: 'TP. Hồ Chí Minh (Kho Tân Bình)',
      status: 'Pending',
      statusLabel: 'Chờ điều xe',
      date: 'Hôm qua, 09:40'
    }
  ];

  /**
   * Đóng/mở sidebar trên mobile
   */
  toggleSidebar(): void {
    this.isSidebarOpen.update(val => !val);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  /**
   * Đổi tab hiển thị
   */
  setTab(tab: 'overview' | 'shipments' | 'analytics' | 'settings'): void {
    this.currentTab.set(tab);
    this.closeSidebar();
  }

  /**
   * Chuyển hướng tới màn hình Quản lý Booking
   */
  goToBooking(): void {
    this.closeSidebar();
    this.router.navigate(['/booking']);
  }

  /**
   * Chuyển hướng tới màn hình Tổng quan Booking
   */
  goToOverview(): void {
    this.closeSidebar();
    this.router.navigate(['/overview']);
  }

  /**
   * Xử lý Đăng xuất
   */
  async handleLogout(): Promise<void> {
    await this.authService.logout();
  }
}
