export interface NamedEntity {
  id: number;
  name: string;
}

export interface CustomerEntity {
  id: number;
  email?: string;
  full_name: string;
  short_name: string;
}

export interface AgentEntity {
  id: number;
  full_name: string;
}

export interface UserEntity {
  id: number;
  name: string;
}

export interface VoyageItem {
  id: number;
  arrive_time: number;
  depart_time: number;
  vessel_name: string;
  voyage_name: string;
  closing_time: number;
  supplier_name: string;
  load_terminal_name: string;
  discharge_terminal_name: string;
}

export interface VolumeItem {
  quantity: number;
  commodity: NamedEntity;
  package_type: NamedEntity;
}

export interface PriceItem {
  tax: number;
  info: string | null;
  unit: NamedEntity;
  price: NamedEntity;
  amount: number;
  volume: number;
  ex_rate: number;
  currency: NamedEntity;
  payment_center: NamedEntity;
}

export interface DocumentInfo {
  clcv: string;
  note: string;
  valid?: string;
  lcv_note?: string;
  lcv_volume?: string;
  truck_name?: string;
  valid_time?: string;
  contact_note?: string;
  truck_number?: string;
  book_commodity?: string;
  closing_time_vgm?: string | null;
  place_of_stuffing?: string;
  return_laden_cont?: string;
  empty_pick_up_depot?: any;
}

export interface ShipmentInfo {
  pod: NamedEntity; // Port of Discharge (Cảng đến)
  pol: NamedEntity; // Port of Loading (Cảng đi)
  code: string;     // Mã booking / shipment (VD: SEL/21-011/..., BKSEHPHCM25063)
  agent: AgentEntity;
  owner: UserEntity;
  customer: CustomerEntity;
  create_by: UserEntity;
  load_agent: AgentEntity;
}

export interface ContainerItem {
  container: string | null;
  seal: string | null;
  type: string | null;
  note: string | null;
}

export interface Booking {
  id: string;
  book: {
    code_company: string;
  };
  status: string; // 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  price: Record<string, PriceItem>;
  route: Record<string, VoyageItem>;
  volume: Record<string, VolumeItem>;
  document: DocumentInfo;
  shipment: ShipmentInfo;
  contArr: ContainerItem[];
}
