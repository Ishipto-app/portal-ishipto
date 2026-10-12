import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * =======================================================================
 * FCL DOOR-TO-DOOR CUSTOMER PORTAL (ANGULAR 21 STANDALONE COMPONENT)
 * Chuyên tuyến nội địa: Hải Phòng (Đình Vũ/Tân Vũ) ↔ TP.HCM (Cát Lái/VICT)
 * 100% Angular Signals, OnPush, Control Flow mới (@if, @for, @empty)
 * Tailwind CSS, Responsive đa thiết bị (PC / Tablet / Smartphone simulation)
 * =======================================================================
 */

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
  selector: 'app-fcl-door-to-door',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      <!-- TOAST NOTIFICATION CONTAINER (Auto dismiss 4.5s) -->
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
            <span class="text-slate-400">Yêu cầu đăng nhập</span>
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

          <!-- PORTAL CONTAINER -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur flex flex-col min-h-[640px]">
            
            <!-- AUTHENTICATION SCREEN -->
            @if (!isLoggedIn()) {
              <div class="max-w-md mx-auto my-auto w-full py-8">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-900/40 mb-3 text-3xl">
                    🚢
                  </div>
                  <h2 class="text-2xl font-black text-white tracking-tight uppercase">FCL Door-to-Door Portal</h2>
                  <p class="text-xs text-slate-400 mt-1">Tuyến Hải Phòng ↔ TP. Hồ Chí Minh (Đình Vũ - Cát Lái)</p>
                </div>

                <div class="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Tài khoản Doanh Nghiệp (Email)</label>
                    <input 
                      type="email" 
                      [value]="loginEmail()"
                      (input)="loginEmail.set($any($event.target).value)"
                      placeholder="admin@ishipto.vn" 
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
                      class="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-[0.98] text-sm"
                    >
                      Đăng Nhập Khách Hàng Doanh Nghiệp
                    </button>
                    <button 
                      (click)="loginWithGoogle()"
                      class="w-full bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs"
                    >
                      <span>🌐</span> Đăng nhập nhanh bằng Google / Gmail
                    </button>
                  </div>

                  <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    💡 Khách hàng thử nghiệm: <span class="text-cyan-300 font-mono">Cty Vận Tải Minh Phát (Hạng Vàng VIP)</span>. Hạn mức công nợ T+30 tự động kích hoạt.
                  </div>
                </div>
              </div>
            } @else {
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

              <!-- MODUL 1: LỊCH TÀU & BOOKING -->
              @if (activeStep() === 1) {
                @if (!selectedVesselForBooking()) {
                  <div class="space-y-4">
                    <div class="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                      <div class="flex flex-wrap items-center gap-3">
                        <div class="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                          <span class="text-cyan-400 font-bold text-xs">Từ:</span>
                          <span class="font-semibold text-xs">Hải Phòng (Đình Vũ / Tân Vũ)</span>
                        </div>
                        <span class="text-slate-500">➔</span>
                        <div class="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                          <span class="text-emerald-400 font-bold text-xs">Đến:</span>
                          <span class="font-semibold text-xs">TP.HCM (Cát Lái / VICT)</span>
                        </div>
                      </div>
                      <div class="text-xs text-slate-400 flex items-center gap-2">
                        <span>Thời gian hành trình:</span>
                        <span class="text-cyan-300 font-bold">2.5 ngày (60 giờ)</span>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      @for (vessel of vesselSchedules(); track vessel.id) {
                        <div class="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 hover:border-cyan-500/80 transition flex flex-col justify-between shadow-lg">
                          <div>
                            <div class="flex items-start justify-between gap-2 mb-3">
                              <div>
                                <span class="text-[10px] font-bold tracking-wider uppercase text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                                  {{ vessel.carrier }}
                                </span>
                                <h3 class="text-base font-black text-white mt-1">{{ vessel.vesselName }}</h3>
                                <div class="text-xs text-slate-400 font-mono">Chuyến: {{ vessel.voyage }}</div>
                              </div>
                              <span 
                                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                [class.bg-emerald-950]="vessel.status === 'OPEN'"
                                [class.text-emerald-300]="vessel.status === 'OPEN'"
                                [class.border]="vessel.status === 'OPEN'"
                                [class.border-emerald-800]="vessel.status === 'OPEN'"
                              >
                                {{ vessel.status === 'OPEN' ? 'Mở Nhận Cont' : 'Sắp Khóa Sổ' }}
                              </span>
                            </div>

                            <div class="space-y-2 py-3 border-y border-slate-700/60 text-xs">
                              <div class="flex justify-between">
                                <span class="text-slate-400">Khởi hành (ETD HP):</span>
                                <span class="font-semibold text-white">{{ vessel.etd }}</span>
                              </div>
                              <div class="flex justify-between">
                                <span class="text-slate-400">Cập cảng (ETA HCM):</span>
                                <span class="font-semibold text-emerald-300">{{ vessel.eta }}</span>
                              </div>
                              <div class="flex justify-between">
                                <span class="text-slate-400">Hạn hạ bãi (Cut-off):</span>
                                <span class="font-semibold text-amber-300">{{ vessel.cutoff }}</span>
                              </div>
                            </div>

                            <div class="pt-3 text-xs">
                              <div class="text-slate-400">Cước chặng biển tham khảo:</div>
                              <div class="text-white font-mono mt-0.5">
                                Cont 20': <span class="text-cyan-300 font-bold">{{ formatVND(vessel.baseOceanFreight20) }}</span> | 
                                Cont 40': <span class="text-cyan-300 font-bold">{{ formatVND(vessel.baseOceanFreight40) }}</span>
                              </div>
                            </div>
                          </div>

                          <button 
                            (click)="selectVesselForBooking(vessel)"
                            class="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                          >
                            <span>⚓</span> Chọn Tàu & Đặt Chỗ
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }

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

                      <!-- Cột Phải: Danh sách Container động & Cost Engine Breakdown -->
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

                        <!-- COST ENGINE BREAKDOWN -->
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
                                <div class="text-[10px] text-slate-400">Bao gồm VAT & phụ phí</div>
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

              <!-- MODUL 2: QUẢN LÝ BOOKING -->
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

              <!-- MODUL 3: SHIPMENTS -->
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

              <!-- MODUL 4: CÔNG NỢ & THANH TOÁN -->
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

    </div>
  `
})
export class FclDoorToDoorComponent {
  // Mặc định false để bắt buộc người dùng đăng nhập trước khi vào portal
  isLoggedIn = signal<boolean>(false);
  customerName = signal<string>('Cty Vận Tải Minh Phát ● VIP');
  loginEmail = signal<string>('admin@ishipto.vn');
  loginPassword = signal<string>('password123');

  activeDevice = signal<'pc' | 'tablet' | 'phone'>('pc');
  activeStep = signal<number>(1);

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

  vesselSchedules = signal<VesselSchedule[]>([
    {
      id: 'v1',
      carrier: 'HẢI AN (HATS)',
      vesselName: 'HAIAN PARK',
      voyage: 'V.2608S',
      originPort: 'Hải Phòng (Đình Vũ)',
      destPort: 'TP.HCM (Cát Lái)',
      etd: '15/10/2026 22:00',
      eta: '18/10/2026 10:00',
      cutoff: '15/10/2026 12:00',
      transitTime: '2.5 ngày',
      status: 'OPEN',
      baseOceanFreight20: 3800000,
      baseOceanFreight40: 6200000
    },
    {
      id: 'v2',
      carrier: 'VOSCO LINES',
      vesselName: 'VOSCO STAR',
      voyage: 'V.1202S',
      originPort: 'Hải Phòng (Tân Vũ)',
      destPort: 'TP.HCM (VICT)',
      etd: '17/10/2026 06:00',
      eta: '19/10/2026 18:00',
      cutoff: '16/10/2026 18:00',
      transitTime: '2.5 ngày',
      status: 'OPEN',
      baseOceanFreight20: 3700000,
      baseOceanFreight40: 6000000
    },
    {
      id: 'v3',
      carrier: 'VIMC LINES',
      vesselName: 'DONG NAI STAR',
      voyage: 'V.0991S',
      originPort: 'Hải Phòng (Đình Vũ)',
      destPort: 'TP.HCM (Cát Lái)',
      etd: '19/10/2026 14:00',
      eta: '22/10/2026 02:00',
      cutoff: '19/10/2026 04:00',
      transitTime: '2.5 ngày',
      status: 'CLOSING_SOON',
      baseOceanFreight20: 3750000,
      baseOceanFreight40: 6100000
    }
  ]);

  bookings = signal<BookingRecord[]>([
    {
      id: 'b1',
      bookingNo: 'BK-HP26-0081',
      createdAt: '10/10/2026',
      vesselName: 'HAIAN PARK',
      voyage: 'V.2608S',
      originPort: 'Hải Phòng (Đình Vũ)',
      destPort: 'TP.HCM (Cát Lái)',
      pickupAddress: 'KCN Nomura, An Dương, Hải Phòng',
      deliveryAddress: 'Kho Cát Lái, TP. Thủ Đức, HCM',
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

  login() {
    this.isLoggedIn.set(true);
    this.showToast('success', 'Đăng nhập thành công', 'Chào mừng Cty Vận Tải Minh Phát (VIP T+30)!');
  }

  loginWithGoogle() {
    this.isLoggedIn.set(true);
    this.showToast('success', 'Đăng nhập Google thành công', 'Tài khoản admin@ishipto.vn đã được xác thực qua Google Workspace.');
  }

  logout() {
    this.isLoggedIn.set(false);
    this.showToast('info', 'Đã đăng xuất', 'Phiên làm việc đã kết thúc.');
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
