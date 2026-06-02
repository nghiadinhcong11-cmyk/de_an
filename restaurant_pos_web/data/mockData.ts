export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
}

export const mockBranches: Branch[] = [
  { id: '1', name: 'Downtown Branch', address: '123 Main St, Central', phone: '0901234567', status: 'active' },
  { id: '2', name: 'Uptown Branch', address: '456 High St, North', phone: '0901234568', status: 'active' },
];

export const mockRestaurant = {
  id: 'GRN-2024',
  name: 'The Green Bistro',
  logo: '🥗',
  address: '123 Garden Avenue, Food City',
  phone: '0901 234 567',
  email: 'contact@greenbistro.com'
};

// INVENTORY & SUPPLIERS
export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentQty: number;
  minQty: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

export const mockIngredients: Ingredient[] = [
  { id: 'i1', name: 'Beef Patty', unit: 'pcs', currentQty: 45, minQty: 50, status: 'Low Stock', lastUpdated: '2024-03-20T10:00:00' },
  { id: 'i2', name: 'Romaine Lettuce', unit: 'kg', currentQty: 12, minQty: 5, status: 'In Stock', lastUpdated: '2024-03-21T08:30:00' },
  { id: 'i3', name: 'Burger Buns', unit: 'pcs', currentQty: 0, minQty: 100, status: 'Out of Stock', lastUpdated: '2024-03-21T09:00:00' },
  { id: 'i4', name: 'Tomato', unit: 'kg', currentQty: 8, minQty: 10, status: 'Low Stock', lastUpdated: '2024-03-21T11:00:00' },
];

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
}

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'Fresh Farm Co.', phone: '0988123456', email: 'sales@freshfarm.com', address: 'Dalat City', totalOrders: 15 },
  { id: 's2', name: 'Premium Meat Inc.', phone: '0977445566', email: 'orders@meatinc.com', address: 'Ho Chi Minh City', totalOrders: 8 },
];

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  totalAmount: number;
  createdAt: string;
}

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'po1', orderNumber: 'PO-9921', supplierName: 'Fresh Farm Co.', status: 'Pending', totalAmount: 450.5, createdAt: '2024-03-20T14:20:00' },
  { id: 'po2', orderNumber: 'PO-9922', supplierName: 'Premium Meat Inc.', status: 'Completed', totalAmount: 1200.0, createdAt: '2024-03-18T10:00:00' },
];

// EXPENSES & SHIFTS
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Utilities' | 'Salary' | 'Rent' | 'Maintenance' | 'Other';
  date: string;
  createdBy: string;
}

export const mockExpenses: Expense[] = [
  { id: 'ex1', title: 'Electricity Bill March', amount: 850, category: 'Utilities', date: '2024-03-15', createdBy: 'Admin' },
  { id: 'ex2', title: 'Monthly Rent', amount: 2500, category: 'Rent', date: '2024-03-01', createdBy: 'Admin' },
];

export interface EmployeeShift {
  id: string;
  employeeName: string;
  branch: string;
  checkIn: string;
  checkOut?: string;
  status: 'Active' | 'Completed';
}

export const mockShifts: EmployeeShift[] = [
  { id: 'sh1', employeeName: 'Bob Wilson', branch: 'Downtown', checkIn: '2024-03-21T08:00:00', status: 'Active' },
  { id: 'sh2', employeeName: 'Alice Cooper', branch: 'Uptown', checkIn: '2024-03-21T09:00:00', checkOut: '2024-03-21T17:00:00', status: 'Completed' },
];

// BANK ACCOUNTS
export interface PaymentAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  isDefault: boolean;
}

export const mockPaymentAccounts: PaymentAccount[] = [
  { id: 'acc1', bankName: 'Vietcombank', accountNumber: '1234567890', accountName: 'THE GREEN BISTRO', branch: 'Downtown', isDefault: true },
  { id: 'acc2', bankName: 'Techcombank', accountNumber: '9876543210', accountName: 'THE GREEN BISTRO', branch: 'Uptown', isDefault: false },
];

// ORDER REQUESTS (FOR EMPLOYEE)
export interface OrderRequest {
  id: string;
  tableNumber: string;
  customerName: string;
  requestTime: string;
  items: Array<{ name: string, quantity: number, note?: string }>;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const mockOrderRequests: OrderRequest[] = [
  { id: 'req1', tableNumber: '05', customerName: 'John', requestTime: '2024-03-21T12:05:00', items: [{ name: 'Classic Burger', quantity: 2, note: 'No onion' }, { name: 'Iced Coffee', quantity: 1 }], status: 'Pending' },
  { id: 'req2', tableNumber: '11', customerName: 'Sarah', requestTime: '2024-03-21T12:10:00', items: [{ name: 'Caesar Salad', quantity: 1 }], status: 'Pending' },
];

// EXISTING DATA
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  description: string;
  status: 'available' | 'unavailable';
}

export const mockMenuItems: MenuItem[] = [
  { id: 'm1', name: 'Classic Burger', category: 'food', price: 12.99, cost: 4.5, description: 'Beef patty, lettuce, tomato', status: 'available' },
  { id: 'm2', name: 'Caesar Salad', category: 'food', price: 9.99, cost: 3.0, description: 'Romaine lettuce, croutons', status: 'available' },
];

export const mockCustomers = [
  { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '0901234567', loyaltyPoints: 1200, totalSpending: 450.5, orderCount: 12 },
];

export const mockOrders = [
  { id: 'ORD-001', tableNumber: '2', status: 'preparing', items: [{ id: 'm1', name: 'Classic Burger', price: 12.99, quantity: 2 }], total: 25.98, createdAt: new Date().toISOString() },
];
