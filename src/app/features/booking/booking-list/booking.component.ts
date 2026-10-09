
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service'; // Đảm bảo đường dẫn tới BookingService đúng với project

declare var html2pdf: any;
@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './booking.component.html',
})
export class BookingComponent implements OnInit {
  // Inject Services
  private bookingService = inject(BookingService);
  private router = inject(Router);
  // Signals trạng thái kết nối từ Service
  bookings = this.bookingService.bookings;
  isLoading = this.bookingService.isLoading;
  error = this.bookingService.error;

  // Signals cho bộ lọc từng cột
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

  // Trạng thái Giao diện & Modal khác
  showBookingFrame = true;
  showShipmentFrame = true;
  activeModal: string | null = null;

  // Dữ liệu mock phục vụ Shipment và các modal khác
  shipments: any[] = [];
  debtList: any[] = [];
  vesselSchedules: any[] = [];
  selectedShipment: any = null;
  bookingFormData: any = {};
  ticketData: any = {};
  isEditingBL = false;

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

  get filteredShipments() {
    return this.shipments;
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
    // const id = this.selectedDeleteId();
    // if (id) {
    //   this.bookingService.deleteBooking(id).subscribe(() => {
    //     this.deleteModalOpen.set(false);
    //     this.selectedDeleteId.set(null);
    //   });
    // }
  }

  navigateToCreate(): void {
    this.router.navigate(['/bookings/new']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/bookings', id, 'edit']);
  }

  toggleFrame(frame: string) {
    if (frame === 'booking') this.showBookingFrame = !this.showBookingFrame;
    if (frame === 'shipment') this.showShipmentFrame = !this.showShipmentFrame;
  }


  closeModal() {
    this.activeModal = null;
    this.selectedShipment = null;
    this.isEditingBL = false;
  }

  // Trạng thái hệ thống & Xác thực
  isAuthenticated = true;
  authTab: 'login' | 'register' | 'forgot' = 'login';
  currentUser = { company: 'Công Ty TNHH Xuất Nhập Khẩu Toàn Cầu', email: 'customer@sel.com.vn' };
  
  loginData = { email: 'customer@sel.com.vn', password: '' };
  regData: any = {};
  resetEmail = '';


  // Cấu hình Timeline
  timelineSteps = [
    { step: 1, title: 'Door Pickup (Kho Đi)' },
    { step: 2, title: 'Hạ Bãi Cảng POL' },
    { step: 3, title: 'Thông Quan & Lên Tàu' },
    { step: 4, title: 'Vận Chuyển Chặng Biển' },
    { step: 5, title: 'Thông Quan Cảng POD' },
    { step: 6, title: 'Giao Door (Kho Nhận)' }
  ];

  // Bộ lọc
  filters = { searchCode: '', customer: '', port: '', fromDate: null, toDate: null };

  ngOnInit() {
    this.generateMockData();
    this.loadData();
  }

  // --- HÀM XỬ LÝ AUTH ---
  login() {
    if (this.loginData.email) {
      this.isAuthenticated = true;
      this.currentUser.company = this.loginData.email.split('@')[0].toUpperCase() + ' LOGISTICS CORP';
    }
  }

  logout() { this.isAuthenticated = false; }
  
  register() {
    alert('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
    this.authTab = 'login';
  }
  
  resetPassword() {
    alert('Yêu cầu khôi phục mật khẩu đã được gửi tới email của bạn.');
    this.authTab = 'login';
  }


  applyGlobalFilter(item: any): boolean {
    const s = this.filters.searchCode.toLowerCase();
    const c = this.filters.customer.toLowerCase();
    const p = this.filters.port;

    const codeMatch = !s || (item.bookingCode?.toLowerCase().includes(s) || item.shipmentCode?.toLowerCase().includes(s));
    const customerMatch = !c || item.customerName?.toLowerCase().includes(c);
    const portMatch = !p || (item.pol === p || item.pod === p);

    return codeMatch && customerMatch && portMatch;
  }


  // --- NGHIỆP VỤ ---
  convertToShipment(booking: any) {
    const newShipmentCode = 'SEL-SH2026-' + Math.floor(1000 + Math.random() * 9000);
    const newShipment = {
      id: 'SH-' + Date.now(),
      shipmentCode: newShipmentCode,
      bookingCode: booking.bookingCode,
      customerName: booking.customerName,
      containerNo: 'SELU' + Math.floor(1000000 + Math.random() * 9000000),
      sealNo: 'SL-' + Math.floor(10000 + Math.random() * 90000),
      vgmWeight: 22000,
      containerType: booking.containerType,
      vesselName: 'SEL EXPRESS V.2026',
      voyageNo: '001E',
      pol: booking.pol,
      pod: booking.pod,
      etd: booking.etd,
      pickupRange: booking.pickupRange,
      pickupTruckNo: '51C-999.99',
      pickupDriverName: 'Nguyễn Văn Mới',
      pickupDriverPhone: '0909123456',
      deliveryTruckNo: '60R-777.77',
      deliveryDriverName: 'Trần Văn Đích',
      deliveryDriverPhone: '0918999888',
      stepProgress: 1,
      statusText: 'Door Pickup (Kho Đi)',
      pushNotificationEnabled: true,
      rating: 5,
      financials: {
        oceanFreight: booking.estimatedTotal || 1200,
        thcCharge: 200,
        truckingFee: 300,
        totalAmount: (booking.estimatedTotal || 1200) + 200 + (300 * 1.08)
      },
      blInfo: {
        shipper: booking.customerName + '\nViệt Nam',
        consignee: 'FOREIGN IMPORTER CO.\nTarget Destination',
        notifyParty: 'SAME AS CONSIGNEE',
        goodsDescription: 'GENERAL CARGO FCL SHIPMENT'
      }
    };

    this.shipments.unshift(newShipment);
    alert(`Đã chuyển thành công Đơn hàng ${booking.bookingCode} sang Chuyến Shipment: ${newShipmentCode}`);
  }


  openCreateBookingModal() {
    this.bookingFormData = {
      customerName: this.currentUser.company,
      pol: 'Cát Lái (VN)', pod: 'Singapore (SG)',
      pickupRange: '08:00 - 12:00', containerType: '40HC',
      quantity: 1, estimatedTotal: 1500
    };
    this.activeModal = 'bookingForm';
  }

  editBooking(item: any) {
    this.bookingFormData = { ...item };
    this.activeModal = 'bookingForm';
  }

  saveBooking() {
    // if (this.bookingFormData.id) {
    //   const idx = this.bookings.findIndex(b => b.id === this.bookingFormData.id);
    //   if (idx > -1) this.bookings[idx] = { ...this.bookingFormData };
    // } else {
    //   this.bookingFormData.id = 'BK-' + Date.now();
    //   this.bookingFormData.bookingCode = 'SEL-BK2026-' + Math.floor(1000 + Math.random() * 9000);
    //   this.bookingFormData.etd = new Date(2026, 9, 20);
    //   this.bookings.unshift({ ...this.bookingFormData });
    // }
    this.closeModal();
  }

  deleteBooking(id: string) {
    if (confirm('Bạn có chắc chắn muốn xóa đơn Booking này?')) {
      //this.bookings = this.bookings.filter(b => b.id !== id);
    }
  }

  openShipmentDetail(shipment: any) {
    this.selectedShipment = { ...shipment };
    this.activeModal = 'shipmentDetail';
  }

  openFiataBillModal(shipment: any) {
    this.selectedShipment = { ...shipment };
    this.isEditingBL = false;
    this.activeModal = 'fiataBill';
  }

  deleteBL(shipment: any) {
    if (confirm('Bạn có chắc muốn xóa Vận đơn FIATA này không?')) {
      alert('Đã xóa thông tin vận đơn B/L khỏi Shipment ' + shipment.shipmentCode);
      this.closeModal();
    }
  }

  printFIATABill() {
    const element = document.getElementById('fiata-bill-document');
    const opt = {
      margin: 0.2,
      filename: `FIATA_BL_${this.selectedShipment.shipmentCode}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }

  downloadVATInvoice(shipment: any) {
    alert('Hệ thống đang xuất Hóa đơn VAT Điện tử (PDF) cho shipment: ' + shipment.shipmentCode);
  }

  openVesselScheduleModal() { this.activeModal = 'vesselSchedule'; }
  openDebtModal() { this.activeModal = 'debtModal'; }

  bookFromSchedule(schedule: any) {
    this.bookingFormData = {
      customerName: this.currentUser.company,
      pol: schedule.pol, pod: schedule.pod,
      pickupRange: '08:00 - 12:00', containerType: '40HC',
      quantity: 1, estimatedTotal: 1800
    };
    this.activeModal = 'bookingForm';
  }

  openTicketModal(shipment: any) {
    this.ticketData = { shipmentCode: shipment.shipmentCode, subject: 'Trễ giờ xe kéo lấy container', content: '' };
    this.activeModal = 'ticketModal';
  }

  submitTicket() {
    alert(`Ticket khiếu nại gấp đã được chuyển tới Bộ phận Vận hành SEL. Mã phản hồi: #TK-${Math.floor(1000 + Math.random() * 9000)}`);
    this.closeModal();
  }

  private generateMockData() {
    const portsPOL = ['Cát Lái (VN)', 'Hải Phòng (VN)'];
    const portsPOD = ['Singapore (SG)', 'Shanghai (CN)', 'Los Angeles (US)'];
    const customers = ['Tập đoàn Dệt May Hòa Phát', 'Nông Sản Việt Nam Corp', 'Gỗ Mỹ Nghệ Á Châu', 'XNK Thủy Sản An Giang', 'Điện Tử Samsung Logistics'];

    for (let i = 1; i <= 15; i++) {
      const stepProgress = (i % 6) + 1;
      const totalAmount = (1500 + (i * 50)) + 200 + (350 * 1.08);
      const shipCode = 'SEL-SH2026-' + (5000 + i);

      this.shipments.push({
        id: 'SH-' + (200 + i),
        shipmentCode: shipCode,
        bookingCode: 'SEL-BK2026-' + (900 + i),
        customerName: customers[i % customers.length],
        containerNo: 'SELU' + (8000000 + i * 123),
        sealNo: 'SL-' + (90000 + i),
        vgmWeight: 21500 + (i * 150),
        containerType: (i % 2 === 0) ? '40HC' : '20DC',
        vesselName: 'MAERSK LEADER V.' + (10 + i),
        voyageNo: '2026N',
        pol: portsPOL[i % 2],
        pod: portsPOD[i % 3],
        etd: new Date(2026, 9, 1 + i),
        pickupRange: '08:00 - 12:00',
        pickupTruckNo: '51C-' + (12300 + i),
        pickupDriverName: 'Nguyễn Văn ' + String.fromCharCode(65 + i),
        pickupDriverPhone: '0908' + (100000 + i * 333),
        deliveryTruckNo: '60R-' + (88000 + i),
        deliveryDriverName: 'Trần Đình ' + String.fromCharCode(70 + i),
        deliveryDriverPhone: '0912' + (200000 + i * 444),
        stepProgress: stepProgress,
        statusText: this.timelineSteps[stepProgress - 1].title,
        pushNotificationEnabled: true,
        rating: (i % 5) + 1,
        financials: { oceanFreight: 1500 + (i * 50), thcCharge: 200, truckingFee: 350, totalAmount: totalAmount },
        blInfo: {
          shipper: customers[i % customers.length] + '\nĐịa chỉ: KCN Tân Bình, TP.HCM, VN',
          consignee: 'GLOBAL FREIGHT IMPORT INC.\nCA 90001, LOS ANGELES, USA',
          notifyParty: 'SAME AS CONSIGNEE',
          goodsDescription: 'GARMENTS AND TEXTILE PRODUCTS\nSAIL FREIGHT CONTAINER DOOR-TO-DOOR'
        }
      });

      this.debtList.push({
        shipmentCode: shipCode,
        customerName: customers[i % customers.length],
        dueDate: new Date(2026, 8, 20 + i),
        amount: totalAmount,
        overdueDays: i > 8 ? (i - 5) * 2 : 0
      });
    }

    this.vesselSchedules = [
      { vesselName: 'SITC SHANGHAI', voyageNo: '2609S', pol: 'Cát Lái (VN)', pod: 'Shanghai (CN)', etd: new Date(2026, 9, 12), openSlots: 14 },
      { vesselName: 'ONE APEX', voyageNo: '012E', pol: 'Hải Phòng (VN)', pod: 'Los Angeles (US)', etd: new Date(2026, 9, 15), openSlots: 8 },
      { vesselName: 'EVERGREEN STAR', voyageNo: '104W', pol: 'Cát Lái (VN)', pod: 'Singapore (SG)', etd: new Date(2026, 9, 18), openSlots: 22 }
    ];
  }
}