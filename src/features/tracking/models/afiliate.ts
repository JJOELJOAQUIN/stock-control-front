export interface Afiliado {
  apellido_afiliado: string;
  cliente: string;
  cod_afiliado: string;
  nombre_afiliado: string;
  nombre_sn: string;
  nro_afiliado: string;
}

export interface Order {
  cod_afiliado: string;
  nro_ov: string; // Número de orden de venta (OV)
  fecha_ov: string; // Fecha de la orden
  nro_remito: number | null; // Número de remito (puede ser null)
  fecha_remito: string | null; // Fecha de remito (puede ser null)
  fecha_est: string; // Fecha estimada
  arma_parcial: string; // "N" o "S"
  estado_pedido: string; // Estado del pedido ("PENDIENTE", "EN TRANSITO", etc.)
  doc_num: string; // Número de documento
}

export interface OrderItem {
  nombre: string;
  cantidad: number;
}

export interface OrderDetail {
  pedido: number;
  cod_afiliado: string;
  nro_ov: number | string;
  fecha_ov: string;
  nro_remito: number | null;
  fecha_remito: string | null;
  fecha_est: string;
  arma_parcial: string;
  estado_pedido: string;
  fcia_dispensa: string;
  dir_fcia_dispensa: string;
  stock: string;
  items: OrderItem[]; // ← ESTA ES LA LISTA REAL DE ARTÍCULOS
}


export interface Details {
  details: OrderDetail[]; // Un array de detalles de orden
  someDetail?: string;
}

export interface ProductData {
  name: string;
  lastname: string;
  f_uid: string;
  role: "ADMIN" | "USER" | "MODERATOR"; // Puedes agregar más roles si es necesario
  email: string;
  password: string;
  created_by: string;
  filters: {
    card_codes: string[];
  };
}

export interface UserData {
  uuid: string;
  name: string;
  lastname: string;
  email: string;
  created_by: string;
  f_uid: string;
  role: string;
  filters: {
    card_codes: string[];
  };
}


export interface GenericResponse {
  success: boolean;
  data: any; // Esto puede ser cualquier tipo de respuesta que no estés seguro de cuál será (por ejemplo, puede ser un array de Orders o un objeto con detalles)
  error?: string;
  status?: string;
  orders?: Order[]; // Array de órdenes generales
  details?: OrderDetail[];   // Detalles específicos de las órdenes
  affiliate_count?: number;
  affiliates?: Afiliado[];
  users?: UserData[]
  metadata?: {
    total_count: number;
    total_pages: number;
  }
}
