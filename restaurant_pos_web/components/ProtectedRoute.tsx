import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Nếu sai quyền, trả về trang tương ứng với quyền của họ
    if (user.role === "Owner") return <Navigate to="/owner" replace />;
    return <Navigate to="/employee/orders" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;