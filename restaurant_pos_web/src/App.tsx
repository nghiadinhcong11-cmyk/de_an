import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ChangePassword from '../pages/ChangePassword';
import RegisterOwner from '../pages/RegisterOwner';
import CustomerRegister from '../customer/CustomerRegister';
import OwnerLayout from '../layouts/OwnerLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Owner Pages
import { OwnerDashboard } from '../owner/Dashboard';
import { OwnerOrders } from '../owner/Orders';
import { OwnerBookings } from '../owner/Bookings';
import { OwnerProfile } from '../owner/OwnerProfile';
import { OwnerFeedbacks } from '../owner/Feedbacks';
import { OwnerBranches } from '../owner/Branches';
import { OwnerEmployees } from '../owner/Employees';
import { OwnerMenu } from '../owner/Menu';
import { OwnerTables } from '../owner/Tables';
import { OwnerCustomers } from '../owner/Customers';
import { OwnerPayments } from '../owner/Payments';
import { OwnerVouchers } from '../owner/Vouchers';

import { OwnerRestaurant } from '../owner/Restaurant';
import { OwnerInventory } from '../owner/Inventory';
import { OwnerSuppliers } from '../owner/Suppliers';
import { OwnerPurchaseOrders } from '../owner/PurchaseOrders';
import { OwnerExpenses } from '../owner/Expenses';
import { OwnerShifts } from '../owner/Shifts';
import { OwnerPaymentAccounts } from '../owner/PaymentAccounts';
import { OwnerLoyalty } from '../owner/Loyalty';

// Employee Pages
import { EmployeePOS } from '../employee/EmployeePOS';
import { EmployeeOrders } from '../employee/EmployeeOrders';
import { EmployeeRegister } from '../employee/EmployeeRegister';
import { EmployeeOrderRequests } from '../employee/OrderRequests';

// Customer Pages
import { TableOrderPage } from '../customer/TableOrderPage';
import { CustomerWelcome } from '../customer/CustomerWelcome';
import { CustomerMenu } from '../customer/CustomerMenu';
import { CustomerCart } from '../customer/CustomerCart';
import { CustomerOrders } from '../customer/CustomerOrders';
import { CustomerProfile } from '../customer/CustomerProfile';
import { CustomerContact } from '../customer/CustomerContact';
import { CustomerBooking } from '../customer/CustomerBooking';
import { CustomerMyBookings } from '../customer/CustomerMyBookings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register-owner" element={<RegisterOwner />} />
        <Route path="/register-customer" element={<CustomerRegister />} />
        <Route path="/employee/register" element={<EmployeeRegister />} />

        {/* Customer QR Route */}
        <Route path="/qr/:tableId" element={<TableOrderPage />} />

        {/* Customer Portal - Public Routes for Guest Ordering */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerWelcome />} />
          <Route path="menu" element={<CustomerMenu />} />
          <Route path="cart" element={<CustomerCart />} />
          <Route path="contact" element={<CustomerContact />} />
          <Route path="booking" element={<CustomerBooking />} />
          <Route path="my-bookings" element={<CustomerMyBookings />} />

          {/* Private Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* Owner Routes (Chỉ chủ nhà hàng vào được) */}
        <Route element={<ProtectedRoute allowedRoles={['Owner']} />}>
          <Route path="/owner" element={<OwnerLayout />}>
            <Route index element={<OwnerDashboard />} />
            <Route path="orders" element={<OwnerOrders />} />
            <Route path="bookings" element={<OwnerBookings />} />
            <Route path="feedbacks" element={<OwnerFeedbacks />} />
            <Route path="profile" element={<OwnerProfile />} />
            <Route path="branches" element={<OwnerBranches />} />
            <Route path="employees" element={<OwnerEmployees />} />
            <Route path="menu" element={<OwnerMenu />} />
            <Route path="tables" element={<OwnerTables />} />
            <Route path="customers" element={<OwnerCustomers />} />
            <Route path="loyalty" element={<OwnerLoyalty />} />
            <Route path="payments" element={<OwnerPayments />} />
            <Route path="vouchers" element={<OwnerVouchers />} />

            <Route path="restaurant" element={<OwnerRestaurant />} />
            <Route path="inventory" element={<OwnerInventory />} />
            <Route path="suppliers" element={<OwnerSuppliers />} />
            <Route path="purchase-orders" element={<OwnerPurchaseOrders />} />
            <Route path="expenses" element={<OwnerExpenses />} />
            <Route path="shifts" element={<OwnerShifts />} />
            <Route path="payment-accounts" element={<OwnerPaymentAccounts />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* Employee Routes (Chủ và Nhân viên đều vào được) */}
        <Route element={<ProtectedRoute allowedRoles={['Owner', 'Manager', 'Waiter', 'Cashier']} />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route path="pos" element={<EmployeePOS />} />
            <Route path="orders" element={<EmployeeOrders />} />
            <Route path="requests" element={<EmployeeOrderRequests />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<div className="p-8 text-center text-2xl font-bold text-gray-400">404 - Trang không tồn tại</div>} />
      </Routes>
    </Router>
  );
}

export default App;
