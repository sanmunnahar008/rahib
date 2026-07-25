export type AppRole = 'admin' | 'officer';

export interface Profile {
  id: string;
  full_name: string;
  mobile: string;
  email: string;
  created_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at?: string;
}

export interface Area {
  id: string;
  name: string;
  created_at?: string;
}

export interface Territory {
  id: string;
  name: string;
  area_id: string;
  area_name?: string;
  created_at?: string;
}

export interface Officer {
  id: string;
  name: string;
  mobile: string;
  designation?: string;
  user_id?: string | null;
  created_at?: string;
  territory_ids?: string[];
  territory_names?: string[];
}

export interface OfficerTerritory {
  officer_id: string;
  territory_id: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
  unit: string;
  price: number;
  current_stock: number;
  low_stock_alert: number;
  created_at?: string;
}

export interface ProductBatch {
  id: string;
  product_id: string;
  product_name?: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  manufacture_date: string;
}

export interface Godown {
  id: string;
  name: string;
  location: string;
  officer_id: string;
  officer_name?: string;
  created_at?: string;
}

export interface Dealer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  territory_id: string;
  territory_name?: string;
  dealer_code: string;
  current_balance: number;
  credit_limit: number;
  created_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  mobile: string;
  address: string;
  created_at?: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  low_stock_alert: number;
  created_at?: string;
}

export interface PurchaseItem {
  raw_material_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  purchase_date: string;
  total_amount: number;
  items: PurchaseItem[];
  created_at?: string;
}

export interface ProductionItem {
  raw_material_id: string;
  name: string;
  quantity: number;
}

export interface Production {
  id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  production_date: string;
  raw_materials_used: ProductionItem[];
  created_at?: string;
}

export interface SaleItem {
  product_id: string;
  name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Sale {
  id: string;
  dealer_id: string;
  dealer_name?: string;
  sale_date: string;
  total_amount: number;
  discount: number;
  paid_amount: number;
  due_amount: number;
  items: SaleItem[];
  invoice_no: string;
  created_by: string;
  created_by_name?: string;
  created_at?: string;
}

export interface Payment {
  id: string;
  dealer_id: string;
  dealer_name?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  description?: string;
  created_by: string;
  created_by_name?: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  created_by: string;
  created_at?: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name?: string;
  godown_id: string;
  godown_name?: string;
  type: 'in' | 'out' | 'transfer';
  quantity: number;
  reference_id?: string;
  created_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  joining_date: string;
  salary: number;
  status?: 'active' | 'inactive';
  created_at?: string;
}
