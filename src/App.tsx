import React, { useState, useMemo, useEffect } from 'react';
import {
  Ship,
  Anchor,
  Truck,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  QrCode,
  FileText,
  CheckCircle2,
  AlertCircle,
  Phone,
  Smartphone,
  Tablet,
  Monitor,
  User,
  LogOut,
  ChevronRight,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Download,
  Printer,
  ShieldCheck,
  X,
  Copy,
  Check,
  Eye,
  Info,
  Layers,
  Code
} from 'lucide-react';

// Interfaces
interface VesselSchedule {
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

interface ContainerItem {
  id: string;
  type: '20GP' | '40GP' | '40HC' | '20RF' | '45HC';
  quantity: number;
}

interface BookingRecord {
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

interface ShipmentRecord {
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
  currentLeg: 1 | 2 | 3; // 1: HP Trucking, 2: Ocean Freight, 3: HCM Trucking
  progressPercent: number;
  statusDescription: string;
}

interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  bookingNo: string;
  serviceDescription: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID';
  paymentDate?: string;
}

interface ToastMessage {
  id: number;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export default function App() {
  // Authentication State: Khởi tạo false để người dùng bắt đầu từ màn hình đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [customerName] = useState<string>('Cty Vận Tải Minh Phát ● VIP');
  const [loginEmail, setLoginEmail] = useState<string>('admin@ishipto.vn');
  const [loginPassword, setLoginPassword] = useState<string>('password123');

  // Device simulation ('pc' | 'tablet' | 'phone')
  const [activeDevice, setActiveDevice] = useState<'pc' | 'tablet' | 'phone'>('pc');

  // 4-Step sequential progress navigation (1: Lịch Tàu, 2: Booking, 3: Shipment, 4: Công Nợ)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Modul 1 State
  const [selectedVessel, setSelectedVessel] = useState<VesselSchedule | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>('Kho số 3, KCN Nomura, An Dương, Hải Phòng');
  const [pickupDateTime, setPickupDateTime] = useState<string>('2026-10-15T08:00');
  const [pickupNote, setPickupNote] = useState<string>('Đóng pallet tiêu chuẩn xuất khẩu, liên hệ anh Thắng 0912.333.444');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Tổng kho Logistics Cát Lái, P. Cát Lái, TP. Thủ Đức, TP.HCM');
  const [deliveryDateTime, setDeliveryDateTime] = useState<string>('2026-10-18T14:00');
  const [deliveryNote, setDeliveryNote] = useState<string>('Giao hàng ban ngày, kho có cầu nâng và xe nâng 3 tấn');
  const [commodityName, setCommodityName] = useState<string>('Hạt nhựa nguyên sinh PP');
  const [cargoWeightTon, setCargoWeightTon] = useState<number>(20);

  // Dynamic containers
  const [dynamicContainers, setDynamicContainers] = useState<ContainerItem[]>([
    { id: 'c1', type: '20GP', quantity: 2 }
  ]);

  // Modul 3 filter
  const [shipmentFilter, setShipmentFilter] = useState<'ALL' | 'LEG1' | 'LEG2' | 'LEG3'>('ALL');

  // Modals
  const [activeEquipmentReleaseBooking, setActiveEquipmentReleaseBooking] = useState<BookingRecord | null>(null);
  const [activeSeaWaybillShipment, setActiveSeaWaybillShipment] = useState<ShipmentRecord | null>(null);
  const [activeEirShipment, setActiveEirShipment] = useState<ShipmentRecord | null>(null);
  const [activeQrInvoice, setActiveQrInvoice] = useState<InvoiceRecord | null>(null);
  const [showAngularCodeModal, setShowAngularCodeModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Toast Notification System (Auto dismiss after 4.5s)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Vessel Schedules Mock Data
  const [vesselSchedules] = useState<VesselSchedule[]>([
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

  // Bookings Mock Data
  const [bookings, setBookings] = useState<BookingRecord[]>([
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

  // Shipments Mock Data
  const [shipments, setShipments] = useState<ShipmentRecord[]>([
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

  // Billing & Credit Limit
  const [totalCreditLimit] = useState<number>(500000000); // 500 Million VND (Gold VIP)
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([
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

  // Computed values
  const releasedBookingsCount = useMemo(() => {
    return bookings.filter(b => b.status === 'EQUIPMENT_RELEASED' || b.status === 'GATE_IN').length;
  }, [bookings]);

  const pendingBookingsCount = useMemo(() => {
    return bookings.filter(b => b.status === 'CONFIRMED').length;
  }, [bookings]);

  const usedCredit = useMemo(() => {
    return invoices
      .filter(i => i.status === 'PENDING')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [invoices]);

  const availableCredit = useMemo(() => {
    return Math.max(0, totalCreditLimit - usedCredit);
  }, [totalCreditLimit, usedCredit]);

  const creditUsagePercentage = useMemo(() => {
    return (usedCredit / totalCreditLimit) * 100;
  }, [usedCredit, totalCreditLimit]);

  const filteredShipments = useMemo(() => {
    if (shipmentFilter === 'LEG1') return shipments.filter(s => s.currentLeg === 1);
    if (shipmentFilter === 'LEG2') return shipments.filter(s => s.currentLeg === 2);
    if (shipmentFilter === 'LEG3') return shipments.filter(s => s.currentLeg === 3);
    return shipments;
  }, [shipments, shipmentFilter]);

  // Cost Engine Calculation
  const costBreakdown = useMemo(() => {
    let pickupTrucking = 0;
    let oceanFreight = 0;
    let deliveryTrucking = 0;
    let terminalCharges = 0;
    let overweightSurcharge = 0;

    for (const c of dynamicContainers) {
      const is40 = c.type.includes('40') || c.type.includes('45');
      const is20 = c.type.includes('20');

      const truckHP = (is40 ? 2500000 : 1800000) * c.quantity;
      pickupTrucking += truckHP;

      const baseRate = is40 ? (selectedVessel?.baseOceanFreight40 || 6000000) : (selectedVessel?.baseOceanFreight20 || 3800000);
      oceanFreight += baseRate * c.quantity;

      const truckHCM = (is40 ? 3200000 : 2400000) * c.quantity;
      deliveryTrucking += truckHCM;

      const term = (is40 ? 1900000 : 1200000) * c.quantity;
      terminalCharges += term;

      let excessTon = 0;
      if (is20 && cargoWeightTon > 18) {
        excessTon = cargoWeightTon - 18;
      } else if (is40 && cargoWeightTon > 26) {
        excessTon = cargoWeightTon - 26;
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
  }, [dynamicContainers, selectedVessel, cargoWeightTon]);

  // Actions
  const handleAddContainerRow = () => {
    const newId = 'c_' + Date.now();
    setDynamicContainers(prev => [...prev, { id: newId, type: '40HC', quantity: 1 }]);
    addToast('info', 'Thêm Container', 'Đã thêm 1 dòng cấu hình container.');
  };

  const handleUpdateContainerType = (id: string, type: any) => {
    setDynamicContainers(prev => prev.map(c => c.id === id ? { ...c, type } : c));
  };

  const handleIncrementQty = (id: string) => {
    setDynamicContainers(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity + 1 } : c));
  };

  const handleDecrementQty = (id: string) => {
    setDynamicContainers(prev => prev.map(c => c.id === id ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c));
  };

  const handleRemoveContainerRow = (id: string) => {
    if (dynamicContainers.length <= 1) {
      addToast('warning', 'Không thể xóa', 'Đơn đặt chỗ bắt buộc có tối thiểu 1 loại container.');
      return;
    }
    setDynamicContainers(prev => prev.filter(c => c.id !== id));
  };

  const handleConfirmBooking = () => {
    if (!selectedVessel) return;

    const newBookingId = 'b_' + Date.now();
    const newBookingNo = 'BK-HP26-0' + Math.floor(100 + Math.random() * 900);
    const total = costBreakdown.total;

    // 1. Add Booking to Module 2
    const newBooking: BookingRecord = {
      id: newBookingId,
      bookingNo: newBookingNo,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      vesselName: selectedVessel.vesselName,
      voyage: selectedVessel.voyage,
      originPort: selectedVessel.originPort,
      destPort: selectedVessel.destPort,
      pickupAddress,
      deliveryAddress,
      commodity: commodityName,
      cargoWeightTon,
      containers: JSON.parse(JSON.stringify(dynamicContainers)),
      totalCost: total,
      status: 'EQUIPMENT_RELEASED',
      depotPickup: 'Depot Nam Hải Đình Vũ (Hải Phòng)',
      depotDropoff: selectedVessel.originPort
    };
    setBookings(prev => [newBooking, ...prev]);

    // 2. Add Shipment to Module 3
    const newShipment: ShipmentRecord = {
      id: 's_' + Date.now(),
      shipmentNo: 'SHP-26-' + Math.floor(1000 + Math.random() * 9000),
      bookingNo: newBookingNo,
      containerNo: 'TCKU-' + Math.floor(1000000 + Math.random() * 9000000),
      sealNo: 'HATS-' + Math.floor(100000 + Math.random() * 900000),
      containerType: dynamicContainers[0]?.type || '20GP',
      driverName: 'Đỗ Mạnh Cường',
      driverPhone: '0936.551.882',
      tractorPlate: '15C-409.18',
      trailerPlate: '15R-055.23',
      pickupAddress,
      deliveryAddress,
      vesselName: `${selectedVessel.vesselName} (${selectedVessel.voyage})`,
      etaDelivery: '18/10/2026',
      currentLeg: 1,
      progressPercent: 25,
      statusDescription: 'Xe đầu kéo đang đến Depot Nam Hải Đình Vũ nhận vỏ cont rỗng'
    };
    setShipments(prev => [newShipment, ...prev]);

    // 3. Add Invoice to Module 4
    const newInvoice: InvoiceRecord = {
      id: 'inv_' + Date.now(),
      invoiceNo: 'INV-2610-' + Math.floor(100 + Math.random() * 900),
      bookingNo: newBookingNo,
      serviceDescription: `Cước trọn gói FCL Door-to-Door HP-HCM (${newBooking.commodity})`,
      amount: total,
      dueDate: '05/11/2026',
      status: 'PENDING'
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Reset view and switch to Step 2
    setSelectedVessel(null);
    setActiveStep(2);

    addToast(
      'success',
      'Đặt chỗ thành công!',
      `Booking ${newBookingNo} đã được duyệt. Đã phát hành Lệnh cấp vỏ và liên thông sang Shipment & Công nợ.`
    );
  };

  const handleConfirmPayment = (inv: InvoiceRecord) => {
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'PAID' as const, paymentDate: new Date().toLocaleDateString('vi-VN') } : i));
    setActiveQrInvoice(null);
    addToast(
      'success',
      'Gạch nợ thành công!',
      `Hóa đơn ${inv.invoiceNo} đã được thanh toán. Hạn mức tín dụng trả sau ${formatVND(inv.amount)} đã được hoàn trả lập tức.`
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(angularCodeContent);
    setCopiedCode(true);
    addToast('success', 'Đã sao chép mã', 'Mã nguồn Angular 21 Standalone Component đã được lưu vào bộ nhớ tạm.');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const angularCodeContent = `// File: src/app/fcl-door-to-door.component.ts
// Khởi tạo Angular 21 Standalone Component
// Vui lòng kiểm tra mã nguồn hoàn chỉnh tại file /src/angular/fcl-door-to-door.component.ts`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* TOAST NOTIFICATION CONTAINER (Auto dismiss 4.5s) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-start gap-3 transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
                : toast.type === 'info'
                ? 'bg-cyan-950/90 border-cyan-600 text-cyan-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-600 text-amber-200'
                : 'bg-rose-950/90 border-rose-600 text-rose-200'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
              {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'error' && <X className="w-5 h-5 text-rose-400" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm tracking-wide text-white">{toast.title}</h4>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 p-1 text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* TOP UTILITY & SIMULATOR TOOLBAR */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-bold tracking-wider text-slate-300 uppercase">Chế độ giả lập thiết bị:</span>
        </div>

        {/* Device Switcher Toolbar */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveDevice('pc')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-semibold ${
              activeDevice === 'pc'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>🖥️ PC / Laptop</span>
          </button>
          <button
            onClick={() => setActiveDevice('tablet')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-semibold ${
              activeDevice === 'tablet'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>📱 Tablet</span>
          </button>
          <button
            onClick={() => setActiveDevice('phone')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-semibold ${
              activeDevice === 'phone'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📲 Phone</span>
          </button>
        </div>

        {/* Actions & Code Inspection */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAngularCodeModal(true)}
            className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mã nguồn Angular 21 (.ts)</span>
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] px-2.5 py-1 rounded-full font-medium">
                VIP T+30 Active
              </span>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  addToast('info', 'Đã đăng xuất', 'Phiên làm việc đã kết thúc.');
                }}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold px-2 py-1 rounded transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <span className="text-slate-400">Yêu cầu đăng nhập</span>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER WITH RESPONSIVE SIMULATION */}
      <main className="flex-1 flex justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        <div
          className={`w-full transition-all duration-300 ${
            activeDevice === 'pc'
              ? 'max-w-7xl'
              : activeDevice === 'tablet'
              ? 'max-w-3xl'
              : 'max-w-md sm:rounded-[40px] border-4 border-slate-700 shadow-2xl overflow-hidden'
          }`}
        >
          {/* PHONE STATUS BAR */}
          {activeDevice === 'phone' && (
            <div className="bg-slate-950 text-[11px] px-5 py-2 flex items-center justify-between text-slate-400 border-b border-slate-800 select-none">
              <span className="font-semibold text-white">09:41</span>
              <div className="w-16 h-3.5 bg-slate-900 rounded-full mx-auto"></div>
              <div className="flex items-center gap-1 text-[10px]">
                <span>5G</span>
                <span>●●●</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* APPLICATION SHELL */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur flex flex-col min-h-[660px]">
            
            {/* LOGIN / AUTHENTICATION SCREEN */}
            {!isLoggedIn ? (
              <div className="max-w-md mx-auto my-auto w-full py-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-900/40 mb-3 text-white">
                    <Ship className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">FCL DOOR-TO-DOOR PORTAL</h2>
                  <p className="text-xs text-slate-400 mt-1">Cổng Dịch Vụ Khách Hàng Hải Phòng ↔ TP.HCM</p>
                </div>

                {/* Tabs: Đăng nhập / Đăng ký / Quên MK */}
                <div className="flex border-b border-slate-700 mb-4 text-xs font-semibold">
                  <button
                    onClick={() => setAuthTab('LOGIN')}
                    className={`flex-1 py-2.5 border-b-2 transition ${
                      authTab === 'LOGIN' ? 'border-cyan-400 text-cyan-400' : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    Đăng Nhập
                  </button>
                  <button
                    onClick={() => setAuthTab('REGISTER')}
                    className={`flex-1 py-2.5 border-b-2 transition ${
                      authTab === 'REGISTER' ? 'border-cyan-400 text-cyan-400' : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    Đăng Ký Doanh Nghiệp
                  </button>
                  <button
                    onClick={() => setAuthTab('FORGOT')}
                    className={`flex-1 py-2.5 border-b-2 transition ${
                      authTab === 'FORGOT' ? 'border-cyan-400 text-cyan-400' : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    Quên Mật Khẩu
                  </button>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
                  {authTab === 'LOGIN' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Email Doanh Nghiệp (Firebase Auth)
                        </label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="admin@ishipto.vn"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Mật khẩu
                        </label>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="pt-2 flex flex-col gap-2.5">
                        <button
                          onClick={() => {
                            setIsLoggedIn(true);
                            addToast('success', 'Đăng nhập thành công', 'Chào mừng Cty Vận Tải Minh Phát (Hạng Vàng VIP T+30)!');
                          }}
                          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-[0.98] text-sm flex items-center justify-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          <span>Đăng Nhập Khách Hàng Doanh Nghiệp</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsLoggedIn(true);
                            addToast('success', 'Đăng nhập Google thành công', 'Tài khoản admin@ishipto.vn đã được xác thực qua Google Workspace.');
                          }}
                          className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs"
                        >
                          <span>🌐</span> Đăng nhập nhanh bằng Google / Gmail
                        </button>
                      </div>

                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                        💡 Tài khoản demo có sẵn: <span className="text-cyan-300 font-mono font-bold">admin@ishipto.vn</span> / Mật khẩu: <span className="text-cyan-300 font-mono font-bold">password123</span> (Cty Vận Tải Minh Phát - VIP T+30).
                      </div>
                    </>
                  )}

                  {authTab === 'REGISTER' && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Tên Doanh Nghiệp (Công ty):</label>
                        <input
                          type="text"
                          placeholder="Công ty TNHH Vận Tải & Thương Mại ABC"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Mã Số Thuế (MST):</label>
                        <input
                          type="text"
                          placeholder="0102938475"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Email Doanh Nghiệp:</label>
                        <input
                          type="email"
                          placeholder="logistics@abc.com.vn"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <button
                        onClick={() => {
                          addToast('success', 'Đăng ký thành công', 'Hồ sơ doanh nghiệp đang được duyệt hạn mức T+30 trong vòng 15 phút.');
                          setAuthTab('LOGIN');
                        }}
                        className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs"
                      >
                        Tạo Tài Khoản & Xin Hạn Mức T+30
                      </button>
                    </div>
                  )}

                  {authTab === 'FORGOT' && (
                    <div className="space-y-3 text-xs">
                      <p className="text-slate-400">Nhập email đăng ký để nhận mã OTP đặt lại mật khẩu qua hệ thống Firebase Authentication.</p>
                      <input
                        type="email"
                        placeholder="admin@ishipto.vn"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                      <button
                        onClick={() => {
                          addToast('info', 'Đã gửi mã khôi phục', 'Kiểm tra hộp thư đến của bạn để hoàn tất đặt lại mật khẩu.');
                          setAuthTab('LOGIN');
                        }}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl transition text-xs"
                      >
                        Gửi Mã Khôi Phục
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* PORTAL HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-cyan-500 rounded-xl flex items-center justify-center text-slate-950 shadow-md">
                      <Anchor className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
                        FCL DOOR-TO-DOOR LOGISTICS
                        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded-full font-bold">
                          NỘI ĐỊA VIỆT NAM
                        </span>
                      </h1>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>{customerName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-slate-400 text-[11px]">Hạn mức tín dụng khả dụng</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {formatVND(availableCredit)}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:border-cyan-500 transition relative">
                      <span className="text-base">🔔</span>
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                    </div>
                  </div>
                </div>

                {/* 4-STEP SEQUENTIAL NAVIGATION */}
                <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                  <button
                    onClick={() => setActiveStep(1)}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      activeStep === 1
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        activeStep === 1 ? 'bg-slate-950 text-cyan-400' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      1
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] uppercase font-semibold opacity-75">Bước 1</div>
                      <div className="font-bold text-xs">Lịch Tàu & Đặt Chỗ</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveStep(2)}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      activeStep === 2
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        activeStep === 2 ? 'bg-slate-950 text-cyan-400' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      2
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] uppercase font-semibold opacity-75">Bước 2</div>
                      <div className="font-bold text-xs">Quản Lý Booking</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveStep(3)}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      activeStep === 3
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        activeStep === 3 ? 'bg-slate-950 text-cyan-400' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      3
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] uppercase font-semibold opacity-75">Bước 3</div>
                      <div className="font-bold text-xs">Shipment (3 Chặng)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveStep(4)}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      activeStep === 4
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        activeStep === 4 ? 'bg-slate-950 text-cyan-400' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      4
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] uppercase font-semibold opacity-75">Bước 4</div>
                      <div className="font-bold text-xs">Công Nợ & Hóa Đơn</div>
                    </div>
                  </button>
                </nav>

                {/* ========================================================= */}
                {/* MODUL 1: LỊCH TÀU & TẠO BOOKING TỨC THÌ */}
                {/* ========================================================= */}
                {activeStep === 1 && (
                  <>
                    {/* VIEW SWAP 1A: DANH SÁCH LỊCH TÀU */}
                    {!selectedVessel ? (
                      <div className="space-y-4">
                        {/* Cảng & Thông tin hành trình */}
                        <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-cyan-400 font-bold text-xs">Từ:</span>
                              <span className="font-semibold text-xs">Hải Phòng (Đình Vũ / Tân Vũ)</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-500" />
                            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold text-xs">Đến:</span>
                              <span className="font-semibold text-xs">TP.HCM (Cát Lái / VICT)</span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Hải trình trung bình:</span>
                            <span className="text-cyan-300 font-bold">2.5 ngày (60 giờ)</span>
                          </div>
                        </div>

                        {/* Danh sách tàu */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {vesselSchedules.map(vessel => (
                            <div
                              key={vessel.id}
                              className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 hover:border-cyan-500/80 transition flex flex-col justify-between shadow-lg"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <div>
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                                      {vessel.carrier}
                                    </span>
                                    <h3 className="text-base font-black text-white mt-1 flex items-center gap-1.5">
                                      <Ship className="w-4 h-4 text-cyan-400 inline" />
                                      {vessel.vesselName}
                                    </h3>
                                    <div className="text-xs text-slate-400 font-mono">Chuyến: {vessel.voyage}</div>
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                      vessel.status === 'OPEN'
                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                        : 'bg-amber-950 text-amber-300 border-amber-800'
                                    }`}
                                  >
                                    {vessel.status === 'OPEN' ? 'Mở Nhận Cont' : 'Sắp Khóa Sổ'}
                                  </span>
                                </div>

                                <div className="space-y-2 py-3 border-y border-slate-700/60 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Khởi hành (ETD HP):</span>
                                    <span className="font-semibold text-white">{vessel.etd}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Cập cảng (ETA HCM):</span>
                                    <span className="font-semibold text-emerald-300">{vessel.eta}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Hạn hạ bãi (Cut-off):</span>
                                    <span className="font-semibold text-amber-300">{vessel.cutoff}</span>
                                  </div>
                                </div>

                                <div className="pt-3 text-xs">
                                  <div className="text-slate-400">Cước chặng biển tham khảo:</div>
                                  <div className="text-white font-mono mt-0.5">
                                    Cont 20': <span className="text-cyan-300 font-bold">{formatVND(vessel.baseOceanFreight20)}</span> | 
                                    Cont 40': <span className="text-cyan-300 font-bold">{formatVND(vessel.baseOceanFreight40)}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedVessel(vessel)}
                                className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-[0.98]"
                              >
                                <Anchor className="w-3.5 h-3.5" />
                                <span>Chọn Tàu & Đặt Chỗ</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* VIEW SWAP 1B: FORM CẤU HÌNH BOOKING & COST ENGINE */
                      <div className="space-y-6">
                        {/* Top bar with back button */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedVessel(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              ← Đổi chuyến tàu khác
                            </button>
                            <div>
                              <div className="text-xs text-slate-400">Đang đặt chỗ cho chuyến tàu:</div>
                              <div className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                                <Ship className="w-4 h-4 text-cyan-400" />
                                {selectedVessel.vesselName} ({selectedVessel.voyage}) - {selectedVessel.carrier}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-right">
                            <div className="text-slate-400">ETD: {selectedVessel.etd}</div>
                            <div className="text-emerald-400 font-medium">Hạn hạ bãi (Cut-off): {selectedVessel.cutoff}</div>
                          </div>
                        </div>

                        {/* 4 Khối dữ liệu cấu hình */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          
                          {/* Cột trái: Hành trình & Hàng hóa */}
                          <div className="space-y-4">
                            {/* Khối 1: Lấy hàng HP */}
                            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl">
                              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Khối 1: Kho Lấy Hàng (Hải Phòng)
                              </h4>
                              <div className="space-y-3 text-xs">
                                <div>
                                  <label className="block text-slate-400 mb-1">Địa chỉ kho lấy hàng:</label>
                                  <input
                                    type="text"
                                    value={pickupAddress}
                                    onChange={e => setPickupAddress(e.target.value)}
                                    placeholder="KCN Nomura, An Dương, Hải Phòng"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-slate-400 mb-1">Thời gian lấy hàng:</label>
                                    <input
                                      type="datetime-local"
                                      value={pickupDateTime}
                                      onChange={e => setPickupDateTime(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-400 mb-1">Ghi chú nhận hàng:</label>
                                    <input
                                      type="text"
                                      value={pickupNote}
                                      onChange={e => setPickupNote(e.target.value)}
                                      placeholder="Ghi chú cho tài xế"
                                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Khối 2: Giao hàng HCM */}
                            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl">
                              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Khối 2: Kho Giao Hàng (TP. Hồ Chí Minh)
                              </h4>
                              <div className="space-y-3 text-xs">
                                <div>
                                  <label className="block text-slate-400 mb-1">Địa chỉ kho giao hàng:</label>
                                  <input
                                    type="text"
                                    value={deliveryAddress}
                                    onChange={e => setDeliveryAddress(e.target.value)}
                                    placeholder="Kho Cát Lái, Thủ Đức, HCM"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-slate-400 mb-1">Thời gian giao dự kiến:</label>
                                    <input
                                      type="datetime-local"
                                      value={deliveryDateTime}
                                      onChange={e => setDeliveryDateTime(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-400 mb-1">Ghi chú giao hàng:</label>
                                    <input
                                      type="text"
                                      value={deliveryNote}
                                      onChange={e => setDeliveryNote(e.target.value)}
                                      placeholder="Ghi chú kho nhận"
                                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Khối 3: Mặt hàng & Trọng lượng */}
                            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl">
                              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5" /> Khối 3: Mặt Hàng & Trọng Lượng
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <label className="block text-slate-400 mb-1">Tên mặt hàng (Commodity):</label>
                                  <input
                                    type="text"
                                    value={commodityName}
                                    onChange={e => setCommodityName(e.target.value)}
                                    placeholder="Hạt nhựa PP / Vải may mặc..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 mb-1">Trọng lượng (Tấn / Cont):</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={cargoWeightTon}
                                      onChange={e => setCargoWeightTon(Number(e.target.value))}
                                      min={1}
                                      max={32}
                                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                    />
                                    <span className="text-slate-400 font-semibold whitespace-nowrap">Tấn/cont</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-[11px] text-amber-400/90">
                                * Tiêu chuẩn cước: Cont 20' ≤ 18 tấn; Cont 40' ≤ 26 tấn. Vượt mức tính phụ phí quá tải 300.000 đ/tấn vượt.
                              </div>
                            </div>
                          </div>

                          {/* Cột phải: Danh sách Container động & Cost Engine */}
                          <div className="space-y-4">
                            {/* Khối 4: Danh sách Container động */}
                            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                  <Truck className="w-3.5 h-3.5" /> Khối 4: Danh Sách Container Động
                                </h4>
                                <button
                                  onClick={handleAddContainerRow}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1 transition"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Thêm Loại Container Khác</span>
                                </button>
                              </div>

                              <div className="space-y-2.5">
                                {dynamicContainers.map(item => (
                                  <div
                                    key={item.id}
                                    className="bg-slate-950 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex-1">
                                      <label className="text-[10px] text-slate-400 block mb-1">Loại Container:</label>
                                      <select
                                        value={item.type}
                                        onChange={e => handleUpdateContainerType(item.id, e.target.value)}
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs w-full focus:outline-none focus:border-cyan-500"
                                      >
                                        <option value="20GP">20' Dry Standard (20GP)</option>
                                        <option value="40GP">40' Dry Standard (40GP)</option>
                                        <option value="40HC">40' High Cube (40HC)</option>
                                        <option value="20RF">20' Reefer Lạnh (20RF)</option>
                                        <option value="45HC">45' High Cube (45HC)</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="text-[10px] text-slate-400 block mb-1">Số lượng:</label>
                                      <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                                        <button
                                          onClick={() => handleDecrementQty(item.id)}
                                          className="w-6 h-6 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white font-bold"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 text-center font-bold text-cyan-300">{item.quantity}</span>
                                        <button
                                          onClick={() => handleIncrementQty(item.id)}
                                          className="w-6 h-6 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white font-bold"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="pt-4">
                                      <button
                                        onClick={() => handleRemoveContainerRow(item.id)}
                                        disabled={dynamicContainers.length <= 1}
                                        className={`p-1.5 rounded-lg transition ${
                                          dynamicContainers.length <= 1
                                            ? 'text-slate-600 cursor-not-allowed'
                                            : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
                                        }`}
                                        title="Xóa loại cont"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* COST ENGINE BREAKDOWN */}
                            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-cyan-500/60 p-5 rounded-2xl shadow-xl">
                              <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <DollarSign className="w-4 h-4 text-cyan-400" /> Bóc Tách Chi Phí Tự Động (Cost Engine)
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">Trọn gói Door-to-Door</span>
                              </h4>

                              <div className="space-y-2 text-xs divide-y divide-slate-800">
                                <div className="flex justify-between pt-1">
                                  <span className="text-slate-400">1. Trucking lấy hàng đầu HP:</span>
                                  <span className="font-mono text-white">{formatVND(costBreakdown.pickupTrucking)}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                  <span className="text-slate-400">2. Cước tàu biển HP ➔ HCM:</span>
                                  <span className="font-mono text-white">{formatVND(costBreakdown.oceanFreight)}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                  <span className="text-slate-400">3. Trucking giao hàng đầu HCM:</span>
                                  <span className="font-mono text-white">{formatVND(costBreakdown.deliveryTrucking)}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                  <span className="text-slate-400">4. Phụ phí cảng (THC + LSS + Nâng hạ Lift):</span>
                                  <span className="font-mono text-white">{formatVND(costBreakdown.terminalCharges)}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                  <span className="text-amber-400">5. Phụ phí quá tải (&gt;18T/20' hoặc &gt;26T/40'):</span>
                                  <span className="font-mono text-amber-300 font-semibold">{formatVND(costBreakdown.overweightSurcharge)}</span>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-cyan-500/40">
                                  <div>
                                    <span className="font-bold text-white uppercase text-xs">TỔNG CƯỚC DOOR-TO-DOOR:</span>
                                    <div className="text-[10px] text-slate-400">Đã bao gồm VAT & phụ phí</div>
                                  </div>
                                  <span className="text-lg font-black font-mono text-cyan-300">
                                    {formatVND(costBreakdown.total)}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={handleConfirmBooking}
                                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-[0.98] text-sm flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Xác Nhận Đặt Chỗ (Tạo Booking Tức Thì)</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ========================================================= */}
                {/* MODUL 2: QUẢN LÝ DANH SÁCH BOOKING */}
                {/* ========================================================= */}
                {activeStep === 2 && (
                  <div className="space-y-4">
                    {/* Thống kê tổng quan */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400">Tổng Đơn Booking</div>
                          <div className="text-xl font-black text-white mt-1">{bookings.length}</div>
                        </div>
                        <FileText className="w-8 h-8 text-cyan-500/50" />
                      </div>
                      <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400">Đã Cấp Lệnh Lấy Vỏ</div>
                          <div className="text-xl font-black text-emerald-400 mt-1">{releasedBookingsCount}</div>
                        </div>
                        <Truck className="w-8 h-8 text-emerald-500/50" />
                      </div>
                      <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400">Chờ Cấp Vỏ / Chờ Duyệt</div>
                          <div className="text-xl font-black text-amber-400 mt-1">{pendingBookingsCount}</div>
                        </div>
                        <Clock className="w-8 h-8 text-amber-500/50" />
                      </div>
                    </div>

                    {/* Danh sách Bookings */}
                    <div className="space-y-3">
                      {bookings.length > 0 ? (
                        bookings.map(b => (
                          <div
                            key={b.id}
                            className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-5 hover:border-slate-600 transition space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-cyan-400 font-mono">{b.bookingNo}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    b.status === 'EQUIPMENT_RELEASED' || b.status === 'GATE_IN'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                      : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                                  }`}
                                >
                                  {b.status === 'EQUIPMENT_RELEASED'
                                    ? 'Đã Cấp Lệnh Vỏ'
                                    : b.status === 'GATE_IN'
                                    ? 'Đã Hạ Bãi Cảng'
                                    : 'Xác Nhận Đặt Chỗ'}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">Ngày tạo: {b.createdAt}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400 block text-[11px]">Tàu & Tuyến:</span>
                                <span className="font-bold text-white">{b.vesselName} ({b.voyage})</span>
                                <div className="text-[11px] text-slate-400">{b.originPort} ➔ {b.destPort}</div>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">Quy Cách & Hàng:</span>
                                <span className="font-semibold text-white">
                                  {b.containers.map(c => `${c.quantity}x ${c.type}`).join(', ')}
                                </span>
                                <div className="text-[11px] text-slate-400">{b.commodity} ({b.cargoWeightTon} T/cont)</div>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">Địa Điểm Nhận - Giao:</span>
                                <div className="truncate text-white" title={b.pickupAddress}>HP: {b.pickupAddress}</div>
                                <div className="truncate text-slate-400" title={b.deliveryAddress}>HCM: {b.deliveryAddress}</div>
                              </div>
                              <div className="sm:text-right">
                                <span className="text-slate-400 block text-[11px]">Tổng Cước D2D:</span>
                                <span className="text-sm font-black font-mono text-cyan-300">{formatVND(b.totalCost)}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-700/60">
                              <button
                                onClick={() => setActiveEquipmentReleaseBooking(b)}
                                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                              >
                                <FileText className="w-3.5 h-3.5 text-cyan-300" />
                                <span>Lệnh Cấp Vỏ (Booking Note)</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveStep(3);
                                  addToast('info', 'Tra cứu container', `Đang xem các container của mã đặt chỗ ${b.bookingNo}`);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition"
                              >
                                <span>Shipment</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-400 text-sm">Chưa có đơn đặt chỗ nào. Vui lòng tạo tại Bước 1.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* MODUL 3: QUẢN LÝ SHIPMENTS (HÀNH TRÌNH 3 CHẶNG) */}
                {/* ========================================================= */}
                {activeStep === 3 && (
                  <div className="space-y-4">
                    {/* Bộ lọc theo chặng */}
                    <div className="flex flex-wrap items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 text-xs">
                      <span className="text-slate-400 font-medium px-2">Lọc theo chặng:</span>
                      <button
                        onClick={() => setShipmentFilter('ALL')}
                        className={`px-3 py-1 rounded-lg transition ${
                          shipmentFilter === 'ALL'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        Tất Cả ({shipments.length})
                      </button>
                      <button
                        onClick={() => setShipmentFilter('LEG1')}
                        className={`px-3 py-1 rounded-lg transition ${
                          shipmentFilter === 'LEG1'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        Chặng 1: Kéo cont HP
                      </button>
                      <button
                        onClick={() => setShipmentFilter('LEG2')}
                        className={`px-3 py-1 rounded-lg transition ${
                          shipmentFilter === 'LEG2'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        Chặng 2: Tàu Biển HP ➔ HCM
                      </button>
                      <button
                        onClick={() => setShipmentFilter('LEG3')}
                        className={`px-3 py-1 rounded-lg transition ${
                          shipmentFilter === 'LEG3'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        Chặng 3: Giao cont HCM
                      </button>
                    </div>

                    {/* Danh sách Shipments */}
                    <div className="space-y-4">
                      {filteredShipments.length > 0 ? (
                        filteredShipments.map(s => (
                          <div
                            key={s.id}
                            className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 hover:border-cyan-500/60 transition space-y-4 shadow-lg"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-cyan-400 font-mono">{s.shipmentNo}</span>
                                <span className="text-xs bg-slate-950 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
                                  Ref BK: <strong className="text-white">{s.bookingNo}</strong>
                                </span>
                                <span className="text-xs bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                                  {s.containerType}
                                </span>
                              </div>
                              <div className="text-xs text-emerald-400 font-medium">
                                Dự kiến giao: <strong>{s.etaDelivery}</strong>
                              </div>
                            </div>

                            {/* CONTAINER & XE ĐẦU KÉO INFO */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs">
                              <div>
                                <span className="text-slate-400 block text-[11px]">Số Container & Kẹp Chì:</span>
                                <div className="font-mono font-bold text-white text-sm">{s.containerNo}</div>
                                <div className="font-mono text-cyan-400 text-[11px]">Seal: {s.sealNo}</div>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">Tài Xế & Đầu Kéo:</span>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-emerald-400" />
                                  {s.driverName} ({s.driverPhone})
                                </div>
                                <div className="text-slate-300 text-[11px]">Xe: {s.tractorPlate} | Moóc: {s.trailerPlate}</div>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">Tàu Chuyên Chở:</span>
                                <div className="font-bold text-white">{s.vesselName}</div>
                                <div className="text-slate-400 text-[11px] truncate">Giao: {s.deliveryAddress}</div>
                              </div>
                            </div>

                            {/* THANH TIẾN TRÌNH TRỰC QUAN 3 CHẶNG DOOR-TO-DOOR */}
                            <div className="space-y-2 pt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-300">Trạng thái: {s.statusDescription}</span>
                                <span className="font-mono font-bold text-cyan-400">{s.progressPercent}% Hoàn thành</span>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500"
                                  style={{ width: `${s.progressPercent}%` }}
                                ></div>
                              </div>

                              {/* 3 Mốc Chặng */}
                              <div className="grid grid-cols-3 text-center pt-1 text-[11px]">
                                <div className={s.currentLeg === 1 ? 'font-black text-cyan-400' : 'text-slate-500'}>
                                  ① Kéo cont Hải Phòng
                                </div>
                                <div className={s.currentLeg === 2 ? 'font-black text-cyan-400' : 'text-slate-500'}>
                                  ② Tàu biển HP ➔ HCM
                                </div>
                                <div className={s.currentLeg === 3 ? 'font-black text-cyan-400' : 'text-slate-500'}>
                                  ③ Giao cont HCM
                                </div>
                              </div>
                            </div>

                            {/* ACTIONS: CHỨNG TỪ ĐIỆN TỬ */}
                            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-700">
                              <button
                                onClick={() => setActiveEirShipment(s)}
                                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium flex items-center gap-1.5 transition"
                              >
                                <FileText className="w-3.5 h-3.5 text-emerald-300" />
                                <span>Xem EIR (Giao Nhận Vỏ)</span>
                              </button>
                              <button
                                onClick={() => setActiveSeaWaybillShipment(s)}
                                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                              >
                                <FileText className="w-3.5 h-3.5 text-cyan-200" />
                                <span>Vận Đơn Điện Tử (Sea Waybill)</span>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-400 text-sm">Không tìm thấy lô hàng nào trong chặng này.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* MODUL 4: CÔNG NỢ & THANH TOÁN (BILLING) */}
                {/* ========================================================= */}
                {activeStep === 4 && (
                  <div className="space-y-6">
                    {/* THẺ HẠN MỨC TÍN DỤNG TRẢ SAU (CREDIT LIMIT T+30) */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-amber-500/40 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                      <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 text-lg">👑</span>
                            <span className="text-xs font-black tracking-wider uppercase text-amber-300">
                              Chính Sách Khách Hàng VIP
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-white mt-1">Hạn Mức Tín Dụng Trả Sau T+30 (Hạng Vàng)</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Chốt công nợ ngày 25 hàng tháng ● Hạn thanh toán ngày 05 tháng tiếp theo
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400">Tổng Hạn Mức Tín Dụng Cấp:</span>
                          <div className="text-xl font-black font-mono text-amber-300">{formatVND(totalCreditLimit)}</div>
                        </div>
                      </div>

                      {/* Usage breakdown */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">
                            Đã sử dụng: <strong className="text-rose-400 font-mono">{formatVND(usedCredit)}</strong>
                          </span>
                          <span className="text-slate-400">
                            Còn khả dụng: <strong className="text-emerald-400 font-mono">{formatVND(availableCredit)}</strong>
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, creditUsagePercentage)}%` }}
                          ></div>
                        </div>
                        <div className="text-[11px] text-slate-400 text-right">
                          Tỷ lệ sử dụng: <span className="font-bold text-white">{creditUsagePercentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* DANH SÁCH HÓA ĐƠN & THANH TOÁN */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-cyan-400" /> Danh Sách Hóa Đơn Cước Vận Tải
                      </h3>

                      <div className="space-y-3">
                        {invoices.map(inv => (
                          <div
                            key={inv.id}
                            className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-md"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-cyan-400 text-sm">{inv.invoiceNo}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    inv.status === 'PAID'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                      : 'bg-amber-950 text-amber-300 border-amber-800'
                                  }`}
                                >
                                  {inv.status === 'PAID' ? 'Đã Thanh Toán' : 'Chờ Thanh Toán'}
                                </span>
                              </div>
                              <div className="text-xs text-white font-medium">{inv.serviceDescription}</div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                Ref: {inv.bookingNo} | Hạn nộp: {inv.dueDate}
                                {inv.paymentDate && (
                                  <> | <span className="text-emerald-400">Đã trả: {inv.paymentDate}</span></>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-slate-400 text-[11px] block">Số tiền:</span>
                                <span className="font-mono font-black text-base text-white">{formatVND(inv.amount)}</span>
                              </div>

                              {inv.status === 'PENDING' ? (
                                <button
                                  onClick={() => setActiveQrInvoice(inv)}
                                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20 active:scale-[0.98]"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  <span>QR Napas247</span>
                                </button>
                              ) : (
                                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Hoàn tất</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* BOTTOM / MOBILE NAVIGATION (KHI CHẾ ĐỘ TABLET HOẶC PHONE) */}
          {isLoggedIn && (activeDevice === 'tablet' || activeDevice === 'phone') && (
            <nav className="bg-slate-950/95 border-t border-slate-800 py-2 px-4 flex items-center justify-around sticky bottom-0 z-30">
              <button
                onClick={() => setActiveStep(1)}
                className={`flex flex-col items-center text-[10px] gap-1 ${
                  activeStep === 1 ? 'text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Ship className="w-4 h-4" />
                <span>Lịch Tàu</span>
              </button>
              <button
                onClick={() => setActiveStep(2)}
                className={`flex flex-col items-center text-[10px] gap-1 ${
                  activeStep === 2 ? 'text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Booking</span>
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className={`flex flex-col items-center text-[10px] gap-1 ${
                  activeStep === 3 ? 'text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Shipment</span>
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className={`flex flex-col items-center text-[10px] gap-1 ${
                  activeStep === 4 ? 'text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Công Nợ</span>
              </button>
            </nav>
          )}

        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: LỆNH CẤP VỎ CONTAINER (BOOKING NOTE) */}
      {/* ========================================================= */}
      {activeEquipmentReleaseBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold uppercase">
                  Chứng từ điện tử
                </span>
                <h3 className="text-lg font-black text-white mt-1">LỆNH CẤP VỎ CONTAINER ĐIỆN TỬ</h3>
                <div className="text-xs text-slate-400 font-mono">Mã số: {activeEquipmentReleaseBooking.bookingNo}</div>
              </div>
              <button
                onClick={() => setActiveEquipmentReleaseBooking(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">TÀU & CHUYẾN:</span>
                  <span className="font-bold text-white">{activeEquipmentReleaseBooking.vesselName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CẢNG HẠ BÃI (GATE-IN):</span>
                  <span className="font-bold text-cyan-300">{activeEquipmentReleaseBooking.depotDropoff}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">DEPOT CẤP VỎ:</span>
                  <span className="font-bold text-emerald-400">{activeEquipmentReleaseBooking.depotPickup}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">HẠN LẤY VỎ CONT:</span>
                  <span className="font-mono text-white">24 Giờ kể từ khi duyệt</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[10px]">QUY CÁCH CONTAINER CẤP:</span>
                <div className="font-bold text-white mt-0.5">
                  {activeEquipmentReleaseBooking.containers.map(c => (
                    <span key={c.id}>{c.quantity} x Container {c.type} (Tiêu chuẩn IICL/Cargo Worthy) &nbsp;</span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[10px]">ĐỊA CHỈ ĐÓNG HÀNG HP:</span>
                <div className="text-slate-300">{activeEquipmentReleaseBooking.pickupAddress}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => addToast('info', 'Tải PDF', 'Đang xuất file điện tử Lệnh Cấp Vỏ...')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải PDF Lệnh</span>
              </button>
              <button
                onClick={() => setActiveEquipmentReleaseBooking(null)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: VẬN ĐƠN BIỂN ĐIỆN TỬ (SEA WAYBILL / e-B/L) */}
      {/* ========================================================= */}
      {activeSeaWaybillShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold uppercase">
                  Non-Negotiable e-Waybill
                </span>
                <h3 className="text-lg font-black text-white mt-1">VẬN ĐƠN BIỂN ĐIỆN TỬ (SEA WAYBILL)</h3>
                <div className="text-xs text-slate-400 font-mono">B/L No: SWB-{activeSeaWaybillShipment.shipmentNo}</div>
              </div>
              <button
                onClick={() => setActiveSeaWaybillShipment(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">NGƯỜI GỬI (SHIPPER):</span>
                  <span className="font-bold text-white">{customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NGƯỜI NHẬN (CONSIGNEE):</span>
                  <span className="font-bold text-white">Theo Lệnh Người Gửi (To Order)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">TÀU & CHUYẾN BIỂN:</span>
                  <span className="font-semibold text-white">{activeSeaWaybillShipment.vesselName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CẢNG XẾP / DỠ:</span>
                  <span className="text-cyan-300 font-semibold">Hải Phòng ➔ Cát Lái (HCM)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[10px]">SỐ CONTAINER & KẸP CHÌ:</span>
                <div className="font-mono font-bold text-white mt-0.5">
                  {activeSeaWaybillShipment.containerNo} / Seal: {activeSeaWaybillShipment.sealNo} ({activeSeaWaybillShipment.containerType})
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Chữ ký số: <strong className="text-emerald-400">Đã Ký Xác Nhận (e-Signed)</strong></span>
                <span className="font-mono">FREIGHT PREPAID</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => addToast('info', 'Tải Vận Đơn', 'Đang xuất bản sao PDF Sea Waybill điện tử...')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Vận Đơn Gốc</span>
              </button>
              <button
                onClick={() => setActiveSeaWaybillShipment(null)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PHIẾU GIAO NHẬN VỎ CONTAINER (EIR) */}
      {/* ========================================================= */}
      {activeEirShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
                  e-EIR
                </span>
                <h3 className="text-lg font-black text-white mt-1">PHIẾU GIAO NHẬN CONTAINER (EIR)</h3>
                <div className="text-xs text-slate-400 font-mono">Phiếu EIR: EIR-{activeEirShipment.containerNo}</div>
              </div>
              <button
                onClick={() => setActiveEirShipment(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">SỐ CONTAINER:</span>
                  <span className="font-mono font-bold text-white">{activeEirShipment.containerNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">TÌNH TRẠNG VỎ:</span>
                  <span className="font-bold text-emerald-400">Sạch, kín sáng, đạt chuẩn IICL</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">TÀI XẾ NHẬN:</span>
                  <span className="font-semibold text-white">{activeEirShipment.driverName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ĐẦU KÉO / RƠ-MOÓC:</span>
                  <span className="font-mono text-cyan-300">
                    {activeEirShipment.tractorPlate} / {activeEirShipment.trailerPlate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => addToast('info', 'Tải Phiếu EIR', 'Đang tải file phiếu EIR điện tử...')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Phiếu EIR</span>
              </button>
              <button
                onClick={() => setActiveEirShipment(null)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: THANH TOÁN VIETQR NAPAS247 */}
      {/* ========================================================= */}
      {activeQrInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
                  Cổng Thanh Toán Napas247
                </span>
                <h3 className="text-lg font-black text-white mt-1">THANH TOÁN VIETQR CHUẨN</h3>
                <div className="text-xs text-slate-400 font-mono">Hóa đơn: {activeQrInvoice.invoiceNo}</div>
              </div>
              <button
                onClick={() => setActiveQrInvoice(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR DISPLAY MOCKUP */}
            <div className="bg-white p-4 rounded-2xl text-center space-y-2 text-slate-900">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 border-b pb-2">
                <span>VIETCOMBANK ● NAPAS 247</span>
                <span className="text-emerald-700 font-black">QUICK RESPONSE</span>
              </div>

              {/* VietQR Icon Graphic */}
              <div className="w-48 h-48 mx-auto bg-slate-100 border border-slate-300 rounded-xl flex flex-col items-center justify-center p-2">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  <path
                    fill="currentColor"
                    d="M10 10h24v24H10zm4 4v16h16V14zm2 2h12v12H16zm50-6h24v24H66zm4 4v16h16V14zm2 2h12v12H72zM10 66h24v24H10zm4 4v16h16V70zm2 2h12v12H16zm30-56h6v6h-6zm10 0h6v6h-6zm-10 10h6v6h-6zm10 0h6v6h-6zm-20 20h6v6h-6zm10 0h6v6h-6zm20 0h6v6h-6zm-30 10h6v6h-6zm10 0h6v6h-6zm20 0h6v6h-6zm-30 10h6v6h-6zm10 0h6v6h-6zm20 0h6v6h-6zm-10 10h6v6h-6zm10 0h6v6h-6zm-20 10h6v6h-6zm10 0h6v6h-6zm10 0h6v6h-6z"
                  />
                </svg>
                <span className="text-[9px] font-bold text-slate-500 uppercase mt-1">Quét mã bằng App Ngân Hàng</span>
              </div>

              <div className="text-xs space-y-1 font-mono pt-1 text-slate-700">
                <div>STK: <strong className="text-slate-900 text-sm">0071000998822</strong></div>
                <div>Chủ TK: <strong className="text-slate-900">FCL LOGISTICS VIETNAM JSC</strong></div>
                <div>Số tiền: <strong className="text-rose-600 text-sm">{formatVND(activeQrInvoice.amount)}</strong></div>
                <div className="text-[10px] bg-slate-100 p-1 rounded border">Cú pháp: {activeQrInvoice.invoiceNo} MINH PHAT</div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleConfirmPayment(activeQrInvoice)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✓ Xác Nhận Đã Chuyển Khoản (Gạch Nợ Tức Thì)</span>
              </button>
              <button
                onClick={() => setActiveQrInvoice(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl text-xs transition"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: XEM MÃ NGUỒN ANGULAR 21 STANDALONE COMPONENT */}
      {/* ========================================================= */}
      {showAngularCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-400" />
                  Mã Nguồn Angular 21 Standalone Component
                </h3>
                <p className="text-xs text-slate-400">
                  Đã lưu trữ tại: <code className="text-cyan-300 font-mono">/src/angular/fcl-door-to-door.component.ts</code>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Đã chép' : 'Sao chép file'}</span>
                </button>
                <button
                  onClick={() => setShowAngularCodeModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl p-4 overflow-y-auto border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed">
              <div className="text-cyan-400 font-bold mb-2">// 100% Angular 21 Standalone Component với Signal State, OnPush &amp; Control Flow Mới</div>
              <pre className="whitespace-pre-wrap">{`import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fcl-door-to-door',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`... template với @if, @for, Tailwind CSS ...\`
})
export class FclDoorToDoorComponent {
  // 100% Signals:
  isLoggedIn = signal<boolean>(true);
  activeDevice = signal<'pc' | 'tablet' | 'phone'>('pc');
  activeStep = signal<number>(1);
  selectedVesselForBooking = signal<VesselSchedule | null>(null);
  dynamicContainers = signal<ContainerItem[]>([{ id: 'c1', type: '20GP', quantity: 2 }]);
  
  // Computed Signals for Cost Engine:
  costBreakdown = computed(() => { ... });
  availableCredit = computed(() => { ... });
}

// Chi tiết toàn bộ 800+ dòng code đã được nạp đầy đủ trong file /src/angular/fcl-door-to-door.component.ts!`}</pre>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAngularCodeModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
