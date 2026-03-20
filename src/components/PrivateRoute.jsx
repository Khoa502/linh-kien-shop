import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

// roles=['Admin','NhanVien'] → chỉ admin/nhanvien mới vào được
export default function PrivateRoute({ children, roles = [] }) {
  const { isAuthenticated, isAdmin, isNhanVien, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading)
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles.length > 0) {
    const allowed =
      (roles.includes("Admin") && isAdmin) ||
      (roles.includes("NhanVien") && isNhanVien);
    if (!allowed) return <Navigate to="/" replace />;
  }

  return children;
}
