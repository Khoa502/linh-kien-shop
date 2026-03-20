import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { orderService } from "../../services/orderService";
import { khachHangService } from "../../services/khachHangService";
import { formatCurrency } from "../../utils/formatCurrency";
import { safeJsonParse } from "../../utils/safeJsonParse";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [directBuyItem, setDirectBuyItem] = useState(null);
  const [directBuyItems, setDirectBuyItems] = useState(null); // Array of items for SavedBuilds
  const [isLoadingBuyNow, setIsLoadingBuyNow] = useState(true);
  const [form, setForm] = useState({
    hoTen: user?.hoTen || user?.userName || "",
    soDienThoai: "",
    diaChi: "",
    ghiChu: "",
    phuongThucThanhToan: "TienMat",
  });

  // ============================================================
  // HÀM LẤY GIÁ SẢN PHẨM - Chuẩn hóa cho tất cả nguồn (Cart, Buy Now, BuildPC)
  // Hỗ trợ 3 field: giaBan, gia, donGia
  // ============================================================
  const getItemPrice = (item) => {
    return Number(item.giaBan) || Number(item.gia) || Number(item.donGia) || 0;
  };

  useEffect(() => {
    document.title = "Thanh toán – TechStore";
  }, []);

  // KIỂM TRA ĐĂNG NHẬP - Chuyển về login nếu chưa đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thanh toán!");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
  }, [isAuthenticated, navigate]);

  // KIỂM TRA SẢN PHẨM "MUA NGAY" từ location.state (ưu tiên) hoặc sessionStorage (backward compatibility)
  useEffect(() => {
    // Ưu tiên 1: Lấy từ location.state (khi navigate từ ProductDetail - single item)
    const directItem = location.state?.directBuyItem;
    if (
      directItem &&
      typeof directItem === "object" &&
      !Array.isArray(directItem)
    ) {
      const formattedItem = {
        ...directItem,
        _cartId: directItem.maSP || directItem.id,
        quantity: directItem.quantity || 1,
      };
      setDirectBuyItem(formattedItem);
      // Cập nhật form với thông tin user nếu có
      if (user?.hoTen) setForm((f) => ({ ...f, hoTen: user.hoTen }));
      // Xóa state sau khi đã sử dụng để tránh reuse khi refresh
      navigate(location.pathname, { replace: true });
      setIsLoadingBuyNow(false);
      return;
    }

    // Ưu tiên 2: Lấy từ directBuyItems (khi navigate từ BuildPC hoặc SavedBuilds - array)
    const buyNowItems =
      location.state?.directBuyItems || location.state?.buyNowItems;
    if (buyNowItems && Array.isArray(buyNowItems) && buyNowItems.length > 0) {
      // Map buyNowItems to match the format expected by checkout
      const formattedItems = buyNowItems.map((item) => ({
        ...item,
        _cartId: item.maSP || item.id,
        quantity: item.quantity || 1,
      }));
      // Store all items for display
      setDirectBuyItems(formattedItems);
      setDirectBuyItem(formattedItems[0]);
      // Cập nhật form với thông tin user nếu có
      if (user?.hoTen) setForm((f) => ({ ...f, hoTen: user.hoTen }));
      // Xóa state sau khi đã sử dụng để tránh reuse khi refresh
      navigate(location.pathname, { replace: true });
      setIsLoadingBuyNow(false);
      return;
    }

    // Ưu tiên 3: Fallback từ sessionStorage (backward compatibility)
    try {
      const buyNowData = sessionStorage.getItem("buyNowProduct");
      const parsed = safeJsonParse(buyNowData);

      if (parsed && typeof parsed === "object") {
        // Check if it's the new format { items: [...], total: ... } from BuildPC
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          const formattedItems = parsed.items.map((item) => ({
            ...item,
            _cartId: item.maSP || item.id,
            quantity: item.quantity || 1,
          }));
          setDirectBuyItems(formattedItems);
          setDirectBuyItem(formattedItems[0]);
          if (user?.hoTen) setForm((f) => ({ ...f, hoTen: user.hoTen }));
          setIsLoadingBuyNow(false);
          return;
        }

        // Old format: single product object
        const product = parsed;
        const buyNowItemFormatted = {
          ...product,
          _cartId: product.maSP || product.id,
          quantity: product.soLuongMua || product.quantity || 1,
        };
        setDirectBuyItem(buyNowItemFormatted);
        if (user?.hoTen) setForm((f) => ({ ...f, hoTen: user.hoTen }));
      }
    } catch (e) {
      console.error("Lỗi đọc buyNowProduct:", e);
      sessionStorage.removeItem("buyNowProduct");
    }
    setIsLoadingBuyNow(false);
  }, [user, location, navigate]);

  // Xác định items để hiển thị: ưu tiên directBuyItems ( SavedBuilds ) > directBuyItem > cart items
  // Fix: Add defensive check for items being undefined
  const displayItems =
    directBuyItems || (directBuyItem ? [directBuyItem] : items || []);
  // Sử dụng getItemPrice để đảm bảo lấy đúng giá (giaBan -> gia -> donGia)
  const displayTotal = directBuyItems
    ? directBuyItems.reduce(
        (sum, item) => sum + getItemPrice(item) * (item.quantity || 1),
        0,
      )
    : directBuyItem
      ? getItemPrice(directBuyItem) * (directBuyItem.quantity || 1)
      : total || 0;

  // Kiểm tra nếu không có sản phẩm nào để thanh toán
  useEffect(() => {
    // Chỉ kiểm tra sau khi đã xử lý xong dữ liệu "Mua ngay"
    if (isLoadingBuyNow) return;

    if (
      isAuthenticated &&
      displayItems.length === 0 &&
      !directBuyItem &&
      !directBuyItems
    ) {
      navigate("/cart");
    }
  }, [
    displayItems,
    directBuyItem,
    directBuyItems,
    isAuthenticated,
    navigate,
    isLoadingBuyNow,
  ]);

  if (!isAuthenticated || isLoadingBuyNow) {
    return (
      <div className="py-20">
        <LoadingSpinner />
      </div>
    ); // Đang chuyển hướng hoặc đang tải dữ liệu
  }

  const set = (k) => (e) => {
    if (k === "soDienThoai") {
      // Chỉ cho phép nhập số
      const value = e.target.value.replace(/\D/g, "");
      setForm({ ...form, [k]: value });
    } else {
      setForm({ ...form, [k]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hoTen || !form.soDienThoai || !form.diaChi) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }
    if (displayItems.length === 0) {
      toast.error("Không có sản phẩm để thanh toán!");
      return;
    }

    setSubmitting(true);

    try {
      // Lấy taiKhoanID từ AuthContext (đây là userId của user đăng nhập)
      const taiKhoanID = user?.userId;

      if (!taiKhoanID) {
        toast.error("Lỗi xác thực người dùng. Vui lòng đăng nhập lại!");
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      // Gọi API lấy danh sách khách hàng và tìm MaKH từ taiKhoanID
      let maKH = null;
      try {
        const khachHangRes = await khachHangService.getAll();
        const danhSachKH = khachHangRes.data;

        // Tìm khách hàng có taiKhoanID matching với user đăng nhập
        const khachHang = danhSachKH.find((kh) => kh.taiKhoanID === taiKhoanID);

        if (khachHang && khachHang.maKH) {
          maKH = khachHang.maKH;
          console.log("✅ Tìm thấy MaKH:", maKH, "từ taiKhoanID:", taiKhoanID);
        } else {
          console.error(
            "❌ Không tìm thấy khách hàng với taiKhoanID:",
            taiKhoanID,
          );
        }
      } catch (khErr) {
        console.error("❌ Lỗi khi lấy danh sách khách hàng:", khErr);
      }

      // Nếu không tìm được MaKH, báo lỗi
      if (!maKH) {
        toast.error(
          "Không tìm thấy thông tin khách hàng. Vui lòng liên hệ quản trị viên!",
        );
        return;
      }

      // Map items về đúng format của Backend
      // Theo yêu cầu: maSP, soLuong, donGia
      // Sử dụng getItemPrice để đảm bảo donGia không bị undefined hoặc 0 sai
      const chiTietDonHangs = displayItems.map((item) => {
        // Lấy maSP - ưu tiên từ item.maSP, fallback về id
        const maSPValue = item.maSP || item.id || null;

        return {
          maSP: maSPValue,
          soLuong: item.quantity || item.soLuong || 1,
          donGia: item.gia || getItemPrice(item), // Ưu tiên item.gia, fallback về getItemPrice
        };
      });

      // ============================================================
      // DEBUG: Kiểm tra cartItems có đủ thông tin maSP, soLuong, gia
      // ============================================================
      console.log("🔍 Debug cartItems (displayItems):", displayItems);
      console.log("🔍 Debug chiTietDonHangs:", chiTietDonHangs);

      // ============================================================
      // DEBUG: In ra payload trước khi gửi API
      // ============================================================
      const payload = {
        maKH: maKH,
        tenKH: form.hoTen,
        soDienThoai: form.soDienThoai,
        diaChi: form.diaChi,
        ghiChu: form.ghiChu,
        hinhThucThanhToan: form.phuongThucThanhToan,
        chiTietDonHangs: chiTietDonHangs,
        tongTien: displayTotal,
        trangThai: "ChoXacNhan", // Thêm trạng thái mặc định
      };

      console.log(
        "📤 Payload gửi API POST /HoaDon:",
        JSON.stringify(payload, null, 2),
      );

      // ============================================================
      // GỌI API TẠO ĐƠN HÀNG
      // ============================================================
      let orderId = null;

      try {
        const orderRes = await orderService.create(payload);
        console.log("✅ Response từ API tạo đơn hàng:", orderRes.data);

        orderId =
          orderRes.data?.id || orderRes.data?.maHD || orderRes.data?.data?.id;
      } catch (orderErr) {
        // XỬ LÝ LỖI 500 TỪ API TẠO ĐƠN HÀNG
        const orderStatus = orderErr.response?.status;
        const orderMsg =
          orderErr.response?.data?.message || orderErr.response?.data;

        console.error("❌ Lỗi tạo đơn hàng:", {
          status: orderStatus,
          message: orderMsg,
          error: orderErr,
        });

        if (orderStatus === 500) {
          toast.error("Lỗi hệ thống, vui lòng thử lại!");
          setSubmitting(false);
          return;
        }

        // Ném lỗi tiếp để xử lý chung
        throw orderErr;
      }

      // XỬ LÝ SAU KHI ĐẶT HÀNG THÀNH CÔNG
      // Nếu là "Mua ngay" - xóa sessionStorage
      if (directBuyItem || directBuyItems) {
        sessionStorage.removeItem("buyNowProduct");
        setDirectBuyItem(null);
        setDirectBuyItems(null);
      } else {
        // Nếu là giỏ hàng bình thường - xóa giỏ hàng
        clearCart();
      }

      toast.success("🎉 Đặt hàng thành công!");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ LỖI ĐẶT HÀNG:", err);

      // DEBUG: In ra chi tiết lỗi từ Backend để xác định vấn đề
      console.log(
        "📨 Chi tiết lỗi từ Backend (error.response.data):",
        err.response?.data,
      );

      // Xử lý lỗi 500 specifically
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data;

      if (status === 500) {
        toast.error("Lỗi hệ thống, vui lòng thử lại!");
      } else if (status >= 400) {
        toast.error(
          typeof msg === "string"
            ? msg
            : "Đặt hàng thất bại! Vui lòng thử lại.",
        );
      } else {
        toast.error("Đặt hàng thất bại! Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white mb-6">
        Thanh toán
      </h1>

      {/* Nếu là mua ngay, hiển thị thông báo */}
      {directBuyItem && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            🛒 Bạn đang thanh toán sản phẩm mua ngay.
            <button
              onClick={() => {
                sessionStorage.removeItem("buyNowProduct");
                setDirectBuyItem(null);
                setDirectBuyItems(null);
                if (items.length === 0) navigate("/cart");
              }}
              className="ml-2 underline font-semibold hover:text-blue-900 dark:hover:text-blue-100"
            >
              Hủy và quay lại giỏ hàng
            </button>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
          <div className="card">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              📍 Thông tin giao hàng
            </h2>
            <div className="space-y-3">
              {[
                {
                  k: "hoTen",
                  label: "Họ và tên *",
                  type: "text",
                  ph: "Nhập họ tên...",
                },
                {
                  k: "soDienThoai",
                  label: "Số điện thoại *",
                  type: "tel",
                  ph: "Nhập số điện thoại...",
                },
                {
                  k: "diaChi",
                  label: "Địa chỉ *",
                  type: "text",
                  ph: "Nhập địa chỉ giao hàng...",
                },
              ].map((f) => (
                <div key={f.k}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.ph}
                    value={form[f.k]}
                    onChange={set(f.k)}
                    className="input-field"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={form.ghiChu}
                  onChange={set("ghiChu")}
                  rows={3}
                  placeholder="Ghi chú cho đơn hàng (tùy chọn)..."
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="card">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
              💳 Phương thức thanh toán
            </h2>
            <div className="space-y-2">
              {[
                {
                  value: "TienMat",
                  label: "Tiền mặt khi nhận hàng",
                  icon: "💵",
                },
                {
                  value: "ChuyenKhoan",
                  label: "Chuyển khoản ngân hàng",
                  icon: "🏦",
                },
                { value: "MoMo", label: "Ví MoMo", icon: "📱" },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.phuongThucThanhToan === m.value ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-600 hover:border-blue-300"}`}
                >
                  <input
                    type="radio"
                    name="pttt"
                    value={m.value}
                    checked={form.phuongThucThanhToan === m.value}
                    onChange={() =>
                      setForm({ ...form, phuongThucThanhToan: m.value })
                    }
                    className="hidden"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.phuongThucThanhToan === m.value ? "border-blue-600" : "border-slate-300"}`}
                  >
                    {form.phuongThucThanhToan === m.value && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </span>
                  <span className="text-lg">{m.icon}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    {m.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || displayItems.length === 0}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              `🎉 Xác nhận đặt hàng (${displayItems.length} sản phẩm)`
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className="lg:col-span-2 h-fit lg:sticky lg:top-24">
          <div className="card">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
              📦 Đơn hàng ({displayItems.length})
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {displayItems.map((item, index) => (
                <div
                  key={item._cartId || item.maSP || item.id || `item-${index}`}
                  className="flex items-center gap-3"
                >
                  <img
                    src={
                      item.hinhAnh ||
                      item.anhDaiDien ||
                      `https://placehold.co/50x50/e2e8f0/94a3b8?text=SP`
                    }
                    alt={item.tenSP || item.tenSanPham}
                    className="w-12 h-12 object-contain rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-1">
                      {item.tenSanPham || item.tenSP}
                    </p>
                    <p className="text-xs text-slate-400">x{item.quantity}</p>
                  </div>
                  <p className="font-bold text-sm text-slate-800 dark:text-white">
                    {formatCurrency(getItemPrice(item) * (item.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 mt-4 pt-4 flex justify-between items-baseline">
              <span className="font-bold text-slate-800 dark:text-white">
                Tổng cộng
              </span>
              <span className="font-extrabold text-xl text-blue-600">
                {formatCurrency(displayTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
