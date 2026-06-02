import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import OwnerLayout from '../layouts/OwnerLayout';
import CustomerLayout from '../layouts/CustomerLayout';

// Owner Pages
import { OwnerDashboard } from '../owner/Dashboard';
import { OwnerBranches } from '../owner/Branches';
import { OwnerEmployees } from '../owner/Employees';
import { OwnerMenu } from '../owner/Menu';
import { OwnerTables } from '../owner/Tables';
import { OwnerCustomers } from '../owner/Customers';
import { OwnerPayments } from '../owner/Payments';
import { OwnerVouchers } from '../owner/Vouchers';
import { OwnerReports } from '../owner/Reports';
import { OwnerRestaurant } from '../owner/Restaurant';

// Employee Pages
import { EmployeePOS } from '../employee/EmployeePOS';
import { EmployeeOrders } from '../employee/EmployeeOrders';
import { EmployeeRegister } from '../employee/EmployeeRegister';

// Customer Pages
import { TableOrderPage } from '../customer/TableOrderPage';
import { CustomerWelcome } from '../customer/CustomerWelcome';
import { CustomerMenu } from '../customer/CustomerMenu';
import { CustomerCart } from '../customer/CustomerCart';
import { CustomerOrders } from '../customer/CustomerOrders';
import { CustomerProfile } from '../customer/CustomerProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/employee/register" element={<EmployeeRegister />} />

        {/* Customer QR Route */}
        <Route path="/qr/:tableId" element={<TableOrderPage />} />

        {/* Customer Portal Routes */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerWelcome />} />
          <Route path="menu" element={<CustomerMenu />} />
          <Route path="cart" element={<CustomerCart />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>

        {/* Owner Routes */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<OwnerDashboard />} />
          <Route path="branches" element={<OwnerBranches />} />
          <Route path="employees" element={<OwnerEmployees />} />
          <Route path="menu" element={<OwnerMenu />} />
          <Route path="tables" element={<OwnerTables />} />
          <Route path="customers" element={<OwnerCustomers />} />
          <Route path="payments" element={<OwnerPayments />} />
          <Route path="vouchers" element={<OwnerVouchers />} />
          <Route path="reports" element={<OwnerReports />} />
          <Route path="restaurant" element={<OwnerRestaurant />} />
          <Route path="inventory" element={<div className="p-8">Inventory Module coming soon...</div>} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee/pos" element={<EmployeePOS />} />
        <Route path="/employee/orders" element={<EmployeeOrders />} />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<div className="p-8 text-center text-2xl font-bold">404 - Trang không tồn tại</div>} />
      </Routes>
    </Router>
  );
}

export default App;