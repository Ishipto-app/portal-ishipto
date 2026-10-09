import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './booking-form.component.html'
})
export class BookingFormComponent implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  // Signals trạng thái kết nối từ Service
  bookings = this.bookingService.bookings;
  isLoading = this.bookingService.isLoading;
  error = this.bookingService.error;

  // Signals cho bộ lọc trên từng cột
  filterCode = signal<string>('');
  filterStatus = signal<string>('ALL');
  filterPol = signal<string>('ALL');
  filterPod = signal<string>('ALL');
  filterCustomer = signal<string>('');
  filterVessel = signal<string>('');
  filterCommodity = signal<string>('');

  // Sắp xếp
  sortField = signal<'code' | 'date' | 'customer' | 'status'>('date');
  sortAsc = signal<boolean>(false);

  // Phân trang
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

  // Modal Xóa
  deleteModalOpen = signal<boolean>(false);
  selectedDeleteId = signal<string | null>(null);
  isMobileFilterOpen = signal<boolean>(false);

  // Tự động trích xuất danh sách duy nhất Cảng đi (POL) và Cảng đến (POD) cho dropdown
  polList = computed(() => {
    const set = new Set<string>();
    this.bookings().forEach(b => {
      if (b.shipment?.pol?.name) set.add(b.shipment.pol.name);
    });
    return Array.from(set).sort();
  });

  podList = computed(() => {
    const set = new Set<string>();
    this.bookings().forEach(b => {
      if (b.shipment?.pod?.name) set.add(b.shipment.pod.name);
    });
    return Array.from(set).sort();
  });

  // Computed: Lọc đồng thời theo tất cả các cột
  filteredBookings = computed(() => {
    const code = this.filterCode().toLowerCase();
    const status = this.filterStatus();
    const pol = this.filterPol();
    const pod = this.filterPod();
    const customer = this.filterCustomer().toLowerCase();
    const vessel = this.filterVessel().toLowerCase();
    const commodity = this.filterCommodity().toLowerCase();

    return this.bookings().filter(b => {
      const matchCode = !code || (b.shipment?.code || '').toLowerCase().includes(code);
      const matchStatus = status === 'ALL' || b.status === status;
      const matchPol = pol === 'ALL' || b.shipment?.pol?.name === pol;
      const matchPod = pod === 'ALL' || b.shipment?.pod?.name === pod;
      
      const custStr = ((b.shipment?.customer?.full_name || '') + ' ' + (b.shipment?.customer?.short_name || '')).toLowerCase();
      const matchCustomer = !customer || custStr.includes(customer);

      const vesselStr = ((b.route?.voyage_0?.vessel_name || '') + ' ' + (b.route?.voyage_0?.voyage_name || '')).toLowerCase();
      const matchVessel = !vessel || vesselStr.includes(vessel);

      const commStr = (b.volume?.volume_0?.commodity?.name || b.document?.book_commodity || '').toLowerCase();
      const matchCommodity = !commodity || commStr.includes(commodity);

      return matchCode && matchStatus && matchPol && matchPod && matchCustomer && matchVessel && matchCommodity;
    }).sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (this.sortField() === 'code') {
        valA = a.shipment?.code || '';
        valB = b.shipment?.code || '';
      } else if (this.sortField() === 'date') {
        valA = a.route?.voyage_0?.depart_time || 0;
        valB = b.route?.voyage_0?.depart_time || 0;
      } else if (this.sortField() === 'customer') {
        valA = a.shipment?.customer?.short_name || '';
        valB = b.shipment?.customer?.short_name || '';
      } else if (this.sortField() === 'status') {
        valA = a.status || '';
        valB = b.status || '';
      }

      if (valA < valB) return this.sortAsc() ? -1 : 1;
      if (valA > valB) return this.sortAsc() ? 1 : -1;
      return 0;
    });
  });

  totalPages = computed(() => Math.ceil(this.filteredBookings().length / this.itemsPerPage()) || 1);

  paginatedBookings = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredBookings().slice(start, start + this.itemsPerPage());
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.bookingService.getAllBookings().subscribe({
      error: (err) => console.error('Lỗi khi nạp booking từ API:', err)
    });
  }

  onSort(field: 'code' | 'date' | 'customer' | 'status'): void {
    if (this.sortField() === field) {
      this.sortAsc.update(v => !v);
    } else {
      this.sortField.set(field);
      this.sortAsc.set(true);
    }
  }

  resetFilters(): void {
    this.filterCode.set('');
    this.filterStatus.set('ALL');
    this.filterPol.set('ALL');
    this.filterPod.set('ALL');
    this.filterCustomer.set('');
    this.filterVessel.set('');
    this.filterCommodity.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  confirmDelete(id: string): void {
    this.selectedDeleteId.set(id);
    this.deleteModalOpen.set(true);
  }

  executeDelete(): void {
    const id = this.selectedDeleteId();
    if (id) {
      this.bookingService.deleteBooking(id).subscribe(() => {
        this.deleteModalOpen.set(false);
        this.selectedDeleteId.set(null);
      });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/bookings/new']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/bookings', id, 'edit']);
  }
}
