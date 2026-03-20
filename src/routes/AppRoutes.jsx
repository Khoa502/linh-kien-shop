import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import PrivateRoute from "../components/PrivateRoute";
import LoadingSpinner from "../components/LoadingSpinner";

const Home = lazy(() => import("../pages/user/Home"));
const Products = lazy(() => import("../pages/user/Products"));
const ProductDetail = lazy(() => import("../pages/user/ProductDetail"));
const Cart = lazy(() => import("../pages/user/Cart"));
const Checkout = lazy(() => import("../pages/user/Checkout"));
const Login = lazy(() => import("../pages/user/Login"));
const Register = lazy(() => import("../pages/user/Register"));
const Dashboard = lazy(() => import("../pages/user/Dashboard"));
const OrderHistory = lazy(() => import("../pages/user/OrderHistory"));
const OrderTracking = lazy(() => import("../pages/user/OrderTracking"));
const BuildPC = lazy(() => import("../pages/user/BuildPC"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const ManageProducts = lazy(() => import("../pages/admin/ManageProducts"));
const ManageCategories = lazy(() => import("../pages/admin/ManageCategories"));
const ManageOrders = lazy(() => import("../pages/admin/ManageOrders"));
const ManageCustomers = lazy(() => import("../pages/admin/ManageCustomers"));
const ManagePayments = lazy(() => import("../pages/admin/ManagePayments"));
const ManageImports = lazy(() => import("../pages/admin/ManageImports"));
const LoginHistory = lazy(() => import("../pages/admin/LoginHistory"));
const TaiKhoanManagement = lazy(
  () => import("../pages/admin/TaiKhoanManagement"),
);
const BaoHanhPage = lazy(() => import("../pages/admin/BaoHanhPage"));

const Wrap = ({ children }) => (
  <Suspense
    fallback={
      <div className="py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    }
  >
    {children}
  </Suspense>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public + User routes */}
      <Route element={<UserLayout />}>
        <Route
          path="/"
          element={
            <Wrap>
              <Home />
            </Wrap>
          }
        />
        <Route
          path="/products"
          element={
            <Wrap>
              <Products />
            </Wrap>
          }
        />
        <Route
          path="/products/:id"
          element={
            <Wrap>
              <ProductDetail />
            </Wrap>
          }
        />
        <Route
          path="/build-pc"
          element={
            <Wrap>
              <BuildPC />
            </Wrap>
          }
        />
        <Route
          path="/cart"
          element={
            <Wrap>
              <Cart />
            </Wrap>
          }
        />
        <Route
          path="/login"
          element={
            <Wrap>
              <Login />
            </Wrap>
          }
        />
        <Route
          path="/register"
          element={
            <Wrap>
              <Register />
            </Wrap>
          }
        />

        {/* Cần đăng nhập */}
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Wrap>
                <Checkout />
              </Wrap>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Wrap>
                <Dashboard />
              </Wrap>
            </PrivateRoute>
          }
        />
        {/* /orders hiện OrderHistory (danh sách đơn hàng của user) */}
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Wrap>
                <OrderHistory />
              </Wrap>
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/:id/tracking"
          element={
            <PrivateRoute>
              <Wrap>
                <OrderTracking />
              </Wrap>
            </PrivateRoute>
          }
        />
      </Route>

      {/* Admin + NhanVien routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute roles={["Admin", "NhanVien"]}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route
          index
          element={
            <Wrap>
              <AdminDashboard />
            </Wrap>
          }
        />
        <Route
          path="products"
          element={
            <Wrap>
              <ManageProducts />
            </Wrap>
          }
        />
        <Route
          path="categories"
          element={
            <Wrap>
              <ManageCategories />
            </Wrap>
          }
        />
        <Route
          path="orders"
          element={
            <Wrap>
              <ManageOrders />
            </Wrap>
          }
        />
        <Route
          path="customers"
          element={
            <Wrap>
              <ManageCustomers />
            </Wrap>
          }
        />
        <Route
          path="payments"
          element={
            <Wrap>
              <ManagePayments />
            </Wrap>
          }
        />
        <Route
          path="imports"
          element={
            <Wrap>
              <ManageImports />
            </Wrap>
          }
        />
        <Route
          path="login-history"
          element={
            <Wrap>
              <LoginHistory />
            </Wrap>
          }
        />
        <Route
          path="tai-khoan"
          element={
            <Wrap>
              <TaiKhoanManagement />
            </Wrap>
          }
        />
        <Route
          path="bao-hanh"
          element={
            <Wrap>
              <BaoHanhPage />
            </Wrap>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
