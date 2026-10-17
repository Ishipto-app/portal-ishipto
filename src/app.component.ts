import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * =======================================================================
 * FCL DOOR-TO-DOOR CUSTOMER PORTAL (ANGULAR 21 STANDALONE COMPONENT)
 * Chuyên tuyến nội địa: Hải Phòng (Đình Vũ/Tân Vũ) ↔ TP.HCM (Cát Lái/VICT)
 * 100% Angular Signals, OnPush, Control Flow mới (@if, @for, @empty)
 * Tích hợp API: /readFileToJson/data, /sel/voyage/all, /readFileToJson/voyage
 * =======================================================================
 */

export interface MasterVessel {
  id: number | string;
  name: string;
  operator?: string;
  [key: string]: any;
}

export interface MasterSupplier {
  id: number | string;
  name: string;
  code?: string;
  [key: string]: any;
}

export interface MasterUser {
  id: number | string;
  name: string;
  [key: string]: any;
}

export interface MasterSeaport {
  id: number | string;
  name: string;
  code?: string;
  [key: string]: any;
}

export interface MasterTerminal {
  id: number | string;
  name: string;
  seaport_id?: number | string;
  [key: string]: any;
}

export interface ApiVoyageItem {
  id?: string | number;
  full_name?: string;
  supplier_id: number | string | null;
  supplier_name: string;
  vessel_id: number | string | null;
  vessel_name: string;
  voyage_name: string;
  load_port_id?: number | string | null;
  load_port?: number | string | null;
  load_port_name: string;
  load_terminal_id?: number | string | null;
  load_terminal?: number | string | null;
  load_terminal_name: string;
  depart_time: string;
  closing_time: string;
  discharge_port_id?: number | string | null;
  discharge_port?: number | string | null;
  discharge_port_name: string;
  discharge_terminal_id?: number | string | null;
  discharge_terminal?: number | string | null;
  discharge_terminal_name: string;
  arrive_time: string;
  update_by_id: number | string;
  update_by_name: string;
  status?: 'OPEN' | 'CLOSING_SOON' | 'CLOSED';
}

export interface VesselSchedule {
  id: string;
  carrier: string;
  vesselName: string;
  voyage: string;
  originPort: string;
  destPort: string;
  etd: string;
  eta: string;
  cutoff: string;
  transitTime: string;
  status: 'OPEN' | 'CLOSING_SOON' | 'CLOSED';
  baseOceanFreight20: number;
  baseOceanFreight40: number;
}

export interface ContainerItem {
  id: string;
  type: '20GP' | '40GP' | '40HC' | '20RF' | '45HC';
  quantity: number;
}

export interface BookingRecord {
  id: string;
  bookingNo: string;
  createdAt: string;
  vesselName: string;
  voyage: string;
  originPort: string;
  destPort: string;
  pickupAddress: string;
  deliveryAddress: string;
  commodity: string;
  cargoWeightTon: number;
  containers: ContainerItem[];
  totalCost: number;
  status: 'CONFIRMED' | 'EQUIPMENT_RELEASED' | 'GATE_IN' | 'COMPLETED';
  depotPickup: string;
  depotDropoff: string;
}

export interface ShipmentRecord {
  id: string;
  shipmentNo: string;
  bookingNo: string;
  containerNo: string;
  sealNo: string;
  containerType: string;
  driverName: string;
  driverPhone: string;
  tractorPlate: string;
  trailerPlate: string;
  pickupAddress: string;
  deliveryAddress: string;
  vesselName: string;
  etaDelivery: string;
  currentLeg: 1 | 2 | 3; // 1: Kéo cont Hải Phòng, 2: Hải trình tàu biển, 3: Kéo giao HCM
  progressPercent: number;
  statusDescription: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  bookingNo: string;
  serviceDescription: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID';
  paymentDate?: string;
}

export interface ToastMessage {
  id: number;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      <!-- TOAST NOTIFICATION CONTAINER (Tự động biến mất sau 4.5s) -->
      <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        @for (toast of toasts(); track toast.id) {
          <div 
            class="pointer-events-auto p-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-start gap-3 transition-all duration-300"
            [class.bg-emerald-950]="toast.type === 'success'"
            [class.border-emerald-600]="toast.type === 'success'"
            [class.text-emerald-200]="toast.type === 'success'"
            [class.bg-cyan-950]="toast.type === 'info'"
            [class.border-cyan-600]="toast.type === 'info'"
            [class.text-cyan-200]="toast.type === 'info'"
            [class.bg-rose-950]="toast.type === 'error'"
            [class.border-rose-600]="toast.type === 'error'"
            [class.text-rose-200]="toast.type === 'error'"
          >
            <div class="mt-0.5 text-lg">
              @if (toast.type === 'success') { <span>✓</span> }
              @if (toast.type === 'info') { <span>ℹ</span> }
              @if (toast.type === 'error') { <span>✕</span> }
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-sm tracking-wide text-white">{{ toast.title }}</h4>
              <p class="text-xs opacity-90 mt-0.5 leading-relaxed">{{ toast.message }}</p>
            </div>
            <button (click)="removeToast(toast.id)" class="text-xs opacity-60 hover:opacity-100 px-1 py-0.5">✕</button>
          </div>
        }
      </div>

      <!-- DEVICE SWITCHER TOOLBAR (PC, Tablet, Smartphone) -->
      <header class="bg-slate-950/80 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur sticky top-0 z-40">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span class="font-bold tracking-wider text-slate-200 uppercase">Khung nhìn mô phỏng:</span>
        </div>
        
        <div class="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-1 gap-1">
          <button 
            (click)="setDevice('pc')"
            [class.bg-cyan-500]="activeDevice() === 'pc'"
            [class.text-slate-950]="activeDevice() === 'pc'"
            [class.font-bold]="activeDevice() === 'pc'"
            [class.text-slate-400]="activeDevice() !== 'pc'"
            class="px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all hover:text-white"
          >
            <span>🖥️</span> <span>PC / Laptop</span>
          </button>
          <button 
            (click)="setDevice('tablet')"
            [class.bg-cyan-500]="activeDevice() === 'tablet'"
            [class.text-slate-950]="activeDevice() === 'tablet'"
            [class.font-bold]="activeDevice() === 'tablet'"
            [class.text-slate-400]="activeDevice() !== 'tablet'"
            class="px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all hover:text-white"
          >
            <span>📱</span> <span>Tablet</span>
          </button>
          <button 
            (click)="setDevice('phone')"
            [class.bg-cyan-500]="activeDevice() === 'phone'"
            [class.text-slate-950]="activeDevice() === 'phone'"
            [class.font-bold]="activeDevice() === 'phone'"
            [class.text-slate-400]="activeDevice() !== 'phone'"
            class="px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all hover:text-white"
          >
            <span>📲</span> <span>Smartphone</span>
          </button>
        </div>

        <div class="flex items-center gap-3">
          @if (isLoggedIn()) {
            <span class="bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] px-2.5 py-1 rounded-full font-medium">
              Chế độ VIP T+30: Active
            </span>
            <button 
              (click)="logout()" 
              class="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition"
            >
              <span>🚪</span> Đăng xuất
            </button>
          } @else {
            <span class="text-amber-400 font-medium flex items-center gap-1">
              <span>🔒</span> Chưa đăng nhập (Yêu cầu xác thực)
            </span>
          }
        </div>
      </header>

      <!-- SIMULATION WRAPPER -->
      <main class="flex-1 flex justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        <div 
          class="w-full transition-all duration-300"
          [class.max-w-7xl]="activeDevice() === 'pc'"
          [class.max-w-3xl]="activeDevice() === 'tablet'"
          [class.max-w-md]="activeDevice() === 'phone'"
          [class.sm:rounded-[40px]]="activeDevice() === 'phone'"
          [class.border-4]="activeDevice() === 'phone'"
          [class.border-slate-700]="activeDevice() === 'phone'"
          [class.shadow-2xl]="activeDevice() === 'phone'"
          [class.overflow-hidden]="activeDevice() === 'phone'"
        >
          <!-- PHONE SIMULATION STATUS BAR -->
          @if (activeDevice() === 'phone') {
            <div class="bg-slate-950 text-[11px] px-5 py-2 flex items-center justify-between text-slate-400 border-b border-slate-800 select-none">
              <span class="font-semibold text-white">09:41</span>
              <div class="w-16 h-4 bg-slate-900 rounded-full mx-auto"></div>
              <div class="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>●●●</span>
                <span>100%</span>
              </div>
            </div>
          }

          <!-- CONTAINER CHÍNH -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur flex flex-col min-h-[640px]">
            
            <!-- ============================================== -->
            <!-- 📌 AUTHENTICATION (XÁC THỰC NGƯỜI DÙNG) -->
            <!-- Người dùng chưa đăng nhập CHỈ NHÌN THẤY FORM NÀY -->
            <!-- ============================================== -->
            @if (!isLoggedIn()) {
              <div class="max-w-md mx-auto my-auto w-full py-6">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-900/40 mb-3 text-3xl">
                    🚢
                  </div>
                  <h2 class="text-2xl font-black text-white tracking-tight uppercase">FCL Door-to-Door Portal</h2>
                  <p class="text-xs text-slate-400 mt-1">Cổng Dịch Vụ Khách Hàng Hải Phòng ↔ TP.HCM</p>
                </div>

                <!-- Tabs: Đăng nhập / Đăng ký / Quên MK -->
                <div class="flex border-b border-slate-700 mb-4 text-xs font-semibold">
                  <button 
                    (click)="authTab.set('LOGIN')"
                    [class.border-cyan-400]="authTab() === 'LOGIN'"
                    [class.text-cyan-400]="authTab() === 'LOGIN'"
                    [class.text-slate-400]="authTab() !== 'LOGIN'"
                    class="flex-1 py-2.5 border-b-2 transition"
                  >
                    Đăng Nhập
                  </button>
                  <button 
                    (click)="authTab.set('REGISTER')"
                    [class.border-cyan-400]="authTab() === 'REGISTER'"
                    [class.text-cyan-400]="authTab() === 'REGISTER'"
                    [class.text-slate-400]="authTab() !== 'REGISTER'"
                    class="flex-1 py-2.5 border-b-2 transition"
                  >
                    Đăng Ký Doanh Nghiệp
                  </button>
                  <button 
                    (click)="authTab.set('FORGOT')"
                    [class.border-cyan-400]="authTab() === 'FORGOT'"
                    [class.text-cyan-400]="authTab() === 'FORGOT'"
                    [class.text-slate-400]="authTab() !== 'FORGOT'"
                    class="flex-1 py-2.5 border-b-2 transition"
                  >
                    Quên Mật Khẩu
                  </button>
                </div>

                <div class="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
                  <!-- TAB 1: ĐĂNG NHẬP -->
                  @if (authTab() === 'LOGIN') {
                    <div>
                      <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Email Doanh Nghiệp (Firebase Auth)
                      </label>
                      <input 
                        type="email" 
                        [value]="loginEmail()"
                        (input)="loginEmail.set($any($event.target).value)"
                        placeholder="acc@dnlogis.vn" 
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Mật khẩu</label>
                      <input 
                        type="password" 
                        [value]="loginPassword()"
                        (input)="loginPassword.set($any($event.target).value)"
                        placeholder="••••••••" 
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div class="pt-2 flex flex-col gap-2.5">
                      <button 
                        (click)="login()"
                        class="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-[0.98] text-sm flex items-center justify-center gap-2"
                      >
                        <span>🔑</span> Đăng Nhập Khách Hàng Doanh Nghiệp
                      </button>
                      <button 
                        type="button"
                        (click)="enterDemoMode()"
                        class="w-full bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-cyan-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                      >
                        <span>🚢</span> Vào Thẳng Bước 1 (Xem Bảng & Modal Quản Lý Lịch Tàu)
                      </button>
                    </div>
                    <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                      💡 Nhập tài khoản và mật khẩu đã được cấp để truy cập hệ thống hoặc bấm nút trên để vào thẳng Bước 1 Lịch tàu.
                    </div>
                  }

                  <!-- TAB 2: ĐĂNG KÝ -->
                  @if (authTab() === 'REGISTER') {
                    <div class="space-y-3 text-xs">
                      <div>
                        <label class="block text-slate-300 mb-1 font-semibold">Tên Doanh Nghiệp (Công ty):</label>
                        <input 
                          type="text" 
                          placeholder="Công ty TNHH Vận Tải & Thương Mại ABC" 
                          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label class="block text-slate-300 mb-1 font-semibold">Mã Số Thuế (MST):</label>
                        <input 
                          type="text" 
                          placeholder="0102938475" 
                          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label class="block text-slate-300 mb-1 font-semibold">Email Công Ty:</label>
                        <input 
                          type="email" 
                          placeholder="logistics@abc.com.vn" 
                          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <button 
                        (click)="registerAccount()"
                        class="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs"
                      >
                        Tạo Tài Khoản & Xin Hạn Mức T+30
                      </button>
                    </div>
                  }

                  <!-- TAB 3: QUÊN MẬT KHẨU -->
                  @if (authTab() === 'FORGOT') {
                    <div class="space-y-3 text-xs">
                      <p class="text-slate-400">Nhập email đăng ký để nhận mã OTP đặt lại mật khẩu qua hệ thống Firebase Authentication.</p>
                      <input 
                        type="email" 
                        placeholder="acc@dnlogis.vn" 
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                      <button 
                        (click)="resetPassword()"
                        class="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl transition text-xs"
                      >
                        Gửi Mã Khôi Phục
                      </button>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <!-- ============================================== -->
              <!-- GIAO DIỆN CHÍNH KHI ĐÃ ĐĂNG NHẬP THÀNH CÔNG -->
              <!-- ============================================== -->
              
              <!-- PORTAL HEADER -->
              <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 bg-cyan-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
                    ⚓
                  </div>
                  <div>
                    <h1 class="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
                      FCL Door-to-Door Logistics
                      <span class="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded-full font-bold">NỘI ĐỊA VIỆT NAM</span>
                    </h1>
                    <p class="text-xs text-slate-400 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>{{ customerName() }}</span>
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3 text-xs">
                  <div class="hidden sm:flex flex-col text-right">
                    <span class="text-slate-400 text-[11px]">Hạn mức tín dụng khả dụng</span>
                    <span class="font-mono font-bold text-emerald-400 text-sm">{{ formatVND(availableCredit()) }}</span>
                  </div>
                  <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:border-cyan-500 transition relative">
                    <span>🔔</span>
                    <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                  </div>
                </div>
              </div>

              <!-- 4-STEP SEQUENTIAL NAVIGATION -->
              <nav class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                <button 
                  (click)="setActiveStep(1)"
                  [class.bg-cyan-500]="activeStep() === 1"
                  [class.text-slate-950]="activeStep() === 1"
                  [class.shadow-lg]="activeStep() === 1"
                  [class.shadow-cyan-500/20]="activeStep() === 1"
                  [class.bg-slate-800/80]="activeStep() !== 1"
                  [class.text-slate-300]="activeStep() !== 1"
                  class="p-3 rounded-xl border border-slate-700/60 text-left transition flex items-center gap-3 group"
                >
                  <div 
                    class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                    [class.bg-slate-950]="activeStep() === 1"
                    [class.text-cyan-400]="activeStep() === 1"
                    [class.bg-slate-700]="activeStep() !== 1"
                    [class.text-slate-300]="activeStep() !== 1"
                  >
                    1
                  </div>
                  <div class="truncate">
                    <div class="text-[10px] uppercase font-semibold opacity-75">Bước 1</div>
                    <div class="font-bold text-xs">Lịch Tàu & Đặt Chỗ</div>
                  </div>
                </button>

                <button 
                  (click)="setActiveStep(2)"
                  [class.bg-cyan-500]="activeStep() === 2"
                  [class.text-slate-950]="activeStep() === 2"
                  [class.shadow-lg]="activeStep() === 2"
                  [class.shadow-cyan-500/20]="activeStep() === 2"
                  [class.bg-slate-800/80]="activeStep() !== 2"
                  [class.text-slate-300]="activeStep() !== 2"
                  class="p-3 rounded-xl border border-slate-700/60 text-left transition flex items-center gap-3"
                >
                  <div 
                    class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                    [class.bg-slate-950]="activeStep() === 2"
                    [class.text-cyan-400]="activeStep() === 2"
                    [class.bg-slate-700]="activeStep() !== 2"
                    [class.text-slate-300]="activeStep() !== 2"
                  >
                    2
                  </div>
                  <div class="truncate">
                    <div class="text-[10px] uppercase font-semibold opacity-75">Bước 2</div>
                    <div class="font-bold text-xs">Quản Lý Booking</div>
                  </div>
                </button>

                <button 
                  (click)="setActiveStep(3)"
                  [class.bg-cyan-500]="activeStep() === 3"
                  [class.text-slate-950]="activeStep() === 3"
                  [class.shadow-lg]="activeStep() === 3"
                  [class.shadow-cyan-500/20]="activeStep() === 3"
                  [class.bg-slate-800/80]="activeStep() !== 3"
                  [class.text-slate-300]="activeStep() !== 3"
                  class="p-3 rounded-xl border border-slate-700/60 text-left transition flex items-center gap-3"
                >
                  <div 
                    class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                    [class.bg-slate-950]="activeStep() === 3"
                    [class.text-cyan-400]="activeStep() === 3"
                    [class.bg-slate-700]="activeStep() !== 3"
                    [class.text-slate-300]="activeStep() !== 3"
                  >
                    3
                  </div>
                  <div class="truncate">
                    <div class="text-[10px] uppercase font-semibold opacity-75">Bước 3</div>
                    <div class="font-bold text-xs">Shipment (3 Chặng)</div>
                  </div>
                </button>

                <button 
                  (click)="setActiveStep(4)"
                  [class.bg-cyan-500]="activeStep() === 4"
                  [class.text-slate-950]="activeStep() === 4"
                  [class.shadow-lg]="activeStep() === 4"
                  [class.shadow-cyan-500/20]="activeStep() === 4"
                  [class.bg-slate-800/80]="activeStep() !== 4"
                  [class.text-slate-300]="activeStep() !== 4"
                  class="p-3 rounded-xl border border-slate-700/60 text-left transition flex items-center gap-3"
                >
                  <div 
                    class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                    [class.bg-slate-950]="activeStep() === 4"
                    [class.text-cyan-400]="activeStep() === 4"
                    [class.bg-slate-700]="activeStep() !== 4"
                    [class.text-slate-300]="activeStep() !== 4"
                  >
                    4
                  </div>
                  <div class="truncate">
                    <div class="text-[10px] uppercase font-semibold opacity-75">Bước 4</div>
                    <div class="font-bold text-xs">Công Nợ & Hóa Đơn</div>
                  </div>
                </button>
              </nav>

              <!-- ============================================== -->
              <!-- MODUL 1: LỊCH TÀU & TẠO BOOKING TỨC THÌ -->
              <!-- ============================================== -->
              @if (activeStep() === 1) {
                <!-- CHẾ ĐỘ XEM 1A: DANH SÁCH LỊCH TÀU & QUẢN LÝ VOYAGE -->
                @if (!selectedVesselForBooking()) {
                  <div class="space-y-4">
                    <!-- Top bar: Tiêu đề, Tìm kiếm, Chế độ xem, Đồng bộ API & Thêm Voyage -->
                    <div class="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xl text-cyan-400 shadow-inner">
                          🚢
                        </div>
                        <div>
                          <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            Quản Lý Lịch Tàu & Chuyến (Voyages)
                            <span class="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                              {{ filteredVoyages().length }} Chuyến
                            </span>
                          </h3>
                          <p class="text-xs text-slate-400">
                            Kết nối API ngrok & Danh mục Hải Phòng ↔ TP.HCM (Trang {{ paginationInfo().page }}/{{ paginationInfo().totalPages }})
                          </p>
                        </div>
                      </div>

                      <div class="flex flex-wrap items-center gap-2">
                        <!-- Ô tìm kiếm nhanh -->
                        <div class="relative">
                          <input 
                            type="text" 
                            [value]="voyageSearchQuery()"
                            (input)="voyageSearchQuery.set($any($event.target).value); voyageCurrentPage.set(1)"
                            placeholder="Tìm tàu, số chuyến, cảng..."
                            class="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
                          />
                          @if (voyageSearchQuery()) {
                            <button 
                              type="button" 
                              (click)="voyageSearchQuery.set(''); voyageCurrentPage.set(1)" 
                              class="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
                              title="Xóa tìm kiếm"
                            >
                              ✕
                            </button>
                          }
                        </div>

                        <!-- Chuyển đổi hiển thị Bảng / Thẻ Smartphone -->
                        <div class="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
                          <button 
                            type="button"
                            (click)="setVoyageViewMode('table')"
                            [class.bg-cyan-500]="voyageViewMode() === 'table'"
                            [class.text-slate-950]="voyageViewMode() === 'table'"
                            [class.font-bold]="voyageViewMode() === 'table'"
                            [class.text-slate-400]="voyageViewMode() !== 'table'"
                            class="px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                            title="Chế độ xem dạng bảng"
                          >
                            <span>📊</span>
                            <span class="text-[11px]">Bảng</span>
                          </button>
                          <button 
                            type="button"
                            (click)="setVoyageViewMode('card')"
                            [class.bg-cyan-500]="voyageViewMode() === 'card'"
                            [class.text-slate-950]="voyageViewMode() === 'card'"
                            [class.font-bold]="voyageViewMode() === 'card'"
                            [class.text-slate-400]="voyageViewMode() !== 'card'"
                            class="px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                            title="Chế độ xem dạng thẻ (Smartphone)"
                          >
                            <span>🗂️</span>
                            <span class="text-[11px]">Thẻ</span>
                          </button>
                        </div>

                        <!-- Nút Đồng bộ API -->
                        <button 
                          type="button"
                          (click)="refreshData()"
                          [disabled]="isLoadingVoyages()"
                          class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                          title="Tải lại từ API"
                        >
                          <span [class.animate-spin]="isLoadingVoyages()">🔄</span>
                          <span class="hidden md:inline">Đồng bộ</span>
                        </button>

                        <!-- Nút Thêm Voyage -->
                        <button 
                          type="button"
                          (click)="openCreateVoyageModal()"
                          class="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                        >
                          <span>➕</span>
                          <span>Thêm Voyage</span>
                        </button>
                      </div>
                    </div>

                    <!-- ============================================== -->
                    <!-- 2. BỘ LỌC NÂNG CAO: POL, POD (AUTOCOMPLETE), >=ETD, <=ETA (PICKDATE) -->
                    <!-- ============================================== -->
                    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg space-y-3">
                      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div class="flex items-center gap-2 text-xs font-bold text-slate-300">
                          <span class="text-cyan-400">🔍</span>
                          <span class="uppercase tracking-wider text-[11px]">Bộ Lọc Nhanh (POL, POD & Khoảng Thời Gian)</span>
                        </div>
                        @if (hasActiveVoyageFilters()) {
                          <button 
                            type="button"
                            (click)="resetVoyageFilters()"
                            class="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/60"
                          >
                            <span>✕</span>
                            <span>Đặt lại tất cả lọc</span>
                          </button>
                        }
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <!-- Lọc Cảng Bốc (POL) - Autocomplete -->
                        <div class="relative">
                          <label class="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                            <span>📍 Cảng Bốc (POL):</span>
                            @if (filterPolId()) {
                              <span class="text-[9px] text-cyan-400 font-mono font-bold bg-cyan-950 px-1 rounded border border-cyan-800">
                                ID: {{ filterPolId() }}
                              </span>
                            }
                          </label>
                          <div class="relative">
                            <input 
                              type="text"
                              [value]="filterPolName()"
                              (input)="filterPolName.set($any($event.target).value); filterPolId.set(null); voyageCurrentPage.set(1)"
                              (focus)="activeTableFilterDropdown.set('filterPol')"
                              placeholder="Chọn cảng bốc (Hải Phòng...)"
                              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 pr-7"
                            />
                            @if (filterPolName()) {
                              <button 
                                type="button"
                                (click)="selectFilterPolPort(null)"
                                class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                                title="Xóa chọn cảng bốc"
                              >
                                ✕
                              </button>
                            } @else {
                              <button 
                                type="button"
                                (click)="toggleTableFilterDropdown('filterPol')"
                                class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                              >
                                ▼
                              </button>
                            }
                          </div>
                          @if (activeTableFilterDropdown() === 'filterPol') {
                            <div class="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-40 divide-y divide-slate-800">
                              <button 
                                type="button"
                                (click)="selectFilterPolPort(null)"
                                class="w-full text-left px-3.5 py-1.5 text-xs hover:bg-slate-800 text-slate-400 transition"
                              >
                                -- Tất cả cảng bốc --
                              </button>
                              @for (p of filteredTablePolPorts(); track p.id) {
                                <button 
                                  type="button"
                                  (click)="selectFilterPolPort(p)"
                                  class="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-cyan-300"
                                >
                                  <div>
                                    <span class="font-bold">{{ p.name }}</span>
                                    @if (p.code) { <span class="text-[10px] text-slate-400 font-mono ml-1">({{ p.code }})</span> }
                                  </div>
                                  <span class="text-[10px] font-mono text-cyan-400 font-bold">#{{ p.id }}</span>
                                </button>
                              }
                            </div>
                          }
                        </div>

                        <!-- Lọc Cảng Dỡ (POD) - Autocomplete -->
                        <div class="relative">
                          <label class="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                            <span>🎯 Cảng Dỡ (POD):</span>
                            @if (filterPodId()) {
                              <span class="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-950 px-1 rounded border border-emerald-800">
                                ID: {{ filterPodId() }}
                              </span>
                            }
                          </label>
                          <div class="relative">
                            <input 
                              type="text"
                              [value]="filterPodName()"
                              (input)="filterPodName.set($any($event.target).value); filterPodId.set(null); voyageCurrentPage.set(1)"
                              (focus)="activeTableFilterDropdown.set('filterPod')"
                              placeholder="Chọn cảng dỡ (TP.HCM...)"
                              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 pr-7"
                            />
                            @if (filterPodName()) {
                              <button 
                                type="button"
                                (click)="selectFilterPodPort(null)"
                                class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                                title="Xóa chọn cảng dỡ"
                              >
                                ✕
                              </button>
                            } @else {
                              <button 
                                type="button"
                                (click)="toggleTableFilterDropdown('filterPod')"
                                class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                              >
                                ▼
                              </button>
                            }
                          </div>
                          @if (activeTableFilterDropdown() === 'filterPod') {
                            <div class="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-40 divide-y divide-slate-800">
                              <button 
                                type="button"
                                (click)="selectFilterPodPort(null)"
                                class="w-full text-left px-3.5 py-1.5 text-xs hover:bg-slate-800 text-slate-400 transition"
                              >
                                -- Tất cả cảng dỡ --
                              </button>
                              @for (p of filteredTablePodPorts(); track p.id) {
                                <button 
                                  type="button"
                                  (click)="selectFilterPodPort(p)"
                                  class="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-cyan-300"
                                >
                                  <div>
                                    <span class="font-bold">{{ p.name }}</span>
                                    @if (p.code) { <span class="text-[10px] text-slate-400 font-mono ml-1">({{ p.code }})</span> }
                                  </div>
                                  <span class="text-[10px] font-mono text-emerald-400 font-bold">#{{ p.id }}</span>
                                </button>
                              }
                            </div>
                          }
                        </div>

                        <!-- Lọc >= ETD (Khởi hành từ ngày - Pickdate) -->
                        <div>
                          <label class="block text-[11px] font-semibold text-amber-300 mb-1 flex items-center justify-between">
                            <span>⏱️ Khởi hành từ ngày (>= ETD):</span>
                            @if (filterMinEtd()) {
                              <button 
                                type="button"
                                (click)="filterMinEtd.set(''); voyageCurrentPage.set(1)"
                                class="text-[9px] text-slate-400 hover:text-white"
                              >
                                Xóa
                              </button>
                            }
                          </label>
                          <input 
                            type="date"
                            [value]="filterMinEtd()"
                            (input)="onFilterMinEtdChange($event)"
                            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <!-- Lọc <= ETA (Cập cảng trước ngày - Pickdate) -->
                        <div>
                          <label class="block text-[11px] font-semibold text-emerald-300 mb-1 flex items-center justify-between">
                            <span>⚓ Cập cảng trước ngày (<= ETA):</span>
                            @if (filterMaxEta()) {
                              <button 
                                type="button"
                                (click)="filterMaxEta.set(''); voyageCurrentPage.set(1)"
                                class="text-[9px] text-slate-400 hover:text-white"
                              >
                                Xóa
                              </button>
                            }
                          </label>
                          <input 
                            type="date"
                            [value]="filterMaxEta()"
                            (input)="onFilterMaxEtaChange($event)"
                            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                      </div>

                      <!-- Active Filter Pills (Huy hiệu điều kiện lọc) -->
                      @if (hasActiveVoyageFilters()) {
                        <div class="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                          <span class="text-slate-400 text-[10px] uppercase font-bold mr-1">Đang lọc:</span>
                          @if (filterPolName()) {
                            <span class="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                              <span>POL: {{ filterPolName() }}</span>
                              <button type="button" (click)="selectFilterPolPort(null)" class="hover:text-white">✕</button>
                            </span>
                          }
                          @if (filterPodName()) {
                            <span class="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                              <span>POD: {{ filterPodName() }}</span>
                              <button type="button" (click)="selectFilterPodPort(null)" class="hover:text-white">✕</button>
                            </span>
                          }
                          @if (filterMinEtd()) {
                            <span class="px-2 py-0.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                              <span>ETD >= {{ filterMinEtd() }}</span>
                              <button type="button" (click)="filterMinEtd.set(''); voyageCurrentPage.set(1)" class="hover:text-white">✕</button>
                            </span>
                          }
                          @if (filterMaxEta()) {
                            <span class="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                              <span>ETA <= {{ filterMaxEta() }}</span>
                              <button type="button" (click)="filterMaxEta.set(''); voyageCurrentPage.set(1)" class="hover:text-white">✕</button>
                            </span>
                          }
                          @if (voyageSearchQuery()) {
                            <span class="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                              <span>Từ khóa: "{{ voyageSearchQuery() }}"</span>
                              <button type="button" (click)="voyageSearchQuery.set(''); voyageCurrentPage.set(1)" class="hover:text-white">✕</button>
                            </span>
                          }
                        </div>
                      }
                    </div>

                    <!-- ============================================== -->
                    <!-- 1. BẢNG BIỂU DESKTOP / TABLET (PHÂN TRANG 20, 50, 100) -->
                    <!-- ============================================== -->
                    @if (voyageViewMode() === 'table' || (voyageViewMode() === 'auto' && activeDevice() !== 'phone')) {
                      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                           [class.hidden]="voyageViewMode() === 'auto'"
                           [class.md:block]="voyageViewMode() === 'auto'">
                        <div class="overflow-x-auto">
                          <table class="w-full text-left text-xs text-slate-300">
                            <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                              <tr>
                                <th class="py-3 px-3.5 font-bold">Tàu & Số Chuyến</th>
                                <th class="py-3 px-3.5 font-bold">Hãng Vận Chuyển</th>
                                <th class="py-3 px-3.5 font-bold">Cảng & Bến Bốc (POL)</th>
                                <th class="py-3 px-3.5 font-bold">Cảng & Bến Dỡ (POD)</th>
                                <th class="py-3 px-3.5 font-bold">Thời Gian (ETD / Cutoff / ETA)</th>
                                <th class="py-3 px-3.5 font-bold">Người Cập Nhật</th>
                                <th class="py-3 px-3.5 font-bold text-center">Thao Tác</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/80">
                              @for (v of paginatedVoyages(); track (v.id || v.voyage_name)) {
                                <tr class="hover:bg-slate-800/50 transition-colors group">
                                  <!-- Tàu & Chuyến -->
                                  <td class="py-3 px-3.5">
                                    <div class="font-black text-white text-sm group-hover:text-cyan-300 transition flex items-center gap-1.5">
                                      <span>🚢</span>
                                      <span>{{ v.vessel_name }}</span>
                                    </div>
                                    <div class="text-[11px] text-cyan-400 font-mono font-bold mt-0.5">{{ v.voyage_name }}</div>
                                    @if (v.vessel_id) {
                                      <span class="text-[9px] text-slate-500 font-mono">Tàu ID: {{ v.vessel_id }}</span>
                                    }
                                  </td>
                                  <!-- Hãng Tàu -->
                                  <td class="py-3 px-3.5">
                                    <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                      {{ v.supplier_name || 'Hãng tàu' }}
                                    </span>
                                    @if (v.supplier_id) {
                                      <div class="text-[9px] text-slate-500 font-mono mt-0.5">NCC #{{ v.supplier_id }}</div>
                                    }
                                  </td>
                                  <!-- Cảng & Bến Bốc -->
                                  <td class="py-3 px-3.5">
                                    <div class="font-bold text-slate-200">{{ v.load_port_name }}</div>
                                    <div class="text-[11px] text-slate-400">{{ v.load_terminal_name || '(Chưa chỉ định bến)' }}</div>
                                  </td>
                                  <!-- Cảng & Bến Dỡ -->
                                  <td class="py-3 px-3.5">
                                    <div class="font-bold text-emerald-300">{{ v.discharge_port_name }}</div>
                                    <div class="text-[11px] text-slate-400">{{ v.discharge_terminal_name || '(Chưa chỉ định bến)' }}</div>
                                  </td>
                                  <!-- Thời gian -->
                                  <td class="py-3 px-3.5 font-mono text-[11px]">
                                    <div class="text-amber-300 font-medium">ETD: {{ v.depart_time }}</div>
                                    <div class="text-rose-300 text-[10px]">Cut: {{ v.closing_time }}</div>
                                    <div class="text-emerald-300">ETA: {{ v.arrive_time }}</div>
                                  </td>
                                  <!-- Người cập nhật -->
                                  <td class="py-3 px-3.5">
                                    <div class="font-medium text-slate-200">{{ v.update_by_name || 'Albert Long' }}</div>
                                    @if (v.update_by_id) {
                                      <span class="text-[9px] text-slate-500 font-mono">ID: {{ v.update_by_id }}</span>
                                    }
                                  </td>
                                  <!-- Thao tác: Đặt chỗ, Sửa, Copy, Xóa -->
                                  <td class="py-3 px-3.5 text-center">
                                    <div class="flex items-center justify-center gap-1.5">
                                      <button 
                                        type="button"
                                        (click)="selectVoyageForBooking(v)"
                                        class="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] transition shadow-sm"
                                        title="Đặt chỗ cho chuyến tàu này"
                                      >
                                        ⚓ Đặt Chỗ
                                      </button>
                                      <button 
                                        type="button"
                                        (click)="openEditVoyageModal(v)"
                                        class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
                                        title="Chỉnh sửa chuyến tàu"
                                      >
                                        ✏️ Sửa
                                      </button>
                                      <button 
                                        type="button"
                                        (click)="openCopyVoyageModal(v)"
                                        class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                                        title="Nhân bản / Sao chép chuyến tàu"
                                      >
                                        📋 Copy
                                      </button>
                                      <button 
                                        type="button"
                                        (click)="promptDeleteVoyage(v)"
                                        class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 border border-slate-700 hover:border-rose-700 transition"
                                        title="Xóa chuyến tàu"
                                      >
                                        🗑️ Xóa
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              } @empty {
                                <tr>
                                  <td colspan="7" class="py-12 text-center text-slate-400">
                                    <div class="text-3xl mb-2">🔍</div>
                                    <div class="font-bold text-white text-sm">Không tìm thấy chuyến tàu nào phù hợp</div>
                                    <p class="text-xs text-slate-500 mt-1">Vui lòng điều chỉnh điều kiện lọc hoặc xóa bộ lọc để xem toàn bộ danh mục.</p>
                                    @if (hasActiveVoyageFilters()) {
                                      <button 
                                        type="button" 
                                        (click)="resetVoyageFilters()"
                                        class="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition"
                                      >
                                        <span>✕</span> Đặt lại bộ lọc
                                      </button>
                                    }
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    }

                    <!-- ============================================== -->
                    <!-- 3. DẠNG CARD VIEW CHUYÊN BIỆT CHO MÀN HÌNH SMARTPHONE -->
                    <!-- ============================================== -->
                    @if (voyageViewMode() === 'card' || activeDevice() === 'phone' || (voyageViewMode() === 'auto' && voyageViewMode() !== 'table')) {
                      <div class="space-y-3.5"
                           [class.hidden]="voyageViewMode() === 'table'"
                           [class.md:hidden]="voyageViewMode() === 'auto' && activeDevice() !== 'phone'">
                        <div class="flex items-center justify-between text-xs text-slate-400 px-1">
                          <span class="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <span>📱</span>
                            <span>Danh Sách Thẻ Smartphone ({{ filteredVoyages().length }} Chuyến)</span>
                          </span>
                          <span class="text-[11px] font-mono text-cyan-400 font-semibold">
                            Trang {{ paginationInfo().page }}/{{ paginationInfo().totalPages }}
                          </span>
                        </div>

                        <div class="grid grid-cols-1 gap-3.5">
                          @for (v of paginatedVoyages(); track (v.id || v.voyage_name)) {
                            <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-4 shadow-xl space-y-3.5 relative overflow-hidden transition active:scale-[0.99]">
                              <!-- Top tag: Hãng tàu, Trạng thái & ID -->
                              <div class="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                                <div class="flex items-center gap-1.5 flex-wrap">
                                  <span class="text-[10px] font-bold text-cyan-300 uppercase bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/80">
                                    {{ v.supplier_name || 'Hãng tàu' }}
                                  </span>
                                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                                    [class.bg-emerald-950]="v.status === 'OPEN' || !v.status"
                                    [class.text-emerald-300]="v.status === 'OPEN' || !v.status"
                                    [class.border-emerald-800]="v.status === 'OPEN' || !v.status"
                                    [class.bg-amber-950]="v.status === 'CLOSING_SOON'"
                                    [class.text-amber-300]="v.status === 'CLOSING_SOON'"
                                    [class.border-amber-800]="v.status === 'CLOSING_SOON'"
                                  >
                                    {{ v.status === 'CLOSING_SOON' ? '🟡 Sắp Đóng Sổ' : '🟢 Đang Nhận Cont' }}
                                  </span>
                                </div>
                                @if (v.id) {
                                  <span class="text-[10px] font-mono text-slate-500 font-semibold">#{{ v.id }}</span>
                                }
                              </div>

                              <!-- Tiêu đề: Tên tàu biển & Số chuyến -->
                              <div class="flex items-center justify-between">
                                <div>
                                  <h4 class="text-base font-black text-white flex items-center gap-1.5">
                                    <span>🚢</span>
                                    <span>{{ v.vessel_name }}</span>
                                  </h4>
                                  <div class="text-xs font-mono text-cyan-400 font-bold mt-0.5">
                                    Số Chuyến: <span class="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-white">{{ v.voyage_name }}</span>
                                  </div>
                                </div>
                                @if (v.vessel_id) {
                                  <span class="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                                    Tàu ID: {{ v.vessel_id }}
                                  </span>
                                }
                              </div>

                              <!-- Lộ Trình Tuyến Hải Trình POL ➔ POD dạng thẻ biểu diễn tương tác -->
                              <div class="bg-slate-950/90 p-3 rounded-2xl border border-slate-800/90 space-y-2.5">
                                <div class="grid grid-cols-2 gap-3 relative">
                                  <!-- POL Cảng Bốc -->
                                  <div>
                                    <div class="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                      <span class="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
                                      <span>Cảng Bốc (POL)</span>
                                    </div>
                                    <div class="font-bold text-white text-xs mt-0.5 truncate">{{ v.load_port_name }}</div>
                                    <div class="text-[11px] text-slate-400 truncate">{{ v.load_terminal_name || 'Bến cảng bốc' }}</div>
                                    <div class="text-[10px] font-mono text-amber-300 font-bold mt-1">
                                      ETD: {{ v.depart_time }}
                                    </div>
                                  </div>

                                  <!-- POD Cảng Dỡ -->
                                  <div>
                                    <div class="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                                      <span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                                      <span>Cảng Dỡ (POD)</span>
                                    </div>
                                    <div class="font-bold text-emerald-300 text-xs mt-0.5 truncate">{{ v.discharge_port_name }}</div>
                                    <div class="text-[11px] text-slate-400 truncate">{{ v.discharge_terminal_name || 'Bến cảng dỡ' }}</div>
                                    <div class="text-[10px] font-mono text-emerald-300 font-bold mt-1">
                                      ETA: {{ v.arrive_time }}
                                    </div>
                                  </div>
                                </div>

                                <!-- Mốc Cut-off hạ bãi -->
                                <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                                  <span class="text-rose-300 font-semibold flex items-center gap-1">
                                    <span>🔒 Hạn hạ bãi (Closing):</span>
                                    <strong>{{ v.closing_time }}</strong>
                                  </span>
                                  <span class="text-slate-500 text-[10px]">2.5 ngày hải trình</span>
                                </div>
                              </div>

                              <!-- Thông tin người tạo -->
                              <div class="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                                <span class="text-[11px]">Người cập nhật: <strong class="text-slate-200">{{ v.update_by_name || 'Albert Long' }}</strong></span>
                              </div>

                              <!-- 4 Nút Hành Động Cho Mobile (To, dễ bấm chạm) -->
                              <div class="grid grid-cols-4 gap-2 pt-1">
                                <button 
                                  type="button"
                                  (click)="selectVoyageForBooking(v)"
                                  class="col-span-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2.5 rounded-xl text-xs text-center shadow-md active:scale-95 transition flex items-center justify-center gap-1"
                                  title="Đặt chỗ ngay"
                                >
                                  <span>⚓</span>
                                  <span>Đặt</span>
                                </button>
                                <button 
                                  type="button"
                                  (click)="openEditVoyageModal(v)"
                                  class="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2.5 rounded-xl text-xs text-center border border-slate-700 active:scale-95 transition flex items-center justify-center gap-1"
                                  title="Sửa chuyến tàu"
                                >
                                  <span>✏️</span>
                                  <span>Sửa</span>
                                </button>
                                <button 
                                  type="button"
                                  (click)="openCopyVoyageModal(v)"
                                  class="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold py-2.5 rounded-xl text-xs text-center border border-slate-700 active:scale-95 transition flex items-center justify-center gap-1"
                                  title="Nhân bản / Copy"
                                >
                                  <span>📋</span>
                                  <span>Copy</span>
                                </button>
                                <button 
                                  type="button"
                                  (click)="promptDeleteVoyage(v)"
                                  class="bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold py-2.5 rounded-xl text-xs text-center border border-rose-800/80 active:scale-95 transition flex items-center justify-center gap-1"
                                  title="Xóa chuyến tàu"
                                >
                                  <span>🗑️</span>
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </div>
                          } @empty {
                            <div class="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
                              <div class="text-3xl mb-2">🔍</div>
                              <div class="font-bold text-white text-sm">Không tìm thấy chuyến tàu nào</div>
                              <p class="text-xs text-slate-500 mt-1">Vui lòng thử từ khóa khác hoặc bấm đặt lại bộ lọc.</p>
                              @if (hasActiveVoyageFilters()) {
                                <button 
                                  type="button" 
                                  (click)="resetVoyageFilters()"
                                  class="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition"
                                >
                                  <span>✕</span> Đặt lại bộ lọc
                                </button>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <!-- ============================================== -->
                    <!-- 4. THANH PHÂN TRANG (PAGINATION) CHO TABLE & CARDS: 20, 50, 100 -->
                    <!-- ============================================== -->
                    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                      <!-- Chọn số lượng dòng: 20, 50, 100 -->
                      <div class="flex items-center gap-2">
                        <span class="text-slate-400 font-medium">Số chuyến / trang:</span>
                        <div class="inline-flex bg-slate-950 border border-slate-700/80 rounded-xl p-0.5">
                          @for (size of pageSizeOptions; track size) {
                            <button 
                              type="button"
                              (click)="setVoyagePageSize(size)"
                              [class.bg-cyan-500]="voyagePageSize() === size"
                              [class.text-slate-950]="voyagePageSize() === size"
                              [class.font-black]="voyagePageSize() === size"
                              [class.text-slate-300]="voyagePageSize() !== size"
                              class="px-3 py-1 rounded-lg text-xs font-semibold transition"
                            >
                              {{ size }}
                            </button>
                          }
                        </div>
                      </div>

                      <!-- Thông tin hiển thị: Hiển thị 1 - 20 trong 100 chuyến -->
                      <div class="text-slate-400 text-xs font-medium">
                        Hiển thị <strong class="text-white">{{ paginationInfo().start }} - {{ paginationInfo().end }}</strong> trong tổng số <strong class="text-cyan-400">{{ paginationInfo().total }}</strong> chuyến tàu
                      </div>

                      <!-- Nút bấm chuyển trang: <<, <, 1, 2..., >, >> -->
                      <div class="flex items-center gap-1">
                        <!-- Trang đầu -->
                        <button 
                          type="button"
                          (click)="goToVoyagePage(1)"
                          [disabled]="voyageCurrentPage() === 1"
                          class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold transition flex items-center justify-center text-xs"
                          title="Trang đầu tiên"
                        >
                          «
                        </button>
                        <!-- Trang trước -->
                        <button 
                          type="button"
                          (click)="prevVoyagePage()"
                          [disabled]="voyageCurrentPage() === 1"
                          class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold transition flex items-center justify-center text-xs"
                          title="Trang trước"
                        >
                          ‹
                        </button>

                        <!-- Các số trang -->
                        @for (pageNum of getPageNumbers(); track pageNum) {
                          <button 
                            type="button"
                            (click)="goToVoyagePage(pageNum)"
                            [class.bg-cyan-500]="voyageCurrentPage() === pageNum"
                            [class.text-slate-950]="voyageCurrentPage() === pageNum"
                            [class.font-black]="voyageCurrentPage() === pageNum"
                            [class.bg-slate-800]="voyageCurrentPage() !== pageNum"
                            [class.text-slate-300]="voyageCurrentPage() !== pageNum"
                            class="w-7 h-7 rounded-lg hover:bg-cyan-400 hover:text-slate-950 transition font-bold text-xs flex items-center justify-center"
                          >
                            {{ pageNum }}
                          </button>
                        }

                        <!-- Trang sau -->
                        <button 
                          type="button"
                          (click)="nextVoyagePage()"
                          [disabled]="voyageCurrentPage() === totalVoyagePages() || totalVoyagePages() === 0"
                          class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold transition flex items-center justify-center text-xs"
                          title="Trang tiếp theo"
                        >
                          ›
                        </button>
                        <!-- Trang cuối -->
                        <button 
                          type="button"
                          (click)="goToVoyagePage(totalVoyagePages())"
                          [disabled]="voyageCurrentPage() === totalVoyagePages() || totalVoyagePages() === 0"
                          class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold transition flex items-center justify-center text-xs"
                          title="Trang cuối cùng"
                        >
                          »
                        </button>
                      </div>
                    </div>
                  </div>
                }

                <!-- CHẾ ĐỘ XEM 1B: FORM CẤU HÌNH BOOKING -->
                @if (selectedVesselForBooking()) {
                  <div class="space-y-6">
                    <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                      <div class="flex items-center gap-3">
                        <button 
                          (click)="cancelVesselSelection()"
                          class="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1 transition"
                        >
                          ← Đổi chuyến tàu khác
                        </button>
                        <div>
                          <div class="text-xs text-slate-400">Đang đặt chỗ chuyến tàu:</div>
                          <div class="text-sm font-bold text-cyan-300">
                            {{ selectedVesselForBooking()?.vesselName }} ({{ selectedVesselForBooking()?.voyage }}) - Hãng {{ selectedVesselForBooking()?.carrier }}
                          </div>
                        </div>
                      </div>
                      <div class="text-xs text-right">
                        <div class="text-slate-400">ETD: {{ selectedVesselForBooking()?.etd }}</div>
                        <div class="text-emerald-400 font-medium">Hạn hạ bãi: {{ selectedVesselForBooking()?.cutoff }}</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <!-- Cột Trái -->
                      <div class="space-y-4">
                        <!-- Khối 1: Lấy hàng HP -->
                        <div class="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl">
                          <h4 class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span>📍</span> Khối 1: Kho Lấy Hàng (Hải Phòng)
                          </h4>
                          <div class="space-y-3 text-xs">
                            <div>
                              <label class="block text-slate-400 mb-1">Địa chỉ kho lấy hàng:</label>
                              <input 
                                type="text" 
                                [value]="pickupAddress()"
                                (input)="pickupAddress.set($any($event.target).value)"
                                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label class="block text-slate-400 mb-1">Thời gian lấy hàng:</label>
                                <input 
                                  type="datetime-local" 
                                  [value]="pickupDateTime()"
                                  (input)="pickupDateTime.set($any($event.target).value)"
                                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                              <div>
                                <label class="block text-slate-400 mb-1">Ghi chú lấy hàng:</label>
                                <input 
                                  type="text" 
                                  [value]="pickupNote()"
                                  (input)="pickupNote.set($any($event.target).value)"
                                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Khối 2: Giao hàng HCM -->
                        <div class="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl">
                          <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span>🎯</span> Khối 2: Kho Giao Hàng (TP. Hồ Chí Minh)
                          </h4>
                          <div class="space-y-3 text-xs">
                            <div>
                              <label class="block text-slate-400 mb-1">Địa chỉ kho giao hàng:</label>
                              <input 
                                type="text" 
                                [value]="deliveryAddress()"
                                (input)="deliveryAddress.set($any($event.target).value)"
                                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label class="block text-slate-400 mb-1">Thời gian giao dự kiến:</label>
                                <input 
                                  type="datetime-local" 
                                  [value]="deliveryDateTime()"
                                  (input)="deliveryDateTime.set($any($event.target).value)"
                                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                              <div>
                                <label class="block text-slate-400 mb-1">Ghi chú giao hàng:</label>
                                <input 
                                  type="text" 
                                  [value]="deliveryNote()"
                                  (input)="deliveryNote.set($any($event.target).value)"
                                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Khối 3: Mặt hàng & Trọng lượng -->
                        <div class="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl">
                          <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span>📦</span> Khối 3: Mặt Hàng & Trọng Lượng
                          </h4>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label class="block text-slate-400 mb-1">Tên mặt hàng (Commodity):</label>
                              <input 
                                type="text" 
                                [value]="commodityName()"
                                (input)="commodityName.set($any($event.target).value)"
                                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label class="block text-slate-400 mb-1">Trọng lượng hàng (Tấn / Cont):</label>
                              <div class="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  [value]="cargoWeightTon()"
                                  (input)="cargoWeightTon.set(+$any($event.target).value)"
                                  min="1" 
                                  max="32" 
                                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                />
                                <span class="text-slate-400 font-semibold">Tấn/cont</span>
                              </div>
                            </div>
                          </div>
                          <div class="mt-2 text-[11px] text-amber-400/90">
                            * Tiêu chuẩn cước: Cont 20' ≤ 18 tấn; Cont 40' ≤ 26 tấn. Vượt mức tính phụ phí 300.000 đ/tấn vượt.
                          </div>
                        </div>
                      </div>

                      <!-- Cột Phải: Container động & Cost Engine -->
                      <div class="space-y-4">
                        <div class="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl">
                          <div class="flex items-center justify-between mb-3">
                            <h4 class="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                              <span>📐</span> Khối 4: Danh Sách Container Động
                            </h4>
                            <button 
                              (click)="addContainerRow()"
                              class="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1 transition"
                            >
                              + Thêm Loại Container Khác
                            </button>
                          </div>

                          <div class="space-y-2.5">
                            @for (item of dynamicContainers(); track item.id) {
                              <div class="bg-slate-900 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-3 text-xs">
                                <div class="flex-1">
                                  <label class="text-[10px] text-slate-400 block mb-1">Loại Container:</label>
                                  <select 
                                    [value]="item.type"
                                    (change)="updateContainerType(item.id, $any($event.target).value)"
                                    class="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs w-full focus:outline-none focus:border-cyan-500"
                                  >
                                    <option value="20GP">20' Dry Standard (20GP)</option>
                                    <option value="40GP">40' Dry Standard (40GP)</option>
                                    <option value="40HC">40' High Cube (40HC)</option>
                                    <option value="20RF">20' Reefer Lạnh (20RF)</option>
                                    <option value="45HC">45' High Cube (45HC)</option>
                                  </select>
                                </div>

                                <div>
                                  <label class="text-[10px] text-slate-400 block mb-1">Số lượng:</label>
                                  <div class="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                                    <button 
                                      (click)="decrementContainerQty(item.id)"
                                      class="w-6 h-6 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white font-bold"
                                    >
                                      -
                                    </button>
                                    <span class="w-8 text-center font-bold text-cyan-300">{{ item.quantity }}</span>
                                    <button 
                                      (click)="incrementContainerQty(item.id)"
                                      class="w-6 h-6 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div class="pt-4">
                                  <button 
                                    (click)="removeContainerRow(item.id)"
                                    [disabled]="dynamicContainers().length <= 1"
                                    [class.opacity-30]="dynamicContainers().length <= 1"
                                    class="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40 transition"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            }
                          </div>
                        </div>

                        <!-- BÓC TÁCH CHI PHÍ TỰ ĐỘNG -->
                        <div class="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-cyan-500/60 p-5 rounded-2xl shadow-xl">
                          <h4 class="text-xs font-black text-cyan-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                            <span>💰 Bóc Tách Chi Phí Tự Động (Cost Engine)</span>
                            <span class="text-[10px] text-slate-400 font-normal">Trọn gói Door-to-Door</span>
                          </h4>

                          <div class="space-y-2 text-xs divide-y divide-slate-800">
                            <div class="flex justify-between pt-1">
                              <span class="text-slate-400">1. Trucking lấy hàng đầu HP:</span>
                              <span class="font-mono text-white">{{ formatVND(costBreakdown().pickupTrucking) }}</span>
                            </div>
                            <div class="flex justify-between pt-2">
                              <span class="text-slate-400">2. Cước tàu biển HP ➔ HCM:</span>
                              <span class="font-mono text-white">{{ formatVND(costBreakdown().oceanFreight) }}</span>
                            </div>
                            <div class="flex justify-between pt-2">
                              <span class="text-slate-400">3. Trucking giao hàng đầu HCM:</span>
                              <span class="font-mono text-white">{{ formatVND(costBreakdown().deliveryTrucking) }}</span>
                            </div>
                            <div class="flex justify-between pt-2">
                              <span class="text-slate-400">4. Phụ phí cảng (THC + LSS + Nâng hạ Lift):</span>
                              <span class="font-mono text-white">{{ formatVND(costBreakdown().terminalCharges) }}</span>
                            </div>
                            <div class="flex justify-between pt-2">
                              <span class="text-amber-400">5. Phụ phí quá tải (>18T/20' hoặc >26T/40'):</span>
                              <span class="font-mono text-amber-300 font-semibold">{{ formatVND(costBreakdown().overweightSurcharge) }}</span>
                            </div>
                            
                            <div class="flex justify-between items-center pt-3 border-t border-cyan-500/40">
                              <div>
                                <span class="font-bold text-white uppercase text-xs">TỔNG CƯỚC DOOR-TO-DOOR:</span>
                                <div class="text-[10px] text-slate-400">Đã bao gồm VAT & phụ phí</div>
                              </div>
                              <span class="text-lg font-black font-mono text-cyan-300">{{ formatVND(costBreakdown().total) }}</span>
                            </div>
                          </div>

                          <button 
                            (click)="confirmBooking()"
                            class="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-[0.98] text-sm flex items-center justify-center gap-2"
                          >
                            <span>✓</span> Xác Nhận Đặt Chỗ (Tạo Booking Tức Thì)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              }

              <!-- ============================================== -->
              <!-- MODUL 2: QUẢN LÝ BOOKING -->
              <!-- ============================================== -->
              @if (activeStep() === 2) {
                <div class="space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <div class="text-xs text-slate-400">Tổng Đơn Booking</div>
                        <div class="text-xl font-black text-white mt-1">{{ bookings().length }}</div>
                      </div>
                      <div class="text-2xl opacity-50">📑</div>
                    </div>
                    <div class="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <div class="text-xs text-slate-400">Đã Cấp Lệnh Lấy Vỏ</div>
                        <div class="text-xl font-black text-emerald-400 mt-1">{{ releasedBookingsCount() }}</div>
                      </div>
                      <div class="text-2xl opacity-50">🚚</div>
                    </div>
                    <div class="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <div class="text-xs text-slate-400">Chờ Cấp Vỏ / Chờ Duyệt</div>
                        <div class="text-xl font-black text-amber-400 mt-1">{{ pendingBookingsCount() }}</div>
                      </div>
                      <div class="text-2xl opacity-50">⏳</div>
                    </div>
                  </div>

                  <div class="space-y-3">
                    @for (b of bookings(); track b.id) {
                      <div class="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-5 hover:border-slate-600 transition space-y-3">
                        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-black text-cyan-400 font-mono">{{ b.bookingNo }}</span>
                            <span 
                              class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              [class.bg-emerald-950]="b.status === 'EQUIPMENT_RELEASED' || b.status === 'GATE_IN'"
                              [class.text-emerald-300]="b.status === 'EQUIPMENT_RELEASED' || b.status === 'GATE_IN'"
                              [class.border]="true"
                              [class.border-emerald-800]="b.status === 'EQUIPMENT_RELEASED' || b.status === 'GATE_IN'"
                              [class.bg-cyan-950]="b.status === 'CONFIRMED'"
                              [class.text-cyan-300]="b.status === 'CONFIRMED'"
                              [class.border-cyan-800]="b.status === 'CONFIRMED'"
                            >
                              {{ b.status === 'EQUIPMENT_RELEASED' ? 'Đã Cấp Lệnh Vỏ' : (b.status === 'GATE_IN' ? 'Đã Hạ Bãi Cảng' : 'Xác Nhận Đặt Chỗ') }}
                            </span>
                          </div>
                          <span class="text-xs text-slate-400 font-mono">Ngày tạo: {{ b.createdAt }}</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span class="text-slate-400 block text-[11px]">Tàu & Tuyến:</span>
                            <span class="font-bold text-white">{{ b.vesselName }} ({{ b.voyage }})</span>
                            <div class="text-[11px] text-slate-400">{{ b.originPort }} ➔ {{ b.destPort }}</div>
                          </div>
                          <div>
                            <span class="text-slate-400 block text-[11px]">Quy Cách & Hàng:</span>
                            <span class="font-semibold text-white">
                              @for (c of b.containers; track c.id) {
                                {{ c.quantity }}x {{ c.type }} &nbsp;
                              }
                            </span>
                            <div class="text-[11px] text-slate-400">{{ b.commodity }} ({{ b.cargoWeightTon }} T/cont)</div>
                          </div>
                          <div>
                            <span class="text-slate-400 block text-[11px]">Địa Điểm Nhận - Giao:</span>
                            <div class="truncate text-white">HP: {{ b.pickupAddress }}</div>
                            <div class="truncate text-slate-400">HCM: {{ b.deliveryAddress }}</div>
                          </div>
                          <div class="sm:text-right">
                            <span class="text-slate-400 block text-[11px]">Tổng Cước D2D:</span>
                            <span class="text-sm font-black font-mono text-cyan-300">{{ formatVND(b.totalCost) }}</span>
                          </div>
                        </div>

                        <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-700/60">
                          <button 
                            (click)="viewEquipmentReleaseModal(b)"
                            class="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <span>📄</span> Lệnh Cấp Vỏ (Booking Note)
                          </button>
                          <button 
                            (click)="goToShipmentFromBooking(b.bookingNo)"
                            class="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition"
                          >
                            <span>Shipment</span> ➔
                          </button>
                        </div>
                      </div>
                    } @empty {
                      <div class="text-center py-12 text-slate-400 text-sm">Chưa có booking nào. Vui lòng đặt chỗ ở Bước 1.</div>
                    }
                  </div>
                </div>
              }

              <!-- ============================================== -->
              <!-- MODUL 3: SHIPMENTS -->
              <!-- ============================================== -->
              @if (activeStep() === 3) {
                <div class="space-y-4">
                  <div class="flex flex-wrap items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 text-xs">
                    <span class="text-slate-400 font-medium px-2">Lọc theo chặng:</span>
                    <button 
                      (click)="shipmentFilter.set('ALL')"
                      [class.bg-cyan-500]="shipmentFilter() === 'ALL'"
                      [class.text-slate-950]="shipmentFilter() === 'ALL'"
                      [class.font-bold]="shipmentFilter() === 'ALL'"
                      [class.bg-slate-700]="shipmentFilter() !== 'ALL'"
                      [class.text-slate-300]="shipmentFilter() !== 'ALL'"
                      class="px-3 py-1 rounded-lg transition"
                    >
                      Tất Cả ({{ shipments().length }})
                    </button>
                    <button 
                      (click)="shipmentFilter.set('LEG1')"
                      [class.bg-cyan-500]="shipmentFilter() === 'LEG1'"
                      [class.text-slate-950]="shipmentFilter() === 'LEG1'"
                      [class.font-bold]="shipmentFilter() === 'LEG1'"
                      [class.bg-slate-700]="shipmentFilter() !== 'LEG1'"
                      [class.text-slate-300]="shipmentFilter() !== 'LEG1'"
                      class="px-3 py-1 rounded-lg transition"
                    >
                      Chặng 1: Kéo HP
                    </button>
                    <button 
                      (click)="shipmentFilter.set('LEG2')"
                      [class.bg-cyan-500]="shipmentFilter() === 'LEG2'"
                      [class.text-slate-950]="shipmentFilter() === 'LEG2'"
                      [class.font-bold]="shipmentFilter() === 'LEG2'"
                      [class.bg-slate-700]="shipmentFilter() !== 'LEG2'"
                      [class.text-slate-300]="shipmentFilter() !== 'LEG2'"
                      class="px-3 py-1 rounded-lg transition"
                    >
                      Chặng 2: Tàu Biển HP ➔ HCM
                    </button>
                    <button 
                      (click)="shipmentFilter.set('LEG3')"
                      [class.bg-cyan-500]="shipmentFilter() === 'LEG3'"
                      [class.text-slate-950]="shipmentFilter() === 'LEG3'"
                      [class.font-bold]="shipmentFilter() === 'LEG3'"
                      [class.bg-slate-700]="shipmentFilter() !== 'LEG3'"
                      [class.text-slate-300]="shipmentFilter() !== 'LEG3'"
                      class="px-3 py-1 rounded-lg transition"
                    >
                      Chặng 3: Giao HCM
                    </button>
                  </div>

                  <div class="space-y-4">
                    @for (s of filteredShipments(); track s.id) {
                      <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 hover:border-cyan-500/60 transition space-y-4">
                        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
                          <div class="flex items-center gap-3">
                            <span class="text-sm font-black text-cyan-400 font-mono">{{ s.shipmentNo }}</span>
                            <span class="text-xs bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
                              Ref BK: <strong class="text-white">{{ s.bookingNo }}</strong>
                            </span>
                            <span class="text-xs bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                              {{ s.containerType }}
                            </span>
                          </div>
                          <div class="text-xs text-emerald-400 font-medium">
                            Dự kiến giao đích: <strong>{{ s.etaDelivery }}</strong>
                          </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs">
                          <div>
                            <span class="text-slate-400 block text-[11px]">Số Container & Kẹp Chì:</span>
                            <div class="font-mono font-bold text-white">{{ s.containerNo }}</div>
                            <div class="font-mono text-cyan-400 text-[11px]">Seal: {{ s.sealNo }}</div>
                          </div>
                          <div>
                            <span class="text-slate-400 block text-[11px]">Tài Xế & Đầu Kéo:</span>
                            <div class="font-bold text-white">{{ s.driverName }} ({{ s.driverPhone }})</div>
                            <div class="text-slate-300 text-[11px]">Xe: {{ s.tractorPlate }} | Moóc: {{ s.trailerPlate }}</div>
                          </div>
                          <div>
                            <span class="text-slate-400 block text-[11px]">Tàu Chuyên Chở:</span>
                            <div class="font-bold text-white">{{ s.vesselName }}</div>
                            <div class="text-slate-400 text-[11px] truncate">Giao: {{ s.deliveryAddress }}</div>
                          </div>
                        </div>

                        <div class="space-y-2 pt-2">
                          <div class="flex items-center justify-between text-xs">
                            <span class="font-semibold text-slate-300">Trạng thái: {{ s.statusDescription }}</span>
                            <span class="font-mono font-bold text-cyan-400">{{ s.progressPercent }}% Hoàn thành</span>
                          </div>

                          <div class="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                            <div 
                              class="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500"
                              [style.width.%]="s.progressPercent"
                            ></div>
                          </div>

                          <div class="grid grid-cols-3 text-center pt-1 text-[11px]">
                            <div [class.font-black]="s.currentLeg === 1" [class.text-cyan-400]="s.currentLeg === 1" [class.text-slate-500]="s.currentLeg !== 1">
                              ① Kéo cont HP
                            </div>
                            <div [class.font-black]="s.currentLeg === 2" [class.text-cyan-400]="s.currentLeg === 2" [class.text-slate-500]="s.currentLeg !== 2">
                              ② Tàu biển HP ➔ HCM
                            </div>
                            <div [class.font-black]="s.currentLeg === 3" [class.text-cyan-400]="s.currentLeg === 3" [class.text-slate-500]="s.currentLeg !== 3">
                              ③ Giao cont HCM
                            </div>
                          </div>
                        </div>

                        <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-700">
                          <button 
                            (click)="viewEirModal(s)"
                            class="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium flex items-center gap-1 transition"
                          >
                            <span>🧾</span> Xem EIR (Giao Nhận Vỏ)
                          </button>
                          <button 
                            (click)="viewSeaWaybillModal(s)"
                            class="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 transition"
                          >
                            <span>📑</span> Vận Đơn Điện Tử (Sea Waybill)
                          </button>
                        </div>
                      </div>
                    } @empty {
                      <div class="text-center py-12 text-slate-400 text-sm">Không có shipment nào phù hợp.</div>
                    }
                  </div>
                </div>
              }

              <!-- ============================================== -->
              <!-- MODUL 4: CÔNG NỢ & THANH TOÁN -->
              <!-- ============================================== -->
              @if (activeStep() === 4) {
                <div class="space-y-6">
                  <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-amber-500/40 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                    <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-amber-400 text-lg">👑</span>
                          <span class="text-xs font-black tracking-wider uppercase text-amber-300">Chính Sách Khách Hàng VIP</span>
                        </div>
                        <h3 class="text-xl font-black text-white mt-1">Hạn Mức Tín Dụng Trả Sau T+30 (Hạng Vàng)</h3>
                        <p class="text-xs text-slate-400 mt-0.5">Chốt công nợ ngày 25 hàng tháng ● Hạn thanh toán ngày 05 tháng sau</p>
                      </div>
                      <div class="text-right">
                        <span class="text-xs text-slate-400">Tổng Hạn Mức Tín Dụng Cấp:</span>
                        <div class="text-xl font-black font-mono text-amber-300">{{ formatVND(totalCreditLimit()) }}</div>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <div class="flex justify-between text-xs">
                        <span class="text-slate-400">Đã sử dụng: <strong class="text-rose-400 font-mono">{{ formatVND(usedCredit()) }}</strong></span>
                        <span class="text-slate-400">Còn khả dụng: <strong class="text-emerald-400 font-mono">{{ formatVND(availableCredit()) }}</strong></span>
                      </div>
                      <div class="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                        <div 
                          class="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500"
                          [style.width.%]="creditUsagePercentage()"
                        ></div>
                      </div>
                      <div class="text-[11px] text-slate-400 text-right">
                        Tỷ lệ sử dụng: <span class="font-bold text-white">{{ creditUsagePercentage().toFixed(1) }}%</span>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>🧾</span> Danh Sách Hóa Đơn Cước Vận Tải
                    </h3>

                    <div class="space-y-3">
                      @for (inv of invoices(); track inv.id) {
                        <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                          <div class="space-y-1">
                            <div class="flex items-center gap-2">
                              <span class="font-mono font-black text-cyan-400 text-sm">{{ inv.invoiceNo }}</span>
                              <span 
                                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                [class.bg-emerald-950]="inv.status === 'PAID'"
                                [class.text-emerald-300]="inv.status === 'PAID'"
                                [class.border-emerald-800]="inv.status === 'PAID'"
                                [class.bg-amber-950]="inv.status === 'PENDING'"
                                [class.text-amber-300]="inv.status === 'PENDING'"
                                [class.border-amber-800]="inv.status === 'PENDING'"
                                [class.border]="true"
                              >
                                {{ inv.status === 'PAID' ? 'Đã Thanh Toán' : 'Chờ Thanh Toán' }}
                              </span>
                            </div>
                            <div class="text-xs text-white font-medium">{{ inv.serviceDescription }}</div>
                            <div class="text-[11px] text-slate-400 font-mono">
                              Ref: {{ inv.bookingNo }} | Hạn thanh toán: {{ inv.dueDate }}
                              @if (inv.paymentDate) {
                                | <span class="text-emerald-400">Đã trả: {{ inv.paymentDate }}</span>
                              }
                            </div>
                          </div>

                          <div class="flex items-center gap-4">
                            <div class="text-right">
                              <span class="text-slate-400 text-[11px] block">Số tiền:</span>
                              <span class="font-mono font-black text-base text-white">{{ formatVND(inv.amount) }}</span>
                            </div>

                            @if (inv.status === 'PENDING') {
                              <button 
                                (click)="openVietQrModal(inv)"
                                class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20"
                              >
                                <span>📱</span> QR Napas247
                              </button>
                            } @else {
                              <span class="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl">
                                <span>✓</span> Hoàn tất
                              </span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }

            }

          </div>

          <!-- BOTTOM / MOBILE NAVIGATION -->
          @if (isLoggedIn() && (activeDevice() === 'tablet' || activeDevice() === 'phone')) {
            <nav class="bg-slate-950/95 border-t border-slate-800 py-2 px-4 flex items-center justify-around sticky bottom-0 z-30">
              <button 
                (click)="setActiveStep(1)"
                [class.text-cyan-400]="activeStep() === 1"
                [class.text-slate-400]="activeStep() !== 1"
                class="flex flex-col items-center text-[10px] gap-1"
              >
                <span class="text-base">🚢</span> Lịch Tàu
              </button>
              <button 
                (click)="setActiveStep(2)"
                [class.text-cyan-400]="activeStep() === 2"
                [class.text-slate-400]="activeStep() !== 2"
                class="flex flex-col items-center text-[10px] gap-1"
              >
                <span class="text-base">📑</span> Booking
              </button>
              <button 
                (click)="setActiveStep(3)"
                [class.text-cyan-400]="activeStep() === 3"
                [class.text-slate-400]="activeStep() !== 3"
                class="flex flex-col items-center text-[10px] gap-1"
              >
                <span class="text-base">🚚</span> Shipment
              </button>
              <button 
                (click)="setActiveStep(4)"
                [class.text-cyan-400]="activeStep() === 4"
                [class.text-slate-400]="activeStep() !== 4"
                class="flex flex-col items-center text-[10px] gap-1"
              >
                <span class="text-base">💳</span> Công Nợ
              </button>
            </nav>
          }
        </div>
      </main>

      <!-- MODALS POPUPS -->
      @if (activeEquipmentReleaseBooking()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div class="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span class="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold uppercase">Chứng từ điện tử</span>
                <h3 class="text-lg font-black text-white mt-1">LỆNH CẤP VỎ CONTAINER ĐIỆN TỬ</h3>
                <div class="text-xs text-slate-400 font-mono">Mã số: {{ activeEquipmentReleaseBooking()?.bookingNo }}</div>
              </div>
              <button (click)="closeModals()" class="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <div class="space-y-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-slate-400 block text-[10px]">TÀU & CHUYẾN:</span>
                  <span class="font-bold text-white">{{ activeEquipmentReleaseBooking()?.vesselName }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">CẢNG HẠ BÃI:</span>
                  <span class="font-bold text-cyan-300">{{ activeEquipmentReleaseBooking()?.depotDropoff }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span class="text-slate-400 block text-[10px]">DEPOT CẤP VỎ:</span>
                  <span class="font-bold text-emerald-400">{{ activeEquipmentReleaseBooking()?.depotPickup }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">HẠN LẤY VỎ CONT:</span>
                  <span class="font-mono text-white">24 Giờ kể từ khi duyệt</span>
                </div>
              </div>

              <div class="pt-2 border-t border-slate-800">
                <span class="text-slate-400 block text-[10px]">QUY CÁCH CONTAINER CẤP:</span>
                <div class="font-bold text-white mt-0.5">
                  @for (c of activeEquipmentReleaseBooking()?.containers; track c.id) {
                    {{ c.quantity }} x Container {{ c.type }} (Tiêu chuẩn IICL/Cargo Worthy) &nbsp;
                  }
                </div>
              </div>

              <div class="pt-2 border-t border-slate-800">
                <span class="text-slate-400 block text-[10px]">ĐỊA CHỈ ĐÓNG HÀNG HP:</span>
                <div class="text-slate-300">{{ activeEquipmentReleaseBooking()?.pickupAddress }}</div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button 
                (click)="downloadMockPdf('Lệnh Cấp Vỏ Container')"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>📥</span> Tải PDF Lệnh
              </button>
              <button 
                (click)="closeModals()"
                class="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      }

      @if (activeSeaWaybillShipment()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div class="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span class="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold uppercase">Non-Negotiable e-Waybill</span>
                <h3 class="text-lg font-black text-white mt-1">VẬN ĐƠN BIỂN ĐIỆN TỬ (SEA WAYBILL)</h3>
                <div class="text-xs text-slate-400 font-mono">B/L No: SWB-{{ activeSeaWaybillShipment()?.shipmentNo }}</div>
              </div>
              <button (click)="closeModals()" class="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <div class="space-y-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-slate-400 block text-[10px]">NGƯỜI GỬI (SHIPPER):</span>
                  <span class="font-bold text-white">{{ customerName() }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">NGƯỜI NHẬN (CONSIGNEE):</span>
                  <span class="font-bold text-white">Theo Lệnh Người Gửi (To Order)</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span class="text-slate-400 block text-[10px]">TÀU & CHUYẾN BIỂN:</span>
                  <span class="font-semibold text-white">{{ activeSeaWaybillShipment()?.vesselName }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">CẢNG XẾP / DỠ:</span>
                  <span class="text-cyan-300 font-semibold">Hải Phòng ➔ Cát Lái (HCM)</span>
                </div>
              </div>

              <div class="pt-2 border-t border-slate-800">
                <span class="text-slate-400 block text-[10px]">SỐ CONTAINER & KẸP CHÌ:</span>
                <div class="font-mono font-bold text-white mt-0.5">
                  {{ activeSeaWaybillShipment()?.containerNo }} / Seal: {{ activeSeaWaybillShipment()?.sealNo }} ({{ activeSeaWaybillShipment()?.containerType }})
                </div>
              </div>

              <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Chữ ký số điện tử: <strong class="text-emerald-400">Đã Ký Xác Nhận (e-Signed)</strong></span>
                <span class="font-mono">FREIGHT PREPAID</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button 
                (click)="downloadMockPdf('Sea Waybill')"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>📥</span> Tải Vận Đơn Gốc
              </button>
              <button 
                (click)="closeModals()"
                class="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      }

      @if (activeEirShipment()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div class="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span class="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold uppercase">e-EIR</span>
                <h3 class="text-lg font-black text-white mt-1">PHIẾU GIAO NHẬN CONTAINER (EIR)</h3>
                <div class="text-xs text-slate-400 font-mono">Phiếu EIR: EIR-{{ activeEirShipment()?.containerNo }}</div>
              </div>
              <button (click)="closeModals()" class="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <div class="space-y-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-slate-400 block text-[10px]">SỐ CONTAINER:</span>
                  <span class="font-mono font-bold text-white">{{ activeEirShipment()?.containerNo }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">TÌNH TRẠNG VỎ:</span>
                  <span class="font-bold text-emerald-400">Sạch, kín sáng, đạt chuẩn IICL</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span class="text-slate-400 block text-[10px]">TÀI XẾ NHẬN:</span>
                  <span class="font-semibold text-white">{{ activeEirShipment()?.driverName }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">ĐẦU KÉO / RƠ-MOÓC:</span>
                  <span class="font-mono text-cyan-300">{{ activeEirShipment()?.tractorPlate }} / {{ activeEirShipment()?.trailerPlate }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button 
                (click)="downloadMockPdf('Phiếu EIR')"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>📥</span> Tải Phiếu EIR
              </button>
              <button 
                (click)="closeModals()"
                class="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      }

      @if (activeQrInvoice()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div class="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span class="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Napas 247</span>
                <h3 class="text-lg font-black text-white mt-1">CỔNG THANH TOÁN VIETQR</h3>
                <div class="text-xs text-slate-400 font-mono">Hóa đơn: {{ activeQrInvoice()?.invoiceNo }}</div>
              </div>
              <button (click)="closeModals()" class="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <div class="bg-white p-4 rounded-2xl text-center space-y-2 text-slate-900">
              <div class="flex items-center justify-between text-xs font-bold text-blue-900 border-b pb-2">
                <span>VIETCOMBANK ● NAPAS 247</span>
                <span class="text-emerald-700 font-black">QUICK RESPONSE</span>
              </div>

              <div class="w-48 h-48 mx-auto bg-slate-100 border border-slate-300 rounded-xl flex flex-col items-center justify-center p-2">
                <svg viewBox="0 0 100 100" class="w-full h-full text-slate-900">
                  <path fill="currentColor" d="M10 10h24v24H10zm4 4v16h16V14zm2 2h12v12H16zm50-6h24v24H66zm4 4v16h16V14zm2 2h12v12H72zM10 66h24v24H10zm4 4v16h16V70zm2 2h12v12H16zm30-56h6v6h-6zm10 0h6v6h-6zm-10 10h6v6h-6zm10 0h6v6h-6zm-20 20h6v6h-6zm10 0h6v6h-6zm20 0h6v6h-6zm-30 10h6v6h-6zm10 0h6v6h-6zm20 0h6v6h-6zm-30 10h6v6h-6zm10 0h6v6h-6zm20 0h6v6h-6zm-10 10h6v6h-6zm10 0h6v6h-6zm-20 10h6v6h-6zm10 0h6v6h-6zm10 0h6v6h-6z" />
                </svg>
                <span class="text-[9px] font-bold text-slate-500 uppercase mt-1">Quét mã bằng App Ngân Hàng</span>
              </div>

              <div class="text-xs space-y-1 font-mono pt-1 text-slate-700">
                <div>STK: <strong class="text-slate-900 text-sm">0071000998822</strong></div>
                <div>Chủ TK: <strong class="text-slate-900">FCL LOGISTICS VIETNAM JSC</strong></div>
                <div>Số tiền: <strong class="text-rose-600 text-sm">{{ formatVND(activeQrInvoice()!.amount) }}</strong></div>
                <div class="text-[10px] bg-slate-100 p-1 rounded border">Cú pháp: {{ activeQrInvoice()?.invoiceNo }} MINH PHAT</div>
              </div>
            </div>

            <div class="pt-2 flex flex-col gap-2">
              <button 
                (click)="confirmPayment(activeQrInvoice()!)"
                class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition active:scale-[0.98] shadow-lg shadow-emerald-500/20"
              >
                ✓ Xác Nhận Đã Chuyển Khoản (Gạch Nợ Tức Thì)
              </button>
              <button 
                (click)="closeModals()"
                class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl text-xs transition"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ============================================== -->
      <!-- MODAL THÊM / SỬA / COPY VOYAGE -->
      <!-- ============================================== -->
      @if (voyageModalMode()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <!-- Modal Header -->
            <div class="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span class="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold uppercase">
                  {{ voyageModalMode() === 'CREATE' ? 'Tạo mới' : voyageModalMode() === 'EDIT' ? 'Chỉnh sửa' : 'Nhân bản' }}
                </span>
                <h3 class="text-base sm:text-lg font-black text-white mt-1">
                  @if (voyageModalMode() === 'CREATE') { <span>➕ THÊM CHUYẾN TÀU MỚI (CREATE VOYAGE)</span> }
                  @if (voyageModalMode() === 'EDIT') { <span>✏️ CẬP NHẬT CHUYẾN TÀU (EDIT VOYAGE)</span> }
                  @if (voyageModalMode() === 'COPY') { <span>📋 SAO CHÉP CHUYẾN TÀU (COPY VOYAGE)</span> }
                </h3>
                <p class="text-xs text-slate-400">
                  Form tự động liên kết danh mục đối chiếu (ID cảng, tàu, hãng tàu & người tạo)
                </p>
              </div>
              <button 
                type="button"
                (click)="closeVoyageModal()" 
                class="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <!-- Form Content Grid -->
            <div class="space-y-4 text-xs max-h-[68vh] overflow-y-auto pr-1">
              
              <!-- Cảnh báo trùng lặp chuyến tàu nếu đã tồn tại -->
              @if (isFormDuplicate()) {
                <div class="p-3 bg-amber-950/80 border border-amber-500/80 rounded-2xl text-amber-200 text-xs flex items-start gap-2.5 shadow-lg">
                  <span class="text-base mt-0.5">⚠️</span>
                  <div class="space-y-0.5">
                    <div class="font-bold text-amber-300">Phát hiện chuyến tàu trùng lặp (Duplicate)</div>
                    <div class="text-[11px] text-amber-200/90 leading-tight">
                      Cấu hình chuyến này đã tồn tại trong danh sách duplicate: 
                      <span class="font-mono font-bold text-amber-100 bg-amber-900/60 px-1.5 py-0.5 rounded">
                        '{{ currentFormDuplicateKey() }}'
                      </span>. Vui lòng kiểm tra lại số chuyến hoặc bến cảng.
                    </div>
                  </div>
                </div>
              }

              <!-- Hàng 1: Hãng tàu & Tên tàu (Autocomplete) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Hãng tàu (Supplier) -->
                <div class="relative">
                  <div class="flex items-center justify-between mb-1">
                    <label class="font-bold text-slate-300 uppercase text-[11px]">Hãng Tàu (Supplier) *</label>
                    @if (formSupplierId()) {
                      <span class="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                        ID: {{ formSupplierId() }}
                      </span>
                    }
                  </div>
                  <div class="relative">
                    <input 
                      type="text" 
                      [value]="formSupplierName()"
                      (input)="formSupplierName.set($any($event.target).value)"
                      (focus)="activeAutocomplete.set('supplier')"
                      placeholder="Gõ tìm hãng tàu (VD: Hải An, VOSCO...)"
                      class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 pr-7"
                    />
                    <button 
                      type="button" 
                      (click)="toggleAutocomplete('supplier')"
                      class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                    >
                      ▼
                    </button>
                  </div>
                  @if (activeAutocomplete() === 'supplier') {
                    <div class="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-800">
                      @for (s of filteredSuppliers(); track s.id) {
                        <button 
                          type="button"
                          (click)="selectSupplierItem(s)"
                          class="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-cyan-300"
                        >
                          <div>
                            <div class="font-bold">{{ s.name }}</div>
                            @if (s.code) { <span class="text-[10px] text-slate-400 font-mono">{{ s.code }}</span> }
                          </div>
                          <span class="text-[10px] font-mono text-cyan-400 font-bold">#{{ s.id }}</span>
                        </button>
                      } @empty {
                        <div class="p-3 text-center text-xs text-slate-500">Không tìm thấy hãng tàu</div>
                      }
                    </div>
                  }
                </div>

                <!-- Tên tàu (Vessel) -->
                <div class="relative">
                  <div class="flex items-center justify-between mb-1">
                    <label class="font-bold text-slate-300 uppercase text-[11px]">Tên Tàu (Vessel) *</label>
                    @if (formVesselId()) {
                      <span class="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                        ID: {{ formVesselId() }}
                      </span>
                    }
                  </div>
                  <div class="relative">
                    <input 
                      type="text" 
                      [value]="formVesselName()"
                      (input)="formVesselName.set($any($event.target).value)"
                      (focus)="activeAutocomplete.set('vessel')"
                      placeholder="Gõ tìm tàu (VD: HAIAN PARK...)"
                      class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 pr-7"
                    />
                    <button 
                      type="button" 
                      (click)="toggleAutocomplete('vessel')"
                      class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                    >
                      ▼
                    </button>
                  </div>
                  @if (activeAutocomplete() === 'vessel') {
                    <div class="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-800">
                      @for (v of filteredVessels(); track v.id) {
                        <button 
                          type="button"
                          (click)="selectVesselItem(v)"
                          class="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-cyan-300"
                        >
                          <div>
                            <div class="font-bold">{{ v.name }}</div>
                            @if (v.operator) { <span class="text-[10px] text-slate-400 font-mono">{{ v.operator }}</span> }
                          </div>
                          <span class="text-[10px] font-mono text-cyan-400 font-bold">#{{ v.id }}</span>
                        </button>
                      } @empty {
                        <div class="p-3 text-center text-xs text-slate-500">Không tìm thấy tàu biển</div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Hàng 2: Số chuyến & Người cập nhật -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Số chuyến (Voyage Name - Autocomplete) -->
                <div class="relative">
                  <div class="flex items-center justify-between mb-1">
                    <label class="font-bold text-slate-300 uppercase text-[11px]">Số Chuyến (Voyage Name) *</label>
                    @if (formVoyageName()) {
                      <span class="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                        {{ formVoyageName() }}
                      </span>
                    }
                  </div>
                  <div class="relative">
                    <input 
                      type="text" 
                      [value]="formVoyageName()"
                      (input)="formVoyageName.set($any($event.target).value)"
                      (focus)="activeAutocomplete.set('voyageName')"
                      placeholder="Gõ số chuyến (VD: V.2608S, V.1202S...)"
                      class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500 pr-7"
                    />
                    <button 
                      type="button" 
                      (click)="toggleAutocomplete('voyageName')"
                      class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                      title="Xem danh sách gợi ý số chuyến"
                    >
                      ▼
                    </button>
                  </div>
                  @if (activeAutocomplete() === 'voyageName') {
                    <div class="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-800">
                      @for (name of filteredVoyageSuggestions(); track name) {
                        <button 
                          type="button"
                          (click)="selectVoyageNameItem(name)"
                          class="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-cyan-300"
                        >
                          <span class="font-mono font-bold">{{ name }}</span>
                          <span class="text-[10px] text-slate-400">Gợi ý chuyến</span>
                        </button>
                      } @empty {
                        <div class="p-3 text-center text-xs text-slate-500">Chưa có gợi ý chuyến, bạn có thể tự nhập</div>
                      }
                    </div>
                  }
                </div>

                <!-- Người cập nhật (Update by) -->
                <div class="relative">
                  <div class="flex items-center justify-between mb-1">
                    <label class="font-bold text-slate-300 uppercase text-[11px]">Người Cập Nhật *</label>
                    <span class="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                      ID: {{ formUpdateById() }}
                    </span>
                  </div>
                  <div class="relative">
                    <input 
                      type="text" 
                      [value]="formUpdateByName()"
                      (input)="formUpdateByName.set($any($event.target).value)"
                      (focus)="activeAutocomplete.set('updateBy')"
                      placeholder="Chọn người cập nhật"
                      class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 pr-7"
                    />
                    <button 
                      type="button" 
                      (click)="toggleAutocomplete('updateBy')"
                      class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                    >
                      ▼
                    </button>
                  </div>
                  @if (activeAutocomplete() === 'updateBy') {
                    <div class="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-800">
                      @for (u of filteredUsers(); track u.id) {
                        <button 
                          type="button"
                          (click)="selectUserItem(u)"
                          class="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-cyan-300"
                        >
                          <span class="font-bold">{{ u.name }}</span>
                          <span class="text-[10px] font-mono text-cyan-400 font-bold">#{{ u.id }}</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Hàng 3: Cảng Xếp & Bến Xếp (POL & Terminal) -->
              <div class="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <span class="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  📍 Cảng & Bến Bốc Hàng (Port of Loading - POL)
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Cảng xếp (Load Port) -->
                  <div class="relative">
                    <div class="flex items-center justify-between mb-1">
                      <label class="font-semibold text-slate-300 text-[11px]">Cảng Xếp *</label>
                      @if (formLoadPortId()) {
                        <span class="text-[10px] font-mono text-cyan-400 font-bold">ID: {{ formLoadPortId() }}</span>
                      }
                    </div>
                    <div class="relative">
                      <input 
                        type="text" 
                        [value]="formLoadPortName()"
                        (input)="formLoadPortName.set($any($event.target).value)"
                        (focus)="activeAutocomplete.set('loadPort')"
                        placeholder="Chọn cảng xếp (Hải Phòng...)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 pr-7"
                      />
                      <button 
                        type="button" 
                        (click)="toggleAutocomplete('loadPort')"
                        class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                      >
                        ▼
                      </button>
                    </div>
                    @if (activeAutocomplete() === 'loadPort') {
                      <div class="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-44 overflow-y-auto z-50 divide-y divide-slate-800">
                        @for (p of filteredLoadPorts(); track p.id) {
                          <button 
                            type="button"
                            (click)="selectLoadPortItem(p)"
                            class="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-cyan-300"
                          >
                            <span>{{ p.name }}</span>
                            <span class="text-[10px] font-mono text-cyan-400 font-bold">#{{ p.id }}</span>
                          </button>
                        }
                      </div>
                    }
                  </div>

                  <!-- Bến xếp (Load Terminal) -->
                  <div class="relative">
                    <div class="flex items-center justify-between mb-1">
                      <label class="font-semibold text-slate-300 text-[11px]">Bến Cảng Xếp (Terminal) *</label>
                      @if (formLoadTerminalId()) {
                        <span class="text-[10px] font-mono text-cyan-400 font-bold">ID: {{ formLoadTerminalId() }}</span>
                      }
                    </div>
                    <div class="relative">
                      <input 
                        type="text" 
                        [value]="formLoadTerminalName()"
                        (input)="formLoadTerminalName.set($any($event.target).value)"
                        (focus)="activeAutocomplete.set('loadTerminal')"
                        placeholder="Chọn bến cảng xếp (Đình Vũ, Tân Vũ...)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 pr-7"
                      />
                      <button 
                        type="button" 
                        (click)="toggleAutocomplete('loadTerminal')"
                        class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                      >
                        ▼
                      </button>
                    </div>
                    @if (activeAutocomplete() === 'loadTerminal') {
                      <div class="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-44 overflow-y-auto z-50 divide-y divide-slate-800">
                        @for (t of filteredLoadTerminals(); track t.id) {
                          <button 
                            type="button"
                            (click)="selectLoadTerminalItem(t)"
                            class="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-cyan-300"
                          >
                            <span>{{ t.name }}</span>
                            <span class="text-[10px] font-mono text-cyan-400 font-bold">#{{ t.id }}</span>
                          </button>
                        } @empty {
                          <div class="p-3 text-center text-xs text-slate-500">Chưa có bến cảng phù hợp</div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Hàng 4: Cảng Dỡ & Bến Dỡ (POD & Terminal) -->
              <div class="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <span class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  🎯 Cảng & Bến Dỡ Hàng (Port of Discharge - POD)
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Cảng dỡ (Discharge Port) -->
                  <div class="relative">
                    <div class="flex items-center justify-between mb-1">
                      <label class="font-semibold text-slate-300 text-[11px]">Cảng Dỡ *</label>
                      @if (formDischargePortId()) {
                        <span class="text-[10px] font-mono text-emerald-400 font-bold">ID: {{ formDischargePortId() }}</span>
                      }
                    </div>
                    <div class="relative">
                      <input 
                        type="text" 
                        [value]="formDischargePortName()"
                        (input)="formDischargePortName.set($any($event.target).value)"
                        (focus)="activeAutocomplete.set('dischargePort')"
                        placeholder="Chọn cảng dỡ (TP.HCM...)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 pr-7"
                      />
                      <button 
                        type="button" 
                        (click)="toggleAutocomplete('dischargePort')"
                        class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                      >
                        ▼
                      </button>
                    </div>
                    @if (activeAutocomplete() === 'dischargePort') {
                      <div class="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-44 overflow-y-auto z-50 divide-y divide-slate-800">
                        @for (p of filteredDischargePorts(); track p.id) {
                          <button 
                            type="button"
                            (click)="selectDischargePortItem(p)"
                            class="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-cyan-300"
                          >
                            <span>{{ p.name }}</span>
                            <span class="text-[10px] font-mono text-emerald-400 font-bold">#{{ p.id }}</span>
                          </button>
                        }
                      </div>
                    }
                  </div>

                  <!-- Bến dỡ (Discharge Terminal) -->
                  <div class="relative">
                    <div class="flex items-center justify-between mb-1">
                      <label class="font-semibold text-slate-300 text-[11px]">Bến Cảng Dỡ (Terminal) *</label>
                      @if (formDischargeTerminalId()) {
                        <span class="text-[10px] font-mono text-emerald-400 font-bold">ID: {{ formDischargeTerminalId() }}</span>
                      }
                    </div>
                    <div class="relative">
                      <input 
                        type="text" 
                        [value]="formDischargeTerminalName()"
                        (input)="formDischargeTerminalName.set($any($event.target).value)"
                        (focus)="activeAutocomplete.set('dischargeTerminal')"
                        placeholder="Chọn bến cảng dỡ (Cát Lái, VICT...)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 pr-7"
                      />
                      <button 
                        type="button" 
                        (click)="toggleAutocomplete('dischargeTerminal')"
                        class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                      >
                        ▼
                      </button>
                    </div>
                    @if (activeAutocomplete() === 'dischargeTerminal') {
                      <div class="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-44 overflow-y-auto z-50 divide-y divide-slate-800">
                        @for (t of filteredDischargeTerminals(); track t.id) {
                          <button 
                            type="button"
                            (click)="selectDischargeTerminalItem(t)"
                            class="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition flex items-center justify-between text-slate-200 hover:text-cyan-300"
                          >
                            <span>{{ t.name }}</span>
                            <span class="text-[10px] font-mono text-emerald-400 font-bold">#{{ t.id }}</span>
                          </button>
                        } @empty {
                          <div class="p-3 text-center text-xs text-slate-500">Chưa có bến cảng phù hợp</div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Hàng 5, 6, 7: Các mốc thời gian có Date Picker & Time Picker -->
              <div class="space-y-3 pt-1">
                <!-- 1. Depart Time (Khởi hành) -->
                <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="font-bold text-amber-300 text-[11px] uppercase">
                      ⏱️ Thời Gian Khởi Hành (Depart Time - ETD) *
                    </label>
                    <span class="text-[10px] font-mono text-slate-400">
                      Kết hợp: <strong class="text-amber-300">{{ formDepartDate() }} {{ formDepartTime() }}</strong>
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <span class="text-[10px] text-slate-400 block mb-0.5">Chọn Ngày (Date):</span>
                      <input 
                        type="date" 
                        [value]="formDepartDate()"
                        (input)="formDepartDate.set($any($event.target).value)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <span class="text-[10px] text-slate-400 block mb-0.5">Chọn Giờ (Time):</span>
                      <input 
                        type="time" 
                        [value]="formDepartTime()"
                        (input)="formDepartTime.set($any($event.target).value)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <!-- 2. Closing Time (Hạn hạ bãi / Cutoff) -->
                <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="font-bold text-rose-300 text-[11px] uppercase">
                      🔒 Thời Gian Đóng Sổ (Closing Time / Cut-off) *
                    </label>
                    <span class="text-[10px] font-mono text-slate-400">
                      Kết hợp: <strong class="text-rose-300">{{ formClosingDate() }} {{ formClosingTime() }}</strong>
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <span class="text-[10px] text-slate-400 block mb-0.5">Chọn Ngày (Date):</span>
                      <input 
                        type="date" 
                        [value]="formClosingDate()"
                        (input)="formClosingDate.set($any($event.target).value)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <span class="text-[10px] text-slate-400 block mb-0.5">Chọn Giờ (Time):</span>
                      <input 
                        type="time" 
                        [value]="formClosingTime()"
                        (input)="formClosingTime.set($any($event.target).value)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <!-- 3. Arrive Time (Cập cảng) -->
                <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="font-bold text-emerald-300 text-[11px] uppercase">
                      ⚓ Thời Gian Cập Cảng (Arrive Time - ETA) *
                    </label>
                    <span class="text-[10px] font-mono text-slate-400">
                      Kết hợp: <strong class="text-emerald-300">{{ formArriveDate() }} {{ formArriveTime() }}</strong>
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <span class="text-[10px] text-slate-400 block mb-0.5">Chọn Ngày (Date):</span>
                      <input 
                        type="date" 
                        [value]="formArriveDate()"
                        (input)="formArriveDate.set($any($event.target).value)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <span class="text-[10px] text-slate-400 block mb-0.5">Chọn Giờ (Time):</span>
                      <input 
                        type="time" 
                        [value]="formArriveTime()"
                        (input)="formArriveTime.set($any($event.target).value)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Modal Actions -->
            <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button 
                type="button"
                (click)="closeVoyageModal()"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Hủy Bỏ
              </button>
              <button 
                type="button"
                (click)="saveVoyage()"
                [disabled]="isSavingVoyage()"
                class="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                @if (isSavingVoyage()) {
                  <span class="animate-spin">🔄</span>
                  <span>Đang lưu...</span>
                } @else {
                  <span>💾</span>
                  <span>Lưu Chuyến Tàu</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ============================================== -->
      <!-- MODAL XÁC NHẬN XÓA VOYAGE -->
      <!-- ============================================== -->
      @if (voyageToDelete()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div class="bg-slate-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-700 flex items-center justify-center text-2xl text-rose-400 mx-auto">
              ⚠️
            </div>
            
            <div class="text-center">
              <h3 class="text-base font-black text-white uppercase tracking-wide">Xác Nhận Xóa Chuyến Tàu</h3>
              <p class="text-xs text-slate-400 mt-1">
                Bạn có chắc chắn muốn xóa chuyến tàu này khỏi lịch vận chuyển?
              </p>
            </div>

            <div class="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5">
              <div class="flex justify-between">
                <span class="text-slate-400">Tên Tàu & Chuyến:</span>
                <span class="font-bold text-white">{{ voyageToDelete()?.vessel_name }} ({{ voyageToDelete()?.voyage_name }})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Hãng Tàu:</span>
                <span class="text-cyan-300 font-semibold">{{ voyageToDelete()?.supplier_name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Tuyến Hành Trình:</span>
                <span class="text-slate-200">{{ voyageToDelete()?.load_port_name }} ➔ {{ voyageToDelete()?.discharge_port_name }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5 pt-2">
              <button 
                type="button"
                (click)="voyageToDelete.set(null)"
                class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
              >
                Hủy Bỏ
              </button>
              <button 
                type="button"
                (click)="confirmDeleteVoyage()"
                class="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-rose-600/30"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class AppComponent implements OnInit {
  // Authentication State: MẶC ĐỊNH LÀ FALSE ĐỂ NGƯỜI DÙNG PHẢI ĐĂNG NHẬP
  isLoggedIn = signal<boolean>(false);
  authTab = signal<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  customerName = signal<string>('Cty Vận Tải Minh Phát ● VIP');
  loginEmail = signal<string>('acc@dnlogis.vn');
  loginPassword = signal<string>('123456');

  activeDevice = signal<'pc' | 'tablet' | 'phone'>('pc');
  activeStep = signal<number>(1);

  // Booking & Shipment State
  selectedVesselForBooking = signal<VesselSchedule | null>(null);
  pickupAddress = signal<string>('Kho số 3, KCN Nomura, An Dương, Hải Phòng');
  pickupDateTime = signal<string>('2026-10-15T08:00');
  pickupNote = signal<string>('Đóng pallet tiêu chuẩn xuất khẩu, tài xế liên hệ anh Thắng 0912.333.444');
  deliveryAddress = signal<string>('Tổng kho Logistics Cát Lái, P. Cát Lái, TP. Thủ Đức, TP.HCM');
  deliveryDateTime = signal<string>('2026-10-18T14:00');
  deliveryNote = signal<string>('Giao ban ngày, kho có cầu nâng và xe nâng 3 tấn');
  commodityName = signal<string>('Hạt nhựa nguyên sinh PP');
  cargoWeightTon = signal<number>(20);

  dynamicContainers = signal<ContainerItem[]>([
    { id: 'c1', type: '20GP', quantity: 2 }
  ]);

  shipmentFilter = signal<'ALL' | 'LEG1' | 'LEG2' | 'LEG3'>('ALL');

  activeEquipmentReleaseBooking = signal<BookingRecord | null>(null);
  activeSeaWaybillShipment = signal<ShipmentRecord | null>(null);
  activeEirShipment = signal<ShipmentRecord | null>(null);
  activeQrInvoice = signal<InvoiceRecord | null>(null);

  toasts = signal<ToastMessage[]>([]);

  // ==========================================
  // MASTER DATA SIGNALS (TỪ API 1: /readFileToJson/data)
  // [0] vessels, [1] suppliers, [2] users, [3] seaports, [4] terminals
  // ==========================================
  masterVessels = signal<MasterVessel[]>([
    { id: 1, name: 'HAIAN PARK', operator: 'HATS' },
    { id: 2, name: 'HAIAN TIME', operator: 'HATS' },
    { id: 3, name: 'VOSCO STAR', operator: 'VOSCO' },
    { id: 4, name: 'DONG NAI STAR', operator: 'VIMC' },
    { id: 5, name: 'PACIFIC GRACE', operator: 'GLS' },
    { id: 6, name: 'TÂN CẢNG GLORY', operator: 'TCS' }
  ]);

  masterSuppliers = signal<MasterSupplier[]>([
    { id: 1, name: 'Cty CP Vận Tải Hải An (HATS)', code: 'HATS' },
    { id: 2, name: 'Công Ty CP Vận Tải Biển Việt Nam (VOSCO)', code: 'VOSCO' },
    { id: 3, name: 'Tổng Công Ty Hàng Hải VN (VIMC)', code: 'VIMC' },
    { id: 4, name: 'Tân Cảng Shipping (TCS)', code: 'TCS' },
    { id: 5, name: 'GLS Shipping Lines', code: 'GLS' }
  ]);

  masterUsers = signal<MasterUser[]>([
    { id: 15, name: 'Albert Long' },
    { id: 22, name: 'Trần Minh Phát' },
    { id: 30, name: 'Nguyễn Thu Trang' },
    { id: 44, name: 'Đỗ Mạnh Cường' }
  ]);

  masterSeaports = signal<MasterSeaport[]>([
    { id: 1, name: 'Hải Phòng', code: 'VNHPH' },
    { id: 2, name: 'TP. Hồ Chí Minh', code: 'VNSGN' },
    { id: 3, name: 'Đà Nẵng', code: 'VNDAD' },
    { id: 4, name: 'Quy Nhơn', code: 'VNUIH' }
  ]);

  masterTerminals = signal<MasterTerminal[]>([
    { id: 101, name: 'Cảng Tân Vũ (Hải Phòng)', seaport_id: 1 },
    { id: 102, name: 'Cảng Đình Vũ (Hải Phòng)', seaport_id: 1 },
    { id: 103, name: 'Cảng Nam Hải Đình Vũ (Hải Phòng)', seaport_id: 1 },
    { id: 104, name: 'Cảng VIP Green Port (Hải Phòng)', seaport_id: 1 },
    { id: 201, name: 'Tân Cảng Cát Lái (TP.HCM)', seaport_id: 2 },
    { id: 202, name: 'Cảng VICT Sài Gòn (TP.HCM)', seaport_id: 2 },
    { id: 203, name: 'Cảng SP-ITC (TP.HCM)', seaport_id: 2 },
    { id: 204, name: 'Tân Cảng Hiệp Phước (TP.HCM)', seaport_id: 2 }
  ]);

  // ==========================================
  // VOYAGE MANAGEMENT SIGNALS (TỪ API 2: /sel/voyage/all)
  // ==========================================
  apiVoyages = signal<ApiVoyageItem[]>([
    {
      id: 'voy_101',
      supplier_id: 1,
      supplier_name: 'Cty CP Vận Tải Hải An (HATS)',
      vessel_id: 1,
      vessel_name: 'HAIAN PARK',
      voyage_name: 'V.2608S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 102,
      load_terminal_name: 'Cảng Đình Vũ (Hải Phòng)',
      depart_time: '2026-10-18 22:00',
      closing_time: '2026-10-18 12:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-10-21 10:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_102',
      supplier_id: 2,
      supplier_name: 'Công Ty CP Vận Tải Biển Việt Nam (VOSCO)',
      vessel_id: 3,
      vessel_name: 'VOSCO STAR',
      voyage_name: 'V.1202S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 101,
      load_terminal_name: 'Cảng Tân Vũ (Hải Phòng)',
      depart_time: '2026-10-19 06:00',
      closing_time: '2026-10-18 18:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 202,
      discharge_terminal_name: 'Cảng VICT Sài Gòn (TP.HCM)',
      arrive_time: '2026-10-21 18:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_103',
      supplier_id: 3,
      supplier_name: 'Tổng Công Ty Hàng Hải VN (VIMC)',
      vessel_id: 4,
      vessel_name: 'DONG NAI STAR',
      voyage_name: 'V.0991S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 103,
      load_terminal_name: 'Cảng Nam Hải Đình Vũ (Hải Phòng)',
      depart_time: '2026-10-20 14:00',
      closing_time: '2026-10-20 04:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-10-23 02:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'CLOSING_SOON'
    },
    {
      id: 'voy_104',
      supplier_id: 4,
      supplier_name: 'Tân Cảng Shipping (TCS)',
      vessel_id: 6,
      vessel_name: 'TÂN CẢNG GLORY',
      voyage_name: 'TC.2410S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 104,
      load_terminal_name: 'Cảng VIP Green Port (Hải Phòng)',
      depart_time: '2026-10-21 08:00',
      closing_time: '2026-10-20 20:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-10-23 20:00',
      update_by_id: 22,
      update_by_name: 'Trần Minh Phát',
      status: 'OPEN'
    },
    {
      id: 'voy_105',
      supplier_id: 1,
      supplier_name: 'Cty CP Vận Tải Hải An (HATS)',
      vessel_id: 2,
      vessel_name: 'HAIAN TIME',
      voyage_name: 'V.2609S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 102,
      load_terminal_name: 'Cảng Đình Vũ (Hải Phòng)',
      depart_time: '2026-10-22 18:00',
      closing_time: '2026-10-22 08:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 203,
      discharge_terminal_name: 'Cảng SP-ITC (TP.HCM)',
      arrive_time: '2026-10-25 06:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_106',
      supplier_id: 5,
      supplier_name: 'GLS Shipping Lines',
      vessel_id: 5,
      vessel_name: 'PACIFIC GRACE',
      voyage_name: 'GLS.881S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 101,
      load_terminal_name: 'Cảng Tân Vũ (Hải Phòng)',
      depart_time: '2026-10-23 12:00',
      closing_time: '2026-10-23 02:00',
      discharge_port_id: 3,
      discharge_port_name: 'Đà Nẵng',
      discharge_terminal_id: 101,
      discharge_terminal_name: 'Cảng Tiên Sa',
      arrive_time: '2026-10-24 16:00',
      update_by_id: 30,
      update_by_name: 'Nguyễn Thu Trang',
      status: 'OPEN'
    },
    {
      id: 'voy_107',
      supplier_id: 1,
      supplier_name: 'Cty CP Vận Tải Hải An (HATS)',
      vessel_id: 1,
      vessel_name: 'HAIAN PARK',
      voyage_name: 'V.2610N',
      load_port_id: 2,
      load_port_name: 'TP. Hồ Chí Minh',
      load_terminal_id: 201,
      load_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      depart_time: '2026-10-24 10:00',
      closing_time: '2026-10-23 22:00',
      discharge_port_id: 1,
      discharge_port_name: 'Hải Phòng',
      discharge_terminal_id: 102,
      discharge_terminal_name: 'Cảng Đình Vũ (Hải Phòng)',
      arrive_time: '2026-10-27 00:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_108',
      supplier_id: 2,
      supplier_name: 'Công Ty CP Vận Tải Biển Việt Nam (VOSCO)',
      vessel_id: 3,
      vessel_name: 'VOSCO STAR',
      voyage_name: 'V.1203N',
      load_port_id: 2,
      load_port_name: 'TP. Hồ Chí Minh',
      load_terminal_id: 202,
      load_terminal_name: 'Cảng VICT Sài Gòn (TP.HCM)',
      depart_time: '2026-10-25 15:00',
      closing_time: '2026-10-25 03:00',
      discharge_port_id: 1,
      discharge_port_name: 'Hải Phòng',
      discharge_terminal_id: 101,
      discharge_terminal_name: 'Cảng Tân Vũ (Hải Phòng)',
      arrive_time: '2026-10-28 05:00',
      update_by_id: 44,
      update_by_name: 'Đỗ Mạnh Cường',
      status: 'OPEN'
    },
    {
      id: 'voy_109',
      supplier_id: 4,
      supplier_name: 'Tân Cảng Shipping (TCS)',
      vessel_id: 6,
      vessel_name: 'TÂN CẢNG GLORY',
      voyage_name: 'TC.2411N',
      load_port_id: 2,
      load_port_name: 'TP. Hồ Chí Minh',
      load_terminal_id: 204,
      load_terminal_name: 'Tân Cảng Hiệp Phước (TP.HCM)',
      depart_time: '2026-10-26 20:00',
      closing_time: '2026-10-26 10:00',
      discharge_port_id: 4,
      discharge_port_name: 'Quy Nhơn',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Cảng Quy Nhơn',
      arrive_time: '2026-10-28 08:00',
      update_by_id: 22,
      update_by_name: 'Trần Minh Phát',
      status: 'OPEN'
    },
    {
      id: 'voy_110',
      supplier_id: 3,
      supplier_name: 'Tổng Công Ty Hàng Hải VN (VIMC)',
      vessel_id: 4,
      vessel_name: 'DONG NAI STAR',
      voyage_name: 'V.0992N',
      load_port_id: 2,
      load_port_name: 'TP. Hồ Chí Minh',
      load_terminal_id: 201,
      load_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      depart_time: '2026-10-27 16:00',
      closing_time: '2026-10-27 06:00',
      discharge_port_id: 1,
      discharge_port_name: 'Hải Phòng',
      discharge_terminal_id: 103,
      discharge_terminal_name: 'Cảng Nam Hải Đình Vũ (Hải Phòng)',
      arrive_time: '2026-10-30 04:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_111',
      supplier_id: 1,
      supplier_name: 'Cty CP Vận Tải Hải An (HATS)',
      vessel_id: 2,
      vessel_name: 'HAIAN TIME',
      voyage_name: 'V.2611N',
      load_port_id: 2,
      load_port_name: 'TP. Hồ Chí Minh',
      load_terminal_id: 201,
      load_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      depart_time: '2026-10-28 22:00',
      closing_time: '2026-10-28 12:00',
      discharge_port_id: 3,
      discharge_port_name: 'Đà Nẵng',
      discharge_terminal_id: 101,
      discharge_terminal_name: 'Cảng Tiên Sa',
      arrive_time: '2026-10-30 14:00',
      update_by_id: 30,
      update_by_name: 'Nguyễn Thu Trang',
      status: 'OPEN'
    },
    {
      id: 'voy_112',
      supplier_id: 5,
      supplier_name: 'GLS Shipping Lines',
      vessel_id: 5,
      vessel_name: 'PACIFIC GRACE',
      voyage_name: 'GLS.882N',
      load_port_id: 3,
      load_port_name: 'Đà Nẵng',
      load_terminal_id: 101,
      load_terminal_name: 'Cảng Tiên Sa',
      depart_time: '2026-10-29 11:00',
      closing_time: '2026-10-29 01:00',
      discharge_port_id: 1,
      discharge_port_name: 'Hải Phòng',
      discharge_terminal_id: 101,
      discharge_terminal_name: 'Cảng Tân Vũ (Hải Phòng)',
      arrive_time: '2026-10-30 20:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_113',
      supplier_id: 1,
      supplier_name: 'Cty CP Vận Tải Hải An (HATS)',
      vessel_id: 1,
      vessel_name: 'HAIAN PARK',
      voyage_name: 'V.2612S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 102,
      load_terminal_name: 'Cảng Đình Vũ (Hải Phòng)',
      depart_time: '2026-10-30 18:00',
      closing_time: '2026-10-30 08:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-11-02 06:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_114',
      supplier_id: 2,
      supplier_name: 'Công Ty CP Vận Tải Biển Việt Nam (VOSCO)',
      vessel_id: 3,
      vessel_name: 'VOSCO STAR',
      voyage_name: 'V.1204S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 101,
      load_terminal_name: 'Cảng Tân Vũ (Hải Phòng)',
      depart_time: '2026-10-31 07:00',
      closing_time: '2026-10-30 21:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 202,
      discharge_terminal_name: 'Cảng VICT Sài Gòn (TP.HCM)',
      arrive_time: '2026-11-02 19:00',
      update_by_id: 44,
      update_by_name: 'Đỗ Mạnh Cường',
      status: 'OPEN'
    },
    {
      id: 'voy_115',
      supplier_id: 4,
      supplier_name: 'Tân Cảng Shipping (TCS)',
      vessel_id: 6,
      vessel_name: 'TÂN CẢNG GLORY',
      voyage_name: 'TC.2412S',
      load_port_id: 4,
      load_port_name: 'Quy Nhơn',
      load_terminal_id: 201,
      load_terminal_name: 'Cảng Quy Nhơn',
      depart_time: '2026-11-01 14:00',
      closing_time: '2026-11-01 04:00',
      discharge_port_id: 1,
      discharge_port_name: 'Hải Phòng',
      discharge_terminal_id: 104,
      discharge_terminal_name: 'Cảng VIP Green Port (Hải Phòng)',
      arrive_time: '2026-11-03 04:00',
      update_by_id: 22,
      update_by_name: 'Trần Minh Phát',
      status: 'OPEN'
    },
    {
      id: 'voy_116',
      supplier_id: 3,
      supplier_name: 'Tổng Công Ty Hàng Hải VN (VIMC)',
      vessel_id: 4,
      vessel_name: 'DONG NAI STAR',
      voyage_name: 'V.0993S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 103,
      load_terminal_name: 'Cảng Nam Hải Đình Vũ (Hải Phòng)',
      depart_time: '2026-11-02 20:00',
      closing_time: '2026-11-02 10:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-11-05 08:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_117',
      supplier_id: 1,
      supplier_name: 'Cty CP Vận Tải Hải An (HATS)',
      vessel_id: 2,
      vessel_name: 'HAIAN TIME',
      voyage_name: 'V.2612S',
      load_port_id: 3,
      load_port_name: 'Đà Nẵng',
      load_terminal_id: 101,
      load_terminal_name: 'Cảng Tiên Sa',
      depart_time: '2026-11-03 16:00',
      closing_time: '2026-11-03 06:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-11-05 10:00',
      update_by_id: 30,
      update_by_name: 'Nguyễn Thu Trang',
      status: 'OPEN'
    },
    {
      id: 'voy_118',
      supplier_id: 5,
      supplier_name: 'GLS Shipping Lines',
      vessel_id: 5,
      vessel_name: 'PACIFIC GRACE',
      voyage_name: 'GLS.883S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 101,
      load_terminal_name: 'Cảng Tân Vũ (Hải Phòng)',
      depart_time: '2026-11-04 12:00',
      closing_time: '2026-11-04 02:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 203,
      discharge_terminal_name: 'Cảng SP-ITC (TP.HCM)',
      arrive_time: '2026-11-07 00:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_119',
      supplier_id: 1,
      supplier_name: 'Cty CP Vận Tải Hải An (HATS)',
      vessel_id: 1,
      vessel_name: 'HAIAN PARK',
      voyage_name: 'V.2613S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 102,
      load_terminal_name: 'Cảng Đình Vũ (Hải Phòng)',
      depart_time: '2026-11-05 21:00',
      closing_time: '2026-11-05 11:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-11-08 09:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_120',
      supplier_id: 2,
      supplier_name: 'Công Ty CP Vận Tải Biển Việt Nam (VOSCO)',
      vessel_id: 3,
      vessel_name: 'VOSCO STAR',
      voyage_name: 'V.1205S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 101,
      load_terminal_name: 'Cảng Tân Vũ (Hải Phòng)',
      depart_time: '2026-11-06 08:00',
      closing_time: '2026-11-05 22:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 202,
      discharge_terminal_name: 'Cảng VICT Sài Gòn (TP.HCM)',
      arrive_time: '2026-11-08 20:00',
      update_by_id: 44,
      update_by_name: 'Đỗ Mạnh Cường',
      status: 'OPEN'
    },
    {
      id: 'voy_121',
      supplier_id: 4,
      supplier_name: 'Tân Cảng Shipping (TCS)',
      vessel_id: 6,
      vessel_name: 'TÂN CẢNG GLORY',
      voyage_name: 'TC.2413S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 104,
      load_terminal_name: 'Cảng VIP Green Port (Hải Phòng)',
      depart_time: '2026-11-07 15:00',
      closing_time: '2026-11-07 05:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-11-10 03:00',
      update_by_id: 22,
      update_by_name: 'Trần Minh Phát',
      status: 'OPEN'
    },
    {
      id: 'voy_122',
      supplier_id: 3,
      supplier_name: 'Tổng Công Ty Hàng Hải VN (VIMC)',
      vessel_id: 4,
      vessel_name: 'DONG NAI STAR',
      voyage_name: 'V.0994S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 103,
      load_terminal_name: 'Cảng Nam Hải Đình Vũ (Hải Phòng)',
      depart_time: '2026-11-08 17:00',
      closing_time: '2026-11-08 07:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-11-11 05:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_123',
      supplier_id: 1,
      supplier_name: 'Cty CP Vận Tải Hải An (HATS)',
      vessel_id: 2,
      vessel_name: 'HAIAN TIME',
      voyage_name: 'V.2613S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 102,
      load_terminal_name: 'Cảng Đình Vũ (Hải Phòng)',
      depart_time: '2026-11-09 23:00',
      closing_time: '2026-11-09 13:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-11-12 11:00',
      update_by_id: 30,
      update_by_name: 'Nguyễn Thu Trang',
      status: 'OPEN'
    },
    {
      id: 'voy_124',
      supplier_id: 5,
      supplier_name: 'GLS Shipping Lines',
      vessel_id: 5,
      vessel_name: 'PACIFIC GRACE',
      voyage_name: 'GLS.884S',
      load_port_id: 2,
      load_port_name: 'TP. Hồ Chí Minh',
      load_terminal_id: 201,
      load_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      depart_time: '2026-11-10 14:00',
      closing_time: '2026-11-10 04:00',
      discharge_port_id: 3,
      discharge_port_name: 'Đà Nẵng',
      discharge_terminal_id: 101,
      discharge_terminal_name: 'Cảng Tiên Sa',
      arrive_time: '2026-11-12 06:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    },
    {
      id: 'voy_125',
      supplier_id: 1,
      supplier_name: 'Cty CP Vận Tải Hải An (HATS)',
      vessel_id: 1,
      vessel_name: 'HAIAN PARK',
      voyage_name: 'V.2614S',
      load_port_id: 1,
      load_port_name: 'Hải Phòng',
      load_terminal_id: 102,
      load_terminal_name: 'Cảng Đình Vũ (Hải Phòng)',
      depart_time: '2026-11-11 19:00',
      closing_time: '2026-11-11 09:00',
      discharge_port_id: 2,
      discharge_port_name: 'TP. Hồ Chí Minh',
      discharge_terminal_id: 201,
      discharge_terminal_name: 'Tân Cảng Cát Lái (TP.HCM)',
      arrive_time: '2026-11-14 07:00',
      update_by_id: 15,
      update_by_name: 'Albert Long',
      status: 'OPEN'
    }
  ]);

  voyageSearchQuery = signal<string>('');
  isLoadingVoyages = signal<boolean>(false);
  isSavingVoyage = signal<boolean>(false);

  // Modal States
  voyageModalMode = signal<'CREATE' | 'EDIT' | 'COPY' | null>(null);
  voyageToDelete = signal<ApiVoyageItem | null>(null);

  // ==========================================
  // VOYAGE FORM STATE (MẪU VOYAGEFORM)
  // ==========================================
  formId = signal<string | number>('');
  formSupplierName = signal<string>('');
  formSupplierId = signal<number | string | null>(null);
  formVesselName = signal<string>('');
  formVesselId = signal<number | string | null>(null);
  formVoyageName = signal<string>('');
  formLoadPortName = signal<string>('');
  formLoadPortId = signal<number | string | null>(null);
  formLoadTerminalName = signal<string>('');
  formLoadTerminalId = signal<number | string | null>(null);
  formDischargePortName = signal<string>('');
  formDischargePortId = signal<number | string | null>(null);
  formDischargeTerminalName = signal<string>('');
  formDischargeTerminalId = signal<number | string | null>(null);
  formUpdateByName = signal<string>('Albert Long');
  formUpdateById = signal<number | string>(15);

  // Ô nhập ngày (pick date) & nhập giờ (time)
  formDepartDate = signal<string>('');
  formDepartTime = signal<string>('08:00');
  formClosingDate = signal<string>('');
  formClosingTime = signal<string>('18:00');
  formArriveDate = signal<string>('');
  formArriveTime = signal<string>('14:00');

  // Autocomplete Dropdown State
  activeAutocomplete = signal<'supplier' | 'vessel' | 'voyageName' | 'loadPort' | 'loadTerminal' | 'dischargePort' | 'dischargeTerminal' | 'updateBy' | null>(null);

  // Danh sách duplicate từ API [1] duplicate: '${voyage.vessel_id}-${voyage.name}-${voyage.load_terminal}-${voyage.discharge_terminal}-${voyage.supplier_id}'
  apiDuplicates = signal<string[]>([]);

  // ==========================================
  // VOYAGE PAGINATION STATE (20, 50, 100)
  // ==========================================
  voyagePageSize = signal<number>(20);
  voyageCurrentPage = signal<number>(1);
  pageSizeOptions = [20, 50, 100];

  // ==========================================
  // ADVANCED FILTER STATE (POL, POD, >=ETD, <=ETA)
  // ==========================================
  filterPolName = signal<string>('');
  filterPolId = signal<number | string | null>(null);
  filterPodName = signal<string>('');
  filterPodId = signal<number | string | null>(null);
  filterMinEtd = signal<string>(''); // >= ETD
  filterMaxEta = signal<string>(''); // <= ETA
  activeTableFilterDropdown = signal<'filterPol' | 'filterPod' | null>(null);

  // Chế độ hiển thị Lịch tàu: 'auto' (theo kích thước máy), 'table' (bảng), 'card' (thẻ smartphone)
  voyageViewMode = signal<'auto' | 'table' | 'card'>('auto');

  // ==========================================
  // COMPUTED AUTOCOMPLETE & SEARCH FILTERS
  // ==========================================
  filteredTablePolPorts = computed(() => {
    const q = this.filterPolName().toLowerCase().trim();
    const list = this.masterSeaports();
    if (!q) return list;
    return list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q));
  });

  filteredTablePodPorts = computed(() => {
    const q = this.filterPodName().toLowerCase().trim();
    const list = this.masterSeaports();
    if (!q) return list;
    return list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q));
  });

  filteredVoyages = computed(() => {
    const q = this.voyageSearchQuery().toLowerCase().trim();
    const polName = this.filterPolName().toLowerCase().trim();
    const polId = this.filterPolId();
    const podName = this.filterPodName().toLowerCase().trim();
    const podId = this.filterPodId();
    const minEtd = this.filterMinEtd().trim();
    const maxEta = this.filterMaxEta().trim();

    return this.apiVoyages().filter(v => {
      // 1. Text search
      if (q) {
        const matchesQuery = 
          (v.vessel_name || '').toLowerCase().includes(q) ||
          (v.voyage_name || '').toLowerCase().includes(q) ||
          (v.supplier_name || '').toLowerCase().includes(q) ||
          (v.load_port_name || '').toLowerCase().includes(q) ||
          (v.load_terminal_name || '').toLowerCase().includes(q) ||
          (v.discharge_port_name || '').toLowerCase().includes(q) ||
          (v.discharge_terminal_name || '').toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 2. POL filter (Port of loading)
      if (polId !== null && polId !== undefined && polId !== '') {
        const vPolId = v.load_port_id ?? v.load_port;
        if (String(vPolId) !== String(polId)) return false;
      } else if (polName) {
        if (!(v.load_port_name || '').toLowerCase().includes(polName)) return false;
      }

      // 3. POD filter (Port of discharge)
      if (podId !== null && podId !== undefined && podId !== '') {
        const vPodId = v.discharge_port_id ?? v.discharge_port;
        if (String(vPodId) !== String(podId)) return false;
      } else if (podName) {
        if (!(v.discharge_port_name || '').toLowerCase().includes(podName)) return false;
      }

      // 4. >= ETD (Khởi hành từ ngày)
      if (minEtd) {
        const vDepartDate = (v.depart_time || '').slice(0, 10);
        if (vDepartDate && vDepartDate < minEtd) return false;
      }

      // 5. <= ETA (Cập cảng trước ngày)
      if (maxEta) {
        const vArriveDate = (v.arrive_time || '').slice(0, 10);
        if (vArriveDate && vArriveDate > maxEta) return false;
      }

      return true;
    });
  });

  totalVoyagePages = computed(() => {
    const total = this.filteredVoyages().length;
    const size = this.voyagePageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  paginatedVoyages = computed(() => {
    const list = this.filteredVoyages();
    const totalPages = this.totalVoyagePages();
    const page = Math.min(Math.max(1, this.voyageCurrentPage()), totalPages);
    const size = this.voyagePageSize();
    const startIndex = (page - 1) * size;
    return list.slice(startIndex, startIndex + size);
  });

  paginationInfo = computed(() => {
    const total = this.filteredVoyages().length;
    if (total === 0) return { start: 0, end: 0, total: 0, page: 1, totalPages: 1 };
    const totalPages = this.totalVoyagePages();
    const page = Math.min(Math.max(1, this.voyageCurrentPage()), totalPages);
    const size = this.voyagePageSize();
    const start = (page - 1) * size + 1;
    const end = Math.min(start + size - 1, total);
    return { start, end, total, page, totalPages };
  });

  hasActiveVoyageFilters = computed(() => {
    return Boolean(
      this.voyageSearchQuery() ||
      this.filterPolName() ||
      this.filterPolId() !== null ||
      this.filterPodName() ||
      this.filterPodId() !== null ||
      this.filterMinEtd() ||
      this.filterMaxEta()
    );
  });

  isCardViewActive = computed(() => {
    if (this.voyageViewMode() === 'card') return true;
    if (this.voyageViewMode() === 'table') return false;
    return this.activeDevice() === 'phone';
  });

  filteredSuppliers = computed(() => {
    const q = this.formSupplierName().toLowerCase().trim();
    const list = this.masterSuppliers();
    if (!q) return list;
    return list.filter(s => (s.name || '').toLowerCase().includes(q) || (s.code || '').toLowerCase().includes(q));
  });

  filteredVessels = computed(() => {
    const q = this.formVesselName().toLowerCase().trim();
    const list = this.masterVessels();
    if (!q) return list;
    return list.filter(v => (v.name || '').toLowerCase().includes(q) || (v.operator || '').toLowerCase().includes(q));
  });

  filteredLoadPorts = computed(() => {
    const q = this.formLoadPortName().toLowerCase().trim();
    const list = this.masterSeaports();
    if (!q) return list;
    return list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q));
  });

  filteredLoadTerminals = computed(() => {
    const q = this.formLoadTerminalName().toLowerCase().trim();
    const portId = this.formLoadPortId();
    let list = this.masterTerminals();
    if (portId !== null && portId !== undefined) {
      list = list.filter(t => String(t.seaport_id) === String(portId));
    }
    if (!q) return list;
    return list.filter(t => (t.name || '').toLowerCase().includes(q));
  });

  filteredDischargePorts = computed(() => {
    const q = this.formDischargePortName().toLowerCase().trim();
    const list = this.masterSeaports();
    if (!q) return list;
    return list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q));
  });

  filteredDischargeTerminals = computed(() => {
    const q = this.formDischargeTerminalName().toLowerCase().trim();
    const portId = this.formDischargePortId();
    let list = this.masterTerminals();
    if (portId !== null && portId !== undefined) {
      list = list.filter(t => String(t.seaport_id) === String(portId));
    }
    if (!q) return list;
    return list.filter(t => (t.name || '').toLowerCase().includes(q));
  });

  filteredUsers = computed(() => {
    const q = this.formUpdateByName().toLowerCase().trim();
    const list = this.masterUsers();
    if (!q) return list;
    return list.filter(u => (u.name || '').toLowerCase().includes(q));
  });

  filteredVoyageSuggestions = computed(() => {
    const q = this.formVoyageName().toLowerCase().trim();
    const set = new Set<string>();
    // Lấy các số chuyến có sẵn trong hệ thống
    this.apiVoyages().forEach(v => {
      if (v.voyage_name) set.add(v.voyage_name);
    });
    // Gợi ý thêm các mẫu số chuyến phổ biến năm 2026
    set.add('V.2608S');
    set.add('V.2609N');
    set.add('V.1202S');
    set.add('V.1203N');
    set.add('V.0991S');
    set.add('V.0992N');

    const list = Array.from(set);
    if (!q) return list.slice(0, 8);
    return list.filter(name => name.toLowerCase().includes(q));
  });

  currentFormDuplicateKey = computed(() => {
    const vesselId = this.formVesselId();
    const voyName = this.formVoyageName().trim();
    const loadTermId = this.formLoadTerminalId();
    const disTermId = this.formDischargeTerminalId();
    const suppId = this.formSupplierId();
    if (!vesselId || !voyName || !loadTermId || !disTermId || !suppId) return '';
    return `${vesselId}-${voyName}-${loadTermId}-${disTermId}-${suppId}`;
  });

  // Kiểm tra trùng lặp theo format API: '${voyage.vessel_id}-${voyage.name}-${voyage.load_terminal}-${voyage.discharge_terminal}-${voyage.supplier_id}'
  isFormDuplicate = computed(() => {
    const currentKey = this.currentFormDuplicateKey();
    if (!currentKey) return false;

    // Nếu đang Edit và key trùng với chuyến đang chọn sửa thì không coi là duplicate
    if (this.voyageModalMode() === 'EDIT') {
      const currentId = this.formId();
      const currentVoy = this.apiVoyages().find(v => v.id === currentId);
      if (currentVoy) {
        const origKey = `${currentVoy.vessel_id}-${currentVoy.voyage_name}-${currentVoy.load_terminal_id || currentVoy.load_terminal}-${currentVoy.discharge_terminal_id || currentVoy.discharge_terminal}-${currentVoy.supplier_id}`;
        if (currentKey === origKey) return false;
      }
    }

    if (this.apiDuplicates().includes(currentKey)) return true;

    return this.apiVoyages().some(v => {
      if (this.voyageModalMode() === 'EDIT' && v.id === this.formId()) return false;
      const vKey = `${v.vessel_id}-${v.voyage_name}-${v.load_terminal_id || v.load_terminal}-${v.discharge_terminal_id || v.discharge_terminal}-${v.supplier_id}`;
      return vKey === currentKey;
    });
  });

  vesselSchedules = computed<VesselSchedule[]>(() => {
    return this.apiVoyages().map((v: ApiVoyageItem) => ({
      id: String(v.id || v.voyage_name),
      carrier: v.supplier_name || 'HẢI AN (HATS)',
      vesselName: v.vessel_name,
      voyage: v.voyage_name,
      originPort: `${v.load_port_name || 'Hải Phòng'} (${v.load_terminal_name || 'Đình Vũ'})`,
      destPort: `${v.discharge_port_name || 'TP.HCM'} (${v.discharge_terminal_name || 'Cát Lái'})`,
      etd: v.depart_time,
      eta: v.arrive_time,
      cutoff: v.closing_time,
      transitTime: '2.5 ngày',
      status: v.status || 'OPEN',
      baseOceanFreight20: 3800000,
      baseOceanFreight40: 6200000
    }));
  });

  bookings = signal<BookingRecord[]>([
    {
      id: 'b1',
      bookingNo: 'BK-HP26-0081',
      createdAt: '10/10/2026',
      vesselName: 'HAIAN PARK',
      voyage: 'V.2608S',
      originPort: 'Hải Phòng (Đình Vũ)',
      destPort: 'TP.HCM (Cát Lái)',
      pickupAddress: 'Kho số 3, KCN Nomura, An Dương, Hải Phòng',
      deliveryAddress: 'Tổng kho Logistics Cát Lái, TP. Thủ Đức, HCM',
      commodity: 'Hạt nhựa PP',
      cargoWeightTon: 22,
      containers: [{ id: 'c1', type: '20GP', quantity: 2 }],
      totalCost: 19800000,
      status: 'EQUIPMENT_RELEASED',
      depotPickup: 'Depot Nam Hải Đình Vũ (Hải Phòng)',
      depotDropoff: 'Cảng Tân Vũ Đình Vũ'
    },
    {
      id: 'b2',
      bookingNo: 'BK-HP26-0094',
      createdAt: '11/10/2026',
      vesselName: 'VOSCO STAR',
      voyage: 'V.1202S',
      originPort: 'Hải Phòng (Tân Vũ)',
      destPort: 'TP.HCM (VICT)',
      pickupAddress: 'KCN Tràng Duệ, An Dương, Hải Phòng',
      deliveryAddress: 'KCN Tân Tạo, Bình Tân, HCM',
      commodity: 'Vải cuộn may mặc xuất khẩu',
      cargoWeightTon: 16,
      containers: [{ id: 'c2', type: '40HC', quantity: 1 }],
      totalCost: 15400000,
      status: 'GATE_IN',
      depotPickup: 'Depot Tân Vũ (Hải Phòng)',
      depotDropoff: 'Cảng Tân Vũ'
    }
  ]);

  shipments = signal<ShipmentRecord[]>([
    {
      id: 's1',
      shipmentNo: 'SHP-26-8801',
      bookingNo: 'BK-HP26-0081',
      containerNo: 'TCKU-4921092',
      sealNo: 'HATS-882194',
      containerType: '20GP',
      driverName: 'Nguyễn Văn Hùng',
      driverPhone: '0913.882.910',
      tractorPlate: '15C-384.92',
      trailerPlate: '15R-029.11',
      pickupAddress: 'KCN Nomura, Hải Phòng',
      deliveryAddress: 'Kho Cát Lái, TP. Thủ Đức, HCM',
      vesselName: 'HAIAN PARK (V.2608S)',
      etaDelivery: '18/10/2026 14:00',
      currentLeg: 2,
      progressPercent: 65,
      statusDescription: 'Tàu đang hành trình chặng biển miền Trung (ngang vùng biển Quy Nhơn)'
    },
    {
      id: 's2',
      shipmentNo: 'SHP-26-8802',
      bookingNo: 'BK-HP26-0081',
      containerNo: 'TCKU-7109284',
      sealNo: 'HATS-882195',
      containerType: '20GP',
      driverName: 'Trần Văn Quyết',
      driverPhone: '0904.112.559',
      tractorPlate: '15C-229.44',
      trailerPlate: '15R-018.77',
      pickupAddress: 'KCN Nomura, Hải Phòng',
      deliveryAddress: 'Kho Cát Lái, TP. Thủ Đức, HCM',
      vesselName: 'HAIAN PARK (V.2608S)',
      etaDelivery: '18/10/2026 14:00',
      currentLeg: 2,
      progressPercent: 65,
      statusDescription: 'Tàu đang hành trình chặng biển miền Trung (ngang vùng biển Quy Nhơn)'
    },
    {
      id: 's3',
      shipmentNo: 'SHP-26-9041',
      bookingNo: 'BK-HP26-0094',
      containerNo: 'TEMU-8392019',
      sealNo: 'VOSC-449102',
      containerType: '40HC',
      driverName: 'Lê Minh Tuấn',
      driverPhone: '0988.774.221',
      tractorPlate: '51D-921.84',
      trailerPlate: '51R-332.19',
      pickupAddress: 'KCN Tràng Duệ, Hải Phòng',
      deliveryAddress: 'KCN Tân Tạo, Bình Tân, HCM',
      vesselName: 'VOSCO STAR (V.1202S)',
      etaDelivery: '19/10/2026 17:00',
      currentLeg: 3,
      progressPercent: 90,
      statusDescription: 'Xe đầu kéo đang rút hàng từ cảng giao đến KCN Tân Tạo'
    }
  ]);

  totalCreditLimit = signal<number>(500000000);
  
  invoices = signal<InvoiceRecord[]>([
    {
      id: 'inv1',
      invoiceNo: 'INV-2610-091',
      bookingNo: 'BK-HP26-0081',
      serviceDescription: 'Cước trọn gói FCL Door-to-Door Hải Phòng - Cát Lái (2x20GP)',
      amount: 19800000,
      dueDate: '05/11/2026',
      status: 'PENDING'
    },
    {
      id: 'inv2',
      invoiceNo: 'INV-2610-092',
      bookingNo: 'BK-HP26-0094',
      serviceDescription: 'Cước trọn gói FCL Door-to-Door Hải Phòng - Tân Tạo HCM (1x40HC)',
      amount: 15400000,
      dueDate: '05/11/2026',
      status: 'PAID',
      paymentDate: '11/10/2026'
    }
  ]);

  releasedBookingsCount = computed(() => 
    this.bookings().filter((b: BookingRecord) => b.status === 'EQUIPMENT_RELEASED' || b.status === 'GATE_IN').length
  );

  pendingBookingsCount = computed(() => 
    this.bookings().filter((b: BookingRecord) => b.status === 'CONFIRMED').length
  );

  usedCredit = computed(() => 
    this.invoices()
      .filter((i: InvoiceRecord) => i.status === 'PENDING')
      .reduce((sum: number, i: InvoiceRecord) => sum + i.amount, 0)
  );

  availableCredit = computed(() => 
    Math.max(0, this.totalCreditLimit() - this.usedCredit())
  );

  creditUsagePercentage = computed(() => 
    (this.usedCredit() / this.totalCreditLimit()) * 100
  );

  filteredShipments = computed(() => {
    const filter = this.shipmentFilter();
    if (filter === 'LEG1') return this.shipments().filter((s: ShipmentRecord) => s.currentLeg === 1);
    if (filter === 'LEG2') return this.shipments().filter((s: ShipmentRecord) => s.currentLeg === 2);
    if (filter === 'LEG3') return this.shipments().filter((s: ShipmentRecord) => s.currentLeg === 3);
    return this.shipments();
  });

  costBreakdown = computed(() => {
    const vessel = this.selectedVesselForBooking();
    const containers = this.dynamicContainers();
    const weight = this.cargoWeightTon();

    let pickupTrucking = 0;
    let oceanFreight = 0;
    let deliveryTrucking = 0;
    let terminalCharges = 0;
    let overweightSurcharge = 0;

    for (const c of containers) {
      const is40 = c.type.includes('40') || c.type.includes('45');
      const is20 = c.type.includes('20');

      const truckHP = (is40 ? 2500000 : 1800000) * c.quantity;
      pickupTrucking += truckHP;

      const baseRate = is40 ? (vessel?.baseOceanFreight40 || 6000000) : (vessel?.baseOceanFreight20 || 3800000);
      oceanFreight += baseRate * c.quantity;

      const truckHCM = (is40 ? 3200000 : 2400000) * c.quantity;
      deliveryTrucking += truckHCM;

      const term = (is40 ? 1900000 : 1200000) * c.quantity;
      terminalCharges += term;

      let excessTon = 0;
      if (is20 && weight > 18) {
        excessTon = weight - 18;
      } else if (is40 && weight > 26) {
        excessTon = weight - 26;
      }
      overweightSurcharge += excessTon * 300000 * c.quantity;
    }

    const total = pickupTrucking + oceanFreight + deliveryTrucking + terminalCharges + overweightSurcharge;

    return {
      pickupTrucking,
      oceanFreight,
      deliveryTrucking,
      terminalCharges,
      overweightSurcharge,
      total
    };
  });

  setDevice(device: 'pc' | 'tablet' | 'phone') {
    this.activeDevice.set(device);
  }

  setActiveStep(step: number) {
    this.activeStep.set(step);
  }
  // ==========================================
  // KHỞI TẠO & TỰ ĐỘNG TẢI DỮ LIỆU TỪ API
  // ==========================================
  ngOnInit() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.isLoggedIn.set(true);
    }
    // Tải sẵn danh mục đối chiếu và danh mục tàu
    this.fetchMasterData();
    this.fetchVoyages();
  }

  // 1. API TẢI DỮ LIỆU DANH MỤC ĐỐI CHIẾU (GET)
  async fetchMasterData() {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('https://ishipto-node10.appspot.com/readFileToJson/data', {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          if (data[0] && Array.isArray(data[0])) this.masterVessels.set(data[0]);
          if (data[1] && Array.isArray(data[1])) this.masterSuppliers.set(data[1]);
          if (data[2] && Array.isArray(data[2])) this.masterUsers.set(data[2]);
          if (data[3] && Array.isArray(data[3])) this.masterSeaports.set(data[3]);
          if (data[4] && Array.isArray(data[4])) this.masterTerminals.set(data[4]);
        }
      }
    } catch (err) {
      console.warn('Lỗi kết nối API danh mục đối chiếu:', err);
    }
  }

  // 2. API TẢI DỮ LIỆU DANH MỤC LIST TÀU (GET)
  async fetchVoyages() {
    const token = localStorage.getItem('accessToken');
    this.isLoadingVoyages.set(true);
    try {
      const response = await fetch('https://ishipto-node10.appspot.com/sel/voyage/all', {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          if (Array.isArray(data[0]) && data[0].length > 0) {
            const mapped: ApiVoyageItem[] = data[0].map((item: any) => ({
              ...item,
              load_port_id: item.load_port_id ?? item.load_port ?? null,
              load_port: item.load_port ?? item.load_port_id ?? null,
              load_terminal_id: item.load_terminal_id ?? item.load_terminal ?? null,
              load_terminal: item.load_terminal ?? item.load_terminal_id ?? null,
              discharge_port_id: item.discharge_port_id ?? item.discharge_port ?? null,
              discharge_port: item.discharge_port ?? item.discharge_port_id ?? null,
              discharge_terminal_id: item.discharge_terminal_id ?? item.discharge_terminal ?? null,
              discharge_terminal: item.discharge_terminal ?? item.discharge_terminal_id ?? null,
              update_by_name: item.update_by_name || 'Albert Long',
              update_by_id: item.update_by_id || 15
            }));
            this.apiVoyages.set(mapped);
          }
          if (Array.isArray(data[1])) {
            this.apiDuplicates.set(data[1]);
          }
        }
      }
    } catch (err) {
      console.warn('Lỗi kết nối API danh mục chuyến tàu:', err);
    } finally {
      this.isLoadingVoyages.set(false);
    }
  }

  // Tải lại toàn bộ dữ liệu từ server
  async refreshData() {
    this.showToast('info', 'Đồng bộ dữ liệu', 'Đang tải lại danh mục tàu và chuyến...');
    await Promise.all([this.fetchMasterData(), this.fetchVoyages()]);
    this.showToast('success', 'Hoàn tất đồng bộ', 'Đã cập nhật dữ liệu mới nhất từ máy chủ API.');
  }

  // 3. API LƯU TÀU (POST)
  async saveVoyageApi(payload: any): Promise<boolean> {
    const token = localStorage.getItem('accessToken');
    this.isSavingVoyage.set(true);
    try {
      const response = await fetch('https://ishipto-node10.appspot.com/readFileToJson/voyage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        this.showToast('success', 'Lưu thành công', 'Chuyến tàu đã được cập nhật lên hệ thống máy chủ.');
        await this.fetchVoyages();
        return true;
      } else {
        const errJson = await response.json().catch(() => null);
        this.showToast('warning', 'Phản hồi từ máy chủ', errJson?.message || 'Lưu thành công trên giao diện.');
        return true;
      }
    } catch (err) {
      console.warn('Lỗi gửi API lưu tàu, lưu phiên cục bộ:', err);
      this.showToast('info', 'Đã lưu cục bộ', 'Đã cập nhật chuyến tàu vào phiên làm việc hiện tại.');
      return true;
    } finally {
      this.isSavingVoyage.set(false);
    }
  }

  // ==========================================
  // AUTOCOMPLETE SELECTION HANDLERS
  // ==========================================
  toggleAutocomplete(field: 'supplier' | 'vessel' | 'voyageName' | 'loadPort' | 'loadTerminal' | 'dischargePort' | 'dischargeTerminal' | 'updateBy') {
    if (this.activeAutocomplete() === field) {
      this.activeAutocomplete.set(null);
    } else {
      this.activeAutocomplete.set(field);
    }
  }

  selectSupplierItem(s: MasterSupplier) {
    this.formSupplierName.set(s.name);
    this.formSupplierId.set(s.id);
    this.activeAutocomplete.set(null);
  }

  selectVesselItem(v: MasterVessel) {
    this.formVesselName.set(v.name);
    this.formVesselId.set(v.id);
    // Nếu tàu có operator khớp với mã hãng tàu và chưa chọn hãng tàu, tự động khớp hãng tàu
    if (v.operator && !this.formSupplierId()) {
      const matchedSupplier = this.masterSuppliers().find(s => s.code === v.operator || (s.name || '').includes(v.operator!));
      if (matchedSupplier) {
        this.formSupplierName.set(matchedSupplier.name);
        this.formSupplierId.set(matchedSupplier.id);
      }
    }
    this.activeAutocomplete.set(null);
  }

  selectVoyageNameItem(name: string) {
    this.formVoyageName.set(name);
    this.activeAutocomplete.set(null);
  }

  selectLoadPortItem(p: MasterSeaport) {
    this.formLoadPortName.set(p.name);
    this.formLoadPortId.set(p.id);
    this.formLoadTerminalName.set('');
    this.formLoadTerminalId.set(null);
    this.activeAutocomplete.set(null);
  }

  selectLoadTerminalItem(t: MasterTerminal) {
    this.formLoadTerminalName.set(t.name);
    this.formLoadTerminalId.set(t.id);
    if (t.seaport_id && !this.formLoadPortId()) {
      const parentPort = this.masterSeaports().find(p => String(p.id) === String(t.seaport_id));
      if (parentPort) {
        this.formLoadPortName.set(parentPort.name);
        this.formLoadPortId.set(parentPort.id);
      }
    }
    this.activeAutocomplete.set(null);
  }

  selectDischargePortItem(p: MasterSeaport) {
    this.formDischargePortName.set(p.name);
    this.formDischargePortId.set(p.id);
    this.formDischargeTerminalName.set('');
    this.formDischargeTerminalId.set(null);
    this.activeAutocomplete.set(null);
  }

  selectDischargeTerminalItem(t: MasterTerminal) {
    this.formDischargeTerminalName.set(t.name);
    this.formDischargeTerminalId.set(t.id);
    if (t.seaport_id && !this.formDischargePortId()) {
      const parentPort = this.masterSeaports().find(p => String(p.id) === String(t.seaport_id));
      if (parentPort) {
        this.formDischargePortName.set(parentPort.name);
        this.formDischargePortId.set(parentPort.id);
      }
    }
    this.activeAutocomplete.set(null);
  }

  selectUserItem(u: MasterUser) {
    this.formUpdateByName.set(u.name);
    this.formUpdateById.set(u.id);
    this.activeAutocomplete.set(null);
  }

  // ==========================================
  // VOYAGE PAGINATION & ADVANCED FILTER HANDLERS
  // ==========================================
  setVoyagePageSize(size: number) {
    this.voyagePageSize.set(size);
    this.voyageCurrentPage.set(1);
  }

  goToVoyagePage(page: number) {
    const maxPage = this.totalVoyagePages();
    const validPage = Math.max(1, Math.min(page, maxPage));
    this.voyageCurrentPage.set(validPage);
  }

  prevVoyagePage() {
    this.goToVoyagePage(this.voyageCurrentPage() - 1);
  }

  nextVoyagePage() {
    this.goToVoyagePage(this.voyageCurrentPage() + 1);
  }

  toggleTableFilterDropdown(dropdown: 'filterPol' | 'filterPod') {
    if (this.activeTableFilterDropdown() === dropdown) {
      this.activeTableFilterDropdown.set(null);
    } else {
      this.activeTableFilterDropdown.set(dropdown);
    }
  }

  selectFilterPolPort(p: MasterSeaport | null) {
    if (!p) {
      this.filterPolName.set('');
      this.filterPolId.set(null);
    } else {
      this.filterPolName.set(p.name);
      this.filterPolId.set(p.id);
    }
    this.voyageCurrentPage.set(1);
    this.activeTableFilterDropdown.set(null);
  }

  selectFilterPodPort(p: MasterSeaport | null) {
    if (!p) {
      this.filterPodName.set('');
      this.filterPodId.set(null);
    } else {
      this.filterPodName.set(p.name);
      this.filterPodId.set(p.id);
    }
    this.voyageCurrentPage.set(1);
    this.activeTableFilterDropdown.set(null);
  }

  onFilterMinEtdChange(event: Event) {
    const val = (event.target as HTMLInputElement)?.value || '';
    this.filterMinEtd.set(val);
    this.voyageCurrentPage.set(1);
  }

  onFilterMaxEtaChange(event: Event) {
    const val = (event.target as HTMLInputElement)?.value || '';
    this.filterMaxEta.set(val);
    this.voyageCurrentPage.set(1);
  }

  resetVoyageFilters() {
    this.voyageSearchQuery.set('');
    this.filterPolName.set('');
    this.filterPolId.set(null);
    this.filterPodName.set('');
    this.filterPodId.set(null);
    this.filterMinEtd.set('');
    this.filterMaxEta.set('');
    this.voyageCurrentPage.set(1);
    this.activeTableFilterDropdown.set(null);
    this.showToast('info', 'Đã đặt lại bộ lọc', 'Hiển thị toàn bộ danh sách chuyến tàu.');
  }

  setVoyageViewMode(mode: 'auto' | 'table' | 'card') {
    this.voyageViewMode.set(mode);
  }

  // Helper to generate page number buttons array
  getPageNumbers(): number[] {
    const total = this.totalVoyagePages();
    const current = this.voyageCurrentPage();
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ==========================================
  // VOYAGE MODAL OPEN / EDIT / COPY / DELETE
  // ==========================================
  parseDateTime(dtStr: string): { date: string; time: string } {
    if (!dtStr) return { date: '', time: '08:00' };
    if (dtStr.includes('T')) {
      const parts = dtStr.split('T');
      return { date: parts[0], time: (parts[1] || '08:00').substring(0, 5) };
    }
    if (dtStr.includes(' ')) {
      const parts = dtStr.split(' ');
      let d = parts[0];
      if (d.includes('/')) {
        const dp = d.split('/');
        if (dp.length === 3) d = `${dp[2]}-${dp[1].padStart(2, '0')}-${dp[0].padStart(2, '0')}`;
      }
      return { date: d, time: (parts[1] || '08:00').substring(0, 5) };
    }
    return { date: dtStr, time: '08:00' };
  }

  openCreateVoyageModal() {
    this.voyageModalMode.set('CREATE');
    this.formId.set('');
    this.formSupplierName.set('');
    this.formSupplierId.set(null);
    this.formVesselName.set('');
    this.formVesselId.set(null);
    this.formVoyageName.set('');
    this.formLoadPortName.set('Hải Phòng');
    this.formLoadPortId.set(1);
    this.formLoadTerminalName.set('Cảng Đình Vũ (Hải Phòng)');
    this.formLoadTerminalId.set(102);
    this.formDischargePortName.set('TP. Hồ Chí Minh');
    this.formDischargePortId.set(2);
    this.formDischargeTerminalName.set('Tân Cảng Cát Lái (TP.HCM)');
    this.formDischargeTerminalId.set(201);
    this.formUpdateByName.set('Albert Long');
    this.formUpdateById.set(15);

    const now = new Date();
    const dDep = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const dClose = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const dArr = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    this.formDepartDate.set(dDep.toISOString().slice(0, 10));
    this.formDepartTime.set('08:00');
    this.formClosingDate.set(dClose.toISOString().slice(0, 10));
    this.formClosingTime.set('18:00');
    this.formArriveDate.set(dArr.toISOString().slice(0, 10));
    this.formArriveTime.set('14:00');

    this.activeAutocomplete.set(null);
  }

  openEditVoyageModal(v: ApiVoyageItem) {
    this.voyageModalMode.set('EDIT');
    this.formId.set(v.id || '');
    this.formSupplierName.set(v.supplier_name || '');
    this.formSupplierId.set(v.supplier_id || null);
    this.formVesselName.set(v.vessel_name || '');
    this.formVesselId.set(v.vessel_id || null);
    this.formVoyageName.set(v.voyage_name || '');
    this.formLoadPortName.set(v.load_port_name || '');
    this.formLoadPortId.set(v.load_port_id || v.load_port || null);
    this.formLoadTerminalName.set(v.load_terminal_name || '');
    this.formLoadTerminalId.set(v.load_terminal_id || v.load_terminal || null);
    this.formDischargePortName.set(v.discharge_port_name || '');
    this.formDischargePortId.set(v.discharge_port_id || v.discharge_port || null);
    this.formDischargeTerminalName.set(v.discharge_terminal_name || '');
    this.formDischargeTerminalId.set(v.discharge_terminal_id || v.discharge_terminal || null);
    this.formUpdateByName.set(v.update_by_name || 'Albert Long');
    this.formUpdateById.set(v.update_by_id || 15);

    const dep = this.parseDateTime(v.depart_time);
    this.formDepartDate.set(dep.date);
    this.formDepartTime.set(dep.time);

    const cls = this.parseDateTime(v.closing_time);
    this.formClosingDate.set(cls.date);
    this.formClosingTime.set(cls.time);

    const arr = this.parseDateTime(v.arrive_time);
    this.formArriveDate.set(arr.date);
    this.formArriveTime.set(arr.time);

    this.activeAutocomplete.set(null);
  }

  openCopyVoyageModal(v: ApiVoyageItem) {
    this.voyageModalMode.set('COPY');
    this.formId.set(''); // ID rỗng để tạo mới
    this.formSupplierName.set(v.supplier_name || '');
    this.formSupplierId.set(v.supplier_id || null);
    this.formVesselName.set(v.vessel_name || '');
    this.formVesselId.set(v.vessel_id || null);
    this.formLoadPortName.set(v.load_port_name || '');
    this.formLoadPortId.set(v.load_port_id || v.load_port || null);
    this.formLoadTerminalName.set(v.load_terminal_name || '');
    this.formLoadTerminalId.set(v.load_terminal_id || v.load_terminal || null);
    this.formDischargePortName.set(v.discharge_port_name || '');
    this.formDischargePortId.set(v.discharge_port_id || v.discharge_port || null);
    this.formDischargeTerminalName.set(v.discharge_terminal_name || '');
    this.formDischargeTerminalId.set(v.discharge_terminal_id || v.discharge_terminal || null);
    this.formUpdateByName.set('Albert Long');
    this.formUpdateById.set(15);


    this.activeAutocomplete.set(null);
  }

  closeVoyageModal() {
    this.voyageModalMode.set(null);
    this.activeAutocomplete.set(null);
  }

  async saveVoyage() {
    if (!this.formSupplierId()) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn Hãng tàu từ danh mục gợi ý.');
      return;
    }
    if (!this.formVesselId()) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn Tên tàu từ danh mục gợi ý.');
      return;
    }
    if (!this.formVoyageName().trim()) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng nhập Số chuyến (Voyage name).');
      return;
    }
    if (!this.formLoadPortId()) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn Cảng xếp (POL).');
      return;
    }
    if (!this.formLoadTerminalId()) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn Bến cảng xếp (Load terminal).');
      return;
    }
    if (!this.formDischargePortId()) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn Cảng dỡ (POD).');
      return;
    }
    if (!this.formDischargeTerminalId()) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn Bến cảng dỡ (Discharge terminal).');
      return;
    }
    if (!this.formDepartDate()) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn Ngày khởi hành (Depart Date).');
      return;
    }
    if (!this.formClosingDate()) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn Ngày đóng sổ (Cut-off Date).');
      return;
    }
    if (!this.formArriveDate()) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn Ngày cập cảng (Arrive Date).');
      return;
    }

    const depart_time = `${this.formDepartDate()} ${this.formDepartTime()}`.trim();
    const closing_time = `${this.formClosingDate()} ${this.formClosingTime()}`.trim();
    const arrive_time = `${this.formArriveDate()} ${this.formArriveTime()}`.trim();

    const payload = {
      id: this.formId() || '',
      supplier_name: this.formSupplierName(),
      supplier_id: this.formSupplierId(),
      vessel_name: this.formVesselName(),
      vessel_id: this.formVesselId(),
      voyage_name: this.formVoyageName().trim(),
      load_port_name: this.formLoadPortName(),
      load_port_id: this.formLoadPortId(),
      load_terminal_name: this.formLoadTerminalName(),
      load_terminal_id: this.formLoadTerminalId(),
      depart_time,
      closing_time,
      discharge_port_name: this.formDischargePortName(),
      discharge_port_id: this.formDischargePortId(),
      discharge_terminal_name: this.formDischargeTerminalName(),
      discharge_terminal_id: this.formDischargeTerminalId(),
      arrive_time,
      update_by_name: this.formUpdateByName() || 'Albert Long',
      update_by_id: this.formUpdateById() || 15
    };

    const success = await this.saveVoyageApi(payload);
    if (success) {
      if (this.voyageModalMode() === 'EDIT' && payload.id) {
        const updated = this.apiVoyages().map(v => v.id === payload.id ? { ...v, ...payload } : v);
        this.apiVoyages.set(updated);
      } else {
        const newVoy: ApiVoyageItem = {
          ...payload,
          id: payload.id || ('voy_' + Date.now()),
          status: 'OPEN'
        };
        this.apiVoyages.set([newVoy, ...this.apiVoyages()]);
      }
      this.closeVoyageModal();
    }
  }

  promptDeleteVoyage(v: ApiVoyageItem) {
    this.voyageToDelete.set(v);
  }

  confirmDeleteVoyage() {
    const v = this.voyageToDelete();
    if (!v) return;
    this.apiVoyages.set(this.apiVoyages().filter(item => item.id !== v.id));
    this.voyageToDelete.set(null);
    this.showToast('success', 'Đã xóa chuyến tàu', `Đã xóa chuyến ${v.vessel_name} (${v.voyage_name}) thành công.`);
  }

  selectVoyageForBooking(v: ApiVoyageItem) {
    const vSchedule: VesselSchedule = {
      id: String(v.id || Date.now()),
      carrier: v.supplier_name || 'HẢI AN (HATS)',
      vesselName: v.vessel_name,
      voyage: v.voyage_name,
      originPort: `${v.load_port_name || 'Hải Phòng'} (${v.load_terminal_name || 'Đình Vũ'})`,
      destPort: `${v.discharge_port_name || 'TP.HCM'} (${v.discharge_terminal_name || 'Cát Lái'})`,
      etd: v.depart_time,
      eta: v.arrive_time,
      cutoff: v.closing_time,
      transitTime: '2.5 ngày',
      status: v.status || 'OPEN',
      baseOceanFreight20: 3800000,
      baseOceanFreight40: 6200000
    };
    this.selectedVesselForBooking.set(vSchedule);
    this.showToast('info', 'Đã chọn tàu', `Đang cấu hình đơn đặt chỗ FCL Door-to-Door cho chuyến ${v.vessel_name} (${v.voyage_name})`);
  }

  // ==========================================
  // LOGIC ĐĂNG NHẬP API
  // ==========================================
  async login() {
    const email = this.loginEmail();
    const password = this.loginPassword();

    if (!email || !password) {
      this.showToast('warning', 'Thiếu thông tin', 'Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    // 1. Tạo chuỗi Basic Auth
    const credentials = btoa(email + ':' + password);

    // 2. Chuẩn bị Payload
    const payload = {
      email: email,
      password: password,
      timezone: new Date().getTimezoneOffset()
    };

    try {
      this.showToast('info', 'Đang xử lý', 'Đang kết nối đến máy chủ...');

      // 3. Gọi POST API
      const response = await fetch('https://synthesis-boxer-jarring.ngrok-free.dev/sel/login/sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + credentials
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message && !data.accessToken) throw data.message;
        
        // 4. Lấy accessToken và lưu trữ
        if (data && data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }

        this.isLoggedIn.set(true);
        this.showToast('success', 'Đăng nhập thành công', 'Kết nối API xác thực thành công!');
        
        // Tự động tải danh mục đối chiếu và list tàu
        this.fetchMasterData();
        this.fetchVoyages();
      } else {
        this.showToast('error', 'Lỗi đăng nhập', 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (error) {
      this.showToast('error', 'Lỗi mạng', 'Không thể kết nối đến máy chủ API.');
      console.error('Login error:', error);
    }
  }

  enterDemoMode() {
    this.isLoggedIn.set(true);
    this.activeStep.set(1);
    this.showToast('info', 'Trải nghiệm trực tiếp', 'Đang truy cập Bảng Lịch tàu & Modal Quản lý chuyến tàu.');
    this.fetchMasterData();
    this.fetchVoyages();
  }

  logout() {
    this.isLoggedIn.set(false);
    this.authTab.set('LOGIN');
    localStorage.removeItem('accessToken'); // Xóa token khi đăng xuất
    this.showToast('info', 'Đã đăng xuất', 'Vui lòng đăng nhập lại để tiếp tục.');
  }

  registerAccount() {
    this.showToast('success', 'Đăng ký thành công', 'Hồ sơ doanh nghiệp đang được duyệt hạn mức T+30 trong vòng 15 phút.');
    this.authTab.set('LOGIN');
  }

  resetPassword() {
    this.showToast('info', 'Đã gửi mã khôi phục', 'Kiểm tra hộp thư đến của bạn để hoàn tất đặt lại mật khẩu.');
    this.authTab.set('LOGIN');
  }

  selectVesselForBooking(vessel: VesselSchedule) {
    this.selectedVesselForBooking.set(vessel);
  }

  cancelVesselSelection() {
    this.selectedVesselForBooking.set(null);
  }

  addContainerRow() {
    const list = this.dynamicContainers();
    const newId = 'c_' + Date.now();
    this.dynamicContainers.set([...list, { id: newId, type: '40HC', quantity: 1 }]);
    this.showToast('info', 'Thêm container', 'Đã thêm 1 dòng cấu hình container.');
  }

  updateContainerType(id: string, type: '20GP' | '40GP' | '40HC' | '20RF' | '45HC') {
    const updated = this.dynamicContainers().map((item: ContainerItem) => 
      item.id === id ? { ...item, type } : item
    );
    this.dynamicContainers.set(updated);
  }

  incrementContainerQty(id: string) {
    const updated = this.dynamicContainers().map((item: ContainerItem) => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    this.dynamicContainers.set(updated);
  }

  decrementContainerQty(id: string) {
    const updated = this.dynamicContainers().map((item: ContainerItem) => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity - 1) };
      }
      return item;
    });
    this.dynamicContainers.set(updated);
  }

  removeContainerRow(id: string) {
    if (this.dynamicContainers().length <= 1) {
      this.showToast('warning', 'Không thể xóa', 'Đơn đặt chỗ phải có tối thiểu 1 loại container.');
      return;
    }
    const filtered = this.dynamicContainers().filter((item: ContainerItem) => item.id !== id);
    this.dynamicContainers.set(filtered);
  }

  confirmBooking() {
    const vessel = this.selectedVesselForBooking();
    if (!vessel) return;

    const newBookingId = 'b_' + Date.now();
    const newBookingNo = 'BK-HP26-0' + Math.floor(100 + Math.random() * 900);
    const cost = this.costBreakdown().total;

    const newBooking: BookingRecord = {
      id: newBookingId,
      bookingNo: newBookingNo,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      vesselName: vessel.vesselName,
      voyage: vessel.voyage,
      originPort: vessel.originPort,
      destPort: vessel.destPort,
      pickupAddress: this.pickupAddress(),
      deliveryAddress: this.deliveryAddress(),
      commodity: this.commodityName(),
      cargoWeightTon: this.cargoWeightTon(),
      containers: JSON.parse(JSON.stringify(this.dynamicContainers())),
      totalCost: cost,
      status: 'EQUIPMENT_RELEASED',
      depotPickup: 'Depot Nam Hải Đình Vũ (Hải Phòng)',
      depotDropoff: vessel.originPort
    };

    this.bookings.set([newBooking, ...this.bookings()]);

    const newShipment: ShipmentRecord = {
      id: 's_' + Date.now(),
      shipmentNo: 'SHP-26-' + Math.floor(1000 + Math.random() * 9000),
      bookingNo: newBookingNo,
      containerNo: 'TCKU-' + Math.floor(1000000 + Math.random() * 9000000),
      sealNo: 'HATS-' + Math.floor(100000 + Math.random() * 900000),
      containerType: this.dynamicContainers()[0]?.type || '20GP',
      driverName: 'Đỗ Mạnh Cường',
      driverPhone: '0936.551.882',
      tractorPlate: '15C-409.18',
      trailerPlate: '15R-055.23',
      pickupAddress: this.pickupAddress(),
      deliveryAddress: this.deliveryAddress(),
      vesselName: vessel.vesselName + ' (' + vessel.voyage + ')',
      etaDelivery: '18/10/2026',
      currentLeg: 1,
      progressPercent: 25,
      statusDescription: 'Xe đầu kéo đang đến Depot Nam Hải Đình Vũ lấy vỏ cont rỗng'
    };
    this.shipments.set([newShipment, ...this.shipments()]);

    const newInvoice: InvoiceRecord = {
      id: 'inv_' + Date.now(),
      invoiceNo: 'INV-2610-' + Math.floor(100 + Math.random() * 900),
      bookingNo: newBookingNo,
      serviceDescription: `Cước trọn gói FCL Door-to-Door HP-HCM (${newBooking.commodity})`,
      amount: cost,
      dueDate: '05/11/2026',
      status: 'PENDING'
    };
    this.invoices.set([newInvoice, ...this.invoices()]);

    this.selectedVesselForBooking.set(null);
    this.activeStep.set(2);

    this.showToast(
      'success',
      'Đặt chỗ thành công!',
      `Booking ${newBookingNo} đã được duyệt. Đã phát hành Lệnh cấp vỏ và liên thông sang Shipment & Công nợ.`
    );
  }

  viewEquipmentReleaseModal(b: BookingRecord) {
    this.activeEquipmentReleaseBooking.set(b);
  }

  goToShipmentFromBooking(bookingNo: string) {
    this.activeStep.set(3);
    this.showToast('info', 'Tra cứu chuyến vận chuyển', `Đang xem tiến trình 3 chặng của đơn ${bookingNo}`);
  }

  viewSeaWaybillModal(s: ShipmentRecord) {
    this.activeSeaWaybillShipment.set(s);
  }

  viewEirModal(s: ShipmentRecord) {
    this.activeEirShipment.set(s);
  }

  openVietQrModal(inv: InvoiceRecord) {
    this.activeQrInvoice.set(inv);
  }

  confirmPayment(inv: InvoiceRecord) {
    const updated = this.invoices().map((i: InvoiceRecord) => {
      if (i.id === inv.id) {
        return {
          ...i,
          status: 'PAID' as const,
          paymentDate: new Date().toLocaleDateString('vi-VN')
        };
      }
      return i;
    });

    this.invoices.set(updated);
    this.activeQrInvoice.set(null);

    this.showToast(
      'success',
      'Gạch nợ thành công!',
      `Hóa đơn ${inv.invoiceNo} đã được thanh toán. Hạn mức tín dụng trả sau ${this.formatVND(inv.amount)} đã được hoàn trả lập tức.`
    );
  }

  closeModals() {
    this.activeEquipmentReleaseBooking.set(null);
    this.activeSeaWaybillShipment.set(null);
    this.activeEirShipment.set(null);
    this.activeQrInvoice.set(null);
  }

  downloadMockPdf(docName: string) {
    this.showToast('info', 'Tải chứng từ', `Đang xuất file điện tử PDF cho ${docName}... Vui lòng kiểm tra mục Tải về.`);
  }

  showToast(type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) {
    const id = Date.now();
    const newToast: ToastMessage = { id, type, title, message };
    this.toasts.set([...this.toasts(), newToast]);

    setTimeout(() => {
      this.removeToast(id);
    }, 4500);
  }

  removeToast(id: number) {
    this.toasts.set(this.toasts().filter((t: ToastMessage) => t.id !== id));
  }

  formatVND(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
}
