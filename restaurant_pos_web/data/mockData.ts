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
  { id: '3', name: 'Beachside Branch', address: '789 Coast Rd, East', phone: '0901234569', status: 'inactive' },
];

export const mockRestaurant = {
  id: 'GRN-2024',
  name: 'The Green Bistro',
  logo: '🥗',
  address: '123 Garden Avenue, Food City',
  phone: '0901 234 567',
  email: 'contact@greenbistro.com'
};

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
  { id: 'm1', name: 'Classic Burger', category: 'food', price: 12.99, cost: 4.5, description: 'Beef patty, lettuce, tomato, special sauce', status: 'available' },
  { id: 'm2', name: 'Caesar Salad', category: 'food', price: 9.99, cost: 3.0, description: 'Romaine lettuce, croutons, parmesan cheese', status: 'available' },
  { id: 'm3', name: 'Iced Coffee', category: 'drinks', price: 4.5, cost: 1.0, description: 'Cold brewed coffee with milk', status: 'available' },
  { id: 'm4', name: 'Chocolate Cake', category: 'desserts', price: 6.99, cost: 2.5, description: 'Rich dark chocolate layer cake', status: 'available' },
];

export interface Table {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'waiting-payment';
  capacity: number;
  currentOrder?: string;
}

export const mockTables: Table[] = [
  { id: 't1', number: '1', status: 'available', capacity: 4 },
  { id: 't2', number: '2', status: 'occupied', capacity: 2, currentOrder: '$45.00' },
  { id: 't3', number: '3', status: 'available', capacity: 6 },
  { id: 't4', number: '4', status: 'reserved', capacity: 4 },
];

export interface Order {
  id: string;
  tableNumber: string;
  status: 'sent' | 'preparing' | 'ready' | 'served' | 'completed';
  items: any[];
  total: number;
  createdAt: string;
  customer?: string;
}

export const mockOrders: Order[] = [
  { id: 'ORD-001', tableNumber: '2', status: 'preparing', items: [{ id: 'm1', name: 'Classic Burger', price: 12.99, quantity: 2 }], total: 25.98, createdAt: new Date().toISOString() },
  { id: 'ORD-002', tableNumber: '4', status: 'sent', items: [{ id: 'm2', name: 'Caesar Salad', price: 9.99, quantity: 1 }], total: 9.99, createdAt: new Date().toISOString() },
];

export const mockCustomers = [
  { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '0901234567', loyaltyPoints: 1200, totalSpending: 450.5, orderCount: 12 },
  { id: 'c2', name: 'Jane Smith', email: 'jane@example.com', phone: '0907654321', loyaltyPoints: 450, totalSpending: 120.0, orderCount: 5 },
];

export interface JoinRequest {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  branchName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const mockJoinRequests: JoinRequest[] = [
  { id: 'req1', name: 'Alice Johnson', role: 'waiter', phone: '0912345678', email: 'alice@example.com', branchName: 'Downtown Branch', status: 'pending', createdAt: new Date().toISOString() },
];

export const mockEmployees = [
  { id: 'e1', name: 'Bob Wilson', role: 'manager', phone: '0911111111', email: 'bob@greenbistro.com', branch: 'Downtown Branch', status: 'active' },
];

export const mockRevenueData = [
  { date: 'Mon', revenue: 1200 },
  { date: 'Tue', revenue: 1500 },
  { date: 'Wed', revenue: 1100 },
  { date: 'Thu', revenue: 1800 },
  { date: 'Fri', revenue: 2200 },
  { date: 'Sat', revenue: 2800 },
  { date: 'Sun', revenue: 2400 },
];

export const mockTopProducts = [
  { name: 'Burger', sales: 120, revenue: 1560 },
  { name: 'Salad', sales: 80, revenue: 800 },
  { name: 'Coffee', sales: 200, revenue: 900 },
];

export const mockSalesByCategory = [
  { category: 'Food', value: 4500 },
  { category: 'Drinks', value: 2500 },
  { category: 'Desserts', value: 1200 },
];

export const mockVouchers = [
  { id: 'v1', code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off for new customers', validFrom: '2024-01-01', validTo: '2024-12-31', status: 'active' },
];
